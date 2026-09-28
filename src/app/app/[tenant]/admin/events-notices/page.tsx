import React from "react";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import { auth } from "@/auth";
import { headers } from "next/headers";
import FranchiseEventsNoticesClient from "./FranchiseEventsNoticesClient";
import { getServerTenantLink } from "@/lib/routing-server";

export const dynamic = "force-dynamic";

export default async function FranchiseEventsNoticesPage({
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
      centerCode: true,
      isSubdomainEnabled: true,
      signatureUrl: true,
      ownerPhotoUrl: true,
      ownerAddress: true,
      pinCode: true,
      state: true,
      district: true,
      logoUrl: true,
    }
  });

  if (!workspace) {
    notFound();
  }

  const headersList = await headers();
  const host = headersList.get("host") || "";
  const isSubdomainMode = headersList.get("x-routing-mode") === "subdomain";

  return (
    <FranchiseEventsNoticesClient
      workspaceId={workspace.id}
      workspaceName={workspace.name}
      workspaceSubdomain={workspace.subdomain}
      workspace={workspace}
      initialHost={host}
      isSubdomainMode={isSubdomainMode}
    />
  );
}
