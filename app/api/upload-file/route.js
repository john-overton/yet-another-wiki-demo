import { promises as fs } from 'fs';
import { join } from 'path';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return Response.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Save to data/content instead of public
    const uploadDir = join(process.cwd(), 'data', 'content');
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename using crypto
    const randomValues = new Uint8Array(16);
    crypto.getRandomValues(randomValues);
    const uniqueId = Array.from(randomValues).map(b => b.toString(16).padStart(2, '0')).join('');
    const fileName = `${uniqueId}-${file.name}`;
    const filePath = join(uploadDir, fileName);

    // Convert file to buffer and save
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(filePath, buffer);

    // Return API route path instead of public URL
    const url = `/api/content/${fileName}`;
    return Response.json({ url });
  } catch (error) {
    console.error('Error uploading file:', error);
    return Response.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

// Add GET route to serve files
export async function GET(request) {
  try {
    // Get the filename from the URL
    const url = new URL(request.url);
    const segments = url.pathname.split('/');
    const filename = segments[segments.length - 1];
    
    if (!filename) {
      return new Response('File not found', { status: 404 });
    }

    // Read from data/content
    const filePath = join(process.cwd(), 'data', 'content', filename);
    
    try {
      const fileBuffer = await fs.readFile(filePath);
      
      // Determine content type based on file extension
      const ext = filename.split('.').pop().toLowerCase();
      const contentType = {
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'txt': 'text/plain'
      }[ext] || 'application/octet-stream';
      
      return new Response(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
      });
    } catch (error) {
      console.error('Error reading file:', error);
      return new Response('File not found', { status: 404 });
    }
  } catch (error) {
    console.error('Error serving file:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
