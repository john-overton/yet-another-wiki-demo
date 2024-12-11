'use client';

import { useState, useEffect } from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import { Open_Sans } from 'next/font/google';

const openSans = Open_Sans({
    subsets: ['latin'],
    display: 'swap',
  });

const TrashBin = ({ onDelete }) => {
  const [deletedItems, setDeletedItems] = useState([]);
  const [availableParents, setAvailableParents] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [restoreTarget, setRestoreTarget] = useState('root');
  const [previewContent, setPreviewContent] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);

  useEffect(() => {
    fetchDeletedItems();
    fetchAvailableParents();
  }, []);

  const fetchDeletedItems = async () => {
    try {
      const response = await fetch('/api/deleted-items');
      if (response.ok) {
        const data = await response.json();
        setDeletedItems(data.deletedItems);
      } else {
        console.error('Failed to fetch deleted items');
      }
    } catch (error) {
      console.error('Error fetching deleted items:', error);
    }
  };

  const fetchAvailableParents = async () => {
    try {
      const response = await fetch('/api/file-structure');
      if (response.ok) {
        const data = await response.json();
        // Recursively collect all non-deleted pages
        const collectPages = (pages) => {
          let result = [];
          pages.forEach(page => {
            if (!page.deleted) {
              result.push(page);
              if (page.children && page.children.length > 0) {
                result = result.concat(collectPages(page.children));
              }
            }
          });
          return result;
        };
        const availablePages = collectPages(data.pages);
        setAvailableParents(availablePages);
      } else {
        console.error('Failed to fetch file structure');
      }
    } catch (error) {
      console.error('Error fetching file structure:', error);
    }
  };

  const handleItemSelect = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleRestore = async () => {
    try {
      const response = await fetch('/api/restore-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          items: selectedItems,
          targetId: restoreTarget
        }),
      });

      if (response.ok) {
        fetchDeletedItems();
        setSelectedItems([]);
      } else {
        console.error('Failed to restore items');
      }
    } catch (error) {
      console.error('Error restoring items:', error);
    }
  };

  const handlePreview = async (item) => {
    try {
      const response = await fetch(`/api/file-content?path=${encodeURIComponent(item.path)}`);
      if (response.ok) {
        const content = await response.text();
        setPreviewContent(content);
        setPreviewItem(item);
      } else {
        console.error('Failed to fetch file content');
      }
    } catch (error) {
      console.error('Error fetching file content:', error);
    }
  };

  const handlePermanentDelete = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(item.id, item.title, item.children && item.children.length > 0, 'trashbin');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Trash Bin</h1>

      <div className="mb-4 space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Restore Location
          </label>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Select a location to restore the items. Choose &apos;Root&apos; for top level, or select a page as the parent.
              </p>
              <select 
                value={restoreTarget}
                onChange={(e) => setRestoreTarget(e.target.value)}
                className={`w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 ${openSans.className}`}
              >
                <option value="root">Root (Top Level)</option>
                {availableParents.map(item => (
                  <option 
                    key={item.id} 
                    value={item.id}
                    className={`${openSans.className}`}
                    >
                    {item.title}
                  </option>
                ))}
              </select>
            </div>
            <button 
              onClick={handleRestore}
              disabled={selectedItems.length === 0}
              className="bg-white shadow-lg dark:bg-gray-800 border border-gray-200 dark:text-white text-black hover:bg-gray-300 dark:hover:bg-gray-600 px-4 py-2 rounded-lg flex items-center gap-2 h-10"
            >
              <i className="ri-arrow-go-forward-line" style={{ fontSize: '1.2rem' }}></i>
              Restore Selected
            </button>
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto my-4 border border-gray-300 dark:border-gray-700 rounded-lg">
        <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <input 
                  type="checkbox"
                  checked={selectedItems.length === deletedItems.length}
                  onChange={() => setSelectedItems(
                    selectedItems.length === deletedItems.length 
                      ? [] 
                      : deletedItems.map(item => item.id)
                  )}
                  className="rounded border-gray-300"
                  title="Select All Items"
                />
              </th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                TITLE
              </th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                PATH
              </th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {deletedItems.map(item => (
              <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input 
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => handleItemSelect(item.id)}
                    className="rounded border-gray-300"
                    title={`Select ${item.title}`}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {item.title}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {item.path}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  <button
                    onClick={() => handlePreview(item)}
                    className="text-gray-500 text-xl hover:text-blue-500 mr-2"
                    title={`Preview ${item.title}`}
                    aria-label={`Preview ${item.title}`}
                  >
                    <i className="ri-eye-line"></i>
                  </button>
                  <button
                    onClick={(e) => handlePermanentDelete(e, item)}
                    className="text-gray-500 text-xl hover:text-red-500"
                    title={`Permanently Delete ${item.title}`}
                    aria-label={`Permanently Delete ${item.title}`}
                  >
                    <i className="ri-delete-bin-line"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {previewContent && (
        <div className="mt-8 border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              Preview: {previewItem?.title}
            </h2>
            <button
              onClick={() => {
                setPreviewContent(null);
                setPreviewItem(null);
              }}
              className="text-gray-500 hover:text-gray-700"
              title="Close Preview"
              aria-label="Close Preview"
            >
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>
          <div className="border rounded-lg p-6 bg-white dark:bg-gray-900">
            <MarkdownRenderer content={previewContent} />
          </div>
        </div>
      )}
    </div>
  );
};

export default TrashBin;
