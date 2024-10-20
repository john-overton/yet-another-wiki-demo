import { promises as fs } from 'fs';
import path from 'path';

export async function DELETE(request) {
  const { path: itemPath } = await request.json();

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

    const removeFromStructure = (items) => {
      for (let i = 0; i < items.length; i++) {
        if (items[i].path === itemPath) {
          items.splice(i, 1);
          return true;
        }
        if (items[i].children && removeFromStructure(items[i].children)) {
          return true;
        }
      }
      return false;
    };

    if (!removeFromStructure(metaData.pages)) {
      return new Response(JSON.stringify({ error: 'Item not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Write updated meta data
    await fs.writeFile(metaFilePath, JSON.stringify(metaData, null, 2));

    // Delete the MDX file
    const filePath = path.join(process.cwd(), 'app', 'docs', itemPath);
    await fs.unlink(filePath);

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
