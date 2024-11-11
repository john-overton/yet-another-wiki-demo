'use client';

import { useState, useEffect } from 'react';
import { Open_Sans } from 'next/font/google';
import { useTheme } from 'next-themes';
import LinkModal from './settings.theming.linkmodal';
import DeleteConfirmModal from './DeleteConfirmModal';
import HeaderLinks from './settings.theming.header';
import FooterLinks from './settings.theming.footer';

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
  const [footerSettings, setFooterSettings] = useState({
    customCopyrightText: '',
    hidePoweredByText: false
  });
  const [headerLogo, setHeaderLogo] = useState(null);
  const [footerLogo, setFooterLogo] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const { resolvedTheme, theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState(null);
  const [currentEditingSection, setCurrentEditingSection] = useState('header');
  const [isProLicense, setIsProLicense] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [themingResponse, licenseResponse] = await Promise.all([
          fetch('/api/settings/theming'),
          fetch('/api/settings/licensing')
        ]);

        if (licenseResponse.ok) {
          const licenseData = await licenseResponse.json();
          setIsProLicense(licenseData.licenseType === 'pro');
        }

        if (themingResponse.ok) {
          const settings = await themingResponse.json();
          setFont(settings.font);
          setLinks(settings.links || []);
          setFooterLinks(settings.footerLinks || {
            column1: { header: '', links: [] },
            column2: { header: '', links: [] }
          });
          setFooterSettings(settings.footerSettings || {
            customCopyrightText: '',
            hidePoweredByText: false
          });
          setHeaderLogo(settings.headerLogo || null);
          setFooterLogo(settings.footerLogo || null);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
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
          footerLinks,
          footerSettings,
          headerLogo,
          footerLogo
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

  const handleHeaderLogoChange = (logoPath) => {
    setHeaderLogo(logoPath);
  };

  const handleFooterLogoChange = (logoPath) => {
    setFooterLogo(logoPath);
  };

  const handleFooterSettingsChange = (newSettings) => {
    setFooterSettings(newSettings);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">System Theming</h2>
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
      {/* COMMENTED OUT FONT SECTION FOR LATER USE
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
      */}

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
      <hr className="mb-3"></hr>

      {/* Header Links Management */}
      <HeaderLinks
        links={links}
        headerLogo={headerLogo}
        onAddLink={() => handleAddLink('header')}
        onEditLink={(link) => {
          setCurrentEditingSection('header');
          setEditingLink(link);
          setIsLinkModalOpen(true);
        }}
        onDeleteLink={(link) => {
          setCurrentEditingSection('header');
          setLinkToDelete(link);
          setIsDeleteModalOpen(true);
        }}
        onLogoChange={handleHeaderLogoChange}
      />
      <hr className="mb-3"></hr>

      {/* Footer Links Management */}
      <FooterLinks
        footerLinks={footerLinks}
        footerLogo={footerLogo}
        footerSettings={footerSettings}
        onAddLink={handleAddLink}
        onEditLink={(link, section) => {
          setCurrentEditingSection(section);
          setEditingLink(link);
          setIsLinkModalOpen(true);
        }}
        onDeleteLink={(link, section) => {
          setCurrentEditingSection(section);
          setLinkToDelete(link);
          setIsDeleteModalOpen(true);
        }}
        onHeaderChange={handleHeaderChange}
        onLogoChange={handleFooterLogoChange}
        onSettingsChange={handleFooterSettingsChange}
        isProLicense={isProLicense}
      />

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
