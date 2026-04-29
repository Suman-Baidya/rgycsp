"use client"

import Image from "next/image";
import { Trophy, Star, Users, BookOpen, GraduationCap, Award, CheckCircle, Zap } from "lucide-react";

export function WorkspaceAchievements({ data }: { data?: any }) {
  const content = data?.content || {};
  const title = data?.title || "Our Pride & Achievements";
  const subtitle = data?.subtitle || "Success Stories";
  const description = content.description || "Over the years, our students and faculty have consistently set new benchmarks in academic and extra-curricular excellence.";

  const iconMap: any = { Trophy, Star, Users, BookOpen, GraduationCap, Award, CheckCircle, Zap };

  const stats = (content.stats && content.stats.length > 0) ? content.stats : [
    { label: "Graduated", value: "2.5K+", icon: "GraduationCap" },
    { label: "Awards Won", value: "150+", icon: "Award" },
    { label: "Success Rate", value: "98%", icon: "Star" },
    { label: "Course Offerings", value: "45+", icon: "BookOpen" },
  ];

  const gallery = (content.items && content.items.length > 0) ? content.items : [
    { src: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=2070", title: "National Rankers", description: "Our students secured top ranks in national competitive exams." },
    { src: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=2070", title: "Cultural Excellence", description: "Winning the state level inter-college cultural fest." },
    { src: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070", title: "Sports Champions", description: "Victory in the annual sports meet 2025." },
  ];

  return (
    <section id="achievements" className="py-24 relative bg-primary/[0.02]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <div className="inline-flex items-center justify-center gap-3 text-primary font-black tracking-[0.2em] text-[10px] uppercase w-full">
            <div className="h-0.5 w-10 bg-primary" />
            {subtitle}
            <div className="h-0.5 w-10 bg-primary" />
          </div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
            {title}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            {description}
          </p>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
          {stats.map((stat: any, i: number) => {
            const Icon = iconMap[stat.icon] || Trophy;
            return (
              <div key={i} className="relative group p-10 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-border/50 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                <div className="relative z-10 space-y-4 text-center">
                  <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-primary/30 group-hover:-translate-y-2 transition-transform">
                    <Icon className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="text-4xl font-black tracking-tight text-primary">{stat.value}{stat.suffix || ""}</div>
                    <div className="text-xs uppercase font-bold text-muted-foreground tracking-widest mt-1">{stat.label}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Achievement Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {gallery.map((item: any, i: number) => (
            <div key={i} className="group relative h-[450px] rounded-[3rem] overflow-hidden shadow-xl border-4 border-white dark:border-zinc-900">
              <Image
                src={(item.src && item.src.trim() !== "") ? item.src : (item.image && item.image.trim() !== "") ? item.image : "https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=2070"}
                alt={item.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
              <div className="absolute bottom-0 left-0 p-10 space-y-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <h3 className="text-2xl font-bold text-white leading-tight">{item.title}</h3>
                <p className="text-sm text-zinc-300 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity delay-100">{item.description || item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
