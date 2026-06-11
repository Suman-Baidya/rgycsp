import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { MainFooter } from "@/components/layout/MainFooter";
import { PageHeader } from "@/components/layout/PageHeader";
import { db } from "@/lib/prisma";
import { auth } from "@/auth";

export default async function StudentsPage() {
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
        {isSectionActive("page-header-students") && (
          <PageHeader
            data={getSectionData("page-header-students")}
            title="Student Portal & Admissions"
            subtitle="Join thousands of students building their future with our advanced curriculum."
            bgImage="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070"
            breadcrumb="Students"
          />
        )}

        {/* Dynamic Content Section for Students */}
        <section className="py-20 bg-background relative overflow-hidden">
           <div className="max-w-7xl mx-auto px-6 relative z-10">
              <div className="text-center max-w-3xl mx-auto space-y-6">
                <h2 className="text-3xl md:text-5xl font-black tracking-tight text-foreground">
                  Empowering the <span className="text-primary">Next Generation</span>
                </h2>
                <p className="text-lg text-muted-foreground">
                  Our student portal provides seamless access to courses, notices, and placement opportunities. Stay connected and excel in your academic journey.
                </p>
              </div>
           </div>
        </section>

      </main>

      <MainFooter settings={settings} />
    </div>
  );
}
