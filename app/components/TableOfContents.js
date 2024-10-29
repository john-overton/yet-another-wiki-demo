'use client';

import React, { useEffect, useState } from 'react';

const generateId = (text) => {
  return text.toLowerCase().replace(/[^\w]+/g, '-');
};

const TableOfContents = ({ source, isVisible }) => {
  const [toc, setToc] = useState([]);
  const [activeSection, setActiveSection] = useState('');

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

  useEffect(() => {
    const handleSectionInView = (event) => {
      setActiveSection(event.detail.id);
    };

    window.addEventListener('sectionInView', handleSectionInView);

    return () => {
      window.removeEventListener('sectionInView', handleSectionInView);
    };
  }, []);

  return (
    <div className={`p-4 mt-2 mr-2 border border-gray-200 dark:border-gray-700 table-of-contents text-white rounded-lg shadow-lg ${isVisible ? 'block' : 'hidden'}`}>
      <h3 className="text-lg font-bold mb-4 text-foreground">Page Contents</h3>
      <ul className="space-y-2">
        {toc.map((item, index) => (
          <li key={index} style={{ paddingLeft: `${(item.level - 1) * 0.5}rem` }}>
            <a 
              href={`#${item.id}`} 
              className={`hover:text-primary text-sm transition-colors duration-200 ${
                activeSection === item.id 
                  ? 'underline underline-offset-4 text-foreground' 
                  : 'text-foreground'
              }`}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TableOfContents;
