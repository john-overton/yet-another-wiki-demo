import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const metaFilePath = path.join(process.cwd(), 'app', 'docs', 'meta.json');
    const metaContent = await fs.readFile(metaFilePath, 'utf8');
    const metaData = JSON.parse(metaContent);

    const getDeletedItems = (items, deletedItems = []) => {
      items.forEach(item => {
        if (item.deleted) {
          deletedItems.push({ path: item.path, title: item.title });
        }
        if (item.children) {
          getDeletedItems(item.children, deletedItems);
        }
      });
      return deletedItems;
    };

    const deletedItems = getDeletedItems(metaData.pages);

    return new Response(JSON.stringify({ deletedItems }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching deleted items:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch deleted items' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
