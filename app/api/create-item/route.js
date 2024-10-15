import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request) {
  console.log('POST request received in create-item route');

  const { parentPath, name, type } = await request.json();
  console.log('Received data:', { parentPath, name, type });

  if (!parentPath || !name || !type) {
    console.error('Missing required fields:', { parentPath, name, type });
    return new Response('Missing required fields', { status: 400 });
  }

  const fullPath = path.join(process.cwd(), 'app', 'docs', parentPath, name);
  console.log('Full path for new item:', fullPath);

  try {
    if (type === 'folder') {
      console.log('Attempting to create folder:', fullPath);
      await fs.mkdir(fullPath, { recursive: true });
      console.log('Folder created successfully');
    } else {
      console.log('Attempting to create file:', fullPath);
      // Create an empty file
      await fs.writeFile(fullPath, '');
      console.log('File created successfully');
    }
    console.log('Item created successfully');
    return new Response('Item created successfully', { status: 200 });
  } catch (error) {
    console.error('Error creating item:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return new Response(`Failed to create item: ${error.message}`, { status: 500 });
  }
}
