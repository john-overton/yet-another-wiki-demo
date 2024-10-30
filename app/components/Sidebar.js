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
  isAuthenticated
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const inputRef = useRef(null);

  const handleSubmit = useCallback(() => {
    if (newItemName.trim()) {
      onCreateNew(item.path, newItemName.trim());
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
    if (window.confirm(`Are you sure you want to delete "${item.title}"?`)) {
      const deleteChildren = item.children && item.children.length > 0 && 
        window.confirm("Do you want to delete child items as well?");
      
      try {
        const response = await fetch('/api/delete-item', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ path: item.path, deleteChildren }),
        });

        if (response.ok) {
          onDelete(item.path);
        } else {
          console.error('Failed to delete item');
        }
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
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
            className={`mr-2 font-normal cursor-pointer ${isExpanded ? 'ri-checkbox-indeterminate-line' : 'ri-add-box-line'}`}
            onClick={toggleExpand}
          ></i>
        )}
        <span className="ml-1">{displayName}</span>
        {isHovered && isAuthenticated && (
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
  onTrashBinClick 
}) => {
  const [isCreatingRoot, setIsCreatingRoot] = useState(false);
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);

  const handleCreateRoot = () => {
    setIsCreatingRoot(true);
  };

  const handleDelete = async (path) => {
    await onDelete(path);
    refreshFileStructure();
  };

  const filteredFileStructure = filterItems(fileStructure, isAuthenticated);

  return (
    <div className="h-full overflow-hidden">
      <div className="overflow-y-auto py-5 px-3 h-full bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700 flex flex-col">
        <div 
          className="flex items-center justify-between mb-4 p-2 rounded-lg transition duration-75 hover:bg-gray-100 dark:hover:bg-gray-700"
          onMouseEnter={() => setIsHeaderHovered(true)}
          onMouseLeave={() => setIsHeaderHovered(false)}
        >
          <div className="text-xl text-gray-900 dark:text-white"><b>Pages</b></div>
          {isAuthenticated && (
            <button
              onClick={handleCreateRoot}
              className={`text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-opacity duration-200 ${isHeaderHovered ? 'opacity-100' : 'opacity-0'}`}
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
        <ul className="space-y-2 flex-grow">
          {filteredFileStructure.map((item, index) => (
            <FileItem 
              key={index} 
              item={item} 
              onSelect={onSelect} 
              onCreateNew={onCreateNew} 
              onDelete={handleDelete} 
              onRename={onRename} 
              isAuthenticated={isAuthenticated}
            />
          ))}
        </ul>
        {isAuthenticated && (
          <>
            <Link 
              href="/settings"
              className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 mb-2"
            >
              <i className="ri-settings-3-line mr-2"></i>
              <span>Settings</span>
            </Link>
            <button 
              onClick={onTrashBinClick}
              className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <i className="ri-delete-bin-7-line mr-2"></i>
              <span>Trash Bin</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
