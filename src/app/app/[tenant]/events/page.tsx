import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { WorkspaceNavbar } from "@/components/layout/WorkspaceNavbar";
import { LandingFooter } from "@/components/layout/LandingFooter";
import { CustomThemeStyle } from "@/components/providers/CustomThemeStyle";
import { auth } from "@/auth";
import { EventsList } from "./EventsList";
import { WorkspacePageHeader } from "@/components/layout/WorkspacePageHeader";

export default async function EventsPage({
  params
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;

  // Construct include object dynamically to avoid validation errors before restart
  const workspaceInclude: any = {};
  if ((db as any).event) {
    workspaceInclude.events = {
      where: { isActive: true },
      orderBy: { date: 'asc' }
    };
  }

  const workspace = await db.workspace.findUnique({
    where: { subdomain: tenant },
    include: workspaceInclude
  });

  if (!workspace) notFound();
  
  const events = (workspace as any).events || [];

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

  return (
    <div className="flex flex-col min-h-screen font-sans bg-background">
      <CustomThemeStyle 
        primaryColor={workspaceSettings.primaryColor || undefined} 
        accentColor={workspaceSettings.accentColor || undefined} 
        fontFamily={workspaceSettings.fontFamily || undefined} 
      />
      <WorkspaceNavbar settings={workspaceSettings} user={session?.user} />

      <main className="flex-1 w-full">
        <WorkspacePageHeader 
           title="Upcoming Events"
           description={(eventSection?.content as any)?.description || "Join us in our upcoming seminars, workshops, and cultural activities."}
           bgImage={(workspaceSettings as any).pageHeaderBanner || undefined}
           breadcrumbs={[
              { name: "Events", href: "/events" }
           ]}
        />
        
        <div className="py-24 px-6 max-w-7xl mx-auto">
          <EventsList events={events} />
        </div>
      </main>

      <LandingFooter settings={workspaceSettings} />
    </div>
  );
}
