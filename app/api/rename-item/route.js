import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

async function copyFile(src, dest) {
  await fs.copyFile(src, dest);
}

async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  let entries = await fs.readdir(src, { withFileTypes: true });

  for (let entry of entries) {
    let srcPath = path.join(src, entry.name);
    let destPath = path.join(dest, entry.name);

    entry.isDirectory() ?
      await copyDir(srcPath, destPath) :
      await fs.copyFile(srcPath, destPath);
  }
}

async function remove(path) {
  let stats = await fs.stat(path);
  if (stats.isDirectory()) {
    await fs.rm(path, { recursive: true, force: true });
  } else {
    await fs.unlink(path);
  }
}

export async function POST(request) {
  try {
    const { oldPath, newName, type } = await request.json();

    // Construct the full paths
    const basePath = process.env.DOCS_PATH || path.join(process.cwd(), 'app', 'docs');
    const oldFullPath = path.join(basePath, oldPath);
    const newFullPath = path.join(path.dirname(oldFullPath), newName);

    // Check if the new path already exists
    try {
      await fs.access(newFullPath);
      return NextResponse.json({ success: false, message: 'A file or folder with this name already exists' }, { status: 400 });
    } catch (error) {
      // If access fails, it means the path doesn't exist, which is what we want
    }

    // Copy the file or folder
    try {
      if (type === 'file') {
        await copyFile(oldFullPath, newFullPath);
      } else {
        await copyDir(oldFullPath, newFullPath);
      }
    } catch (error) {
      return NextResponse.json({ success: false, message: `Failed to copy ${type}: ${error.message}` }, { status: 500 });
    }

    // Delete the old file or folder
    try {
      await remove(oldFullPath);
    } catch (error) {
      // If we can't delete the old file/folder, we should still consider the operation a success
      console.warn(`Couldn't delete old ${type}: ${error.message}`);
    }

    return NextResponse.json({ success: true, message: 'Item renamed successfully', requiresRefresh: true });
  } catch (error) {
    console.error('Error renaming item:', error);
    return NextResponse.json({ success: false, message: `Failed to rename item: ${error.message}` }, { status: 500 });
  }
}
