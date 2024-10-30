import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

interface ResetPasswordRequest {
  email: string;
  newPassword: string;
}

export async function POST(request: Request) {
  const { email, newPassword } = await request.json() as ResetPasswordRequest;

  if (!email || !newPassword) {
    return NextResponse.json(
      { message: 'Email and new password are required' },
      { status: 400 }
    );
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { 
        password: hashedPassword,
        updated_at: new Date() // Update the updated_at timestamp
      },
      select: {
        id: true,
        email: true,
        updated_at: true
      }
    });

    if (updatedUser) {
      return NextResponse.json(
        { message: 'Password reset successfully' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: 'Failed to reset password' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { 
        message: 'Error resetting password',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
