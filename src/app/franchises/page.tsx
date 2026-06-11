import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { MainFooter } from "@/components/layout/MainFooter";
import { PageHeader } from "@/components/layout/PageHeader";
import { db } from "@/lib/prisma";
import { auth } from "@/auth";
import { FranchisePageClient } from "./FranchisePageClient";

export default async function FranchisesPage() {
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

  const isSectionActive = (type: string) => {
    return settings.sections.find(s => s.type === type)?.isActive ?? true;
  };

  const getSectionData = (type: string) => {
    return settings.sections.find(s => s.type === type);
  };

  // Fetch workspaces representing active franchise centers
  const franchises = await db.workspace.findMany({
    where: { isActive: true },
    include: { siteSettings: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <LandingNavbar settings={settings} user={session?.user} />

      <main className="flex-1">
        {isSectionActive("page-header-franchises") && (
          <PageHeader
            data={getSectionData("page-header-franchises")}
            title="Franchise Network"
            subtitle="Verify active centers, track registration status, or apply online to scale your education program."
            bgImage="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069"
            breadcrumb="Franchises"
          />
        )}

        <FranchisePageClient 
          settings={settings}
          initialWorkspaces={franchises}
        />
      </main>

      <MainFooter settings={settings} />
    </div>
  );
}
