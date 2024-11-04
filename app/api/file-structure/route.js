import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const metaFilePath = path.join(process.cwd(), 'data', 'docs', 'meta.json');

    // Ensure the docs directory exists
    const docsDir = path.join(process.cwd(), 'data', 'docs');
    try {
      await fs.access(docsDir);
    } catch {
      await fs.mkdir(docsDir, { recursive: true });
    }

    let metaData;
    try {
      const metaContent = await fs.readFile(metaFilePath, 'utf8');
      metaData = JSON.parse(metaContent);

      // Function to recursively filter out deleted items
      const filterDeletedItems = (items) => {
        return items
          .filter(item => !item.deleted)
          .map(item => ({
            ...item,
            children: item.children ? filterDeletedItems(item.children) : []
          }));
      };

      // Filter out deleted items before returning
      metaData = {
        ...metaData,
        pages: filterDeletedItems(metaData.pages)
      };
    } catch (error) {
      // If meta.json doesn't exist or is invalid, create a new one
      metaData = { pages: [], lastId: 0 };
      await fs.writeFile(metaFilePath, JSON.stringify(metaData, null, 2));
    }

    return NextResponse.json(metaData);
  } catch (error) {
    console.error('Error reading file structure:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { sourceId, targetId, moveToRoot } = await request.json();
    const metaFilePath = path.join(process.cwd(), 'data', 'docs', 'meta.json');
    const metaContent = await fs.readFile(metaFilePath, 'utf8');
    const metaData = JSON.parse(metaContent);

    // Function to find and remove an item by ID
    const findAndRemoveItem = (pages, id) => {
      for (let i = 0; i < pages.length; i++) {
        if (pages[i].id === id) {
          return pages.splice(i, 1)[0];
        }
        if (pages[i].children) {
          const found = findAndRemoveItem(pages[i].children, id);
          if (found) return found;
        }
      }
      return null;
    };

    // Function to find a parent item by ID
    const findParent = (pages, id) => {
      for (const item of pages) {
        if (item.id === id) {
          return item;
        }
        if (item.children) {
          const found = findParent(item.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    // Function to get max sort order
    const getMaxSortOrder = (items) => {
      return items.reduce((max, item) => {
        return Math.max(max, item.sortOrder || 0);
      }, 0);
    };

    // Remove the item from its current location
    const item = findAndRemoveItem(metaData.pages, sourceId);
    if (!item) {
      throw new Error('Source item not found');
    }

    // If moving to root, add to pages array
    if (moveToRoot) {
      item.sortOrder = getMaxSortOrder(metaData.pages) + 1;
      metaData.pages.push(item);
    } else {
      // Find the target parent and add the item to its children
      const parent = findParent(metaData.pages, targetId);
      if (!parent) {
        throw new Error('Target parent not found');
      }
      if (!parent.children) {
        parent.children = [];
      }
      item.sortOrder = getMaxSortOrder(parent.children) + 1;
      parent.children.push(item);
    }

    // Save the updated meta.json
    await fs.writeFile(metaFilePath, JSON.stringify(metaData, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating file structure:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
