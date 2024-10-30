import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const metaFilePath = path.join(process.cwd(), 'app', 'docs', 'meta.json');
    const metaContent = await fs.readFile(metaFilePath, 'utf8');
    const metaData = JSON.parse(metaContent);

    const validateAndFilterItems = async (items) => {
      const validItems = [];
      for (const item of items) {
        // Skip deleted items
        if (item.deleted) continue;

        const fullPath = path.join(process.cwd(), 'app', 'docs', item.path);
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
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error reading meta.json:', error);
    return new Response(JSON.stringify({ error: 'Failed to read file structure' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
