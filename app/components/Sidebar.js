'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

const FileItem = ({ 
  item, 
  onSelect, 
  onCreateNew, 
  onDelete, 
  onRename, 
  level = 0, 
  isAuthenticated,
  refreshFileStructure,
  onSortOrderChange
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const inputRef = useRef(null);

  const handleSubmit = useCallback(async () => {
    if (newItemName.trim()) {
      await onCreateNew(item.path, newItemName.trim());
    }
    setIsCreating(false);
    setNewItemName('');
  }, [newItemName, onCreateNew, item.path]);

  const handleOutsideClick = useCallback((e) => {
    if (inputRef.current && !inputRef.current.contains(e.target)) {
      handleSubmit();
    }
  }, [handleSubmit]);

  useEffect(() => {
    if (isCreating) {
      document.addEventListener('click', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [isCreating, handleOutsideClick]);

  const handleCreateNew = () => {
    setIsCreating(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    onDelete(item, 'sidebar');
  };

  const toggleExpand = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const displayName = item.title.replace(/\.md$/, '');

  // Sort children by sortOrder if they exist
  const sortedChildren = item.children ? [...item.children].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)) : [];

  return (
    <li>
      <button
        type="button"
        className="flex items-center p-2 w-full text-base font-normal text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
        onClick={() => onSelect(item)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {item.children && item.children.length > 0 && (
          <i
            className={`mr-2 font-normal cursor-pointer flex-shrink-0 ${isExpanded ? 'ri-checkbox-indeterminate-line' : 'ri-add-box-line'}`}
            onClick={toggleExpand}
          ></i>
        )}
        <span className="ml-1 break-words">{displayName}</span>
        {isHovered && isAuthenticated && (
          <span className="ml-auto flex items-center flex-shrink-0">
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
          {sortedChildren.map((child, index) => (
            <FileItem 
              key={index} 
              item={child} 
              onSelect={onSelect} 
              onCreateNew={onCreateNew} 
              onDelete={onDelete} 
              onRename={onRename} 
              level={level + 1} 
              isAuthenticated={isAuthenticated}
              refreshFileStructure={refreshFileStructure}
              onSortOrderChange={onSortOrderChange}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

const CreateItemInterface = ({ onCreateNew, onClose }) => {
  const [newItemName, setNewItemName] = useState('');
  const inputRef = useRef(null);

  const handleOutsideClick = useCallback((e) => {
    if (inputRef.current && !inputRef.current.contains(e.target)) {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [handleOutsideClick]);

  const handleSubmit = async () => {
    if (newItemName.trim()) {
      await onCreateNew('/', newItemName.trim());
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

const filterItems = (items, isAuthenticated) => {
  const sortedItems = [...items]
    .filter(item => !item.deleted && (isAuthenticated || item.isPublic))
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  return sortedItems.map(item => ({
    ...item,
    children: item.children ? filterItems(item.children, isAuthenticated) : []
  }));
};

const Sidebar = ({ 
  fileStructure, 
  onSelect, 
  onCreateNew, 
  onDelete, 
  onRename, 
  refreshFileStructure, 
  isAuthenticated,
  onTrashBinClick,
  onSortOrderChange
}) => {
  const [isCreatingRoot, setIsCreatingRoot] = useState(false);
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);

  const handleCreateRoot = () => {
    setIsCreatingRoot(true);
  };

  const filteredFileStructure = filterItems(fileStructure, isAuthenticated);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex flex-col bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700 h-full">
        {/* Header Section */}
        <div className="flex-none px-3 py-5">
          <div 
            className="flex items-center justify-between mb-4 p-2 rounded-lg transition duration-75 hover:bg-gray-100 dark:hover:bg-gray-700"
            onMouseEnter={() => setIsHeaderHovered(true)}
            onMouseLeave={() => setIsHeaderHovered(false)}
          >
            <div className="text-xl text-gray-900 dark:text-white"><b>Pages</b></div>
            {isAuthenticated && (
              <button
                onClick={handleCreateRoot}
                className={`text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-opacity duration-200 ${isHeaderHovered ? 'opacity-100' : 'opacity-0'} flex-shrink-0`}
              >
                <p><i className="ri-add-line"></i>Add Page</p>
              </button>
            )}
          </div>
          {isCreatingRoot && isAuthenticated && (
            <CreateItemInterface
              onCreateNew={onCreateNew}
              onClose={() => setIsCreatingRoot(false)}
            />
          )}
        </div>

        {/* File List Section - Scrollable */}
        <div className="flex-1 overflow-y-auto px-3 min-h-0">
          <ul className="space-y-2">
            {filteredFileStructure.map((item, index) => (
              <FileItem 
                key={index} 
                item={item} 
                onSelect={onSelect} 
                onCreateNew={onCreateNew} 
                onDelete={onDelete} 
                onRename={onRename} 
                isAuthenticated={isAuthenticated}
                refreshFileStructure={refreshFileStructure}
                onSortOrderChange={onSortOrderChange}
              />
            ))}
          </ul>
        </div>

        {/* Footer Section - Always at bottom */}
        {isAuthenticated && (
          <div className="flex-none px-3 py-4 border-gray-200 dark:border-gray-700 mt-auto">
            <Link 
              href="/settings"
              className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 mb-2"
            >
              <i className="ri-settings-3-line mr-2"></i>
              <span>Settings</span>
            </Link>
            <button 
              onClick={onTrashBinClick}
              className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 w-full"
            >
              <i className="ri-delete-bin-7-line mr-2"></i>
              <span>Trash Bin</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
