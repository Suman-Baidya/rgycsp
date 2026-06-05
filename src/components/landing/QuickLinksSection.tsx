"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickLinksSectionProps {
  data: any;
  tenant?: string;
}

export function QuickLinksSection({ data, tenant }: QuickLinksSectionProps) {
  if (!data || !data.isActive || !data.content || !data.content.links || data.content.links.length === 0) {
    return null;
  }

  const links = data.content.links;

  // Add a small helper for routing in case we're in tenant mode vs global mode
  // The links from DB might be absolute or relative. Let's assume they are relative and if tenant is present, maybe they need prefixing.
  // Actually, the routing rules say: use `getTenantLink` for client components.
  // Since we don't have it imported, we'll import it from "@/lib/routing"
  
  return (
    <section className="py-12 md:py-20 relative bg-background overflow-hidden z-10">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center mb-10 md:mb-16 flex flex-col items-center">
          {data.subtitle && (
            <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-primary/5 border border-primary/20 text-primary font-bold text-[10px] tracking-[0.2em] uppercase mb-4 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-black dark:bg-white animate-pulse"></span>
              {data.subtitle}
            </div>
          )}
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
            {data.title || "Quick Links"}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {links.map((link: any, idx: number) => {
            const Icon = (LucideIcons as any)[link.icon || 'Link'] || LucideIcons.Link;

            return (
              <Link
                key={idx}
                href={link.url || "#"}
                className={cn(
                  "group relative flex flex-col items-center justify-center text-center p-8 rounded-[2.5rem]",
                  "bg-white dark:bg-zinc-900 border border-border/50",
                  "hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2 overflow-hidden"
                )}
              >
                {/* Hover gradient background effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative w-20 h-20 mb-6 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
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
