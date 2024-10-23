'use client';

import React, { useEffect, useState } from 'react';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Link from 'next/link';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-tsx';

const CopyButton = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 bg-gray-700 text-white px-2 py-1 rounded text-sm"
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
};

const CodeBlock = ({ children, className }) => {
  const language = className ? className.replace('language-', '') : 'javascript';
  const code = children.props.children;

  return (
    <div className="relative z-10">
      <pre className={`language-${language} bg-gray-800 p-4 rounded-md overflow-x-auto mb-4`}>
        <code className={`language-${language}`}>{code}</code>
      </pre>
      <CopyButton code={code} />
    </div>
  );
};

const generateId = (text) => {
  if (typeof text !== 'string') {
    return '';
  }
  return text.toLowerCase().replace(/[^\w]/g, '-');
};

const LinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block ml-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

const getHeadingClasses = (level) => {
  switch (level) {
    case 1:
      return 'text-5xl font-bold mt-8 mb-4 group';
    case 2:
      return 'text-4xl font-bold mt-7 mb-3 group';
    case 3:
      return 'text-3xl font-bold mt-6 mb-3 group';
    case 4:
      return 'text-2xl font-bold mt-5 mb-2 group';
    case 5:
      return 'text-xl font-bold mt-4 mb-2 group';
    case 6:
      return 'text-lg font-bold mt-3 mb-2 group';
    default:
      return 'text-base font-bold mt-2 mb-1 group';
  }
};

const createHeadingComponent = (level) => {
  return ({ children, ...props }) => {
    const id = generateId(children);
    const Component = `h${level}`;

    const copyLink = () => {
      const url = `${window.location.origin}${window.location.pathname}#${id}`;
      navigator.clipboard.writeText(url);
    };

    return (
      <Component id={id} className={getHeadingClasses(level)} {...props}>
        {children}
        <a href={`#${id}`} onClick={copyLink} className="opacity-0 group-hover:opacity-100 transition-opacity">
          <LinkIcon />
        </a>
      </Component>
    );
  };
};

const components = {
  h1: createHeadingComponent(1),
  h2: createHeadingComponent(2),
  h3: createHeadingComponent(3),
  h4: createHeadingComponent(4),
  h5: createHeadingComponent(5),
  h6: createHeadingComponent(6),
  p: (props) => <p className="mb-4" {...props} />,
  a: (props) => <Link className="text-blue-500 hover:underline" {...props} />,
  ul: (props) => <ul className="list-disc list-inside mb-4" {...props} />,
  ol: (props) => <ol className="list-decimal list-inside mb-4" {...props} />,
  li: (props) => <li className="mb-1" {...props} />,
  blockquote: (props) => <blockquote className="border-l-4 border-gray-300 pl-4 italic mb-4" {...props} />,
  table: (props) => <table className="min-w-full border border-gray-300 mb-4" {...props} />,
  tr: (props) => <tr className="border-b border-gray-300" {...props} />,
  th: (props) => <th className="border border-gray-300 px-4 py-2 bg-gray-100" {...props} />,
  td: (props) => <td className="border border-gray-300 px-4 py-2" {...props} />,
  pre: CodeBlock,
  code: (props) => {
    const language = props.className ? props.className.replace('language-', '') : 'javascript';
    return (
      <code
        className={`language-${language}`}
        {...props}
      />
    );
  },
};

const MDXRenderer = ({ source }) => {
  useEffect(() => {
    Prism.highlightAll();
  }, [source]);

  return (
    <div className="mdx-content prose dark:prose-invert max-w-none">
      <MDXRemote source={source} components={components} />
    </div>
  );
};

export default React.memo(MDXRenderer);
