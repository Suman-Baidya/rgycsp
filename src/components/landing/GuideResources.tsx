"use client"

import { Play, FileDown, PlayCircle, MonitorPlay, FileText } from "lucide-react";

export function GuideResources() {
  return (
    <section className="py-24 px-6 bg-zinc-50 dark:bg-zinc-900/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Video Side */}
          <div className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-zinc-950/5 border border-zinc-950/10 dark:bg-white/5 dark:border-white/10 text-foreground font-bold text-[10px] tracking-[0.2em] uppercase mb-6">
              <Play className="w-4 h-4 fill-current" />
              Video Tutorial
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight mb-8">
              Watch Our <span className="relative inline-block px-4 py-1">
                <span className="absolute inset-0 bg-zinc-100 dark:bg-zinc-800 -skew-x-12 -z-10"></span>
                Video Guide
              </span>
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed mb-10 max-w-xl">
              Prefer visual learning? Watch our comprehensive video guide to master the ABCD Edu Hub ecosystem in under 10 minutes.
            </p>
            
            <div className="relative rounded-3xl overflow-hidden aspect-video shadow-2xl border-4 border-white dark:border-zinc-800 bg-black group">
              <iframe 
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/2Gg6Seob5Mg?si=lf_LXGMRFjiWohZp" 
                title="YouTube video player" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                referrerPolicy="strict-origin-when-cross-origin" 
                allowFullScreen
                className="absolute inset-0"
              ></iframe>
            </div>
          </div>

          {/* Download Side */}
          <div className="order-1 lg:order-2">
            <div className="p-10 md:p-16 rounded-[3rem] bg-white dark:bg-zinc-900 border border-border shadow-xl relative overflow-hidden group">
              {/* Background Decor */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-primary/10 transition-colors"></div>
              
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-8">
                  <FileText className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-black mb-6 tracking-tight">Full Documentation PDF</h3>
                <p className="text-base text-muted-foreground leading-relaxed mb-10">
                  Download our complete offline user manual. It includes detailed screenshots and step-by-step instructions for every module.
                </p>
                
                <button className="flex items-center gap-4 h-16 px-10 bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl group/btn">
                  <FileDown className="w-6 h-6 group-hover/btn:animate-bounce" />
                  Download Guidance PDF
                </button>
                
                <div className="mt-8 flex items-center gap-6">
                  <div className="flex -space-x-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-zinc-900 bg-zinc-200 dark:bg-zinc-800"></div>
                    ))}
                  </div>
                  <p className="text-sm font-bold text-zinc-500">Joined by 1,200+ Educators</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
