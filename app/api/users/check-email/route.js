import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { email } = await request.json();

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    return new Response(JSON.stringify({ exists: !!existingUser }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error checking email:', error);
    return new Response(JSON.stringify({ error: 'Failed to check email' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    await prisma.$disconnect();
  }
}
