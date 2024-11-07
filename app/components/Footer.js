'use client';

import { useState, useEffect } from 'react';

const Footer = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const mainContent = document.querySelector('main[class*="overflow-y-auto"]');
      if (mainContent) {
        const { scrollTop, scrollHeight, clientHeight } = mainContent;
        const maxScroll = scrollHeight - clientHeight;
        const threshold = 50; // pixels before bottom to start showing footer
        
        if (maxScroll > 0) {
          // Only show footer when near bottom
          const distanceFromBottom = maxScroll - scrollTop;
          const shouldShow = distanceFromBottom < threshold;
          
          if (shouldShow) {
            const progress = Math.max(0, Math.min(1, (threshold - distanceFromBottom) / threshold));
            setScrollProgress(progress);
            setIsVisible(true);
          } else {
            setIsVisible(false);
            setScrollProgress(0);
          }
        }
      }
    };

    const mainContent = document.querySelector('main[class*="overflow-y-auto"]');
    if (mainContent) {
      setIsVisible(false);
      setScrollProgress(0);
      mainContent.addEventListener('scroll', handleScroll);
      return () => mainContent.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <div 
      className="bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600 transition-all duration-300 ease-in-out overflow-hidden"
      style={{
        height: isVisible ? '23rem' : '0',
        opacity: scrollProgress,
      }}
    >
      <div className="grid grid-cols-2 h-[20rem] sm:grid-cols-2">
        {/* Left Box */}
        <div className="flex items-center justify-center py-40 sm:w-full md:w-full lg:w-full xl:w-full">
          <div className="text-6xl font-bold text-gray-800 dark:text-gray-200">
            Y.A.W.
          </div>
        </div>

        {/* Right Box */}
        <div className="flex flex-col items-center justify-center p-8 text-gray-600 dark:text-gray-400">
          <div className="font-semibold mb-4">Quick Links</div>
          <div className="flex flex-col gap-4 items-center">
            <a href="#" className="hover:text-gray-800 dark:hover:text-gray-200">Documentation</a>
            <a href="#" className="hover:text-gray-800 dark:hover:text-gray-200">Getting Started</a>
            <a href="#" className="hover:text-gray-800 dark:hover:text-gray-200">API Reference</a>
            <a href="#" className="hover:text-gray-800 dark:hover:text-gray-200">Support</a>
            <a href="#" className="hover:text-gray-800 dark:hover:text-gray-200">Community</a>
          </div>
        </div>
      </div>

      {/* Bottom Box */}
      <div className="h-12 flex items-center justify-center">
        <div className="text-xs text-gray-600 dark:text-gray-400">© 2024 - Yet Another Wiki - All Rights Reserved</div>
      </div>
    </div>
  );
};

export default Footer;
