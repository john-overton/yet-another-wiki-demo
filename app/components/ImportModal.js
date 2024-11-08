'use client';

import { useState } from 'react';

const ImportModal = ({ isOpen, onClose, fileStructure, onImport }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [targetLocation, setTargetLocation] = useState('root');

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.md')) {
      setSelectedFile(file);
    } else {
      alert('Please select a markdown (.md) file');
      e.target.value = '';
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      alert('Please select a file to import');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('targetLocation', targetLocation);

    try {
      const response = await fetch('/api/import-markdown', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to import file');
      }

      onClose();
      window.location.reload(); // Refresh to show new file
    } catch (error) {
      console.error('Error importing file:', error);
      alert('Failed to import file. Please try again.');
    }
  };

  // Recursively collect all pages for the dropdown
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

  const availablePages = collectPages(fileStructure);

  return (
    <>
      {/* Backdrop - z-index higher than header (2000) */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[10000]" onClick={onClose} />
      
      {/* Modal - z-index higher than backdrop */}
      <div className="fixed inset-0 flex items-center justify-center z-[10001] pointer-events-none">
        <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6 pointer-events-auto" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold dark:text-white">Import Markdown File</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select File
              </label>
              <input
                type="file"
                accept=".md"
                onChange={handleFileChange}
                className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Import Location
              </label>
              <select
                value={targetLocation}
                onChange={(e) => setTargetLocation(e.target.value)}
                className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              >
                <option value="root">Root (Top Level)</option>
                {availablePages.map(page => (
                  <option key={page.id} value={page.id}>
                    {page.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-white shadow-lg dark:bg-gray-800 border border-gray-200 dark:text-white text-black hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!selectedFile}
                className={`px-4 py-2 bg-white shadow-lg dark:bg-gray-800 border border-gray-200 dark:text-white text-black rounded-lg flex items-center gap-2 ${
                  !selectedFile
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <i className="ri-upload-2-line"></i>
                Import
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ImportModal;
