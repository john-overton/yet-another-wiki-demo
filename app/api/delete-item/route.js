import { promises as fs } from 'fs';
import path from 'path';

export async function DELETE(request) {
  const { path: itemPath, type } = await request.json();

  if (!itemPath || !type) {
    return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const metaFilePath = path.join(process.cwd(), 'app', 'docs', 'meta.json');
    const metaContent = await fs.readFile(metaFilePath, 'utf8');
    const metaData = JSON.parse(metaContent);

    // Remove the item from the meta structure
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

    removeFromStructure(metaData.pages);

    // Write updated meta data
    await fs.writeFile(metaFilePath, JSON.stringify(metaData, null, 2));

    // If it's a file, delete the MDX file
    if (type === 'file') {
      const filePath = path.join(process.cwd(), 'app', 'docs', itemPath);
      await fs.unlink(filePath);
    } else if (type === 'folder') {
      // If it's a folder, recursively delete all files and subfolders
      const folderPath = path.join(process.cwd(), 'app', 'docs', itemPath);
      await fs.rm(folderPath, { recursive: true, force: true });
    }

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
