import React from "react";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { MainFooter } from "@/components/layout/MainFooter";
import { SocialMediaLeadFunnel } from "@/components/enquiry/SocialMediaLeadFunnel";
import { db } from "@/lib/prisma";
import { auth } from "@/auth";

import { getFunnelConfig } from "@/app/actions/enquiries";

import { CampaignLeadModalPage } from "@/components/enquiry/CampaignLeadModalPage";

export const dynamic = "force-dynamic";

export default async function GlobalCampaignLeadPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; source?: string }>;
}) {
  const session = await auth();
  const resolvedSearchParams = await searchParams;
  const rawType = resolvedSearchParams?.type?.toUpperCase();
  const initialType: "FRANCHISE" | "STUDENT" = rawType === "FRANCHISE" ? "FRANCHISE" : "STUDENT";
  const socialSource = resolvedSearchParams?.source || "social_campaign";

  const [settings, config] = await Promise.all([
    db.siteSettings.findFirst({
      where: { workspaceId: null }
    }),
    getFunnelConfig(null)
  ]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 dark:bg-slate-950 font-sans relative">
      <LandingNavbar settings={settings} user={session?.user} />

      {/* Main Page Content (dimmed behind modal) */}
      <main className="flex-1 w-full min-h-[80vh]" />

      <MainFooter settings={settings} />

      {/* High-End Popup Modal Experience */}
      <CampaignLeadModalPage
        initialType={initialType}
        socialSource={socialSource}
        config={config}
      />
    </div>
  );
}
