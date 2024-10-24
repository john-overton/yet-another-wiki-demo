import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const { sourcePath, targetPath, moveToRoot } = await request.json();
    const metaFilePath = path.join(process.cwd(), 'app', 'docs', 'meta.json');
    const metaContent = await fs.readFile(metaFilePath, 'utf8');
    const metaData = JSON.parse(metaContent);

    // Helper function to find and remove an item from the tree
    const findAndRemoveItem = (items, path) => {
      for (let i = 0; i < items.length; i++) {
        if (items[i].path === path) {
          const [removedItem] = items.splice(i, 1);
          return removedItem;
        }
        if (items[i].children) {
          const found = findAndRemoveItem(items[i].children, path);
          if (found) return found;
        }
      }
      return null;
    };

    // Helper function to find a parent item
    const findParentItem = (items, path) => {
      for (const item of items) {
        if (item.path === path) {
          return item;
        }
        if (item.children) {
          const found = findParentItem(item.children, path);
          if (found) return found;
        }
      }
      return null;
    };

    // Find and remove the source item
    const sourceItem = findAndRemoveItem(metaData.pages, sourcePath);
    if (!sourceItem) {
      return new Response(JSON.stringify({ error: 'Source item not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (moveToRoot) {
      // Add the item to the root level
      metaData.pages.push(sourceItem);
    } else {
      // Find the target parent and add the source item to its children
      const targetItem = findParentItem(metaData.pages, targetPath);
      if (!targetItem) {
        return new Response(JSON.stringify({ error: 'Target item not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Initialize children array if it doesn't exist
      if (!targetItem.children) {
        targetItem.children = [];
      }

      // Add the source item to the target's children
      targetItem.children.push(sourceItem);
    }

    // Save the updated meta.json
    await fs.writeFile(metaFilePath, JSON.stringify(metaData, null, 2));

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error reordering items:', error);
    return new Response(JSON.stringify({ error: 'Failed to reorder items' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
