'use client';

import React, { useEffect, useState } from 'react';

const generateId = (text) => {
  return text.toLowerCase().replace(/[^\w]+/g, '-');
};

const TableOfContents = ({ source }) => {
  const [toc, setToc] = useState([]);

  useEffect(() => {
    const headings = source.match(/^#{1,4} .+$/gm) || [];
    const tocItems = headings.map(heading => {
      const level = heading.match(/^#+/)[0].length;
      const text = heading.replace(/^#+\s/, '');
      const id = generateId(text);
      return { level, text, id };
    });
    setToc(tocItems);
  }, [source]);

  return (
    <div className="table-of-contents fixed top-4 right-4 bg-gray-800 bg-opacity-50 p-4 rounded-lg max-w-xs max-h-[80vh] overflow-y-auto z-50 border border-gray-600 dark:border-gray-400 shadow-lg">
      <h3 className="text-lg font-bold mb-2 text-white text-right">Page Contents</h3>
      <ul className="space-y-1">
        {toc.map((item, index) => (
          <li key={index} className="text-right" style={{ paddingRight: `${(item.level - 1) * 0.5}rem` }}>
            <a href={`#${item.id}`} className="text-white hover:underline">
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TableOfContents;