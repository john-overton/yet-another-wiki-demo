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

    // Function to collect and validate deleted items recursively
    const collectDeletedItems = async (items, parentPath = '') => {
      let deletedItems = [];
      
      if (!Array.isArray(items)) {
        console.error('Items is not an array:', items);
        return deletedItems;
      }

      for (const item of items) {
        if (item.deleted === true) {
          const fullPath = path.join(process.cwd(), 'public', 'docs', item.path);
          try {
            // Check if the file still exists
            await fs.access(fullPath);
            deletedItems.push({
              ...item,
              parentPath
            });
          } catch (error) {
            console.warn(`Deleted file not found: ${fullPath}`);
          }
        }

        // Check children recursively
        if (item.children && Array.isArray(item.children) && item.children.length > 0) {
          const childDeletedItems = await collectDeletedItems(item.children, item.path);
          deletedItems = deletedItems.concat(childDeletedItems);
        }
      }

      return deletedItems;
    };

    // Get all deleted items from the pages array
    const deletedItems = await collectDeletedItems(metaData.pages);

    // Log for debugging in production
    console.log('Found deleted items:', JSON.stringify(deletedItems, null, 2));

    return new Response(JSON.stringify({ deletedItems }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error fetching deleted items:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch deleted items',
      details: error.message,
      stack: error.stack 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
