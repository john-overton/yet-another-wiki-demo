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

async function searchFiles(query) {
  const docsDir = path.join(process.cwd(), 'public', 'docs');
  const results = [];

  const searchInFile = async (filePath, title) => {
    try {
      const content = await fs.readFile(path.join(docsDir, filePath), 'utf-8');
      const lowerContent = content.toLowerCase();
      const lowerQuery = query.toLowerCase();

      if (lowerContent.includes(lowerQuery)) {
        const index = lowerContent.indexOf(lowerQuery);
        const start = Math.max(0, index - 50);
        const end = Math.min(content.length, index + query.length + 50);
        let excerpt = content.substring(start, end);

        if (start > 0) excerpt = '...' + excerpt;
        if (end < content.length) excerpt = excerpt + '...';

        results.push({
          title,
          path: filePath,
          excerpt
        });
      }
    } catch (error) {
      console.error(`Error searching in file ${filePath}:`, error);
    }
  };

  const searchInItems = async (items) => {
    for (const item of items) {
      if (!item.deleted) {
        await searchInFile(item.path, item.title);
        if (item.children) {
          await searchInItems(item.children);
        }
      }
    }
  };

  await loadMetaData();
  await searchInItems(metaData.pages);

  return results;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return new Response(JSON.stringify({ error: 'No search query provided' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const results = await searchFiles(query);
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
