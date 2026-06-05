"use server";

import { db } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getPostLoginRedirect(currentHost: string, currentPath: string) {
  const session = await auth();
  if (!session?.user) return "/login";

  const user = session.user;
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
  
  // 1. Handle Super Admin
  if (user.role === "SUPER_ADMIN") {
    // If they are on a subdomain, we might want to take them to the global dashboard
    // but the most reliable way is /super-admin on the root domain.
    const isRoot = currentHost === rootDomain || currentHost === "localhost:3000" || currentHost === "www." + rootDomain;
    if (isRoot) {
      return "/super-admin";
    }
    // Return absolute URL for super admin if on subdomain
    const protocol = currentHost.includes("localhost") ? "http" : "https";
    return `${protocol}://${rootDomain}/super-admin`;
  }

  // 2. Handle Workspace Users
  // If they are logging in from the main site, they should stay on the main site
  // unless they explicitly navigated to a workspace subdomain.
  const isOnMainSite = currentHost === rootDomain || currentHost === "localhost:3000" || currentHost === "www." + rootDomain;
  
  if (isOnMainSite) {
    // Land on the main site. The navbar will show "Dashboard" options.
    return "/";
  }

  // Handle Workspace User logging in from a subdomain
  const workspaceRoles = await db.workspaceRole.findMany({
    where: { userId: user.id },
    include: { workspace: true }
  });

  const studentProfiles = await db.studentProfile.findMany({
    where: { userId: user.id },
    include: { workspace: true }
  });

  if (workspaceRoles.length === 0 && studentProfiles.length === 0) {
    return "/"; 
  }

  // Check if they are currently on a specific workspace subdomain
  const currentTenant = currentHost.replace(`.${rootDomain}`, "").toLowerCase();
  
  const currentWorkspaceRole = workspaceRoles.find(wr => wr.workspace.subdomain === currentTenant);
  if (currentWorkspaceRole) {
    // They belong to this workspace via Role
    const base = currentWorkspaceRole.role === "STUDENT" ? "/student/dashboard" : "/admin";
    return base;
  }

  const currentStudentProfile = studentProfiles.find(sp => sp.workspace.subdomain === currentTenant);
  if (currentStudentProfile) {
    // They belong to this workspace via Student Profile
    return "/student/dashboard";
  }

  // If they are on a workspace subdomain they DON'T belong to (e.g. invited link)
  // Redirect to their first workspace dashboard (absolute URL)
  const protocol = currentHost.includes("localhost") ? "http" : "https";
  if (workspaceRoles.length > 0) {
    const primaryWR = workspaceRoles[0];
    const base = primaryWR.role === "STUDENT" ? "/student/dashboard" : "/admin";
    return `${protocol}://${primaryWR.workspace.subdomain}.${rootDomain}${base}`;
  } else {
    const primarySP = studentProfiles[0];
    return `${protocol}://${primarySP.workspace.subdomain}.${rootDomain}/student/dashboard`;
  }
}
