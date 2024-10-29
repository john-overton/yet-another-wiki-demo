'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Sidebar from './Sidebar';
import TableOfContents from './TableOfContents';
import MDXEditor from './MDXEditor';
import MarkdownEditor from './MarkdownEditor';
import { useTheme } from 'next-themes';
import { useSession } from 'next-auth/react';
import MarkdownRenderer from './MarkdownRenderer';
import TrashBin from './TrashBin';

const MainAppLayout = () => {
  const [fileStructure, setFileStructure] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [isTocVisible, setIsTocVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isTrashBinVisible, setIsTrashBinVisible] = useState(false);
  const { theme } = useTheme();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  // Update document title when selected file changes
  useEffect(() => {
    if (selectedFile?.title) {
      document.title = `${selectedFile.title} - Yet Another Wiki`;
    } else {
      document.title = 'Yet Another Wiki';
    }
  }, [selectedFile]);

  // Handle initial hash scroll
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash && fileContent) {
      const hash = window.location.hash.substring(1); // Remove the # symbol
      const decodedHash = decodeURIComponent(hash);
      const element = document.getElementById(decodedHash);
      if (element) {
        // Force a reflow to ensure the element is rendered
        void element.offsetHeight;
        element.scrollIntoView();
      }
    }
  }, [fileContent, searchParams]);

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
    if (!path) return;
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

  const findFileBySlug = useCallback((items, slug) => {
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
  }, []);

  useEffect(() => {
    const slug = params?.slug;
    if (slug && fileStructure.length > 0) {
      const file = findFileBySlug(fileStructure, slug);
      if (file && (file.isPublic || session)) {
        setSelectedFile(file);
        loadFileContent(file.path);
        setIsTrashBinVisible(false);
      } else if (!file || (!file.isPublic && !session)) {
        router.push('/');
      }
    } else if (fileStructure.length > 0) {
      const homeFile = fileStructure.find(f => f.slug === 'home');
      if (homeFile) {
        setSelectedFile(homeFile);
        loadFileContent(homeFile.path);
        setIsTrashBinVisible(false);
      }
    }
  }, [params, fileStructure, loadFileContent, session, router, findFileBySlug]);

  const handleFileSelect = useCallback((file) => {
    if (file.isPublic || session) {
      setSelectedFile(file);
      loadFileContent(file.path);
      router.push(`/${file.slug}`, undefined, { shallow: true });
      setIsTrashBinVisible(false);
    }
  }, [router, session, loadFileContent]);

  const handleCreateNew = useCallback(async (parentPath, name, type) => {
    if (!session) return;
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
  }, [fetchFileStructure, session]);

  const handleDelete = useCallback(async (path, type) => {
    if (!session) return;
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
  }, [fetchFileStructure, selectedFile, router, session]);

  const handleRename = useCallback(async (oldPath, newName, type) => {
    if (!session) return;
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
          router.push(`/${data.newSlug}`, undefined, { shallow: true });
        }
      } else {
        console.error('Failed to rename item:', data.message);
        alert(`Failed to rename item: ${data.message}`);
      }
    } catch (error) {
      console.error('Error renaming item:', error);
      alert(`Error renaming item: ${error.message}`);
    }
  }, [fetchFileStructure, selectedFile, router, session]);

  const handleSave = useCallback(async (updatedFile) => {
    if (!session) return;
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
        router.push(`/${updatedFile.slug}`, undefined, { shallow: true });
      } else {
        console.error('Failed to update file');
      }
    } catch (error) {
      console.error('Error updating file:', error);
    }
  }, [fetchFileStructure, router, session]);

  const toggleToc = useCallback(() => {
    setIsTocVisible((prev) => !prev);
  }, []);

  const toggleEdit = useCallback(() => {
    if (session) {
      setIsEditing((prev) => !prev);
      setIsTocVisible(false);
    }
  }, [session]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarVisible((prev) => !prev);
  }, []);

  const handleTrashBinClick = useCallback(() => {
    setIsTrashBinVisible(true);
    setSelectedFile(null);
    setFileContent('');
    setIsEditing(false);
    setIsTocVisible(false);
  }, []);

  const memoizedSidebar = useMemo(() => (
    <Sidebar
      fileStructure={fileStructure}
      onSelect={handleFileSelect}
      onCreateNew={handleCreateNew}
      onDelete={handleDelete}
      onRename={handleRename}
      isAuthenticated={!!session}
      refreshFileStructure={fetchFileStructure}
      onTrashBinClick={handleTrashBinClick}
    />
  ), [fileStructure, handleFileSelect, handleCreateNew, handleDelete, handleRename, session, fetchFileStructure, handleTrashBinClick]);

  const renderEditor = () => {
    if (!selectedFile || !isEditing) return null;
    
    // Use MarkdownEditor for .md files and MDXEditor for .mdx files
    const isMarkdownFile = selectedFile.path.endsWith('.md');
    
    if (isMarkdownFile) {
      return <MarkdownEditor file={selectedFile} onSave={handleSave} />;
    } else {
      return <MDXEditor file={selectedFile} onSave={handleSave} />;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] bg-background text-foreground">
      <div className="flex flex-1 overflow-hidden relative">
        <div className={`transition-all duration-300 ease-in-out ${isSidebarVisible ? 'w-64' : 'w-0'} flex-shrink-0 z-[999] overflow-hidden`}>
          {memoizedSidebar}
        </div>
        <button
          onClick={toggleSidebar}
          className="fixed z-[998] top-24 transition-all duration-300"
          style={{
            transform: 'translateY(-55%)',
            left: isSidebarVisible ? '15.8rem' : '0'
          }}
        >
          <i 
            className={`ri-${isSidebarVisible ? 'arrow-left-line' : 'contract-right-line'} bg-white shadow-lg dark:bg-gray-800 border border-gray-200 dark:text-white text-black hover:bg-gray-300 dark:hover:bg-gray-600 pr-1 rounded-r-xl`}
            style={{ fontSize: '1.5rem', display: 'block' }}
          ></i>
        </button>
        <main className="z-[1] flex-1 bg-background-light overflow-y-auto">
          <div className="mx-auto px-6 py-8">
            {isTrashBinVisible ? (
              <TrashBin />
            ) : (
              selectedFile && !isEditing ? (
                <MarkdownRenderer content={fileContent} />
              ) : (
                renderEditor() || <div>Select a file from the sidebar</div>
              )
            )}
          </div>
          {!isEditing && !isTrashBinVisible && (
            <>
              <div className="fixed z-[1002] top-14 right-2 flex flex-col gap-4">
                {session && (
                  <button
                    onClick={toggleEdit}
                    className={`p-2 rounded-full transition-colors duration-200
                      ${theme === 'dark' 
                        ? 'bg-primary text-white' 
                        : 'text-black'}`}
                  >
                    <i 
                      className="ri-edit-2-line bg-white shadow-lg dark:bg-gray-800 border border-gray-200 dark:text-white text-black hover:bg-gray-300 dark:hover:bg-gray-600 p-1 rounded-sm"
                      style={{ fontSize: '1.5rem' }}
                    ></i>
                  </button>
                )}
                <button
                  onClick={toggleToc}
                  className={`p-2 rounded-full transition-colors duration-200
                    ${theme === 'dark' 
                      ? 'bg-primary text-white' 
                      : 'text-black'}`}
                >
                  <i 
                    className={`ri-${isTocVisible 
                      ? 'arrow-right-double-line border shadow-lg border-gray-200 text-white hover:bg-gray-600 p-1 rounded-sm' 
                      : 'list-unordered bg-white shadow-lg border border-gray-200 dark:text-white dark:bg-gray-800 text-black hover:bg-gray-300 dark:hover:bg-gray-600 p-1 rounded-sm'}`}
                    style={{ fontSize: '1.5rem' }}
                  ></i>
                </button>
              </div>
              <div className={`fixed z-[1001] right-0 transition-transform duration-300 ease-in-out ${isTocVisible ? 'translate-x-0' : 'translate-x-full'}`} style={{ top: session ? '7.5rem' : '3rem' }}>
                <TableOfContents source={fileContent} isVisible={isTocVisible} />
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default React.memo(MainAppLayout);
