import React from "react";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import { auth } from "@/auth";
import { headers } from "next/headers";
import FranchiseEnquiriesClient from "./FranchiseEnquiriesClient";
import { getServerTenantLink } from "@/lib/routing-server";

export const dynamic = "force-dynamic";

export default async function FranchiseEnquiriesPage({
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

  const workspace = await db.workspace.findUnique({
    where: { subdomain: tenant?.toLowerCase() },
    select: {
      id: true,
      name: true,
      subdomain: true,
      isSubdomainEnabled: true,
    }
  });

  if (!workspace) {
    notFound();
  }

  if (!workspace.isSubdomainEnabled) {
    const adminTarget = await getServerTenantLink("/admin", tenant);
    redirect(adminTarget);
  }

  const headersList = await headers();
  const host = headersList.get("host") || "";
  const isSubdomainMode = headersList.get("x-routing-mode") === "subdomain";

  return (
    <FranchiseEnquiriesClient
      workspaceId={workspace.id}
      workspaceName={workspace.name}
      workspaceSubdomain={workspace.subdomain}
      initialHost={host}
      isSubdomainMode={isSubdomainMode}
    />
  );
}
