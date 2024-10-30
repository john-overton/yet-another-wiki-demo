import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

interface VerifyRequest {
  email: string;
  questionId: 1 | 2 | 3;
  secretAnswer: string;
}

interface UserWithSecretAnswers {
  id: number;
  email: string;
  secret_answer_1: string;
  secret_answer_2: string;
  secret_answer_3: string;
}

export async function POST(request: Request) {
  const { email, questionId, secretAnswer } = await request.json() as VerifyRequest;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        secret_answer_1: true,
        secret_answer_2: true,
        secret_answer_3: true,
      },
    }) as UserWithSecretAnswers | null;

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    let isAnswerCorrect: boolean;
    let storedAnswer: string;

    switch (questionId) {
      case 1:
        storedAnswer = user.secret_answer_1;
        break;
      case 2:
        storedAnswer = user.secret_answer_2;
        break;
      case 3:
        storedAnswer = user.secret_answer_3;
        break;
      default:
        return NextResponse.json({ message: 'Invalid question ID' }, { status: 400 });
    }

    if (!storedAnswer) {
      return NextResponse.json({ message: 'Secret answer not found' }, { status: 400 });
    }

    isAnswerCorrect = await bcrypt.compare(secretAnswer, storedAnswer);

    if (isAnswerCorrect) {
      return NextResponse.json({ message: 'Answer verified successfully' }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Incorrect answer' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error verifying answer:', error);
    return NextResponse.json(
      { 
        message: 'Error verifying answer',
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}
