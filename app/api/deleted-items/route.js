import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const metaFilePath = path.join(process.cwd(), 'data', 'docs', 'meta.json');
    
    // Ensure the docs directory exists
    const docsDir = path.join(process.cwd(), 'data', 'docs');
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
      metaData = { pages: [], lastId: 0 };
      await fs.writeFile(metaFilePath, JSON.stringify(metaData, null, 2));
    }

    // Function to collect and validate deleted items recursively
    const collectDeletedItems = async (items, parentId = null) => {
      let deletedItems = [];
      
      if (!Array.isArray(items)) {
        console.error('Items is not an array:', items);
        return deletedItems;
      }

      for (const item of items) {
        if (item.deleted === true) {
          const fullPath = path.join(process.cwd(), 'data', 'docs', item.path);
          try {
            // Check if the file still exists
            await fs.access(fullPath);
            deletedItems.push({
              ...item,
              parentId
            });
          } catch (error) {
            console.warn(`Deleted file not found: ${fullPath}`);
          }
        }

        // Check children recursively
        if (item.children && Array.isArray(item.children) && item.children.length > 0) {
          const childDeletedItems = await collectDeletedItems(item.children, item.id);
          deletedItems = deletedItems.concat(childDeletedItems);
        }
      }

      return deletedItems;
    };

    // Get all deleted items from the pages array
    const deletedItems = await collectDeletedItems(metaData.pages);

    return NextResponse.json({ deletedItems });
  } catch (error) {
    console.error('Error fetching deleted items:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
