import { findWorkspaceByTenant } from "@/lib/workspace";
import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { WorkspaceNavbar } from "@/components/layout/WorkspaceNavbar";
import { WorkspaceFooter } from "@/components/layout/WorkspaceFooter";
import { CustomThemeStyle } from "@/components/providers/CustomThemeStyle";
import { auth } from "@/auth";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  ArrowLeft, 
  Tag, 
  Phone, 
  Video, 
  Users, 
  ListTodo, 
  Images, 
  Building2, 
  ShieldCheck,
  CheckCircle2,
  Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { EventActionButtons } from "@/components/events/EventActionButtons";
import { getServerTenantLink } from "@/lib/routing-server";

export default async function EventDetailsPage({
  params
}: {
  params: Promise<{ tenant: string; eventId: string }>;
}) {
  const { tenant, eventId } = await params;

  const workspace = await findWorkspaceByTenant(tenant);

  if (!workspace) notFound();

  const event = await db.event.findUnique({
    where: { id: eventId },
    include: {
      workspace: { select: { name: true, subdomain: true, centerCode: true } }
    }
  });

  // Verify event belongs to this workspace OR is a Super Admin global event broadcast to all franchises
  const isAuthorizedEvent = event && event.isActive && (
    event.workspaceId === workspace.id ||
    (event.workspaceId === null && event.showOnFranchises)
  );

  if (!isAuthorizedEvent) notFound();

  const workspaceSettings = await db.siteSettings.findFirst({
    where: { workspaceId: workspace.id }
  });

  if (!workspaceSettings) notFound();

  const session = await auth();
  const eventsListHref = await getServerTenantLink("/events", tenant);

  // Parse structured JSON arrays defensively
  let guests: any[] = [];
  let schedule: any[] = [];
  let gallery: string[] = [];

  try { 
    guests = typeof event.guests === "string" ? JSON.parse(event.guests) : (event.guests || []); 
  } catch (e) {
    guests = [];
  }

  try { 
    schedule = typeof event.programDetails === "string" ? JSON.parse(event.programDetails) : (event.programDetails || []); 
  } catch (e) {
    schedule = [];
  }

  try { 
    gallery = typeof event.galleryImages === "string" ? JSON.parse(event.galleryImages) : (event.galleryImages || []); 
  } catch (e) {
    gallery = [];
  }

  const eventDate = new Date(event.date);
  const isPast = eventDate < new Date(new Date().setHours(0, 0, 0, 0));
  const isGlobalEvent = event.workspaceId === null;

  // Extract YouTube ID for video player embed if present
  let youtubeId = "";
  if (event.videoUrl) {
    const match = event.videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    if (match) youtubeId = match[1];
  }

  const organizerName = event.hostName || (isGlobalEvent ? "RGYCSP Head Office (National Event)" : workspace.name);

  return (
    <div className="flex flex-col min-h-screen font-sans bg-slate-50/50 dark:bg-zinc-950">
      <CustomThemeStyle 
        primaryColor={workspaceSettings.primaryColor || undefined} 
        accentColor={workspaceSettings.accentColor || undefined} 
        fontFamily={workspaceSettings.fontFamily || undefined} 
      />
      <WorkspaceNavbar settings={workspaceSettings} user={session?.user} tenant={tenant} />

      <main className="flex-1 pb-24">
        {/* Hero Section */}
        <section className="relative pt-28 pb-20 lg:pt-40 lg:pb-32 overflow-hidden bg-slate-900">
          {event.image ? (
            <>
              <Image 
                src={event.image} 
                alt={event.title} 
                fill
                priority
                sizes="100vw"
                className="object-cover opacity-35" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-slate-950" />
          )}

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-white">
            <Link 
              href={eventsListHref} 
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-300 hover:text-white transition-colors mb-8 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 w-fit"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Center Events
            </Link>
            
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {event.category && (
                <div className="bg-primary px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md text-white">
                  {event.category}
                </div>
              )}
              {isGlobalEvent && (
                <div className="bg-amber-500/90 text-white backdrop-blur-md px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  National Event
                </div>
              )}
              {isPast ? (
                <div className="bg-slate-700/80 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20 text-slate-200">
                  Completed
                </div>
              ) : (
                <div className="bg-emerald-500/90 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md text-white flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  Upcoming
                </div>
              )}
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] mb-8 max-w-4xl text-white">
              {event.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 sm:gap-8 text-xs sm:text-sm font-semibold text-slate-200 pt-2 border-t border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                  <Calendar className="w-4 h-4" />
                </div>
                <span>
                  {eventDate.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
              {event.time && (
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span>{event.time}</span>
                </div>
              )}
              {event.location && (
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span>{event.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Building2 className="w-4 h-4" />
                </div>
                <span>{organizerName}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-12 relative z-20 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* About this Event */}
            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-6 sm:p-10 shadow-sm border border-slate-200/80 dark:border-zinc-800">
              <h2 className="text-xl sm:text-2xl font-black mb-6 flex items-center gap-3 text-slate-900 dark:text-white">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <ListTodo className="w-5 h-5" />
                </div>
                About this Event
              </h2>
              <div className="prose prose-slate dark:prose-invert max-w-none whitespace-pre-line text-slate-600 dark:text-slate-400 leading-relaxed font-medium text-sm sm:text-base">
                {event.description || "No description provided for this event."}
              </div>
            </div>

            {/* Video Coverage Section */}
            {youtubeId && (
              <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-6 sm:p-10 shadow-sm border border-slate-200/80 dark:border-zinc-800">
                <h2 className="text-xl sm:text-2xl font-black mb-6 flex items-center gap-3 text-slate-900 dark:text-white">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
                    <Video className="w-5 h-5" />
                  </div>
                  Event Coverage & Highlights
                </h2>
                <div className="aspect-video rounded-2xl overflow-hidden bg-slate-100 dark:bg-zinc-800 shadow-md">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src={`https://www.youtube.com/embed/${youtubeId}`} 
                    title="Event Video Coverage" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* Event Itinerary / Schedule */}
            {schedule.length > 0 && (
              <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-6 sm:p-10 shadow-sm border border-slate-200/80 dark:border-zinc-800">
                <h2 className="text-xl sm:text-2xl font-black mb-8 flex items-center gap-3 text-slate-900 dark:text-white">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  Event Itinerary & Timeline
                </h2>
                <div className="space-y-6">
                  {schedule.map((item, idx) => (
                    <div key={idx} className="flex gap-4 sm:gap-6 relative">
                      <div className="w-20 sm:w-24 shrink-0 text-right">
                        <span className="text-xs sm:text-sm font-black text-primary">{item.time}</span>
                      </div>
                      <div className="relative pb-6 flex-1">
                        {idx !== schedule.length - 1 && (
                          <div className="absolute top-6 bottom-0 left-[7px] w-px bg-slate-200 dark:bg-zinc-800" />
                        )}
                        <div className="absolute top-1.5 left-0 w-4 h-4 rounded-full bg-white dark:bg-zinc-900 border-2 border-primary z-10" />
                        <div className="pl-7 sm:pl-8">
                          <h4 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white leading-snug">
                            {item.activity}
                          </h4>
                          {item.speaker && (
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                              Speaker / Host: <span className="text-primary font-semibold">{item.speaker}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Event Gallery */}
            {gallery.length > 0 && (
              <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-6 sm:p-10 shadow-sm border border-slate-200/80 dark:border-zinc-800">
                <h2 className="text-xl sm:text-2xl font-black mb-6 flex items-center gap-3 text-slate-900 dark:text-white">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                    <Images className="w-5 h-5" />
                  </div>
                  Event Photo Gallery
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {gallery.map((imgUrl, idx) => (
                    <div key={idx} className="aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-zinc-800 group relative">
                      <Image 
                        src={imgUrl} 
                        alt={`Event gallery ${idx + 1}`} 
                        fill
                        loading="lazy"
                        sizes="(max-width: 768px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Call To Action / Registration Box */}
            <div className="p-6 sm:p-10 rounded-[2.5rem] bg-gradient-to-br from-primary/5 via-slate-50 to-primary/10 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800/60 border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1.5 text-center md:text-left">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Interested in attending?</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                  Connect with our center administration for admission, registrations, or invitations.
                </p>
              </div>
              <EventActionButtons 
                contactPhone={workspaceSettings.contactPhone || undefined} 
                eventTitle={event.title} 
              />
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-8">
            
            {/* Organized By & Venue Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-6 sm:p-8 shadow-sm border border-slate-200/80 dark:border-zinc-800 space-y-6">
              <div className="text-center pb-6 border-b border-slate-100 dark:border-zinc-800">
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2">Organized By</p>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">{organizerName}</h3>
                {isGlobalEvent ? (
                  <span className="inline-block mt-2 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    Central Network Event
                  </span>
                ) : (
                  <span className="inline-block mt-2 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary uppercase tracking-wider">
                    Franchise Center Host
                  </span>
                )}
              </div>

              {/* Special Guests */}
              {guests.length > 0 && (
                <div>
                  <h4 className="font-bold text-sm flex items-center gap-2 mb-4 text-slate-900 dark:text-white">
                    <Users className="w-4 h-4 text-primary" /> Special Guests & VIPs
                  </h4>
                  <div className="space-y-3">
                    {guests.map((guest: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-3 bg-slate-50 dark:bg-zinc-950 p-2.5 rounded-2xl border border-slate-100 dark:border-zinc-800">
                        {guest.image ? (
                          <Image 
                            src={guest.image} 
                            alt={guest.name || "Guest"} 
                            width={44} 
                            height={44} 
                            className="w-11 h-11 rounded-full object-cover shrink-0" 
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                            {guest.name ? guest.name.charAt(0) : "G"}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                            {guest.name}
                          </p>
                          <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                            {guest.role}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Event Quick Details */}
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-zinc-800">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Date</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {eventDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Time</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {event.time || "To be announced"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Venue</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {event.location || "On Campus"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Arrival Guideline Note */}
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                <p className="text-xs font-semibold text-primary leading-relaxed">
                  Please arrive at least 15 minutes before the scheduled start time for entry verification.
                </p>
              </div>

              {/* Center Contact Helper */}
              {workspaceSettings.contactPhone && (
                <div className="text-center pt-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Center Desk</p>
                  <a 
                    href={`tel:${workspaceSettings.contactPhone}`} 
                    className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {workspaceSettings.contactPhone}
                  </a>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>

      <WorkspaceFooter settings={workspaceSettings} tenant={tenant} />
    </div>
  );
}
