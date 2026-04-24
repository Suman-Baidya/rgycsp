import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { LandingFooter } from "@/components/layout/LandingFooter";
import { PageHeader } from "@/components/layout/PageHeader";
import { GuideSteps } from "@/components/landing/GuideSteps";
import { GuideResources } from "@/components/landing/GuideResources";
import { db } from "@/lib/prisma";

export default async function GuidePage() {
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

  // Helper to check if a section is active
  const isSectionActive = (type: string) => {
    return settings.sections.find(s => s.type === type)?.isActive ?? true;
  };

  const getSectionData = (type: string) => {
    return settings.sections.find(s => s.type === type);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <LandingNavbar settings={settings} />

      <main className="flex-1">
        <PageHeader
          title="User Guide"
          subtitle="Everything you need to know about navigating and mastering the ABCD Edu Hub ecosystem."
          bgImage="https://cdn.pixabay.com/photo/2026/03/15/04/29/geralt-presentation-10174584_1280.jpg"
          breadcrumb="Guide"
        />

        {isSectionActive("guide-steps") && <GuideSteps data={getSectionData("guide-steps")} />}
        {isSectionActive("guide-resources") && <GuideResources data={getSectionData("guide-resources")} />}

      </main>

      <LandingFooter settings={settings} />
    </div>
  );
}
