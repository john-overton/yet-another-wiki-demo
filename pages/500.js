'use client';

import { useTheme } from 'next-themes';
import Header from '../app/components/Header';
import Footer from '../app/components/Footer';

export default function Custom500() {
  const { resolvedTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 h-12 p-1 flex justify-end overflow-visible bg-gray-100 dark:bg-gray-800 transition-colors duration-200 border-gray-header shadow-lg z-[2000]">
        <Header />
      </div>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center p-4 pt-16">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4 text-gray-900 dark:text-gray-100">500</h1>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Server Error</h2>
          <p className="text-lg mb-8 text-gray-700 dark:text-gray-300">
            An error occurred on the server. Please try again later.
          </p>
          <a 
            href="/" 
            className="px-4 py-2 bg-white shadow-lg dark:bg-gray-800 border border-gray-200 dark:text-white text-black hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg flex items-center gap-2 mx-auto w-fit"
          >
            <i className="ri-arrow-left-line"></i>
            Return Home
          </a>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
