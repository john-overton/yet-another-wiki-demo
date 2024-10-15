'use client';

import { useState } from 'react';

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

  if (item.type !== 'folder' && (!item.name.endsWith('.mdx') || item.name === '_home.mdx')) {
    return null;
  }

  return (
    <li>
      <button
        type="button"
        className={`flex items-center p-2 w-full text-base font-normal text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 ${
          item.type === 'folder' ? 'font-semibold' : ''
        }`}
        onClick={() => item.type !== 'folder' && onSelect(item)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <span className="ml-3">{item.name.replace('.mdx', '')}</span>
        {item.type === 'folder' && isHovered && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              setIsCreating(!isCreating);
            }}
            className="ml-auto text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white cursor-pointer"
          >
            +
          </span>
        )}
      </button>
      {isCreating && (
        <form onSubmit={handleSubmit} className="mt-1 ml-6">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder={`New ${newItemType} name`}
            className="border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <button type="submit" className="ml-2 bg-blue-500 text-white rounded px-2 py-1 text-sm">
            Create
          </button>
        </form>
      )}
      {item.type === 'folder' && item.children && (
        <ul className="space-y-2 ml-4">
          {item.children.map((child, index) => (
            <FileItem key={index} item={child} onSelect={onSelect} onCreateNew={onCreateNew} level={level + 1} />
          ))}
        </ul>
      )}
    </li>
  );
};

const Sidebar = ({ fileStructure, onSelect, onCreateNew }) => {
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
              <FileItem key={index} item={item} onSelect={onSelect} onCreateNew={onCreateNew} />
            ))}
          </ul>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
