import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request) {
  const { oldPath, newName } = await request.json();

  if (!oldPath || !newName) {
    return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const metaFilePath = path.join(process.cwd(), 'app', 'docs', 'meta.json');
    const metaContent = await fs.readFile(metaFilePath, 'utf8');
    const metaData = JSON.parse(metaContent);

    const updateInStructure = (items) => {
      for (let item of items) {
        if (item.path === oldPath) {
          const oldName = path.basename(item.path);
          const newSlug = newName.toLowerCase().replace(/\s+/g, '-').replace(/\.mdx$/, '');
          item.title = newName;
          item.slug = newSlug;
          item.path = item.path.replace(oldName, `${newSlug}.mdx`);
          item.lastModified = new Date().toISOString();
          return item;
        }
        if (item.children) {
          const result = updateInStructure(item.children);
          if (result) return result;
        }
      }
      return null;
    };

    const updatedItem = updateInStructure(metaData.pages);
    if (!updatedItem) {
      return new Response(JSON.stringify({ error: 'Item not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Write updated meta data
    await fs.writeFile(metaFilePath, JSON.stringify(metaData, null, 2));

    // Rename the actual file
    const oldFullPath = path.join(process.cwd(), 'app', 'docs', oldPath);
    const newFullPath = path.join(path.dirname(oldFullPath), `${updatedItem.slug}.mdx`);
    await fs.rename(oldFullPath, newFullPath);

    return new Response(JSON.stringify({ message: 'Item renamed successfully', updatedItem }), {
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
