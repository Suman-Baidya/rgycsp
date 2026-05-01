import { db } from "@/lib/prisma";
import { headers } from "next/headers";
import { LoginForm } from "@/components/auth/LoginForm";
import { CustomThemeStyle } from "@/components/providers/CustomThemeStyle";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function LoginPage() {
  const session = await auth();
  
  // If already logged in, redirect to dashboard or home
  if (session) {
    redirect("/");
  }

  const headersList = await headers();
  const host = headersList.get("host") || "";
  
  // Detect tenant from subdomain
  let tenant = "";
  const parts = host.split('.');
  if (parts.length >= 2 && !host.startsWith('localhost')) {
    tenant = parts[0];
  } else if (host.endsWith('.localhost:3000')) {
    tenant = host.replace('.localhost:3000', '');
  }

  // If no tenant detected from host, it's a global login
  let workspace = null;
  if (tenant) {
    workspace = await db.workspace.findUnique({
      where: { subdomain: tenant },
      include: { siteSettings: true }
    });
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-zinc-950 p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] rounded-full bg-primary/10 blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      {workspace && (
        <CustomThemeStyle 
          primaryColor={workspace.siteSettings?.primaryColor || undefined}
          accentColor={workspace.siteSettings?.accentColor || undefined}
          fontFamily={workspace.siteSettings?.fontFamily || undefined}
        />
      )}

      <LoginForm 
        tenantName={workspace?.name}
        tenantLogo={workspace?.logoUrl || workspace?.siteSettings?.logoUrl}
        primaryColor={workspace?.siteSettings?.primaryColor}
      />
    </div>
  );
}
