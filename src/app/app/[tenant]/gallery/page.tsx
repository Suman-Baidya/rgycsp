import { db } from "@/lib/prisma";
import { GalleryList } from "./GalleryList";
import { WorkspacePageHeader } from "@/components/layout/WorkspacePageHeader";
import { LandingFooter } from "@/components/layout/LandingFooter";
import { CustomThemeStyle } from "@/components/providers/CustomThemeStyle";
import { WorkspaceNavbar } from "@/components/layout/WorkspaceNavbar";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function GalleryPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params;
  const session = await auth();

  const workspace = await db.workspace.findUnique({
    where: { subdomain: tenant },
    include: {
      siteSettings: true,
      galleryItems: {
        where: { isActive: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!workspace || !workspace.siteSettings) {
    redirect("/");
  }

  // Pre-defined categories for initial filter buttons
  const galleryItems = workspace.galleryItems || [];
  const categories = Array.from(new Set(galleryItems.map(item => item.category).filter(Boolean)));

  return (
    <div className="flex flex-col min-h-screen font-sans bg-background">
      <CustomThemeStyle 
        primaryColor={workspace.siteSettings.primaryColor || undefined} 
        accentColor={workspace.siteSettings.accentColor || undefined}
        fontFamily={workspace.siteSettings.fontFamily || undefined}
      />
      
      <WorkspaceNavbar settings={workspace.siteSettings} user={session?.user} />

      <main className="flex-1 w-full">
        <WorkspacePageHeader 
          title="Gallery"
          description="A visual journey through our campus life, events, and achievements."
          bgImage={workspace.siteSettings.pageHeaderBanner || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070"}
          breadcrumbs={[
            { name: "Gallery", href: "/gallery" }
          ]}
        />

        <div className="max-w-7xl mx-auto px-6 py-24">
          <GalleryList 
            initialItems={galleryItems as any[]} 
            categories={categories as string[]} 
          />
        </div>
      </main>

      <LandingFooter settings={workspace.siteSettings} />
    </div>
  );
}
