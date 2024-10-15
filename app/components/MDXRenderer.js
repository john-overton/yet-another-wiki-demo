'use client';

import { useEffect, useState } from 'react';
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
    <div className="relative">
      <pre className={`language-${language} bg-gray-800 p-4 rounded-md overflow-x-auto mb-4`}>
        <code className={`language-${language}`}>{code}</code>
      </pre>
      <CopyButton code={code} />
    </div>
  );
};

const components = {
  h1: (props) => <h1 className="text-3xl font-bold mt-8 mb-4" {...props} />,
  h2: (props) => <h2 className="text-2xl font-bold mt-6 mb-3" {...props} />,
  h3: (props) => <h3 className="text-xl font-bold mt-4 mb-2" {...props} />,
  h4: (props) => <h4 className="text-lg font-bold mt-3 mb-2" {...props} />,
  h5: (props) => <h5 className="text-base font-bold mt-2 mb-1" {...props} />,
  h6: (props) => <h6 className="text-sm font-bold mt-2 mb-1" {...props} />,
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

export default MDXRenderer;
