import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    const { path: itemPath, newSortOrder, swapPath, swapSortOrder, parentPath } = await request.json();

    console.log('Received request:', {
      itemPath,
      newSortOrder,
      swapPath,
      swapSortOrder,
      parentPath
    });

    // Read the current meta.json from data/docs
    const metaPath = path.join(process.cwd(), 'data', 'docs', 'meta.json');
    const metaContent = await fs.readFile(metaPath, 'utf8');
    const meta = JSON.parse(metaContent);

    const updateSortOrders = (items) => {
      // For root level items
      if (!parentPath) {
        const targetItem = items.find(item => item.path === itemPath);
        const swapItem = items.find(item => item.path === swapPath);
        
        if (targetItem && swapItem) {
          targetItem.sortOrder = newSortOrder;
          swapItem.sortOrder = swapSortOrder;
          return true;
        }
        return false;
      }

      // For nested items
      const findAndUpdate = (items) => {
        for (const item of items) {
          // If this is the parent, update its children
          if (item.path === parentPath) {
            if (!item.children) {
              item.children = [];
              return false;
            }

            const targetChild = item.children.find(child => child.path === itemPath);
            const swapChild = item.children.find(child => child.path === swapPath);

            if (targetChild && swapChild) {
              targetChild.sortOrder = newSortOrder;
              swapChild.sortOrder = swapSortOrder;
              return true;
            }
            return false;
          }

          // If not found, check children
          if (item.children && item.children.length > 0) {
            const found = findAndUpdate(item.children);
            if (found) return true;
          }
        }
        return false;
      };

      return findAndUpdate(items);
    };

    // Update the sort orders
    const updated = updateSortOrders(meta.pages);

    if (!updated) {
      console.error('Failed to find items to update:', {
        itemPath,
        swapPath,
        parentPath,
        newSortOrder,
        swapSortOrder,
        metaContent: JSON.stringify(meta, null, 2)
      });
      return NextResponse.json(
        { error: 'Failed to find items to update' },
        { status: 400 }
      );
    }

    // Write back to meta.json
    await fs.writeFile(metaPath, JSON.stringify(meta, null, 2), 'utf8');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating sort order:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update sort order' },
      { status: 500 }
    );
  }
}
