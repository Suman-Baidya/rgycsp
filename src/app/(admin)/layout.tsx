import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SuperAdminRouteGuard } from "@/components/layout/SuperAdminRouteGuard";
import { db } from "@/lib/prisma";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/");
  }

  // Fetch fresh user data from DB to ensure permissions are up to date
  const dbUser = await db.user.findUnique({
    where: { id: session.user.id },
  });

  if (!dbUser || !(dbUser as any).isActive || (dbUser.role !== "SUPER_ADMIN" && dbUser.role !== "SUPER_ADMIN_MANAGER")) {
    redirect("/");
  }

  const permissions = (dbUser.systemPermissions as string[]) || [];

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
      <SuperAdminRouteGuard userRole={dbUser.role} userPermissions={permissions} />
      <AdminSidebar serverRole={dbUser.role} serverPermissions={permissions} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b border-border/40 bg-background/50 backdrop-blur-sm flex items-center px-4 lg:px-8 sticky top-0 z-40">
          <div className="lg:hidden ml-12 font-bold tracking-tighter text-xl text-foreground">Super Admin</div>
          <div className="hidden lg:block">
            <Breadcrumbs />
          </div>
          <div className="ml-auto flex items-center gap-4">
            <ThemeToggle />
            <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
              SA
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
