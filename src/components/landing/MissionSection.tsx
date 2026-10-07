"use client";

import React from "react";
import { Target, CheckCircle2 } from "lucide-react";
import Image from "next/image";

export function MissionSection({ data }: { data?: any }) {
  const content = data?.content || {};

  const defaults = {
    title: "Empowering Every Learner with Technology",
    subtitle: "Our Mission",
    image: "https://cdn.pixabay.com/photo/2017/05/02/03/41/action-2277292_1280.jpg",
    description: "Our mission is to democratize high-end educational technology. We believe every institution, regardless of its size or location, deserves access to the tools that drive excellence, efficiency, and engagement in the digital age.",
    items: [
      "Accessibility for all educational tiers.",
      "Seamless automation of administrative workflows.",
      "Building a secure, global educational ecosystem."
    ]
  };

  const final = { ...defaults, ...content };
  const title = data?.title || final.title;
  const subtitle = data?.subtitle || final.subtitle;
  const image = final.image;
  const description = final.description;
  const items = final.items;

  const titleWords = title.split(" ");
  const lastWord = titleWords.length > 1 ? titleWords.pop() : "";
  const firstPart = titleWords.join(" ");

  return (
    <section className="py-20 sm:py-24 px-4 sm:px-6 overflow-hidden bg-transparent">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        
        {/* Image Side */}
        <div className="flex-1 w-full relative group">
          <div className="relative rounded-[2rem] overflow-hidden aspect-[4/3] shadow-2xl z-10 border border-slate-200/80 dark:border-zinc-800">
            <Image
              src={image || ""}
              alt={title}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-transparent mix-blend-overlay" />
          </div>
          {/* Decorative Ambient Elements */}
          <div className="absolute -top-6 -left-6 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
        </div>

        {/* Content Side */}
        <div className="flex-1 w-full">
          {/* Tagline */}
          <div className="inline-flex items-center gap-2.5 text-primary font-bold text-xs tracking-[0.22em] uppercase mb-3 sm:mb-4">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
            <span>{subtitle}</span>
          </div>

          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15] mb-5 text-slate-900 dark:text-white">
            {firstPart && <>{firstPart} </>}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
              {lastWord || title}
            </span>
          </h2>

          {/* Description */}
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
            {description}
          </p>

          {/* Items List */}
          <div className="space-y-4">
            {items.map((text: string, i: number) => (
              <div 
                key={i} 
                className="flex items-start gap-4 p-3.5 sm:p-4 rounded-2xl bg-white/70 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 shadow-xs hover:border-primary/30 transition-colors"
              >
                <div className="mt-0.5 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </div>
                <p className="font-semibold text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-snug">{text}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
