import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/auth";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ tenant: string }> }): Promise<Metadata> {
  const { tenant } = await params;
  
  const workspace = await db.workspace.findUnique({
    where: { subdomain: tenant?.toLowerCase() },
    include: { siteSettings: true }
  });

  if (!workspace || !workspace.siteSettings) {
    return {};
  }

  const siteName = workspace.siteSettings.siteName || workspace.name;
  const desc = workspace.siteSettings.brandDescription || `${siteName} Educational Portal`;
  const iconUrl = workspace.siteSettings.faviconUrl || workspace.siteSettings.logoUrl || "https://res.cloudinary.com/dmhipemqk/image/upload/v1780409947/RGYCSP/SuperAdmin/branding/mjwcqjcyprkxpyleggms.webp";

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
      icon: iconUrl
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
  const workspace = await db.workspace.findUnique({
    where: { subdomain: tenant?.toLowerCase() }
  });

  if (!workspace || !workspace.isActive) {
    notFound();
  }

  const reqHeaders = await headers();
  const isSubdomain = reqHeaders.get("x-is-subdomain") === "true";
  const session = await auth();
  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";

  if (isSubdomain && !workspace.isSubdomainEnabled && !isSuperAdmin) {
    notFound();
  }

  return (
    <div className="min-h-screen w-full font-sans bg-background text-foreground">
      {/* Pass workspace data down via props or contexts later */}
      {children}
    </div>
  );
}
