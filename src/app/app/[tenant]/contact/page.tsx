import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { WorkspaceNavbar } from "@/components/layout/WorkspaceNavbar";
import { WorkspaceFooter } from "@/components/layout/WorkspaceFooter";
import { WorkspacePageHeader } from "@/components/layout/WorkspacePageHeader";
import { CustomThemeStyle } from "@/components/providers/CustomThemeStyle";
import { WorkspaceContact } from "@/components/landing/WorkspaceContact";
import { WorkspaceFaq } from "@/components/landing/WorkspaceFaq";
import { auth } from "@/auth";

export default async function WorkspaceContactPage({
  params
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;

  const workspace = await db.workspace.findUnique({
    where: { subdomain: tenant },
    include: {
      siteSettings: {
        include: {
          sections: true
        }
      }
    }
  });

  if (!workspace || !workspace.siteSettings) notFound();

  const session = await auth();
  
  // Find the contact and faq sections
  const contactSection = workspace.siteSettings.sections.find(s => s.type === "contact");
  const faqSection = workspace.siteSettings.sections.find(s => s.type === "faq");

  return (
    <div className="flex flex-col min-h-screen font-sans bg-background selection:bg-primary/30">
      <CustomThemeStyle 
        primaryColor={workspace.siteSettings.primaryColor || undefined} 
        accentColor={workspace.siteSettings.accentColor || undefined} 
        fontFamily={workspace.siteSettings.fontFamily || undefined} 
      />
      
      <WorkspaceNavbar settings={workspace.siteSettings} user={session?.user} />

      <main className="flex-1 w-full">
        <WorkspacePageHeader 
          title="Contact Us"
          description={contactSection?.subtitle || "We're here to help you. Reach out to us for admissions, support, or any other queries."}
          bgImage={workspace.siteSettings.pageHeaderBanner || "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?q=80&w=2070"}
          statusTitle="ONLINE"
          statusSub="24/7 Support"
          breadcrumbs={[
            { name: "Contact", href: "/contact" }
          ]}
        />

        <WorkspaceContact 
          data={contactSection} 
          settings={workspace.siteSettings} 
        />

        <div className="py-24 bg-slate-50 dark:bg-slate-900/20">
           <WorkspaceFaq data={faqSection} />
        </div>
      </main>

      <WorkspaceFooter settings={workspace.siteSettings} />
    </div>
  );
}
