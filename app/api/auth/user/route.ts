import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '../[...nextauth]/auth';
import { Session } from 'next-auth';

const prisma = new PrismaClient();

interface UserResponse {
  id: number;
  email: string;
  name: string;
  role: string;
  avatar: string | null;
  auth_type: string;
  is_active: boolean;
  last_login: string | null;
  created_at: Date;
  updated_at: Date;
  [key: string]: any; // For any additional fields from Prisma
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions) as Session | null;

  if (!session?.user?.email) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('Fetched user:', JSON.stringify(user, null, 2));
    console.log('last_login type:', typeof user.last_login);
    console.log('last_login value:', user.last_login);

    // Convert dates to ISO strings
    const formattedLastLogin = user.last_login ? new Date(user.last_login).toISOString() : null;
    const formattedCreatedAt = new Date(user.created_at).toISOString();
    const formattedUpdatedAt = new Date(user.updated_at).toISOString();

    const userWithFormattedDate: UserResponse = {
      ...user,
      last_login: formattedLastLogin,
      created_at: user.created_at,
      updated_at: user.updated_at
    };

    return NextResponse.json(userWithFormattedDate);
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch user data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
