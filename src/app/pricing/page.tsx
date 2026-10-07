import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { MainFooter } from "@/components/layout/MainFooter";
import { PageHeader } from "@/components/layout/PageHeader";
import { CustomThemeStyle } from "@/components/providers/CustomThemeStyle";
import { GlobalPremiumBackground } from "@/components/layout/GlobalPremiumBackground";
import dynamic from "next/dynamic";

const PricingSection = dynamic(() => import("@/components/landing/PricingSection").then(mod => mod.PricingSection));
const CustomSolution = dynamic(() => import("@/components/landing/CustomSolution").then(mod => mod.CustomSolution));
const Testimonials = dynamic(() => import("@/components/landing/Testimonials").then(mod => mod.Testimonials));
import { db } from "@/lib/prisma";
import { auth } from "@/auth";

export const metadata = {
  title: "Pricing Plans | ABCD Edu Hub",
  description: "Transparent, flexible pricing designed to scale with your institute's growth.",
};

export default async function PricingPage() {
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
    <div className="flex flex-col min-h-screen font-sans bg-transparent selection:bg-primary/30 relative">
      <GlobalPremiumBackground />
      <CustomThemeStyle primaryColor={settings.primaryColor || undefined} accentColor={settings.accentColor || undefined} />
      <LandingNavbar settings={settings} user={session?.user} />

      <main className="flex-1 w-full">
        {isSectionActive("page-header-pricing") && (
          <PageHeader
            data={getSectionData("page-header-pricing")}
            title="Pricing Plans"
            subtitle="Transparent, flexible pricing designed to scale effortlessly with your institute's growth and student requirements."
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
