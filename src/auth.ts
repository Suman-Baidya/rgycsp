import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { db } from '@/lib/prisma';
import authConfig from '@/auth.config';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  ...authConfig,
  providers: [
    ...authConfig.providers,
    Credentials({
      name: "Student Login",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const username = credentials.username as string;
        const password = credentials.password as string;

        // Try username first (Student/Applicant)
        let user = await db.user.findUnique({
          where: { username }
        });

        // If not found by username, try email (Staff/Admin)
        if (!user) {
          user = await db.user.findUnique({
            where: { email: username } // Allowing email in the username field
          });
        }

        if (!user || !user.passwordHash) return null;

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          role: user.role,
        };
      }
    })
  ],
});
