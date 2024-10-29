import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    console.log('Session user:', session.user); // Debug log

    const userId = parseInt(session.user.id);
    
    if (isNaN(userId)) {
      console.error('Invalid user ID:', session.user.id);
      return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { 
        id: userId,
      },
    });

    if (!user) {
      console.error('User not found for ID:', userId);
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    console.log('Found user:', user); // Debug log

    // Return all user fields except password and secret answers
    const sanitizedUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      auth_type: user.auth_type,
      role: user.role,
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at,
      last_login: user.last_login,
    };

    return NextResponse.json(sanitizedUser);
  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    return NextResponse.json(
      { message: 'Error fetching user data', error: error.message },
      { status: 500 }
    );
  }
}
