'use client';

import { useEffect, useRef, useState } from 'react';
import SearchComponent from './SearchComponent';

const SearchModal = ({ isOpen, onClose }) => {
  const modalRef = useRef();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-[10vh]">
      <div ref={modalRef} className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {/* Search Section */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <SearchComponent inModal={true} onClose={onClose} />
        </div>

        {/* Results Section */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          {/* Results are rendered inside SearchComponent */}
        </div>

        {/* Helper Text Section */}
        <div className="p-3 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900">
          <div className="flex justify-between items-center">
            <div className="flex space-x-4">
              <span><kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">↑</kbd> <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">↓</kbd> to navigate</span>
              <span><kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">Enter</kbd> to select</span>
            </div>
            <div>
              <span><kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">Esc</kbd> to close</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
