"use client";

import React from "react";
import {
  UserPlus,
  Settings2,
  BookOpenCheck,
  Rocket,
  CheckCircle2,
  ListChecks,
  UserCheck,
  LayoutDashboard,
  Cpu,
  ShieldCheck
} from "lucide-react";

const ICON_MAP: any = {
  userPlus: UserPlus,
  settings: Settings2,
  book: BookOpenCheck,
  rocket: Rocket,
  userCheck: UserCheck,
  dashboard: LayoutDashboard,
  cpu: Cpu,
  shield: ShieldCheck
};

export function GuideSteps({ data }: { data?: any }) {
  const content = data?.content || {};

  const defaults = {
    subtitle: "Onboarding Process",
    title: "Getting Started in 4 Simple Steps",
    description: "Follow this premium roadmap to transition your institute into a modern, AI-powered digital ecosystem in record time.",
    steps: [
      {
        title: "Registration & Branding",
        subtitle: "Define your institute's digital identity.",
        desc: "Start by registering your institute on ABCD Edu Hub. Setup your unique sub-domain, upload your logo, and define your brand colors to create a professional first impression.",
        icon: "userPlus",
        substeps: ["Choose unique sub-domain", "Upload institute logo", "Custom theme selection"]
      },
      {
        title: "Workspace Configuration",
        subtitle: "Build your administrative backbone.",
        desc: "Invite your management team and staff. Assign roles like Manager, Accountant, and Teachers with specific permission levels to ensure smooth operations.",
        icon: "settings",
        substeps: ["Invite staff members", "Assign specialized roles", "Setup permission tiers"]
      },
      {
        title: "LMS & Content Setup",
        subtitle: "Prepare your digital classroom.",
        desc: "Create courses, upload study materials/notes, and setup class schedules. Integrate AI tools to help generate question papers and automate routine tasks.",
        icon: "book",
        substeps: ["Create course curriculum", "Upload study resources", "Enable AI assessment tools"]
      },
      {
        title: "Execution & Management",
        subtitle: "Go live and start growing.",
        desc: "Onboard your students and parents. Launch your student portal for fee payments, exams, and attendance tracking. Monitor everything from your unified dashboard.",
        icon: "rocket",
        substeps: ["Launch student portals", "Automate fee collections", "Track real-time progress"]
      }
    ]
  };

  const final = { ...defaults, ...content };
  const title = data?.title || final.title;
  const subtitle = data?.subtitle || final.subtitle;
  if (!final.steps || final.steps.length === 0) final.steps = defaults.steps;

  const titleWords = title.split(" ");
  const lastWord = titleWords.length > 1 ? titleWords.pop() : "";
  const firstPart = titleWords.join(" ");

  return (
    <section className="py-20 sm:py-24 px-4 sm:px-6 bg-transparent">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2.5 text-primary font-bold text-xs tracking-[0.22em] uppercase mb-3 justify-center">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
            <span>{subtitle}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15] mb-4 text-slate-900 dark:text-white">
            {firstPart && <>{firstPart} </>}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
              {lastWord || title}
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {final.description}
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-12 sm:gap-y-16 relative">
          {/* Vertical Center Line (Desktop) */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-slate-200 dark:via-zinc-800 to-transparent -translate-x-1/2" />

          {final.steps.map((step: any, i: number) => {
            const Icon = ICON_MAP[step.icon] || Rocket;
            return (
              <div
                key={i}
                className={`group relative p-8 sm:p-10 rounded-[2.5rem] bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-slate-200/80 dark:border-zinc-800 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 overflow-hidden ${
                  i % 2 === 1 ? "md:mt-12" : ""
                }`}
              >
                {/* Large Background Step Counter */}
                <div className="absolute top-4 right-6 text-[7rem] sm:text-[9rem] font-black leading-none text-primary/10 select-none group-hover:text-primary/20 transition-colors pointer-events-none">
                  0{i + 1}
                </div>

                {/* Floating Icon Container */}
                <div className="relative z-10 w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                  <Icon className="w-7 h-7" />
                </div>

                <div className="relative z-10">
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <div className="h-0.5 w-5 bg-primary" />
                    <h4 className="text-primary font-bold text-[10px] uppercase tracking-wider">{step.subtitle}</h4>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold mb-3 tracking-tight leading-tight text-slate-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6 font-normal">
                    {step.desc}
                  </p>

                  <div className="grid grid-cols-1 gap-2.5">
                    {(step.substeps || []).map((sub: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-800/80">
                        <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">{sub}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Corner Ambient Glow */}
                <div className="absolute -top-20 -left-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
