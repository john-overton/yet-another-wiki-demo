'use client';

import React from 'react';
import { Editable, useEditor } from "@wysimark/react";
import { Open_Sans } from 'next/font/google';
import { useTheme } from 'next-themes';
import '../wysimark.css';

const openSans = Open_Sans({
  subsets: ['latin'],
  display: 'swap',
});

const WysimarkWrapper = ({ value, onChange, onUpload, style, className }) => {
  const { resolvedTheme } = useTheme();

  const editor = useEditor({
    minHeight: 'calc(100vh - 300px)',
    onUpload,
    style: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: openSans.style.fontFamily,
      ...style
    },
    darkMode: resolvedTheme === 'dark',
    // Explicitly define supported languages with their display names
    codeBlockLanguages: {
      javascript: 'JavaScript',
      typescript: 'TypeScript',
      jsx: 'JSX',
      tsx: 'TSX',
      html: 'HTML',
      css: 'CSS',
      json: 'JSON',
      markdown: 'Markdown',
      python: 'Python',
      bash: 'Bash',
      sql: 'SQL',
      yaml: 'YAML',
      text: 'Plain Text'
    }
  });

  return (
    <Editable
      editor={editor}
      value={value}
      onChange={onChange}
      throttleInMs={1000}
      placeholder="Start writing..."
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
      className={`${className} ${openSans.className}`}
    />
  );
};

export default WysimarkWrapper;
