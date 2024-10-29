import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function PUT(request) {
  try {
    const data = await request.json();
    const { id, name, email, is_active, password } = data;

    // Prepare update data
    const updateData = {
      name,
      email,
      is_active,
      updated_at: new Date(),
    };

    // Only hash and update password if it's provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        auth_type: true,
        role: true,
        is_active: true,
        created_at: true,
        updated_at: true,
        last_login: true,
      },
    });

    return Response.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return Response.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
