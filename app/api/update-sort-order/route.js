import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    const { path: filePath, newSortOrder } = await request.json();

    // Read the current meta.json from public/docs
    const metaPath = path.join(process.cwd(), 'public', 'docs', 'meta.json');
    const metaContent = await fs.readFile(metaPath, 'utf8');
    const meta = JSON.parse(metaContent);

    // Function to update sort orders in a list of items
    const updateSortOrders = (items, targetPath, newOrder) => {
      const itemIndex = items.findIndex(item => item.path === targetPath);
      if (itemIndex === -1) {
        // Search in children
        for (const item of items) {
          if (item.children) {
            const updated = updateSortOrders(item.children, targetPath, newOrder);
            if (updated) return true;
          }
        }
        return false;
      }

      // Get current sort order
      const currentOrder = items[itemIndex].sortOrder || 0;

      // Update sort orders
      items.forEach(item => {
        if (item.path === targetPath) {
          item.sortOrder = newOrder;
        } else if (item.sortOrder === newOrder) {
          item.sortOrder = currentOrder;
        }
      });

      return true;
    };

    // Update the sort orders
    updateSortOrders(meta.pages, filePath, newSortOrder);

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
