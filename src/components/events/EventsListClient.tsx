"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Calendar, Clock, MapPin, Search, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function EventsListClient({ events }: { events: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    events.forEach(e => {
      if (e.category) cats.add(e.category);
    });
    return ["All", ...Array.from(cats)];
  }, [events]);

  const filteredEvents = useMemo(() => {
    let result = events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (event.description || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "All" || event.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });

    result.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === "latest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [events, searchQuery, categoryFilter, sortOrder]);

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const paginatedEvents = filteredEvents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const renderEventCard = (event: any) => {
    const isPast = new Date(event.date) < new Date(new Date().setHours(0,0,0,0));
    
    return (
      <Link href={`/events/${event.id}`} key={event.id} className="group relative bg-white dark:bg-zinc-900 rounded-[2rem] border border-slate-200 dark:border-zinc-800 overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
        <div className="aspect-video w-full relative overflow-hidden bg-slate-100 dark:bg-zinc-800 border-b border-slate-100 dark:border-zinc-800">
          {event.image ? (
            <img 
              src={event.image} 
              alt={event.title} 
              className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${isPast ? 'grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100' : ''}`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/5">
              <Calendar className="h-12 w-12 text-primary/20" />
            </div>
          )}
          {event.category && (
            <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
              {event.category}
            </div>
          )}
          {isPast && (
            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border border-white/10">
              Completed
            </div>
          )}
        </div>
        
        <div className="p-6 flex-1 flex flex-col">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
            {event.title}
          </h3>
          
          <div className="space-y-3 mb-6 flex-1">
            <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              {new Date(event.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
            </div>
            
            {event.time && (
              <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400">
                <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-amber-500" />
                </div>
                {event.time}
              </div>
            )}

            {event.location && (
              <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                </div>
                <span className="line-clamp-1">{event.location}</span>
              </div>
            )}
          </div>

          <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3 mb-6">
            {event.description || "Join us for this exciting event!"}
          </p>

          <div className="pt-4 mt-auto border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
            <span>Host:</span>
            <span className="text-primary truncate ml-2 max-w-[150px]" title={event.hostName || "Main Institute"}>{event.hostName || "Main Institute"}</span>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <section className="py-24 relative z-10 bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-12 items-center justify-between bg-slate-50 dark:bg-zinc-950 p-4 sm:p-6 rounded-[2rem] border border-slate-200 dark:border-zinc-800">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input 
              placeholder="Search events..." 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="pl-12 h-14 rounded-2xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800"
            />
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
            {/* Category Filter Dropdown */}
            <div className="relative w-full md:w-auto shrink-0">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <Filter className="h-4 w-4 text-slate-400" />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm font-bold bg-white dark:bg-zinc-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-zinc-800 appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>

            {/* Sort Toggle */}
            <div className="relative w-full md:w-auto shrink-0">
              <select
                value={sortOrder}
                onChange={(e) => { setSortOrder(e.target.value as "latest" | "oldest"); setCurrentPage(1); }}
                className="w-full px-4 pr-10 py-2.5 rounded-xl text-sm font-bold bg-white dark:bg-zinc-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-zinc-800 appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="latest">Latest First</option>
                <option value="oldest">Oldest First</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        {paginatedEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedEvents.map(event => renderEventCard(event))}
          </div>
        ) : (
          <div className="text-center py-32 bg-slate-50 dark:bg-zinc-950 rounded-[3rem] border border-slate-200 dark:border-zinc-800">
            <Calendar className="w-16 h-16 text-slate-300 dark:text-zinc-700 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-2">No events found</h3>
            <p className="text-slate-500 max-w-md mx-auto">Try adjusting your search or filter to find what you're looking for.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-16 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-xl h-12 w-12"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-2 px-4">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`h-10 w-10 rounded-xl font-bold text-sm transition-colors ${currentPage === i + 1 ? "bg-primary text-white shadow-md shadow-primary/20" : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-zinc-800"}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-xl h-12 w-12"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
