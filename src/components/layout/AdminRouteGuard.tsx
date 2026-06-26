"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { getTenantLink } from "@/lib/routing";

export function AdminRouteGuard({ 
  tenant,
  userRole, 
  userPermissions 
}: { 
  tenant: string;
  userRole: string;
  userPermissions: string[];
}) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (userRole === "ADMIN") return; // Admin has full access

    if (userRole === "UNAUTHORIZED") {
      toast.error("You do not have access to the admin dashboard.");
      router.push(getTenantLink("/student/dashboard", tenant, pathname)); // Best effort redirect to student portal
      return;
    }

    // Extract the active section from the pathname
    // Example: /app/demo/admin/students -> students
    // Or: /admin/students -> students
    const parts = pathname.split('/');
    const adminIndex = parts.indexOf("admin");
    
    if (adminIndex !== -1 && parts.length > adminIndex + 1) {
      const section = parts[adminIndex + 1]; // e.g., 'students', 'courses'
      
      // Map section names to permission IDs if they differ
      let requiredPermission = section;
      if (section === "staff") requiredPermission = "staff";
      if (section === "wallet") requiredPermission = "wallet";
      if (section === "admissions") requiredPermission = "admissions";
      if (section === "attendance") requiredPermission = "attendance";
      if (section === "courses") requiredPermission = "courses";
      if (section === "exam-generator") requiredPermission = "exam-gen";
      if (section === "settings") requiredPermission = "settings";

      if (requiredPermission === "staff" && userRole !== "ADMIN") {
        toast.error("You do not have permission to view Staff & Roles.");
        router.push(getTenantLink("/admin", tenant, pathname));
        return;
      }

      if (!userPermissions.includes(requiredPermission)) {
        toast.error("You do not have permission to view this page.");
        router.push(getTenantLink("/admin", tenant, pathname));
      }
    }
  }, [pathname, userRole, userPermissions, router, tenant]);

  return null;
}
