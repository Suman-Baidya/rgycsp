import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { MainFooter } from "@/components/layout/MainFooter";
import { PageHeader } from "@/components/layout/PageHeader";
import { PricingSection } from "@/components/landing/PricingSection";
import { CustomSolution } from "@/components/landing/CustomSolution";
import { Testimonials } from "@/components/landing/Testimonials";
import { db } from "@/lib/prisma";

export default async function PricingPage() {
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

      <main className="flex-1 bg-background">
        {isSectionActive("page-header-pricing") && (
          <PageHeader
            data={getSectionData("page-header-pricing")}
            title="Pricing Plans"
            subtitle="Transparent, flexible pricing designed to scale with your institute's growth."
            bgImage="https://cdn.pixabay.com/photo/2019/09/27/17/02/rupee-4508945_1280.jpg"
            breadcrumb="Pricing"
          />
        )}

        {isSectionActive("pricing") && <PricingSection data={getSectionData("pricing")} />}
        {isSectionActive("custom-solution") && <CustomSolution data={getSectionData("custom-solution")} />}
        {isSectionActive("testimonials") && <Testimonials data={getSectionData("testimonials")} />}

      </main>

      <MainFooter settings={settings} />
    </div>
  );
}
