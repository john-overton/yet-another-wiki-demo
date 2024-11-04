import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';

const prisma = new PrismaClient();

export async function PUT(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, currentPassword, newPassword } = await request.json();

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: { password: true }
    });

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return Response.json({ error: 'Current password is incorrect' }, { status: 400 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { 
        password: hashedPassword,
        updated_at: new Date()
      }
    });

    return Response.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password update error:', error);
    return Response.json(
      { error: 'Failed to update password', details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
