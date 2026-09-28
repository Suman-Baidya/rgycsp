import { getStudentProfile, getStudentDashboardData } from "@/app/actions/student";
import { getWorkspaceByTenant } from "@/lib/workspace";
import StudentDashboardClient from "@/components/student/StudentDashboardClient";
import { redirect } from "next/navigation";
import { getServerTenantLink } from "@/lib/routing-server";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/prisma";

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
  const centerRawNotices: any[] = (aboutSection?.content as any)?.notices || [];

  const now = new Date();
  // Filter workspace center notices: strictly exclude internal STAFF notices and future scheduled notices
  const visibleCenterNotices = centerRawNotices.filter((n: any) => {
    if (n.audience === "STAFF") return false;
    if (n.status === "SCHEDULED" || (n.scheduledFor && new Date(n.scheduledFor) > now)) return false;
    return true;
  });

  // Also include Super Admin student broadcast notices
  const saBroadcastNotices = await db.notification.findMany({
    where: {
      type: { in: ["CIRCULAR", "NOTICE", "EVENT", "WARNING"] },
      status: "PUBLISHED",
      workspaceId: null,
      userId: null,
      targetAudience: { in: ["STUDENTS", "ALL", "PUBLIC"] },
      OR: [
        { scheduledFor: null },
        { scheduledFor: { lte: now } },
      ],
      NOT: {
        targetAudience: { in: ["ALL_FRANCHISES", "SPECIFIC_FRANCHISE", "STAFF"] },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const saMapped = saBroadcastNotices.map((n) => ({
    id: n.id,
    title: n.title,
    message: n.message,
    description: n.message,
    date: n.createdAt.toISOString().split("T")[0],
    category: n.category || (n.type === "CIRCULAR" ? "Academic" : "General"),
    priority: n.priority?.toLowerCase() || "normal",
    publishedBy: "Head Office",
    isHeadOffice: true,
    refNo: n.refNo || null,
    link: n.link || "",
  }));

  const seenDashboardKeys = new Set<string>();
  const combinedDashboardNotices: any[] = [];
  for (const n of visibleCenterNotices) {
    const k = n.refNo ? `ref:${n.refNo.trim().toUpperCase()}` : (n.id || n.title);
    if (!seenDashboardKeys.has(k)) {
      seenDashboardKeys.add(k);
      combinedDashboardNotices.push({
        ...n,
        description: n.message || n.description,
      });
    }
  }
  for (const n of saMapped) {
    const k = n.refNo ? `ref:${n.refNo.trim().toUpperCase()}` : (n.id || n.title);
    if (!seenDashboardKeys.has(k)) {
      seenDashboardKeys.add(k);
      combinedDashboardNotices.push(n);
    }
  }

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
      notices={combinedDashboardNotices}
      dashboardData={dashboardData}
      workspace={workspace}
    />
  );
}
