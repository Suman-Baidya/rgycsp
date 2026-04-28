import { db } from "@/lib/prisma";
import { SettingsForm } from "@/app/(admin)/super-admin/settings/SettingsForm";
import { redirect } from "next/navigation";

export default async function WorkspaceSettingsPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params;

  const workspace = await db.workspace.findUnique({
    where: { subdomain: tenant }
  });

  if (!workspace) {
    redirect("/");
  }

  let siteSettings = await db.siteSettings.findFirst({
    where: { workspaceId: workspace.id },
    include: {
      sections: {
        orderBy: { order: "asc" }
      },
      workspace: true
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
          { name: "Students", href: "/students", id: "students", isActive: true },
          { name: "Enquiry", href: "/enquiry", id: "enquiry", isActive: true },
          { name: "Gallery", href: "/gallery", id: "gallery", isActive: true },
          { name: "Events", href: "/events", id: "events", isActive: true },
          { name: "Guidance", href: "/guidance", id: "guidance", isActive: true },
          { name: "Notice", href: "/notice", id: "notice", isActive: true },
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
        workspace: true
      }
    });

    const { syncAllSections } = await import("@/app/actions/site-settings");
    const types = ['hero', 'about', 'why-choose-us', 'achievements', 'partners', 'our-message', 'mission', 'vision', 'services', 'guide-steps', 'guide-resources', 'ready-to-modernize', 'custom-solution', 'pricing', 'testimonials', 'faq', 'contact', 'page-header-about', 'page-header-services', 'page-header-guide', 'page-header-pricing', 'page-header-support', 'legal-privacy-policy', 'legal-terms-conditions', 'legal-cookie-policy', 'legal-refund-policy', 'legal-sitemap'];
    await syncAllSections(siteSettings.id, types, true);

    siteSettings = await db.siteSettings.findFirst({
      where: { workspaceId: workspace.id },
      include: {
        sections: {
          orderBy: { order: "asc" }
        },
        workspace: true
      }
    });
  }

  return (
    <div className="p-4 lg:p-10 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Landing Page Settings</h1>
        <p className="text-muted-foreground text-lg">
          Configure your institute's landing page content, branding, and visibility.
        </p>
      </div>

      <SettingsForm settings={siteSettings} isSuperAdmin={false} />
    </div>
  );
}
