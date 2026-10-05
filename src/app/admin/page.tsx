import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getServerTenantLink } from "@/lib/routing-server";

export const dynamic = "force-dynamic";

export default async function AdminRootFallbackPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user;

  // 1. Super Admin goes to /super-admin
  if (user.role === "SUPER_ADMIN" || user.role === "SUPER_ADMIN_MANAGER") {
    redirect("/super-admin");
  }

  // 2. Franchise Admin or Staff
  const workspaceRole = await db.workspaceRole.findFirst({
    where: { userId: user.id },
    include: { workspace: true }
  });

  if (workspaceRole?.workspace?.subdomain) {
    const target = await getServerTenantLink("/admin", workspaceRole.workspace.subdomain);
    redirect(target);
  }

  // 3. Student
  const studentProfile = await db.studentProfile.findFirst({
    where: { userId: user.id },
    include: { workspace: true }
  });

  if (studentProfile?.workspace?.subdomain) {
    const target = await getServerTenantLink("/student/dashboard", studentProfile.workspace.subdomain);
    redirect(target);
  }

  redirect("/");
}
