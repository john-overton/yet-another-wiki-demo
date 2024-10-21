'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import UserButton from './UserButton';
import SearchComponent from './SearchComponent';

const Header = ({ onFileSelect }) => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="flex items-center justify-between w-full p-4">
      <div className="m-2">
      </div>
      <div className="flex items-center ml-4">
      <div className="m-2">
        <SearchComponent />
      </div>
        {session ? (
          <UserButton user={session.user} />
        ) : (
          <Link href="/login">
            <button
              aria-label="Login"
              type="button"
              className="p-3 m-3 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              Login
            </button>
          </Link>
        )}
        <button
          aria-label="Toggle Dark Mode"
          type="button"
          className="p-2 rounded-md hover:bg-gray-200 hover:rot-15 dark:hover:bg-gray-700"
          onClick={toggleTheme}
        >
          <i className={`${theme === 'light' ? 'ri-contrast-2-line' : 'ri-sun-fill'} text-xl`} style={{ fontSize: '20px' }}></i>
        </button>
      </div>
    </div>
  );
};

export default Header;
