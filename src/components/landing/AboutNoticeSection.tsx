"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getTenantLink, detectTenant } from "@/lib/routing";
import { usePathname } from "next/navigation";

import { DEFAULT_WORKSPACE_NOTICES } from "@/lib/workspace-defaults";

export function AboutNoticeSection({ data }: { data: any }) {
  const pathname = usePathname();
  const tenant = detectTenant(pathname, typeof window !== 'undefined' ? window.location.hostname : undefined);
  const getLink = (path: string) => getTenantLink(path, tenant, pathname);

  const rawNotices = data?.content?.notices || [];
  const notices = (rawNotices && rawNotices.length > 0)
    ? rawNotices
    : DEFAULT_WORKSPACE_NOTICES;
  const content = data?.content || {};

  return (
    <section className="py-24 max-w-[1400px] mx-auto px-6 sm:px-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Left Side: About Us */}
        <div className="lg:col-span-2 space-y-8">
          <div className="inline-flex items-center gap-2.5 text-primary text-xs font-bold tracking-[0.22em] uppercase">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
            <span>{data?.subtitle || "About Our Institute"}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
            {(() => {
              const title = data?.title || "Dedicated to Empowering Future Leaders";
              const words = title.split(" ");
              if (words.length <= 1) return title;
              const lastWord = words.pop();
              return (
                <>
                  {words.join(" ")}{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">
                    {lastWord}
                  </span>
                </>
              );
            })()}
          </h2>
          <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 text-lg leading-relaxed space-y-6">
            {content.description ? (
              <div className="whitespace-pre-line">{content.description}</div>
            ) : (
              <>
                <p>Since our establishment, we have been committed to providing top-notch education that blends traditional values with modern innovation.</p>
                <p>Our curriculum is designed by industry experts to ensure that every learner is equipped with the skills and knowledge required to excel in their chosen career path. We believe in holistic development, fostering academic excellence alongside critical thinking and leadership.</p>
              </>
            )}
          </div>
          
          <div className="pt-4 flex flex-wrap gap-4">
            <Link href={getLink(content.btnLink || "/about")}>
              <Button size="lg" className="rounded-full gap-3 px-10 h-14 font-black shadow-xl shadow-primary/20  transition-all group">
                {content.btnText || "Discover More"}
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            
            <Link href={getLink("/courses")}>
              <Button size="lg" variant="outline" className="rounded-full gap-3 px-10 h-14 font-black hover:bg-primary/5 border-primary/20 transition-all">
                Our Programs
              </Button>
            </Link>
          </div>
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
                <Link href={getLink("/notice")}>
                  <Button variant="ghost" className="w-full text-xs font-black uppercase tracking-widest text-primary hover:bg-primary/10 transition-all">
                    View All Notifications
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
