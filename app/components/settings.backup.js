'use client';

import { useState } from 'react';

const BackupImportModal = ({ isOpen, onClose, onImport }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[10000]" onClick={onClose} />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-[10001] pointer-events-none">
        <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6 pointer-events-auto" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold dark:text-white">Import Backup</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>

          <div className="space-y-4">
            <div className="mb-4">
              <input
                type="file"
                accept=".zip"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              />
            </div>

            <div className="text-sm text-red-600 dark:text-red-400">
              Warning: Importing a backup will completely replace all existing data, database, and configuration directories with the contents from the backup file. All current files in these directories will be permanently deleted. This action cannot be undone.
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-white shadow-lg dark:bg-gray-800 border border-gray-200 dark:text-white text-black hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => onImport(selectedFile)}
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

const BackupSettings = () => {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');

  const handleBackup = async () => {
    try {
      const response = await fetch('/api/backup/create', {
        method: 'POST',
        credentials: 'include', // Include credentials (cookies) in the request
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `Failed to create backup: ${response.status} ${response.statusText}`);
      }

      // Get the filename from the Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : 'backup.zip';

      // Create blob from response and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error creating backup:', error);
      setError(error.message);
    }
  };

  const handleImport = async (file) => {
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('backup', file);

      const response = await fetch('/api/backup/restore', {
        method: 'POST',
        body: formData,
        credentials: 'include', // Include credentials (cookies) in the request
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `Failed to restore backup: ${response.status} ${response.statusText}`);
      }

      setIsImportModalOpen(false);
      setSelectedFile(null);
      window.location.reload(); // Refresh to show restored content
    } catch (error) {
      console.error('Error restoring backup:', error);
      setError(error.message);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Backup & Import</h2>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 border border-red-400">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex gap-4">
          <button
            onClick={handleBackup}
            className="px-4 py-2 bg-white shadow-lg dark:bg-gray-800 border border-gray-200 dark:text-white text-black hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg flex items-center gap-2"
          >
            <i className="ri-upload-2-line" style={{ transform: 'rotate(180deg)' }}></i>
            Create Backup
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-4 py-2 bg-white shadow-lg dark:bg-gray-800 border border-gray-200 dark:text-white text-black hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg flex items-center gap-2"
          >
            <i className="ri-inbox-unarchive-line"></i>
            Import Backup
          </button>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400">
          Backup includes data, database, public files, and configuration. Import will completely replace existing content.
        </p>
      </div>

      <BackupImportModal
        isOpen={isImportModalOpen}
        onClose={() => {
          setIsImportModalOpen(false);
          setSelectedFile(null);
        }}
        onImport={handleImport}
      />
    </div>
  );
};

export default BackupSettings;
