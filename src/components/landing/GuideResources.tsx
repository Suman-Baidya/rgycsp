"use client";

import React from "react";
import { Play, FileDown, FileText } from "lucide-react";

export function GuideResources({ data }: { data?: any }) {
  const content = data?.content || {};

  const defaults = {
    video: {
      badge: "Video Tutorial",
      title: "Watch Our Video Guide",
      description: "Prefer visual learning? Watch our comprehensive video guide to master the ABCD Edu Hub ecosystem in under 10 minutes.",
      url: "https://www.youtube.com/embed/2Gg6Seob5Mg?si=lf_LXGMRFjiWohZp"
    },
    docs: {
      title: "Full Documentation PDF",
      description: "Download our complete offline user manual. It includes detailed screenshots and step-by-step instructions for every module.",
      btnLabel: "Download Guidance PDF",
      btnLink: "#",
      joinedText: "Joined by 1,200+ Educators"
    }
  };

  const video = { ...defaults.video, ...content.video };
  const docs = { ...defaults.docs, ...content.docs };

  const videoTitleWords = (video.title || "").split(" ");
  const videoLastWord = videoTitleWords.length > 1 ? videoTitleWords.pop() : "";
  const videoFirstPart = videoTitleWords.join(" ");

  return (
    <section className="py-20 sm:py-24 px-4 sm:px-6 bg-transparent">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Video Side */}
          <div className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-2.5 text-primary font-bold text-xs tracking-[0.22em] uppercase mb-3">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
              <span>{video.badge}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-[1.15] mb-4 text-slate-900 dark:text-white">
              {videoFirstPart && <>{videoFirstPart} </>}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                {videoLastWord || video.title}
              </span>
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed mb-8 max-w-xl">
              {video.description}
            </p>
            
            <div className="relative rounded-[2rem] overflow-hidden aspect-video shadow-2xl border border-slate-200/80 dark:border-zinc-800 bg-black group">
              <iframe 
                width="100%" 
                height="100%" 
                src={video.url} 
                title="Tutorial Video" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                referrerPolicy="strict-origin-when-cross-origin" 
                allowFullScreen
                className="absolute inset-0"
              />
            </div>
          </div>

          {/* Download Side */}
          <div className="order-1 lg:order-2">
            <div className="p-8 sm:p-12 md:p-14 rounded-[2.5rem] bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-slate-200/80 dark:border-zinc-800 shadow-xl relative overflow-hidden group">
              {/* Ambient Glow */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                  <FileText className="w-7 h-7" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold mb-4 tracking-tight text-slate-900 dark:text-white">
                  {docs.title}
                </h3>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
                  {docs.description}
                </p>
                
                <a 
                  href={docs.btnLink} 
                  className="inline-flex items-center gap-3 h-13 sm:h-14 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-2xl transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 text-sm sm:text-base group/btn"
                >
                  <FileDown className="w-5 h-5 group-hover/btn:-translate-y-0.5 transition-transform" />
                  <span>{docs.btnLabel}</span>
                </a>
                
                <div className="mt-8 flex items-center gap-4 pt-6 border-t border-slate-100 dark:border-zinc-800/80">
                  <div className="flex -space-x-2.5">
                    {[1, 2, 3].map((i) => (
                      <div 
                        key={i} 
                        className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-900 bg-primary/20 text-[10px] font-bold text-primary flex items-center justify-center"
                      >
                        ✓
                      </div>
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">{docs.joinedText}</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
