import { promises as fs } from 'fs';
import { join } from 'path';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET(request, { params }) {
  try {
    // Get the file path from the URL
    const filePath = params.path.join('/');
    
    // Ensure the path is within the allowed directories
    if (!filePath.startsWith('user-avatars/') && !filePath.startsWith('post-images/')) {
      return new NextResponse('Invalid path', { status: 400 });
    }

    // Construct the full file path
    const fullPath = join(process.cwd(), 'data', 'uploads', filePath);

    try {
      // Read the file
      const fileBuffer = await fs.readFile(fullPath);
      
      // Determine content type based on file extension
      const contentType = filePath.endsWith('.jpg') || filePath.endsWith('.jpeg') 
        ? 'image/jpeg'
        : filePath.endsWith('.png')
        ? 'image/png'
        : filePath.endsWith('.gif')
        ? 'image/gif'
        : filePath.endsWith('.webp')
        ? 'image/webp'
        : 'application/octet-stream';

      // Return the file with appropriate headers
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Content-Length': fileBuffer.length.toString(),
          'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
        },
      });
    } catch (error) {
      console.error('Error reading file:', error);
      return new NextResponse('File not found', { status: 404 });
    }
  } catch (error) {
    console.error('Error serving file:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
