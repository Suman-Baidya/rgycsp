import { findWorkspaceByTenant } from "@/lib/workspace";
import { GalleryList } from "./GalleryList";
import { WorkspacePageHeader } from "@/components/layout/WorkspacePageHeader";
import { WorkspaceFooter } from "@/components/layout/WorkspaceFooter";
import { CustomThemeStyle } from "@/components/providers/CustomThemeStyle";
import { WorkspaceNavbar } from "@/components/layout/WorkspaceNavbar";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getServerTenantLink } from "@/lib/routing-server";
import { DEFAULT_WORKSPACE_GALLERY } from "@/lib/workspace-defaults";

export default async function GalleryPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params;
  const session = await auth();

  const workspace = await findWorkspaceByTenant(tenant, { include: {
      siteSettings: true,
      galleryItems: {
        where: { isActive: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!workspace || !workspace.siteSettings) {
    redirect(await getServerTenantLink("/", tenant));
  }

  // Fallback to rich dummy gallery items when none are uploaded yet
  const galleryItems = (workspace.galleryItems && workspace.galleryItems.length > 0)
    ? workspace.galleryItems
    : DEFAULT_WORKSPACE_GALLERY;

  const categories = Array.from(new Set(galleryItems.map(item => item.category).filter(Boolean)));

  return (
    <div className="flex flex-col min-h-screen font-sans bg-background">
      <CustomThemeStyle 
        primaryColor={workspace.siteSettings.primaryColor || undefined} 
        accentColor={workspace.siteSettings.accentColor || undefined}
        fontFamily={workspace.siteSettings.fontFamily || undefined}
      />
      
      <WorkspaceNavbar settings={workspace.siteSettings} user={session?.user} tenant={tenant} />

      <main className="flex-1 w-full">
        <WorkspacePageHeader 
          title="Gallery"
          description="A visual journey through our campus life, events, and achievements."
          bgImage={workspace.siteSettings.pageHeaderBanner || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070"}
          breadcrumbs={[
            { name: "Gallery", href: "/gallery" }
          ]}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 w-full">
          <GalleryList 
            initialItems={galleryItems as any[]} 
            categories={categories as string[]} 
          />
        </div>
      </main>

      <WorkspaceFooter settings={workspace.siteSettings} tenant={tenant} user={session?.user} />
    </div>
  );
}
