"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AboutNoticeSection({ data }: { data: any }) {
  const notices = data?.content?.notices || [
    { title: "Admission Open for 2026 Batch", date: "24 Apr 2026", link: "#" },
    { title: "Scholarship Test Results Declared", date: "20 Apr 2026", link: "#" },
    { title: "Summer Workshop Registration Starts", date: "15 Apr 2026", link: "#" },
  ];

  return (
    <section className="py-20 px-6 container mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Side: About Us */}
        <div className="lg:col-span-2 space-y-6">
          <div className="inline-flex items-center gap-2 text-primary font-bold tracking-widest text-xs">
            <div className="h-0.5 w-8 bg-primary" />
            About Our Institute
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            {data?.title || "We are Dedicated to Empowering Future Leaders"}
          </h2>
          <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
            {data?.subtitle || "Since our establishment, we have been committed to providing top-notch education that blends traditional values with modern innovation."}
            <br /><br />
            Our curriculum is designed by industry experts to ensure that every student is equipped with the skills and knowledge required to excel in their chosen career path. We believe in holistic development, fostering not just academic excellence but also critical thinking, creativity, and leadership.
          </div>
          <Button size="lg" className="rounded-full gap-2 px-8 h-14 font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all">
            Read More About Us
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Right Side: Notice Section */}
        <div className="lg:col-span-1">
          <Card className="h-full border-primary/10 shadow-2xl shadow-primary/5 bg-white/50 dark:bg-white/[0.02] backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-primary text-primary-foreground p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Bell className="h-5 w-5 animate-bounce" />
                  Notice Board
                </CardTitle>
                <span className="text-[10px] font-black bg-white/20 px-2 py-1 rounded">Live Updates</span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/40">
                {notices.map((notice: any, i: number) => (
                  <div key={i} className="p-5 hover:bg-primary/5 transition-colors group cursor-pointer">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors line-clamp-2">
                          {notice.title}
                        </h4>
                        <p className="text-xs text-muted-foreground font-medium">{notice.date}</p>
                      </div>
                      <div className="bg-muted p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
                        <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-muted/30">
                <Button variant="ghost" className="w-full text-xs font-bold text-primary">
                  View All Notifications
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
