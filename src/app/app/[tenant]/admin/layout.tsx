import { auth } from "@/auth";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WorkspaceSidebar } from "@/components/layout/WorkspaceSidebar";
import { WorkspaceAdminHeader } from "@/components/layout/WorkspaceAdminHeader";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { getServerTenantLink, getServerWorkspaceBase } from "@/lib/routing-server";
import { db } from "@/lib/prisma";
import { getPendingApplicationsCount } from "@/app/actions/admin-applications";
import { getPendingFeePaymentsCount } from "@/app/actions/payments";
import { AdminRouteGuard } from "@/components/layout/AdminRouteGuard";

export default async function WorkspaceAdminLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}) {
  const session = await auth();
  const { tenant } = await params;
  
  const workspace = await db.workspace.findUnique({
    where: { subdomain: tenant?.toLowerCase() },
    select: { id: true, isStateManager: true, walletBalance: true, name: true, centerCode: true }
  });

  if (!workspace) {
    notFound();
  }

  let admissionsCount = 0;
  let pendingFeesCount = 0;
  let userRole = "UNAUTHORIZED";
  let userPermissions: string[] = [];

  if (workspace && session?.user) {
    const [countResult, feesCountResult] = await Promise.all([
      getPendingApplicationsCount(workspace.id),
      getPendingFeePaymentsCount(workspace.id)
    ]);
    if (countResult.success) {
      admissionsCount = countResult.data ?? 0;
    }
    if (feesCountResult.success) {
      pendingFeesCount = feesCountResult.count ?? 0;
    }

    if (session.user.role === "SUPER_ADMIN") {
      userRole = "ADMIN"; // Super Admin gets full access in franchises
    }

    const roleRecord = await db.workspaceRole.findFirst({
      where: { userId: session.user.id, workspaceId: workspace.id }
    });
    
    if (roleRecord && session.user.role !== "SUPER_ADMIN") {
      userRole = roleRecord.role;
      try {
        if (Array.isArray(roleRecord.permissions)) {
          userPermissions = roleRecord.permissions as string[];
        } else if (typeof roleRecord.permissions === 'string') {
          userPermissions = JSON.parse(roleRecord.permissions);
        }
      } catch (e) {}
    }
  }

  const homeHref = await getServerTenantLink("/", tenant);
  const workspaceBase = await getServerWorkspaceBase(tenant);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground transition-colors duration-300">
      <AdminRouteGuard 
        tenant={tenant} 
        userRole={userRole} 
        userPermissions={userPermissions} 
      />
      <WorkspaceSidebar 
        tenant={tenant} 
        workspaceBase={workspaceBase} 
        admissionsCount={admissionsCount} 
        pendingFeesCount={pendingFeesCount}
        isStateManager={workspace?.isStateManager || false}
        userRole={userRole}
        userPermissions={userPermissions}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <WorkspaceAdminHeader 
          tenantName={workspace.name}
          workspaceBase={workspaceBase}
          walletBalance={workspace.walletBalance}
          userName={session?.user?.name || "Admin"}
          userImage={session?.user?.image}
          centerCode={workspace.centerCode}
        />
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
