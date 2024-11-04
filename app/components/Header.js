'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import UserButton from './UserButton';
import SearchComponent from './SearchComponent';
import Logo from './Logo';
import LoginModal from './LoginModal';

const Header = ({ onFileSelect }) => {
  const [mounted, setMounted] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const { data: session } = useSession();

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <>
      <div className="flex items-center justify-between w-full p-4">
        <div className="">
          <Logo />
        </div>
        <div className="flex items-center ml-4">
          <div className="mr-2">
            <SearchComponent />
          </div>
          {session ? (
            <UserButton user={session.user} />
          ) : (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              aria-label="Login"
              type="button"
              className="p-2 mr-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              Login
            </button>
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
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </>
  );
};

export default Header;