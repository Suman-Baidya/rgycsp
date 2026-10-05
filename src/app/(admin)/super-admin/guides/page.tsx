import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isDeveloperEmail } from "@/lib/developer";
import { getAllUserGuidesForAdmin, getFranchiseWorkspacesList } from "@/app/actions/user-guides";
import { getPlatformRoutingConfig } from "@/app/actions/platform-routing";
import { SuperAdminGuidesClient } from "./SuperAdminGuidesClient";

export const dynamic = "force-dynamic";

export default async function SuperAdminGuidesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userRole = session.user.role;
  const userEmail = session.user.email;
  const isDev = Boolean((session.user as any)?.isDeveloper || isDeveloperEmail(userEmail));
  const isSuperAdmin = userRole === "SUPER_ADMIN" || userRole === "SUPER_ADMIN_MANAGER" || isDev;

  if (!isSuperAdmin) {
    redirect("/");
  }

  // Developer Master Control Switch Enforcement
  const routingConfig = await getPlatformRoutingConfig();
  if (!isDev && (!routingConfig.enableUserGuides || !routingConfig.enableSuperAdminGuides)) {
    redirect("/super-admin");
  }

  const [res, franchisesRes] = await Promise.all([
    getAllUserGuidesForAdmin(),
    getFranchiseWorkspacesList(),
  ]);

  return (
    <SuperAdminGuidesClient
      initialGuides={res.guides || []}
      franchises={franchisesRes.franchises || []}
      isDeveloper={isDev}
      franchiseGuidesEnabled={res.config?.franchiseGuidesEnabled ?? false}
      config={res.config || routingConfig}
    />
  );
}
