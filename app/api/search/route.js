import { promises as fs } from 'fs';
import path from 'path';

let metaData = null;

async function loadMetaData() {
  try {
    const metaPath = path.join(process.cwd(), 'public', 'docs', 'meta.json');
    const metaContent = await fs.readFile(metaPath, 'utf-8');
    metaData = JSON.parse(metaContent);
  } catch (error) {
    console.error('Error loading meta.json:', error);
    metaData = { pages: [] };
  }
}

function findPageInMeta(filePath, pages) {
  for (const page of pages) {
    if (page.path === filePath) {
      return page;
    }
    if (page.children && page.children.length > 0) {
      const found = findPageInMeta(filePath, page.children);
      if (found) return found;
    }
  }
  return null;
}

async function searchFiles(query, authenticated) {
  const docsDir = path.join(process.cwd(), 'public', 'docs');
  const results = [];

  try {
    await loadMetaData();
    const files = await fs.readdir(docsDir);
    const mdFiles = files.filter(file => file.endsWith('.md'));

    for (const file of mdFiles) {
      // Check if file is public when user is not authenticated
      const pageInfo = findPageInMeta(file, metaData.pages);
      if (!authenticated && (!pageInfo || !pageInfo.isPublic)) {
        continue;
      }

      try {
        const content = await fs.readFile(path.join(docsDir, file), 'utf-8');
        const lowerContent = content.toLowerCase();
        const lowerQuery = query.toLowerCase();

        if (lowerContent.includes(lowerQuery)) {
          const index = lowerContent.indexOf(lowerQuery);
          const start = Math.max(0, index - 50);
          const end = Math.min(content.length, index + query.length + 50);
          let excerpt = content.substring(start, end);

          if (start > 0) excerpt = '...' + excerpt;
          if (end < content.length) excerpt = excerpt + '...';

          // Use title from meta.json if available, otherwise generate from filename
          const title = pageInfo ? pageInfo.title : file
            .replace('.md', '')
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

          results.push({
            title,
            path: file,
            excerpt
          });
        }
      } catch (error) {
        console.error(`Error searching in file ${file}:`, error);
      }
    }
  } catch (error) {
    console.error('Error reading docs directory:', error);
  }

  return results;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const authenticated = searchParams.get('authenticated') === 'true';

  if (!query) {
    return new Response(JSON.stringify({ error: 'No search query provided' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const results = await searchFiles(query, authenticated);
    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error performing search:', error);
    return new Response(JSON.stringify({ error: 'Search failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
