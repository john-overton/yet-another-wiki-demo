import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ResetPasswordRequest {
  email: string;
}

interface SecretQuestion {
  id: number;
  question: string;
}

interface UserWithSecretQuestions {
  secret_question_1: { question: string };
  secret_question_2: { question: string };
  secret_question_3: { question: string };
}

export async function POST(request: Request) {
  const { email } = await request.json() as ResetPasswordRequest;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        secret_question_1: true,
        secret_question_2: true,
        secret_question_3: true,
      },
    }) as (UserWithSecretQuestions & { id: number }) | null;

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const secretQuestions: SecretQuestion[] = [
      { id: 1, question: user.secret_question_1.question },
      { id: 2, question: user.secret_question_2.question },
      { id: 3, question: user.secret_question_3.question },
    ];

    // Randomly select one question
    const randomIndex = Math.floor(Math.random() * secretQuestions.length);
    const selectedQuestion = secretQuestions[randomIndex];

    return NextResponse.json({ 
      secretQuestion: selectedQuestion.question,
      questionId: selectedQuestion.id
    }, { status: 200 });
  } catch (error) {
    console.error('Error initiating password reset:', error);
    return NextResponse.json(
      { 
        message: 'Error initiating password reset',
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}
