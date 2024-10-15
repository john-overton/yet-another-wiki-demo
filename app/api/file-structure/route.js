import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  const docsDirectory = path.join(process.cwd(), 'app', 'docs');
  
  async function getFileStructure(dir, relativePath = '') {
    const items = await fs.readdir(dir, { withFileTypes: true });
    const structure = [];

    for (const item of items) {
      const itemPath = path.join(relativePath, item.name);
      if (item.isDirectory()) {
        structure.push({
          name: item.name,
          type: 'folder',
          path: itemPath,
          children: await getFileStructure(path.join(dir, item.name), itemPath)
        });
      } else if (item.name.endsWith('.mdx')) {
        structure.push({
          name: item.name,
          type: 'file',
          path: itemPath
        });
      }
    }

    return structure;
  }

  try {
    const fileStructure = await getFileStructure(docsDirectory);
    return new Response(JSON.stringify(fileStructure), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error reading file structure:', error);
    return new Response(JSON.stringify({ error: 'Failed to read file structure' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
