import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { WorkspaceNavbar } from "@/components/layout/WorkspaceNavbar";
import { WorkspaceFooter } from "@/components/layout/WorkspaceFooter";
import { WorkspacePageHeader } from "@/components/layout/WorkspacePageHeader";
import { CustomThemeStyle } from "@/components/providers/CustomThemeStyle";
import { auth } from "@/auth";
import { Compass, Lightbulb, Rocket, Target } from "lucide-react";

export default async function WorkspaceGuidancePage({
  params
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;

  const workspace = await db.workspace.findUnique({
    where: { subdomain: tenant?.toLowerCase() },
    include: {
      siteSettings: true
    }
  });

  if (!workspace || !workspace.siteSettings) notFound();

  const session = await auth();

  return (
    <div className="flex flex-col min-h-screen font-sans bg-background">
      <CustomThemeStyle 
        primaryColor={workspace.siteSettings.primaryColor || undefined} 
        accentColor={workspace.siteSettings.accentColor || undefined} 
        fontFamily={workspace.siteSettings.fontFamily || undefined} 
      />
      
      <WorkspaceNavbar settings={workspace.siteSettings} user={session?.user} tenant={tenant} />

      <main className="flex-1 w-full">
        <WorkspacePageHeader 
          title="Career Guidance"
          description="Navigating your career path can be challenging. We offer expert guidance to help you make informed decisions."
          bgImage={workspace.siteSettings.pageHeaderBanner || "https://images.unsplash.com/photo-1454165833767-027ffea9e77b?q=80&w=2070"}
          statusTitle="EXPERT"
          statusSub="Guidance Desk"
          breadcrumbs={[
            { name: "Guidance", href: "/guidance" }
          ]}
        />

        <div className="max-w-7xl mx-auto px-6 py-32 space-y-32">
          {/* Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
             <div className="space-y-8">
                <div className="inline-flex items-center gap-3 text-primary font-black tracking-[0.2em] text-[10px] uppercase">
                  <div className="h-0.5 w-10 bg-primary" />
                  Your Future Starts Here
                </div>
                <h2 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                  Expert Advice for a Brighter Career
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                  Our career counselors help you identify your strengths, explore industry trends, and choose the programs that align with your professional goals.
                </p>
                <div className="grid grid-cols-2 gap-8 pt-4">
                   <div className="space-y-2">
                      <div className="text-3xl font-black text-primary">95%</div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Placement Rate</p>
                   </div>
                   <div className="space-y-2">
                      <div className="text-3xl font-black text-primary">500+</div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Expert Counselors</p>
                   </div>
                </div>
             </div>

             <div className="relative">
                <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl">
                   <img 
                    src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070" 
                    alt="Guidance Session" 
                    className="w-full h-full object-cover"
                   />
                </div>
                <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl p-8 flex flex-col items-center justify-center text-center gap-2 border border-border/40">
                   <Compass className="w-10 h-10 text-primary animate-spin-slow" />
                   <span className="font-black text-[10px] uppercase tracking-widest">Find Your Path</span>
                </div>
             </div>
          </div>

          {/* Core Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Target, title: "Goal Setting", desc: "Define your long-term career objectives with clarity." },
              { icon: Lightbulb, title: "Skill Analysis", desc: "Identify the technical and soft skills you need to develop." },
              { icon: Rocket, title: "Career Growth", desc: "Get insights into the fastest growing industries and roles." }
            ].map((pillar, i) => (
              <div key={i} className="p-12 rounded-[3.5rem] bg-slate-50 dark:bg-zinc-900 border border-border/40 space-y-6 group hover:bg-primary transition-all duration-700">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-white/20 group-hover:text-white transition-all">
                  <pillar.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black group-hover:text-white transition-colors">{pillar.title}</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed group-hover:text-white/80 transition-colors">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <WorkspaceFooter settings={workspace.siteSettings} />
    </div>
  );
}
