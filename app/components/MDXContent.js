'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function MDXContent({ children }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Function to handle the scroll
    const handleScroll = () => {
      const hash = window.location.hash;
      if (hash) {
        // Small timeout to ensure content is rendered
        setTimeout(() => {
          const element = document.querySelector(hash);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    };

    // Handle initial load and navigation
    if (window.location.hash) {
      handleScroll();
    }

    // Add hash change listener for client-side hash changes
    window.addEventListener('hashchange', handleScroll);

    return () => {
      window.removeEventListener('hashchange', handleScroll);
    };
  }, [pathname, searchParams]); // Re-run when pathname or search params change

  return <div>{children}</div>;
}
