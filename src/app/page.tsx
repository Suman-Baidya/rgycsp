import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { MainFooter } from "@/components/layout/MainFooter";
import { HeroSection } from "@/components/landing/HeroSection";
import { QuickLinksSection } from "@/components/landing/QuickLinksSection";
import { AboutSection } from "@/components/landing/AboutSection";
import { WhyChooseUs } from "@/components/landing/WhyChooseUs";
import { Achievements } from "@/components/landing/Achievements";
import { PartnersMarquee } from "@/components/landing/PartnersMarquee";
import { Testimonials } from "@/components/landing/Testimonials";
import { FaqSection } from "@/components/landing/FaqSection";
import { ContactSection } from "@/components/landing/ContactSection";
import { db } from "@/lib/prisma";
import { CustomThemeStyle } from "@/components/providers/CustomThemeStyle";

import { auth } from "@/auth";

export default async function RootLandingPage() {
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
    <div className="flex flex-col min-h-screen font-sans bg-background selection:bg-primary/30">
      <CustomThemeStyle primaryColor={settings.primaryColor || undefined} accentColor={settings.accentColor || undefined} />
      <LandingNavbar settings={settings} user={session?.user} isHome={true} />

      <main className="flex-1 w-full flex flex-col">
        {isSectionActive("hero") && <HeroSection data={getSectionData("hero")} />}
        
        {isSectionActive("quick-links") && <QuickLinksSection data={getSectionData("quick-links")} />}

        {isSectionActive("about") && <AboutSection data={getSectionData("about")} />}

        {isSectionActive("why-choose-us") && <WhyChooseUs data={getSectionData("why-choose-us")} />}
        
        {isSectionActive("achievements") && <Achievements data={getSectionData("achievements")} />}

        {isSectionActive("partners") && <PartnersMarquee data={getSectionData("partners")} />}

        {isSectionActive("testimonials") && <div id="testimonials"><Testimonials data={getSectionData("testimonials")} /></div>}

        {isSectionActive("faq") && <div id="faq"><FaqSection data={getSectionData("faq")} /></div>}
        
        {isSectionActive("contact") && <ContactSection data={getSectionData("contact")} settings={settings} />}
      </main>

      <MainFooter settings={settings} />
    </div>
  );
}
