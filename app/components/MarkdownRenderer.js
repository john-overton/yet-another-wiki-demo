'use client';

import React, { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypePrismPlus from 'rehype-prism-plus';
import remarkDirective from 'remark-directive';
import { visit } from 'unist-util-visit';
import Image from 'next/image';
import Link from 'next/link';
import NavigationSection from './NavigationSection';
import '../markdown.css';

// Custom remark plugin to transform directives into admonitions
const remarkAdmonitions = () => {
  return (tree) => {
    visit(tree, (node) => {
      if (
        node.type === 'containerDirective' ||
        node.type === 'leafDirective' ||
        node.type === 'textDirective'
      ) {
        const type = node.name;
        if (['note', 'tip', 'info', 'caution', 'danger'].includes(type)) {
          const data = node.data || (node.data = {});
          const tagName = 'div';

          // Create the admonition container
          data.hName = tagName;
          data.hProperties = {
            className: `admonition admonition-${type}`
          };

          // Create the heading and content structure
          const headingNode = {
            
          };

          const contentNode = {
            type: 'element',
            tagName: 'div',
            properties: { className: 'admonition-content' },
            children: node.children || []
          };

          node.children = [headingNode, contentNode];
        }
      }
    });
  };
};

const getAdmonitionIcon = (type) => {
  const icons = {
    note: "ri-information-line",
    tip: "ri-lightbulb-flash-line",
    info: "ri-information-line",
    caution: "ri-error-warning-line",
    danger: "ri-alert-line"
  };
  return icons[type] || icons.note;
};

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const imageLoader = ({ src, width, quality }) => {
  // If it's already an API route, use it directly
  if (src.startsWith('/api/')) {
    return src;
  }
  
  // If it's a relative path, convert it to the API route
  const cleanPath = src.startsWith('/') ? src.slice(1) : src;
  return `/api/uploads/post-images/${cleanPath}?w=${width}&q=${quality || 75}`;
}

const LinkButton = ({ id }) => (
  <a href={`#${encodeURIComponent(id)}`} className="ml-2 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity z-[1000]">
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
    }, [id, text]);

    return (
      <Tag id={id} className={`${baseStyle} ${styles[level]}`} {...props}>
        {children}
        <LinkButton id={id} />
      </Tag>
    );
  };

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
        copied ? 'text-gray-300' : 'text-gray-300'
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

const MarkdownRenderer = ({ content, currentPage, pages, session }) => {
  let markdownContent = content;
  if (typeof content === 'string' && content.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(content);
      markdownContent = parsed.content || content;
    } catch (e) {
      console.warn('Failed to parse content as JSON:', e);
    }
  }

  let isFirstImage = true;

  return (
    <div className="mdx-content prose dark:prose-invert max-w-none mb-4">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkDirective, remarkAdmonitions]}
        rehypePlugins={[rehypePrismPlus]}
        components={{
          img: ({ node, ...props }) => {
            const isPriority = isFirstImage;
            isFirstImage = false;
            return (
              <Image
                {...props}
                width={1920}
                height={1080}
                style={{ maxWidth: '100%', width: 'auto', height: 'auto', margin: '1rem 0', border: '1px solid #e5e7eb' }}
                alt={props.alt || ''}
                unoptimized={true}
                priority={isPriority}
              />
            );
          },
          a: (props) => <Link className="text-blue-500 hover:underline" {...props} />,
          h1: createHeadingComponent('h1'),
          h2: createHeadingComponent('h2'),
          h3: createHeadingComponent('h3'),
          h4: createHeadingComponent('h4'),
          h5: createHeadingComponent('h5'),
          h6: createHeadingComponent('h6'),
          ul: (props) => <ul className="list-disc list-outside pl-6 mb-4" {...props} />,
          ol: (props) => <ol className="list-decimal list-outside pl-6 mb-4" {...props} />,
          li: ({ children, ordered, ...props }) => {
            // Handle both direct text and nested paragraph content
            const content = children?.type === 'p' ? children.props.children : children;
            return (
              <li className="mb-1 pl-1" {...props}>
                {content}
              </li>
            );
          },
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
              return <code className="font-mono text-sm" {...props} />;
            }
            return <code className={`language-${match ? match[1] : 'text'}`} {...props} />;
          }
        }}
      >
        {markdownContent}
      </ReactMarkdown>
      <NavigationSection 
        currentPage={currentPage} 
        pages={pages} 
        isAuthenticated={!!session} 
      />
    </div>
  );
};

export default MarkdownRenderer;
