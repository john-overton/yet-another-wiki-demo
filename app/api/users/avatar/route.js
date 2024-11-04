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

    // Store the API route path in database
    const avatarUrl = `/api/users/avatar/${fileName}`;
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

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const segments = url.pathname.split('/');
    const filename = segments[segments.length - 1];
    
    if (!filename) {
      return new Response('File not found', { status: 404 });
    }

    // Ensure we only serve jpg files
    if (!filename.toLowerCase().endsWith('.jpg')) {
      return new Response('Invalid file type', { status: 400 });
    }

    const filePath = join(process.cwd(), 'data', 'uploads', 'user-avatars', filename);
    
    try {
      // Read the file in chunks for better memory handling
      const fileHandle = await fs.open(filePath, 'r');
      const { size } = await fileHandle.stat();
      const stream = fileHandle.createReadStream();

      // Return a streaming response
      return new Response(stream, {
        headers: {
          'Content-Type': 'image/jpeg',
          'Content-Length': size.toString(),
          'Cache-Control': 'no-cache',
          'Content-Disposition': 'inline',
        },
      });
    } catch (error) {
      console.error('Error reading file:', error);
      return new Response('File not found', { status: 404 });
    }
  } catch (error) {
    console.error('Error serving avatar:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
