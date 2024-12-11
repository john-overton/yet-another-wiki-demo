'use client';

import React, { useEffect, useState, useRef } from 'react';

const generateId = (text) => {
  return text.toLowerCase().replace(/[^\w]+/g, '-');
};

const TableOfContents = ({ source, isVisible }) => {
  const [toc, setToc] = useState([]);
  const [activeSection, setActiveSection] = useState('');
  const [maxHeight, setMaxHeight] = useState('calc(100vh - 8rem)');
  const tocRef = useRef(null);

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

  useEffect(() => {
    const updateMaxHeight = () => {
      if (tocRef.current) {
        const mainContainer = document.querySelector('main');
        if (mainContainer) {
          const mainRect = mainContainer.getBoundingClientRect();
          const tocRect = tocRef.current.getBoundingClientRect();
          const topOffset = tocRect.top;
          const availableHeight = (mainRect.bottom - topOffset) - 5;
          setMaxHeight(`${availableHeight}px`);
        }
      }
    };

    updateMaxHeight();
    window.addEventListener('resize', updateMaxHeight);
    return () => window.removeEventListener('resize', updateMaxHeight);
  }, [isVisible]);

  return (
    <div 
      ref={tocRef}
      className={`p-4 mt-1 mr-1 border table-of-contents text-white rounded-lg ${isVisible ? 'block' : 'hidden'}`}
      style={{
        maxHeight,
        overflowY: 'auto',
        position: 'sticky',
        top: '7rem'
      }}
    >
      <h3 className="text-lg font-bold mb-4 text-foreground">On This Page</h3>
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
