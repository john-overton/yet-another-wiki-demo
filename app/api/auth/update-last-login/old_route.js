import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../[...nextauth]/route';

const prisma = new PrismaClient();

export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const currentDate = new Date();
    const isoString = currentDate.toISOString();
    
    console.log('Updating last_login with:', isoString);

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { last_login: isoString },
    });

    console.log('Updated user:', JSON.stringify(updatedUser, null, 2));
    console.log('last_login type:', typeof updatedUser.last_login);
    console.log('last_login value:', updatedUser.last_login);

    // Format the date for the response
    const formattedDate = isoString.replace('T', ' ').slice(0, -1);

    return new Response(JSON.stringify({ 
      success: true, 
      last_login: formattedDate
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating last login:', error);
    return new Response(JSON.stringify({ error: 'Failed to update last login' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    await prisma.$disconnect();
  }
}
