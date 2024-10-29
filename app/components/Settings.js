'use client';

import { useState, useEffect } from 'react';
import { Open_Sans } from 'next/font/google';
import { useTheme } from 'next-themes';
import Link from 'next/link';

const openSans = Open_Sans({
  subsets: ['latin'],
  display: 'swap',
});

const Settings = () => {
  const [font, setFont] = useState('Open Sans');
  const [email, setEmail] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const settings = await response.json();
          setFont(settings.font);
          setEmail(settings.license.email);
          setLicenseKey(settings.license.key);
          if (settings.theme !== 'system') {
            setTheme(settings.theme);
          }
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    loadSettings();
  }, [setTheme]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          font,
          theme,
          license: {
            email,
            key: licenseKey
          }
        }),
      });

      if (response.ok) {
        setMessage('Settings saved successfully');
        // Apply font change to ClientLayout
        document.documentElement.style.setProperty('--font-family', font);
      } else {
        setMessage('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('Failed to save settings');
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <div className="flex gap-4">
          <Link
            href="/"
            className="px-4 py-2 bg-white shadow-lg dark:bg-gray-800 border border-gray-200 dark:text-white text-black hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg flex items-center gap-2"
          >
            <i className="ri-arrow-left-line"></i>
            Back to Home
          </Link>
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
                Save Changes
              </>
            )}
          </button>
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

      {/* Theming Section */}
      <div className="mb-8 p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Theming</h2>
        
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
                theme === 'light' ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <i className="ri-sun-line mr-2"></i>
              Light
            </button>
            <button 
              onClick={() => setTheme('dark')}
              className={`px-4 py-2 bg-white shadow-lg dark:bg-gray-800 border border-gray-200 dark:text-white text-black hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg ${
                theme === 'dark' ? 'ring-2 ring-blue-500' : ''
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

      {/* Licensing Section */}
      <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Licensing</h2>
        
        <div className="space-y-4">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
            />
          </div>

          {/* License Key Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              License Key
            </label>
            <input
              type="text"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your license key"
            />
          </div>

          {/* Verify Button */}
          <button className="mt-4 px-4 py-2 bg-white shadow-lg dark:bg-gray-800 border border-gray-200 dark:text-white text-black hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg">
            <i className="ri-shield-check-line mr-2"></i>
            Verify License
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
