'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import UserButton from './UserButton';

const ThemeToggle = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="flex items-center">
      {session ? (
        <UserButton user={session.user} />
      ) : (
        <Link href="/login">
          <button
            aria-label="Login"
            type="button"
            className="p-2 mr-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            Login
          </button>
        </Link>
      )}
      <button
        aria-label="Toggle Dark Mode"
        type="button"
        className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
        onClick={toggleTheme}
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>
    </div>
  );
};

export default ThemeToggle;
