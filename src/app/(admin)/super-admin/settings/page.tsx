import { db } from "@/lib/prisma";
import { SettingsForm } from "./SettingsForm";

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Site Management</h1>
        <p className="text-muted-foreground text-lg">
          Configure the global landing page, branding, and navigation.
        </p>
      </div>

      <SettingsForm settings={siteSettings} />
    </div>
  );
}
