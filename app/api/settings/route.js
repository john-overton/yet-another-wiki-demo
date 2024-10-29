import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const settingsPath = path.join(process.cwd(), 'app/settings.json');

// Initialize settings file if it doesn't exist
async function ensureSettingsFile() {
  try {
    await fs.access(settingsPath);
  } catch {
    const defaultSettings = {
      font: 'Open Sans',
      theme: 'system',
      license: {
        email: '',
        key: ''
      }
    };
    await fs.writeFile(settingsPath, JSON.stringify(defaultSettings, null, 2));
  }
}

export async function GET() {
  try {
    await ensureSettingsFile();
    const settings = await fs.readFile(settingsPath, 'utf8');
    return NextResponse.json(JSON.parse(settings));
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read settings' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const settings = await request.json();
    await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2));
    return NextResponse.json({ message: 'Settings saved successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
