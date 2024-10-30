'use client';

import React, { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypePrismPlus from 'rehype-prism-plus';
import Image from 'next/image';
import Link from 'next/link';
import '../markdown.css';

const imageLoader = ({ src, width, quality }) => {
  return `${src}?w=${width}&q=${quality || 75}`
}

const LinkButton = ({ id }) => (
  <a href={`#${encodeURIComponent(id)}`} className="ml-2 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
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

  const HeadingComponent = ({ children, ...props }) => {
    const text = typeof children === 'string' ? children : '';
    const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
    const Tag = level;

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            window.dispatchEvent(new CustomEvent('sectionInView', { 
              detail: { id, text }
            }));
          }
        },
        { 
          threshold: 0,
          rootMargin: '-20px 0px -80% 0px'  // This focuses on the top 20% of the viewport
        }
      );

      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }

      return () => {
        if (element) {
          observer.unobserve(element);
        }
      };
    }, [id, text]); // Added text to dependency array

    return (
      <Tag id={id} className={`${baseStyle} ${styles[level]}`} {...props}>
        {children}
        <LinkButton id={id} />
      </Tag>
    );
  };

  // Add display name to the component
  HeadingComponent.displayName = `Heading${level.toUpperCase()}`;

  return HeadingComponent;
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
      className={`text-xs uppercase tracking-wider opacity-75 hover:opacity-100 hover:text-white transition-colors ml-4 ${
        copied
          ? 'text-gray-300'
          : 'text-gray-300'
      }`}
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
};

const CodeBlock = ({ children, language }) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const code = children?.props?.children || '';

  return (
    <div className="relative not-prose">
      <div className="flex justify-between items-center bg-[#717171] dark:bg-[#1F2937] text-gray-300 px-4 py-2 rounded-t text-sm border-b border-gray-700">
        <span className="font-mono opacity-75">{language}</span>
        <div className="flex items-center">
          <CopyButton text={code} />
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hover:text-white transition-colors text-xs uppercase tracking-wider opacity-75 hover:opacity-100 ml-4"
          >
            {isCollapsed ? '▼ Show Code' : '▲ Hide Code'}
          </button>
        </div>
      </div>
      <div className={`transition-all duration-200 ${isCollapsed ? 'h-0 overflow-hidden' : ''}`}>
        {children}
      </div>
    </div>
  );
};

const MarkdownRenderer = ({ content }) => {
  // If content is a string that looks like JSON, try to parse it
  let markdownContent = content;
  if (typeof content === 'string' && content.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(content);
      markdownContent = parsed.content || content;
    } catch (e) {
      // If parsing fails, use the original content
      console.warn('Failed to parse content as JSON:', e);
    }
  }

  return (
    <div className="mdx-content prose dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypePrismPlus]}
        components={{
          img: (props) => (
            <Image
              {...props}
              loader={imageLoader}
              width={800}
              height={400}
              alt={props.alt || ''}
            />
          ),
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
              <CodeBlock language={language}>
                <pre className="relative group font-mono text-sm leading-relaxed !rounded-t-none !mt-0">
                  {children}
                </pre>
              </CodeBlock>
            );
          },
          code: ({ className, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !className;

            if (isInline) {
              return (
                <code 
                  className="font-mono text-sm"
                  {...props} 
                />
              );
            }

            return (
              <code 
                className={`language-${match ? match[1] : 'text'}`} 
                {...props} 
              />
            );
          },
        }}
      >
        {markdownContent}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
