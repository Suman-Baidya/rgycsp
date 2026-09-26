import React from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/prisma";
import { auth } from "@/auth";
import { WorkspaceNavbar } from "@/components/layout/WorkspaceNavbar";
import { WorkspaceFooter } from "@/components/layout/WorkspaceFooter";
import { CustomThemeStyle } from "@/components/providers/CustomThemeStyle";
import { getFunnelConfig } from "@/app/actions/enquiries";
import { CampaignLeadModalPage } from "@/components/enquiry/CampaignLeadModalPage";

export const dynamic = "force-dynamic";

export default async function FranchiseCampaignLeadPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenant: string }>;
  searchParams: Promise<{ source?: string }>;
}) {
  const { tenant } = await params;
  const resolvedSearchParams = await searchParams;
  const socialSource = resolvedSearchParams?.source || "social_campaign";

  const workspace = await db.workspace.findUnique({
    where: { subdomain: tenant?.toLowerCase() },
    include: {
      siteSettings: true
    }
  });

  if (!workspace || !workspace.siteSettings) {
    notFound();
  }

  const [session, config] = await Promise.all([
    auth(),
    getFunnelConfig(workspace.id)
  ]);

  const closeUrl = `/app/${workspace.subdomain}`;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 dark:bg-slate-950 font-sans relative">
      <CustomThemeStyle
        primaryColor={workspace.siteSettings.primaryColor || undefined}
        accentColor={workspace.siteSettings.accentColor || undefined}
        fontFamily={workspace.siteSettings.fontFamily || undefined}
      />

      <WorkspaceNavbar 
        settings={workspace.siteSettings} 
        user={session?.user} 
        tenant={tenant} 
      />

      {/* Main Page Content (dimmed and blurred behind modal) */}
      <main className="flex-1 w-full min-h-[80vh]" />

      <WorkspaceFooter settings={workspace.siteSettings} tenant={tenant} />

      {/* High-End Popup Modal Experience (Exact Match with Super Admin) */}
      <CampaignLeadModalPage
        initialType="STUDENT"
        socialSource={socialSource}
        config={config}
        workspaceId={workspace.id}
        workspaceName={workspace.name}
        workspaceSubdomain={workspace.subdomain}
        onCloseUrl={closeUrl}
      />
    </div>
  );
}
