import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { WorkspaceNavbar } from "@/components/layout/WorkspaceNavbar";
import { WorkspaceFooter } from "@/components/layout/WorkspaceFooter";
import { WorkspacePageHeader } from "@/components/layout/WorkspacePageHeader";
import { CustomThemeStyle } from "@/components/providers/CustomThemeStyle";
import { auth } from "@/auth";
import { GraduationCap, Users, BookOpen, Star, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function WorkspaceLearnersPage({
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
          title="Learners Portal"
          description="A dedicated space for our learners to explore resources, track progress, and stay updated."
          bgImage={workspace.siteSettings.pageHeaderBanner || "https://images.unsplash.com/photo-1523240715181-01489a943ee2?q=80&w=2070"}
          statusTitle="LEARNER"
          statusSub="Access Area"
          breadcrumbs={[
            { name: "Learners", href: "/learners" }
          ]}
        />

        <div className="max-w-7xl mx-auto px-6 py-32 text-center space-y-12">
          <div className="inline-flex items-center gap-4 px-6 py-2 rounded-full bg-primary/10 text-primary font-black uppercase tracking-[0.2em] text-[10px]">
            <GraduationCap className="w-4 h-4" />
            Coming Soon
          </div>
          
          <div className="space-y-6">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white">
              Learner Resources & Portal
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-3xl mx-auto leading-relaxed">
              We are currently building a premium digital experience for our learners. Soon you'll be able to access your course materials, attendance, and certificates right here.
            </p>
            {session?.user && (
              <div className="pt-8">
                <Link href="/student/dashboard">
                  <Button size="lg" className="rounded-2xl h-14 px-10 font-black gap-3 shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                    Go to My Dashboard <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
            {[
              { icon: BookOpen, title: "LMS Integration", desc: "Access all your course videos and notes in one place." },
              { icon: Users, title: "Community Forum", desc: "Interact with fellow learners and faculty members." },
              { icon: Star, title: "Performance Tracking", desc: "Monitor your grades and progress throughout the semester." }
            ].map((feature, i) => (
              <div key={i} className="p-10 rounded-[3rem] bg-slate-50 dark:bg-zinc-900 border border-border/40 space-y-6 hover:shadow-2xl transition-all duration-500">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black">{feature.title}</h3>
                <p className="text-sm text-slate-500 font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <WorkspaceFooter settings={workspace.siteSettings} tenant={tenant} user={session?.user} />
    </div>
  );
}
