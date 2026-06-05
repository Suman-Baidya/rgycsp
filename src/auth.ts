import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { db } from '@/lib/prisma';
import authConfig from '@/auth.config';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  ...authConfig,
  debug: process.env.NODE_ENV === "development",
  providers: [
    ...authConfig.providers,
    Credentials({
      name: "Student Login",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
        tenantSlug: { label: "Tenant Slug", type: "text" }
      },
      async authorize(credentials) {
        try {
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
              where: { email: username }
            });
          }

          if (!user || !user.passwordHash) {
            console.log("AUTH: User not found or no password hash");
            return null;
          }

          const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

          if (!isPasswordValid) {
            console.log("AUTH: Invalid password for user:", username);
            return null;
          }

          // Strict Tenant Verification
          if (credentials?.tenantSlug && credentials.tenantSlug !== "undefined" && credentials.tenantSlug !== "null") {
            const tenant = credentials.tenantSlug as string;
            if (tenant !== 'super-admin') {
              const workspace = await db.workspace.findUnique({
                where: { subdomain: tenant }
              });

              if (!workspace) {
                throw new Error("Invalid franchise workspace.");
              }

              const hasRole = await db.workspaceRole.findFirst({
                where: { userId: user.id, workspaceId: workspace.id }
              });

              const hasProfile = await db.studentProfile.findFirst({
                where: { userId: user.id, workspaceId: workspace.id }
              });

              if (!hasRole && !hasProfile) {
                console.log("AUTH: User does not belong to tenant", tenant);
                throw new Error("You do not have access to this franchise portal.");
              }
            }
          }

          console.log("AUTH: Successfully authorized user:", user.email || user.username);
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            username: user.username,
            role: user.role,
          };
        } catch (error) {
          console.error("AUTH_ERROR in authorize callback:", error);
          return null;
        }
      }
    })
  ],
});
