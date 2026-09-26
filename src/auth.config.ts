import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import { isDeveloperEmail } from './lib/developer';

const useSecureCookies = process.env.NODE_ENV === "production";
const cookiePrefix = useSecureCookies ? "__Secure-" : "";
const rawRoot = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "";
const cleanRootDomain = rawRoot.replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim().split(':')[0];
const sharedCookieDomain = cleanRootDomain && !cleanRootDomain.includes("localhost") && !cleanRootDomain.includes("vercel.app")
  ? `.${cleanRootDomain}`
  : undefined;

export default {
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        allowDangerousEmailAccountLinking: true,
      }),
    ] : []),
  ],
  trustHost: true,
  basePath: '/api/auth',
  pages: {
    signIn: '/login',
  },
  ...(sharedCookieDomain ? {
    cookies: {
      sessionToken: {
        name: `${cookiePrefix}authjs.session-token`,
        options: {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          domain: sharedCookieDomain,
          secure: useSecureCookies,
        }
      }
    }
  } : {}),
  callbacks: {
    async session({ session, token }) {
      if (token?.sub && session.user) {
        session.user.id = token.sub;
      }
      if (token?.role && session.user) {
        session.user.role = token.role as string;
      }
      if (session.user) {
        session.user.isActive = token.isActive !== false;
      }
      if (token?.systemPermissions && session.user) {
        session.user.systemPermissions = token.systemPermissions;
      }
      const email = session.user?.email || (token?.email as string);
      if (token?.isDeveloper || isDeveloperEmail(email)) {
        session.user.isDeveloper = true;
        session.user.role = "SUPER_ADMIN";
        session.user.isActive = true;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role as string;
        token.isActive = (user as any).isActive !== false;
        token.systemPermissions = (user as any).systemPermissions;
      }
      const email = user?.email || (token?.email as string);
      if (isDeveloperEmail(email)) {
        token.role = "SUPER_ADMIN";
        token.isDeveloper = true;
        token.isActive = true;
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative paths
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        const urlHost = new URL(url).host.split(':')[0];
        const baseHost = new URL(baseUrl).host.split(':')[0];
        if (urlHost.endsWith(baseHost) || baseHost.endsWith(urlHost)) {
          return url;
        }
        const rawRoot = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "";
        const rootDomain = rawRoot.replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim().split(':')[0];
        if (rootDomain && (urlHost === rootDomain || urlHost.endsWith(`.${rootDomain}`))) {
          return url;
        }
      } catch {
        // Fallback for malformed URLs
      }
      return baseUrl;
    }
  },
  session: { strategy: "jwt" } // Use JWT for Edge compatibility and lower DB overhead
} satisfies NextAuthConfig;
