import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { MainFooter } from "@/components/layout/MainFooter";
import { PageHeader } from "@/components/layout/PageHeader";
import { db } from "@/lib/prisma";
import { auth } from "@/auth";
import { StudyCenterClient } from "./StudyCenterClient";
import { getStudyCenters } from "@/app/actions/study-center";

export const metadata = {
  title: 'Study Center | Nearest Institute',
  description: 'Search and find our nearest study centers and franchises. Apply online easily.',
};

export default async function StudyCenterPage() {
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

  const { centers } = await getStudyCenters();

  // Find the page header section for the study center
  const headerSection = settings.sections.find(
    (s: any) => s.type === "page-header-study-center" && s.isActive
  );

  const contentSection = settings.sections.find(
    (s: any) => s.type === "study-center-content" && s.isActive
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans selection:bg-primary/30">
      <LandingNavbar settings={settings} user={session?.user} />
      
      <main className="flex-1">
        <PageHeader 
          title="Study Center" 
          subtitle="Find Your Nearest Institute" 
          breadcrumb="Study Center"
          data={headerSection}
          bgImage="https://cdn.pixabay.com/photo/2018/10/27/15/40/zhejiang-university-3776783_1280.jpg"
        />
        
        <StudyCenterClient initialCenters={centers || []} contentSection={contentSection} />
      </main>

      <MainFooter settings={settings} />
    </div>
  );
}
