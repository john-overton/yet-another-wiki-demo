'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import UserButton from './UserButton';
import SearchComponent from './SearchComponent';

const Header = ({ onFileSelect }) => {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const { data: session } = useSession();

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="flex items-center justify-between w-full p-4">
      <div className="">
        <Link href="/">
          <Image src="/images/YAW-Solo.png" alt="Logo" width={80} height={40} className="rounded-sm m-2 shadow-lg border"/>
        </Link>
      </div>
      <div className="flex items-center ml-4">
        <div className="mr-2">
          <SearchComponent />
        </div>
        {session ? (
          <UserButton user={session.user} />
        ) : (
          <Link href="/login">
            <button
              aria-label="Login"
              type="button"
              className="p-2 mr-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 "
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
          <i className={`${resolvedTheme === 'light' ? 'ri-contrast-2-line' : 'ri-sun-fill'} text-xl`} style={{ fontSize: '20px' }}></i>
        </button>
      </div>
    </div>
  );
};

export default Header;
