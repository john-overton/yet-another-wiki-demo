'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import pkg from '../../package.json';

const Footer = () => {
  const [footerLinks, setFooterLinks] = useState({
    column1: { header: '', links: [] },
    column2: { header: '', links: [] }
  });
  const [footerLogo, setFooterLogo] = useState(true);
  const [footerSettings, setFooterSettings] = useState({
    customCopyrightText: '',
    hidePoweredByText: false
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings/theming');
        if (response.ok) {
          const settings = await response.json();
          setFooterLinks(settings.footerLinks || {
            column1: { header: '', links: [] },
            column2: { header: '', links: [] }
          });
          setFooterLogo(settings.footerLogo || null);
          setFooterSettings(settings.footerSettings || {
            customCopyrightText: '',
            hidePoweredByText: false
          });
        }
      } catch (error) {
        console.error('Error loading footer settings:', error);
      }
    };
    loadSettings();
  }, []);

  const renderLinkColumn = (columnData) => {
    if (!columnData || !columnData.links || columnData.links.length === 0) return null;
    
    return (
      <div className="flex flex-col items-center">
        <div className="font-semibold mb-4">{columnData.header}</div>
        <div className="flex flex-col gap-4 items-center">
          {columnData.links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              title={link.hoverText}
              target={link.newTab ? "_blank" : "_self"}
              rel={link.newTab ? "noopener noreferrer" : ""}
              className="hover:text-gray-800 dark:hover:text-gray-200"
            >
              {link.text}
            </a>
          ))}
        </div>
      </div>
    );
  };

  // Determine if we should show two columns
  const hasTwoColumns = footerLinks.column2 && footerLinks.column2.links && footerLinks.column2.links.length > 0;

  return (
    <div className="bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600">
      <div className="grid grid-cols-2 h-[20rem] sm:grid-cols-2">
        {/* Left Box - Logo */}
        <div className="flex items-center justify-center sm:w-full md:w-full lg:w-full xl:w-full">
          {footerLogo ? (
            <Image
              src={footerLogo} 
              alt="Footer Logo" 
              width={200}
              height={200}
              className="max-w-[200px] max-h-[200px] object-contain"
            />
          ) : (
            <div className="text-6xl font-bold text-gray-800 dark:text-gray-200">
              Y.A.W.
            </div>
          )}
        </div>

        {/* Right Box - Links */}
        <div className="flex flex-col items-center justify-center text-gray-600 dark:text-gray-400">
          <div className={`flex ${hasTwoColumns ? 'gap-12' : 'justify-center w-full'}`}>
            {/* First Column */}
            {renderLinkColumn(footerLinks.column1)}
            
            {/* Second Column (if exists) */}
            {hasTwoColumns && renderLinkColumn(footerLinks.column2)}
          </div>
        </div>
      </div>

      {/* Bottom Box - Copyright */}
      <div className="h-12 flex items-center justify-between px-4">
        <div className="text-[10px] text-gray-600 dark:text-gray-400">
          v{pkg.version}
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400">
          {footerSettings.customCopyrightText || "Yet Another Wiki - © 2024"}
        </div>
        {!footerSettings.hidePoweredByText && (
          <div className="text-[10px] text-gray-600 dark:text-gray-400">
            Powered by Yet Another Wiki
          </div>
        ) || <div></div>}
      </div>
    </div>
  );
};

export default Footer;
