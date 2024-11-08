import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import archiver from 'archiver';
import { createWriteStream, createReadStream } from 'fs';
import { mkdir, readdir, stat, readFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to recursively add directory to zip
async function addDirectoryToZip(zip, dirPath, zipPath = '') {
  const files = await readdir(dirPath);
  
  for (const file of files) {
    const fullPath = join(dirPath, file);
    const stats = await stat(fullPath);
    
    // Skip .gitignore files
    if (file === '.gitignore') continue;
    // Skip database file as we'll export it using Prisma
    if (file === 'wiki.db') continue;

    if (stats.isDirectory()) {
      await addDirectoryToZip(zip, fullPath, join(zipPath, file));
    } else {
      zip.append(createReadStream(fullPath), { name: join(zipPath, file) });
    }
  }
}

// Helper to export database using Prisma
async function exportDatabase() {
  try {
    // Export all data using Prisma
    const users = await prisma.user.findMany({
      include: {
        secret_question_1: true,
        secret_question_2: true,
        secret_question_3: true
      }
    });
    const secretQuestions = await prisma.secretQuestion.findMany();

    // Create database backup object
    const databaseBackup = {
      schema: 'prisma/schema.prisma', // Reference to schema file
      data: {
        users,
        secretQuestions
      }
    };

    return JSON.stringify(databaseBackup, null, 2);
  } catch (error) {
    console.error('Error exporting database:', error);
    throw new Error('Failed to export database');
  }
}

export async function POST(req) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    console.log('Session:', session); // Debug log
    
    if (!session?.user) {
      console.log('No session found'); // Debug log
      return new NextResponse(JSON.stringify({ error: 'Unauthorized - No session' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (session.user.role !== 'Admin') {
      console.log('User role:', session.user.role); // Debug log
      return new NextResponse(JSON.stringify({ error: 'Unauthorized - Not admin' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create temp directory for zip file
    const tempDir = join(tmpdir(), 'yaw-backups');
    await mkdir(tempDir, { recursive: true });
    
    const zipFileName = `backup-${new Date().toISOString().slice(0, 10)}-${uuidv4()}.zip`;
    const zipPath = join(tempDir, zipFileName);
    
    // Create write stream and archiver
    const output = createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    // Pipe archive data to the file
    archive.pipe(output);

    // Export database and add to zip
    const databaseBackup = await exportDatabase();
    archive.append(databaseBackup, { name: 'db/database_backup.json' });

    // Add schema file to backup
    const schemaPath = join(process.cwd(), 'prisma/schema.prisma');
    try {
      await stat(schemaPath);
      archive.append(createReadStream(schemaPath), { name: 'prisma/schema.prisma' });
    } catch (error) {
      console.warn('schema.prisma file not found, skipping...');
    }

    // Add .env file to backup
    const rootDir = process.cwd();
    const envPath = join(rootDir, '.env');
    try {
      await stat(envPath);
      archive.append(createReadStream(envPath), { name: '.env' });
    } catch (error) {
      console.warn('.env file not found, skipping...');
    }

    // Add directories to the zip
    const dirsToBackup = ['data', 'public', 'config'];

    for (const dir of dirsToBackup) {
      const dirPath = join(rootDir, dir);
      try {
        await stat(dirPath);
        await addDirectoryToZip(archive, dirPath, dir);
      } catch (error) {
        console.warn(`Directory ${dir} not found, skipping...`);
      }
    }

    // Finalize the archive
    await archive.finalize();

    // Wait for the output stream to finish
    await new Promise((resolve, reject) => {
      output.on('close', resolve);
      output.on('error', reject);
    });

    // Read the zip file
    const zipBuffer = await readFile(zipPath);

    // Return the zip file as a download
    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${zipFileName}"`,
      },
    });
  } catch (error) {
    console.error('Error creating backup:', error);
    return new NextResponse(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  } finally {
    await prisma.$disconnect();
  }
}
