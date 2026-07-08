"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { getTenantLink } from "@/lib/routing";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [isRestricted, setIsRestricted] = useState(false);

  useEffect(() => {
    setIsRestricted(false); // Reset on route change

    if (userRole === "ADMIN") return; // Admin has full access

    if (userRole === "UNAUTHORIZED") {
      setIsRestricted(true);
      return;
    }

    // Extract the active section from the pathname
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

      if (requiredPermission === "profile") {
        return; // Profile is allowed for all staff
      }

      if (requiredPermission === "staff" && userRole !== "ADMIN") {
        setIsRestricted(true);
        return;
      }

      if (!userPermissions.includes(requiredPermission)) {
        setIsRestricted(true);
      }
    }
  }, [pathname, userRole, userPermissions]);

  if (!isRestricted) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-[2.5rem] p-10 text-center shadow-2xl border border-red-500/20 dark:border-red-500/30">
        <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Access Restricted</h2>
        <p className="text-slate-500 font-medium mb-8 text-sm">
          You do not have the required permissions to view this page. Please contact your Franchise Admin to request access.
        </p>
        <Button 
          onClick={() => router.push(getTenantLink("/admin", tenant, pathname))} 
          className="w-full h-12 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30"
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
}
