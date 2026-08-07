import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { SuperAdminHeader } from "@/components/layout/SuperAdminHeader";
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
    <div className="flex h-screen overflow-hidden bg-background text-foreground transition-colors duration-300">
      <SuperAdminRouteGuard userRole={dbUser.role} userPermissions={permissions} />
      <AdminSidebar 
        serverRole={dbUser.role} 
        serverPermissions={permissions} 
        serverEmail={session?.user?.email ?? undefined}
        serverIsDeveloper={session?.user?.isDeveloper ?? false}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <SuperAdminHeader user={{ name: dbUser.name, email: dbUser.email, image: (dbUser as any).image }} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
