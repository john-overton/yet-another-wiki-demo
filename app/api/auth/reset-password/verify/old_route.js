import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function POST(request) {
  const { email, questionId, secretAnswer } = await request.json();

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    let isAnswerCorrect;

    switch (questionId) {
      case 1:
        isAnswerCorrect = await bcrypt.compare(secretAnswer, user.secret_answer_1);
        break;
      case 2:
        isAnswerCorrect = await bcrypt.compare(secretAnswer, user.secret_answer_2);
        break;
      case 3:
        isAnswerCorrect = await bcrypt.compare(secretAnswer, user.secret_answer_3);
        break;
      default:
        return NextResponse.json({ message: 'Invalid question ID' }, { status: 400 });
    }

    if (isAnswerCorrect) {
      return NextResponse.json({ message: 'Answer verified successfully' }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Incorrect answer' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error verifying answer:', error);
    return NextResponse.json({ message: 'Error verifying answer' }, { status: 500 });
  }
}
