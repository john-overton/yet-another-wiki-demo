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

    // Create user-avatars directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'user-avatars');
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

    console.log('Saving file to:', filePath);

    // Convert file to buffer and save
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(filePath, buffer);

    // Verify file was written
    const fileExists = await fs.stat(filePath).catch(() => false);
    console.log('File exists after write:', !!fileExists);

    // Store the relative path in the database
    const avatarUrl = `/user-avatars/${fileName}`;
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { avatar: avatarUrl },
      select: {
        id: true,
        avatar: true,
      },
    });

    return Response.json(updatedUser);
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return Response.json(
      { error: 'Failed to upload avatar' },
      { status: 500 }
    );
  }
}
