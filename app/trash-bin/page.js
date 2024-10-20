'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const TrashBinPage = () => {
  const [deletedItems, setDeletedItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [restoreTarget, setRestoreTarget] = useState('root');

  useEffect(() => {
    fetchDeletedItems();
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

  const handleItemSelect = (itemPath) => {
    setSelectedItems(prev => 
      prev.includes(itemPath) 
        ? prev.filter(path => path !== itemPath)
        : [...prev, itemPath]
    );
  };

  const handleSelectAll = () => {
    setSelectedItems(
      selectedItems.length === deletedItems.length 
        ? [] 
        : deletedItems.map(item => item.path)
    );
  };

  const handleRestore = async () => {
    try {
      const response = await fetch('/api/restore-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: selectedItems, target: restoreTarget }),
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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Trash Bin</h1>
      <div className="mb-4">
        <button 
          onClick={handleSelectAll}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
        >
          {selectedItems.length === deletedItems.length ? 'Deselect All' : 'Select All'}
        </button>
        <button 
          onClick={handleRestore}
          className="bg-green-500 text-white px-4 py-2 rounded mr-2"
          disabled={selectedItems.length === 0}
        >
          Restore Selected
        </button>
        <select 
          value={restoreTarget}
          onChange={(e) => setRestoreTarget(e.target.value)}
          className="border rounded px-2 py-2"
        >
          <option value="root">Root</option>
          {deletedItems.map(item => (
            <option key={item.path} value={item.path}>{item.title}</option>
          ))}
        </select>
      </div>
      <ul className="space-y-2">
        {deletedItems.map(item => (
          <li key={item.path} className="flex items-center">
            <input 
              type="checkbox"
              checked={selectedItems.includes(item.path)}
              onChange={() => handleItemSelect(item.path)}
              className="mr-2"
            />
            <span>{item.title}</span>
          </li>
        ))}
      </ul>
      <Link href="/" className="block mt-4 text-blue-500 hover:underline">
        Back to Home
      </Link>
    </div>
  );
};

export default TrashBinPage;
