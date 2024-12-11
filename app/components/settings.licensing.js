'use client';

import { useState, useEffect } from 'react';

const LicensingSettings = ({ onLicenseVerified }) => {
  const [email, setEmail] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [licenseType, setLicenseType] = useState('');
  const [lastVerified, setLastVerified] = useState(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings/licensing');
        if (response.ok) {
          const settings = await response.json();
          setEmail(settings.email);
          setLicenseKey(settings.key);
          setIsValid(settings.isValid);
          setLicenseType(settings.licenseType);
          setLastVerified(settings.lastVerified);
        }
      } catch (error) {
        console.error('Error loading licensing settings:', error);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/settings/licensing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          licenseKey
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(result.message || 'License settings saved successfully');
        setIsValid(result.isValid);
        setLicenseType(result.licenseType);
        setLastVerified(new Date().toISOString());
        
        // If we have a callback for license verification, call it
        if (onLicenseVerified) {
          onLicenseVerified(result.isValid);
        }
      } else {
        setMessage(result.error || 'Failed to save license settings');
        if (onLicenseVerified) {
          onLicenseVerified(false);
        }
      }
    } catch (error) {
      console.error('Error saving license settings:', error);
      setMessage('Failed to save license settings');
      if (onLicenseVerified) {
        onLicenseVerified(false);
      }
    } finally {
      setIsSaving(false);
      if (!onLicenseVerified) { // Only auto-clear message if not in setup wizard
        setTimeout(() => setMessage(''), 3000);
      }
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Licensing</h2>
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
              Save License
            </>
          )}
        </button>
      </div>

      {/* License Status Banner */}
      <div className={`mb-4 p-4 rounded-lg flex items-center ${
        isValid 
          ? 'bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-600' 
          : 'bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600'
      }`}>
        <i className={`text-xl mr-2 ${
          isValid 
            ? 'ri-checkbox-circle-line text-green-600 dark:text-green-400' 
            : 'ri-error-warning-line text-red-600 dark:text-red-400'
        }`}></i>
        <div>
          <p className={`font-medium ${
            isValid 
              ? 'text-green-700 dark:text-green-300' 
              : 'text-red-700 dark:text-red-300'
          }`}>
            {isValid ? `License Valid - ${licenseType?.toUpperCase() || ''}` : 'License Invalid or Not Verified'}
          </p>
          {lastVerified && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Last verified: {new Date(lastVerified).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg ${
          message.includes('success') || message.includes('verified') 
            ? 'bg-green-100 text-green-700 border border-green-400' 
            : 'bg-red-100 text-red-700 border border-red-400'
        }`}>
          {message}
        </div>
      )}
      
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
            placeholder="Enter your license key (Format: XXXXX-XXXXXXXXXXXXXXXXXXX)"
          />
          <p className="mt-1 text-sm text-gray-500">
            Format: XXXXX-XXXXXXXXXXXXXXXXXXX
          </p>
        </div>

        {/* Verify Button */}
        <button 
          onClick={handleSave}
          className={`mt-4 px-4 py-2 shadow-lg border rounded-lg flex items-center gap-2 ${
            isValid
              ? 'bg-green-500 hover:bg-green-600 text-white border-green-600'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:text-white text-black hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          <i className={`${isValid ? 'ri-shield-check-line' : 'ri-shield-keyhole-line'}`}></i>
          Verify License
        </button>
      </div>
    </div>
  );
};

export default LicensingSettings;
