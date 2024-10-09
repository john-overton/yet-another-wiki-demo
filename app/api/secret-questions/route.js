import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const secretQuestions = await prisma.secretQuestion.findMany();
    return NextResponse.json(secretQuestions);
  } catch (error) {
    console.error('Error fetching secret questions:', error);
    return NextResponse.json({ error: 'Failed to fetch secret questions' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
