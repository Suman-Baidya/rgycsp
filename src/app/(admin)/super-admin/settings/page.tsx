import { db } from "@/lib/prisma";
import { SettingsForm } from "./SettingsForm";

import { AdminPageHeader } from "@/components/layout/AdminPageHeader";

export default async function SettingsPage() {
  const siteSettings = await db.siteSettings.findFirst({
    where: { workspaceId: null },
    include: {
      sections: {
        orderBy: { order: "asc" }
      }
    }
  });

  if (!siteSettings) {
    return <div>Error: Site settings not found. Please run the seed script.</div>;
  }

  return (
    <div className="space-y-10 pb-12 max-w-7xl mx-auto">
      <AdminPageHeader 
        title="Site Management" 
        description="Configure the global landing page, branding, and navigation."
      />

      <SettingsForm settings={siteSettings} />
    </div>
  );
}
