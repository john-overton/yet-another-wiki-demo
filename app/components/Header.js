'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import UserButton from './UserButton';
import SearchComponent from './SearchComponent';
import Logo from './Logo';
import LoginModal from './LoginModal';

const Header = ({ onFileSelect, isMobile, isSidebarVisible, onToggleSidebar, isEditing }) => {
  const [mounted, setMounted] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [links, setLinks] = useState([]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [shouldCollapseLinks, setShouldCollapseLinks] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const { data: session } = useSession();
  const linksContainerRef = useRef(null);
  const linksRef = useRef(null);

  useEffect(() => {
    const loadLinks = async () => {
      try {
        const response = await fetch('/api/settings/theming');
        if (response.ok) {
          const settings = await response.json();
          setLinks(settings.links || []);
        }
      } catch (error) {
        console.error('Error loading links:', error);
      }
    };
    loadLinks();
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!linksContainerRef.current || !linksRef.current) return;

    const observer = new ResizeObserver(() => {
      if (linksContainerRef.current && linksRef.current) {
        const containerWidth = linksContainerRef.current.offsetWidth;
        const linksWidth = linksRef.current.scrollWidth;
        setShouldCollapseLinks(linksWidth > containerWidth);
      }
    });

    observer.observe(linksContainerRef.current);
    return () => observer.disconnect();
  }, [links]);

  if (!mounted) return null;

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <>
      <div className="flex items-center justify-between w-full p-1">
        <div className="flex justify-content-start items-center">
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

        <div className="hidden sm:flex flex-1 items-center justify-end ml-4">
          {/* Links Container */}
          <div ref={linksContainerRef} className="relative flex items-center mr-4">
            {shouldCollapseLinks ? (
              <div className="relative">
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  <i className="ri-menu-line text-xl"></i>
                </button>
                {showMobileMenu && (
                  <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
                    {links.map((link) => (
                      <a
                        key={link.id}
                        href={link.url}
                        title={link.hoverText}
                        className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        {link.text}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div ref={linksRef} className="flex space-x-4">
                {links.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    title={link.hoverText}
                    className="whitespace-nowrap p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    {link.text}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Search and User Controls */}
          <div className="flex items-center">
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

        {/* Mobile Menu Button */}
        <div className="sm:hidden flex-1 flex justify-center">
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-2 rounded-md hover:text-gray-600 dark:hover:text-gray-300"
          >
            <i 
              className={`ri-menu-5-line text-xl ${showMobileMenu ? 'p-1 border border-gray-200 dark:border-gray-600 bg-gray-300 dark:bg-gray-700' : ''}`}
              style={{ fontSize: '20px' }}
            ></i>
          </button>
        </div>

        {/* Mobile Right Section */}
        <div className="flex sm:hidden items-center ml-4">
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

      {/* Mobile Menu Dropdown */}
      {showMobileMenu && (
        <div className="sm:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-50">
          <div className="py-2">
            {links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                title={link.hoverText}
                className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setShowMobileMenu(false)}
              >
                {link.text}
              </a>
            ))}
          </div>
        </div>
      )}

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </>
  );
};

export default Header;
