'use client';

import dynamic from 'next/dynamic';
import { useRouter, usePathname } from 'next/navigation';
import { Open_Sans } from 'next/font/google';

const openSans = Open_Sans({
  subsets: ['latin'],
  display: 'swap',
});

const SetupHeader = dynamic(() => import('./SetupHeader'), { ssr: false });

export function ClientLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const isSetupPage = pathname === '/setup';

  const handleFileSelect = (file) => {
    if (file && file.path) {
      // Remove 'app/docs/' from the beginning of the path if present
      let path = file.path.replace(/^app\/docs\//, '');
      // Remove the file extension
      path = path.replace(/\.md$/, '');
      // Ensure the path starts with a slash
      path = path.startsWith('/') ? path : `/${path}`;
      router.push(`/mainapp${path}`);
    } else {
      console.error('Invalid file selected:', file);
    }
  };

  return (
    <div className={`h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors duration-200 ${openSans.className}`}>
      {isSetupPage && (
        <header className="h-12 p-1 flex justify-end overflow-visible bg-gray-100 dark:bg-gray-800 transition-colors duration-200 border-gray-header shadow-lg z-[2000]">
          <SetupHeader />
        </header>
      )}
      <main className="flex-1 z-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
