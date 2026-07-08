"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

export function SuperAdminRouteGuard({ 
  userRole, 
  userPermissions 
}: { 
  userRole: string;
  userPermissions: string[];
}) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // If it's not a super admin route, ignore
    if (!pathname.includes("super-admin")) return;
    
    // Super Admin has full access
    if (userRole === "SUPER_ADMIN") return; 
    
    // Only SUPER_ADMIN_MANAGER is the other allowed role for super-admin routes
    if (userRole !== "SUPER_ADMIN_MANAGER") {
      toast.error("You do not have access to the super admin dashboard.");
      router.push("/");
      return;
    }

    // Extract the active section from the pathname
    // Example: /super-admin/students -> students
    const parts = pathname.split('/');
    const adminIndex = parts.indexOf("super-admin");
    
    if (adminIndex !== -1 && parts.length > adminIndex + 1) {
      const section = parts[adminIndex + 1];
      
      // If no sub-section (just /super-admin), they have access (Overview)
      if (!section) return;

      const routeMap: Record<string, string> = {
        "wallet": "Wallet Economy",
        "franchises": "Franchises",
        "state-managers": "State Managers",
        "students": "Students",
        "users": "Users",
        "courses": "Courses",
        "products": "Products",
        "documents": "Documents",
        "settings": "Settings",
        "profile": "Overview" // Profile is usually accessible
      };
      
      const requiredPermission = routeMap[section];
      
      if (!requiredPermission) {
        // If it's an unmapped section like "logs", they shouldn't access it unless they are a developer
        if (section === "logs") {
            // we will let the page handle developer check for logs, but Manager never has access.
            toast.error("You do not have permission to view this page.");
            router.push("/super-admin");
        }
        return;
      }

      if (requiredPermission !== "Overview" && !userPermissions.includes(requiredPermission)) {
        toast.error("You do not have permission to view this page.");
        router.push("/super-admin");
      }
    }
  }, [pathname, userRole, userPermissions, router]);

  return null;
}
