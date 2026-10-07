"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Search, 
  SlidersHorizontal, 
  ArrowUpDown, 
  ChevronDown, 
  ArrowRight,
  ShieldCheck,
  Building2,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { useDebounce } from "@/hooks/useDebounce";
import { usePathname } from "next/navigation";
import { getTenantLink, detectTenant } from "@/lib/routing";

export function EventsList({ events }: { events: any[] }) {
  const pathname = usePathname();
  const tenant = detectTenant(pathname, typeof window !== 'undefined' ? window.location.hostname : undefined);
  const getLink = (path: string) => getTenantLink(path, tenant, pathname);

  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState<"soonest" | "latest">("soonest");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 250);

  const categories = useMemo(() => {
    return ["All", ...Array.from(new Set(events.map(e => e.category).filter(Boolean)))];
  }, [events]);

  const featuredEvent = useMemo(() => {
    if (events.length === 0) return null;
    return events.find(e => e.isFeatured) || events[0];
  }, [events]);

  const filteredEvents = useMemo(() => {
    let result = events.filter(e => {
      const q = debouncedSearch.toLowerCase();
      const matchesSearch = !q || 
        e.title.toLowerCase().includes(q) || 
        (e.description && e.description.toLowerCase().includes(q)) ||
        (e.location && e.location.toLowerCase().includes(q));
      const matchesFilter = filter === "All" || e.category === filter;
      return matchesSearch && matchesFilter;
    });

    result.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sort === "soonest" ? dateA - dateB : dateB - dateA;
    });

    return result;
  }, [events, debouncedSearch, filter, sort]);

  return (
    <div className="space-y-12">
      {/* Featured Event Spotlight (shows when not searching and featured event exists) */}
      {!debouncedSearch && filter === "All" && featuredEvent && (
        <section className="relative overflow-hidden mb-12">
          <Link href={getLink(`/events/${featuredEvent.id}`)} className="block group">
            <div className="bg-white dark:bg-zinc-900 rounded-[3rem] border border-slate-200/80 dark:border-zinc-800 overflow-hidden shadow-xl shadow-primary/5 flex flex-col lg:flex-row relative group-hover:shadow-2xl group-hover:shadow-primary/10 transition-all duration-500">
              <div className="absolute top-6 left-6 z-20 flex items-center gap-2">
                <span className="bg-amber-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black shadow-lg shadow-amber-500/20 uppercase tracking-[0.2em] flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  Featured Event
                </span>
                {featuredEvent.workspaceId === null && (
                  <span className="bg-primary/95 text-white px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    National
                  </span>
                )}
              </div>

              <div className="w-full lg:w-1/2 aspect-video lg:aspect-auto relative overflow-hidden bg-slate-100 dark:bg-zinc-800 min-h-[300px]">
                {featuredEvent.image ? (
                  <Image 
                    src={featuredEvent.image} 
                    alt={featuredEvent.title} 
                    fill
                    priority
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                    <Calendar className="w-20 h-20 text-primary/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:hidden" />
              </div>

              <div className="w-full lg:w-1/2 p-8 sm:p-12 flex flex-col justify-center">
                {featuredEvent.category && (
                  <span className="text-primary font-bold text-xs tracking-widest uppercase mb-3 block">
                    {featuredEvent.category}
                  </span>
                )}
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white leading-tight mb-4 group-hover:text-primary transition-colors">
                  {featuredEvent.title}
                </h2>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-8 line-clamp-3 leading-relaxed font-medium">
                  {featuredEvent.description || "Join us in this premier event to celebrate learning and excellence."}
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-widest font-bold text-slate-400">Date</div>
                      <div className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                        {new Date(featuredEvent.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  {featuredEvent.time && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[9px] uppercase tracking-widest font-bold text-slate-400">Time</div>
                        <div className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                          {featuredEvent.time}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="pt-6 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                    <MapPin className="w-4 h-4 text-emerald-500" />
                    <span>{featuredEvent.location || "On Campus"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-black text-primary group-hover:translate-x-1 transition-transform">
                    View Details <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-center justify-between p-4 sm:p-6 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-[2.5rem] shadow-sm">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search events by title, keyword, or venue..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-12 sm:h-14 rounded-2xl border-none bg-slate-50 dark:bg-zinc-800 font-medium text-xs sm:text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-60">
            <SlidersHorizontal className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary pointer-events-none" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full h-12 sm:h-14 pl-12 pr-10 bg-slate-50 dark:bg-zinc-800 border-none rounded-2xl font-bold text-xs sm:text-sm appearance-none cursor-pointer focus:ring-2 focus:ring-primary/20 outline-none transition-all hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-800 dark:text-slate-200"
            >
              <option value="All">All Categories ({events.length})</option>
              {categories.filter(cat => cat !== "All").map((cat: any) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>

          <Button 
            variant="ghost" 
            onClick={() => setSort(sort === "soonest" ? "latest" : "soonest")}
            className="h-12 sm:h-14 px-5 rounded-2xl gap-2.5 font-bold text-xs sm:text-sm bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-800 dark:text-slate-200"
          >
            <ArrowUpDown className="h-4 w-4 text-primary" />
            {sort === "soonest" ? "Soonest" : "Latest"}
          </Button>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredEvents.map((event, i) => {
            const isPast = new Date(event.date) < new Date(new Date().setHours(0, 0, 0, 0));
            const isGlobal = event.workspaceId === null;

            return (
              <motion.div
                key={event.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25, delay: i * 0.04 }}
              >
                <Card className="group overflow-hidden border-slate-200/80 dark:border-zinc-800 hover:border-primary/40 transition-all hover:shadow-2xl hover:shadow-primary/5 rounded-[2.5rem] bg-white dark:bg-zinc-900 h-full flex flex-col">
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-zinc-800">
                    <Image 
                      src={event.image || "https://images.unsplash.com/photo-1514525253361-bee8718a74a2?q=80&w=2070"} 
                      alt={event.title} 
                      fill
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className={`object-cover transition-transform duration-700 group-hover:scale-105 ${isPast ? 'grayscale opacity-75 group-hover:grayscale-0 group-hover:opacity-100' : ''}`} 
                    />

                    {/* Top Left Date Badge */}
                    <div className="absolute top-5 left-5">
                      <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl text-center shadow-lg border border-white/20 min-w-[65px]">
                        <div className="text-[9px] font-black text-primary uppercase tracking-tighter">
                          {new Date(event.date).toLocaleDateString('en-GB', { month: 'short' })}
                        </div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white leading-none mt-0.5">
                          {new Date(event.date).getDate().toString().padStart(2, '0')}
                        </div>
                      </div>
                    </div>

                    {/* Top Right Badges */}
                    <div className="absolute top-5 right-5 flex flex-col items-end gap-1.5">
                      {event.category && (
                        <div className="bg-primary text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider shadow-md backdrop-blur-md">
                          {event.category}
                        </div>
                      )}
                      {isGlobal && (
                        <div className="bg-amber-500/90 text-white px-2.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider shadow-md flex items-center gap-1">
                          <ShieldCheck className="w-2.5 h-2.5" /> National
                        </div>
                      )}
                      {isPast && (
                        <div className="bg-black/70 text-white px-2.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider border border-white/20">
                          Completed
                        </div>
                      )}
                    </div>
                  </div>

                  <CardContent className="p-7 sm:p-8 flex-1 flex flex-col space-y-5">
                    <h3 className="text-lg sm:text-xl font-black tracking-tight group-hover:text-primary transition-colors line-clamp-2 leading-tight text-slate-900 dark:text-white">
                      {event.title}
                    </h3>
                    
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2 font-medium leading-relaxed">
                      {event.description || "Stay tuned for this exciting institute gathering."}
                    </p>
                    
                    <div className="pt-2 space-y-2.5 flex-1 border-t border-slate-100 dark:border-zinc-800">
                      <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-semibold text-xs">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <Calendar className="h-3.5 w-3.5" />
                        </div>
                        <span>{new Date(event.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                      {event.time && (
                        <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-semibold text-xs">
                          <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                            <Clock className="h-3.5 w-3.5" />
                          </div>
                          <span>{event.time}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-semibold text-xs">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                          <MapPin className="h-3.5 w-3.5" />
                        </div>
                        <span className="truncate">{event.location || "On Campus"}</span>
                      </div>
                    </div>

                    <Link href={getLink(`/events/${event.id}`)}>
                      <Button className="w-full h-12 rounded-2xl font-bold text-xs bg-primary/10 text-primary hover:bg-primary hover:text-white border-none shadow-none transition-all mt-4">
                        View Full Details
                        <ArrowRight className="w-3.5 h-3.5 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <div className="py-32 flex flex-col items-center justify-center text-center space-y-4 bg-white dark:bg-zinc-900 rounded-[3rem] border border-dashed border-slate-200 dark:border-zinc-800 p-8">
          <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-muted-foreground/30">
            <Calendar className="w-10 h-10" />
          </div>
          <div className="space-y-1.5 max-w-sm">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              {events.length === 0 ? "No Upcoming Events" : "No Matching Events Found"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
              {events.length === 0 
                ? "There are currently no events scheduled for this center. Please check back later!" 
                : "No events match your current filter criteria. Try resetting your search or filter."}
            </p>
          </div>
          {events.length > 0 && (
            <Button 
              variant="outline" 
              onClick={() => { setSearch(""); setFilter("All"); }}
              className="mt-4 rounded-xl text-xs font-bold"
            >
              Reset Filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
