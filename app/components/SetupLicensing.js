'use client';

import { useState, useEffect } from 'react';
import LicensingSettings from './settings.licensing';

const SetupLicensing = ({ onComplete }) => {
  const [isValid, setIsValid] = useState(false);

  // Create a wrapper for the onComplete callback
  const handleLicenseVerified = async (success) => {
    if (success) {
      setIsValid(true);
      // Give user time to see success message before proceeding
      setTimeout(() => {
        onComplete();
      }, 1500);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          License Activation
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Please enter your license information to complete the setup
        </p>
      </div>

      {/* Use existing LicensingSettings with a callback for license verification */}
      <div className="licensing-wrapper">
        <LicensingSettings onLicenseVerified={handleLicenseVerified} />
      </div>
    </div>
  );
};

export default SetupLicensing;
