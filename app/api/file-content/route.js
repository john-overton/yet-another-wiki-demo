import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const filePath = searchParams.get('path');

  if (!filePath) {
    return new Response(JSON.stringify({ error: 'File path is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const fullPath = path.join(process.cwd(), 'app', 'docs', filePath);
    const content = await fs.readFile(fullPath, 'utf8');
    return new Response(content, {
      headers: { 'Content-Type': 'text/plain' },
    });
  } catch (error) {
    console.error('Error reading file:', error);
    return new Response(JSON.stringify({ error: 'Failed to read file content' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
