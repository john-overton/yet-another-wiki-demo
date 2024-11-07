'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import UserButton from './UserButton';
import SearchComponent from './SearchComponent';
import Logo from './Logo';
import LoginModal from './LoginModal';

const Header = ({ onFileSelect, isMobile, isSidebarVisible, onToggleSidebar, isEditing }) => {
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
      <div className="flex items-center justify-between w-full p-1">
        <div className="flex justify-content-start">
          {isMobile && !isEditing && (
            <button
              onClick={onToggleSidebar}
              aria-label="Toggle Sidebar"
              type="button"
              className="mr-2 text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300"
            >
              <i 
                className={`ri-menu-2-line text-xl ${isSidebarVisible ? 'p-1 border border-gray-200 dark:border-gray-600 bg-gray-300 dark:bg-gray-700 text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300' : ''}`}
                style={{ fontSize: '20px' }}
              ></i>
            </button>
          )}
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
            className="p-2 text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300"
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
