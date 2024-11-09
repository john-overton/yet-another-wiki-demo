import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { mkdir, rm, writeFile, readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { tmpdir } from 'os';
import { v4 as uuidv4 } from 'uuid';
import AdmZip from 'adm-zip';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to import database using Prisma
async function importDatabase(backupData) {
  try {
    // Parse the backup data
    const backup = JSON.parse(backupData);

    // Clear existing data
    await prisma.user.deleteMany();
    await prisma.secretQuestion.deleteMany();

    // Restore secret questions first
    for (const question of backup.data.secretQuestions) {
      await prisma.secretQuestion.create({
        data: {
          id: question.id,
          question: question.question
        }
      });
    }

    // Restore users
    for (const user of backup.data.users) {
      // Extract the relations to handle them separately
      const { secret_question_1, secret_question_2, secret_question_3, ...userData } = user;
      
      await prisma.user.create({
        data: userData
      });
    }

    return true;
  } catch (error) {
    console.error('Error importing database:', error);
    throw new Error('Failed to import database');
  }
}

// Helper to ensure directory exists
async function ensureDir(dir) {
  try {
    await mkdir(dir, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
}

// Helper to extract file maintaining directory structure
async function extractFile(zip, entry, rootDir) {
  if (entry.isDirectory) {
    const dirPath = join(rootDir, entry.entryName);
    await ensureDir(dirPath);
    return;
  }

  const filePath = join(rootDir, entry.entryName);
  const fileDir = dirname(filePath);
  
  // Ensure the directory exists
  await ensureDir(fileDir);
  
  // Extract the file using extractEntryTo with maintainEntryPath
  zip.extractEntryTo(entry, rootDir, true, true);
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    // Get the uploaded file and check if this is a setup import
    const formData = await req.formData();
    const file = formData.get('backup');
    const isSetup = formData.get('isSetup') === 'true';

    // If not in setup mode, check authentication and admin role
    if (!isSetup) {
      const session = await getServerSession(authOptions);
      
      if (!session?.user) {
        return new NextResponse(JSON.stringify({ error: 'Unauthorized - No session' }), { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      if (session.user.role !== 'Admin') {
        return new NextResponse(JSON.stringify({ error: 'Unauthorized - Not admin' }), { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Check for file
    if (!file) {
      return new NextResponse(JSON.stringify({ error: 'No file provided' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create temp directory for processing
    const tempDir = join(tmpdir(), `yaw-restore-${uuidv4()}`);
    await mkdir(tempDir, { recursive: true });

    // Save uploaded file
    const buffer = Buffer.from(await file.arrayBuffer());
    const zipPath = join(tempDir, 'backup.zip');
    await writeFile(zipPath, buffer);

    // Extract and validate zip contents
    const zip = new AdmZip(zipPath);
    const zipEntries = zip.getEntries();

    // Validate zip structure
    const requiredDirs = ['data', 'config'];
    const hasRequiredDirs = requiredDirs.every(dir => 
      zipEntries.some(entry => entry.entryName.startsWith(`${dir}/`))
    );

    // Check for database backup and schema
    const hasDatabaseBackup = zipEntries.some(entry => entry.entryName === 'db/database_backup.json');
    const hasSchema = zipEntries.some(entry => entry.entryName === 'prisma/schema.prisma');

    if (!hasRequiredDirs || !hasDatabaseBackup || !hasSchema) {
      await rm(tempDir, { recursive: true, force: true });
      return new NextResponse(JSON.stringify({ error: 'Invalid backup file structure' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get root directory
    const rootDir = process.cwd();

    // Extract and import database backup
    const dbBackupEntry = zipEntries.find(entry => entry.entryName === 'db/database_backup.json');
    const dbBackupContent = zip.readAsText(dbBackupEntry);
    await importDatabase(dbBackupContent);

    // Handle .env file if present
    const envEntry = zipEntries.find(entry => entry.entryName === '.env');
    if (envEntry) {
      await extractFile(zip, envEntry, rootDir);
    }

    // Remove existing directories (except .gitignore files and db directory)
    for (const dir of requiredDirs) {
      try {
        const dirPath = join(rootDir, dir);
        // Read .gitignore content if it exists
        let gitignoreContent = null;
        try {
          const gitignorePath = join(dirPath, '.gitignore');
          gitignoreContent = await readFile(gitignorePath, 'utf8');
        } catch (error) {
          // Ignore error if .gitignore doesn't exist
        }

        await rm(dirPath, { recursive: true, force: true });
        await mkdir(dirPath, { recursive: true });

        // Restore .gitignore if it existed
        if (gitignoreContent) {
          await writeFile(join(dirPath, '.gitignore'), gitignoreContent);
        }
      } catch (error) {
        console.error(`Error clearing directory ${dir}:`, error);
      }
    }

    // Extract remaining files (excluding db/database_backup.json and already handled files)
    // Sort entries by path depth to ensure parent directories are created first
    const remainingEntries = zipEntries
      .filter(entry => !entry.entryName.startsWith('db/') && entry.entryName !== '.env')
      .sort((a, b) => {
        const depthA = a.entryName.split('/').length;
        const depthB = b.entryName.split('/').length;
        return depthA - depthB;
      });

    // Extract files maintaining directory structure
    for (const entry of remainingEntries) {
      await extractFile(zip, entry, rootDir);
    }

    // Clean up temp directory
    await rm(tempDir, { recursive: true, force: true });

    return new NextResponse(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error restoring backup:', error);
    return new NextResponse(JSON.stringify({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  } finally {
    await prisma.$disconnect();
  }
}
