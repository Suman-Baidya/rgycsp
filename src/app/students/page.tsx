import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { MainFooter } from "@/components/layout/MainFooter";
import { PageHeader } from "@/components/layout/PageHeader";
import { db } from "@/lib/prisma";
import { auth } from "@/auth";
import { StudentFeaturesGrid } from "@/components/landing/StudentFeaturesGrid";

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

        <StudentFeaturesGrid />

      </main>

      <MainFooter settings={settings} />
    </div>
  );
}
