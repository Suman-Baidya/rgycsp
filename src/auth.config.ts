import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';

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
  callbacks: {
    async session({ session, token }) {
      if (token?.sub && session.user) {
        session.user.id = token.sub;
      }
      if (token?.role && session.user) {
        session.user.role = token.role as string;
      }
      if (token?.systemPermissions && session.user) {
        session.user.systemPermissions = token.systemPermissions;
      }
      if (token?.isDeveloper !== undefined && session.user) {
        session.user.isDeveloper = token.isDeveloper as boolean;
      }
      return session;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = user.role as string;
        token.systemPermissions = (user as any).systemPermissions;
        token.isDeveloper = user.email === process.env.DEVELOPER_EMAIL;
      }
      // Removed unsafe client-side trigger === 'update' block
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
