import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    // Log the raw request body first
    const body = await request.json();
    console.log('Received request body:', body);

    // Destructure after logging
    const { path: filePath, oldPath, newPath, content, title, isPublic, slug, version } = body;

    // Log individual fields
    console.log('Destructured fields:', {
      filePath,
      title,
      isPublic,
      slug,
      version,
      hasContent: !!content
    });

    // Use filePath if provided, otherwise use oldPath/newPath logic
    const targetPath = filePath || newPath;
    if (!targetPath) {
      throw new Error('No file path provided');
    }

    // Read meta.json
    const metaFilePath = path.join(process.cwd(), 'public', 'docs', 'meta.json');
    let metaData;
    try {
      const metaContent = await fs.readFile(metaFilePath, 'utf8');
      metaData = JSON.parse(metaContent);
      if (!metaData || !metaData.pages) {
        throw new Error('Invalid meta.json structure');
      }
    } catch (error) {
      console.error('Error reading/parsing meta.json:', error);
      throw new Error(`Failed to read/parse meta.json: ${error.message}`);
    }

    // Function to find and update page metadata
    const findAndUpdatePage = (items, targetPath) => {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.path === targetPath) {
          // Keep existing fields and only update what's provided
          items[i] = {
            ...item,
            lastModified: new Date().toISOString(),
            title: title !== undefined ? title : item.title,
            isPublic: isPublic !== undefined ? isPublic : item.isPublic,
            slug: slug !== undefined ? slug : item.slug,
            version: 1, // Always use version 1
            children: item.children || [],
            sortOrder: item.sortOrder // Preserve existing sortOrder
          };
          console.log('Updated page metadata:', items[i]);
          return true;
        }
        if (item.children && item.children.length > 0) {
          if (findAndUpdatePage(item.children, targetPath)) {
            return true;
          }
        }
      }
      return false;
    };

    // Update metadata in meta.json
    const pageFound = findAndUpdatePage(metaData.pages, targetPath);
    if (!pageFound) {
      console.warn('Page not found in meta.json:', targetPath);
      // If page not found, add it as a new page
      metaData.pages.push({
        slug: slug || targetPath.replace('.md', ''),
        title: title || targetPath.replace('.md', ''),
        path: targetPath,
        isPublic: isPublic !== undefined ? isPublic : true,
        version: 1, // Always use version 1
        lastModified: new Date().toISOString(),
        children: [],
        sortOrder: metaData.pages.length + 1 // Add at the end
      });
    }

    // Write updated meta data
    try {
      console.log('Writing updated meta.json');
      const updatedMetaContent = JSON.stringify(metaData, null, 2);
      await fs.writeFile(metaFilePath, updatedMetaContent, 'utf8');
      console.log('Successfully wrote meta.json');
    } catch (error) {
      console.error('Error writing meta.json:', error);
      throw new Error(`Failed to write meta.json: ${error.message}`);
    }

    // Only write content if it's provided
    if (content) {
      try {
        const targetFullPath = path.join(process.cwd(), 'public', 'docs', targetPath);
        console.log('Writing content to:', targetFullPath);
        await fs.writeFile(targetFullPath, content, 'utf8');
        console.log('Successfully wrote content file');
      } catch (error) {
        console.error('Error writing content file:', error);
        throw new Error(`Failed to write content file: ${error.message}`);
      }
    } else {
      console.log('No content provided, skipping content file update');
    }

    return new Response(JSON.stringify({ 
      message: 'File updated successfully',
      path: targetPath,
      metadataUpdated: true,
      contentUpdated: !!content
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in update-file route:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to update file',
      details: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
