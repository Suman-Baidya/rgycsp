import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { MainFooter } from "@/components/layout/MainFooter";
import { PageHeader } from "@/components/layout/PageHeader";
import { CustomThemeStyle } from "@/components/providers/CustomThemeStyle";
import { GlobalPremiumBackground } from "@/components/layout/GlobalPremiumBackground";
import { ContactSection } from "@/components/landing/ContactSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { db } from "@/lib/prisma";
import { auth } from "@/auth";

export const metadata = {
  title: "Support Center | ABCD Edu Hub",
  description: "Our dedicated team is here to ensure your institution's digital journey is smooth and successful.",
};

export default async function SupportPage() {
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
      <LandingNavbar settings={settings} user={session?.user} />
      
      <main className="flex-1 w-full">
        {isSectionActive("page-header-support") && (
          <PageHeader 
            data={getSectionData("page-header-support")}
            title="Support Center"
            subtitle="Our dedicated team is here to ensure your institution's digital journey is smooth, efficient, and successful."
            bgImage="https://cdn.pixabay.com/photo/2026/02/09/09/10/mv-fotos-woman-10113152_1280.png"
            breadcrumb="Support"
          />
        )}

        <div className="bg-transparent">
          {isSectionActive("contact") && <ContactSection data={getSectionData("contact")} settings={settings} />}
        </div>
        
        {isSectionActive("faq") && <FaqSection data={getSectionData("faq")} />}
      </main>

      <MainFooter settings={settings} />
    </div>
  );
}
