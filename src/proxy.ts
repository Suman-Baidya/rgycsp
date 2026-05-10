import NextAuth from 'next-auth';
import authConfig from './auth.config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const url = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;
  const isSuperAdminRoute = url.pathname.startsWith('/super-admin');

  // Handle Protected Routes
  if (isSuperAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    if (userRole !== 'SUPER_ADMIN') {
      // If logged in but not a super admin, redirect to root or error
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // Get hostname of request
  const hostname = req.headers.get("host") || "";
  
  // 1. Detect the root domain dynamically
  const rootEnv = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "";
  let localDomain = "";
  
  if (rootEnv && hostname.endsWith(rootEnv)) {
    // Priority 1: Use explicit Root Domain ENV if current host matches it
    localDomain = rootEnv;
  } else if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    // Priority 2: Localhost development
    const parts = hostname.split('.');
    localDomain = parts.length > 1 ? parts.slice(1).join('.') : hostname;
  } else {
    // Priority 3: Dynamic extraction from Vercel or Custom Domains
    const parts = hostname.split('.');
    if (hostname.includes("vercel.app")) {
      // Handles project.vercel.app or branch.project.vercel.app
      localDomain = parts.length > 3 ? parts.slice(1).join('.') : hostname;
    } else {
      // tenant.domain.com -> domain.com
      localDomain = parts.length >= 3 ? parts.slice(-2).join('.') : hostname;
    }
  }

  // Final fallback
  if (!localDomain) localDomain = "localhost:3000";
  
  const searchParams = req.nextUrl.searchParams.toString();
  const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ""}`;

  // 0. Bypass API and Static routes (Ensure they are not rewritten)
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/_next') || url.pathname.includes('.')) {
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-pathname', url.pathname);
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      }
    });
  }

  // 1. Handle root domain and specific bypasses
  if (
    hostname === localDomain ||
    // Skip subdomains for initial Vercel branch previews (except if it matches our localDomain pattern)
    (hostname.includes("vercel.app") && !hostname.endsWith(`.${localDomain}`) && !hostname.startsWith('super-admin.'))
  ) {
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-pathname', url.pathname);
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      }
    });
  }

  // 2. Handle subdomains (Super Admin and Tenants)
  if (hostname.endsWith(`.${localDomain}`)) {
    const tenant = hostname.replace(`.${localDomain}`, "").toLowerCase();
    
    // Special case: Super Admin Subdomain
    if (tenant === 'super-admin') {
      const rewriteUrl = new URL(`/super-admin${path === "/" ? "" : path}`, req.url);
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set('x-pathname', url.pathname);
      
      return NextResponse.rewrite(rewriteUrl, {
        request: {
          headers: requestHeaders,
        }
      });
    }

    // Generic Tenant Subdomain
    if (tenant !== 'www' && tenant !== 'admin') {
      const rewriteUrl = new URL(`/app/${tenant}${path === "/" ? "" : path}`, req.url);
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set('x-pathname', url.pathname);
      
      return NextResponse.rewrite(rewriteUrl, {
        request: {
          headers: requestHeaders,
        }
      });
    }
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-pathname', url.pathname);
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    }
  });
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
