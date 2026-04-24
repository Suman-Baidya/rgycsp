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
  if (!final.steps || final.steps.length === 0) final.steps = defaults.steps;

  return (
    <section className="py-24 px-6 bg-white dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-primary/5 border border-primary/20 text-primary font-bold text-[10px] tracking-[0.2em] uppercase mb-4">
            <ListChecks className="w-4 h-4" />
            {final.subtitle}
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-6">
            {final.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {final.description}
          </p>
        </div>

        {/* Steps Grid - Unique Glass Timeline Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-20 relative">
          {/* Vertical Center Line (Desktop) */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-zinc-200 dark:via-zinc-800 to-transparent -translate-x-1/2"></div>

          {final.steps.map((step: any, i: number) => {
            const Icon = ICON_MAP[step.icon] || Rocket;
            return (
              <div
                key={i}
                className={`group relative p-10 rounded-[3rem] bg-white dark:bg-zinc-900 border border-border/50 transition-all duration-700 hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] hover:-translate-y-4 overflow-hidden ${i % 2 === 1 ? "md:mt-16" : ""
                  }`}
              >
                {/* Massive Glass Number - Reduced size */}
                <div className="absolute top-6 right-6 text-[10rem] font-black leading-none text-primary select-none group-hover:text-primary/30 transition-colors duration-700">
                  {i + 1}
                </div>

                {/* Floating Icon Container */}
                <div className="relative z-10 w-16 h-16 rounded-2xl bg-white dark:bg-zinc-800 shadow-xl border border-border flex items-center justify-center mb-8 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500">
                  <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-inner">
                    <Icon className="w-6 h-6" />
                  </div>
                </div>

                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-[2px] w-6 bg-primary"></div>
                    <h4 className="text-primary font-black text-[10px] uppercase tracking-wide">{step.subtitle}</h4>
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-black mb-4 tracking-tight leading-tight">
                    {step.title}
                  </h3>
                  <p className="text-base text-muted-foreground leading-relaxed mb-8 font-medium">
                    {step.desc}
                  </p>

                  <div className="grid grid-cols-1 gap-4">
                    {(step.substeps || []).map((sub: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-border/50 group-hover:border-primary/20 transition-colors">
                        <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-sm font-bold text-foreground/80">{sub}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Corner Glow Effect */}
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/5 rounded-full blur-[100px] group-hover:bg-primary/20 transition-all duration-700"></div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
