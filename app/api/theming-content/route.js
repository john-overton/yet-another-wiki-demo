import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');

    if (!filePath) {
      return NextResponse.json({ error: 'No path provided' }, { status: 400 });
    }

    // Resolve the path relative to the data/content/theming directory
    const fullPath = path.join(process.cwd(), 'data', 'content', 'theming', filePath);
    console.log('Reading theming file from:', fullPath);

    const fileBuffer = await fs.readFile(fullPath);

    // Determine content type based on file extension
    const extension = path.extname(fullPath).toLowerCase();
    let contentType = 'application/octet-stream';

    switch (extension) {
      case '.png':
        contentType = 'image/png';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
      case '.svg':
        contentType = 'image/svg+xml';
        break;
      case '.webp':
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
    console.error('Error reading theming file:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
