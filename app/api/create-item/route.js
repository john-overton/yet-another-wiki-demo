import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request) {
  const { parentPath, name } = await request.json();

  if (!parentPath || !name) {
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
    const newItemPath = `${slug}.mdx`;

    const newItem = {
      slug,
      title: name,
      path: newItemPath,
      isPublic: true,
      version: 1,
      lastModified: new Date().toISOString(),
      children: []
    };

    const addToStructure = (items) => {
      for (let item of items) {
        if (item.path === parentPath) {
          if (!item.children) {
            item.children = [];
          }
          item.children.push(newItem);
          return true;
        }
        if (item.children && addToStructure(item.children)) {
          return true;
        }
      }
      return false;
    };

    if (parentPath === '/') {
      metaData.pages.push(newItem);
    } else if (!addToStructure(metaData.pages)) {
      return new Response(JSON.stringify({ error: 'Parent item not found' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Write updated meta data
    await fs.writeFile(metaFilePath, JSON.stringify(metaData, null, 2));

    // Create an empty MDX file
    const filePath = path.join(process.cwd(), 'app', 'docs', newItemPath);
    await fs.writeFile(filePath, `# ${newItem.title}\n\nYour content here.`);

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
