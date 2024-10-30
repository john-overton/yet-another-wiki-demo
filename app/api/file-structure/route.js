import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic'; // Disable static optimization
export const revalidate = 0; // Disable cache

export async function GET() {
  try {
    const metaFilePath = path.join(process.cwd(), 'public', 'docs', 'meta.json');
    
    // Ensure the docs directory exists
    const docsDir = path.join(process.cwd(), 'public', 'docs');
    try {
      await fs.access(docsDir);
    } catch {
      await fs.mkdir(docsDir, { recursive: true });
    }

    // Read or create meta.json
    let metaData;
    try {
      const metaContent = await fs.readFile(metaFilePath, 'utf8');
      metaData = JSON.parse(metaContent);
    } catch {
      metaData = { pages: [] };
      await fs.writeFile(metaFilePath, JSON.stringify(metaData, null, 2));
    }

    const validateAndFilterItems = async (items) => {
      const validItems = [];
      for (const item of items) {
        // Skip deleted items
        if (item.deleted) continue;

        const fullPath = path.join(process.cwd(), 'public', 'docs', item.path);
        try {
          await fs.access(fullPath);
          if (item.children) {
            item.children = await validateAndFilterItems(item.children);
          }
          validItems.push(item);
        } catch (error) {
          console.warn(`File not found: ${fullPath}`);
        }
      }
      return validItems;
    };

    metaData.pages = await validateAndFilterItems(metaData.pages);

    return new Response(JSON.stringify(metaData), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error reading meta.json:', error);
    return new Response(JSON.stringify({ error: 'Failed to read file structure' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
