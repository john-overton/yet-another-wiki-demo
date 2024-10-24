'use client';

import React from 'react';
import { getMDXComponent } from 'mdx-bundler/client';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import Prism from 'prismjs';

// Core languages (order matters for dependencies)
require('prismjs/components/prism-markup');
require('prismjs/components/prism-css');
require('prismjs/components/prism-clike');
require('prismjs/components/prism-javascript');

// Markup templating must be loaded before dependent languages
require('prismjs/components/prism-markup-templating');

// Languages that depend on markup-templating
require('prismjs/components/prism-php');

// Other languages
require('prismjs/components/prism-jsx');
require('prismjs/components/prism-typescript');
require('prismjs/components/prism-tsx');
require('prismjs/components/prism-bash');
require('prismjs/components/prism-markdown');
require('prismjs/components/prism-json');
require('prismjs/components/prism-yaml');
require('prismjs/components/prism-python');
require('prismjs/components/prism-sql');
require('prismjs/components/prism-java');
require('prismjs/components/prism-scss');
require('prismjs/components/prism-ruby');
require('prismjs/components/prism-shell-session');
require('prismjs/components/prism-diff');
require('prismjs/components/prism-git');
require('prismjs/components/prism-graphql');
require('prismjs/components/prism-docker');
require('prismjs/components/prism-nginx');
require('prismjs/components/prism-xml-doc');

const CopyButton = ({ text }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`absolute right-2 top-2 px-2 py-1 rounded text-sm transition-all duration-200 ${
        copied
          ? 'bg-gray-200 text-gray-700'
          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
      }`}
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
};

const Table = ({ children }) => (
  <div className="w-full overflow-x-auto my-4 border border-gray-300 dark:border-gray-700 rounded-lg">
    <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
      {children}
    </table>
  </div>
);

const THead = ({ children }) => (
  <thead className="bg-gray-50 dark:bg-gray-800">
    {children}
  </thead>
);

const TBody = ({ children }) => (
  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
    {children}
  </tbody>
);

const TR = ({ children }) => (
  <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
    {children}
  </tr>
);

const TH = ({ children }) => (
  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-300 dark:border-gray-700">
    {children}
  </th>
);

const TD = ({ children }) => (
  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 border-b border-gray-300 dark:border-gray-700">
    {children}
  </td>
);

const LinkButton = ({ id }) => (
  <a href={`#${id}`} className="ml-2 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
    <i className="ri-links-fill"></i>
  </a>
);

const createHeadingComponent = (level) => {
  const baseStyle = "font-bold group flex items-center";
  const styles = {
    h1: "text-4xl mt-8 mb-4",
    h2: "text-3xl mt-6 mb-4",
    h3: "text-2xl mt-4 mb-2",
    h4: "text-xl mt-4 mb-2",
    h5: "text-lg mt-2 mb-1",
    h6: "text-base mt-2 mb-1"
  };

  return ({ children, ...props }) => {
    const id = typeof children === 'string' ? children.toLowerCase().replace(/\s+/g, '-') : '';
    const Tag = level;
    return (
      <Tag id={id} className={`${baseStyle} ${styles[level]}`} {...props}>
        {children}
        <LinkButton id={id} />
      </Tag>
    );
  };
};

const MDXRenderer = ({ code }) => {
  const [mdxComponent, setMdxComponent] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [mounted, setMounted] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const { theme, resolvedTheme } = useTheme();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!code) {
      setIsLoading(true);
      return;
    }
    
    try {
      const Component = getMDXComponent(code);
      setMdxComponent(() => Component);
      setError(null);
    } catch (err) {
      console.error('Error creating MDX component:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [code]);

  React.useEffect(() => {
    if (mounted && mdxComponent) {
      const timer = setTimeout(() => {
        requestAnimationFrame(() => {
          Prism.highlightAll();
        });
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [mdxComponent, mounted, resolvedTheme]); // Use resolvedTheme instead of theme

  if (!mounted) return null;

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>Error rendering content</p>
      </div>
    );
  }

  if (!mdxComponent) {
    return null;
  }

  const currentTheme = resolvedTheme || theme;

  const components = {
    a: (props) => <Link className="text-blue-500 hover:underline" {...props} />,
    p: (props) => <p className="mb-4" {...props} />,
    h1: createHeadingComponent('h1'),
    h2: createHeadingComponent('h2'),
    h3: createHeadingComponent('h3'),
    h4: createHeadingComponent('h4'),
    h5: createHeadingComponent('h5'),
    h6: createHeadingComponent('h6'),
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
    pre: ({ children }) => {
      const code = children?.props?.children || '';
      const language = children?.props?.className?.replace(/language-/, '') || 'text';
      return (
        <pre className={`p-4 rounded-md overflow-x-auto mb-4 relative group font-mono text-sm leading-relaxed ${currentTheme === 'dark' ? 'prism-one-dark' : 'prism-one-light'}`}>
          <CopyButton text={code} />
          {children}
        </pre>
      );
    },
    code: ({ className, ...props }) => {
      const match = /language-(\w+)/.exec(className || '');
      const isInline = !className;
      const language = match ? match[1] : '';

      if (isInline) {
        return (
          <code 
            className={`px-1 py-0.5 rounded font-mono text-sm ${currentTheme === 'dark' ? 'prism-one-dark' : 'prism-one-light'}`} 
            {...props} 
          />
        );
      }

      return (
        <code 
          className={`language-${language || 'text'}`} 
          {...props} 
        />
      );
    },
  };

  return (
    <div className="mdx-content prose dark:prose-invert max-w-none">
      {React.createElement(mdxComponent, { components })}
    </div>
  );
};

export default MDXRenderer;
