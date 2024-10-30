import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function POST(request) {
  const { email, newPassword } = await request.json();

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    if (updatedUser) {
      return NextResponse.json({ message: 'Password reset successfully' }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Failed to reset password' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json({ message: 'Error resetting password' }, { status: 500 });
  }
}
