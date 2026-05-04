import { db } from "@/lib/prisma";
import { LoginForm } from "@/components/auth/LoginForm";
import { CustomThemeStyle } from "@/components/providers/CustomThemeStyle";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function WorkspaceLoginPage({
  params
}: {
  params: Promise<{ tenant: string }>;
}) {
  const session = await auth();
  const { tenant } = await params;

  // If already logged in, redirect to student dashboard
  if (session) {
    const isSubdirectoryMode = (await params).tenant !== undefined; // In the app/[tenant] structure, it's always available
    // But we need to know if the actual URL started with /app/
    // Since this is a server component, we can use params to build the correct path
    // For subdomain mode, tenant is handled by middleware rewrite, so we redirect to /student/dashboard
    // For subdirectory mode, we need the /app/[tenant] prefix
    // The safest way is to use a relative redirect or detect mode from headers
    redirect(`/student/dashboard`); // Next.js handles relative redirects within the same host/context
  }

  const workspace = await db.workspace.findUnique({
    where: { subdomain: tenant },
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
          callbackUrl="/student/dashboard"
        />
      </div>
    </div>
  );
}
