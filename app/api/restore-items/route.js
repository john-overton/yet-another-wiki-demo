import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request) {
  const { items: paths, target } = await request.json();

  if (!paths || !Array.isArray(paths)) {
    return new Response(JSON.stringify({ error: 'Invalid paths provided' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const metaFilePath = path.join(process.cwd(), 'public', 'docs', 'meta.json');
    const metaContent = await fs.readFile(metaFilePath, 'utf8');
    const metaData = JSON.parse(metaContent);

    // Function to find and remove an item from its current location
    const findAndRemoveItem = (items, targetPath) => {
      for (let i = 0; i < items.length; i++) {
        if (items[i].path === targetPath) {
          const [removedItem] = items.splice(i, 1);
          delete removedItem.deleted; // Remove the deleted flag
          return removedItem;
        }
        if (items[i].children) {
          const found = findAndRemoveItem(items[i].children, targetPath);
          if (found) return found;
        }
      }
      return null;
    };

    // Function to find a target parent
    const findParent = (items, targetPath) => {
      for (const item of items) {
        if (item.path === targetPath) {
          if (!item.children) {
            item.children = [];
          }
          return item;
        }
        if (item.children) {
          const found = findParent(item.children, targetPath);
          if (found) return found;
        }
      }
      return null;
    };

    // Process each path
    for (const itemPath of paths) {
      const item = findAndRemoveItem(metaData.pages, itemPath);
      if (item) {
        if (target === 'root') {
          // Add to root level
          metaData.pages.push(item);
        } else {
          // Add to target parent
          const parent = findParent(metaData.pages, target);
          if (parent) {
            parent.children.push(item);
          } else {
            console.error(`Parent not found for target: ${target}`);
            // Add to root if parent not found
            metaData.pages.push(item);
          }
        }
      }
    }

    // Write updated meta data
    await fs.writeFile(metaFilePath, JSON.stringify(metaData, null, 2));

    return new Response(JSON.stringify({ message: 'Items restored successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error restoring items:', error);
    return new Response(JSON.stringify({ error: 'Failed to restore items' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
