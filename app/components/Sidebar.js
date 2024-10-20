'use client';

import { useState, useEffect, useRef } from 'react';

const FileItem = ({ item, onSelect, onCreateNew, onDelete, onRename, level = 0 }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const inputRef = useRef(null);
  const renameInputRef = useRef(null);
  const itemRef = useRef(null);

  useEffect(() => {
    if (isCreating || isRenaming) {
      document.addEventListener('click', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [isCreating, isRenaming]);

  const handleCreateNew = () => {
    setIsCreating(true);
  };

  const handleOutsideClick = (e) => {
    if (inputRef.current && !inputRef.current.contains(e.target)) {
      handleSubmit();
    }
    if (renameInputRef.current && !renameInputRef.current.contains(e.target)) {
      handleRenameSubmit();
    }
  };

  const handleSubmit = () => {
    if (newItemName.trim()) {
      onCreateNew(item.path, newItemName.trim());
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
    if (window.confirm(`Are you sure you want to delete "${item.title}"?`)) {
      onDelete(item.path);
    }
  };

  const toggleExpand = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleDoubleClick = (e) => {
    e.preventDefault();
    setIsRenaming(true);
    setNewItemName(item.title);
  };

  const handleRenameSubmit = () => {
    if (newItemName.trim() && newItemName !== item.title) {
      onRename(item.path, newItemName.trim());
    }
    setIsRenaming(false);
    setNewItemName('');
  };

  const handleRenameKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleRenameSubmit();
    }
  };

  const displayName = item.title.replace(/\.mdx$/, '');

  return (
    <li ref={itemRef}>
      {!isRenaming ? (
        <button
          type="button"
          className={`flex items-center p-2 w-full text-base font-normal text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700`}
          onClick={() => onSelect(item)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onDoubleClick={handleDoubleClick}
        >
          {item.children && item.children.length > 0 && (
            <i
              className={`mr-2 font-normal cursor-pointer ${isExpanded ? 'ri-checkbox-indeterminate-line' : 'ri-add-box-line'}`}
              onClick={toggleExpand}
            ></i>
          )}
          <span className="ml-1">{displayName}</span>
          {isHovered && (
            <span className="ml-auto flex items-center">
              <i
                className="ri-delete-bin-line mr-1 cursor-pointer text-gray-500 hover:text-red-500 font-normal"
                onClick={handleDelete}
              ></i>
              <i
                className="ri-add-line cursor-pointer text-gray-500 hover:text-green-500 font-normal"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCreateNew();
                }}
              ></i>
            </span>
          )}
        </button>
      ) : (
        <div className="flex items-center p-2" ref={renameInputRef}>
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={handleRenameKeyDown}
            className="border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white flex-grow"
            autoFocus
          />
        </div>
      )}
      {isCreating && (
        <div className="fixed ml-1 mt-1 mb-1 overflow-visible flex shadow-lg z-[1001]" ref={inputRef}>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-2 border border-gray-200 dark:border-gray-700 z-[1002]">
            <div className="flex items-center">
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="New item name"
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
      {item.children && item.children.length > 0 && isExpanded && (
        <ul className="space-y-2 ml-4 border-l border-gray-200 dark:border-gray-700">
          {item.children.map((child, index) => (
            <FileItem key={index} item={child} onSelect={onSelect} onCreateNew={onCreateNew} onDelete={onDelete} onRename={onRename} level={level + 1} />
          ))}
        </ul>
      )}
    </li>
  );
};

const CreateItemInterface = ({ onCreateNew, onClose }) => {
  const [newItemName, setNewItemName] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  const handleOutsideClick = (e) => {
    if (inputRef.current && !inputRef.current.contains(e.target)) {
      onClose();
    }
  };

  const handleSubmit = () => {
    if (newItemName.trim()) {
      onCreateNew('/', newItemName.trim());
    }
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="fixed ml-1 mt-1 mb-1 overflow-visible flex shadow-lg z-[1000]" ref={inputRef}>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-2 border border-gray-200 dark:border-gray-700 z-[999]">
        <div className="flex items-center">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="New item name"
            className="border rounded px-2 py-1 pr-1 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white flex-grow"
            autoFocus
          />
          <button
            onClick={onClose}
            className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
          >
            <i className="ri-close-line shadow-sm"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

const Sidebar = ({ fileStructure, onSelect, onCreateNew, onDelete, onRename }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isCreatingRoot, setIsCreatingRoot] = useState(false);
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);

  const handleCreateRoot = () => {
    setIsCreatingRoot(true);
  };

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
          <div 
            className="flex items-center justify-between mb-4 p-2 rounded-lg transition duration-75 hover:bg-gray-100 dark:hover:bg-gray-700"
            onMouseEnter={() => setIsHeaderHovered(true)}
            onMouseLeave={() => setIsHeaderHovered(false)}
          >
            <h2 className="text-lg text-gray-900 dark:text-white">Pages</h2>
            <button
              onClick={handleCreateRoot}
              className={`text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-opacity duration-200 ${isHeaderHovered ? 'opacity-100' : 'opacity-0'}`}
            >
              <i className="ri-add-line"></i>
            </button>
          </div>
          {isCreatingRoot && (
            <CreateItemInterface
              onCreateNew={onCreateNew}
              onClose={() => setIsCreatingRoot(false)}
            />
          )}
          <ul className="space-y-2">
            {fileStructure.map((item, index) => (
              <FileItem key={index} item={item} onSelect={onSelect} onCreateNew={onCreateNew} onDelete={onDelete} onRename={onRename} />
            ))}
          </ul>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
