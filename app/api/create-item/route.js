import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { parentPath, name, type = 'file' } = await request.json();

    // Read meta.json from data/docs
    const metaFilePath = path.join(process.cwd(), 'data', 'docs', 'meta.json');
    let metaData;
    try {
      const metaContent = await fs.readFile(metaFilePath, 'utf8');
      metaData = JSON.parse(metaContent);
      // Initialize lastId if it doesn't exist
      if (!metaData.lastId) {
        metaData.lastId = 0;
      }
    } catch {
      metaData = { pages: [], lastId: 0 };
    }

    // Generate slug and path
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newItemPath = `${slug}.md`;

    // Function to get max sort order
    const getMaxSortOrder = (items) => {
      return items.reduce((max, item) => {
        return Math.max(max, item.sortOrder || 0);
      }, 0);
    };

    // Increment lastId for new item
    metaData.lastId += 1;

    // Create new item with metadata
    const newItem = {
      id: metaData.lastId.toString(),
      slug,
      title: name,
      path: newItemPath,
      isPublic: true,
      version: 1,
      lastModified: new Date().toISOString(),
      children: [],
      sortOrder: 0 // Will be updated based on location
    };

    // Function to find parent and add new item
    const addToParent = (pages, parentPath) => {
      if (parentPath === '/') {
        // Add to root level
        newItem.sortOrder = getMaxSortOrder(pages) + 1;
        pages.push(newItem);
        return true;
      }

      for (const page of pages) {
        if (page.path === parentPath) {
          // Initialize children array if it doesn't exist
          if (!page.children) {
            page.children = [];
          }
          // Add to parent's children
          newItem.sortOrder = getMaxSortOrder(page.children) + 1;
          page.children.push(newItem);
          return true;
        }
        // Recursively search in children
        if (page.children && addToParent(page.children, parentPath)) {
          return true;
        }
      }
      return false;
    };

    // Add new item to meta data
    if (!addToParent(metaData.pages, parentPath)) {
      throw new Error('Parent path not found');
    }

    // Write updated meta.json
    await fs.writeFile(metaFilePath, JSON.stringify(metaData, null, 2));

    // Create the markdown file
    const filePath = path.join(process.cwd(), 'data', 'docs', newItemPath);
    await fs.writeFile(filePath, `# ${newItem.title}\n\nYour content here.`);

    return NextResponse.json({
      success: true,
      item: newItem
    });
  } catch (error) {
    console.error('Error creating item:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
