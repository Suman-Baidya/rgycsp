"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, ArrowRight, Clock } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export function WorkspaceEvents({ data }: { data: any }) {
  const events = (data?.events && data.events.length > 0) ? data.events : [
    {
      title: "Annual Cultural Fest 2026",
      date: "15 May, 2026",
      time: "10:00 AM",
      location: "Main Auditorium",
      image: "https://cdn.pixabay.com/photo/2019/03/19/09/58/dreamcatcher-4065288_1280.jpg"
    },
    {
      title: "Tech Innovation Workshop",
      date: "22 May, 2026",
      time: "11:30 AM",
      location: "Computer Lab 1",
      image: "https://cdn.pixabay.com/photo/2017/05/10/19/29/robot-2301646_1280.jpg"
    },
    {
      title: "Inter-College Sports Meet",
      date: "05 June, 2026",
      time: "09:00 AM",
      location: "Sports Ground",
      image: "https://cdn.pixabay.com/photo/2022/11/08/02/27/track-7577525_1280.jpg"
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
            <div className="inline-flex items-center gap-3 text-primary font-black tracking-[0.2em] text-[10px] uppercase">
              <div className="h-0.5 w-10 bg-primary" />
              {subtitle}
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              {title}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg line-clamp-1">
              {description}
            </p>
          </div>
          <Link href="/events">
            <Button size="lg" className="rounded-full gap-2 px-10 h-14 font-black shadow-xl shadow-primary/20 hover:scale-105 transition-all">
              View All Events
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
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
                    src={event.image || "https://images.unsplash.com/photo-1514525253361-bee8718a74a2?q=80&w=2070"}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4">
                    <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm p-3 rounded-2xl text-center shadow-lg border border-white/20">
                      <div className="text-xs font-black text-primary uppercase tracking-tighter">
                        {new Date(event.date).toLocaleDateString('en-GB', { month: '2-digit', year: 'numeric' })}
                      </div>
                      <div className="text-xl font-black text-slate-900 dark:text-white">
                        {new Date(event.date).getDate().toString().padStart(2, '0')}
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
                        <Calendar className="h-4 w-4" />
                      </div>
                      {new Date(event.date).toLocaleDateString('en-GB')}
                    </div>
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

                  <Link href={`/events/${event.id}`}>
                    <Button variant="outline" className="w-full rounded-2xl h-12 font-bold group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
                      Event Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
