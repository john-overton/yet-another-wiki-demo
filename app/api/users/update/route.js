import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function PUT(request) {
  try {
    const data = await request.json();
    const { id, name, email, is_active, password, role, avatar } = data;

    // Validate role
    const validRoles = ['User', 'PowerUser', 'Admin'];
    if (role && !validRoles.includes(role)) {
      return Response.json(
        { error: 'Invalid role specified' },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData = {
      name,
      email,
      is_active,
      role,
      updated_at: new Date(),
    };

    // Only include avatar if it's provided
    if (avatar) {
      updateData.avatar = avatar;
    }

    // Only hash and update password if it's provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
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
