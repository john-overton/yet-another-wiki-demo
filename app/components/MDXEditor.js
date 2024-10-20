'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const MDXRenderer = dynamic(() => import('./MDXRenderer'), { ssr: false });

const MDXEditor = ({ file, onSave }) => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState(file.title);
  const [isPublic, setIsPublic] = useState(file.isPublic);
  const [slug, setSlug] = useState(file.slug);
  const [isFolder, setIsFolder] = useState(!!file.children);
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(`/api/file-content?path=${encodeURIComponent(file.path)}`);
        const fileContent = await response.text();
        setContent(fileContent);
      } catch (error) {
        console.error('Error fetching file content:', error);
      }
    };
    if (!isFolder) {
      fetchContent();
    }
  }, [file.path, isFolder]);

  const handleSave = async () => {
    try {
      const response = await fetch('/api/update-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: file.path,
          content,
          title,
          isPublic,
          slug,
          isFolder,
        }),
      });
      if (response.ok) {
        onSave({ ...file, title, isPublic, slug, children: isFolder ? [] : undefined });
      } else {
        console.error('Failed to save file');
      }
    } catch (error) {
      console.error('Error saving file:', error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-2xl font-bold bg-transparent border-none focus:outline-none"
        />
        <div className="flex items-center">
          <label className="mr-2">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="mr-1"
            />
            Public
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="mr-2 px-2 py-1 border rounded"
            placeholder="URL slug"
          />
          <label className="mr-2">
            <input
              type="checkbox"
              checked={isFolder}
              onChange={(e) => setIsFolder(e.target.checked)}
              className="mr-1"
            />
            Folder
          </label>
          {!isFolder && (
            <button
              onClick={() => setIsPreview(!isPreview)}
              className="mr-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {isPreview ? 'Edit' : 'Preview'}
            </button>
          )}
          <button
            onClick={handleSave}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Save
          </button>
        </div>
      </div>
      {!isFolder && (
        isPreview ? (
          <div className="flex-grow overflow-auto">
            <MDXRenderer source={content} />
          </div>
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-grow p-2 bg-gray-100 dark:bg-gray-800 rounded"
          />
        )
      )}
      {isFolder && (
        <div className="flex-grow p-2 bg-gray-100 dark:bg-gray-800 rounded">
          This is a folder. You can add files and subfolders to it using the sidebar.
        </div>
      )}
    </div>
  );
};

export default MDXEditor;
