import React from "react";
import { notFound, redirect } from "next/navigation";
import { findWorkspaceByTenant } from "@/lib/workspace";
import { auth } from "@/auth";
import { getServerTenantLink } from "@/lib/routing-server";
import { getPlatformRoutingConfig } from "@/app/actions/platform-routing";
import { getPublishedUserGuides } from "@/app/actions/user-guides";
import { FranchiseGuidesClient } from "./FranchiseGuidesClient";

export const dynamic = "force-dynamic";

export default async function FranchiseGuidesPage({
  params
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  const session = await auth();

  if (!session?.user) {
    const loginTarget = await getServerTenantLink("/login", tenant);
    redirect(loginTarget);
  }

  // AGENTS.md Rule 0: findWorkspaceByTenant
  const workspace = await findWorkspaceByTenant(tenant, {
    select: {
      id: true,
      name: true,
      subdomain: true,
      centerCode: true,
    }
  });

  if (!workspace) {
    notFound();
  }

  const routingConfig = await getPlatformRoutingConfig();

  // If user guides are disabled globally, or disabled for franchise admins by Developer or Super Admin
  if (!routingConfig.enableUserGuides || !routingConfig.enableFranchiseGuides || !routingConfig.franchiseGuidesEnabled) {
    const adminTarget = await getServerTenantLink("/admin", tenant);
    redirect(adminTarget);
  }

  const guidesRes = await getPublishedUserGuides("FRANCHISE_ADMIN", workspace.id);

  return (
    <FranchiseGuidesClient
      initialGuides={guidesRes.guides || []}
      workspaceName={workspace.name}
    />
  );
}
