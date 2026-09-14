import { db } from "@/lib/prisma";
import { LoginForm } from "@/components/auth/LoginForm";
import { CustomThemeStyle } from "@/components/providers/CustomThemeStyle";
import { redirect } from "next/navigation";
import { getServerTenantLink } from "@/lib/routing-server";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { getPostLoginRedirect } from "@/app/actions/auth";

export default async function WorkspaceLoginPage({
  params
}: {
  params: Promise<{ tenant: string }>;
}) {
  const session = await auth();
  const { tenant } = await params;

  // If already logged in, intelligently redirect based on role
  if (session) {
    const headersList = await headers();
    const host = headersList.get("host") || "";
    const pathname = headersList.get("x-pathname") || `/app/${tenant}/login`;
    const redirectUrl = await getPostLoginRedirect(host, pathname);
    redirect(redirectUrl);
  }

  const workspace = await db.workspace.findUnique({
    where: { subdomain: tenant?.toLowerCase() },
    include: { siteSettings: true }
  });

  if (!workspace) redirect(await getServerTenantLink("/", tenant));

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-slate-50/70 dark:bg-[#06080e] p-4 sm:p-6 relative overflow-y-auto transition-colors duration-300">
      {/* Dynamic Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[55%] h-[55%] rounded-full bg-primary/10 dark:bg-primary/15 blur-[130px] animate-pulse" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[45%] h-[45%] rounded-full bg-primary/5 dark:bg-primary/10 blur-[110px] animate-pulse" style={{ animationDelay: '3s' }} />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:36px_36px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>
      
      {workspace.siteSettings && (
        <CustomThemeStyle 
          primaryColor={workspace.siteSettings.primaryColor || undefined}
          accentColor={workspace.siteSettings.accentColor || undefined}
          fontFamily={workspace.siteSettings.fontFamily || undefined}
        />
      )}

      <div className="relative z-10 w-full my-auto flex justify-center items-center py-1 sm:py-0">
        <LoginForm 
          tenantName={workspace.name}
          tenantLogo={workspace.logoUrl || workspace.siteSettings?.logoUrl}
          primaryColor={workspace.siteSettings?.primaryColor}
          tenantSlug={tenant}
          variant="franchise"
          centerCode={workspace.centerCode}
        />
      </div>
    </div>
  );
}
