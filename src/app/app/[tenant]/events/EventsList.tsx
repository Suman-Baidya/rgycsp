"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, MapPin, Clock, Search, SlidersHorizontal, ArrowUpDown, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function EventsList({ events }: { events: any[] }) {
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("newest");
  const [search, setSearch] = useState("");

  const categories = ["All", ...Array.from(new Set(events.map(e => e.category).filter(Boolean)))];

  const filteredEvents = events
    .filter(e => {
      const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase()) || 
                           (e.category && e.category.toLowerCase().includes(search.toLowerCase()));
      const matchesFilter = filter === "All" || e.category === filter;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sort === "newest" ? dateA - dateB : dateB - dateA; // Oldest to Newest or vice-versa
    });

  return (
    <div className="space-y-12">
      {/* Search & Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-6 items-center justify-between p-6 bg-white dark:bg-zinc-900 border border-border/40 rounded-[2.5rem] shadow-sm">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search events..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-14 rounded-2xl border-none bg-slate-50 dark:bg-zinc-800 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <div className="relative w-full sm:w-64">
            <SlidersHorizontal className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary pointer-events-none" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full h-14 pl-12 pr-10 bg-slate-50 dark:bg-zinc-800 border-none rounded-2xl font-bold text-sm appearance-none cursor-pointer focus:ring-2 focus:ring-primary/20 outline-none transition-all hover:bg-slate-100 dark:hover:bg-zinc-700"
            >
              <option value="All">All Categories</option>
              {categories.filter(cat => cat !== "All").map((cat: any) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
          
          <div className="h-8 w-px bg-border/40 hidden lg:block mx-2" />

          <Button 
            variant="ghost" 
            onClick={() => setSort(sort === "newest" ? "oldest" : "newest")}
            className="h-14 px-6 rounded-2xl gap-3 font-bold bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700"
          >
            <ArrowUpDown className="h-4 w-4 text-primary" />
            {sort === "newest" ? "Soonest" : "Latest"}
          </Button>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredEvents.map((event, i) => (
            <motion.div
              key={event.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <Card className="group overflow-hidden border-border/40 hover:border-primary/30 transition-all hover:shadow-2xl hover:shadow-primary/5 rounded-[2.5rem] bg-white dark:bg-zinc-900 h-full flex flex-col">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img 
                    src={event.image || "https://images.unsplash.com/photo-1514525253361-bee8718a74a2?q=80&w=2070"} 
                    alt={event.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute top-6 left-6">
                    <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md px-5 py-4 rounded-3xl text-center shadow-xl border border-white/20 min-w-[80px]">
                      <div className="text-[10px] font-black text-primary uppercase tracking-tighter">
                        {new Date(event.date).toLocaleDateString('en-GB', { month: '2-digit', year: 'numeric' })}
                      </div>
                      <div className="text-3xl font-black text-slate-900 dark:text-white leading-none mt-1">
                        {new Date(event.date).getDate().toString().padStart(2, '0')}
                      </div>
                    </div>
                  </div>
                  {event.category && (
                    <div className="absolute top-6 right-6">
                      <div className="bg-primary text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md">
                        {event.category}
                      </div>
                    </div>
                  )}
                </div>
                <CardContent className="p-10 flex-1 flex flex-col space-y-6">
                  <h3 className="text-2xl font-black tracking-tight group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                    {event.title}
                  </h3>
                  
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 font-medium leading-relaxed">
                    {event.description}
                  </p>
                  
                  <div className="pt-4 space-y-4 flex-1">
                    <div className="flex items-center gap-4 text-slate-700 dark:text-slate-300 font-bold text-sm">
                      <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <Calendar className="h-5 w-5" />
                      </div>
                      {new Date(event.date).toLocaleDateString('en-GB')}
                    </div>
                    <div className="flex items-center gap-4 text-slate-700 dark:text-slate-300 font-bold text-sm">
                      <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <Clock className="h-5 w-5" />
                      </div>
                      {event.time || "All Day"}
                    </div>
                    <div className="flex items-center gap-4 text-slate-700 dark:text-slate-300 font-bold text-sm">
                      <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <MapPin className="h-5 w-5" />
                      </div>
                      {event.location || "On Campus"}
                    </div>
                  </div>

                  <Link href={`/events/${event.id}`}>
                    <Button className="w-full h-14 rounded-2xl font-black text-sm bg-primary/10 text-primary hover:bg-primary hover:text-white border-none shadow-none transition-all mt-6">
                      View Full Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredEvents.length === 0 && (
        <div className="py-40 flex flex-col items-center justify-center text-center space-y-6 bg-white dark:bg-zinc-900 rounded-[4rem] border border-dashed border-border/60">
          <div className="w-24 h-24 rounded-full bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-muted-foreground/30">
            <Calendar className="w-12 h-12" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">No events found</h3>
            <p className="text-slate-600 dark:text-slate-400 font-medium">Try matching with another category or search term.</p>
          </div>
        </div>
      )}
    </div>
  );
}
