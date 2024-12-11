import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { AuthOptions } from 'next-auth';
import { User } from 'next-auth';
import { recordSuspiciousActivity } from '../../../../scripts/ip-blocker';

const prisma = new PrismaClient();

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });

          if (!user || !user.password) {
            // Record failed login attempt
            const ip = req.headers?.['x-real-ip'] as string || 
                      req.headers?.['x-forwarded-for'] as string || 
                      '0.0.0.0';
            await recordSuspiciousActivity(ip, 'failed_login');
            return null;
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

          if (!isPasswordValid) {
            // Record failed login attempt
            const ip = req.headers?.['x-real-ip'] as string || 
                      req.headers?.['x-forwarded-for'] as string || 
                      '0.0.0.0';
            await recordSuspiciousActivity(ip, 'failed_login');
            return null;
          }

          // Update last login time
          await prisma.user.update({
            where: { id: user.id },
            data: { 
              last_login: new Date().toISOString(),
              updated_at: new Date()
            }
          });

          return {
            id: String(user.id),
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar,
            auth_type: user.auth_type,
            is_active: user.is_active,
            active: user.active
          };
        } catch (error) {
          console.error('Error during authentication:', error);
          return null;
        } finally {
          await prisma.$disconnect();
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.avatar = user.avatar;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.avatar = token.avatar;
      }
      return session;
    },
  }
};
