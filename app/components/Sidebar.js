'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[1002] flex items-center justify-center p-1">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-sm" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

const NewItemInput = ({ value, onChange, onKeyDown, onClose, inputRef, isModal = false }) => {
  return (
    <div className="flex items-center p-1">
      <input
        type="text"
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder="New item name"
        className="border rounded px-2 py-1 pr-1 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white flex-grow"
        ref={inputRef}
        autoFocus
      />
      <button
        onClick={onClose}
        className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
      >
        <i className="ri-close-line shadow-sm"></i>
      </button>
    </div>
  );
};

const FileItem = ({ 
  item, 
  onSelect, 
  onCreateNew, 
  onDelete, 
  onRename, 
  level = 0, 
  isAuthenticated,
  refreshFileStructure,
  onSortOrderChange,
  userRole,
  currentPage,
  parentExpanded = true
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const inputRef = useRef(null);
  const itemRef = useRef(null);

  const canModifyContent = userRole !== 'User';
  const isCurrentPage = currentPage?.id === item.id;

  // Check if this item is in the path to the current page
  const isInCurrentPath = useCallback((item) => {
    if (!currentPage) return false;
    if (item.id === currentPage.id) return true;
    if (item.children) {
      return item.children.some(child => {
        if (child.id === currentPage.id) return true;
        return isInCurrentPath(child);
      });
    }
    return false;
  }, [currentPage]);

  // Auto-expand if this item is in the path to the current page
  useEffect(() => {
    if (parentExpanded && isInCurrentPath(item)) {
      setIsExpanded(true);
    }
  }, [currentPage, item, parentExpanded, isInCurrentPath]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 600);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    if (isCreating && !isMobile) {
      document.addEventListener('click', handleOutsideClick);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [isCreating, handleOutsideClick, isMobile]);

  const handleCreateNew = () => {
    setIsCreating(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(item.id, item.title, item.children && item.children.length > 0, 'sidebar');
  };

  const toggleExpand = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const displayName = item.title.replace(/\.md$/, '');
  const sortedChildren = item.children ? [...item.children].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)) : [];

  return (
    <li ref={itemRef}>
      <button
        type="button"
        className={`flex items-center justify-between w-full text-base font-normal rounded-lg transition duration-75 group p-2
          ${isCurrentPage 
            ? 'page-selected'
            : 'text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700'}`}
        onClick={() => onSelect(item)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center min-w-0">
          {item.children && item.children.length > 0 && (
            <i
              className={`mr-2 font-normal cursor-pointer flex-shrink-0 ${isExpanded ? 'ri-checkbox-indeterminate-line' : 'ri-add-box-line'}`}
              onClick={toggleExpand}
            ></i>
          )}
          <span className="truncate">{displayName}</span>
        </div>
        {isAuthenticated && canModifyContent && (
          <div className={`flex items-center flex-shrink-0 ml-2 ${isHovered ? 'opacity-100' : 'sm:opacity-0 opacity-100'} transition-opacity duration-200`}>
            <i
              className="ri-delete-bin-line cursor-pointer text-gray-500 hover:text-red-500 font-normal px-1"
              onClick={handleDelete}
            ></i>
            <i
              className="ri-add-line cursor-pointer text-gray-500 hover:text-green-500 font-normal px-1"
              onClick={(e) => {
                e.stopPropagation();
                handleCreateNew();
              }}
            ></i>
          </div>
        )}
      </button>

      {/* Mobile Modal */}
      {isMobile && (
        <Modal isOpen={isCreating} onClose={() => setIsCreating(false)}>
          <div className="p-4">
            <h3 className="text-lg font-medium mb-4 dark:text-white">Add New Item</h3>
            <NewItemInput
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={handleKeyDown}
              onClose={() => setIsCreating(false)}
              inputRef={inputRef}
              isModal={true}
            />
          </div>
        </Modal>
      )}

      {/* Desktop Inline Input */}
      {!isMobile && isCreating && (
        <div className="relative ml-1 mt-1 mb-1 shadow-lg z-[1001]">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-2 border border-gray-200 dark:border-gray-700">
            <NewItemInput
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={handleKeyDown}
              onClose={() => setIsCreating(false)}
              inputRef={inputRef}
            />
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
              userRole={userRole}
              currentPage={currentPage}
              parentExpanded={isExpanded}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

const CreateItemInterface = ({ onCreateNew, onClose }) => {
  const [newItemName, setNewItemName] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 600);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleOutsideClick = useCallback((e) => {
    if (inputRef.current && !inputRef.current.contains(e.target)) {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (!isMobile) {
      document.addEventListener('click', handleOutsideClick);
    }
    if (inputRef.current) {
      inputRef.current.focus();
    }
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [handleOutsideClick, isMobile]);

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

  if (isMobile) {
    return (
      <Modal isOpen={true} onClose={onClose}>
        <div className="p-4">
          <h3 className="text-lg font-medium mb-4 dark:text-white">Add New Page</h3>
          <NewItemInput
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={handleKeyDown}
            onClose={onClose}
            inputRef={inputRef}
            isModal={true}
          />
        </div>
      </Modal>
    );
  }

  return (
    <div className="relative ml-1 mt-1 mb-1 shadow-lg z-[1000]">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-2 border border-gray-200 dark:border-gray-700">
        <NewItemInput
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          onKeyDown={handleKeyDown}
          onClose={onClose}
          inputRef={inputRef}
        />
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
  onSortOrderChange,
  session,
  onImportClick,
  currentPage
}) => {
  const [isCreatingRoot, setIsCreatingRoot] = useState(false);
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);

  const userRole = session?.user?.role;
  const canModifyContent = userRole !== 'User';
  const canAccessSettings = userRole === 'Admin';

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
            {isAuthenticated && canModifyContent && (
              <button
                onClick={handleCreateRoot}
                className={`text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-opacity duration-200 ${isHeaderHovered ? 'opacity-100' : 'opacity-0'} flex-shrink-0`}
              >
                <p><i className="ri-add-line"></i>Add Page</p>
              </button>
            )}
          </div>
          {isCreatingRoot && isAuthenticated && canModifyContent && (
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
                userRole={userRole}
                currentPage={currentPage}
                parentExpanded={true}
              />
            ))}
          </ul>
        </div>

        {/* Footer Section - Always at bottom */}
        {isAuthenticated && (
          <div className="flex-none px-3 py-4 border-gray-200 dark:border-gray-700 mt-auto">
            {canModifyContent && (
              <>
                <button 
                  onClick={onImportClick}
                  className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 w-full mb-2"
                >
                  <i className="ri-file-upload-line mr-2"></i>
                  <span>Import Page</span>
                </button>
                <button 
                  onClick={onTrashBinClick}
                  className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 w-full mb-2"
                >
                  <i className="ri-delete-bin-7-line mr-2"></i>
                  <span>Trash Bin</span>
                </button>
              </>
            )}
            {canAccessSettings && (
              <Link 
                href="/settings"
                className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <i className="ri-settings-3-line mr-2"></i>
                <span>Settings</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
