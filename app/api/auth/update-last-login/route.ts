import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '../[...nextauth]/auth';
import { Session } from 'next-auth';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions) as Session | null;

  if (!session?.user?.email) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
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

    return NextResponse.json({ 
      success: true, 
      last_login: formattedDate 
    });
  } catch (error) {
    console.error('Error updating last login:', error);
    return NextResponse.json(
      { error: 'Failed to update last login' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
