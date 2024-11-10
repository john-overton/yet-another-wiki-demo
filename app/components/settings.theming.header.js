'use client';

import { useState, useRef, useEffect } from 'react';

const HeaderLinks = ({ 
  links, 
  headerLogo,
  onAddLink, 
  onEditLink, 
  onDeleteLink,
  onLogoChange
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      setMessage('Please upload an image file');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setMessage('File size should be less than 2MB');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/settings/theming/header-logo', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        onLogoChange(data.path);
        setMessage('Logo uploaded successfully');
      } else {
        setMessage('Failed to upload logo');
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      setMessage('Failed to upload logo');
    } finally {
      setIsUploading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleRemoveLogo = async () => {
    try {
      const response = await fetch('/api/settings/theming/header-logo', {
        method: 'DELETE',
      });

      if (response.ok) {
        onLogoChange(null);
        setMessage('Logo removed successfully');
      } else {
        setMessage('Failed to remove logo');
      }
    } catch (error) {
      console.error('Error removing logo:', error);
      setMessage('Failed to remove logo');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Header Logo Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <label className="block font-medium text-gray-700 dark:text-gray-300">
            Header Logo
          </label>
          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-4 py-2 bg-white shadow-lg dark:bg-gray-800 border border-gray-200 dark:text-white text-black hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <i className="ri-loader-4-line animate-spin"></i>
                  Uploading...
                </>
              ) : (
                <>
                  <i className="ri-upload-2-line"></i>
                  Upload Logo
                </>
              )}
            </button>
            {headerLogo && (
              <button
                onClick={handleRemoveLogo}
                className="px-4 py-2 bg-white shadow-lg dark:bg-gray-800 border border-gray-200 dark:text-white text-black hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg flex items-center gap-2"
              >
                <i className="ri-delete-bin-line"></i>
                Remove Logo
              </button>
            )}
          </div>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-lg ${
            message.includes('success') 
              ? 'bg-green-100 text-green-700 border border-green-400' 
              : 'bg-red-100 text-red-700 border border-red-400'
          }`}>
            {message}
          </div>
        )}

        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Upload a logo to replace the default header logo. The image will be automatically resized to fit the header height while maintaining its aspect ratio. For best results:
          </p>
          <ul className="list-disc list-inside mt-2 text-sm text-gray-600 dark:text-gray-400">
            <li>Use a transparent PNG or SVG file</li>
            <li>Keep the file size under 2MB</li>
            <li>Use an image with a height of 40px for optimal display</li>
            <li>Ensure the image has adequate padding</li>
          </ul>
        </div>

        {headerLogo && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Logo:</p>
            <img 
              src={headerLogo} 
              alt="Header Logo" 
              className="max-h-[40px] object-contain"
            />
          </div>
        )}
      </div>

      {/* Header Links Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <label className="block font-medium text-gray-700 dark:text-gray-300">
            Header Navigation Links ({links.length}/5)
          </label>
          <button
            onClick={onAddLink}
            className="px-4 py-2 bg-white shadow-lg dark:bg-gray-800 border border-gray-200 dark:text-white text-black hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg flex items-center gap-2"
          >
            <i className="ri-add-line"></i>
            Add Link
          </button>
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          {links.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No header links added yet
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {links.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="flex-1 min-w-0 mr-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {link.text}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {link.url}
                      {link.newTab && <span className="ml-2 text-xs">(opens in new tab)</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEditLink(link)}
                      className="text-gray-500 hover:text-blue-500 dark:hover:text-blue-400"
                      title="Edit Link"
                    >
                      <i className="ri-edit-line text-xl"></i>
                    </button>
                    <button
                      onClick={() => onDeleteLink(link)}
                      className="text-gray-500 hover:text-red-500 dark:hover:text-red-400"
                      title="Delete Link"
                    >
                      <i className="ri-delete-bin-line text-xl"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeaderLinks;
