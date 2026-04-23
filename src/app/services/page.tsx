import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { LandingFooter } from "@/components/layout/LandingFooter";
import { PageHeader } from "@/components/layout/PageHeader";
import { WhyChooseUs } from "@/components/landing/WhyChooseUs";
import { ServicesSection } from "@/components/landing/ServicesSection";
import { ReadyToModernize } from "@/components/landing/ReadyToModernize";

export default function ServicesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <LandingNavbar />

      <main className="flex-1">
        <PageHeader
          title="Our Services"
          subtitle="Comprehensive digital solutions tailored for modern educational excellence."
          bgImage="https://cdn.pixabay.com/photo/2016/11/22/21/26/notebook-1850613_1280.jpg"
          breadcrumb="Services"
        />
        <ServicesSection />
        <WhyChooseUs />
        <ReadyToModernize />
      </main>

      <LandingFooter />
    </div>
  );
}


