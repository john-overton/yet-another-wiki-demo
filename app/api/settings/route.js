import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const generalSettingsPath = path.join(process.cwd(), 'config/settings/generalsettings.json');
const settingsPath = path.join(process.cwd(), 'app/settings.json');

// Initialize settings files if they don't exist
async function ensureSettingsFiles() {
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

  try {
    await fs.access(generalSettingsPath);
  } catch {
    const defaultGeneralSettings = {
      preventUserRegistration: false
    };
    await fs.writeFile(generalSettingsPath, JSON.stringify(defaultGeneralSettings, null, 2));
  }
}

export async function GET() {
  try {
    await ensureSettingsFiles();
    
    // Read both settings files
    const [settings, generalSettings] = await Promise.all([
      fs.readFile(settingsPath, 'utf8'),
      fs.readFile(generalSettingsPath, 'utf8')
    ]);

    // Combine the settings
    const combinedSettings = {
      ...JSON.parse(settings),
      ...JSON.parse(generalSettings)
    };

    return NextResponse.json(combinedSettings);
  } catch (error) {
    console.error('Failed to read settings:', error);
    return NextResponse.json({ error: 'Failed to read settings' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const newSettings = await request.json();
    await ensureSettingsFiles();

    // If the request includes preventUserRegistration, update generalSettings
    if ('preventUserRegistration' in newSettings) {
      const generalSettings = JSON.parse(await fs.readFile(generalSettingsPath, 'utf8'));
      const updatedGeneralSettings = {
        ...generalSettings,
        preventUserRegistration: newSettings.preventUserRegistration
      };
      await fs.writeFile(generalSettingsPath, JSON.stringify(updatedGeneralSettings, null, 2));
    }

    // For other settings, update the main settings file
    const mainSettingsKeys = ['font', 'theme', 'license'];
    const mainSettingsUpdate = {};
    mainSettingsKeys.forEach(key => {
      if (key in newSettings) {
        mainSettingsUpdate[key] = newSettings[key];
      }
    });

    if (Object.keys(mainSettingsUpdate).length > 0) {
      const currentSettings = JSON.parse(await fs.readFile(settingsPath, 'utf8'));
      const updatedSettings = {
        ...currentSettings,
        ...mainSettingsUpdate
      };
      await fs.writeFile(settingsPath, JSON.stringify(updatedSettings, null, 2));
    }

    return NextResponse.json({ message: 'Settings saved successfully' });
  } catch (error) {
    console.error('Failed to save settings:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
