import NextAuth from 'next-auth';
import authConfig from './auth.config';
import { NextResponse } from 'next/server';
import { isDeveloperEmail } from './lib/developer';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const url = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;
  const userEmail = req.auth?.user?.email;
  const isDev = Boolean(req.auth?.user?.isDeveloper || isDeveloperEmail(userEmail));
  const isRestricted = isLoggedIn && req.auth?.user?.isActive === false && !isDev;
  const isSuperAdminRoute = url.pathname.startsWith('/super-admin');
  const isAction = req.headers.has('next-action') || req.headers.get('accept')?.includes('text/x-component');

  // Intercept Restricted Users
  if (isRestricted) {
    if (url.pathname !== '/account-restricted' && !url.pathname.startsWith('/api/auth')) {
      if (isAction) {
        return new NextResponse("Account Restricted", { status: 403 });
      }
      return NextResponse.redirect(new URL('/account-restricted', req.url));
    }
  }

  // Handle Protected Routes
  if (isSuperAdminRoute) {
    if (!isLoggedIn) {
      if (isAction) {
        return new NextResponse("Unauthorized", { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', req.url));
    }
    if (userRole !== 'SUPER_ADMIN' && userRole !== 'SUPER_ADMIN_MANAGER' && !isDev) {
      // If logged in but not a super admin, manager, or developer, redirect to root or error
      if (isAction) {
        return new NextResponse("Forbidden", { status: 403 });
      }
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // Get hostname of request (supports reverse proxies like Dokploy / Traefik via x-forwarded-host)
  const rawHost = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  const hostname = rawHost.split(',')[0].trim();
  const cleanHost = hostname.split(':')[0];
  
  // 1. Detect the root domain dynamically
  const rawRootEnv = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "";
  const cleanRootEnv = rawRootEnv.replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim();
  const rootDomainWithoutPort = cleanRootEnv.split(':')[0];
  let localDomain = "";
  
  if (rootDomainWithoutPort && (cleanHost === rootDomainWithoutPort || cleanHost.endsWith(`.${rootDomainWithoutPort}`))) {
    // Priority 1: Use explicit Root Domain ENV if current host matches it
    localDomain = rootDomainWithoutPort;
  } else if (cleanHost.includes('localhost') || cleanHost.includes('127.0.0.1')) {
    // Priority 2: Localhost development
    const parts = cleanHost.split('.');
    localDomain = parts.length > 1 ? parts.slice(1).join('.') : cleanHost;
  } else if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(cleanHost)) {
    // Priority 3: IP Address (no subdomains possible)
    localDomain = cleanHost;
  } else {
    // Priority 4: Dynamic extraction from Vercel or Custom Domains
    const parts = cleanHost.split('.');
    if (cleanHost.includes("vercel.app")) {
      // Handles project.vercel.app or branch.project.vercel.app
      localDomain = parts.length > 3 ? parts.slice(1).join('.') : cleanHost;
    } else {
      // Check common two-part TLDs (e.g. .co.in, .org.in, .edu.in, .co.uk, .com.au)
      const twoPartSLDs = ['co', 'org', 'edu', 'ac', 'gov', 'net', 'com', 'res', 'gen'];
      if (parts.length >= 3) {
        const secondLast = parts[parts.length - 2];
        const last = parts[parts.length - 1];
        if (twoPartSLDs.includes(secondLast) && last.length <= 3) {
          localDomain = parts.length === 3 ? cleanHost : parts.slice(-3).join('.');
        } else {
          localDomain = parts.length >= 3 ? parts.slice(-2).join('.') : cleanHost;
        }
      } else {
        localDomain = cleanHost;
      }
    }
  }

  // Final fallback
  if (!localDomain) localDomain = "localhost";
  
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

  // 0.5 Bypass explicit subdirectory or super-admin routes to prevent double-rewriting on IP addresses
  if (url.pathname.startsWith('/app/') || url.pathname.startsWith('/super-admin')) {
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-pathname', url.pathname);
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      }
    });
  }

  // Read platform routing configuration from cookie or env var
  const routingCookie = req.cookies.get("platform_routing_mode")?.value;
  const subdomainDisabledCookie = req.cookies.get("platform_routing_subdomain")?.value === "0";
  const envRoutingMode = process.env.NEXT_PUBLIC_DEFAULT_ROUTING_MODE?.toUpperCase();
  
  // Subdirectory-only is active if explicitly set, or subdomain is disabled, or configured via env
  const isSubdirectoryOnly = 
    routingCookie === "SUBDIRECTORY" || 
    subdomainDisabledCookie || 
    (!routingCookie && envRoutingMode === "SUBDIRECTORY");

  // 1. Handle root domain and specific bypasses
  if (
    cleanHost === localDomain ||
    // Skip subdomains for initial Vercel branch previews (except if it matches our localDomain pattern)
    (cleanHost.includes("vercel.app") && !cleanHost.endsWith(`.${localDomain}`) && !cleanHost.startsWith('super-admin.'))
  ) {
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-pathname', url.pathname);
    requestHeaders.set('x-routing-mode', isSubdirectoryOnly ? 'SUBDIRECTORY' : (routingCookie || 'BOTH'));
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      }
    });
  }

  // 2. Handle subdomains (Super Admin and Tenants)
  if (cleanHost.endsWith(`.${localDomain}`)) {
    const tenant = cleanHost.replace(`.${localDomain}`, "").toLowerCase();
    
    // If subdomains are disabled on the platform (e.g. Vercel free tier without wildcard DNS),
    // redirect incoming subdomain traffic to canonical root domain subdirectory URL
    if (isSubdirectoryOnly) {
      if (tenant === 'super-admin') {
        const redirectUrl = new URL(`/super-admin${path === "/" ? "" : path}`, `https://${localDomain}`);
        return NextResponse.redirect(redirectUrl, 307);
      }
      if (tenant === 'franchises' || tenant === 'franchise') {
        const redirectUrl = new URL(`/franchises${path === "/" ? "" : path}`, `https://${localDomain}`);
        return NextResponse.redirect(redirectUrl, 307);
      }
      if (tenant !== 'www' && tenant !== 'admin') {
        const redirectUrl = new URL(`/app/${tenant}${path === "/" ? "" : path}`, `https://${localDomain}`);
        return NextResponse.redirect(redirectUrl, 307);
      }
    }

    // Special case: Super Admin Subdomain
    if (tenant === 'super-admin') {
      const rewriteUrl = new URL(`/super-admin${path === "/" ? "" : path}`, req.url);
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set('x-pathname', url.pathname);
      requestHeaders.set('x-routing-mode', routingCookie || 'BOTH');
      
      return NextResponse.rewrite(rewriteUrl, {
        request: {
          headers: requestHeaders,
        }
      });
    }

    // Special case: Franchises Subdomain
    if (tenant === 'franchises' || tenant === 'franchise') {
      const targetPath = path.startsWith('/franchises') ? path : `/franchises${path === "/" ? "" : path}`;
      const rewriteUrl = new URL(targetPath, req.url);
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set('x-pathname', url.pathname);
      
      return NextResponse.rewrite(rewriteUrl, {
        request: {
          headers: requestHeaders,
        }
      });
    }

    // Bypass global franchise routes when accessed from any tenant subdomain
    if (url.pathname.startsWith('/franchises') || url.pathname.startsWith('/franchise')) {
      const normalizedPath = url.pathname.startsWith('/franchises') 
        ? path 
        : path.replace(/^\/franchise/, '/franchises');
      const rewriteUrl = new URL(normalizedPath, req.url);
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
      requestHeaders.set('x-is-subdomain', 'true');
      
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
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
