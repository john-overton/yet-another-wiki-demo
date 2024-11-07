import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { promises as fs } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    // Check license type first
    const licensePath = join(process.cwd(), 'config/settings/licensing.json');
    const licenseContent = await fs.readFile(licensePath, 'utf8');
    const licenseData = JSON.parse(licenseContent);

    // Only allow user creation with pro license
    if (licenseData.licenseType !== 'pro') {
      return new Response(JSON.stringify({ 
        error: 'User creation is only available with a pro license' 
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userData = await request.json();

    // Hash the password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create the user
    const user = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
        is_active: userData.is_active,
        auth_type: userData.auth_type,
        avatar: userData.avatar,
        voting_rights: userData.voting_rights,
      },
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    return new Response(JSON.stringify(userWithoutPassword), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return new Response(JSON.stringify({ error: 'Failed to create user' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    await prisma.$disconnect();
  }
}
