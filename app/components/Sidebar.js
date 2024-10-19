'use client';

import { useState, useEffect, useRef } from 'react';

const FileItem = ({ item, onSelect, onCreateNew, onDelete, level = 0 }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemType, setNewItemType] = useState('file');
  const inputRef = useRef(null);
  const itemRef = useRef(null);

  useEffect(() => {
    if (isCreating) {
      document.addEventListener('click', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [isCreating]);

  const handleCreateNew = () => {
    setIsCreating(true);
  };

  const handleOutsideClick = (e) => {
    if (inputRef.current && !inputRef.current.contains(e.target)) {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (newItemName.trim()) {
      const finalName = newItemType === 'file' ? `${newItemName.trim()}.mdx` : newItemName.trim();
      onCreateNew(item.path, finalName, newItemType);
    }
    setIsCreating(false);
    setNewItemName('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete ${item.type} "${item.name}"?`)) {
      onDelete(item.path, item.type);
    }
  };

  if (item.type !== 'folder' && (!item.name.endsWith('.mdx') || item.name === '_home.mdx')) {
    return null;
  }

  return (
    <li ref={itemRef} className="relative">
      <button
        type="button"
        className={`flex items-center p-2 w-full text-base font-normal text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 ${
          item.type === 'folder' ? 'font-semibold' : ''
        }`}
        onClick={() => item.type !== 'folder' && onSelect(item)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {item.type === 'folder' && <i className="ri-folder-6-line mr-2 font-normal"></i>}
        <span className="ml-3">{item.name.replace('.mdx', '')}</span>
        {isHovered && (
          <span className="ml-auto flex items-center">
            <i
              className="ri-delete-bin-line mr-1 cursor-pointer text-gray-500 hover:text-red-500 font-normal"
              onClick={handleDelete}
            ></i>
            {item.type === 'folder' && (
              <i
                className="ri-add-line cursor-pointer text-gray-500 hover:text-green-500 font-normal"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCreateNew();
                }}
              ></i>
            )}
          </span>
        )}
      </button>
      {isCreating && (
        <div className="fixed ml-1 mt-1 mb-1 overflow-visible flex shadow-lg z-[1000]" ref={inputRef}>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-2 border border-gray-200 dark:border-gray-700 z-[999]">
            <div className="flex items-center">
              <button
                onClick={() => setNewItemType('folder')}
                className={`mr-2 ${newItemType === 'folder' ? 'text-blue-500' : 'text-gray-500'}`}
              >
                <i className="ri-folder-line"></i>
              </button>
              <button
                onClick={() => setNewItemType('file')}
                className={`mr-2 ${newItemType === 'file' ? 'text-blue-500' : 'text-gray-500'}`}
              >
                <i className="ri-file-line"></i>
              </button>
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`New ${newItemType} name`}
                className="border rounded px-2 py-1 pr-1 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white flex-grow"
                autoFocus
              />
              <button
                onClick={() => setIsCreating(false)}
                className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
              >
                <i className="ri-close-line shadow-sm"></i>
              </button>
            </div>
          </div>
        </div>
      )}
      {item.type === 'folder' && item.children && (
        <ul className="space-y-2 ml-4">
          {item.children.map((child, index) => (
            <FileItem key={index} item={child} onSelect={onSelect} onCreateNew={onCreateNew} onDelete={onDelete} level={level + 1} />
          ))}
        </ul>
      )}
    </li>
  );
};

const Sidebar = ({ fileStructure, onSelect, onCreateNew, onDelete }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <>
      <button
        data-drawer-target="default-sidebar"
        data-drawer-toggle="default-sidebar"
        aria-controls="default-sidebar"
        type="button"
        className="inline-flex items-center p-2 mt-2 ml-3 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <span className="sr-only">Open sidebar</span>
        <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path clipRule="evenodd" fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path>
        </svg>
      </button>

      <aside
        id="default-sidebar"
        className={`w-64 h-full transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
        aria-label="Sidenav"
      >
        <div className="overflow-y-auto py-5 px-3 h-full bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Pages</h2>
          <ul className="space-y-2">
            {fileStructure.map((item, index) => (
              <FileItem key={index} item={item} onSelect={onSelect} onCreateNew={onCreateNew} onDelete={onDelete} />
            ))}
          </ul>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
