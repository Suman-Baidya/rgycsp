"use client";

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
  
  // Ensure nested arrays also fallback if empty
  if (!lms.features || lms.features.length === 0) lms.features = lmsDefaults.features;
  if (!ecosystem.roles || ecosystem.roles.length === 0) ecosystem.roles = ecosystemDefaults.roles;

  return (
    <section id="services" className="py-24 px-6 bg-zinc-50 dark:bg-black/20 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* 1. Main Header (Always Visible) */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-primary/5 border border-primary/20 text-primary font-bold text-[10px] tracking-[0.2em] mb-4">
            <Zap className="w-4 h-4" />
            Our Services
          </div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            {mainTitle}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {mainSubtitle}
          </p>
        </div>

        {/* 2. Highlight Cards (Conditional) */}
        {showHighlights && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
            {highlights.slice(0, 4).map((h: any, i: number) => {
              const Icon = ICON_MAP[h.icon] || Globe;
              return (
                <div key={i} className="p-8 rounded-[2rem] bg-white dark:bg-zinc-900 border border-border/50 hover:shadow-xl transition-all group">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold mb-3">{h.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{h.desc}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* 3. Next-Gen LMS Content (Conditional) */}
        {showLms && (
          <div className={cn(
            "flex flex-col lg:flex-row items-center gap-16",
            showEcosystem ? "mb-32" : ""
          )}>
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-primary/5 border border-primary/20 text-primary font-bold text-[10px] tracking-[0.2em] uppercase mb-6">
                <Cpu className="w-4 h-4" />
                {lms.subtitle}
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-8">
                {lms.title}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-2xl">
                {lms.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {(lms.features || []).map((feat: any, i: number) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-border/50">
                    <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                    <div>
                      <h4 className="font-bold">{feat.title}</h4>
                      <p className="text-sm text-muted-foreground">{feat.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 relative">
              <div className="relative rounded-[2.5rem] overflow-hidden aspect-video shadow-2xl z-10 border border-white dark:border-zinc-800">
                <Image
                  src={lms.image || ""}
                  alt={lms.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-primary/10 backdrop-blur-[1px]"></div>
              </div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
            </div>
          </div>
        )}

        {/* 4. Dashboard Ecosystem Content (Conditional) */}
        {showEcosystem && (
          <div className="pt-12 border-t border-border/40">
            <div className="text-center mb-16">
               <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-primary/5 border border-primary/20 text-primary font-bold text-[10px] tracking-[0.2em] uppercase mb-4 shadow-sm">
                <LayoutDashboard className="w-4 h-4" />
                {ecosystem.subtitle}
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-6">
                {ecosystem.title}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                {ecosystem.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(ecosystem.roles || []).map((role: any, i: number) => {
                const Icon = ICON_MAP[role.icon] || Users;
                return (
                  <div
                    key={i}
                    className="group relative p-10 rounded-[3rem] bg-white dark:bg-zinc-900 border border-border/50 hover:border-primary/50 transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] hover:-translate-y-3 overflow-hidden"
                  >
                    <div className="absolute top-8 right-10 text-8xl font-black text-zinc-100 dark:text-zinc-800/50 select-none group-hover:text-primary/10 transition-colors duration-500">
                      0{i + 1}
                    </div>
                    <div className={`relative z-10 w-20 h-20 rounded-[2rem] ${role.color || "bg-primary/10 text-primary"} flex items-center justify-center mb-10 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 group-hover:shadow-[0_0_30px_rgba(var(--primary),0.3)]`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="relative z-10">
                      <h4 className="text-2xl font-black mb-4 tracking-tight text-foreground group-hover:text-primary transition-colors">
                        {role.title}
                      </h4>
                      <p className="text-[15px] text-muted-foreground leading-relaxed font-medium">
                        {role.description}
                      </p>
                    </div>
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/5 rounded-full blur-[80px] group-hover:bg-primary/20 transition-all duration-700"></div>
                    <div className="absolute bottom-0 left-0 w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                      <div className="h-full w-0 bg-primary group-hover:w-full transition-all duration-700 ease-in-out"></div>
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

// Helper for conditional classNames
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
