import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { LandingFooter } from "@/components/layout/LandingFooter";
import { PageHeader } from "@/components/layout/PageHeader";
import { GuideSteps } from "@/components/landing/GuideSteps";
import { GuideResources } from "@/components/landing/GuideResources";

export default function GuidePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <LandingNavbar />

      <main className="flex-1">
        <PageHeader
          title="User Guide"
          subtitle="Everything you need to know about navigating and mastering the ABCD Edu Hub ecosystem."
          bgImage="https://cdn.pixabay.com/photo/2026/03/15/04/29/geralt-presentation-10174584_1280.jpg"
          breadcrumb="Guide"
        />

        <GuideSteps />
        <GuideResources />

      </main>

      <LandingFooter />
    </div>
  );
}
