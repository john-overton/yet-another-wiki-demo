import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

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

// Decryption function using next-auth key
const decrypt = (encryptedText: string | null): string | null => {
  if (!encryptedText) return null;
  
  const ENCRYPTION_KEY = process.env.NEXTAUTH_SECRET;
  if (!ENCRYPTION_KEY) {
    throw new Error('NEXTAUTH_SECRET is not set');
  }

  // Split IV and encrypted data
  const [ivHex, encrypted] = encryptedText.split(':');
  if (!ivHex || !encrypted) return null;

  // Convert IV back to Buffer
  const iv = Buffer.from(ivHex, 'hex');
  
  // Create key from secret
  const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
  
  // Create decipher
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  
  // Decrypt the text
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};

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

    let storedAnswer: string | null;

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

    // Decrypt the stored answer and compare with provided answer
    const decryptedAnswer = decrypt(storedAnswer);
    if (!decryptedAnswer) {
      return NextResponse.json({ message: 'Error decrypting answer' }, { status: 500 });
    }

    const isAnswerCorrect = decryptedAnswer === secretAnswer;

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
