import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { MainFooter } from "@/components/layout/MainFooter";
import { PageHeader } from "@/components/layout/PageHeader";
import dynamic from "next/dynamic";

const AboutSection = dynamic(() => import("@/components/landing/AboutSection").then(mod => mod.AboutSection));
const Achievements = dynamic(() => import("@/components/landing/Achievements").then(mod => mod.Achievements));
const MissionSection = dynamic(() => import("@/components/landing/MissionSection").then(mod => mod.MissionSection));
const VisionSection = dynamic(() => import("@/components/landing/VisionSection").then(mod => mod.VisionSection));
const OurMessage = dynamic(() => import("@/components/landing/OurMessage").then(mod => mod.OurMessage));
import { db } from "@/lib/prisma";
import { auth } from "@/auth";

export default async function AboutPage() {
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
        {isSectionActive("page-header-about") && (
          <PageHeader
            data={getSectionData("page-header-about")}
            title="About ABCD Edu Hub"
            subtitle="Pioneering the future of educational management through AI-driven innovation."
            bgImage="https://cdn.pixabay.com/photo/2023/10/10/05/52/website-8305451_1280.jpg"
            breadcrumb="About Us"
          />
        )}

        {isSectionActive("about") && <AboutSection data={getSectionData("about")} />}
        {isSectionActive("our-message") && <OurMessage data={getSectionData("our-message")} />}
        {isSectionActive("mission") && <MissionSection data={getSectionData("mission")} />}
        {isSectionActive("vision") && <VisionSection data={getSectionData("vision")} />}
        {isSectionActive("achievements") && <Achievements data={getSectionData("achievements")} />}

      </main>

      <MainFooter settings={settings} />
    </div>
  );
}

