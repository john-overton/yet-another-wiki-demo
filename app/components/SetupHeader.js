'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import Logo from './Logo';

const SetupHeader = () => {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="flex items-center justify-between w-full p-4">
      <div className="">
        <Logo />
      </div>
      <div className="flex items-center ml-4">
        <button
          aria-label="Toggle Dark Mode"
          type="button"
          className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
          onClick={toggleTheme}
        >
          <i className={`${resolvedTheme === 'light' ? 'ri-contrast-2-line' : 'ri-sun-fill'} text-xl`} style={{ fontSize: '20px' }}></i>
        </button>
      </div>
    </div>
  );
};

export default SetupHeader;
