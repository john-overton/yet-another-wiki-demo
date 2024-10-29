'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const Logo = () => {
  const [displayText, setDisplayText] = useState('Y.A.W.');
  const [isHovering, setIsHovering] = useState(false);
  const animationTimeout = useRef(null);
  const isAnimating = useRef(false);

  const animate = (forward = true) => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    const shortText = 'Y.A.W.';
    const fullText = '<u>Y</u>et <u>A</u>nother <u>W</u>iki';
    const startText = forward ? shortText : fullText;
    const endText = forward ? fullText : shortText;
    let progress = 0;
    const duration = 1000; // 1 second for full animation
    const stepTime = 50; // 50ms per step
    const steps = duration / stepTime;

    const interval = setInterval(() => {
      progress++;
      if (progress <= steps) {
        const currentLength = Math.floor((endText.length * progress) / steps);
        setDisplayText(forward 
          ? endText.slice(0, currentLength) 
          : startText.slice(0, startText.length - currentLength));
      } else {
        clearInterval(interval);
        setDisplayText(endText);
        isAnimating.current = false;

        // If this was a forward animation and we're no longer hovering,
        // queue up the reverse animation
        if (forward && !isHovering) {
          animationTimeout.current = setTimeout(() => {
            animate(false);
          }, 500); // 500ms delay before reverse animation
        }
      }
    }, stepTime);

    return () => {
      clearInterval(interval);
      if (animationTimeout.current) {
        clearTimeout(animationTimeout.current);
      }
    };
  };

  useEffect(() => {
    if (isHovering) {
      if (animationTimeout.current) {
        clearTimeout(animationTimeout.current);
      }
      animate(true);
    } else if (!isAnimating.current) {
      animationTimeout.current = setTimeout(() => {
        animate(false);
      }, 500);
    }

    return () => {
      if (animationTimeout.current) {
        clearTimeout(animationTimeout.current);
      }
    };
  }, [isHovering]);

  return (
    <Link href="/">
      <div 
        className="text-lg font-medium m-2 flex"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <span dangerouslySetInnerHTML={{ __html: displayText }} />
      </div>
    </Link>
  );
};

export default Logo;
