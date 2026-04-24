import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { LandingFooter } from "@/components/layout/LandingFooter";
import { HeroSection } from "@/components/landing/HeroSection";
import { AboutSection } from "@/components/landing/AboutSection";
import { WhyChooseUs } from "@/components/landing/WhyChooseUs";
import { Achievements } from "@/components/landing/Achievements";
import { PartnersMarquee } from "@/components/landing/PartnersMarquee";
import { Testimonials } from "@/components/landing/Testimonials";
import { PricingSection } from "@/components/landing/PricingSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { ContactSection } from "@/components/landing/ContactSection";
import { OurMessage } from "@/components/landing/OurMessage";
import { MissionSection as Mission } from "@/components/landing/MissionSection";
import { VisionSection as Vision } from "@/components/landing/VisionSection";
import { ServicesSection as Services } from "@/components/landing/ServicesSection";
import { GuideResources } from "@/components/landing/GuideResources";
import { CustomSolution } from "@/components/landing/CustomSolution";
import { db } from "@/lib/prisma";
import { CustomThemeStyle } from "@/components/providers/CustomThemeStyle";

export default async function RootLandingPage() {
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
    <div className="flex flex-col min-h-screen font-sans bg-background selection:bg-primary/30">
      <CustomThemeStyle primaryColor={settings.primaryColor || undefined} accentColor={settings.accentColor || undefined} />
      <LandingNavbar settings={settings} />

      <main className="flex-1 w-full flex flex-col">
        {isSectionActive("hero") && <HeroSection data={getSectionData("hero")} />}
        
        {isSectionActive("about") && <AboutSection data={getSectionData("about")} />}

        {isSectionActive("why-choose-us") && <WhyChooseUs data={getSectionData("why-choose-us")} />}
        
        {isSectionActive("achievements") && <Achievements data={getSectionData("achievements")} />}

        {isSectionActive("partners") && <PartnersMarquee data={getSectionData("partners")} />}

        {isSectionActive("our-message") && <OurMessage data={getSectionData("our-message")} />}

        <div className="grid grid-cols-1 md:grid-cols-2">
          {isSectionActive("mission") && <Mission data={getSectionData("mission")} />}
          {isSectionActive("vision") && <Vision data={getSectionData("vision")} />}
        </div>

        {isSectionActive("services") && <div id="services"><Services data={getSectionData("services")} /></div>}

        {isSectionActive("guide-resources") && <div id="guide"><GuideResources data={getSectionData("guide-resources")} /></div>}

        {isSectionActive("testimonials") && <div id="testimonials"><Testimonials data={getSectionData("testimonials")} /></div>}

        {isSectionActive("pricing") && <div id="pricing"><PricingSection data={getSectionData("pricing")} /></div>}

        {isSectionActive("custom-solution") && <CustomSolution data={getSectionData("custom-solution")} />}

        {isSectionActive("faq") && <div id="faq"><FaqSection data={getSectionData("faq")} /></div>}
        
        {isSectionActive("contact") && <ContactSection data={getSectionData("contact")} settings={settings} />}
      </main>

      <LandingFooter settings={settings} />
    </div>
  );
}
