import { db } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/layout/AdminPageHeader";
import { AdminDashboardCharts } from "@/components/admin/AdminDashboardCharts";
import { isDeveloperEmail } from "@/lib/developer";
import { 
  GraduationCap, 
  BookOpen, 
  UserCheck, 
  Wallet, 
  Sparkles, 
  Plus, 
  ShieldAlert, 
  ShieldCheck, 
  BarChart3, 
  ExternalLink, 
  QrCode, 
  Receipt, 
  FileQuestion, 
  Palette, 
  ArrowRight,
  Clock,
  Building2,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { getServerTenantLink } from "@/lib/routing-server";
import { auth } from "@/auth";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { unstable_cache } from "next/cache";

function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const diffInMs = now.getTime() - new Date(date).getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return new Date(date).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

const getCachedWorkspaceWithCounts = unstable_cache(
  async (subdomain: string) => {
    return db.workspace.findUnique({
      where: { subdomain },
      include: {
        _count: {
          select: {
            studentProfiles: true,
            courses: true,
            batches: true,
            roles: true,
            admissionApps: true,
          }
        }
      }
    });
  },
  ['franchise-workspace-with-counts'],
  { revalidate: 30, tags: ['franchise-workspace'] }
);

const getCachedFranchiseDashboardMetrics = unstable_cache(
  async (workspaceId: string) => {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [
      pendingAdmissionsCount,
      unreviewedLeadsCount,
      thisMonthAdmissionsCount,
      lastMonthAdmissionsCount,
      recentApplications,
      coursesWithBatches,
      sixMonthAdmissions,
      recentStudents
    ] = await Promise.all([
      db.admissionApplication.count({
        where: { workspaceId, status: "PENDING" }
      }),
      db.visitorLead.count({
        where: { workspaceId, status: "NEW" }
      }),
      db.studentProfile.count({
        where: { workspaceId, admissionDate: { gte: thisMonthStart } }
      }),
      db.studentProfile.count({
        where: {
          workspaceId,
          admissionDate: { gte: lastMonthStart, lt: thisMonthStart }
        }
      }),
      db.admissionApplication.findMany({
        where: { workspaceId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          applicationNo: true,
          fullName: true,
          mobile: true,
          appliedCourse: true,
          status: true,
          createdAt: true,
          course: { select: { title: true } }
        }
      }),
      db.course.findMany({
        where: { workspaceId, isActive: true },
        select: {
          title: true,
          batches: {
            select: {
              _count: { select: { students: true } }
            }
          }
        }
      }),
      db.studentProfile.findMany({
        where: {
          workspaceId,
          admissionDate: { gte: sixMonthsAgo }
        },
        select: { admissionDate: true }
      }),
      db.studentProfile.findMany({
        where: { workspaceId },
        orderBy: { admissionDate: "desc" },
        take: 5,
        select: {
          id: true,
          fullName: true,
          enrollmentNo: true,
          admissionDate: true,
          status: true,
          course: { select: { title: true } }
        }
      })
    ]);

    return {
      pendingAdmissionsCount,
      unreviewedLeadsCount,
      thisMonthAdmissionsCount,
      lastMonthAdmissionsCount,
      recentApplications,
      coursesWithBatches,
      sixMonthAdmissions,
      recentStudents
    };
  },
  ['franchise-admin-metrics'],
  { revalidate: 30, tags: ['franchise-metrics'] }
);

export default async function WorkspaceAdminDashboard({
  params
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  
  const workspace = await getCachedWorkspaceWithCounts(tenant?.toLowerCase());

  if (!workspace) {
    throw new Error("Workspace not found");
  }

  // Get user session and permissions
  const session = await auth();
  let userRole = "UNAUTHORIZED";
  let userPermissions: string[] = [];
  
  if (
    session?.user?.role === "SUPER_ADMIN" || 
    session?.user?.role === "SUPER_ADMIN_MANAGER" || 
    isDeveloperEmail(session?.user?.email) ||
    !!session?.user?.isDeveloper
  ) {
    userRole = "ADMIN";
  } else if (session?.user) {
    const roleRecord = await db.workspaceRole.findFirst({
      where: { userId: session.user.id, workspaceId: workspace.id }
    });
    if (roleRecord) {
      userRole = roleRecord.role;
      try {
        if (Array.isArray(roleRecord.permissions)) userPermissions = roleRecord.permissions as string[];
        else if (typeof roleRecord.permissions === 'string') userPermissions = JSON.parse(roleRecord.permissions);
      } catch (e) {}
    }
  }

  const hasAccess = (page: string) => userRole === "ADMIN" || userPermissions.includes(page);

  // Dynamic cached data queries
  const {
    pendingAdmissionsCount,
    unreviewedLeadsCount,
    thisMonthAdmissionsCount,
    lastMonthAdmissionsCount,
    recentApplications,
    coursesWithBatches,
    sixMonthAdmissions,
    recentStudents
  } = await getCachedFranchiseDashboardMetrics(workspace.id);

  // If no online applications yet, fallback to recent student enrollments
  let recentPipelineItems: {
    id: string;
    name: string;
    subtext: string;
    badgeText: string;
    badgeStatus: "PENDING" | "APPROVED" | "REJECTED" | "ACTIVE";
    timeText: string;
  }[] = [];

  if (recentApplications.length > 0) {
    recentPipelineItems = recentApplications.map(app => ({
      id: app.id,
      name: app.fullName,
      subtext: app.course?.title || app.appliedCourse || "General Course",
      badgeText: app.status,
      badgeStatus: app.status as any,
      timeText: formatRelativeTime(app.createdAt)
    }));
  } else {
    recentPipelineItems = recentStudents.map(student => ({
      id: student.id,
      name: student.fullName,
      subtext: student.course?.title || `Roll: ${student.enrollmentNo}`,
      badgeText: student.status || "ENROLLED",
      badgeStatus: "APPROVED",
      timeText: formatRelativeTime(student.admissionDate)
    }));
  }

  // Calculate Month-over-Month growth rate
  const growthRate = lastMonthAdmissionsCount > 0
    ? Math.round(((thisMonthAdmissionsCount - lastMonthAdmissionsCount) / lastMonthAdmissionsCount) * 100)
    : (thisMonthAdmissionsCount > 0 ? 100 : 0);

  // Construct accurate 6-month historical admission trend
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const admissionTrend = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const targetYear = d.getFullYear();
    const targetMonth = d.getMonth();
    const count = sixMonthAdmissions.filter(s => {
      const adm = new Date(s.admissionDate);
      return adm.getFullYear() === targetYear && adm.getMonth() === targetMonth;
    }).length;
    return { name: monthNames[targetMonth], value: count };
  });

  // Calculate student distribution by course
  const coursesWithStudents = coursesWithBatches.map(c => ({
    name: c.title,
    value: c.batches.reduce((sum, b) => sum + (b._count?.students || 0), 0)
  })).filter(c => c.value > 0);

  const studentDistData = coursesWithStudents.length > 0 
    ? coursesWithStudents 
    : (workspace._count.studentProfiles > 0 
        ? [{ name: "General Enrolled", value: workspace._count.studentProfiles }] 
        : []);

  // Multi-tenant safe links adhering to AGENTS.md
  const studentLink = await getServerTenantLink("/admin/students", tenant);
  const admissionsLink = await getServerTenantLink("/admin/admissions", tenant);
  const analyticsLink = await getServerTenantLink("/admin/analytics", tenant);
  const coursesLink = await getServerTenantLink("/admin/courses", tenant);
  const attendanceLink = await getServerTenantLink("/admin/attendance", tenant);
  const feesLink = await getServerTenantLink("/admin/fees", tenant);
  const examsLink = await getServerTenantLink("/admin/exam-generator", tenant);
  const walletLink = await getServerTenantLink("/admin/wallet", tenant);
  const settingsLink = await getServerTenantLink("/admin/settings", tenant);
  const publicSiteLink = await getServerTenantLink("/", tenant);

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 w-full mx-auto">
      {/* Header Toolbar */}
      <AdminPageHeader 
        title="Institute Overview" 
        description="Real-time students, admissions, programs, and branch operations."
      >
        <div className="flex items-center gap-2">
          <Link href={analyticsLink}>
            <Button 
              variant="outline" 
              className="h-8 sm:h-9 px-3 rounded-lg text-xs font-semibold gap-1.5 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <BarChart3 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden xs:inline">Visitor</span> Analytics
            </Button>
          </Link>

          {(hasAccess("admissions") || hasAccess("students")) && (
            <Link href={admissionsLink}>
              <Button 
                variant="outline" 
                className="h-8 sm:h-9 px-3 rounded-lg text-xs font-semibold gap-1.5 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 relative"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Admissions</span>
                {pendingAdmissionsCount > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.2 bg-amber-500 text-white text-[9px] font-bold rounded-full">
                    {pendingAdmissionsCount}
                  </span>
                )}
              </Button>
            </Link>
          )}

          {hasAccess("students") && (
            <Link href={studentLink}>
              <Button className="h-8 sm:h-9 px-3.5 rounded-lg text-xs font-semibold gap-1.5 shadow-xs bg-primary text-primary-foreground">
                <Plus className="w-3.5 h-3.5" />
                <span>New Student</span>
              </Button>
            </Link>
          )}
        </div>
      </AdminPageHeader>

      {/* Top 4 Dynamic Metric Cards (Strictly 4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Active Learners */}
        <StatCard
          label="Active Students"
          value={workspace._count.studentProfiles}
          icon={<GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
          subtext={thisMonthAdmissionsCount > 0 ? `+${thisMonthAdmissionsCount} this month` : "Total registered"}
          change={growthRate !== 0 ? `${growthRate > 0 ? "+" : ""}${growthRate}%` : undefined}
          trend={growthRate >= 0 ? "up" : "down"}
        />

        {/* Card 2: Admissions & Inquiries Pipeline */}
        <StatCard
          label="Admissions & Leads"
          value={pendingAdmissionsCount + unreviewedLeadsCount}
          icon={<UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          subtext={`${pendingAdmissionsCount} pending · ${unreviewedLeadsCount} inquiries`}
          change={pendingAdmissionsCount > 0 ? `${pendingAdmissionsCount} Pending` : "Up to date"}
          trend={pendingAdmissionsCount > 0 ? "up" : undefined}
        />

        {/* Card 3: Academic Programs & Batches */}
        <StatCard
          label="Academic Programs"
          value={workspace._count.courses}
          icon={<BookOpen className="w-5 h-5 text-violet-600 dark:text-violet-400" />}
          subtext={`${workspace._count.batches} classroom batches`}
          change={`${workspace._count.batches} Batches`}
        />

        {/* Card 4: Tokens & Wallet (or Staff if restricted) */}
        {hasAccess("wallet") ? (
          <StatCard
            label="Tokens & Wallet"
            value={`${workspace.tokensBalance} Tokens`}
            icon={<Wallet className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
            subtext={`₹${workspace.walletBalance.toLocaleString("en-IN")} wallet balance`}
            change="Active"
          />
        ) : (
          <StatCard
            label="Staff & Faculty"
            value={workspace._count.roles}
            icon={<ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
            subtext="Authorized members"
            change="Protected"
          />
        )}
      </div>

      {/* Visual Analytics & Distribution Charts */}
      {hasAccess("students") || hasAccess("admissions") ? (
        <AdminDashboardCharts 
          admissionData={admissionTrend} 
          studentDistData={studentDistData} 
        />
      ) : (
        <div className="p-4 sm:p-5 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
          <ShieldAlert className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Restricted Analytics</h3>
          <p className="text-xs font-medium text-slate-500 mt-1 max-w-sm mx-auto leading-normal">
            You do not have permission to view detailed student charts. Contact your branch administrator for access.
          </p>
        </div>
      )}

      {/* Production Operations Grid (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
        {/* Left Column (7 cols): Recent Admissions & Pipeline */}
        <div className="lg:col-span-7">
          <Card className="rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900 h-full flex flex-col">
            <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <CardTitle className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Recent Admissions & Inquiries
                  </CardTitle>
                </div>
              </div>
              <Link 
                href={admissionsLink} 
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col justify-between">
              {recentPipelineItems.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {recentPipelineItems.map((item) => (
                    <div 
                      key={item.id} 
                      className="flex items-center justify-between p-3 sm:p-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200/60 dark:border-slate-700/60">
                          {item.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                            {item.name}
                          </p>
                          <p className="text-[10px] font-medium text-slate-400 truncate">
                            {item.subtext}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <Badge 
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border-none ${
                            item.badgeStatus === "PENDING"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              : item.badgeStatus === "APPROVED" || item.badgeStatus === "ACTIVE"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-red-500/10 text-red-600 dark:text-red-400"
                          }`}
                        >
                          {item.badgeText}
                        </Badge>
                        <span className="text-[10px] font-medium text-slate-400 hidden xs:inline">
                          {item.timeText}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center flex flex-col items-center justify-center my-auto">
                  <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mb-2">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    No Admissions Yet
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5 max-w-xs">
                    Prospective students will appear here as soon as they submit an online application or inquiry.
                  </p>
                  <Link href={publicSiteLink} target="_blank" className="mt-3">
                    <Button variant="outline" className="h-7 px-2.5 rounded-lg text-[11px] font-semibold gap-1">
                      Preview Public Portal <ExternalLink className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (5 cols): Institute Identity & Operational Hub */}
        <div className="lg:col-span-5 space-y-3 sm:space-y-4">
          {/* Institute Affiliation Card */}
          <Card className="rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
            <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <Building2 className="w-3.5 h-3.5" />
                </div>
                <CardTitle className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  Center Identity
                </CardTitle>
              </div>
              {workspace.centerCode && (
                <Badge className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-400 border-none">
                  {workspace.centerCode}
                </Badge>
              )}
            </CardHeader>
            <CardContent className="p-3.5 sm:p-4 space-y-3">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {workspace.name}
                </h4>
                <p className="text-[10px] text-slate-400 truncate">
                  {workspace.district ? `${workspace.district}, ` : ""}{workspace.state || "Accredited Branch"}
                </p>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
                <div className="min-w-0 pr-2">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                    Public Subdomain
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block text-[11px]">
                    {workspace.subdomain}.domain.com
                  </span>
                </div>
                <Link href={publicSiteLink} target="_blank">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-md text-slate-500 hover:text-primary">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[11px] font-medium">
                    {workspace.hasDocumentAuthority ? "Autonomous Certification" : "Central Accredited"}
                  </span>
                </div>
                {hasAccess("wallet") && (
                  <Link href={walletLink}>
                    <Button variant="outline" className="h-7 px-2.5 rounded-md text-[11px] font-semibold gap-1">
                      <Wallet className="w-3 h-3" /> Top-Up
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Operations Jump Grid */}
          <Card className="rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
            <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                Operational Shortcuts
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3.5 sm:p-4">
              <div className="grid grid-cols-2 gap-2">
                <Link href={attendanceLink}>
                  <div className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors group cursor-pointer">
                    <div className="flex items-center gap-2 mb-1">
                      <QrCode className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Attendance
                      </span>
                    </div>
                    <p className="text-[9px] text-slate-400 font-medium">Smart QR Scanner</p>
                  </div>
                </Link>

                <Link href={feesLink}>
                  <div className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors group cursor-pointer">
                    <div className="flex items-center gap-2 mb-1">
                      <Receipt className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Fees Ledger
                      </span>
                    </div>
                    <p className="text-[9px] text-slate-400 font-medium">Collections & Dues</p>
                  </div>
                </Link>

                <Link href={examsLink}>
                  <div className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors group cursor-pointer">
                    <div className="flex items-center gap-2 mb-1">
                      <FileQuestion className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Exam Zone
                      </span>
                    </div>
                    <p className="text-[9px] text-slate-400 font-medium">Paper Generator</p>
                  </div>
                </Link>

                <Link href={settingsLink}>
                  <div className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors group cursor-pointer">
                    <div className="flex items-center gap-2 mb-1">
                      <Palette className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Branding
                      </span>
                    </div>
                    <p className="text-[9px] text-slate-400 font-medium">Public Website</p>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
