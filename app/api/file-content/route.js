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

    // Resolve the path relative to the data/docs directory
    const fullPath = path.join(process.cwd(), 'data', 'docs', filePath);
    console.log('Reading file from:', fullPath);

    const content = await fs.readFile(fullPath, 'utf8');
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error) {
    console.error('Error reading file:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { path: filePath, content } = await request.json();

    if (!filePath) {
      return NextResponse.json({ error: 'No path provided' }, { status: 400 });
    }

    // Write to the data/docs directory
    const fullPath = path.join(process.cwd(), 'data', 'docs', filePath);
    await fs.writeFile(fullPath, content, 'utf8');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error writing file:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
