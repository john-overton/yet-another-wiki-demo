import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
  const { email } = await request.json();

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        secret_question_1: true,
        secret_question_2: true,
        secret_question_3: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const secretQuestions = [
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
    return NextResponse.json({ message: 'Error initiating password reset' }, { status: 500 });
  }
}
