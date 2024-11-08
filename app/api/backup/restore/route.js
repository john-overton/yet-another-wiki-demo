import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { mkdir, rm, writeFile, readFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { v4 as uuidv4 } from 'uuid';
import AdmZip from 'adm-zip';

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

    // Get the uploaded file
    const formData = await req.formData();
    const file = formData.get('backup');
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
    const requiredDirs = ['data', 'db', 'config'];
    const hasRequiredDirs = requiredDirs.every(dir => 
      zipEntries.some(entry => entry.entryName.startsWith(`${dir}/`))
    );

    if (!hasRequiredDirs) {
      await rm(tempDir, { recursive: true, force: true });
      return new NextResponse(JSON.stringify({ error: 'Invalid backup file structure' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get root directory
    const rootDir = process.cwd();

    // Remove existing directories (except .gitignore files)
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

    // Extract files
    zip.extractAllTo(rootDir, true);

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
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
