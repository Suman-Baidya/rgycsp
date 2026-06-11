import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { MainFooter } from "@/components/layout/MainFooter";
import { PageHeader } from "@/components/layout/PageHeader";
import { db } from "@/lib/prisma";
import { auth } from "@/auth";
import { Calendar, Clock, MapPin } from "lucide-react";

export default async function EventsPage() {
  const session = await auth();
  const settings = await db.siteSettings.findFirst({
    where: { workspaceId: null },
    include: {
      sections: {
        orderBy: { order: "asc" }
      }
    }
  });

  if (!settings) {
    return <div>Site configuration missing. Please check the dashboard.</div>;
  }

  const isSectionActive = (type: string) => {
    return settings.sections.find(s => s.type === type)?.isActive ?? true;
  };

  const getSectionData = (type: string) => {
    return settings.sections.find(s => s.type === type);
  };

  const events = await db.event.findMany({
    where: { isActive: true },
    include: {
      workspace: { select: { name: true } }
    },
    orderBy: { date: 'asc' },
    take: 12
  });

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <LandingNavbar settings={settings} user={session?.user} />

      <main className="flex-1">
        {isSectionActive("page-header-events") && (
          <PageHeader
            data={getSectionData("page-header-events")}
            title="News & Events"
            subtitle="Stay up to date with the latest happenings across our network."
            bgImage="https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070"
            breadcrumb="Events"
          />
        )}

        <section className="py-20 bg-background relative overflow-hidden">
           <div className="max-w-7xl mx-auto px-6 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {events.map((event) => (
                  <div key={event.id} className="bg-card border border-border/50 rounded-[2rem] overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 group">
                    {event.image && (
                      <div className="h-48 bg-muted relative overflow-hidden">
                         <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                         {event.category && (
                           <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                             {event.category}
                           </div>
                         )}
                      </div>
                    )}
                    <div className="p-6 space-y-4">
                      <div className="flex flex-col gap-2 mb-4">
                         <h3 className="text-xl font-bold line-clamp-2">{event.title}</h3>
                         <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-muted-foreground">
                            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(event.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            {event.time && <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {event.time}</span>}
                         </div>
                      </div>
                      {event.location && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-4">
                          <MapPin className="w-3.5 h-3.5 text-primary" /> {event.location}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground line-clamp-3">{event.description || "Join us for this exciting event!"}</p>
                      <div className="pt-4 border-t border-border/50 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        <span>Organized by:</span>
                        <span className="text-foreground">{event.workspace.name}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {events.length === 0 && (
                <div className="text-center py-20 text-muted-foreground font-medium">
                  No upcoming events scheduled at the moment.
                </div>
              )}
           </div>
        </section>

      </main>

      <MainFooter settings={settings} />
    </div>
  );
}
