import { auth } from "@/auth";
import Link from "next/link";
import { StudentSidebar } from "@/components/layout/StudentSidebar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import { CustomThemeStyle } from "@/components/providers/CustomThemeStyle";

export default async function StudentLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}) {
  const session = await auth();
  const { tenant } = await params;

  if (!session) {
    redirect(`/login?callbackUrl=/student/dashboard`);
  }

  const workspace = await db.workspace.findUnique({
    where: { subdomain: tenant },
    include: { siteSettings: true }
  });

  if (!workspace) redirect("/");

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
      <CustomThemeStyle 
        primaryColor={workspace.siteSettings?.primaryColor || undefined} 
        accentColor={workspace.siteSettings?.accentColor || undefined} 
        fontFamily={workspace.siteSettings?.fontFamily || undefined}
      />
      
      <StudentSidebar tenant={tenant} />
      <MobileBottomNav tenant={tenant} />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden pb-24 lg:pb-0">
        <header className="h-20 border-b border-border/40 bg-background/50 backdrop-blur-md flex items-center px-4 lg:px-8 sticky top-0 z-40">
          <div className="lg:hidden ml-4 font-bold tracking-tight text-lg text-foreground truncate max-w-[200px]">
            {workspace.name}
          </div>
          <div className="hidden lg:flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">Workspace Home</Link>
            <span className="opacity-30">/</span>
            <span className="text-foreground">Student Portal</span>
          </div>
          
          <div className="ml-auto flex items-center gap-6">
            <ThemeToggle />
            <div className="flex items-center gap-3 pl-6 border-l border-border">
               <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-foreground">{session.user.name}</p>
                  <p className="text-[8px] font-bold text-primary uppercase tracking-wider opacity-70">Enrolled Learner</p>
               </div>
               <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary shadow-inner">
                  {session.user.name?.charAt(0)}
               </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50 dark:bg-transparent">
          {children}
        </main>
      </div>
    </div>
  );
}
