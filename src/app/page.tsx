import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { MainFooter } from "@/components/layout/MainFooter";
import { HeroSection } from "@/components/landing/HeroSection";
import dynamic from "next/dynamic";

const QuickLinksSection = dynamic(() => import("@/components/landing/QuickLinksSection").then(mod => mod.QuickLinksSection));
const AboutSection = dynamic(() => import("@/components/landing/AboutSection").then(mod => mod.AboutSection));
const WhyChooseUs = dynamic(() => import("@/components/landing/WhyChooseUs").then(mod => mod.WhyChooseUs));
const Achievements = dynamic(() => import("@/components/landing/Achievements").then(mod => mod.Achievements));
const PartnersMarquee = dynamic(() => import("@/components/landing/PartnersMarquee").then(mod => mod.PartnersMarquee));
const Testimonials = dynamic(() => import("@/components/landing/Testimonials").then(mod => mod.Testimonials));
const FaqSection = dynamic(() => import("@/components/landing/FaqSection").then(mod => mod.FaqSection));
const ContactSection = dynamic(() => import("@/components/landing/ContactSection").then(mod => mod.ContactSection));
const CoursesSection = dynamic(() => import("@/components/landing/CoursesSection").then(mod => mod.CoursesSection));
const FloatingWhatsApp = dynamic(() => import("@/components/landing/FloatingWhatsApp").then(mod => mod.FloatingWhatsApp));

import { db } from "@/lib/prisma";
import { CustomThemeStyle } from "@/components/providers/CustomThemeStyle";
import { GlobalPremiumBackground } from "@/components/layout/GlobalPremiumBackground";

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
    <div className="flex flex-col min-h-screen font-sans bg-transparent selection:bg-primary/30 relative">
      <GlobalPremiumBackground />
      <CustomThemeStyle primaryColor={settings.primaryColor || undefined} accentColor={settings.accentColor || undefined} />
      <LandingNavbar settings={settings} user={session?.user} isHome={true} />

      <main className="flex-1 w-full flex flex-col">
        {isSectionActive("hero") && <HeroSection data={getSectionData("hero")} />}
        
        {isSectionActive("quick-links") && <QuickLinksSection data={getSectionData("quick-links")} />}

        {isSectionActive("courses") && <CoursesSection data={getSectionData("courses")} />}

        {isSectionActive("about") && <AboutSection data={getSectionData("about")} />}

        {isSectionActive("why-choose-us") && <WhyChooseUs data={getSectionData("why-choose-us")} />}
        
        {isSectionActive("achievements") && <Achievements data={getSectionData("achievements")} />}

        {isSectionActive("partners") && <PartnersMarquee data={getSectionData("partners")} />}

        {isSectionActive("testimonials") && <div id="testimonials"><Testimonials data={getSectionData("testimonials")} /></div>}

        {isSectionActive("faq") && <div id="faq"><FaqSection data={getSectionData("faq")} /></div>}
        
        {isSectionActive("contact") && <ContactSection data={getSectionData("contact")} settings={settings} />}
      </main>

      <FloatingWhatsApp phoneNumber={settings.whatsapp} />
      <MainFooter settings={settings} />
    </div>
  );
}
