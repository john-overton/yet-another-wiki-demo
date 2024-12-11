import { promises as fs } from 'fs';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('avatar');
    const userId = formData.get('userId');

    if (!file || !userId) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Save to data/uploads/user-avatars
    const uploadDir = join(process.cwd(), 'data', 'uploads', 'user-avatars');
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename using crypto
    const randomValues = new Uint8Array(16);
    crypto.getRandomValues(randomValues);
    const uniqueId = Array.from(randomValues).map(b => b.toString(16).padStart(2, '0')).join('');
    const fileName = `${uniqueId}-cropped.jpg`;
    const filePath = join(uploadDir, fileName);

    // Convert file to buffer and save
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(filePath, buffer);

    // Store just the filename in database
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { avatar: fileName }, // Store only the filename
      select: {
        id: true,
        avatar: true,
      },
    });

    // Return the full path for immediate use
    return Response.json({
      ...updatedUser,
      avatar: `/api/uploads/user-avatars/${fileName}` // Return the dynamic API path
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return Response.json(
      { error: 'Failed to upload avatar' },
      { status: 500 }
    );
  }
}
