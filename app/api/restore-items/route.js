import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request) {
  const { items, target } = await request.json();

  if (!items || !Array.isArray(items) || items.length === 0) {
    return new Response(JSON.stringify({ error: 'Invalid items to restore' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const metaFilePath = path.join(process.cwd(), 'app', 'docs', 'meta.json');
    const metaContent = await fs.readFile(metaFilePath, 'utf8');
    const metaData = JSON.parse(metaContent);

    const restoreItem = (items, itemPath) => {
      for (let i = 0; i < items.length; i++) {
        if (items[i].path === itemPath) {
          delete items[i].deleted;
          return true;
        }
        if (items[i].children && restoreItem(items[i].children, itemPath)) {
          return true;
        }
      }
      return false;
    };

    const moveItem = (items, itemPath, targetPath) => {
      let itemToMove;
      const removeItem = (items) => {
        for (let i = 0; i < items.length; i++) {
          if (items[i].path === itemPath) {
            itemToMove = items.splice(i, 1)[0];
            return true;
          }
          if (items[i].children && removeItem(items[i].children)) {
            return true;
          }
        }
        return false;
      };

      removeItem(items);

      if (!itemToMove) return false;

      const addItem = (items) => {
        for (let i = 0; i < items.length; i++) {
          if (items[i].path === targetPath) {
            if (!items[i].children) items[i].children = [];
            items[i].children.push(itemToMove);
            return true;
          }
          if (items[i].children && addItem(items[i].children)) {
            return true;
          }
        }
        return false;
      };

      return target === 'root' ? items.push(itemToMove) : addItem(items);
    };

    items.forEach(itemPath => {
      restoreItem(metaData.pages, itemPath);
      if (target !== 'root') {
        moveItem(metaData.pages, itemPath, target);
      }
    });

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
