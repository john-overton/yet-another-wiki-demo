import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request) {
  const { path: filePath, content, title, isPublic, slug, isFolder } = await request.json();

  if (!filePath || title === undefined || isPublic === undefined || slug === undefined || isFolder === undefined) {
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
        if (item.path === filePath) {
          item.title = title;
          item.isPublic = isPublic;
          item.slug = slug;
          item.lastModified = new Date().toISOString();
          
          if (isFolder && !item.children) {
            item.children = [];
          } else if (!isFolder && item.children) {
            delete item.children;
          }

          // Update file content if it's not a folder
          if (!isFolder) {
            const fullPath = path.join(process.cwd(), 'app', 'docs', filePath);
            fs.writeFile(fullPath, content);
          }

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
