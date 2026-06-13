import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { MainFooter } from "@/components/layout/MainFooter";
import { db } from "@/lib/prisma";
import { auth } from "@/auth";
import { Calendar, Clock, MapPin, ArrowLeft, Video, Users, ListTodo, Images } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { notFound } from "next/navigation";

export default async function EventDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();
  
  const [settings, event] = await Promise.all([
    db.siteSettings.findFirst({
      where: { workspaceId: null },
      include: {
        sections: { orderBy: { order: "asc" } }
      }
    }),
    db.event.findUnique({
      where: { id: params.id },
      include: {
        workspace: { select: { name: true } }
      }
    })
  ]);

  if (!event || !event.isActive) {
    return notFound();
  }

  let guests: any[] = [];
  let schedule: any[] = [];
  let gallery: string[] = [];

  try { guests = typeof event.guests === 'string' ? JSON.parse(event.guests) : (event.guests || []); } catch(e){}
  try { schedule = typeof event.programDetails === 'string' ? JSON.parse(event.programDetails) : (event.programDetails || []); } catch(e){}
  try { gallery = typeof event.galleryImages === 'string' ? JSON.parse(event.galleryImages) : (event.galleryImages || []); } catch(e){}

  const eventDate = new Date(event.date);
  const isPast = eventDate < new Date(new Date().setHours(0,0,0,0));

  // Extract YouTube ID for embed
  let youtubeId = "";
  if (event.videoUrl) {
    const match = event.videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    if (match) youtubeId = match[1];
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-zinc-950">
      <LandingNavbar settings={settings} user={session?.user} />

      <main className="flex-1 pb-24">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-slate-900">
          {event.image ? (
            <>
              <img src={event.image} alt={event.title} className="absolute inset-0 w-full h-full object-cover opacity-40" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-slate-900" />
          )}
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-white">
            <Link href="/events" className="inline-flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-white transition-colors mb-8 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
              <ArrowLeft className="w-4 h-4" /> Back to Events
            </Link>
            
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {event.category && (
                <div className="bg-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                  {event.category}
                </div>
              )}
              {isPast ? (
                <div className="bg-slate-500/50 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">
                  Completed
                </div>
              ) : (
                <div className="bg-green-500/50 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">
                  Upcoming
                </div>
              )}
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-8 max-w-4xl">
              {event.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm sm:text-base font-medium text-slate-200">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                {eventDate.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
              </div>
              {event.time && (
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-500" />
                  {event.time}
                </div>
              )}
              {event.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-500" />
                  {event.location}
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 sm:p-12 shadow-sm border border-slate-200 dark:border-zinc-800">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <ListTodo className="w-5 h-5" />
                </div>
                About this Event
              </h2>
              <div className="prose prose-slate dark:prose-invert max-w-none whitespace-pre-line text-slate-600 dark:text-slate-400">
                {event.description || "No description provided."}
              </div>
            </div>

            {/* Video Section */}
            {youtubeId && (
              <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 sm:p-12 shadow-sm border border-slate-200 dark:border-zinc-800">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
                    <Video className="w-5 h-5" />
                  </div>
                  Event Coverage
                </h2>
                <div className="aspect-video rounded-2xl overflow-hidden bg-slate-100">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src={`https://www.youtube.com/embed/${youtubeId}`} 
                    title="YouTube video player" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}

            {/* Event Schedule */}
            {schedule.length > 0 && (
              <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 sm:p-12 shadow-sm border border-slate-200 dark:border-zinc-800">
                <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  Event Itinerary
                </h2>
                <div className="space-y-6">
                  {schedule.map((item, idx) => (
                    <div key={idx} className="flex gap-6 relative">
                      <div className="w-24 shrink-0 text-right">
                        <span className="text-sm font-bold text-primary">{item.time}</span>
                      </div>
                      <div className="relative pb-6">
                        {idx !== schedule.length - 1 && <div className="absolute top-6 bottom-0 left-[7px] w-px bg-slate-200 dark:bg-zinc-800" />}
                        <div className="absolute top-1.5 left-0 w-4 h-4 rounded-full bg-white dark:bg-zinc-900 border-2 border-primary z-10" />
                        <div className="pl-8">
                          <h4 className="font-bold text-lg text-slate-800 dark:text-slate-200">{item.activity}</h4>
                          {item.speaker && <p className="text-sm text-slate-500 mt-1">Speaker: {item.speaker}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery */}
            {gallery.length > 0 && (
              <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 sm:p-12 shadow-sm border border-slate-200 dark:border-zinc-800">
                <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                    <Images className="w-5 h-5" />
                  </div>
                  Event Gallery
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {gallery.map((imgUrl, idx) => (
                    <div key={idx} className="aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-zinc-800 group relative">
                      <img src={imgUrl} alt={`Gallery Image ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-200 dark:border-zinc-800 sticky top-32">
              <div className="text-center mb-6 pb-6 border-b border-slate-100 dark:border-zinc-800">
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2">Organized By</p>
                <h3 className="text-xl font-black text-slate-800 dark:text-slate-200">{event.workspace?.name || "Main Institute"}</h3>
              </div>

              {guests.length > 0 ? (
                <div>
                  <h3 className="font-bold flex items-center gap-2 mb-6">
                    <Users className="w-4 h-4 text-primary" /> Special Guests
                  </h3>
                  <div className="space-y-4">
                    {guests.map((guest, idx) => (
                      <div key={idx} className="flex items-center gap-4 bg-slate-50 dark:bg-zinc-950 p-3 rounded-2xl border border-slate-100 dark:border-zinc-800">
                        {guest.image ? (
                          <img src={guest.image} alt={guest.name} className="w-12 h-12 rounded-full object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {guest.name?.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{guest.name}</p>
                          <p className="text-[10px] uppercase font-bold text-slate-500">{guest.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-sm text-slate-500">
                  Contact the organizer for more details.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <MainFooter settings={settings} />
    </div>
  );
}
