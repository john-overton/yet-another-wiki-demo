import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request) {
  const { oldPath, newPath, content } = await request.json();

  try {
    const metaFilePath = path.join(process.cwd(), 'public', 'docs', 'meta.json');
    const metaContent = await fs.readFile(metaFilePath, 'utf8');
    const metaData = JSON.parse(metaContent);

    const updatePath = async (items) => {
      for (let item of items) {
        if (item.path === oldPath) {
          item.path = newPath;
          return true;
        }
        if (item.children && updatePath(item.children)) {
          return true;
        }
      }
      return false;
    };

    if (oldPath !== newPath) {
      // Update path in meta.json
      updatePath(metaData.pages);
      
      // Delete old file if it exists and paths are different
      const oldFullPath = path.join(process.cwd(), 'public', 'docs', oldPath);
      try {
        await fs.unlink(oldFullPath);
      } catch (error) {
        console.error('Error deleting old file:', error);
      }
    }

    // Write content to the new path
    const newFullPath = path.join(process.cwd(), 'public', 'docs', newPath);
    await fs.writeFile(newFullPath, content, 'utf8');

    // Write updated meta data
    await fs.writeFile(metaFilePath, JSON.stringify(metaData, null, 2), 'utf8');

    return new Response(JSON.stringify({ message: 'File updated successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating file:', error);
    return new Response(JSON.stringify({ error: 'Failed to update file' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
