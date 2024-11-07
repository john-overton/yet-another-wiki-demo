'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { Open_Sans } from 'next/font/google';

const openSans = Open_Sans({
  subsets: ['latin'],
  display: 'swap',
});

const SetupHeader = dynamic(() => import('./SetupHeader'), { ssr: false });

export function ClientLayout({ children }) {
  const pathname = usePathname();
  const isSetupPage = pathname === '/setup';

  return (
    <div className={`min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors duration-200 ${openSans.className}`}>
      {isSetupPage && (
        <header className="h-12 p-1 flex justify-end overflow-visible bg-gray-100 dark:bg-gray-800 transition-colors duration-200 border-gray-header shadow-lg z-[2000]">
          <SetupHeader />
        </header>
      )}
      {children}
    </div>
  );
}
