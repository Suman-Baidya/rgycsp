import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getStudents } from "@/app/actions/students";
import { getPendingFeePayments } from "@/app/actions/payments";
import FeesManagementClient from "./FeesManagementClient";

export default async function FeesPage({
  params
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  const normalizedTenant = tenant?.toLowerCase();

  const workspace = await db.workspace.findUnique({
    where: { subdomain: normalizedTenant }
  });

  if (!workspace) {
    notFound();
    return null;
  }

  const studentsResult = await getStudents(workspace.id);
  const pendingFeesResult = await getPendingFeePayments(workspace.id);
  
  const paymentConfig = await db.franchisePaymentConfig.findUnique({
    where: { workspaceId: workspace.id }
  });

  const siteSettings = await db.siteSettings.findUnique({
    where: { workspaceId: workspace.id }
  });

  const globalSiteSettings = await db.siteSettings.findFirst({
    where: { workspaceId: null }
  });

  const workspaceInfo = {
    name: siteSettings?.siteName || workspace.name,
    phone: siteSettings?.contactPhone || "",
    email: siteSettings?.contactEmail || "",
    address: siteSettings?.address || workspace.ownerAddress || "",
    logoUrl: siteSettings?.logoUrl || workspace.logoUrl || "",
    globalLogoUrl: globalSiteSettings?.logoUrl || "",
    globalSiteName: globalSiteSettings?.siteName || "RGYCSP",
    centerCode: workspace.centerCode || "",
    primaryColor: siteSettings?.primaryColor || "#0f766e" // fallback to a teal-like theme
  };

  return (
    <div className="p-4 lg:p-10 max-w-7xl mx-auto space-y-8 w-full">
      <FeesManagementClient 
        workspaceId={workspace.id}
        students={studentsResult.data ?? []}
        pendingFees={pendingFeesResult.success ? pendingFeesResult.data : []}
        paymentConfig={paymentConfig}
        workspaceInfo={workspaceInfo}
      />
    </div>
  );
}
