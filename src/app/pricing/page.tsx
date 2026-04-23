import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { LandingFooter } from "@/components/layout/LandingFooter";
import { PageHeader } from "@/components/layout/PageHeader";
import { PricingSection } from "@/components/landing/PricingSection";
import { CustomSolution } from "@/components/landing/CustomSolution";
import { Testimonials } from "@/components/landing/Testimonials";

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <LandingNavbar />

      <main className="flex-1 bg-background">
        <PageHeader
          title="Pricing Plans"
          subtitle="Transparent, flexible pricing designed to scale with your institute's growth."
          bgImage="https://cdn.pixabay.com/photo/2019/09/27/17/02/rupee-4508945_1280.jpg"
          breadcrumb="Pricing"
        />

        <PricingSection />
        <CustomSolution />
        <Testimonials />

      </main>

      <LandingFooter />
    </div>
  );
}
