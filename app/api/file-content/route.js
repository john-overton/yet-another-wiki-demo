import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const filePath = searchParams.get('path');

  if (!filePath) {
    return new Response('File path is required', { status: 400 });
  }

  const fullPath = path.join(process.cwd(), 'app', 'docs', filePath);

  try {
    const content = await fs.readFile(fullPath, 'utf8');
    return new Response(content, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  } catch (error) {
    console.error('Error reading file:', error);
    return new Response('Failed to read file', { status: 500 });
  }
}
