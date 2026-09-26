import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { db } from '@/lib/prisma';
import authConfig from '@/auth.config';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { isDeveloperEmail } from '@/lib/developer';

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

          const cleanUsername = username.trim();
          const upperUsername = cleanUsername.toUpperCase();
          const lowerEmail = cleanUsername.toLowerCase();

          // Try username first (Student/Applicant)
          let user = await db.user.findFirst({
            where: { 
              OR: [
                { username: cleanUsername },
                { username: upperUsername }
              ]
            }
          });

          // If not found by username, try email (Staff/Admin)
          if (!user) {
            user = await db.user.findFirst({
              where: { 
                OR: [
                  { email: cleanUsername },
                  { email: lowerEmail }
                ]
              }
            });
          }

          // If not found by email, try Center Code (Franchise Admin)
          if (!user) {
            const workspace = await db.workspace.findFirst({
              where: { 
                OR: [
                  { centerCode: cleanUsername },
                  { centerCode: upperUsername }
                ]
              }
            });
            if (workspace) {
              const adminRole = await db.workspaceRole.findFirst({
                where: { workspaceId: workspace.id, role: 'ADMIN' },
                include: { user: true }
              });
              if (adminRole) {
                user = adminRole.user;
              }
            }
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

          const isDev = isDeveloperEmail(user.email);
          const effectiveRole = isDev ? "SUPER_ADMIN" : user.role;

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

              if (!hasRole && !hasProfile && user.role !== "SUPER_ADMIN") {
                console.log("AUTH: User does not belong to tenant", tenant);
                throw new Error("You do not have access to this franchise portal.");
              }

              if (hasProfile && !hasProfile.isActive) {
                console.log("AUTH: Student is paused.");
                throw new Error("Your account has been temporarily paused. Please contact your center admin.");
              }
            }
          }

          // Automatically record access log and update user lastSeen
          try {
            const { headers } = await import("next/headers");
            const headerList = await headers();
            const rawIp = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || headerList.get("x-real-ip") || "127.0.0.1";
            const userAgent = headerList.get("user-agent") || "";
            const { parseUserAgentDetails } = await import("@/lib/user-agent");
            const { device, browser, os } = parseUserAgentDetails(userAgent);
            const city = headerList.get("x-vercel-ip-city") || headerList.get("cf-ipcity") || "Kolkata";
            const state = headerList.get("x-vercel-ip-country-region") || headerList.get("cf-region") || "West Bengal";
            const country = headerList.get("x-vercel-ip-country") || headerList.get("cf-ipcountry") || "India";

            await (db.user as any).update({
              where: { id: user.id },
              data: { lastSeen: new Date() }
            });

            if ((db as any).userAccessLog) {
              await (db as any).userAccessLog.create({
                data: {
                  userId: user.id,
                  ipAddress: rawIp,
                  city,
                  state,
                  country,
                  location: `${city}, ${state}, ${country}`,
                  device,
                  browser,
                  os,
                  userAgent,
                  action: "LOGIN",
                  status: "SUCCESS",
                  metadata: { role: effectiveRole, tenant: credentials?.tenantSlug }
                }
              });
            } else {
              const logId = `log_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
              await db.$executeRawUnsafe(
                `INSERT INTO "UserAccessLog" 
                 ("id", "userId", "ipAddress", "city", "state", "country", "location", "device", "browser", "os", "userAgent", "action", "status", "createdAt")
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())`,
                logId,
                user.id,
                rawIp,
                city,
                state,
                country,
                `${city}, ${state}, ${country}`,
                device,
                browser,
                os,
                userAgent,
                "LOGIN",
                "SUCCESS"
              );
            }
          } catch (logErr) {
            console.warn("Could not record login access log:", logErr);
          }

          console.log("AUTH: Successfully authorized user:", user.email || user.username);
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            username: user.username,
            role: effectiveRole,
            isActive: user.isActive !== false,
            isDeveloper: isDev,
            systemPermissions: (user as any).systemPermissions,
          };
        } catch (error) {
          console.error("AUTH_ERROR in authorize callback:", error);
          return null;
        }
      }
    }),
    Credentials({
      id: "passkey",
      name: "Passkey Biometrics",
      credentials: {
        userId: { label: "User ID", type: "text" },
        token: { label: "Token", type: "text" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.userId || !credentials?.token) return null;
          const { cookies } = await import("next/headers");
          const cookieStore = await cookies();
          const savedToken = cookieStore.get("webauthn_verified_token")?.value;

          if (!savedToken) {
            console.error("AUTH_PASSKEY: No verified token cookie found.");
            return null;
          }

          const [savedUserId, tokenVal] = savedToken.split(":");
          if (savedUserId !== credentials.userId || tokenVal !== credentials.token) {
            console.error("AUTH_PASSKEY: Token or User ID mismatch.");
            return null;
          }

          // Consume the one-time token immediately
          cookieStore.delete("webauthn_verified_token");

          const user = await db.user.findUnique({
            where: { id: credentials.userId as string },
          });

          if (!user || !user.isActive) return null;

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            username: user.username,
            role: user.role,
            systemPermissions: (user as any).systemPermissions,
          };
        } catch (e) {
          console.error("AUTH_PASSKEY_ERROR:", e);
          return null;
        }
      },
    }),
  ],
});
