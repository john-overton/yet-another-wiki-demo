import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function POST(request) {
  const { name, email, password, secretQuestions, secretAnswers } = await request.json();

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }

    // Validate secret questions
    if (secretQuestions.length !== 3 || secretAnswers.length !== 3) {
      return NextResponse.json({ message: 'Three secret questions and answers are required' }, { status: 400 });
    }

    // Check for unique secret questions
    if (new Set(secretQuestions).size !== 3) {
      return NextResponse.json({ message: 'Secret questions must be unique' }, { status: 400 });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const hashedAnswers = secretAnswers.map(answer => bcrypt.hashSync(answer, 10));

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        auth_type: 'Email',
        role: 'User',
        is_active: true,
        avatar: null,
        current_active_company_id: null,
        notification_preferences: null, // Set to null instead of an empty object
        voting_rights: false,
        created_at: new Date(),
        updated_at: new Date(),
        secret_question_1_id: parseInt(secretQuestions[0]),
        secret_answer_1: hashedAnswers[0],
        secret_question_2_id: parseInt(secretQuestions[1]),
        secret_answer_2: hashedAnswers[1],
        secret_question_3_id: parseInt(secretQuestions[2]),
        secret_answer_3: hashedAnswers[2],
      },
    });

    return NextResponse.json({ message: 'User created successfully', userId: user.id }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ message: 'Error creating user', error: error.message }, { status: 500 });
  }
}
