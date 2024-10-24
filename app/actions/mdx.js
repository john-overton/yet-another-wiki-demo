'use server';

import path from 'path';
import { bundleMDX } from 'mdx-bundler';
import remarkGfm from 'remark-gfm';

export async function bundleMDXContent(source) {
  try {
    console.log('Starting MDX bundling...');
    
    // Set esbuild binary path
    if (process.platform === 'win32') {
      process.env.ESBUILD_BINARY_PATH = path.join(
        process.cwd(),
        'node_modules',
        'esbuild',
        'esbuild.exe',
      );
    } else {
      process.env.ESBUILD_BINARY_PATH = path.join(
        process.cwd(),
        'node_modules',
        'esbuild',
        'bin',
        'esbuild',
      );
    }

    const { code, frontmatter } = await bundleMDX({
      source,
      mdxOptions(options) {
        options.remarkPlugins = [...(options.remarkPlugins ?? []), remarkGfm];
        return options;
      },
      esbuildOptions(options) {
        options.target = ['es2020'];
        options.platform = 'node';
        options.logLevel = 'info'; // Add logging for debugging
        return options;
      }
    });

    console.log('MDX bundling successful');
    return { code, frontmatter };
  } catch (error) {
    console.error('Error bundling MDX:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return null;
  }
}
