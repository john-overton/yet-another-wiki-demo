import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    const { path: filePath, newSortOrder, swapPath, swapSortOrder, parentPath } = await request.json();

    // Read the current meta.json from public/docs
    const metaPath = path.join(process.cwd(), 'public', 'docs', 'meta.json');
    const metaContent = await fs.readFile(metaPath, 'utf8');
    const meta = JSON.parse(metaContent);

    // Function to update sort orders in a list of items
    const updateSortOrders = (items, targetPath, newOrder, swapTargetPath, swapOrder, parentTargetPath = null) => {
      // If we have a parent path, we need to find that parent first
      if (parentTargetPath) {
        const findAndUpdateInParent = (parentItems) => {
          for (const item of parentItems) {
            if (item.path === parentTargetPath && item.children) {
              // Found the parent, update its children
              const targetIndex = item.children.findIndex(child => child.path === targetPath);
              const swapIndex = item.children.findIndex(child => child.path === swapTargetPath);
              
              if (targetIndex !== -1 && swapIndex !== -1) {
                item.children[targetIndex].sortOrder = newOrder;
                item.children[swapIndex].sortOrder = swapOrder;
                return true;
              }
            }
            
            // Recursively search in children
            if (item.children) {
              const found = findAndUpdateInParent(item.children);
              if (found) return true;
            }
          }
          return false;
        };

        return findAndUpdateInParent(items);
      }

      // If no parent path, update at root level
      let foundTarget = false;
      let foundSwap = false;

      const searchAndUpdate = (itemList) => {
        for (const item of itemList) {
          if (item.path === targetPath) {
            item.sortOrder = newOrder;
            foundTarget = true;
          } else if (item.path === swapTargetPath) {
            item.sortOrder = swapOrder;
            foundSwap = true;
          }

          if (item.children) {
            searchAndUpdate(item.children);
          }
        }
      };

      searchAndUpdate(items);
      return foundTarget && foundSwap;
    };

    // Update the sort orders
    updateSortOrders(meta.pages, filePath, newSortOrder, swapPath, swapSortOrder, parentPath);

    // Write back to meta.json in public/docs
    await fs.writeFile(metaPath, JSON.stringify(meta, null, 2), 'utf8');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating sort order:', error);
    return NextResponse.json(
      { error: 'Failed to update sort order' },
      { status: 500 }
    );
  }
}
