import { promises as fs } from 'fs';
import { join } from 'path';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const mode = formData.get('mode');

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create theming directory if it doesn't exist
    const themingDir = join(process.cwd(), 'data/content/theming');
    await fs.mkdir(themingDir, { recursive: true });

    const fileExtension = file.name.substring(file.name.lastIndexOf('.'));
    const fileName = `footer-logo-${mode}${fileExtension}`;
    const filePath = join(themingDir, fileName);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(filePath, buffer);

    // Update theming.json
    const themingJsonPath = join(process.cwd(), 'config/settings/theming.json');
    let themingConfig = {};
    try {
      const existingConfig = await fs.readFile(themingJsonPath, 'utf8');
      themingConfig = JSON.parse(existingConfig);
    } catch (error) {
      // If file doesn't exist or is invalid, we'll create a new config
    }

    // Initialize footerLogo object if it doesn't exist
    if (!themingConfig.footerLogo || typeof themingConfig.footerLogo === 'string') {
      themingConfig.footerLogo = {
        lightLogo: null,
        darkLogo: null
      };
    }

    // Update the config with the new logo path
    themingConfig.footerLogo[mode === 'light' ? 'lightLogo' : 'darkLogo'] = `/api/theming-content?path=${fileName}`;
    await fs.writeFile(themingJsonPath, JSON.stringify(themingConfig, null, 2));

    return new Response(JSON.stringify({
      success: true,
      path: `/api/theming-content?path=${fileName}`
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error handling footer logo upload:', error);
    return new Response(JSON.stringify({ error: 'Failed to upload footer logo' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function DELETE(request) {
  try {
    const { mode } = await request.json();
    const themingJsonPath = join(process.cwd(), 'config/settings/theming.json');
    let themingConfig = {};
    try {
      const existingConfig = await fs.readFile(themingJsonPath, 'utf8');
      themingConfig = JSON.parse(existingConfig);
    } catch (error) {
      return new Response(JSON.stringify({ error: 'No configuration found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (themingConfig.footerLogo?.[mode === 'light' ? 'lightLogo' : 'darkLogo']) {
      // Extract filename from path
      const logoPath = themingConfig.footerLogo[mode === 'light' ? 'lightLogo' : 'darkLogo'];
      const fileName = logoPath.split('path=')[1];
      
      // Delete the file
      const filePath = join(process.cwd(), 'data/content/theming', fileName);
      try {
        await fs.unlink(filePath);
      } catch (error) {
        console.error('Error deleting footer logo file:', error);
      }

      // Update the config
      themingConfig.footerLogo[mode === 'light' ? 'lightLogo' : 'darkLogo'] = null;
      await fs.writeFile(themingJsonPath, JSON.stringify(themingConfig, null, 2));
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error deleting footer logo:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete footer logo' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
