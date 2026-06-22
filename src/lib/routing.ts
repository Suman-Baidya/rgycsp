/**
 * Centralized routing utility for the ABCD Edu Hub platform.
 * Handles both Subdomain Mode and Subdirectory Mode consistently.
 */

export type RoutingMode = "subdomain" | "subdirectory" | "root";

export interface RoutingConfig {
  mode: RoutingMode;
  tenant: string | null;
  workspaceBase: string; // e.g., "/app/tenant" or ""
}

/**
 * Single source of truth for routing configuration.
 * Detects mode and tenant from hostname and pathname.
 */
export function getRoutingConfig(pathname: string, hostname?: string, tenantOverride?: string): RoutingConfig {
  let mode: RoutingMode = "root";
  let tenant: string | null = tenantOverride || null;
  let workspaceBase = "";

  const isSubdirectoryPath = pathname.startsWith('/app/');
  const isSuperAdminPath = pathname.startsWith('/super-admin');

  // Helper to construct the base path
  const setSubdirectoryMode = (tenantVal: string | null) => {
    mode = "subdirectory";
    tenant = tenantVal;
    if (tenant === "super-admin") {
      workspaceBase = "/super-admin";
    } else {
      workspaceBase = tenant ? `/app/${tenant}` : "";
    }
  };

  // Eagerly detect mode from pathname or tenant override
  if (tenantOverride === "super-admin" || isSuperAdminPath) {
    setSubdirectoryMode("super-admin");
    return { mode, tenant, workspaceBase };
  }

  if (isSubdirectoryPath) {
    setSubdirectoryMode(tenantOverride || pathname.split('/')[2] || null);
    return { mode, tenant, workspaceBase };
  }

  if (hostname) {
    const rootEnv = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "";
    const cleanHost = hostname.split(':')[0]; // Remove port if present
    
    // 1. Detect localDomain dynamically just like proxy.ts
    let localDomain = "";
    if (rootEnv && cleanHost.endsWith(rootEnv.split(':')[0])) {
      localDomain = rootEnv.split(':')[0];
    } else if (cleanHost.includes('localhost') || cleanHost.includes('127.0.0.1')) {
      const parts = cleanHost.split('.');
      localDomain = parts.length > 1 ? parts.slice(1).join('.') : cleanHost;
    } else if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(cleanHost)) {
      // It's an IP address
      localDomain = cleanHost;
    } else {
      const parts = cleanHost.split('.');
      if (cleanHost.includes("vercel.app")) {
        localDomain = parts.length > 3 ? parts.slice(1).join('.') : cleanHost;
      } else {
        localDomain = parts.length >= 3 ? parts.slice(-2).join('.') : cleanHost;
      }
    }
    
    if (!localDomain) localDomain = "localhost";

    if (cleanHost !== localDomain && cleanHost.endsWith(`.${localDomain}`)) {
      // We are on a subdomain
      mode = "subdomain";
      tenant = tenantOverride || cleanHost.replace(`.${localDomain}`, "").toLowerCase();
      workspaceBase = ""; // Subdomains don't use prefixes
    } else {
      // Fallback
      if (tenantOverride) {
        setSubdirectoryMode(tenantOverride);
      } else {
        mode = "root";
      }
    }
  } else {
    // Fallback if hostname is missing (e.g. SSR)
    if (tenantOverride) {
      setSubdirectoryMode(tenantOverride);
    } else {
      mode = "root";
    }
  }

  return { mode, tenant, workspaceBase };
}

/**
 * Generates a public link within a workspace context.
 * e.g., /app/tenant/courses (Subdirectory) or /courses (Subdomain)
 */
export function getTenantLink(path: string, tenant: string, pathname: string, hostname?: string): string {
  // Use centralized config to determine the correct prefix
  const { workspaceBase } = getRoutingConfig(
    pathname, 
    hostname || (typeof window !== 'undefined' ? window.location.host : undefined), 
    tenant
  );
  
  // Clean the path
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  // If the path is already absolute or has a protocol, return as is
  if (path.startsWith('http') || path.startsWith('mailto:') || path.startsWith('tel:')) {
    return path;
  }

  // Prevent double prefixing or redundant subdirectory nesting
  // If we are in subdirectory mode, the link should NEVER start with another tenant's /app/
  if (workspaceBase && cleanPath.startsWith(workspaceBase)) {
    return cleanPath;
  }

  // If the path already starts with /app/ but we are in subdomain mode, strip it?
  // Actually, we should trust the workspaceBase prefixing.
  return `${workspaceBase}${cleanPath}`.replace(/\/+/g, '/'); // Normalize slashes
}

/**
 * Common Workspace Route Constants
 */
export const WORKSPACE_ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  ADMIN: "/admin",
  ADMIN_STAFF: "/admin/staff",
  ADMIN_STUDENTS: "/admin/students",
  ADMIN_COURSES: "/admin/courses",
  ADMIN_ADMISSIONS: "/admin/admissions",
  ADMIN_ATTENDANCE: "/admin/attendance",
  ADMIN_EXAM_GENERATOR: "/admin/exam-generator",
  ADMIN_SETTINGS: "/admin/settings",
  ADMIN_STATE_MANAGER: "/admin/state-manager",
  ADMIN_WALLET: "/admin/wallet",
  STUDENT_DASHBOARD: "/student/dashboard",
  STUDENT_PROFILE: "/student/profile",
  STUDENT_COURSES: "/student/courses",
  STUDENT_ATTENDANCE: "/student/attendance",
  STUDENT_FEES: "/student/fees",
  STUDENT_NOTICES: "/student/notices",
  STUDENT_EXAMS: "/student/exams",
  COURSES: "/courses",
  ADMISSION: "/admission",
  ADMISSION_STATUS: "/admission/status",
  STUDENTS_PUBLIC: "/learners",
  ABOUT: "/about",
  CONTACT: "/contact",
  GALLERY: "/gallery",
  EVENTS: "/events",
  HELP: "/help",
  NOTICE: "/notice",
};

/**
 * Robust utility to check if a path is active.
 * Handles exact matches and sub-routes correctly across modes.
 */
export function isActivePath(pathname: string, href: string, exact = false): boolean {
  if (exact) return pathname === href;
  
  // Clean paths for comparison
  const p = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  const h = href.endsWith('/') ? href.slice(0, -1) : href;

  if (p === h) return true;

  // For parent highlighting (e.g., /admin should highlight when on /admin/staff)
  // But we must be careful not to highlight "/" or base admin routes on every sub-page
  if (h === "" || h === "/" || h.endsWith("/admin") || h.endsWith("/super-admin")) {
    return p === h;
  }

  return p.startsWith(h + "/");
}

/**
 * Higher-level link generator for common workspace routes.
 */
export function getWorkspaceLink(route: keyof typeof WORKSPACE_ROUTES, tenant: string, pathname: string): string {
  return getTenantLink(WORKSPACE_ROUTES[route], tenant, pathname);
}

/**
 * Compatibility helper for old code.
 */
export function detectTenant(pathname: string, hostname?: string): string {
  const { tenant } = getRoutingConfig(pathname, hostname);
  return tenant || "";
}

export function getWorkspaceBase(tenant: string, pathname: string): string {
  const { workspaceBase } = getRoutingConfig(pathname, typeof window !== 'undefined' ? window.location.host : undefined, tenant);
  return workspaceBase;
}

export function getAdminBase(tenant: string, pathname: string): string {
  return getTenantLink("/admin", tenant, pathname);
}
