"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function ReadyToModernize({ data }: { data?: any }) {
  const content = data?.content || {};

  const defaults = {
    bgImage: "https://cdn.pixabay.com/photo/2016/09/28/04/35/classroom-1699745_1280.jpg",
    subtitle: "Get Started Today",
    title: "Ready to Modernize Your Institute?",
    description: "Join the elite league of institutes already scaling with ABCD Edu Hub's AI-driven ecosystem.",
    primaryBtn: { label: "Get Started", link: "/contact" },
    secondaryBtn: { label: "Book a Demo", link: "/contact" },
    trustText: "Trusted by 100+ Institutes Worldwide"
  };

  const final = { ...defaults, ...content };
  const bgImage = final.bgImage;
  const title = data?.title || final.title;
  const subtitle = data?.subtitle || final.subtitle;
  const description = final.description;
  const primaryBtn = final.primaryBtn;
  const secondaryBtn = final.secondaryBtn;
  const trustText = final.trustText;

  const titleWords = title.split(" ");
  const lastWord = titleWords.length > 1 ? titleWords.pop() : "";
  const firstPart = titleWords.join(" ");

  return (
    <section className="relative py-20 sm:py-28 px-4 sm:px-6 overflow-hidden flex items-center justify-center text-center">
      {/* Background with Atmospheric Depth */}
      <div
        className="absolute inset-0 z-0 bg-fixed bg-cover bg-center"
        style={{ backgroundImage: `url('${bgImage}')` }}
      >
        <div className="absolute inset-0 bg-zinc-950/75 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 via-transparent to-primary/20 pointer-events-none" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10 w-full flex flex-col items-center">
        {/* Tagline Badge */}
        <div className="inline-flex items-center gap-2.5 text-emerald-400 font-bold text-xs sm:text-sm tracking-[0.25em] uppercase mb-4 drop-shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] animate-pulse shrink-0" />
          <span>{subtitle}</span>
        </div>

        {/* Heading */}
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight leading-[1.15] text-balance">
          {firstPart && <>{firstPart} </>}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-100 to-primary/80">
            {lastWord || title}
          </span>
        </h2>

        {/* Description */}
        <p className="text-base sm:text-lg md:text-xl text-zinc-300 mb-10 max-w-2xl mx-auto leading-relaxed font-normal text-balance">
          {description}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center items-center w-full sm:w-auto">
          <Link 
            href={primaryBtn.link} 
            className="w-full sm:w-auto h-13 sm:h-14 px-8 sm:px-10 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base rounded-2xl shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
          >
            <span>{primaryBtn.label}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link 
            href={secondaryBtn.link} 
            className="w-full sm:w-auto h-13 sm:h-14 px-8 sm:px-10 border border-white/30 text-white hover:bg-white/10 font-bold text-base rounded-2xl backdrop-blur-sm transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center"
          >
            {secondaryBtn.label}
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 inline-flex items-center gap-2 text-xs sm:text-sm text-zinc-400 font-semibold uppercase tracking-widest">
          <Sparkles className="w-4 h-4 text-primary" />
          <span>{trustText}</span>
        </div>
      </div>
    </section>
  );
}
