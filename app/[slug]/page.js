import dynamic from 'next/dynamic';
import { bundleMDXContent } from '../actions/mdx';
import MDXRenderer from '../components/MDXRenderer';
import { headers } from 'next/headers';

// Fallback to current renderer if bundler fails
const DynamicMDXComponent = dynamic(() => 
  import('../components/MDXRenderer').then((mod) => mod.default)
);

async function getDocContent(slug) {
  try {
    console.log(`Fetching content for slug: ${slug}`);
    const headersList = headers();
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const host = headersList.get('host') || 'localhost:3000';
    const url = new URL(`${protocol}://${host}/api/file-content`);
    // Remove the duplicate app/docs prefix since it's already in the path
    url.searchParams.append('path', `app/docs/${slug}.mdx`);
    
    console.log('Fetching from URL:', url.toString());
    const response = await fetch(url, { cache: 'no-store' });
    
    if (!response.ok) {
      console.error('HTTP Error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const content = await response.text();
    console.log('Content fetched successfully');
    return content;
  } catch (error) {
    console.error('Error fetching doc content:', error);
    return null;
  }
}

export default async function Page({ params }) {
  console.log('Rendering page for slug:', params.slug);
  
  const content = await getDocContent(params.slug);
  
  if (!content) {
    console.error('No content found for slug:', params.slug);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error loading content. Please try again later.</p>
        </div>
      </div>
    );
  }

  // Try the new bundler first
  console.log('Attempting to bundle content with mdx-bundler...');
  const bundlerResult = await bundleMDXContent(content);
  
  if (bundlerResult) {
    console.log('Using mdx-bundler renderer');
    return (
      <div className="container mx-auto px-4 py-8">
        <MDXRenderer code={bundlerResult.code} />
      </div>
    );
  }

  // Fall back to current renderer if bundler fails
  console.log('Falling back to default MDX renderer');
  return (
    <div className="container mx-auto px-4 py-8">
      <DynamicMDXComponent source={content} />
    </div>
  );
}
