import { promises as fs } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'config/settings/theming.json');
    const fileContent = await fs.readFile(filePath, 'utf8');
    return new Response(fileContent, {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error reading theming settings:', error);
    return new Response(JSON.stringify({ error: 'Failed to read theming settings' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const filePath = join(process.cwd(), 'config/settings/theming.json');
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error saving theming settings:', error);
    return new Response(JSON.stringify({ error: 'Failed to save theming settings' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
