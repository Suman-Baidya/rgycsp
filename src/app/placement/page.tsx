import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { MainFooter } from "@/components/layout/MainFooter";
import { PageHeader } from "@/components/layout/PageHeader";
import { CustomThemeStyle } from "@/components/providers/CustomThemeStyle";
import { GlobalPremiumBackground } from "@/components/layout/GlobalPremiumBackground";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { db } from "@/lib/prisma";
import { auth } from "@/auth";

export const metadata = {
  title: "Placement Cell | ABCD Edu Hub",
  description: "Bridging the gap between talented students and leading organizations.",
};

export default async function PlacementPage() {
  const session = await auth();
  const settings = await db.siteSettings.findFirst({
    where: { workspaceId: null },
    include: {
      sections: {
        orderBy: { order: "asc" }
      }
    }
  });

  if (!settings) {
    return <div>Site configuration missing. Please check the dashboard.</div>;
  }

  const isSectionActive = (type: string) => {
    return settings.sections.find(s => s.type === type)?.isActive ?? true;
  };

  const getSectionData = (type: string) => {
    return settings.sections.find(s => s.type === type);
  };

  return (
    <div className="flex flex-col min-h-screen font-sans bg-transparent selection:bg-primary/30 relative">
      <GlobalPremiumBackground />
      <CustomThemeStyle primaryColor={settings.primaryColor || undefined} accentColor={settings.accentColor || undefined} />
      <LandingNavbar settings={settings} user={session?.user} />

      <main className="flex-1 w-full">
        {isSectionActive("page-header-placement") && (
          <PageHeader
            data={getSectionData("page-header-placement")}
            title="Placement Cell"
            subtitle="Bridging the gap between talented students and leading corporate hiring partners across top industries."
            bgImage="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2084"
            breadcrumb="Placement"
          />
        )}

        <section className="py-20 sm:py-24 bg-transparent relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <SectionHeader 
              subtitle="CAREER OPPORTUNITIES"
              title="Your Career Starts Here"
              description="Our dedicated placement cell works closely with top recruiters to ensure our students get the best career opportunities. Stay tuned for upcoming job fairs, interview workshops, and placement drives."
              highlightStyle="primary"
            />
            
            {/* Stats/Highlight Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mt-12">
              <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-[2rem] p-8 text-center space-y-3 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all hover:-translate-y-1">
                <h3 className="text-4xl sm:text-5xl font-black text-primary">500+</h3>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Placement Partners</p>
              </div>
              <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-[2rem] p-8 text-center space-y-3 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all hover:-translate-y-1">
                <h3 className="text-4xl sm:text-5xl font-black text-primary">90%</h3>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Placement Rate</p>
              </div>
              <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-[2rem] p-8 text-center space-y-3 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all hover:-translate-y-1">
                <h3 className="text-4xl sm:text-5xl font-black text-primary">₹5LPA</h3>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Average Salary</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <MainFooter settings={settings} />
    </div>
  );
}
