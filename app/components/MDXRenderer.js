'use client';

import React, { useMemo } from 'react';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getMDXComponent } from 'mdx-bundler/client';
import Link from 'next/link';

const Table = ({ children }) => (
  <div className="w-full overflow-x-auto my-4 border border-gray-300 rounded-lg">
    <table className="min-w-full divide-y divide-gray-300">
      {children}
    </table>
  </div>
);

const THead = ({ children }) => (
  <thead className="bg-gray-50">
    {children}
  </thead>
);

const TBody = ({ children }) => (
  <tbody className="bg-white divide-y divide-gray-200">
    {children}
  </tbody>
);

const TR = ({ children }) => (
  <tr className="hover:bg-gray-50">
    {children}
  </tr>
);

const TH = ({ children }) => (
  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-300">
    {children}
  </th>
);

const TD = ({ children }) => (
  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-b border-gray-300">
    {children}
  </td>
);

const components = {
  a: (props) => <Link className="text-blue-500 hover:underline" {...props} />,
  p: (props) => <p className="mb-4" {...props} />,
  h1: (props) => <h1 className="text-4xl font-bold mt-8 mb-4" {...props} />,
  h2: (props) => <h2 className="text-3xl font-bold mt-6 mb-4" {...props} />,
  h3: (props) => <h3 className="text-2xl font-bold mt-4 mb-2" {...props} />,
  h4: (props) => <h4 className="text-xl font-bold mt-4 mb-2" {...props} />,
  h5: (props) => <h5 className="text-lg font-bold mt-2 mb-1" {...props} />,
  h6: (props) => <h6 className="text-base font-bold mt-2 mb-1" {...props} />,
  ul: (props) => <ul className="list-disc list-inside mb-4" {...props} />,
  ol: (props) => <ol className="list-decimal list-inside mb-4" {...props} />,
  li: (props) => <li className="mb-1" {...props} />,
  blockquote: (props) => <blockquote className="border-l-4 border-gray-300 pl-4 italic mb-4" {...props} />,
  table: Table,
  thead: THead,
  tbody: TBody,
  tr: TR,
  th: TH,
  td: TD,
  pre: (props) => (
    <pre className="bg-gray-800 text-white p-4 rounded-md overflow-x-auto mb-4" {...props} />
  ),
  code: ({ className, ...props }) => {
    const isInline = !className;
    return isInline ? (
      <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded" {...props} />
    ) : (
      <code className={className} {...props} />
    );
  },
};

const MDXRenderer = ({ code, source }) => {
  // If code is provided, use mdx-bundler's renderer
  if (code) {
    console.log('Using mdx-bundler renderer');
    const Component = useMemo(() => {
      try {
        return getMDXComponent(code);
      } catch (error) {
        console.error('Error creating MDX component:', error);
        return null;
      }
    }, [code]);

    if (!Component) {
      console.error('Failed to create MDX component');
      return (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error rendering content</p>
        </div>
      );
    }

    return (
      <div className="mdx-content prose dark:prose-invert max-w-none">
        <Component components={components} />
      </div>
    );
  }

  // Otherwise, use the current renderer
  console.log('Using default MDX renderer');
  return (
    <div className="mdx-content prose dark:prose-invert max-w-none">
      <MDXRemote source={source} components={components} />
    </div>
  );
};

export default MDXRenderer;