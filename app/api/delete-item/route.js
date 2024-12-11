import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { id, permanent = false } = await request.json();
    
    // Read meta.json from data/docs
    const metaFilePath = path.join(process.cwd(), 'data', 'docs', 'meta.json');
    const metaContent = await fs.readFile(metaFilePath, 'utf8');
    const metaData = JSON.parse(metaContent);

    // Function to recursively mark items as deleted
    const markAsDeleted = (item) => {
      item.deleted = true;
      item.lastModified = new Date().toISOString();
      if (item.children) {
        item.children.forEach(child => markAsDeleted(child));
      }
    };

    // Function to recursively delete files
    const deleteFile = async (item) => {
      try {
        const filePath = path.join(process.cwd(), 'data', 'docs', item.path);
        try {
          await fs.unlink(filePath);
        } catch (error) {
          // Ignore file not found errors
          if (error.code !== 'ENOENT') {
            throw error;
          }
        }
        // Recursively delete children's files
        if (item.children) {
          for (const child of item.children) {
            await deleteFile(child);
          }
        }
      } catch (error) {
        if (error.code !== 'ENOENT') {
          console.error(`Error deleting file ${item.path}:`, error);
        }
      }
    };

    // Function to find item by ID
    const findItem = (items, targetId) => {
      for (const item of items) {
        if (item.id === targetId) {
          return item;
        }
        if (item.children) {
          const found = findItem(item.children, targetId);
          if (found) return found;
        }
      }
      return null;
    };

    // Function to remove item from parent's children array
    const removeFromParent = (items, targetId) => {
      for (let i = 0; i < items.length; i++) {
        if (items[i].id === targetId) {
          return items.splice(i, 1)[0];
        }
        if (items[i].children) {
          const result = removeFromParent(items[i].children, targetId);
          if (result) return result;
        }
      }
      return null;
    };

    // Find the item first
    const item = findItem(metaData.pages, id);
    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    if (permanent) {
      // For permanent deletion, remove the item and delete files
      const removedItem = removeFromParent(metaData.pages, id);
      if (removedItem) {
        // Try to delete the file, but don't fail if it doesn't exist
        await deleteFile(removedItem);
        // Also delete all children's files
        if (removedItem.children) {
          for (const child of removedItem.children) {
            await deleteFile(child);
          }
        }
      }
    } else {
      // For soft deletion, just mark as deleted
      markAsDeleted(item);
    }

    // Save updated meta.json
    await fs.writeFile(metaFilePath, JSON.stringify(metaData, null, 2));

    return NextResponse.json({
      success: true,
      item: item,
      permanent
    });
  } catch (error) {
    console.error('Error deleting item:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// Alias DELETE to POST since Next.js 13 has issues with DELETE request bodies
export const DELETE = POST;
