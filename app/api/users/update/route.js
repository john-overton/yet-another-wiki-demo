import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Encryption function using next-auth key
const encrypt = (text) => {
  if (!text) return null;
  
  const ENCRYPTION_KEY = process.env.NEXTAUTH_SECRET;
  if (!ENCRYPTION_KEY) {
    throw new Error('NEXTAUTH_SECRET is not set');
  }

  // Create a unique IV for each encryption
  const iv = crypto.randomBytes(16);
  
  // Create key from secret
  const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
  
  // Create cipher
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  
  // Encrypt the text
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Return IV and encrypted data
  return iv.toString('hex') + ':' + encrypted;
};

// Decryption function (might be needed for verification later)
const decrypt = (encryptedText) => {
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

export async function PUT(request) {
  try {
    const data = await request.json();

    const { 
      id, 
      name, 
      email, 
      is_active, 
      password, 
      role, 
      avatar, 
      resetSecurityQuestions,
      secret_question_1_id,
      secret_answer_1,
      secret_question_2_id,
      secret_answer_2,
      secret_question_3_id,
      secret_answer_3
    } = data;

    // Get user ID from session if not provided
    let userId = id;
    if (!userId) {
      const session = await getServerSession();
      if (!session?.user?.id) {
        return Response.json(
          { error: 'User ID not found' },
          { status: 401 }
        );
      }
      userId = session.user.id;
    }

    // Validate role if provided
    if (role) {
      const validRoles = ['User', 'PowerUser', 'Admin'];
      if (!validRoles.includes(role)) {
        return Response.json(
          { error: 'Invalid role specified' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData = {};

    // Add basic fields if they exist
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (typeof is_active !== 'undefined') updateData.is_active = is_active;
    if (role) updateData.role = role;
    if (avatar) updateData.avatar = avatar;

    // Always update the updated_at timestamp
    updateData.updated_at = new Date();

    // Handle password update
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    // Handle security questions
    if (resetSecurityQuestions) {
      // Reset all security questions if reset flag is true
      updateData.secret_question_1_id = null;
      updateData.secret_answer_1 = null;
      updateData.secret_question_2_id = null;
      updateData.secret_answer_2 = null;
      updateData.secret_question_3_id = null;
      updateData.secret_answer_3 = null;
    } else {
      // Update security questions if they are provided
      if (secret_question_1_id !== undefined) updateData.secret_question_1_id = secret_question_1_id;
      if (secret_answer_1 !== undefined) updateData.secret_answer_1 = encrypt(secret_answer_1);
      if (secret_question_2_id !== undefined) updateData.secret_question_2_id = secret_question_2_id;
      if (secret_answer_2 !== undefined) updateData.secret_answer_2 = encrypt(secret_answer_2);
      if (secret_question_3_id !== undefined) updateData.secret_question_3_id = secret_question_3_id;
      if (secret_answer_3 !== undefined) updateData.secret_answer_3 = encrypt(secret_answer_3);
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        auth_type: true,
        role: true,
        is_active: true,
        created_at: true,
        updated_at: true,
        last_login: true,
        secret_question_1_id: true,
        secret_question_2_id: true,
        secret_question_3_id: true,
      },
    });

    return Response.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return Response.json(
      { error: 'Failed to update user', details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
