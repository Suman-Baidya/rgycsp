/**
 * Centralized routing utility for the ABCD Edu Hub platform.
 * Handles both Subdomain Mode and Subdirectory Mode consistently.
 */

/**
 * Generates the base path for a workspace.
 * e.g., /app/tenant (Subdirectory) or "" (Subdomain)
 */
export function getWorkspaceBase(tenant: string, pathname: string): string {
  if (!tenant) return "";
  const isSubdirectoryMode = pathname.startsWith('/app/');
  return isSubdirectoryMode ? `/app/${tenant}` : "";
}

/**
 * Generates the admin base path for a workspace.
 * e.g., /app/tenant/admin (Subdirectory) or /admin (Subdomain)
 */
export function getAdminBase(tenant: string, pathname: string): string {
  return getTenantLink("/admin", tenant, pathname);
}

/**
 * Generates a public link within a workspace context.
 * e.g., /app/tenant/courses (Subdirectory) or /courses (Subdomain)
 */
export function getTenantLink(path: string, tenant: string, pathname: string): string {
  if (!tenant) return path;
  
  const base = getWorkspaceBase(tenant, pathname);
  
  // Clean the path to ensure it starts with / but doesn't have double //
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  // If the path is already absolute or has a protocol, return as is
  if (path.startsWith('http') || path.startsWith('mailto:') || path.startsWith('tel:')) {
    return path;
  }

  // Prevent double prefixing if the path already starts with the base
  if (base && cleanPath.startsWith(base)) {
    return cleanPath;
  }

  return `${base}${cleanPath}`;
}

/**
 * Common Workspace Route Constants & Generators
 */
export const WORKSPACE_ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  ADMIN: "/admin",
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
 * Higher-level link generator for common workspace routes.
 */
export function getWorkspaceLink(route: keyof typeof WORKSPACE_ROUTES, tenant: string, pathname: string): string {
  return getTenantLink(WORKSPACE_ROUTES[route], tenant, pathname);
}

/**
 * Detects the tenant from the current environment (hostname or pathname).
 * This is useful for client-side components that don't receive tenant via props.
 */
export function detectTenant(pathname: string, hostname?: string): string {
  // 1. Subdirectory Mode Detection
  if (pathname.startsWith('/app/')) {
    return pathname.split('/')[2] || "";
  }

  // 2. Subdomain Mode Detection
  if (hostname) {
    const parts = hostname.split('.');
    // Assuming [tenant].[domain].[tld] or [tenant].localhost:3000
    // We check if it's a subdomain (not just localhost or www)
    if (parts.length >= 2 && !hostname.startsWith('localhost') && !hostname.startsWith('www.')) {
      return parts[0];
    }
  }

  return "";
}

