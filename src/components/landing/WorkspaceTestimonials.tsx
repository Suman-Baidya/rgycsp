"use client"

import { Star, Quote, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function WorkspaceTestimonials({ data }: { data?: any }) {
  const content = data?.content || {};
  const title = data?.title || "What Our Students Say";
  const subtitle = data?.subtitle || "Success Stories";

  const testimonials = (content.items && content.items.length > 0) ? content.items : [
    {
      name: "Aditya Sharma",
      role: "B.Tech Graduate",
      text: "The faculty here is amazing. They don't just teach the syllabus but also prepare you for the real world challenges. I got placed in a top MNC thanks to the guidance I received.",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200",
      rating: 5,
      course: "Computer Science"
    },
    {
      name: "Priya Patel",
      role: "MBA Student",
      text: "Excellent infrastructure and very supportive environment. The practical exposure I got here was invaluable for my career growth.",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200",
      rating: 5,
      course: "Business Admin"
    },
    {
      name: "Rahul Verma",
      role: "Diploma Student",
      text: "The training programs are very well structured. I learned a lot of technical skills that helped me secure a great job right after my diploma.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200",
      rating: 4,
      course: "Electrical Eng."
    }
  ];

  return (
    <section id="testimonials" className="py-24 bg-white dark:bg-slate-950 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20">
          <div className="max-w-2xl space-y-4 text-left">
            <div className="inline-flex items-center gap-3 text-primary font-black tracking-[0.2em] text-[10px] uppercase">
              <div className="h-0.5 w-10 bg-primary" />
              {subtitle}
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              {title.split(' ').map((word: string, i: number, arr: string[]) => (
                <span key={i} className={i === arr.length - 1 ? "text-primary" : ""}>
                  {word}{" "}
                </span>
              ))}
            </h2>
          </div>
          <div className="hidden md:flex items-center gap-2 p-4 bg-muted rounded-2xl border border-border">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-background overflow-hidden relative bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                   <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary/40" viewBox="0 0 24 24" fill="currentColor">
                         <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                      </svg>
                   </div>
                </div>
              ))}
            </div>
            <div className="px-4 border-l border-border/50">
               <div className="text-sm font-black">4.9/5 Rating</div>
               <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Global Reviews</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t: any, i: number) => (
            <div key={i} className="group p-10 rounded-[3rem] bg-zinc-50 dark:bg-zinc-900 border border-border/40 hover:border-primary/30 hover:bg-white dark:hover:bg-zinc-800 transition-all duration-500 hover:shadow-lg hover:shadow-primary/5 relative">
              <div className="absolute top-10 right-10 opacity-5 group-hover:opacity-10 transition-opacity">
                <Quote className="w-16 h-16 text-primary" />
              </div>
              
              <div className="space-y-8 relative z-10">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} className={cn("w-4 h-4", idx < (t.rating || 5) ? "text-orange-400 fill-orange-400" : "text-zinc-300")} />
                  ))}
                </div>

                <p className="text-lg font-medium leading-relaxed italic text-zinc-700 dark:text-zinc-300">
                  "{t.text || t.content || ""}"
                </p>

                <div className="pt-8 border-t border-border/50 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden relative border-2 border-primary/20 bg-slate-100">
                    {t.avatar ? (
                      <Image src={t.avatar} alt={t.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary font-black">{t.name?.charAt(0)}</div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-black text-lg flex items-center gap-2">
                      {t.name}
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </h4>
                    <div className="text-xs font-bold text-primary uppercase tracking-widest">{t.role || t.course || "Student"}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
