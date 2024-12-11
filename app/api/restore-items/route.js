import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { items: itemIds, targetId } = await request.json();
    
    // Read meta.json from data/docs
    const metaFilePath = path.join(process.cwd(), 'data', 'docs', 'meta.json');
    const metaContent = await fs.readFile(metaFilePath, 'utf8');
    const metaData = JSON.parse(metaContent);

    // Function to recursively unmark deleted status
    const unmarkDeleted = (item) => {
      delete item.deleted;
      item.lastModified = new Date().toISOString();
      if (item.children) {
        item.children.forEach(child => unmarkDeleted(child));
      }
    };

    // Function to find and extract item by ID
    const extractItem = (pages, id, parentArray = null) => {
      for (let i = 0; i < pages.length; i++) {
        if (pages[i].id === id) {
          const item = pages[i];
          unmarkDeleted(item);
          return item;
        }
        if (pages[i].children) {
          const found = extractItem(pages[i].children, id, pages[i].children);
          if (found) return found;
        }
      }
      return null;
    };

    // Function to find target parent by ID
    const findParent = (pages, id) => {
      for (const page of pages) {
        if (page.id === id) {
          return page;
        }
        if (page.children) {
          const found = findParent(page.children, id);
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

    const restoredItems = [];
    // Process each item
    for (const itemId of itemIds) {
      const item = extractItem(metaData.pages, itemId);
      if (item) {
        if (targetId === 'root') {
          // Restore to root level
          item.sortOrder = getMaxSortOrder(metaData.pages) + 1;
          metaData.pages.push(item);
        } else {
          // Restore to target parent
          const parent = findParent(metaData.pages, targetId);
          if (parent) {
            if (!parent.children) {
              parent.children = [];
            }
            item.sortOrder = getMaxSortOrder(parent.children) + 1;
            parent.children.push(item);
          } else {
            console.error(`Target parent with ID ${targetId} not found for item ${itemId}`);
            continue;
          }
        }
        restoredItems.push(item);
      }
    }

    // Save updated meta.json
    await fs.writeFile(metaFilePath, JSON.stringify(metaData, null, 2));

    return NextResponse.json({
      success: true,
      restoredItems
    });
  } catch (error) {
    console.error('Error restoring items:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
