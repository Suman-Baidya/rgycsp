"use client";

import React from "react";
import {
  ShieldCheck,
  Briefcase,
  Wallet,
  Users,
  GraduationCap,
  Heart,
  Globe,
  Cpu,
  LayoutDashboard,
  CheckCircle2,
  Zap,
  Target
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { SectionHeader } from "@/components/ui/SectionHeader";

const ICON_MAP: any = {
  shield: ShieldCheck,
  briefcase: Briefcase,
  wallet: Wallet,
  users: Users,
  graduation: GraduationCap,
  heart: Heart,
  globe: Globe,
  cpu: Cpu,
  dashboard: LayoutDashboard,
  zap: Zap,
  target: Target
};

export function ServicesSection({ data }: { data?: any }) {
  const content = data?.content || {};
  const mainTitle = data?.title || "Our Services";
  const mainSubtitle = data?.subtitle || "Innovative solutions for every educational need.";

  // Settings-based Toggles (Defaults to true)
  const showHighlights = content.showHighlights !== false;
  const showLms = content.showLms !== false;
  const showEcosystem = content.showEcosystem !== false;

  // Highlight Cards Fallbacks
  const highlightDefaults = [
    { title: "Cloud Scale", desc: "Enterprise-grade infrastructure that grows with your institute.", icon: "globe" },
    { title: "AI Powered", desc: "Automate complex tasks with our proprietary AI modules.", icon: "cpu" },
    { title: "Multi-Tenant", desc: "Separate, secure workspaces for every franchise or branch.", icon: "shield" },
    { title: "Instant Support", desc: "Round-the-clock technical assistance for your entire team.", icon: "zap" }
  ];
  const highlights = content.highlights || highlightDefaults;

  // LMS Defaults
  const lmsDefaults = {
    subtitle: "Next-Gen LMS",
    title: "A Digital Workspace for Your Institute",
    description: "We provide a complete Learning Management System as a separate workspace for individual institutes. Every user gets a dedicated dashboard, and every institute gets its own identity in the digital world.",
    image: "https://cdn.pixabay.com/photo/2023/01/14/17/10/ai-generated-7718624_1280.jpg",
    features: [
      { title: "Sub-domain & Full Domain", text: "Get a separate landing page for your own institute." },
      { title: "AI Driven Growth", text: "Modern AI tools to automate teaching and assessments." }
    ]
  };

  // Ecosystem Defaults
  const ecosystemDefaults = {
    subtitle: "Dashboard Ecosystem",
    title: "Multi-Tenant Role Management",
    description: "Every user persona has a tailored experience designed for maximum productivity, ensuring absolute control and a seamless journey for everyone.",
    roles: [
      { title: "Workspace Admin", description: "The supreme authority. A powerful dashboard to control the entire institute, manage subscriptions, and oversee all operations.", icon: "shield", color: "bg-red-500/10 text-red-600" },
      { title: "Manager", description: "Managed by the admin. The manager handles day-to-day operations and workspace management on behalf of the administration.", icon: "briefcase", color: "bg-blue-500/10 text-blue-600" },
      { title: "Accountant", description: "Specialized access to payment tracking, fee management, and financial auditing as assigned by the Admin or Manager.", icon: "wallet", color: "bg-emerald-500/10 text-emerald-600" },
      { title: "Other Staff", description: "Perform specific educational and administrative tasks assigned by the management team with focused toolsets.", icon: "users", color: "bg-amber-500/10 text-amber-600" },
      { title: "Student", description: "Personalized dashboard for schedules, exams, notes, and direct payment portals for a seamless learning journey.", icon: "graduation", color: "bg-indigo-500/10 text-indigo-600" },
      { title: "Parents", description: "Guardian visibility. Parents can track their child's progress, attendance, and financial standing within the institute.", icon: "heart", color: "bg-rose-500/10 text-rose-600" }
    ]
  };

  const lms = { ...lmsDefaults, ...content.lms };
  const ecosystem = { ...ecosystemDefaults, ...content.ecosystem };
  
  if (!lms.features || lms.features.length === 0) lms.features = lmsDefaults.features;
  if (!ecosystem.roles || ecosystem.roles.length === 0) ecosystem.roles = ecosystemDefaults.roles;

  const lmsTitleWords = (lms.title || "").split(" ");
  const lmsLastWord = lmsTitleWords.length > 1 ? lmsTitleWords.pop() : "";
  const lmsFirstPart = lmsTitleWords.join(" ");

  const ecoTitleWords = (ecosystem.title || "").split(" ");
  const ecoLastWord = ecoTitleWords.length > 1 ? ecoTitleWords.pop() : "";
  const ecoFirstPart = ecoTitleWords.join(" ");

  return (
    <section id="services" className="py-20 sm:py-24 px-4 sm:px-6 overflow-hidden bg-transparent">
      <div className="max-w-7xl mx-auto">
        
        {/* 1. Main Header */}
        <SectionHeader 
          subtitle="OUR CAPABILITIES"
          title={mainTitle}
          description={mainSubtitle}
          highlightStyle="primary"
        />

        {/* 2. Highlight Cards (Conditional) */}
        {showHighlights && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20 sm:mb-24">
            {highlights.slice(0, 4).map((h: any, i: number) => {
              const Icon = ICON_MAP[h.icon] || Globe;
              return (
                <div 
                  key={i} 
                  className="p-6 sm:p-8 rounded-[2rem] bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-base sm:text-lg font-bold mb-2 text-slate-900 dark:text-white">{h.title}</h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{h.desc}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* 3. Next-Gen LMS Content (Conditional) */}
        {showLms && (
          <div className={cn(
            "flex flex-col lg:flex-row items-center gap-12 lg:gap-16",
            showEcosystem ? "mb-24 sm:mb-32" : ""
          )}>
            <div className="flex-1 w-full">
              <div className="inline-flex items-center gap-2.5 text-primary font-bold text-xs tracking-[0.22em] uppercase mb-3 sm:mb-4">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
                <span>{lms.subtitle}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15] mb-5 text-slate-900 dark:text-white">
                {lmsFirstPart && <>{lmsFirstPart} </>}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                  {lmsLastWord || lms.title}
                </span>
              </h2>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-8 max-w-2xl">
                {lms.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {(lms.features || []).map((feat: any, i: number) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/70 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 shadow-xs">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">{feat.title}</h4>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">{feat.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 w-full relative group">
              <div className="relative rounded-[2rem] overflow-hidden aspect-video shadow-2xl z-10 border border-slate-200/80 dark:border-zinc-800">
                <Image
                  src={lms.image || ""}
                  alt={lms.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-primary/10 mix-blend-overlay pointer-events-none" />
              </div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl -z-10 pointer-events-none" />
            </div>
          </div>
        )}

        {/* 4. Dashboard Ecosystem Content (Conditional) */}
        {showEcosystem && (
          <div className="pt-12 sm:pt-16 border-t border-slate-200/60 dark:border-zinc-800/60">
            <div className="text-center mb-14 sm:mb-16">
              <div className="inline-flex items-center gap-2.5 text-primary font-bold text-xs tracking-[0.22em] uppercase mb-3">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
                <span>{ecosystem.subtitle}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15] mb-4 text-slate-900 dark:text-white">
                {ecoFirstPart && <>{ecoFirstPart} </>}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                  {ecoLastWord || ecosystem.title}
                </span>
              </h2>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                {ecosystem.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {(ecosystem.roles || []).map((role: any, i: number) => {
                const Icon = ICON_MAP[role.icon] || Users;
                return (
                  <div
                    key={i}
                    className="group relative p-8 sm:p-10 rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 hover:border-primary/40 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 overflow-hidden flex flex-col"
                  >
                    <div className="absolute top-6 right-8 text-7xl font-black text-slate-100 dark:text-zinc-800/40 select-none group-hover:text-primary/10 transition-colors pointer-events-none">
                      0{i + 1}
                    </div>
                    <div className={`relative z-10 w-16 h-16 rounded-2xl ${role.color || "bg-primary/10 text-primary"} flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <div className="relative z-10 flex-1 flex flex-col">
                      <h4 className="text-xl font-extrabold mb-3 tracking-tight text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                        {role.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal flex-1">
                        {role.description}
                      </p>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                      <div className="h-full w-0 bg-primary group-hover:w-full transition-all duration-500 ease-out" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
