import { promises as fs } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'config/settings/licensing.json');
    const fileContent = await fs.readFile(filePath, 'utf8');
    return new Response(fileContent, {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error reading licensing settings:', error);
    return new Response(JSON.stringify({ error: 'Failed to read licensing settings' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const filePath = join(process.cwd(), 'config/settings/licensing.json');
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error saving licensing settings:', error);
    return new Response(JSON.stringify({ error: 'Failed to save licensing settings' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
