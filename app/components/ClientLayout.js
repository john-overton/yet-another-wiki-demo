'use client';

import dynamic from 'next/dynamic';

const ThemeToggle = dynamic(() => import('./ThemeToggle'), { ssr: false });

export function ClientLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors duration-200">
      <header className="p-1 flex justify-end bg-gray-100 dark:bg-gray-800 transition-colors duration-200">
        <ThemeToggle />
      </header>
      <main className="flex-grow overflow-auto">
        {children}
      </main>
      <footer className="mt-auto p-1 text-center bg-gray-100 dark:bg-gray-800 transition-colors duration-200">
        <p>Footer</p>
      </footer>
    </div>
  );
}
