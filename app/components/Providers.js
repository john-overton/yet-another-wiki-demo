'use client';

import { ThemeProvider } from 'next-themes';
import { SessionProvider } from 'next-auth/react';

export function Providers({ children }) {
  return (
    <SessionProvider>
      <ThemeProvider 
        attribute="class" 
        enableSystem={true}
        storageKey="theme"
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
