import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    const { id, newSortOrder, swapId, swapSortOrder, parentId } = await request.json();

    // Read the current meta.json from data/docs
    const metaPath = path.join(process.cwd(), 'data', 'docs', 'meta.json');
    const metaContent = await fs.readFile(metaPath, 'utf8');
    const meta = JSON.parse(metaContent);

    // Function to update sort orders in a list of items
    const updateSortOrders = (items, targetId, newOrder, swapTargetId, swapOrder, parentTargetId = null) => {
      // If we have a parent ID, we need to find that parent first
      if (parentTargetId) {
        const findAndUpdateInParent = (parentItems) => {
          for (const item of parentItems) {
            if (item.id === parentTargetId && item.children) {
              // Found the parent, update its children
              const targetIndex = item.children.findIndex(child => child.id === targetId);
              const swapIndex = item.children.findIndex(child => child.id === swapTargetId);
              
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

      // If no parent ID, update at root level
      let foundTarget = false;
      let foundSwap = false;

      const searchAndUpdate = (itemList) => {
        for (const item of itemList) {
          if (item.id === targetId) {
            item.sortOrder = newOrder;
            foundTarget = true;
          } else if (item.id === swapTargetId) {
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
    updateSortOrders(meta.pages, id, newSortOrder, swapId, swapSortOrder, parentId);

    // Write back to meta.json
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
