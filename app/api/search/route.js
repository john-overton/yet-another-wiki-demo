import { promises as fs } from 'fs';
import path from 'path';
import FlexSearch from 'flexsearch';

let index;
let documents = [];

async function initializeSearch() {
  if (index) return;

  index = new FlexSearch.Document({
    document: {
      id: 'id',
      index: ['name', 'content'],
      store: ['name', 'path']
    }
  });

  const docsDir = path.join(process.cwd(), 'app', 'docs');
  await indexFiles(docsDir);
}

async function indexFiles(dir, basePath = '') {
  const files = await fs.readdir(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await fs.stat(filePath);

    if (stat.isDirectory()) {
      await indexFiles(filePath, path.join(basePath, file));
    } else if (file.endsWith('.mdx')) {
      const content = await fs.readFile(filePath, 'utf-8');
      const relativePath = path.join(basePath, file).replace(/\\/g, '/');
      const id = documents.length;
      documents.push({
        id,
        name: file.replace('.mdx', ''),
        path: relativePath,
        content
      });
      index.add(id, documents[id]);
    }
  }
}

export async function GET(request) {
  await initializeSearch();

  const { searchParams } = new URL(request.url);
  const term = searchParams.get('term');

  if (!term) {
    return new Response(JSON.stringify([]), { status: 400 });
  }

  console.log(`Searching for term: ${term}`);
  const results = index.search(term, { limit: 5, enrich: true });
  console.log(`Search results:`, JSON.stringify(results, null, 2));

  let formattedResults = [];
  try {
    formattedResults = results.flatMap(result => {
      return result.result.map(item => {
        const id = item.id;
        console.log(`Processing item with id: ${id}`);
        if (documents[id]) {
          return {
            name: documents[id].name,
            path: documents[id].path
          };
        } else {
          console.error(`Document with id ${id} not found`);
          return null;
        }
      }).filter(Boolean);
    });
  } catch (error) {
    console.error('Error formatting search results:', error);
  }

  console.log(`Formatted results:`, JSON.stringify(formattedResults, null, 2));
  return new Response(JSON.stringify(formattedResults), { status: 200 });
}
