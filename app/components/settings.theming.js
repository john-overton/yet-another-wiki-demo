'use client';

import { useState, useEffect } from 'react';
import { Open_Sans } from 'next/font/google';
import { useTheme } from 'next-themes';

const openSans = Open_Sans({
  subsets: ['latin'],
  display: 'swap',
});

const ThemingSettings = () => {
  const [font, setFont] = useState('Open Sans');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const { resolvedTheme, theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Only load font settings initially
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings/theming');
        if (response.ok) {
          const settings = await response.json();
          setFont(settings.font);
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
          theme: currentTheme
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
      <div>
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
    </div>
  );
};

export default ThemingSettings;
