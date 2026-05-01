import NextAuth from 'next-auth';
import authConfig from './auth.config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const url = req.nextUrl;
  
  // Get hostname of request
  const hostname = req.headers.get("host") || "";
  
  // Clean up local development hostnames
  const localDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
  
  const searchParams = req.nextUrl.searchParams.toString();
  const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ""}`;

  // If we're on a non-tenant base URL
  if (
    hostname === localDomain ||
    hostname.includes("vercel.app") // Skip subdomains for initial Vercel branch previews
  ) {
    return NextResponse.next();
  }

  // Multi-tenant routing handling
  if (hostname.endsWith(`.${localDomain}`)) {
    const tenant = hostname.replace(`.${localDomain}`, "");
    // Prevent routing to reserved subdomains like "www"
    if (tenant !== 'www') {
      const rewriteUrl = new URL(`/app/${tenant}${path === "/" ? "" : path}`, req.url);
      return NextResponse.rewrite(rewriteUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
