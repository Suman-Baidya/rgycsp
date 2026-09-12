import { db } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/layout/AdminPageHeader";
import { AdminDashboardCharts } from "@/components/admin/AdminDashboardCharts";
import { Users, BookOpen, UserCheck, Wallet, Sparkles, Plus, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { getServerTenantLink } from "@/lib/routing-server";
import { auth } from "@/auth";
import { StatCard } from "@/components/dashboard/StatCard";

export default async function WorkspaceAdminDashboard({
  params
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  
  const workspace = await db.workspace.findUnique({
    where: { subdomain: tenant?.toLowerCase() },
    include: {
      _count: {
        select: {
          studentProfiles: true,
          courses: true,
          roles: true,
        }
      }
    }
  });

  if (!workspace) {
    throw new Error("Workspace not found"); // Should be caught by layout notFound()
  }

  // Get user session and permissions
  const session = await auth();
  let userRole = "UNAUTHORIZED";
  let userPermissions: string[] = [];
  
  if (session?.user?.role === "SUPER_ADMIN" || session?.user?.role === "SUPER_ADMIN_MANAGER" || session?.user?.email === process.env.DEVELOPER_EMAIL) {
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

  // Fetch trend data (Last 6 months of admissions)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const [studentsByMonth, coursesWithBatches] = await Promise.all([
    db.studentProfile.groupBy({
      by: ['admissionDate'],
      _count: { id: true },
      where: { 
        workspaceId: workspace.id,
        admissionDate: { gte: sixMonthsAgo }
      },
    }),
    db.course.findMany({
      where: { workspaceId: workspace.id },
      select: {
        title: true,
        batches: {
          select: {
            _count: { select: { students: true } }
          }
        }
      }
    })
  ]);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const admissionTrend = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const month = d.getMonth();
    const count = studentsByMonth.filter(s => new Date(s.admissionDate).getMonth() === month).reduce((acc, curr) => acc + curr._count.id, 0);
    return { name: monthNames[month], value: count };
  });

  const studentDistData = coursesWithBatches.length > 0 
    ? coursesWithBatches.map(c => ({ 
        name: c.title, 
        value: c.batches.reduce((sum, b) => sum + b._count.students, 0) 
      }))
    : [{ name: "General", value: workspace._count.studentProfiles }];

  let stats = [];
  if (hasAccess("students")) {
    stats.push({ label: "Total Students", value: workspace._count.studentProfiles, icon: Users, color: "text-blue-600", bg: "bg-blue-50" });
  }
  if (hasAccess("courses")) {
    stats.push({ label: "Active Courses", value: workspace._count.courses, icon: BookOpen, color: "text-emerald-600", bg: "bg-emerald-50" });
  }
  if (hasAccess("staff")) {
    stats.push({ label: "Staff Members", value: workspace._count.roles, icon: UserCheck, color: "text-amber-600", bg: "bg-amber-50" });
  }
  if (hasAccess("wallet")) {
    stats.push({ label: "AI Tokens", value: workspace.tokensBalance, icon: Sparkles, color: "text-purple-600", bg: "bg-purple-50" });
  }

  const studentLink = await getServerTenantLink("/admin/students", tenant);

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 w-full mx-auto">
      <AdminPageHeader 
        title="Institute Insights" 
        description={`Welcome back to ${workspace.name}. Here's what's happening in your institute today.`}
      >
        <div className="flex items-center gap-2">
          {hasAccess("wallet") && (
            <Button variant="outline" className="h-8 sm:h-9 px-3 rounded-lg text-xs font-semibold gap-1.5 border-slate-200 dark:border-slate-700">
              <Wallet className="w-3.5 h-3.5" /> Buy Tokens
            </Button>
          )}
          {hasAccess("students") && (
            <Link href={studentLink}>
              <Button className="h-8 sm:h-9 px-3.5 rounded-lg text-xs font-semibold gap-1.5 shadow-xs bg-primary text-primary-foreground">
                <Plus className="w-3.5 h-3.5" /> New Student
              </Button>
            </Link>
          )}
        </div>
      </AdminPageHeader>

      {/* Modern Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, i) => (
          <StatCard
            key={i}
            label={stat.label}
            value={stat.value}
            icon={<stat.icon className={`w-5 h-5 ${stat.color}`} />}
          />
        ))}
      </div>

      {/* Reports Section */}
      {hasAccess("students") || hasAccess("admissions") ? (
        <AdminDashboardCharts admissionData={admissionTrend} studentDistData={studentDistData} />
      ) : (
        <div className="p-4 sm:p-5 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
          <ShieldAlert className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Restricted View</h3>
          <p className="text-xs font-medium text-slate-500 mt-1 max-w-sm mx-auto leading-normal">
            You do not have permission to view detailed analytics and student charts. Please contact your administrator if you need access.
          </p>
        </div>
      )}

      {/* Quick Actions / Welcome Card */}
      <div className="relative overflow-hidden rounded-xl bg-slate-900 p-4 sm:p-5 text-white shadow-sm border border-slate-800">
        <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12 pointer-events-none">
           <Sparkles className="w-32 h-32" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-base sm:text-lg font-bold mb-1 tracking-tight">Your Institute is Growing!</h2>
          <p className="text-slate-400 text-xs font-medium leading-normal mb-3">
            You currently have {workspace._count.studentProfiles} students enrolled across {workspace._count.courses} active courses. 
            Keep building your landing page or manage your staff members to optimize operations.
          </p>
          <div className="flex flex-wrap gap-2">
            {hasAccess("settings") && (
              <Button className="rounded-lg font-semibold bg-white text-slate-900 hover:bg-slate-100 h-8 sm:h-9 px-3 text-xs">
                Launch Setup Guide
              </Button>
            )}
            {hasAccess("settings") && (
              <Link href={await getServerTenantLink("/admin/settings", tenant)}>
                <Button variant="outline" className="rounded-lg font-semibold border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white h-8 sm:h-9 px-3 text-xs">
                  Landing Page Settings
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
