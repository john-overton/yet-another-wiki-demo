import './globals.css'
import './markdown.css'
import './mdxeditor.css'
import './logo.css'
import 'remixicon/fonts/remixicon.css'
import { Providers } from './components/Providers'
import { Open_Sans } from 'next/font/google';

const openSans = Open_Sans({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: 'Yet Another Wiki',
  description: 'A simple wiki for your needs',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors duration-200 ${openSans.className}`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
