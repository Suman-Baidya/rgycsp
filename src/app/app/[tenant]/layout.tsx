import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/auth";
import type { Metadata } from "next";
import { getWorkspaceByTenant } from "@/lib/workspace";
import { isDeveloperEmail } from "@/lib/developer";
import { getCachedGlobalSettings } from "@/lib/settings";

export async function generateMetadata({ params }: { params: Promise<{ tenant: string }> }): Promise<Metadata> {
  const { tenant } = await params;
  
  const [workspace, globalSettings] = await Promise.all([
    getWorkspaceByTenant(tenant),
    getCachedGlobalSettings().catch(() => null)
  ]);

  if (!workspace) {
    return {};
  }

  const siteName = workspace.siteSettings?.siteName || workspace.name;
  const desc = workspace.siteSettings?.brandDescription || `${siteName} Educational Portal`;

  // Default main landing page favicon/logo
  const mainDefaultFavicon = 
    globalSettings?.faviconUrl?.trim() || 
    globalSettings?.logoUrl?.trim() || 
    "https://res.cloudinary.com/dmhipemqk/image/upload/v1780409947/RGYCSP/SuperAdmin/branding/mjwcqjcyprkxpyleggms.webp";

  // If the franchise admin has provided their own logo (or custom favicon), use it.
  // Otherwise, default to the main landing page's favicon.
  const franchiseCustomIcon = 
    workspace.siteSettings?.logoUrl?.trim() || 
    workspace.siteSettings?.faviconUrl?.trim();

  const iconUrl = franchiseCustomIcon || mainDefaultFavicon;

  return {
    title: {
      template: `%s | ${siteName}`,
      default: siteName,
    },
    description: desc,
    openGraph: {
      title: siteName,
      description: desc,
      type: "website",
      siteName: siteName,
    },
    icons: {
      icon: iconUrl,
      shortcut: iconUrl,
      apple: iconUrl,
    }
  };
}

export default async function TenantLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  
  // Verify the tenant exists before rendering anything on this subdomain
  const workspace = await getWorkspaceByTenant(tenant);

  if (!workspace || !workspace.isActive) {
    notFound();
  }

  const reqHeaders = await headers();
  const isSubdomain = reqHeaders.get("x-is-subdomain") === "true";
  const session = await auth();
  const isSuperOrDev = 
    session?.user?.role === "SUPER_ADMIN" || 
    session?.user?.role === "SUPER_ADMIN_MANAGER" ||
    isDeveloperEmail(session?.user?.email) ||
    Boolean((session?.user as any)?.isDeveloper);

  const currentPath = reqHeaders.get("x-pathname") || "";
  const isPortalRoute = 
    currentPath.includes("/admin") || 
    currentPath.includes("/student") || 
    currentPath.includes("/login") || 
    currentPath.includes("/account-restricted");

  // Only public landing pages can be disabled by isSubdomainEnabled; portal routes are always accessible
  if (isSubdomain && !workspace.isSubdomainEnabled && !isSuperOrDev && !isPortalRoute) {
    notFound();
  }

  // Canonicalize subdirectory access: e.g. /app/WB-259/admin -> /app/chandpara/admin
  if (!isSubdomain && tenant.toLowerCase() !== workspace.subdomain.toLowerCase()) {
    const currentPath = reqHeaders.get("x-pathname") || `/app/${tenant}`;
    const targetPath = currentPath.replace(new RegExp(`^/app/${tenant}(/|$)`, 'i'), `/app/${workspace.subdomain}$1`);
    redirect(targetPath);
  }

  return (
    <div className="min-h-screen w-full font-sans bg-background text-foreground">
      {/* Pass workspace data down via props or contexts later */}
      {children}
    </div>
  );
}
