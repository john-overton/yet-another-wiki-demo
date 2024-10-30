import { promises as fs } from 'fs';
import path from 'path';

export async function DELETE(request) {
  const { path: itemPath, deleteChildren } = await request.json();

  try {
    const metaFilePath = path.join(process.cwd(), 'public', 'docs', 'meta.json');
    const metaContent = await fs.readFile(metaFilePath, 'utf8');
    const metaData = JSON.parse(metaContent);

    const markDeleted = (items, targetPath) => {
      for (let i = 0; i < items.length; i++) {
        if (items[i].path === targetPath) {
          items[i].deleted = true;
          if (deleteChildren && items[i].children) {
            items[i].children.forEach(child => markDeleted(items, child.path));
          }
          return true;
        }
        if (items[i].children && markDeleted(items[i].children, targetPath)) {
          return true;
        }
      }
      return false;
    };

    if (!markDeleted(metaData.pages, itemPath)) {
      return new Response(JSON.stringify({ error: 'Item not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Write updated meta data to public/docs
    await fs.writeFile(metaFilePath, JSON.stringify(metaData, null, 2));

    return new Response(JSON.stringify({ message: 'Item deleted successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error deleting item:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete item' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
