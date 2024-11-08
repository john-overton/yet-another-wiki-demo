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

    // Function to get highest sort order
    const getHighestSortOrder = (pages) => {
      if (!pages || pages.length === 0) return 0;
      return Math.max(...pages.map(page => page.sortOrder || 0));
    };

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
      sortOrder: 1, // Default value, will be updated below
      children: []
    };

    // Add page to appropriate location with correct sort order
    if (targetLocation === 'root') {
      // For root level, get highest sort order among root pages and add 1
      newPage.sortOrder = getHighestSortOrder(meta.pages) + 1;
      meta.pages.push(newPage);
    } else {
      // Recursively find and update parent page
      const updatePages = (pages) => {
        for (let page of pages) {
          if (page.id === targetLocation) {
            if (!page.children) page.children = [];
            // Get highest sort order among children and add 1, or use 1 if no children
            newPage.sortOrder = page.children.length > 0 
              ? getHighestSortOrder(page.children) + 1 
              : 1;
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
