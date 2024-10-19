import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

async function deleteItem(req) {
  try {
    const { path: itemPath, type: itemType } = await req.json();
    const fullPath = path.join(process.cwd(), 'app/docs', itemPath);

    if (itemType === 'file') {
      await fs.unlink(fullPath);
    } else if (itemType === 'folder') {
      await fs.rm(fullPath, { recursive: true, force: true });
    } else {
      return NextResponse.json({ error: 'Invalid item type' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}

export async function POST(req) {
  return deleteItem(req);
}

export async function DELETE(req) {
  return deleteItem(req);
}
