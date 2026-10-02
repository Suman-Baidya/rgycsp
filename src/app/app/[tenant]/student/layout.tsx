import { findWorkspaceByTenant } from "@/lib/workspace";
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
  const session = await auth();
  const { tenant } = await params;

  if (!session) {
    const loginUrl = await getServerTenantLink("/login", tenant);
    const callbackUrl = await getServerTenantLink("/student/dashboard", tenant);
    redirect(`${loginUrl}?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  const workspace = await findWorkspaceByTenant(tenant, { 
    include: { siteSettings: true }
  });

  if (!workspace) {
    const target = await getServerTenantLink("/", tenant);
    redirect(target);
  }

  const cookieStore = await cookies();
  const selectedProfileId = cookieStore.get("active_student_profile_id")?.value;
  const impersonatedProfileId = cookieStore.get("impersonated_profile_id")?.value;
  const effectiveProfileId = impersonatedProfileId || selectedProfileId;

  const allProfiles = await db.studentProfile.findMany({
    where: { userId: session.user.id, workspaceId: workspace.id },
    include: { course: true, batch: { include: { course: true } } },
    orderBy: { createdAt: "desc" }
  });

  // Filter ONLY active courses (Rule: no passed-out course in top dropdown)
  const activeProfiles = allProfiles.filter(p => p.status !== "PASS_OUT" && p.status !== "SUSPENDED");

  let currentProfile = null;
  if (effectiveProfileId) {
    currentProfile = allProfiles.find(p => p.id === effectiveProfileId) || null;
  }
  if (!currentProfile) {
    currentProfile = activeProfiles.find(p => p.status === "REGISTERED") ||
                     activeProfiles.find(p => p.status === "UNREGISTERED") ||
                     activeProfiles[0] ||
                     allProfiles[0] || null;
  }

  const currentCourseName = currentProfile?.course?.title || currentProfile?.batch?.course?.title || "Enrolled Learner";

  const activeCoursesList = activeProfiles.map(p => ({
    id: p.id,
    courseTitle: p.course?.title || p.batch?.course?.title || "Course",
    registrationNo: p.registrationNo,
    enrollmentNo: p.enrollmentNo,
    status: p.status,
    batchName: p.batch?.name || null
  }));

  const workspaceBase = await getServerWorkspaceBase(tenant);
  const impersonatedUserName = cookieStore.get("impersonated_user_name")?.value;
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
          enrollmentNo={currentProfile?.enrollmentNo}
          registrationNo={currentProfile?.registrationNo}
          workspaceId={workspace.id}
          activeCourses={activeCoursesList}
          currentProfileId={currentProfile?.id}
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
