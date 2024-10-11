"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('./EditorComponent'), { ssr: false });

const MDXEditorPage = () => {
  const [markdown, setMarkdown] = useState('# Welcome to MDX Editor\n\nStart typing your content here...');

  const handleMarkdownChange = (newMarkdown: string) => {
    setMarkdown(newMarkdown);
    // Here you can add logic to save the markdown content
    console.log('Markdown updated:', newMarkdown);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">MDX Editor</h1>
      <Editor markdown={markdown} onChange={handleMarkdownChange} />
    </div>
  );
};

export default MDXEditorPage;
