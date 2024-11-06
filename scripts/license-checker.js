const fs = require('fs').promises;
const path = require('path');
const fetch = require('node-fetch');

async function verifyLicense(email, key) {
  try {
    const response = await fetch('http://localhost:3000/api/license/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, key }),
    });
    
    if (!response.ok) {
      throw new Error('License verification failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('License verification error:', error);
    return { isValid: false, error: error.message };
  }
}

async function checkLicense() {
  try {
    const filePath = path.join(process.cwd(), 'config/settings/licensing.json');
    const fileContent = await fs.readFile(filePath, 'utf8');
    const licenseData = JSON.parse(fileContent);

    if (!licenseData.email || !licenseData.key) {
      console.log('No license data found');
      return;
    }

    const verificationResult = await verifyLicense(licenseData.email, licenseData.key);
    
    // Update the licensing data with verification results
    const updatedData = {
      ...licenseData,
      isValid: verificationResult.isValid,
      lastCheck: new Date().toISOString()
    };

    await fs.writeFile(filePath, JSON.stringify(updatedData, null, 2));
    
    console.log(`License check completed at ${new Date().toISOString()}`);
    console.log(`License status: ${verificationResult.isValid ? 'Valid' : 'Invalid'}`);
  } catch (error) {
    console.error('Error during license check:', error);
  }
}

// Run initial check
checkLicense();

// Schedule checks every 3 hours
setInterval(checkLicense, 3 * 60 * 60 * 1000);

console.log('License checker started');
