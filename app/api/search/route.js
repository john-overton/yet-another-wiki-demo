import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const term = searchParams.get('term');

  if (!term) {
    return new Response(JSON.stringify([]), { status: 400 });
  }

  const docsDir = path.join(process.cwd(), 'app', 'docs');
  const results = await searchFiles(docsDir, term);

  return new Response(JSON.stringify(results), { status: 200 });
}

async function searchFiles(dir, term) {
  const files = await fs.readdir(dir);
  let results = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await fs.stat(filePath);

    if (stat.isDirectory()) {
      results = results.concat(await searchFiles(filePath, term));
    } else if (file.endsWith('.mdx')) {
      const content = await fs.readFile(filePath, 'utf-8');
      if (content.toLowerCase().includes(term.toLowerCase())) {
        results.push({
          name: file.replace('.mdx', ''), // Display name without extension
          fullName: file, // Full name with extension
          path: path.relative(path.join(process.cwd(), 'app', 'docs'), filePath).replace(/\\/g, '/'),
        });
      }
    }
  }

  return results;
}
