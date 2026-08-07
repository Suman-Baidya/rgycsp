import { auth } from "@/auth";
import Link from "next/link";
import { StudentSidebar } from "@/components/layout/StudentSidebar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { StudentBreadcrumbs } from "@/components/student/StudentBreadcrumbs";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import { CustomThemeStyle } from "@/components/providers/CustomThemeStyle";
import { getServerTenantLink, getServerWorkspaceBase } from "@/lib/routing-server";

import { cookies } from "next/headers";

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
    const loginUrl = await getServerTenantLink("/login", tenant);
    const callbackUrl = await getServerTenantLink("/student/dashboard", tenant);
    redirect(`${loginUrl}?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  const workspace = await db.workspace.findUnique({
    where: { subdomain: tenant?.toLowerCase() },
    include: { siteSettings: true }
  });

  if (!workspace) {
    const target = await getServerTenantLink("/", tenant);
    redirect(target);
  }

  const studentProfile = await db.studentProfile.findFirst({
    where: { userId: session.user.id, workspaceId: workspace.id },
    include: { course: true, batch: { include: { course: true } } }
  });
  
  const currentCourseName = studentProfile?.course?.title || studentProfile?.batch?.course?.title || "Enrolled Learner";

  const homeHref = await getServerTenantLink("/", tenant);
  const workspaceBase = await getServerWorkspaceBase(tenant);
  const impersonatedUserName = (await cookies()).get("impersonated_user_name")?.value;
  const userName = impersonatedUserName || session.user.name || "Student";

  return (
    <>
    <div className="flex h-screen overflow-hidden bg-background text-foreground transition-colors duration-300">
      <CustomThemeStyle 
        primaryColor={workspace.siteSettings?.primaryColor || undefined} 
        accentColor={workspace.siteSettings?.accentColor || undefined} 
        fontFamily={workspace.siteSettings?.fontFamily || undefined}
      />
      
      <StudentSidebar tenant={tenant} workspaceBase={workspaceBase} />
      <MobileBottomNav tenant={tenant} />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden pb-24 lg:pb-0">
        <header className="h-16 border-b border-border/40 bg-background/80 backdrop-blur-md flex items-center px-4 lg:px-8 sticky top-0 z-40 transition-all duration-300">
          {/* Left side: Navigation / Breadcrumbs */}
          <div className="flex-1 flex items-center gap-2">
            <div className="lg:hidden ml-12" /> {/* Spacer for mobile sidebar toggle */}
            <div className="flex items-center text-sm font-medium">
              <span className="text-muted-foreground capitalize hidden sm:inline-block">
                {workspace.name}
              </span>
              <span className="text-muted-foreground mx-2 hidden sm:inline-block">/</span>
              <span className="text-foreground tracking-tight font-semibold capitalize">
                Student Portal
              </span>
            </div>
          </div>
          
          {/* Right side: Course, Profile, Theme */}
          <div className="flex items-center gap-4 sm:gap-6 ml-auto">
            
            {/* Course Display */}
            <div className="hidden sm:flex flex-col items-end border-r border-border/50 pr-4 sm:pr-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground leading-none mb-1">
                Current Course
              </span>
              <span className="text-xs font-semibold text-primary leading-none">
                {currentCourseName}
              </span>
            </div>

            {/* Profile Section */}
            <div className="flex items-center gap-3 group cursor-pointer hover:opacity-80 transition-opacity pl-2 sm:pl-0 border-r border-border/50 pr-4 sm:pr-6">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-bold text-foreground leading-none mb-1 uppercase">
                  {userName}
                </span>
                <span className="text-xs font-medium uppercase text-muted-foreground leading-none">
                  {studentProfile?.enrollmentNo || "Student"}
                </span>
              </div>
              
              <div className="h-9 w-9 rounded-full bg-primary/10 border-2 border-background shadow-sm group-hover:ring-2 group-hover:ring-primary/20 transition-all flex items-center justify-center text-xs font-bold text-primary">
                {userName.substring(0, 2).toUpperCase()}
              </div>
            </div>

            {/* Theme Toggle */}
            <div className="flex items-center">
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50 dark:bg-transparent">
          {children}
        </main>
      </div>
    </div>
    </>
  );
}
