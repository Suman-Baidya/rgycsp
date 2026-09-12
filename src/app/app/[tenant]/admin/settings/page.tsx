import { db } from "@/lib/prisma";
import { WorkspaceSettingsForm } from "./WorkspaceSettingsForm";
import { redirect } from "next/navigation";
import { getServerTenantLink } from "@/lib/routing-server";
import { AdminPageHeader } from "@/components/layout/AdminPageHeader";

export default async function WorkspaceSettingsPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params;

  const workspace = await db.workspace.findUnique({
    where: { subdomain: tenant?.toLowerCase() }
  });

  if (!workspace) {
    const rootRedirect = await getServerTenantLink("/", tenant);
    redirect(rootRedirect);
  }

  let siteSettings = await db.siteSettings.findFirst({
    where: { workspaceId: workspace.id },
    include: {
      sections: {
        orderBy: { order: "asc" }
      },
      workspace: {
        include: {
          events: {
            orderBy: { date: 'desc' }
          },
          galleryItems: {
            orderBy: { createdAt: 'desc' }
          }
        }
      }
    }
  });

  if (!siteSettings) {
    // If not found, create a default one on the fly (Phase 4 Auto-initialization)
    siteSettings = await db.siteSettings.create({
      data: {
        workspaceId: workspace.id,
        siteName: workspace.name,
        primaryColor: "#4f46e5",
        accentColor: "#10b981",
        navigation: [
          { name: "Home", href: "/", id: "home", isActive: true },
          { name: "About", href: "/about", id: "about", isActive: true },
          { name: "Courses", href: "/courses", id: "courses", isActive: true },
          { name: "Learners", href: "/learners", id: "learners", isActive: true },
          { name: "Notice", href: "/notice", id: "notice", isActive: true },
          { name: "Events", href: "/events", id: "events", isActive: true },
          { name: "Franchise", href: "/franchise", id: "franchise", isActive: true },
          { name: "Contact", href: "/contact", id: "contact", isActive: true },
        ],
        navbarConfig: {
          showNavbar: true,
          showTopBar: true,
          showMenus: true,
          ctaPrimary: { text: "Login", link: "/login" },
        }
      },
      include: {
        sections: true,
        workspace: {
          include: {
            events: true,
            galleryItems: true
          }
        }
      }
    });

    const { syncAllSections } = await import("@/app/actions/site-settings");
    const types = ['hero', 'about', 'counters', 'courses', 'why-choose-us', 'achievements', 'partners', 'events', 'testimonials', 'faq', 'contact'];
    await syncAllSections(siteSettings.id, types, true);

    siteSettings = await db.siteSettings.findFirst({
      where: { workspaceId: workspace.id },
      include: {
        sections: {
          orderBy: { order: "asc" }
        },
        workspace: {
          include: {
            events: {
              orderBy: { date: 'desc' }
            },
            galleryItems: {
              orderBy: { createdAt: 'desc' }
            }
          }
        }
      }
    });
  }

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 w-full mx-auto">
      <AdminPageHeader 
        title="Landing Page & Website Settings" 
        description="Configure your franchise public landing page sections, navigation menu, branding, events, and notices."
      />

      <WorkspaceSettingsForm settings={siteSettings} />
    </div>
  );
}
