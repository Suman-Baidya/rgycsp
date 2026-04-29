import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { WorkspaceNavbar } from "@/components/layout/WorkspaceNavbar";
import { LandingFooter } from "@/components/layout/LandingFooter";
import { CustomThemeStyle } from "@/components/providers/CustomThemeStyle";
import { auth } from "@/auth";
import { Calendar, MapPin, Clock, ArrowLeft, Share2, Tag, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { EventActionButtons } from "@/components/events/EventActionButtons";

export default async function EventDetailsPage({
  params
}: {
  params: Promise<{ tenant: string; eventId: string }>;
}) {
  const { tenant, eventId } = await params;

  const workspace = await db.workspace.findUnique({
    where: { subdomain: tenant }
  });

  if (!workspace) notFound();

  const event = await db.event.findUnique({
    where: { id: eventId }
  });

  if (!event || event.workspaceId !== workspace.id) notFound();

  const workspaceSettings = await db.siteSettings.findFirst({
    where: { workspaceId: workspace.id }
  });

  if (!workspaceSettings) notFound();

  const session = await auth();

  return (
    <div className="flex flex-col min-h-screen font-sans bg-white dark:bg-slate-950">
      <CustomThemeStyle 
        primaryColor={workspaceSettings.primaryColor || undefined} 
        accentColor={workspaceSettings.accentColor || undefined} 
        fontFamily={workspaceSettings.fontFamily || undefined} 
      />
      <WorkspaceNavbar settings={workspaceSettings} user={session?.user} />

      <main className="flex-1 w-full">
        {/* Hero Section with Image */}
        <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
          <img 
            src={event.image || "https://images.unsplash.com/photo-1514525253361-bee8718a74a2?q=80&w=2070"} 
            alt={event.title} 
            className="w-full h-full object-cover"
          />
          {/* Protective top-down shadow for navbar visibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950/20 to-transparent z-10" />
          
          <div className="absolute bottom-0 left-0 w-full py-12 px-6 z-20">
            <div className="max-w-7xl mx-auto space-y-6">
              <Link href={`/events`} className="inline-flex items-center gap-2 text-white font-bold hover:underline decoration-primary decoration-2 underline-offset-4 transition-all mb-4 group cursor-pointer relative">
                 <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-primary transition-all">
                    <ArrowLeft className="w-4 h-4 text-white" />
                 </div>
                 Back to Events
              </Link>
              <div className="space-y-4">
                 <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-xl">
                    <Tag className="w-3 h-3" />
                    {event.category || "Special Event"}
                 </div>
                 <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-[1.1]">
                    {event.title}
                 </h1>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
               <div className="prose prose-slate dark:prose-invert max-w-none">
                  <h2 className="text-3xl font-black mb-6">About the Event</h2>
                  <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                     {event.description || "No description provided for this event."}
                  </p>
               </div>


               <div className="p-8 rounded-[3rem] bg-slate-50 dark:bg-zinc-900 border border-border/40 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="space-y-2 text-center md:text-left">
                     <h3 className="text-xl font-black">Interested in attending?</h3>
                     <p className="text-sm text-muted-foreground font-medium">Contact us for registrations and further details.</p>
                  </div>
                  <EventActionButtons 
                    contactPhone={workspaceSettings.contactPhone || undefined} 
                    eventTitle={event.title} 
                  />
               </div>
            </div>

            {/* Sidebar Details */}
            <div className="space-y-8">
               <div className="p-10 rounded-[3rem] bg-white dark:bg-zinc-900 border border-border shadow-xl space-y-10">
                  <div className="space-y-8">
                     <div className="flex items-start gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                           <Calendar className="w-7 h-7" />
                        </div>
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Date</p>
                           <p className="text-xl font-black">
                              {new Date(event.date).toLocaleDateString('en-GB')}
                           </p>
                        </div>
                     </div>

                     <div className="flex items-start gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                           <Clock className="w-7 h-7" />
                        </div>
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Time</p>
                           <p className="text-xl font-black">{event.time || "To be announced"}</p>
                        </div>
                     </div>

                     <div className="flex items-start gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                           <MapPin className="w-7 h-7" />
                        </div>
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Location</p>
                           <p className="text-xl font-black">{event.location || "On Campus"}</p>
                        </div>
                     </div>
                  </div>

                  <div className="pt-10 border-t border-border/40">
                     <div className="p-6 rounded-[2rem] bg-primary/5 border border-primary/10">
                        <p className="text-xs font-bold text-primary leading-relaxed text-center">
                           Please arrive at least 15 minutes before the scheduled start time.
                        </p>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </main>

      <LandingFooter settings={workspaceSettings} />
    </div>
  );
}
