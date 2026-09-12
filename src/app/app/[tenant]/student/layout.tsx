import { auth } from "@/auth";
import Link from "next/link";
import { StudentSidebar } from "@/components/layout/StudentSidebar";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import { CustomThemeStyle } from "@/components/providers/CustomThemeStyle";
import { getServerTenantLink, getServerWorkspaceBase } from "@/lib/routing-server";
import { StudentHeader } from "@/components/layout/StudentHeader";
import { QuickActionFAB } from "@/components/dashboard/QuickActionFAB";
import { cookies } from "next/headers";

export default async function StudentLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}) {
  console.log(">>> [DEBUG] REACHED StudentLayout");
  const session = await auth();
  const { tenant } = await params;
  console.log(">>> [DEBUG] StudentLayout tenant:", tenant, "session user:", session?.user?.email || session?.user?.name || "NONE");

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
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden pb-24 lg:pb-0">
        <StudentHeader
          tenantName={workspace.name}
          tenant={tenant}
          workspaceBase={workspaceBase}
          userName={userName}
          userImage={session.user.image}
          currentCourseName={currentCourseName}
          enrollmentNo={studentProfile?.enrollmentNo}
          registrationNo={studentProfile?.registrationNo}
          workspaceId={workspace.id}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-6 custom-scrollbar bg-slate-50/50 dark:bg-transparent">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
      <QuickActionFAB portal="student" tenant={tenant} workspaceBase={workspaceBase} />
    </div>
    </>
  );
}
