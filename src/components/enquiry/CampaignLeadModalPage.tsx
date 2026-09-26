"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { SocialMediaLeadFunnel } from "@/components/enquiry/SocialMediaLeadFunnel";
import { FunnelConfig } from "@/types/funnel";

interface CampaignLeadModalPageProps {
  initialType: "FRANCHISE" | "STUDENT";
  socialSource: string;
  config: FunnelConfig;
  workspaceId?: string | null;
  workspaceName?: string;
  workspaceSubdomain?: string;
  onCloseUrl?: string;
}

export function CampaignLeadModalPage({
  initialType,
  socialSource,
  config,
  workspaceId = null,
  workspaceName,
  workspaceSubdomain,
  onCloseUrl = "/",
}: CampaignLeadModalPageProps) {
  const router = useRouter();

  return (
    <div 
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          router.push(onCloseUrl);
        }
      }}
    >
      <div 
        className="w-full max-w-lg my-auto relative z-10" 
        onClick={(e) => e.stopPropagation()}
      >
        <SocialMediaLeadFunnel
          initialType={initialType}
          socialSource={socialSource}
          workspaceId={workspaceId}
          workspaceName={workspaceName}
          workspaceSubdomain={workspaceSubdomain}
          config={config}
          isModal={true}
          onClose={() => router.push(onCloseUrl)}
        />
      </div>
    </div>
  );
}
