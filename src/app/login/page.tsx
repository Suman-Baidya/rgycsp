import { db } from "@/lib/prisma";
import { headers } from "next/headers";
import { LoginForm } from "@/components/auth/LoginForm";
import { CustomThemeStyle } from "@/components/providers/CustomThemeStyle";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getPostLoginRedirect } from "@/app/actions/auth";

export default async function LoginPage() {
  const session = await auth();
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const pathname = headersList.get("x-pathname") || "/login";
  
  const localDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
  
  // Detect tenant from subdomain
  let tenant = "";
  if (host.endsWith(`.${localDomain}`)) {
    tenant = host.replace(`.${localDomain}`, "").toLowerCase();
    if (tenant === "www") tenant = "";
  }

  // If already logged in, redirect to the appropriate dashboard
  if (session) {
    const redirectUrl = await getPostLoginRedirect(host, pathname);
    redirect(redirectUrl);
  }

  // Get Branding Information
  let branding = {
    name: "ABCD Educational Hub",
    logo: null,
    settings: null as any
  };

  if (tenant && tenant !== "super-admin") {
    const workspace = await db.workspace.findUnique({
      where: { subdomain: tenant },
      include: { siteSettings: true }
    });
    if (workspace) {
      branding.name = workspace.name;
      branding.logo = workspace.logoUrl || workspace.siteSettings?.logoUrl;
      branding.settings = workspace.siteSettings;
    }
  } else {
    // Global Site Branding
    const globalSettings = await db.siteSettings.findFirst({
      where: { workspaceId: null }
    });
    if (globalSettings) {
      branding.name = globalSettings.siteName || "ABCD HUB";
      branding.logo = globalSettings.logoUrl;
      branding.settings = globalSettings;
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white dark:bg-zinc-950 p-6 relative overflow-hidden font-sans">
      {/* Premium Background Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[100px] animate-pulse delay-700" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
        <div className="absolute inset-0 opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      <div className="relative z-10 w-full flex flex-col items-center justify-center">
        <CustomThemeStyle 
          primaryColor={branding.settings?.primaryColor || undefined}
          accentColor={branding.settings?.accentColor || undefined}
          fontFamily={branding.settings?.fontFamily || undefined}
        />

        <LoginForm 
          tenantName={branding.name}
          tenantLogo={branding.logo}
          isGlobal={!tenant || tenant === "super-admin"}
        />
      </div>
    </div>
  );
}
