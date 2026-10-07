import React from "react";
import { Eye, Rocket, Sparkles, Globe, Target, Zap } from "lucide-react";
import Image from "next/image";

const ICON_MAP: any = {
  rocket: Rocket,
  sparkles: Sparkles,
  globe: Globe,
  eye: Eye,
  target: Target,
  zap: Zap
};

export function VisionSection({ data }: { data?: any }) {
  const content = data?.content || {};

  const defaults = {
    title: "Redefining the Future of Global Education",
    subtitle: "Our Vision",
    image: "https://cdn.pixabay.com/photo/2016/04/20/08/21/entrepreneur-1340649_1280.jpg",
    description: "We envision a world where technology and education blend seamlessly to unlock human potential. Our goal is to set the gold standard for multi-tenant educational platforms, bridging the gap between traditional teaching and the future of digitalized learning.",
    items: [
      { icon: "rocket", title: "Global Scale", text: "Reaching millions of students across continents with localized solutions." },
      { icon: "sparkles", title: "AI First", text: "Pioneering AI as a core partner in the teaching and assessment journey." }
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
        
        {/* Content Side */}
        <div className="flex-1 order-2 lg:order-1 w-full">
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

          {/* Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            {items.map((item: any, i: number) => {
              const Icon = ICON_MAP[item.icon] || Sparkles;
              return (
                <div 
                  key={i} 
                  className="p-6 rounded-[2rem] bg-white/70 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 shadow-sm hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-base sm:text-lg mb-2 text-slate-900 dark:text-white">{item.title}</h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Image Side */}
        <div className="flex-1 order-1 lg:order-2 w-full relative group">
          <div className="relative rounded-[2rem] overflow-hidden aspect-[4/3] shadow-2xl z-10 border border-slate-200/80 dark:border-zinc-800">
            <Image 
              src={image || ""} 
              alt={title} 
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-bl from-primary/30 to-transparent mix-blend-overlay" />
          </div>
          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
        </div>

      </div>
    </section>
  );
}
