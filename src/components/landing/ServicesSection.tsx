"use client"

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
  CheckCircle2
} from "lucide-react";

const ROLES = [
  {
    title: "Workspace Admin",
    description: "The supreme authority. A powerful dashboard to control the entire institute, manage subscriptions, and oversee all operations.",
    icon: <ShieldCheck className="w-6 h-6" />,
    color: "bg-red-500/10 text-red-600"
  },
  {
    title: "Manager",
    description: "Managed by the admin. The manager handles day-to-day operations and workspace management on behalf of the administration.",
    icon: <Briefcase className="w-6 h-6" />,
    color: "bg-blue-500/10 text-blue-600"
  },
  {
    title: "Accountant",
    description: "Specialized access to payment tracking, fee management, and financial auditing as assigned by the Admin or Manager.",
    icon: <Wallet className="w-6 h-6" />,
    color: "bg-emerald-500/10 text-emerald-600"
  },
  {
    title: "Other Staff",
    description: "Perform specific educational and administrative tasks assigned by the management team with focused toolsets.",
    icon: <Users className="w-6 h-6" />,
    color: "bg-amber-500/10 text-amber-600"
  },
  {
    title: "Student",
    description: "Personalized dashboard for schedules, exams, notes, and direct payment portals for a seamless learning journey.",
    icon: <GraduationCap className="w-6 h-6" />,
    color: "bg-indigo-500/10 text-indigo-600"
  },
  {
    title: "Parents",
    description: "Guardian visibility. Parents can track their child's progress, attendance, and financial standing within the institute.",
    icon: <Heart className="w-6 h-6" />,
    color: "bg-rose-500/10 text-rose-600"
  }
];

export function ServicesSection() {
  return (
    <section id="services" className="py-24 px-6 bg-zinc-50 dark:bg-black/20 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header Part */}
        <div className="flex flex-col lg:flex-row items-center gap-16 mb-24">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-primary/5 border border-primary/20 text-primary font-bold text-[10px] tracking-[0.2em] uppercase mb-6">
              <Cpu className="w-4 h-4" />
              Next-Gen LMS
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-8">
              A <span className="text-primary">Digital Workspace</span> for Your Institute
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-2xl">
              We provide a complete Learning Management System as a separate workspace for individual institutes. Every user gets a dedicated dashboard, and every institute gets its own identity in the digital world.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                <div>
                  <h4 className="font-bold">Sub-domain & Full Domain</h4>
                  <p className="text-sm text-muted-foreground">Get a separate landing page for your own institute.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                <div>
                  <h4 className="font-bold">AI Driven Growth</h4>
                  <p className="text-sm text-muted-foreground">Modern AI tools to automate teaching and assessments.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 relative">
            <div className="relative rounded-[2.5rem] overflow-hidden aspect-video shadow-2xl z-10 border border-white dark:border-zinc-800">
              <img
                src="https://cdn.pixabay.com/photo/2023/01/14/17/10/ai-generated-7718624_1280.jpg"
                alt="Platform Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-primary/10 backdrop-blur-[1px]"></div>
            </div>
            {/* Decor */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
          </div>
        </div>

        {/* Roles Grid Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-primary/5 border border-primary/20 text-primary font-bold text-[10px] tracking-[0.2em] uppercase mb-4 shadow-sm">
            <LayoutDashboard className="w-4 h-4" />
            Dashboard Ecosystem
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-6">
            Multi-Tenant <span className="text-primary">Role Management</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Every user persona has a tailored experience designed for maximum productivity, ensuring absolute control and a seamless journey for everyone.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ROLES.map((role, i) => (
            <div
              key={i}
              className="group relative p-10 rounded-[3rem] bg-white dark:bg-zinc-900 border border-border/50 hover:border-primary/50 transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] hover:-translate-y-3 overflow-hidden"
            >
              {/* Floating Decorative Number */}
              <div className="absolute top-8 right-10 text-8xl font-black text-zinc-100 dark:text-zinc-800/50 select-none group-hover:text-primary/10 transition-colors duration-500">
                0{i + 1}
              </div>

              {/* Icon Container - Glowing Pill Shape */}
              <div className={`relative z-10 w-20 h-20 rounded-[2rem] ${role.color} flex items-center justify-center mb-10 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 group-hover:shadow-[0_0_30px_rgba(var(--primary),0.3)]`}>
                {role.icon}
              </div>

              <div className="relative z-10">
                <h4 className="text-2xl font-black mb-4 tracking-tight text-foreground group-hover:text-primary transition-colors">
                  {role.title}
                </h4>
                <p className="text-[15px] text-muted-foreground leading-relaxed font-medium">
                  {role.description}
                </p>
              </div>

              {/* Interactive Glow Corner */}
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/5 rounded-full blur-[80px] group-hover:bg-primary/20 transition-all duration-700"></div>

              {/* Bottom Accent Line - Sleek */}
              <div className="absolute bottom-0 left-0 w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <div className="h-full w-0 bg-primary group-hover:w-full transition-all duration-700 ease-in-out"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
