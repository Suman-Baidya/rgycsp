import { db } from "@/lib/prisma";
import { LoginForm } from "@/components/auth/LoginForm";
import { CustomThemeStyle } from "@/components/providers/CustomThemeStyle";
import { redirect } from "next/navigation";
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

  if (!workspace) redirect("/");

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-zinc-950 p-4 md:p-6 relative overflow-hidden">
      {/* Dynamic Background Gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[100px] animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>
      
      {workspace.siteSettings && (
        <CustomThemeStyle 
          primaryColor={workspace.siteSettings.primaryColor || undefined}
          accentColor={workspace.siteSettings.accentColor || undefined}
          fontFamily={workspace.siteSettings.fontFamily || undefined}
        />
      )}

      <div className="relative z-10 w-full flex justify-center items-center">
        <LoginForm 
          tenantName={workspace.name}
          tenantLogo={workspace.logoUrl || workspace.siteSettings?.logoUrl}
          primaryColor={workspace.siteSettings?.primaryColor}
          tenantSlug={tenant}
        />
      </div>
    </div>
  );
}
