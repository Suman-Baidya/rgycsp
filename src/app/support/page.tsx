import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { LandingFooter } from "@/components/layout/LandingFooter";
import { PageHeader } from "@/components/layout/PageHeader";
import { ContactSection } from "@/components/landing/ContactSection";
import { FaqSection } from "@/components/landing/FaqSection";

export default function SupportPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <LandingNavbar />
      
      <main className="flex-1">
        <PageHeader 
          title="Support Center"
          subtitle="Our dedicated team is here to ensure your institution's digital journey is smooth and successful."
          bgImage="https://cdn.pixabay.com/photo/2026/02/09/09/10/mv-fotos-woman-10113152_1280.png"
          breadcrumb="Support"
        />

        <div className="bg-zinc-50 dark:bg-transparent">
          <ContactSection />
        </div>
        
        <FaqSection />
      </main>

      <LandingFooter />
    </div>
  );
}
