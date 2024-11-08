import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const targetLocation = formData.get('targetLocation');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Read the file content
    const fileContent = await file.text();
    
    // Read and update meta.json
    const metaPath = join(process.cwd(), 'data', 'docs', 'meta.json');
    const metaContent = await readFile(metaPath, 'utf-8');
    const meta = JSON.parse(metaContent);

    // Generate new ID by incrementing lastId
    const newId = (meta.lastId + 1).toString();
    
    // Generate filename
    const fileName = file.name.toLowerCase().replace(/\s+/g, '-');
    
    // Save the file to docs directory
    const filePath = join(process.cwd(), 'data', 'docs', fileName);
    await writeFile(filePath, fileContent);

    // Create new page object
    const newPage = {
      id: newId,
      slug: fileName.replace('.md', ''),
      title: fileName.replace('.md', '').split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' '),
      path: fileName,
      isPublic: true,
      version: 1,
      lastModified: new Date().toISOString(),
      sortOrder: meta.pages.length,
      children: []
    };

    // Add page to appropriate location
    if (targetLocation === 'root') {
      meta.pages.push(newPage);
    } else {
      // Recursively find and update parent page
      const updatePages = (pages) => {
        for (let page of pages) {
          if (page.id === targetLocation) {
            if (!page.children) page.children = [];
            page.children.push(newPage);
            return true;
          }
          if (page.children && updatePages(page.children)) {
            return true;
          }
        }
        return false;
      };
      updatePages(meta.pages);
    }

    // Update lastId
    meta.lastId = parseInt(newId);

    // Save updated meta.json
    await writeFile(metaPath, JSON.stringify(meta, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error handling file upload:', error);
    return NextResponse.json({ error: 'Failed to import file' }, { status: 500 });
  }
}
