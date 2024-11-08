'use client';

import { useState, useEffect, useCallback } from 'react';

const SortTable = ({ items, currentPath, onSortOrderChange, title, parentPath }) => {
  const [sortedItems, setSortedItems] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setSortedItems(
      items
        .filter(item => !item.deleted)
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    );
  }, [items]);

  if (!sortedItems || sortedItems.length <= 0) return null;

  const handleMoveUp = async (item, index) => {
    if (index > 0 && !isUpdating) {
      setIsUpdating(true);
      const newSortOrder = sortedItems[index - 1].sortOrder;
      const oldSortOrder = item.sortOrder;

      // Optimistically update the UI
      const newItems = [...sortedItems];
      newItems[index].sortOrder = newSortOrder;
      newItems[index - 1].sortOrder = oldSortOrder;
      setSortedItems(newItems.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)));

      try {
        await onSortOrderChange(
          item.path, 
          newSortOrder, 
          sortedItems[index - 1].path, 
          oldSortOrder,
          parentPath // Pass the parent path directly
        );
      } catch (error) {
        console.error('Failed to update sort order:', error);
        setSortedItems(sortedItems);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleMoveDown = async (item, index) => {
    if (index < sortedItems.length - 1 && !isUpdating) {
      setIsUpdating(true);
      const newSortOrder = sortedItems[index + 1].sortOrder;
      const oldSortOrder = item.sortOrder;

      // Optimistically update the UI
      const newItems = [...sortedItems];
      newItems[index].sortOrder = newSortOrder;
      newItems[index + 1].sortOrder = oldSortOrder;
      setSortedItems(newItems.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)));

      try {
        await onSortOrderChange(
          item.path, 
          newSortOrder, 
          sortedItems[index + 1].path, 
          oldSortOrder,
          parentPath // Pass the parent path directly
        );
      } catch (error) {
        console.error('Failed to update sort order:', error);
        setSortedItems(sortedItems);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  return (
    <div className="overflow-hidden bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm">
      <table className="min-w-full">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {sortedItems.map((item, index) => (
            <tr key={item.path} className={item.path === currentPath ? 'bg-blue-50 dark:bg-blue-900/20' : ''}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {item.title}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => handleMoveUp(item, index)}
                  disabled={index === 0 || isUpdating}
                  className={`mr-2 ${index === 0 || isUpdating ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300'}`}
                >
                  <i className="ri-arrow-up-line"></i>
                </button>
                <button
                  onClick={() => handleMoveDown(item, index)}
                  disabled={index === sortedItems.length - 1 || isUpdating}
                  className={`${index === sortedItems.length - 1 || isUpdating ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300'}`}
                >
                  <i className="ri-arrow-down-line"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const SectionHeader = ({ title, isExpanded, onToggle }) => (
  <div className="flex justify-between items-center bg-[#717171] dark:bg-[#1F2937] text-gray-300 px-4 py-2 rounded-t text-sm border-b border-gray-700">
    <span className="font-medium text-base">{title}</span>
    <button
      onClick={onToggle}
      className="hover:text-white transition-colors text-xs uppercase tracking-wider opacity-75 hover:opacity-100"
    >
      {isExpanded ? '▲ Hide Section' : '▼ Show Section'}
    </button>
  </div>
);

const SortOrderEditor = ({ file, onSortOrderChange: parentOnSortOrderChange }) => {
  const [rootSiblings, setRootSiblings] = useState([]);
  const [childItems, setChildItems] = useState([]);
  const [parentPath, setParentPath] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFileStructure = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/file-structure', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      if (!data || !data.pages) {
        setError('No file structure data available');
        return;
      }

      // Function to find item's context
      const findItemContext = (items, targetPath, parent = null) => {
        // Check if this is a root level item
        const rootItem = items.find(item => item.path === targetPath);
        if (rootItem) {
          return {
            found: true,
            rootSiblings: items,
            childItems: rootItem.children || [],
            parent: null
          };
        }

        // Search in children
        for (const item of items) {
          if (item.children && item.children.length > 0) {
            // Check if target is in this item's children
            const childItem = item.children.find(child => child.path === targetPath);
            if (childItem) {
              return {
                found: true,
                rootSiblings: [],
                childItems: childItem.children || [],
                parent: item,
                siblings: item.children // Add siblings for child items
              };
            }

            const result = findItemContext(item.children, targetPath, item);
            if (result.found) {
              return result;
            }
          }
        }
        return { found: false, rootSiblings: [], childItems: [], parent: null };
      };

      const result = findItemContext(data.pages, file.path);

      if (result.found) {
        // If we found siblings for a child item, use those instead of root siblings
        setRootSiblings(result.siblings || result.rootSiblings);
        setChildItems(result.childItems);
        setParentPath(result.parent ? result.parent.path : null);
        setError(null);
      } else {
        setError('Item not found in file structure');
      }
    } catch (error) {
      console.error('Error fetching file structure:', error);
      setError(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [file.path]);

  useEffect(() => {
    if (file && file.path) {
      fetchFileStructure();
    }
  }, [file, fetchFileStructure]);

  const handleSortOrderChange = async (path, newSortOrder, swapPath, swapSortOrder, itemParentPath) => {
    try {
      console.log('Updating sort order with:', {
        path,
        newSortOrder,
        swapPath,
        swapSortOrder,
        parentPath: itemParentPath || parentPath
      });

      const response = await fetch('/api/update-sort-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify({ 
          path, 
          newSortOrder,
          swapPath,
          swapSortOrder,
          parentPath: itemParentPath || parentPath
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to update sort order');
      }

      if (parentOnSortOrderChange) {
        await parentOnSortOrderChange(path, newSortOrder);
      }

      await fetchFileStructure();
    } catch (error) {
      console.error('Error updating sort order:', error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded">
        <p className="text-sm text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">File path: {file?.path}</p>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <div className="rounded-lg overflow-hidden border border-gray-700">
        <SectionHeader 
          title="Page Order"
          isExpanded={isExpanded}
          onToggle={() => setIsExpanded(!isExpanded)}
        />
        <div className={`transition-all duration-200 ${
          isExpanded ? 'opacity-100 p-4' : 'h-0 opacity-0 overflow-hidden'
        }`}>
          {rootSiblings.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {parentPath ? 'Sibling Items Order' : 'Root Level Order'}
              </h3>
              <SortTable
                items={rootSiblings}
                currentPath={file.path}
                onSortOrderChange={handleSortOrderChange}
                parentPath={parentPath}
              />
            </div>
          )}
          {childItems.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Child Items Order</h3>
              <SortTable
                items={childItems}
                currentPath={file.path}
                onSortOrderChange={handleSortOrderChange}
                parentPath={file.path}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SortOrderEditor;
