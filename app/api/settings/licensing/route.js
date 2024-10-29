import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'app/settings/json-config/licensing.json');
    const fileContent = await fs.readFile(filePath, 'utf8');
    return new Response(fileContent, {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to load licensing settings' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request) {
  try {
    const filePath = path.join(process.cwd(), 'app/settings/json-config/licensing.json');
    const data = await request.json();
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return new Response(JSON.stringify({ message: 'Settings saved successfully' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to save licensing settings' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
