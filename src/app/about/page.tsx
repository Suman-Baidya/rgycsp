import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { LandingFooter } from "@/components/layout/LandingFooter";
import { AboutSection } from "@/components/landing/AboutSection";
import { Achievements } from "@/components/landing/Achievements";
import { PageHeader } from "@/components/layout/PageHeader";
import { MissionSection } from "@/components/landing/MissionSection";
import { VisionSection } from "@/components/landing/VisionSection";
import { OurMessage } from "@/components/landing/OurMessage";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <LandingNavbar />

      <main className="flex-1">
        <PageHeader
          title="About ABCD Edu Hub"
          subtitle="Pioneering the future of educational management through AI-driven innovation."
          bgImage="https://cdn.pixabay.com/photo/2023/10/10/05/52/website-8305451_1280.jpg"
          breadcrumb="About Us"
        />

        <AboutSection />
        <OurMessage />
        <MissionSection />
        <VisionSection />
        <Achievements />

      </main>

      <LandingFooter />
    </div>
  );
}

