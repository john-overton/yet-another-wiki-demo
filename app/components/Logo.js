'use client';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import './logo.css';

const Logo = () => {
  const [displayText, setDisplayText] = useState('');
  const { resolvedTheme } = useTheme();
  
  const words = [
    'Y.A.W.',
    '<u>Y</u>et <u>A</u>nother <u>W</u>iki',
    'Markdown, minus complexity',
    '<i>Pages bloom like spring</i>',
    '<i>No code needed to flourish</i>',
    '<i>Just write and inspire</i>',
    'Another Wiki? Obviously.',
    'The last wiki, I promise...'
  ];

  useEffect(() => {
    let i = 0;
    let offset = 0;
    let forwards = true;
    let skipCount = 0;
    const skipDelay = 30;
    const speed = 70;

    const wordflick = setInterval(() => {
      if (forwards) {
        if (offset >= words[i].length) {
          ++skipCount;
          if (skipCount === skipDelay) {
            forwards = false;
            skipCount = 0;
          }
        }
      } else {
        if (offset === 0) {
          forwards = true;
          i++;
          offset = 0;
          if (i >= words.length) {
            i = 0;
          }
        }
      }

      const part = words[i].substr(0, offset);
      if (skipCount === 0) {
        if (forwards) {
          offset++;
        } else {
          offset--;
        }
      }
      setDisplayText(part);
    }, speed);

    return () => clearInterval(wordflick);
  }, []);

  return (
    <Link href="/">
      <div className="text-lg font-medium m-2">
        <div className={`console-text text-sm inline-flex items-center ${resolvedTheme === 'dark' ? 'console-text-dark' : 'console-text-light'}`}>
        <span className="mr-2">{'wikis\\yaw>'}</span>
          <span className="text-gray-100" dangerouslySetInnerHTML={{ __html: displayText }} />
          <span className="animate-blink text-gray-100">_</span>
        </div>
      </div>
    </Link>
  );
};

export default Logo;
