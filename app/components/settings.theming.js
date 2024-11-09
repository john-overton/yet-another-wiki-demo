'use client';

import { useState, useEffect } from 'react';
import { Open_Sans } from 'next/font/google';
import { useTheme } from 'next-themes';
import LinkModal from './settings.theming.linkmodal';
import DeleteConfirmModal from './DeleteConfirmModal';

const openSans = Open_Sans({
  subsets: ['latin'],
  display: 'swap',
});

const ThemingSettings = () => {
  const [font, setFont] = useState('Open Sans');
  const [links, setLinks] = useState([]);
  const [footerLinks, setFooterLinks] = useState({
    column1: { header: '', links: [] },
    column2: { header: '', links: [] }
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const { resolvedTheme, theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState(null);
  const [currentEditingSection, setCurrentEditingSection] = useState('header'); // 'header', 'footer1', or 'footer2'

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings/theming');
        if (response.ok) {
          const settings = await response.json();
          setFont(settings.font);
          setLinks(settings.links || []);
          setFooterLinks(settings.footerLinks || {
            column1: { header: '', links: [] },
            column2: { header: '', links: [] }
          });
        }
      } catch (error) {
        console.error('Error loading theming settings:', error);
      }
      setMounted(true);
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const currentTheme = theme || resolvedTheme;
      const response = await fetch('/api/settings/theming', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          font,
          theme: currentTheme,
          links,
          footerLinks
        }),
      });

      if (response.ok) {
        setMessage('Theming settings saved successfully');
        document.documentElement.style.setProperty('--font-family', font);
      } else {
        setMessage('Failed to save theming settings');
      }
    } catch (error) {
      console.error('Error saving theming settings:', error);
      setMessage('Failed to save theming settings');
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleLinkSubmit = async (e, linkData) => {
    e.preventDefault();
    const newLink = { ...linkData, id: editingLink ? editingLink.id : Date.now() };

    if (currentEditingSection === 'header') {
      if (editingLink) {
        setLinks(prevLinks => 
          prevLinks.map(link => link.id === editingLink.id ? newLink : link)
        );
      } else {
        setLinks(prevLinks => [...prevLinks, newLink]);
      }
    } else {
      const column = currentEditingSection === 'footer1' ? 'column1' : 'column2';
      setFooterLinks(prev => ({
        ...prev,
        [column]: {
          ...prev[column],
          links: editingLink
            ? prev[column].links.map(link => link.id === editingLink.id ? newLink : link)
            : [...prev[column].links, newLink]
        }
      }));
    }

    setIsLinkModalOpen(false);
    setEditingLink(null);
  };

  const handleDeleteConfirm = () => {
    if (currentEditingSection === 'header') {
      setLinks(prevLinks => prevLinks.filter(link => link.id !== linkToDelete.id));
    } else {
      const column = currentEditingSection === 'footer1' ? 'column1' : 'column2';
      setFooterLinks(prev => ({
        ...prev,
        [column]: {
          ...prev[column],
          links: prev[column].links.filter(link => link.id !== linkToDelete.id)
        }
      }));
    }
    setIsDeleteModalOpen(false);
    setLinkToDelete(null);
  };

  const handleAddLink = (section) => {
    const maxLinks = section === 'header' ? 5 : 6;
    const currentLinks = section === 'header' 
      ? links 
      : section === 'footer1' 
        ? footerLinks.column1.links 
        : footerLinks.column2.links;

    if (currentLinks.length >= maxLinks) {
      setMessage(`Maximum of ${maxLinks} links allowed in this section`);
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setCurrentEditingSection(section);
    setEditingLink(null);
    setIsLinkModalOpen(true);
  };

  const handleHeaderChange = (column, value) => {
    setFooterLinks(prev => ({
      ...prev,
      [column]: {
        ...prev[column],
        header: value
      }
    }));
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
              onClick={() => {
                setCurrentEditingSection(sectionName);
                setEditingLink(link);
                setIsLinkModalOpen(true);
              }}
              className="text-gray-500 hover:text-blue-500 dark:hover:text-blue-400"
              title="Edit Link"
            >
              <i className="ri-edit-line text-xl"></i>
            </button>
            <button
              onClick={() => {
                setCurrentEditingSection(sectionName);
                setLinkToDelete(link);
                setIsDeleteModalOpen(true);
              }}
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

  if (!mounted) {
    return null;
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Theming</h2>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-white shadow-lg dark:bg-gray-800 border border-gray-200 dark:text-white text-black hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <i className="ri-loader-4-line animate-spin"></i>
              Saving...
            </>
          ) : (
            <>
              <i className="ri-save-line"></i>
              Save Theme
            </>
          )}
        </button>
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
      
      {/* Font Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Font Family
        </label>
        <select
          value={font}
          onChange={(e) => setFont(e.target.value)}
          className={`w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 ${openSans.className}`}
        >
          <option value="Open Sans">Open Sans</option>
          <option value="Roboto">Roboto</option>
          <option value="Arial">Arial</option>
        </select>
      </div>

      {/* Theme Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Theme
        </label>
        <div className="flex gap-4">
          <button 
            onClick={() => setTheme('light')}
            className={`px-4 py-2 bg-white shadow-lg dark:bg-gray-800 border border-gray-200 dark:text-white text-black hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg ${
              resolvedTheme === 'light' ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <i className="ri-sun-line mr-2"></i>
            Light
          </button>
          <button 
            onClick={() => setTheme('dark')}
            className={`px-4 py-2 bg-white shadow-lg dark:bg-gray-800 border border-gray-200 dark:text-white text-black hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg ${
              resolvedTheme === 'dark' ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <i className="ri-moon-line mr-2"></i>
            Dark
          </button>
          <button 
            onClick={() => setTheme('system')}
            className={`px-4 py-2 bg-white shadow-lg dark:bg-gray-800 border border-gray-200 dark:text-white text-black hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg ${
              theme === 'system' ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <i className="ri-computer-line mr-2"></i>
            System
          </button>
        </div>
      </div>

      {/* Header Links Management */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Header Navigation Links ({links.length}/5)
          </label>
          <button
            onClick={() => handleAddLink('header')}
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
                      onClick={() => {
                        setCurrentEditingSection('header');
                        setEditingLink(link);
                        setIsLinkModalOpen(true);
                      }}
                      className="text-gray-500 hover:text-blue-500 dark:hover:text-blue-400"
                      title="Edit Link"
                    >
                      <i className="ri-edit-line text-xl"></i>
                    </button>
                    <button
                      onClick={() => {
                        setCurrentEditingSection('header');
                        setLinkToDelete(link);
                        setIsDeleteModalOpen(true);
                      }}
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

      {/* Footer Links Management */}
      <div className="space-y-8">
        {/* Footer Column 1 */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="flex-1 mr-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Footer Links - Column 1 ({footerLinks.column1.links.length}/6)
              </label>
              <input
                type="text"
                value={footerLinks.column1.header}
                onChange={(e) => handleHeaderChange('column1', e.target.value)}
                placeholder="Column 1 Header"
                className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                This column will only be visible in the footer if it contains at least one link.
              </p>
            </div>
            <button
              onClick={() => handleAddLink('footer1')}
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Footer Links - Column 2 ({footerLinks.column2.links.length}/6)
              </label>
              <input
                type="text"
                value={footerLinks.column2.header}
                onChange={(e) => handleHeaderChange('column2', e.target.value)}
                placeholder="Column 2 Header"
                className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                This column will only be visible in the footer if it contains at least one link
              </p>
            </div>
            <button
              onClick={() => handleAddLink('footer2')}
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

      <LinkModal
        isOpen={isLinkModalOpen}
        onClose={() => {
          setIsLinkModalOpen(false);
          setEditingLink(null);
        }}
        onSubmit={handleLinkSubmit}
        link={editingLink}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setLinkToDelete(null);
        }}
        itemTitle={linkToDelete?.text || ''}
      />
    </div>
  );
};

export default ThemingSettings;
