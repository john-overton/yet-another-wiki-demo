'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MdEditor } from 'md-editor-rt';
import 'md-editor-rt/lib/style.css';
import '../mdeditor.css';
import { useTheme } from 'next-themes';

const MarkdownEditor = ({ file, onSave }) => {
  const { theme } = useTheme();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState(file.title);
  const [isPublic, setIsPublic] = useState(file.isPublic);
  const [slug, setSlug] = useState(file.slug);
  const [version, setVersion] = useState(file.version || 1);
  const [errorMessage, setErrorMessage] = useState('');
  const [mounted, setMounted] = useState(false);
  const [editorId] = useState(`editor-${Math.random().toString(36).substring(7)}`);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchContent = async () => {
      try {
        const response = await fetch(`/api/file-content?path=${encodeURIComponent(file.path)}`);
        const fileContent = await response.text();
        if (fileContent) {
          setContent(fileContent);
        }
      } catch (error) {
        console.error('Error fetching file content:', error);
        setErrorMessage('Failed to fetch file content. Please try again.');
      }
    };
    fetchContent();
  }, [file.path, mounted]);

  const handleSave = async () => {
    try {
      if (!content || content.trim() === '') {
        setErrorMessage('Cannot save empty content');
        return;
      }

      const response = await fetch('/api/update-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: file.path,
          content: content,
          title: title || file.title,
          isPublic,
          slug: slug || file.slug,
          version,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save file');
      }

      const updatedFile = { ...file, title, isPublic, slug, version };
      onSave(updatedFile);
      setVersion(prevVersion => prevVersion + 1);
      setErrorMessage('');
    } catch (error) {
      console.error('Error saving file:', error);
      setErrorMessage(`An error occurred while saving the file: ${error.message}`);
    }
  };

  const onUploadImg = useCallback(async (files, callback) => {
    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error('Failed to upload image');
        }

        const data = await response.json();
        return {
          url: data.url,
          alt: file.name,
          title: file.name
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      callback(uploadedFiles);
    } catch (error) {
      console.error('Error uploading images:', error);
      setErrorMessage('Failed to upload images. Please try again.');
    }
  }, []);

  const onError = useCallback((err) => {
    console.error('Editor error:', err);
    setErrorMessage(`Editor error: ${err.message}`);
  }, []);

  if (!mounted) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Page Title</label>
          <input
            type="text"
            value={title || ''}
            onChange={(e) => setTitle(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">URL Slug</label>
          <input
            type="text"
            value={slug || ''}
            onChange={(e) => setSlug(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Public</span>
            </label>
          </div>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-300 dark:hover:bg-gray-600"
            style={{ fontSize: '1.5rem' }}
            title="Save"
          >
            <i className="ri-save-line"></i>
          </button>
        </div>
      </div>
      {errorMessage && (
        <div className="text-red-500 mb-4">{errorMessage}</div>
      )}
      <div className="flex-grow" style={{ minHeight: 'calc(100vh - 300px)' }}>
        <MdEditor
          editorId={editorId}
          modelValue={content}
          onChange={setContent}
          language="en-US"
          theme={theme === 'dark' ? 'dark' : 'light'}
          previewTheme='github'
          onSave={handleSave}
          onUploadImg={onUploadImg}
          onError={onError}
          previewOnly={false}
          showCodeRowNumber={true}
          autoFocus={false}
          noMacButtons={true}
          showCodeBlockLang={true}
          toolbars={[
            'bold', 'underline', 'italic', '-',
            'strikeThrough', 'title', 'sub', 'sup',
            'quote', 'unorderedList', 'orderedList',
            'task', '-', 'codeRow', 'code', 'link',
            'image', 'table', '-', 'revoke', 'next',
            'save', '=', 'pageFullscreen', 'fullscreen',
            'preview', 'htmlPreview', 'catalog'
          ]}
          style={{
            height: '100%',
            borderRadius: '6px',
          }}
          preview={{
            theme: 'github',
            hljs: {
              lineNumbers: true
            }
          }}
          defToolbars={[]}
          formatCopiedText={(text) => text}
          inputBoxWitdh="50%"
          scrollAuto={true}
        />
      </div>
    </div>
  );
};

export default MarkdownEditor;
