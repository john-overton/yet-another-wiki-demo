import { readFile } from 'fs/promises';
import { join } from 'path';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/auth';

export async function POST() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== 'Admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Read the current .env file
    const envPath = join(process.cwd(), '.env');
    const envContent = await readFile(envPath, 'utf8');
    
    // Parse NEXTAUTH_URL from .env file
    const nextAuthUrl = envContent.split('\n')
      .find(line => line.startsWith('NEXTAUTH_URL='))
      ?.split('=')[1]
      ?.trim();

    if (!nextAuthUrl) {
      throw new Error('NEXTAUTH_URL not found in .env file');
    }

    // Update process.env
    process.env.NEXTAUTH_URL = nextAuthUrl;

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Environment variables reloaded successfully'
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to reload environment variables:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
