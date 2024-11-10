'use client';

import { useState, useRef, useEffect } from 'react';

const FooterLinks = ({ 
  footerLinks, 
  onAddLink, 
  onEditLink, 
  onDeleteLink,
  onHeaderChange 
}) => {
  const [footerLogo, setFooterLogo] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings/theming');
        if (response.ok) {
          const settings = await response.json();
          if (settings.footerLogo) {
            setFooterLogo(settings.footerLogo);
          }
        }
      } catch (error) {
        console.error('Error loading footer logo:', error);
      }
    };
    loadSettings();
  }, []);

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
      const response = await fetch('/api/settings/theming/footer-logo', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setFooterLogo(data.path);
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
      const response = await fetch('/api/settings/theming/footer-logo', {
        method: 'DELETE',
      });

      if (response.ok) {
        setFooterLogo(null);
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

  const renderLinksList = (columnData, sectionName) => (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {columnData.links.map((link) => (
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
              onClick={() => onEditLink(link, sectionName)}
              className="text-gray-500 hover:text-blue-500 dark:hover:text-blue-400"
              title="Edit Link"
            >
              <i className="ri-edit-line text-xl"></i>
            </button>
            <button
              onClick={() => onDeleteLink(link, sectionName)}
              className="text-gray-500 hover:text-red-500 dark:hover:text-red-400"
              title="Delete Link"
            >
              <i className="ri-delete-bin-line text-xl"></i>
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Footer Logo Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <label className="block font-medium text-gray-700 dark:text-gray-300">
            Footer Logo
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
            {footerLogo && (
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
            Upload a logo to replace the default footer text. The image will be automatically resized to fit within a 200x200 pixel area while maintaining its aspect ratio. For best results:
          </p>
          <ul className="list-disc list-inside mt-2 text-sm text-gray-600 dark:text-gray-400">
            <li>Use a transparent PNG or SVG file</li>
            <li>Keep the file size under 2MB</li>
            <li>Use an image with dimensions up to 200x200 pixels</li>
            <li>Ensure the image has adequate padding</li>
          </ul>
        </div>

        {footerLogo && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Logo:</p>
            <img 
              src={footerLogo} 
              alt="Footer Logo" 
              className="max-w-[200px] max-h-[200px] object-contain"
            />
          </div>
        )}
      </div>

      {/* Footer Column 1 */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="flex-1 mr-4">
            <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">
              Footer Links - Column 1 ({footerLinks.column1.links.length}/6)
            </label>
            <input
              type="text"
              value={footerLinks.column1.header}
              onChange={(e) => onHeaderChange('column1', e.target.value)}
              placeholder="Column 1 Header"
              className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              This column will only be visible in the footer if it contains at least one link.
            </p>
          </div>
          <button
            onClick={() => onAddLink('footer1')}
            className="px-4 py-2 bg-white shadow-lg dark:bg-gray-800 border border-gray-200 dark:text-white text-black hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg flex items-center gap-2 h-fit"
          >
            <i className="ri-add-line"></i>
            Add Link
          </button>
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          {footerLinks.column1.links.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No footer links added to column 1
            </div>
          ) : (
            renderLinksList(footerLinks.column1, 'footer1')
          )}
        </div>
      </div>

      {/* Footer Column 2 */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="flex-1 mr-4">
            <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">
              Footer Links - Column 2 ({footerLinks.column2.links.length}/6)
            </label>
            <input
              type="text"
              value={footerLinks.column2.header}
              onChange={(e) => onHeaderChange('column2', e.target.value)}
              placeholder="Column 2 Header"
              className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              This column will only be visible in the footer if it contains at least one link.
            </p>
          </div>
          <button
            onClick={() => onAddLink('footer2')}
            className="px-4 py-2 bg-white shadow-lg dark:bg-gray-800 border border-gray-200 dark:text-white text-black hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg flex items-center gap-2 h-fit"
          >
            <i className="ri-add-line"></i>
            Add Link
          </button>
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          {footerLinks.column2.links.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No footer links added to column 2
            </div>
          ) : (
            renderLinksList(footerLinks.column2, 'footer2')
          )}
        </div>
      </div>
    </div>
  );
};

export default FooterLinks;
