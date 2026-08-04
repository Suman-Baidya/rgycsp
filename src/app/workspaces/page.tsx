import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function WorkspacesPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  // Handle global admins
  if (session.user.role === "SUPER_ADMIN" || session.user.role === "SUPER_ADMIN_MANAGER" || session.user.isDeveloper) {
    redirect("/super-admin");
  }

  // Run queries concurrently and fetch only the first record we need
  const [adminRole, studentProfile] = await Promise.all([
    db.workspaceRole.findFirst({
      where: { 
        userId: session.user.id,
        role: { not: "STUDENT" }
      },
      include: { workspace: true }
    }),
    db.studentProfile.findFirst({
      where: { userId: session.user.id },
      include: { workspace: true }
    })
  ]);

  const { getServerTenantLink } = await import("@/lib/routing-server");

  // Priority 1: Redirect to Admin Dashboard if they have any admin role
  if (adminRole) {
    const dashboardUrl = await getServerTenantLink("/admin", adminRole.workspace.subdomain);
    redirect(dashboardUrl);
  }

  // Priority 2: Redirect to Student Dashboard if they have any student profile
  if (studentProfile) {
    const dashboardUrl = await getServerTenantLink("/student/dashboard", studentProfile.workspace.subdomain);
    redirect(dashboardUrl);
  }

  // Priority 3: No workspaces found, redirect to home
  redirect("/");
}
