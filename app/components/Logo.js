'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const Logo = () => {
  const [displayText, setDisplayText] = useState('');
  
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
            i = 0; // Reset to first word to create loop
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
      <div className="text-lg font-medium m-2 flex flex-col">
        <span dangerouslySetInnerHTML={{ __html: displayText }} />
      </div>
    </Link>
  );
};

export default Logo;
