import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request) {
  const { oldPath, newName, type } = await request.json();

  if (!oldPath || !newName || !type) {
    return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const metaFilePath = path.join(process.cwd(), 'app', 'docs', 'meta.json');
    const metaContent = await fs.readFile(metaFilePath, 'utf8');
    const metaData = JSON.parse(metaContent);

    // Update the item in the meta structure
    const updateInStructure = (items) => {
      for (let item of items) {
        if (item.path === oldPath) {
          const oldName = path.basename(item.path);
          item.title = newName;
          item.slug = newName.toLowerCase().replace(/\s+/g, '-');
          item.path = item.path.replace(oldName, newName);
          item.lastModified = new Date().toISOString();
          return true;
        }
        if (item.children && updateInStructure(item.children)) {
          return true;
        }
      }
      return false;
    };

    updateInStructure(metaData.pages);

    // Write updated meta data
    await fs.writeFile(metaFilePath, JSON.stringify(metaData, null, 2));

    // Rename the actual file or folder
    const oldFullPath = path.join(process.cwd(), 'app', 'docs', oldPath);
    const newFullPath = path.join(path.dirname(oldFullPath), newName);
    await fs.rename(oldFullPath, newFullPath);

    return new Response(JSON.stringify({ message: 'Item renamed successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error renaming item:', error);
    return new Response(JSON.stringify({ error: 'Failed to rename item' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
