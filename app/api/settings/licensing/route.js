import { promises as fs } from 'fs';
import { join } from 'path';

async function verifyLicense(email, licenseKey) {
  try {
    console.log('Verifying license with:', { email, licenseKey });
    
    const response = await fetch('http://localhost:3001/api/license/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, licenseKey }),
    });
    
    const data = await response.json();
    console.log('License server response:', data);
    
    if (!response.ok) {
      console.error('License verification failed:', data);
      return { isValid: false, error: data.error || 'License verification failed' };
    }
    
    return {
      isValid: true,
      token: data.token,
      licenseType: data.licenseType,
      message: data.message
    };
  } catch (error) {
    console.error('License verification error:', error);
    return { isValid: false, error: error.message };
  }
}

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'config/settings/licensing.json');
    const fileContent = await fs.readFile(filePath, 'utf8');
    return new Response(fileContent, {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error reading licensing settings:', error);
    return new Response(JSON.stringify({ error: 'Failed to read licensing settings' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const filePath = join(process.cwd(), 'config/settings/licensing.json');
    
    // Verify the license
    const verificationResult = await verifyLicense(data.email, data.licenseKey);
    console.log('Verification result:', verificationResult);
    
    // Update the licensing data with verification results
    const updatedData = {
      email: data.email,
      key: data.licenseKey, // Store as 'key' for backward compatibility
      isValid: verificationResult.isValid,
      token: verificationResult.token,
      licenseType: verificationResult.licenseType,
      lastVerified: new Date().toISOString(),
      lastCheck: new Date().toISOString()
    };

    await fs.writeFile(filePath, JSON.stringify(updatedData, null, 2));
    
    return new Response(JSON.stringify({ 
      success: true,
      isValid: verificationResult.isValid,
      message: verificationResult.message || (verificationResult.isValid ? 'License verified successfully' : 'Invalid license'),
      licenseType: verificationResult.licenseType
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error saving licensing settings:', error);
    return new Response(JSON.stringify({ error: 'Failed to save licensing settings' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
