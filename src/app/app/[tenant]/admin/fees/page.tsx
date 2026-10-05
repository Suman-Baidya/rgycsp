import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getStudents } from "@/app/actions/students";
import { getPendingFeePayments } from "@/app/actions/payments";
import { getCachedGlobalSettings } from "@/lib/settings";
import { getBrandShortName } from "@/lib/branding";
import FeesManagementClient from "./FeesManagementClient";

export default async function FeesPage({
  params
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  const normalizedTenant = tenant?.toLowerCase()?.trim();

  const workspace = await db.workspace.findFirst({
    where: {
      OR: [
        { subdomain: normalizedTenant },
        { centerCode: { equals: normalizedTenant, mode: 'insensitive' } },
        { id: tenant }
      ]
    }
  });

  if (!workspace) {
    notFound();
    return null;
  }

  const [
    studentsResult,
    pendingFeesResult,
    paymentConfig,
    siteSettings,
    globalSiteSettings
  ] = await Promise.all([
    getStudents(workspace.id),
    getPendingFeePayments(workspace.id),
    db.franchisePaymentConfig.findUnique({
      where: { workspaceId: workspace.id }
    }),
    db.siteSettings.findUnique({
      where: { workspaceId: workspace.id }
    }),
    getCachedGlobalSettings()
  ]);

  const workspaceInfo = {
    name: siteSettings?.siteName || workspace.name,
    phone: siteSettings?.contactPhone || "",
    email: siteSettings?.contactEmail || "",
    address: siteSettings?.address || workspace.ownerAddress || "",
    logoUrl: siteSettings?.logoUrl || workspace.logoUrl || "",
    globalLogoUrl: globalSiteSettings?.logoUrl || "",
    globalSiteName: globalSiteSettings?.siteName || "ABCD",
    globalBrandShortName: getBrandShortName(globalSiteSettings?.siteName, null),
    shortName: (siteSettings?.navbarConfig as any)?.shortName || getBrandShortName(siteSettings?.siteName || workspace.name, null),
    centerCode: workspace.centerCode || "",
    primaryColor: siteSettings?.primaryColor || "#0f766e" // fallback to a teal-like theme
  };

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 w-full mx-auto">
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
