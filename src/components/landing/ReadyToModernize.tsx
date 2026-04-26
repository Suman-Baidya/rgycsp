"use client"

import { Button } from "@/components/ui/button";

export function ReadyToModernize({ data }: { data?: any }) {
  const content = data?.content || {};

  const defaults = {
    bgImage: "https://cdn.pixabay.com/photo/2016/09/28/04/35/classroom-1699745_1280.jpg",
    subtitle: "Get Started Today",
    title: "Ready to modernize Your Institute?",
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

  return (
    <section className="relative py-20 px-6 overflow-hidden flex items-center justify-center text-center">
      {/* Background with Parallax effect */}
      <div
        className="absolute inset-0 z-0 bg-fixed bg-cover bg-center"
        style={{ backgroundImage: `url('${bgImage}')` }}
      >
        <div className="absolute inset-0 bg-zinc-950/50 backdrop-blur-[2px]"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-primary/10"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white border border-primary/30 text-black font-bold text-[10px] tracking-[0.2em] uppercase mb-8 animate-bounce">
          {subtitle}
        </div>
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-8 tracking-tighter leading-none">
          {title}
        </h2>
        <p className="text-xl md:text-xl text-zinc-300 mb-12 max-w-2xl mx-auto leading-relaxed">
          {description}
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <a href={primaryBtn.link} className="group relative h-16 px-12 bg-primary text-primary-foreground font-black text-lg rounded-2xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_20px_40px_rgba(var(--primary),0.3)] flex items-center justify-center border border-white dark:text-white">
            <span className="relative z-10">{primaryBtn.label}</span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          </a>
          <a href={secondaryBtn.link} className="h-16 px-12 border-2 border-white/20 text-white font-bold text-lg rounded-2xl hover:bg-white hover:text-zinc-950 transition-all hover:scale-105 active:scale-95 backdrop-blur-sm flex items-center justify-center">
            {secondaryBtn.label}
          </a>
        </div>

        {/* Trust Badges */}
        <p className="mt-12 text-md text-white font-bold uppercase tracking-widest">
          {trustText}
        </p>
      </div>
    </section>
  );
}
