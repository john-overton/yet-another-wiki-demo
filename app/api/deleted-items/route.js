import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const metaFilePath = path.join(process.cwd(), 'public', 'docs', 'meta.json');
    const metaContent = await fs.readFile(metaFilePath, 'utf8');
    const metaData = JSON.parse(metaContent);

    // Function to collect deleted items recursively
    const collectDeletedItems = (items) => {
      let deletedItems = [];
      items.forEach(item => {
        if (item.deleted) {
          deletedItems.push(item);
        }
        if (item.children && item.children.length > 0) {
          deletedItems = deletedItems.concat(collectDeletedItems(item.children));
        }
      });
      return deletedItems;
    };

    const deletedItems = collectDeletedItems(metaData.pages);

    return new Response(JSON.stringify({ deletedItems }), {
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
