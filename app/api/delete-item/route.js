import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request) {
  const { path: itemPath, permanent, deleteChildren } = await request.json();

  try {
    // Use path.resolve() to ensure we get an absolute path
    const publicDir = path.resolve('./public');
    const metaFilePath = path.join(publicDir, 'docs', 'meta.json');
    const metaContent = await fs.readFile(metaFilePath, 'utf8');
    const metaData = JSON.parse(metaContent);

    const markDeleted = async (items, targetPath) => {
      for (let i = 0; i < items.length; i++) {
        if (items[i].path === targetPath) {
          if (permanent) {
            // Delete the actual file from the docs directory
            try {
              const filePath = path.join(publicDir, 'docs', targetPath);
              await fs.unlink(filePath);
            } catch (error) {
              console.error('Error deleting file:', error);
              // Continue with meta.json update even if file deletion fails
            }
            // Remove the item from the array for permanent deletion
            items.splice(i, 1);
          } else {
            // Mark as deleted for soft deletion
            items[i].deleted = true;
            if (deleteChildren && items[i].children) {
              for (const child of items[i].children) {
                await markDeleted(items, child.path);
              }
            }
          }
          return true;
        }
        if (items[i].children && await markDeleted(items[i].children, targetPath)) {
          return true;
        }
      }
      return false;
    };

    if (!await markDeleted(metaData.pages, itemPath)) {
      return new Response(JSON.stringify({ error: 'Item not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Write updated meta data
    await fs.writeFile(metaFilePath, JSON.stringify(metaData, null, 2));

    return new Response(JSON.stringify({ message: 'Item deleted successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error deleting item:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete item', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Keep the DELETE method for backward compatibility
export { POST as DELETE };
