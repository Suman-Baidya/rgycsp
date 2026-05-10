import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { MainFooter } from "@/components/layout/MainFooter";
import { PageHeader } from "@/components/layout/PageHeader";
import { WhyChooseUs } from "@/components/landing/WhyChooseUs";
import { ServicesSection } from "@/components/landing/ServicesSection";
import { ReadyToModernize } from "@/components/landing/ReadyToModernize";
import { db } from "@/lib/prisma";
import { auth } from "@/auth";

export default async function ServicesPage() {
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

  // Helper to check if a section is active
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
        {isSectionActive("page-header-services") && (
          <PageHeader
            data={getSectionData("page-header-services")}
            title="Our Services"
            subtitle="Comprehensive digital solutions tailored for modern educational excellence."
            bgImage="https://cdn.pixabay.com/photo/2016/11/22/21/26/notebook-1850613_1280.jpg"
            breadcrumb="Services"
          />
        )}
        {isSectionActive("services") && <ServicesSection data={getSectionData("services")} />}
        {isSectionActive("why-choose-us") && <WhyChooseUs data={getSectionData("why-choose-us")} />}
        {isSectionActive("ready-to-modernize") && <ReadyToModernize data={getSectionData("ready-to-modernize")} />}
      </main>

      <MainFooter settings={settings} />
    </div>
  );
}
