import { promises as fs } from 'fs';
import { join } from 'path';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create theming directory if it doesn't exist
    const themingDir = join(process.cwd(), 'data/content/theming');
    await fs.mkdir(themingDir, { recursive: true });

    // Save the file with original extension
    const fileExtension = file.name.substring(file.name.lastIndexOf('.'));
    const fileName = 'header-logo' + fileExtension;
    const filePath = join(themingDir, fileName);
    await fs.writeFile(filePath, buffer);

    // Update theming.json
    const themingJsonPath = join(process.cwd(), 'config/settings/theming.json');
    let themingConfig = {};
    try {
      const existingConfig = await fs.readFile(themingJsonPath, 'utf8');
      themingConfig = JSON.parse(existingConfig);
    } catch (error) {
      console.error('Error reading existing config:', error);
    }

    // Update the config with the new logo path
    themingConfig.headerLogo = `/api/content/theming/${fileName}`;
    await fs.writeFile(themingJsonPath, JSON.stringify(themingConfig, null, 2));

    return new Response(JSON.stringify({ 
      success: true, 
      path: themingConfig.headerLogo 
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

export async function DELETE() {
  try {
    const themingJsonPath = join(process.cwd(), 'config/settings/theming.json');
    let themingConfig = {};
    try {
      const existingConfig = await fs.readFile(themingJsonPath, 'utf8');
      themingConfig = JSON.parse(existingConfig);
    } catch (error) {
      console.error('Error reading existing config:', error);
    }

    if (themingConfig.headerLogo) {
      // Extract filename from path
      const fileName = themingConfig.headerLogo.split('/').pop();
      // Delete the file
      const filePath = join(process.cwd(), 'data/content/theming', fileName);
      try {
        await fs.unlink(filePath);
      } catch (error) {
        console.error('Error deleting header logo file:', error);
      }

      // Update the config
      delete themingConfig.headerLogo;
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
