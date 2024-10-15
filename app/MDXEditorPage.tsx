"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('./EditorComponent'), { ssr: false });

interface MDXEditorPageProps {
  initialContent: string;
  onSave: (content: string) => void;
}

const MDXEditorPage: React.FC<MDXEditorPageProps> = ({ initialContent, onSave }) => {
  const [markdown, setMarkdown] = useState(initialContent);

  const handleMarkdownChange = (newMarkdown: string) => {
    setMarkdown(newMarkdown);
  };

  const handleSave = () => {
    onSave(markdown);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">MDX Editor</h1>
      <Editor markdown={markdown} onChange={handleMarkdownChange} />
      <button onClick={handleSave} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">Save</button>
    </div>
  );
};

export default MDXEditorPage;
