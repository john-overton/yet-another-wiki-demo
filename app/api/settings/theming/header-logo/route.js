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
    const timestamp = Date.now();
    const fileName = `header-logo-${mode}-${timestamp}${fileExtension}`;
    const filePath = join(themingDir, fileName);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(filePath, buffer);

    // Clean up old files
    const files = await fs.readdir(themingDir);
    for (const oldFile of files) {
      if (oldFile.startsWith(`header-logo-${mode}-`) && oldFile !== fileName) {
        try {
          await fs.unlink(join(themingDir, oldFile));
        } catch (error) {
          console.error('Error deleting old file:', error);
        }
      }
    }

    // Update theming.json
    const themingJsonPath = join(process.cwd(), 'config/settings/theming.json');
    let themingConfig = {};
    try {
      const existingConfig = await fs.readFile(themingJsonPath, 'utf8');
      themingConfig = JSON.parse(existingConfig);
    } catch (error) {
      // If file doesn't exist or is invalid, we'll create a new config
    }

    // Initialize headerLogo object if it doesn't exist
    if (!themingConfig.headerLogo || typeof themingConfig.headerLogo === 'string') {
      themingConfig.headerLogo = {
        lightLogo: null,
        darkLogo: null
      };
    }

    // Update the config with the new logo path
    themingConfig.headerLogo[mode === 'light' ? 'lightLogo' : 'darkLogo'] = `/api/theming-content?path=${fileName}`;
    await fs.writeFile(themingJsonPath, JSON.stringify(themingConfig, null, 2));

    return new Response(JSON.stringify({
      success: true,
      path: `/api/theming-content?path=${fileName}`
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error handling header logo upload:', error);
    return new Response(JSON.stringify({ error: 'Failed to upload header logo' }), {
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

    if (themingConfig.headerLogo?.[mode === 'light' ? 'lightLogo' : 'darkLogo']) {
      // Extract filename from path
      const logoPath = themingConfig.headerLogo[mode === 'light' ? 'lightLogo' : 'darkLogo'];
      const fileName = logoPath.split('path=')[1];
      
      // Delete the file
      const filePath = join(process.cwd(), 'data/content/theming', fileName);
      try {
        await fs.unlink(filePath);
      } catch (error) {
        console.error('Error deleting header logo file:', error);
      }

      // Update the config
      themingConfig.headerLogo[mode === 'light' ? 'lightLogo' : 'darkLogo'] = null;
      await fs.writeFile(themingJsonPath, JSON.stringify(themingConfig, null, 2));
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error deleting header logo:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete header logo' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
