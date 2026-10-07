import { findWorkspaceByTenant } from "@/lib/workspace";
import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { WorkspaceNavbar } from "@/components/layout/WorkspaceNavbar";
import { WorkspaceFooter } from "@/components/layout/WorkspaceFooter";
import { CustomThemeStyle } from "@/components/providers/CustomThemeStyle";
import { auth } from "@/auth";
import { EventsList } from "./EventsList";
import { WorkspacePageHeader } from "@/components/layout/WorkspacePageHeader";
import { getServerTenantLink } from "@/lib/routing-server";

export default async function EventsPage({
  params
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;

  const workspace = await findWorkspaceByTenant(tenant);

  if (!workspace) notFound();
  
  const rawEvents = await db.event.findMany({
    where: {
      isActive: true,
      OR: [
        { workspaceId: workspace.id },
        { workspaceId: null, showOnFranchises: true },
      ],
    },
    orderBy: { date: 'asc' }
  });

  const events = rawEvents || [];

  const workspaceSettings = await db.siteSettings.findFirst({
    where: { workspaceId: workspace.id },
    include: {
      workspace: true,
      sections: {
        where: { type: 'events' }
      }
    }
  });

  if (!workspaceSettings) notFound();

  const session = await auth();
  const eventSection = workspaceSettings.sections[0];
  const eventsHref = await getServerTenantLink("/events", tenant);

  return (
    <div className="flex flex-col min-h-screen font-sans bg-background">
      <CustomThemeStyle 
        primaryColor={workspaceSettings.primaryColor || undefined} 
        accentColor={workspaceSettings.accentColor || undefined} 
        fontFamily={workspaceSettings.fontFamily || undefined} 
      />
      <WorkspaceNavbar settings={workspaceSettings} user={session?.user} tenant={tenant} />

      <main className="flex-1 w-full">
        <WorkspacePageHeader 
           title={workspaceSettings.siteName ? `${workspaceSettings.siteName} Events` : "Upcoming Events"}
           description={(eventSection?.content as any)?.description || "Explore upcoming workshops, academic seminars, and celebrations organized by our center and head office."}
           bgImage={(workspaceSettings as any).pageHeaderBanner || undefined}
           breadcrumbs={[
              { name: "Events", href: eventsHref }
           ]}
        />
        
        <div className="py-24 px-6 max-w-7xl mx-auto">
          <EventsList events={events} />
        </div>
      </main>

      <WorkspaceFooter settings={workspaceSettings} tenant={tenant} />
    </div>
  );
}
