import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { SuperAdminHeader } from "@/components/layout/SuperAdminHeader";
import { QuickActionFAB } from "@/components/dashboard/QuickActionFAB";
import { ContextualGuideWidget } from "@/components/guides/ContextualGuideWidget";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { db } from "@/lib/prisma";

import { isDeveloperEmail } from "@/lib/developer";
import { isDemoEmail, isDemoRestrictionsEnabled, isDemoTargetAccount } from "@/lib/demo";
import { getPlatformRoutingConfig } from "@/app/actions/platform-routing";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/");
  }

  // Fetch fresh user data from DB and routing config in parallel
  const [dbUser, routingConfig] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
    }),
    getPlatformRoutingConfig().catch(() => null),
  ]);

  const isDev = isDeveloperEmail(dbUser?.email) || isDeveloperEmail(session?.user?.email) || !!session?.user?.isDeveloper;
  const isDemo = Boolean(session?.user?.isDemo || (isDemoEmail(dbUser?.email) && isDemoRestrictionsEnabled()));

  const isUserGuideEnabled = Boolean(
    isDev || (routingConfig?.enableUserGuides && routingConfig?.enableSuperAdminGuides)
  );

  // If this is a demo account but demo mode is disabled in environment, completely kick them out
  const isDemoAccount = isDemoTargetAccount(dbUser?.email) || isDemoTargetAccount(session?.user?.email);
  if (isDemoAccount && !isDemoRestrictionsEnabled()) {
    redirect("/login");
  }

  if (!dbUser || !(dbUser as any).isActive || (!isDev && dbUser.role !== "SUPER_ADMIN" && dbUser.role !== "SUPER_ADMIN_MANAGER")) {
    redirect("/");
  }

  const permissions = (dbUser.systemPermissions as string[]) || [];

  const headersList = await headers();
  const currentPath = headersList.get("x-pathname") || "";

  // Completely block non-developer Super Admins from accessing developer routes
  if (!isDev && currentPath.includes("/super-admin/logs")) {
    redirect("/super-admin");
  }

  // Block non-developer Super Admins from accessing guides if disabled by developer
  if (!isDev && currentPath.includes("/super-admin/guides") && (!routingConfig?.enableUserGuides || !routingConfig?.enableSuperAdminGuides)) {
    redirect("/super-admin");
  }

  if (dbUser.role === "SUPER_ADMIN_MANAGER") {
    const parts = currentPath.split('/');
    const adminIndex = parts.indexOf("super-admin");
    
    if (adminIndex !== -1 && parts.length > adminIndex + 1) {
      const section = parts[adminIndex + 1];
      if (section) {
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
          "profile": "Overview"
        };
        const requiredPermission = routeMap[section];
        
        if (!requiredPermission) {
          if (section === "logs") {
            redirect("/super-admin");
          }
        } else if (requiredPermission !== "Overview" && !permissions.includes(requiredPermission)) {
          redirect("/super-admin");
        }
      }
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground transition-colors duration-300">
      <AdminSidebar 
        serverRole={isDev ? "SUPER_ADMIN" : dbUser.role} 
        serverPermissions={permissions} 
        serverEmail={session?.user?.email ?? undefined}
        serverIsDeveloper={isDev}
        isUserGuideEnabled={isUserGuideEnabled}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <SuperAdminHeader 
          user={{ name: dbUser.name, email: dbUser.email, image: (dbUser as any).image }} 
          role={isDev ? "SUPER_ADMIN" : dbUser.role}
        />
        {isDemo && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 sm:px-6 flex items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
              <span className="font-bold tracking-wide">Demo Preview:</span>
              <span className="truncate text-amber-800 dark:text-amber-300">
                You can explore all features. Editing and deleting are disabled.
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold border border-amber-500/30">
                Preview Only
              </span>
            </div>
          </div>
        )}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-6 pb-24 lg:pb-6 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
      {!isDemo && <QuickActionFAB portal="super-admin" />}
      <ContextualGuideWidget portal="super-admin" />
    </div>
  );
}
