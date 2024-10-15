'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';

const MDXRenderer = dynamic(() => import('./MDXRenderer'), { ssr: false });

const FileItem = ({ item, onSelect, onCreateNew, level = 0 }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemType, setNewItemType] = useState('file');

  const handleCreateNew = (type) => {
    setNewItemType(type);
    setIsCreating(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalName = newItemType === 'file' ? `${newItemName}.mdx` : newItemName;
    onCreateNew(item.path, finalName, newItemType);
    setIsCreating(false);
    setNewItemName('');
  };

  if (item.type !== 'folder' && !item.name.endsWith('.mdx')) {
    return null;
  }

  return (
    <div 
      style={{ marginLeft: `${level * 20}px` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="py-1"
    >
      <div className="flex items-center">
        <span 
          onClick={() => item.type !== 'folder' && onSelect(item)} 
          className={`cursor-pointer ${item.type === 'folder' ? 'font-semibold border-b border-gray-300' : ''}`}
        >
          {item.name.replace('.mdx', '')}
        </span>
        {item.type === 'folder' && isHovered && (
          <div className="relative ml-2">
            <button 
              onClick={() => setIsCreating(!isCreating)}
              className="text-gray-500 hover:text-gray-700"
            >
              +
            </button>
            {isCreating && (
              <div className="absolute left-0 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                  <button
                    onClick={() => handleCreateNew('file')}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    New File
                  </button>
                  <button
                    onClick={() => handleCreateNew('folder')}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    New Folder
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {isCreating && (
        <form onSubmit={handleSubmit} className="mt-1">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder={`New ${newItemType} name`}
            className="border rounded px-2 py-1 text-sm"
          />
          <button type="submit" className="ml-2 bg-blue-500 text-white rounded px-2 py-1 text-sm">Create</button>
        </form>
      )}
      {item.type === 'folder' && item.children.map((child, index) => (
        <FileItem key={index} item={child} onSelect={onSelect} onCreateNew={onCreateNew} level={level + 1} />
      ))}
    </div>
  );
};

const MainAppLayout = () => {
  const [fileStructure, setFileStructure] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const { theme } = useTheme();

  useEffect(() => {
    fetchFileStructure();
  }, []);

  const fetchFileStructure = async () => {
    try {
      const response = await fetch('/api/file-structure');
      const data = await response.json();
      setFileStructure(data);
    } catch (error) {
      console.error('Error fetching file structure:', error);
    }
  };

  const handleFileSelect = async (file) => {
    setSelectedFile(file);
    if (file && file.path) {
      try {
        const response = await fetch(`/api/file-content?path=${encodeURIComponent(file.path)}`);
        const content = await response.text();
        setFileContent(content);
      } catch (error) {
        console.error('Error fetching file content:', error);
        setFileContent('Error loading file content');
      }
    }
  };

  const handleCreateNew = async (parentPath, name, type) => {
    console.log('Attempting to create new item:', { parentPath, name, type });
    try {
      const response = await fetch('/api/create-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentPath, name, type }),
      });
      console.log('API response status:', response.status);
      const responseText = await response.text();
      console.log('API response text:', responseText);
      if (response.ok) {
        console.log('Item created successfully, refreshing file structure');
        await fetchFileStructure();
      } else {
        console.error('Failed to create new item');
      }
    } catch (error) {
      console.error('Error creating new item:', error);
    }
  };

  return (
    <div className="flex h-full">
      <div className="w-1/5 h-full overflow-auto p-4 main-app-div main-app-div-left">
        <h2 className="text-lg font-semibold mb-4">Contents</h2>
        {fileStructure.map((item, index) => (
          <FileItem key={index} item={item} onSelect={handleFileSelect} onCreateNew={handleCreateNew} />
        ))}
      </div>
      <div className="w-3/5 h-full overflow-auto p-4 main-app-div main-app-div-center">
        {selectedFile ? (
          <div>
            <h2 className="text-lg font-semibold mb-4">{selectedFile.name.replace('.mdx', '')}</h2>
            <MDXRenderer source={fileContent} />
          </div>
        ) : (
          <p>Select a file to view its content</p>
        )}
      </div>
      <div className="w-1/5 h-full overflow-auto p-4 main-app-div main-app-div-right">
        {/* Placeholder for future content */}
        <p>This space is reserved for future functionality</p>
      </div>
    </div>
  );
};

export default MainAppLayout;
