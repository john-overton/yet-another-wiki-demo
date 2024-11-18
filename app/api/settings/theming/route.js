import { promises as fs } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'config/settings/theming.json');
    let fileContent;
    
    try {
      fileContent = await fs.readFile(filePath, 'utf8');
    } catch (error) {
      // If file doesn't exist, create default structure
      const defaultContent = {
        links: [],
        headerLogo: {
          lightLogo: null,
          darkLogo: null
        },
        footerLogo: {
          lightLogo: null,
          darkLogo: null
        },
        footerLinks: {
          column1: { header: '', links: [] },
          column2: { header: '', links: [] }
        },
        footerSettings: {
          customCopyrightText: '',
          hidePoweredByText: false
        }
      };
      await fs.mkdir(join(process.cwd(), 'config/settings'), { recursive: true });
      await fs.writeFile(filePath, JSON.stringify(defaultContent, null, 2));
      fileContent = JSON.stringify(defaultContent);
    }

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
    
    // Ensure the logo objects have the correct structure
    if (data.headerLogo && typeof data.headerLogo === 'string') {
      data.headerLogo = {
        lightLogo: data.headerLogo,
        darkLogo: null
      };
    }
    if (data.footerLogo && typeof data.footerLogo === 'string') {
      data.footerLogo = {
        lightLogo: data.footerLogo,
        darkLogo: null
      };
    }

    // Ensure footerLinks has the correct structure
    if (!data.footerLinks) {
      data.footerLinks = {
        column1: { header: '', links: [] },
        column2: { header: '', links: [] }
      };
    }

    // Ensure footerSettings has the correct structure
    if (!data.footerSettings) {
      data.footerSettings = {
        customCopyrightText: '',
        hidePoweredByText: false
      };
    }

    const filePath = join(process.cwd(), 'config/settings/theming.json');
    await fs.mkdir(join(process.cwd(), 'config/settings'), { recursive: true });
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
