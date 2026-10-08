"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { getTenantLink, detectTenant } from "@/lib/routing";

interface QuickLinksSectionProps {
  data: any;
  tenant?: string;
}

const DEFAULT_STUDENT_QUICK_LINKS = [
  { title: "Student Admission", description: "Apply online for current academic session", url: "/admission", icon: "GraduationCap" },
  { title: "Explore Courses", description: "Browse verified programs & syllabus", url: "/courses", icon: "BookOpen" },
  { title: "Student Portal", description: "Access classes, notices & results", url: "/student/dashboard", icon: "LayoutDashboard" },
  { title: "Notice Board", description: "Latest circulars & exam schedules", url: "/notice", icon: "Bell" }
];

export function QuickLinksSection({ data, tenant: propTenant }: QuickLinksSectionProps) {
  const pathname = usePathname();
  const currentTenant = propTenant || detectTenant(pathname, typeof window !== 'undefined' ? window.location.hostname : undefined);
  const isWorkspaceContext = !!(currentTenant || pathname.startsWith('/app/'));

  if (!data || !data.isActive) {
    return null;
  }

  const rawLinks = data?.content?.links || [];

  // In workspace context, NEVER show franchise-related links (e.g. Franchises Enquiry)
  const filteredLinks = isWorkspaceContext
    ? rawLinks.filter((link: any) => {
        const title = (link.title || "").toLowerCase();
        const url = (link.url || "").toLowerCase();
        const desc = (link.description || "").toLowerCase();
        return !title.includes("franchise") && !url.includes("franchise") && !desc.includes("franchise");
      })
    : rawLinks;

  // If in workspace and filtered links are empty, fall back to optimal student links
  const links = (isWorkspaceContext && filteredLinks.length === 0)
    ? DEFAULT_STUDENT_QUICK_LINKS
    : filteredLinks;

  if (links.length === 0) {
    return null;
  }

  // Safe routing helper: ensures links always stay within workspace in tenant mode
  const getHref = (rawUrl?: string) => {
    if (!rawUrl || rawUrl === "#") return "#";
    if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://") || rawUrl.startsWith("mailto:") || rawUrl.startsWith("tel:")) {
      return rawUrl;
    }
    if (isWorkspaceContext && currentTenant) {
      return getTenantLink(rawUrl, currentTenant, pathname);
    }
    return rawUrl;
  };

  return (
    <section className="py-12 md:py-20 relative overflow-hidden z-10 bg-transparent">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-10 md:mb-16 flex flex-col items-center">
          {data.subtitle && (
            <div className="inline-flex items-center gap-2.5 text-primary font-bold text-xs tracking-[0.22em] uppercase mb-3">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
              <span>{data.subtitle}</span>
            </div>
          )}
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
            {(() => {
              const title = data.title || "Quick Links";
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {links.map((link: any, idx: number) => {
            const Icon = (LucideIcons as any)[link.icon || 'GraduationCap'] || LucideIcons.GraduationCap;
            const href = getHref(link.url);
            const isExternal = href.startsWith("http://") || href.startsWith("https://");

            return (
              <Link
                key={idx}
                href={href}
                {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className={cn(
                  "group relative flex flex-col items-center justify-center text-center p-8 rounded-[2.5rem]",
                  "bg-white dark:bg-zinc-900 border border-border/50",
                  "hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2 overflow-hidden"
                )}
              >
                {/* Hover gradient background effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative w-20 h-20 mb-6 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:brightness-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-inner">
                  <Icon className="w-8 h-8" strokeWidth={1.5} />
                </div>
                
                <h3 className="text-xl font-bold tracking-tight mb-2 group-hover:text-primary transition-colors">
                  {link.title}
                </h3>
                
                <p className="text-sm text-muted-foreground font-medium mb-6 line-clamp-2">
                  {link.description}
                </p>

                <div className="mt-auto flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary/80 group-hover:text-primary transition-colors">
                  <span>Explore</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
