'use client'

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from './Sidebar';
import TableOfContents from './TableOfContents';
import MDXEditor from './MDXEditor';
import { useTheme } from 'next-themes';

const MDXRenderer = dynamic(() => import('./MDXRenderer'), { ssr: false });

const MainAppLayout = () => {
  const [fileStructure, setFileStructure] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [isTocVisible, setIsTocVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { theme } = useTheme();
  const router = useRouter();
  const params = useParams();

  const fetchFileStructure = useCallback(async () => {
    try {
      const response = await fetch('/api/file-structure');
      const data = await response.json();
      setFileStructure(data.pages);
    } catch (error) {
      console.error('Error fetching file structure:', error);
    }
  }, []);

  const loadFileContent = useCallback(async (path) => {
    try {
      const response = await fetch(`/api/file-content?path=${encodeURIComponent(path)}`);
      const content = await response.text();
      setFileContent(content);
    } catch (error) {
      console.error('Error loading file content:', error);
      setFileContent('Error loading file content');
    }
  }, []);

  useEffect(() => {
    fetchFileStructure();
  }, [fetchFileStructure]);

  useEffect(() => {
    const slug = params?.slug;
    if (slug) {
      const file = findFileBySlug(fileStructure, slug);
      if (file) {
        setSelectedFile(file);
        loadFileContent(file.path);
      }
    } else {
      const homeFile = fileStructure.find(f => f.slug === 'home');
      if (homeFile) {
        setSelectedFile(homeFile);
        loadFileContent(homeFile.path);
      }
    }
  }, [params, fileStructure, loadFileContent]);

  const findFileBySlug = (items, slug) => {
    for (const item of items) {
      if (item.slug === slug) {
        return item;
      }
      if (item.children) {
        const found = findFileBySlug(item.children, slug);
        if (found) {
          return found;
        }
      }
    }
    return null;
  };

  const handleFileSelect = useCallback((file) => {
    router.push(`/${file.slug}`);
  }, [router]);

  const handleCreateNew = useCallback(async (parentPath, name, type) => {
    try {
      const response = await fetch('/api/create-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentPath, name, type }),
      });
      if (response.ok) {
        await fetchFileStructure();
      } else {
        console.error('Failed to create new item');
      }
    } catch (error) {
      console.error('Error creating new item:', error);
    }
  }, [fetchFileStructure]);

  const handleDelete = useCallback(async (path, type) => {
    try {
      const response = await fetch('/api/delete-item', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, type }),
      });
      if (response.ok) {
        await fetchFileStructure();
        if (selectedFile && selectedFile.path === path) {
          router.push('/');
        }
      } else {
        console.error('Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  }, [fetchFileStructure, selectedFile, router]);

  const handleRename = useCallback(async (oldPath, newName, type) => {
    try {
      const response = await fetch('/api/rename-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPath, newName, type }),
      });
      const data = await response.json();
      if (response.ok) {
        await fetchFileStructure();
        if (selectedFile && selectedFile.path === oldPath) {
          router.push(`/${data.newSlug}`);
        }
      } else {
        console.error('Failed to rename item:', data.message);
        alert(`Failed to rename item: ${data.message}`);
      }
    } catch (error) {
      console.error('Error renaming item:', error);
      alert(`Error renaming item: ${error.message}`);
    }
  }, [fetchFileStructure, selectedFile, router]);

  const handleSave = useCallback(async (updatedFile) => {
    try {
      const response = await fetch('/api/update-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFile),
      });
      if (response.ok) {
        setSelectedFile(updatedFile);
        setIsEditing(false);
        await fetchFileStructure();
        router.push(`/${updatedFile.slug}`);
      } else {
        console.error('Failed to update file');
      }
    } catch (error) {
      console.error('Error updating file:', error);
    }
  }, [fetchFileStructure, router]);

  const toggleToc = useCallback(() => {
    setIsTocVisible((prev) => !prev);
  }, []);

  const toggleEdit = useCallback(() => {
    setIsEditing((prev) => !prev);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 flex-shrink-0 z-[999]">
          <Sidebar
            fileStructure={fileStructure}
            onSelect={handleFileSelect}
            onCreateNew={handleCreateNew}
            onDelete={handleDelete}
            onRename={handleRename}
          />
        </div>
        <main className="z-[1] flex-1 bg-background-light overflow-y-auto">
          <div className="mx-auto px-6 py-8">
            {selectedFile && !isEditing ? (
              <>
                <button
                  onClick={toggleEdit}
                  className="mb-4 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Edit
                </button>
                <MDXRenderer source={fileContent} />
              </>
            ) : selectedFile && isEditing ? (
              <MDXEditor file={selectedFile} onSave={handleSave} />
            ) : (
              <div>Select a file from the sidebar</div>
            )}
          </div>
          <div className={`fixed z-[1001] top-12 right-0 transition-transform duration-300 ease-in-out ${isTocVisible ? 'translate-x-0' : 'translate-x-full'}`}>
            <TableOfContents source={fileContent} isVisible={isTocVisible} />
          </div>
          <button
            onClick={toggleToc}
            className={`fixed z-[1002] top-14 right-2 p-2 rounded-full transition-colors duration-200
              ${theme === 'dark' 
                ? 'bg-primary text-white' 
                : 'text-black'}`}
          >
            <i className={`ri-${isTocVisible ? 'arrow-right-double-line text-white hover:bg-gray-600 p-1 rounded-sm' : 'list-unordered bg-white border border-gray-200 shadow-sm dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-400 p-1 rounded-sm'}`}></i>
          </button>
        </main>
      </div>
    </div>
  );
};

export default React.memo(MainAppLayout);
