import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request) {
  const { parentPath, name, type } = await request.json();

  if (!parentPath || !name || !type) {
    return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const metaFilePath = path.join(process.cwd(), 'app', 'docs', 'meta.json');
    const metaContent = await fs.readFile(metaFilePath, 'utf8');
    const metaData = JSON.parse(metaContent);

    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/\.mdx$/, '');
    const fileName = type === 'file' ? slug + '.mdx' : slug;
    const newItemPath = path.join(parentPath, fileName).replace(/^\//, '').replace(/\\/g, '/');

    const newItem = {
      slug,
      title: name.replace(/\.mdx$/, ''),
      path: newItemPath,
      isPublic: true,
      version: 1,
      lastModified: new Date().toISOString(),
    };

    if (type === 'folder') {
      newItem.children = [];
    }

    const addToStructure = (items, pathParts) => {
      if (pathParts.length === 0) {
        items.push(newItem);
        return true;
      }
      const currentFolder = pathParts[0];
      const targetFolder = items.find(item => item.slug === currentFolder);
      if (targetFolder && targetFolder.children) {
        return addToStructure(targetFolder.children, pathParts.slice(1));
      }
      return false;
    };

    const pathParts = parentPath.split('/').filter(Boolean);

    if (pathParts.length === 0) {
      metaData.pages.push(newItem);
    } else if (!addToStructure(metaData.pages, pathParts)) {
      return new Response(JSON.stringify({ error: 'Parent folder not found' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Write updated meta data
    await fs.writeFile(metaFilePath, JSON.stringify(metaData, null, 2));

    // Create an empty MDX file if it's a file
    if (type === 'file') {
      const filePath = path.join(process.cwd(), 'app', 'docs', newItemPath);
      await fs.writeFile(filePath, `# ${newItem.title}\n\nYour content here.`);
    }

    return new Response(JSON.stringify({ message: 'Item created successfully', newItem }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating item:', error);
    return new Response(JSON.stringify({ error: 'Failed to create item' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
