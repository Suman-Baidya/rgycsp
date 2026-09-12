import { getStudentProfile, getStudentDashboardData } from "@/app/actions/student";
import { getWorkspaceByTenant } from "@/lib/workspace";
import StudentDashboardClient from "@/components/student/StudentDashboardClient";
import { redirect } from "next/navigation";
import { getServerTenantLink } from "@/lib/routing-server";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Link from "next/link";

export default async function StudentDashboardPage({
  params,
  searchParams
}: {
  params: Promise<{ tenant: string }>;
  searchParams: Promise<{ studentId?: string }>;
}) {
  const { tenant } = await params;
  const { studentId } = await searchParams;
  const workspace = await getWorkspaceByTenant(tenant);
  
  if (!workspace) redirect(await getServerTenantLink("/", tenant));

  const [result, homeHref] = await Promise.all([
    getStudentProfile(workspace.id, studentId),
    getServerTenantLink("/", tenant)
  ]);

  if (!result.success) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 min-h-[calc(100vh-80px)]">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm text-center space-y-5 border border-slate-200/80 dark:border-slate-800">
           <div className="w-14 h-14 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-xl flex items-center justify-center mx-auto">
              <LogOut className="w-7 h-7" />
           </div>
           <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Access Restricted</h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium leading-relaxed">We couldn't find an active student profile for your account in this workspace.</p>
           </div>
           <div className="pt-2 flex flex-col gap-2">
              <Link href={homeHref} className="w-full">
                 <Button variant="outline" className="w-full h-9 rounded-lg text-xs font-semibold">Return to Website</Button>
              </Link>
           </div>
        </div>
      </div>
    );
  }

  const workspaceSettings = workspace.siteSettings as any;
  const aboutSection = workspaceSettings?.sections?.find((s: any) => s.type === "about");
  const notices = (aboutSection?.content as any)?.notices || [];

  const studentProfileId = result.data?.studentProfile?.id;
  const courseId = result.data?.studentProfile?.courseId || result.data?.studentProfile?.batch?.courseId || result.data?.studentProfile?.batch?.course?.id;
  let dashboardData = null;
  if (studentProfileId) {
    const dashResult = await getStudentDashboardData(workspace.id, studentProfileId, courseId);
    if (dashResult.success) {
      dashboardData = dashResult.data;
    }
  }

  return (
    <StudentDashboardClient 
      student={result.data!} 
      tenant={tenant} 
      settings={workspaceSettings} 
      notices={notices}
      dashboardData={dashboardData}
      workspace={workspace}
    />
  );
}
