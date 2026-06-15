import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { MainFooter } from "@/components/layout/MainFooter";
import { PageHeader } from "@/components/layout/PageHeader";
import { db } from "@/lib/prisma";
import { auth } from "@/auth";
import { Calendar, Clock, MapPin, ArrowRight, Video, Users, ListTodo, Images } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EventsListClient } from "@/components/events/EventsListClient";

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

  const allEvents = await db.event.findMany({
    where: { isActive: true },
    orderBy: { date: 'desc' },
  });

  const featuredEvent = allEvents.find(e => e.isFeatured) || allEvents[0];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-zinc-950">
      <LandingNavbar settings={settings} user={session?.user} />

      <main className="flex-1">
        {isSectionActive("page-header-events") && (
          <PageHeader
            data={getSectionData("page-header-events")}
            title="News & Events"
            subtitle="Stay up to date with the latest happenings, academic seminars, and cultural celebrations."
            bgImage="https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070"
            breadcrumb="Events"
          />
        )}

        {/* Featured Event Hero */}
        {featuredEvent && (
          <section className="py-12 sm:py-20 relative overflow-hidden">
            <div className="absolute top-0 left-0 -translate-y-12 -translate-x-1/3 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <Link href={`/events/${featuredEvent.id}`} className="block group">
                <div className="bg-white dark:bg-zinc-900 rounded-[3rem] border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-2xl shadow-primary/5 flex flex-col lg:flex-row relative group-hover:shadow-primary/10 transition-all duration-500">
                  <div className="absolute top-8 left-8 z-20 bg-amber-500 px-4 py-1.5 rounded-full text-[10px] font-black text-white shadow-lg shadow-amber-500/20 uppercase tracking-[0.2em] animate-pulse">
                    Featured Event
                  </div>
                  <div className="w-full lg:w-1/2 aspect-square lg:aspect-auto relative overflow-hidden bg-slate-100 dark:bg-zinc-800">
                    {featuredEvent.image ? (
                      <img 
                        src={featuredEvent.image} 
                        alt={featuredEvent.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                        <Calendar className="w-24 h-24 text-primary/30" />
                      </div>
                    )}
                  </div>
                  <div className="w-full lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
                    {featuredEvent.category && (
                      <span className="text-primary font-bold text-sm tracking-widest uppercase mb-4">{featuredEvent.category}</span>
                    )}
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight mb-6 group-hover:text-primary transition-colors">
                      {featuredEvent.title}
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 line-clamp-4">
                      {featuredEvent.description}
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">Date</div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">{new Date(featuredEvent.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                        </div>
                      </div>
                      {featuredEvent.time && (
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                            <Clock className="w-6 h-6 text-amber-500" />
                          </div>
                          <div>
                            <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">Time</div>
                            <div className="font-bold text-slate-800 dark:text-slate-200">{featuredEvent.time}</div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="pt-8 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-slate-500" />
                        </div>
                        <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                          {featuredEvent.hostName || "Main Institute"}
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white -translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </section>
        )}

        {/* All Events with Search, Filter & Pagination */}
        <EventsListClient events={allEvents} />

      </main>

      <MainFooter settings={settings} />
    </div>
  );
}
