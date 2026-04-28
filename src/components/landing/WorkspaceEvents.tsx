"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, ArrowRight, Clock } from "lucide-react";
import { motion } from "framer-motion";

export function WorkspaceEvents({ data }: { data: any }) {
  const events = data?.content?.events || [
    { 
      title: "Annual Cultural Fest 2026", 
      date: "15 May, 2026", 
      time: "10:00 AM", 
      location: "Main Auditorium", 
      image: "https://images.unsplash.com/photo-1514525253361-bee8718a74a2?q=80&w=2070" 
    },
    { 
      title: "Tech Innovation Workshop", 
      date: "22 May, 2026", 
      time: "11:30 AM", 
      location: "Computer Lab 1", 
      image: "https://images.unsplash.com/photo-1540575861501-7ad05823c93e?q=80&w=2070" 
    },
    { 
      title: "Inter-College Sports Meet", 
      date: "05 June, 2026", 
      time: "09:00 AM", 
      location: "Sports Ground", 
      image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?q=80&w=2070" 
    },
  ];

  const title = data?.title || "Upcoming Events & Workshops";
  const subtitle = data?.subtitle || "Institute Events";
  const description = data?.content?.description || "Stay updated with the latest happenings, academic seminars, and cultural celebrations at our institute.";

  return (
    <section id="events" className="py-24 bg-slate-50/50 dark:bg-white/[0.02] px-6">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-primary font-bold tracking-widest text-xs uppercase">
              <div className="h-0.5 w-8 bg-primary" />
              {subtitle}
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              {title}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              {description}
            </p>
          </div>
          <Button size="lg" className="rounded-full gap-2 px-8 h-14 font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all">
            View All Events
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event: any, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="group overflow-hidden border-border/40 hover:border-primary/30 transition-all hover:shadow-2xl hover:shadow-primary/5 rounded-[2rem] bg-white dark:bg-zinc-900 h-full">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img 
                    src={event.image} 
                    alt={event.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute top-4 left-4">
                    <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm p-3 rounded-2xl text-center shadow-lg border border-white/20">
                      <div className="text-xs font-black text-primary uppercase tracking-tighter">
                        {event.date.split(' ')[1].replace(',', '')}
                      </div>
                      <div className="text-xl font-black text-slate-900 dark:text-white">
                        {event.date.split(' ')[0]}
                      </div>
                    </div>
                  </div>
                </div>
                <CardContent className="p-8 space-y-6">
                  <h3 className="text-2xl font-black tracking-tight group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                    {event.title}
                  </h3>
                  
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 font-medium">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Clock className="h-4 w-4" />
                      </div>
                      {event.time}
                    </div>
                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 font-medium">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <MapPin className="h-4 w-4" />
                      </div>
                      {event.location}
                    </div>
                  </div>

                  <Button variant="outline" className="w-full rounded-2xl h-12 font-bold group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
                    Event Details
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
