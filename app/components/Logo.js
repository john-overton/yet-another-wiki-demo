'use client';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import '../logo.css';

// Move words array outside component since it's constant
const LOGO_WORDS = [
  'Y.A.W.',
  '<u>Y</u>et <u>A</u>nother <u>W</u>iki',
  'Markdown, minus complexity',
  'Another Wiki? Obviously.',
  'The last wiki, I promise.'
];

const Logo = () => {
  const [displayText, setDisplayText] = useState('');
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const checkWidth = () => {
      setIsSmallScreen(window.innerWidth < 680);
    };

    // Initial check
    checkWidth();

    // Add resize listener
    window.addEventListener('resize', checkWidth);

    // Cleanup
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  useEffect(() => {
    if (isSmallScreen) {
      setDisplayText('');
      return;
    }

    let i = 0;
    let offset = 0;
    let forwards = true;
    let skipCount = 0;
    const skipDelay = 30;
    const speed = 70;

    const wordflick = setInterval(() => {
      if (forwards) {
        if (offset >= LOGO_WORDS[i].length) {
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
          if (i >= LOGO_WORDS.length) {
            i = 0;
          }
        }
      }

      const part = LOGO_WORDS[i].substr(0, offset);
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
  }, [isSmallScreen]); // Now LOGO_WORDS is not needed in deps as it's constant

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
