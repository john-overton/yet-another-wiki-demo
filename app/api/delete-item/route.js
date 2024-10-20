import { promises as fs } from 'fs';
import path from 'path';

export async function DELETE(request) {
  const { path: itemPath, deleteChildren } = await request.json();

  if (!itemPath) {
    return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const metaFilePath = path.join(process.cwd(), 'app', 'docs', 'meta.json');
    const metaContent = await fs.readFile(metaFilePath, 'utf8');
    const metaData = JSON.parse(metaContent);

    const markAsDeleted = (items, targetPath) => {
      for (let i = 0; i < items.length; i++) {
        if (items[i].path === targetPath) {
          items[i].deleted = true;
          if (deleteChildren && items[i].children) {
            items[i].children.forEach(child => markAsDeleted(items, child.path));
          }
          return true;
        }
        if (items[i].children && markAsDeleted(items[i].children, targetPath)) {
          return true;
        }
      }
      return false;
    };

    if (!markAsDeleted(metaData.pages, itemPath)) {
      return new Response(JSON.stringify({ error: 'Item not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Write updated meta data
    await fs.writeFile(metaFilePath, JSON.stringify(metaData, null, 2));

    return new Response(JSON.stringify({ message: 'Item marked as deleted successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error marking item as deleted:', error);
    return new Response(JSON.stringify({ error: 'Failed to mark item as deleted' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
