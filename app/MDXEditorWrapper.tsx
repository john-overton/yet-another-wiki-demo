"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';

const MDXEditorPage = dynamic(() => import('./MDXEditorPage'), { ssr: false });

interface MDXEditorWrapperProps {
  initialContent: string;
}

const MDXEditorWrapper: React.FC<MDXEditorWrapperProps> = ({ initialContent }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(initialContent);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = (newContent: string) => {
    setContent(newContent);
    setIsEditing(false);
    // Here you would typically save the content to a database or file
    console.log('Content saved:', newContent);
  };

  return (
    <div>
      {!isEditing ? (
        <div>
          <div dangerouslySetInnerHTML={{ __html: content }} />
          <button onClick={handleEdit}>Edit</button>
        </div>
      ) : (
        <MDXEditorPage initialContent={content} onSave={handleSave} />
      )}
    </div>
  );
};

export default MDXEditorWrapper;