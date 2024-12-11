import { promises as fs } from 'fs';
import { join } from 'path';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const filePath = join(process.cwd(), 'data/content/theming', params.path.join('/'));
    console.log('Attempting to serve file:', filePath);

    const fileBuffer = await fs.readFile(filePath);

    // Determine content type based on file extension
    const extension = filePath.split('.').pop().toLowerCase();
    let contentType = 'application/octet-stream';

    switch (extension) {
      case 'png':
        contentType = 'image/png';
        break;
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg';
        break;
      case 'gif':
        contentType = 'image/gif';
        break;
      case 'svg':
        contentType = 'image/svg+xml';
        break;
      case 'webp':
        contentType = 'image/webp';
        break;
    }

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return new NextResponse('File not found', { status: 404 });
  }
}
