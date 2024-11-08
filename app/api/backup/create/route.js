import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import archiver from 'archiver';
import { createWriteStream, createReadStream } from 'fs';
import { mkdir, readdir, stat, readFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { v4 as uuidv4 } from 'uuid';

// Helper to recursively add directory to zip
async function addDirectoryToZip(zip, dirPath, zipPath = '') {
  const files = await readdir(dirPath);
  
  for (const file of files) {
    const fullPath = join(dirPath, file);
    const stats = await stat(fullPath);
    
    // Skip .gitignore files
    if (file === '.gitignore') continue;

    if (stats.isDirectory()) {
      await addDirectoryToZip(zip, fullPath, join(zipPath, file));
    } else {
      zip.append(createReadStream(fullPath), { name: join(zipPath, file) });
    }
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

    // Add directories to the zip
    const rootDir = process.cwd();
    const dirsToBackup = ['data', 'db', 'public', 'config'];

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
  }
}
