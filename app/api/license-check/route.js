import { promises as fs } from 'fs';
import { join } from 'path';

async function verifyLicense(email, licenseKey) {
  try {
    console.log('Periodic license check for:', { email, licenseKey });
    
    const response = await fetch('http://localhost:3001/api/license/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, licenseKey }),
    });
    
    const data = await response.json();
    console.log('License server periodic check response:', data);
    
    if (!response.ok) {
      console.error('Periodic license check failed:', data);
      return { isValid: false, error: data.error || 'License verification failed' };
    }
    
    return {
      isValid: true,
      token: data.token,
      licenseType: data.licenseType,
      message: data.message
    };
  } catch (error) {
    console.error('Periodic license check error:', error);
    return { isValid: false, error: error.message };
  }
}

async function checkLicense() {
  try {
    const filePath = join(process.cwd(), 'config/settings/licensing.json');
    const fileContent = await fs.readFile(filePath, 'utf8');
    const licenseData = JSON.parse(fileContent);

    if (!licenseData.email || !licenseData.key) {
      console.log('No license data found during periodic check');
      return { success: false, message: 'No license data found' };
    }

    // Use stored 'key' as licenseKey for verification
    const verificationResult = await verifyLicense(licenseData.email, licenseData.key);
    console.log('Periodic verification result:', verificationResult);
    
    // Update the licensing data with verification results
    const updatedData = {
      ...licenseData,
      isValid: verificationResult.isValid,
      token: verificationResult.token,
      licenseType: verificationResult.licenseType,
      lastCheck: new Date().toISOString()
    };

    await fs.writeFile(filePath, JSON.stringify(updatedData, null, 2));
    
    return {
      success: true,
      isValid: verificationResult.isValid,
      message: verificationResult.message,
      licenseType: verificationResult.licenseType,
      lastCheck: updatedData.lastCheck
    };
  } catch (error) {
    console.error('Error during periodic license check:', error);
    return { success: false, error: error.message };
  }
}

export async function GET() {
  const result = await checkLicense();
  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' },
  });
}
