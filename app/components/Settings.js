'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ThemingSettings from './settings.theming';
import LicensingSettings from './settings.licensing';
import UserManagementSettings from './settings.users';
import BackupSettings from './settings.backup';
import pkg from '../../package.json';

const Settings = () => {
  const [expandedSections, setExpandedSections] = useState({
    theming: true,
    licensing: true,
    users: true,
    backup: true
  });
  const [licenseType, setLicenseType] = useState(null);

  useEffect(() => {
    const loadLicenseInfo = async () => {
      try {
        const response = await fetch('/api/settings/licensing');
        if (response.ok) {
          const settings = await response.json();
          setLicenseType(settings.licenseType);
        }
      } catch (error) {
        console.error('Error loading license info:', error);
      }
    };
    loadLicenseInfo();
  }, []);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const SectionHeader = ({ title, isExpanded, onToggle }) => (
    <div className="flex justify-between items-center bg-[#717171] dark:bg-[#1F2937] text-gray-300 px-4 py-2 rounded-t text-sm border-b border-gray-700">
      <span className="font-medium text-base">{title}</span>
      <button
        onClick={onToggle}
        className="hover:text-white transition-colors text-xs uppercase tracking-wider opacity-75 hover:opacity-100"
      >
        {isExpanded ? '▲ Hide Section' : '▼ Show Section'}
      </button>
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl font-bold">Settings</h1>
          <span className="text-[10px] text-gray-600 dark:text-gray-400">v{pkg.version}</span>
        </div>
        <Link
          href="/"
          className="px-4 py-2 bg-white shadow-lg dark:bg-gray-800 border border-gray-200 dark:text-white text-black hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg flex items-center gap-2"
        >
          <i className="ri-arrow-left-line"></i>
          Back to Home
        </Link>
      </div>

      {/* User Management Section - Only visible for pro license */}
      {licenseType === 'pro' && (
        <div className="mb-4">
          <div className="rounded-lg overflow-hidden border border-gray-700">
            <SectionHeader 
              title="User Management"
              isExpanded={expandedSections.users}
              onToggle={() => toggleSection('users')}
            />
            <div className={`transition-all duration-200 ${
              expandedSections.users ? 'opacity-100' : 'h-0 opacity-0 overflow-hidden'
            }`}>
              <UserManagementSettings />
            </div>
          </div>
        </div>
      )}

      {/* Backup Section */}
      <div className="mb-4">
        <div className="rounded-lg overflow-hidden border border-gray-700">
          <SectionHeader 
            title="Backup & Import"
            isExpanded={expandedSections.backup}
            onToggle={() => toggleSection('backup')}
          />
          <div className={`transition-all duration-200 ${
            expandedSections.backup ? 'opacity-100' : 'h-0 opacity-0 overflow-hidden'
          }`}>
            <BackupSettings />
          </div>
        </div>
      </div>

      {/* Theming Section */}
      <div className="mb-4">
        <div className="rounded-lg overflow-hidden border border-gray-700">
          <SectionHeader 
            title="Theming Settings"
            isExpanded={expandedSections.theming}
            onToggle={() => toggleSection('theming')}
          />
          <div className={`transition-all duration-200 ${
            expandedSections.theming ? 'opacity-100' : 'h-0 opacity-0 overflow-hidden'
          }`}>
            <ThemingSettings />
          </div>
        </div>
      </div>

      {/* Licensing Section */}
      <div className="mb-4">
        <div className="rounded-lg overflow-hidden border border-gray-700">
          <SectionHeader 
            title="Licensing Settings"
            isExpanded={expandedSections.licensing}
            onToggle={() => toggleSection('licensing')}
          />
          <div className={`transition-all duration-200 ${
            expandedSections.licensing ? 'opacity-100' : 'h-0 opacity-0 overflow-hidden'
          }`}>
            <LicensingSettings />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
