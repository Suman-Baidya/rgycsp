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

export default function RootLandingPage() {
  return (
    <div className="flex flex-col min-h-screen font-sans bg-background selection:bg-primary/30">
      <LandingNavbar />

      <main className="flex-1 w-full flex flex-col">

        <HeroSection />

        <AboutSection />

        {/* Adds natural spacing and borders between disparate layout styles */}
        <WhyChooseUs />
        <Achievements />

        {/* Marquee acts as a seamless visual divider */}
        <PartnersMarquee />

        <Testimonials />

        <FaqSection />
        <ContactSection />
      </main>

      <LandingFooter />
    </div>
  );
}
