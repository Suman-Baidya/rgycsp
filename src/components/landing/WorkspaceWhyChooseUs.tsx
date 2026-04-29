"use client"

import { Zap, ShieldCheck, Cpu, Globe, Rocket, Brain, GraduationCap, Users, Layout, Trophy, Star } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function WorkspaceWhyChooseUs({ data }: { data?: any }) {
  const content = data?.content || {};
  const title = data?.title || "Why Choose Our Institute?";
  const subtitle = data?.subtitle || "Excellence in Education";
  const description = content.description || "We provide a nurturing environment where students can thrive academically and personally. Our commitment to excellence is reflected in our modern facilities and expert faculty.";

  const features = content.features || content.items || [
    { icon: "GraduationCap", title: "Expert Faculty", description: "Learn from industry professionals and experienced educators dedicated to your success." },
    { icon: "Layout", title: "Modern Facilities", description: "State-of-the-art classrooms and labs equipped with the latest educational technology." },
    { icon: "Brain", title: "Holistic Growth", description: "Beyond academics, we focus on character building, leadership, and creative thinking." },
    { icon: "Rocket", title: "Career Support", description: "Dedicated placement cell and career guidance to help you land your dream opportunity." }
  ];

  const image = content.image || "https://images.unsplash.com/photo-1523050335191-91fb50b5fd46?q=80&w=2070";

  const iconMap: any = { Zap, ShieldCheck, Cpu, Globe, Rocket, Brain, GraduationCap, Users, Layout, Trophy, Star };

  const floatingCard = content.floatingCard || {
    icon: "Users",
    value: "10K+",
    label: "Happy Students"
  };

  const FloatingIcon = iconMap[floatingCard.icon] || Users;

  return (
    <section id="why-choose-us" className="py-24 px-6 relative overflow-hidden bg-slate-50 dark:bg-slate-950/50">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full -mr-64 -mt-64 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full -ml-64 -mb-64 blur-3xl" />

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-20 items-center relative z-10">
        {/* Image Side with Floating Elements */}
        <div className="flex-1 w-full relative">
          <div className="relative rounded-[3rem] overflow-hidden aspect-[4/5] shadow-2xl border-8 border-white dark:border-zinc-900 group">
            <Image
              src={image || "https://images.unsplash.com/photo-1523050335191-91fb50b5fd46?q=80&w=2070"}
              alt={title || "Why Choose Us"}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
          </div>
          
          {/* Floating Stat Card */}
          <div className="absolute -bottom-10 -right-10 bg-white dark:bg-zinc-900 p-8 rounded-[2rem] shadow-2xl border border-border animate-float hidden md:block">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <FloatingIcon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-primary">{floatingCard.value || ""}</div>
                <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{floatingCard.label || ""}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Side */}
        <div className="flex-1 space-y-10">
          <div>
            <div className="inline-flex items-center gap-3 text-primary font-black tracking-[0.2em] text-[10px] uppercase mb-6">
              <div className="h-0.5 w-10 bg-primary" />
              {subtitle}
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              {title}
            </h2>
            <p className="mt-8 text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              {description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            {features.map((feat: any, i: number) => {
              const Icon = iconMap[feat.icon] || Cpu;
              return (
                <div key={i} className="group p-2 flex gap-6">
                  <div className="w-14 h-14 shrink-0 bg-white dark:bg-zinc-900 border border-border rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-primary group-hover:text-white transition-all duration-300 transform group-hover:rotate-6">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold">{feat.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feat.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
