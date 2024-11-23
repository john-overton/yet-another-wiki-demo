import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { getServerSession } from 'next-auth/next';
import type { NextRequest } from 'next/server';
import { authOptions } from '../../auth/[...nextauth]/auth';

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const envPath = join(process.cwd(), '.env');
    const envContent = await readFile(envPath, 'utf8');
    
    // Extract NEXTAUTH_URL
    const nextAuthUrl = envContent.split('\n')
      .find(line => line.startsWith('NEXTAUTH_URL='))
      ?.split('=')[1]
      ?.trim() || '';

    return new Response(JSON.stringify({ nextAuthUrl }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { nextAuthUrl } = await request.json();
    if (!nextAuthUrl) {
      return new Response(JSON.stringify({ error: 'NEXTAUTH_URL is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const envPath = join(process.cwd(), '.env');
    const envContent = await readFile(envPath, 'utf8');
    
    // Update or add NEXTAUTH_URL
    const lines = envContent.split('\n');
    const nextAuthUrlIndex = lines.findIndex(line => line.startsWith('NEXTAUTH_URL='));
    
    if (nextAuthUrlIndex !== -1) {
      lines[nextAuthUrlIndex] = `NEXTAUTH_URL=${nextAuthUrl}`;
    } else {
      lines.push(`NEXTAUTH_URL=${nextAuthUrl}`);
    }

    await writeFile(envPath, lines.join('\n'));

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
