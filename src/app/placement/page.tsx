import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { MainFooter } from "@/components/layout/MainFooter";
import { PageHeader } from "@/components/layout/PageHeader";
import { db } from "@/lib/prisma";
import { auth } from "@/auth";

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
    <div className="flex flex-col min-h-screen bg-background">
      <LandingNavbar settings={settings} user={session?.user} />

      <main className="flex-1">
        {isSectionActive("page-header-placement") && (
          <PageHeader
            data={getSectionData("page-header-placement")}
            title="Placement Cell"
            subtitle="Bridging the gap between talented students and leading organizations."
            bgImage="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2084"
            breadcrumb="Placement"
          />
        )}

        <section className="py-20 bg-background relative overflow-hidden">
           <div className="max-w-7xl mx-auto px-6 relative z-10">
              <div className="text-center max-w-3xl mx-auto space-y-6">
                <h2 className="text-3xl md:text-5xl font-black tracking-tight text-foreground">
                  Your Career <span className="text-primary">Starts Here</span>
                </h2>
                <p className="text-lg text-muted-foreground">
                  Our dedicated placement cell works closely with top recruiters to ensure our students get the best career opportunities. Stay tuned for upcoming job fairs, interview workshops, and placement drives.
                </p>
              </div>
              
              {/* Stats/Highlight Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
                 <div className="bg-card border border-border/50 rounded-[2rem] p-8 text-center space-y-4 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all">
                    <h3 className="text-5xl font-black text-primary">500+</h3>
                    <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Placement Partners</p>
                 </div>
                 <div className="bg-card border border-border/50 rounded-[2rem] p-8 text-center space-y-4 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all">
                    <h3 className="text-5xl font-black text-primary">90%</h3>
                    <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Placement Rate</p>
                 </div>
                 <div className="bg-card border border-border/50 rounded-[2rem] p-8 text-center space-y-4 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all">
                    <h3 className="text-5xl font-black text-primary">₹5LPA</h3>
                    <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Average Salary</p>
                 </div>
              </div>
           </div>
        </section>

      </main>

      <MainFooter settings={settings} />
    </div>
  );
}
