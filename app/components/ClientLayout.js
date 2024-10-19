'use client';

import dynamic from 'next/dynamic';

const ThemeToggle = dynamic(() => import('./ThemeToggle'), { ssr: false });

export function ClientLayout({ children }) {
  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors duration-200">
      <header className="h-12 p-1 flex justify-end bg-gray-100 dark:bg-gray-800 transition-colors duration-200 border-gray-header">
        <ThemeToggle />
      </header>
      <main className="flex-1 z-1 overflow-scroll">
        {children}
      </main>
      <footer className="h-12 p-1 text-center bg-gray-100 dark:bg-gray-800 transition-colors duration-200 border-gray-footer">
        <p>Footer</p>
      </footer>
    </div>
  );
}
