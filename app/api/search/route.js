import { promises as fs } from 'fs';
import path from 'path';
import FlexSearch from 'flexsearch';

let index;
let documents = [];
let titleMap = {};

async function initializeSearch() {
  if (index) return;

  index = new FlexSearch.Document({
    document: {
      id: 'id',
      index: ['name', 'content'],
      store: ['name', 'path', 'content']
    }
  });

  const docsDir = path.join(process.cwd(), 'app', 'docs');
  await loadMetaData();
  await indexFiles(docsDir);
}

async function loadMetaData() {
  const metaPath = path.join(process.cwd(), 'app', 'docs', 'meta.json');
  const metaContent = await fs.readFile(metaPath, 'utf-8');
  const metaData = JSON.parse(metaContent);

  metaData.pages.forEach(page => {
    titleMap[page.path] = page.title;
  });
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

function getSnippet(content, term, maxLength = 150) {
  const lowerContent = content.toLowerCase();
  const lowerTerm = term.toLowerCase();
  const index = lowerContent.indexOf(lowerTerm);
  if (index === -1) return '';

  let start = Math.max(0, index - 75);
  let end = Math.min(content.length, index + term.length + 75);
  let snippet = content.slice(start, end);

  if (start > 0) snippet = '...' + snippet;
  if (end < content.length) snippet = snippet + '...';

  return snippet;
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
          const slug = documents[id].path.replace('.mdx', '');
          return {
            title: titleMap[documents[id].path] || documents[id].name,
            slug: slug,
            path: documents[id].path,
            snippet: getSnippet(documents[id].content, term)
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
