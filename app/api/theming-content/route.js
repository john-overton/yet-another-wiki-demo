export const dynamic = 'force-dynamic';

import { promises as fs } from 'fs';
import { join } from 'path';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');

    if (!filePath) {
      return NextResponse.json({ error: 'No file path provided' }, { status: 400 });
    }

    // Resolve the path relative to the data/content/theming directory
    const fullPath = join(process.cwd(), 'data', 'content', 'theming', filePath);
    console.log('Reading theming file from:', fullPath);

    // Read the file
    const fileBuffer = await fs.readFile(fullPath);

    // Determine content type based on file extension
    const extension = filePath.split('.').pop().toLowerCase();
    const contentType = {
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'svg': 'image/svg+xml',
    }[extension] || 'application/octet-stream';

    // Return the file with appropriate content type and cache control headers
    return new Response(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
    });
  } catch (error) {
    console.error('Error reading theming file:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
