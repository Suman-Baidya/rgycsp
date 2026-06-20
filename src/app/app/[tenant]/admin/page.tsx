import { db } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/layout/AdminPageHeader";
import { AdminDashboardCharts } from "@/components/admin/AdminDashboardCharts";
import { Users, BookOpen, UserCheck, Wallet, Sparkles, Plus } from "lucide-react";
import Link from "next/link";
import { getServerTenantLink } from "@/lib/routing-server";

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
    return <div>Workspace not found</div>;
  }

  // Fetch trend data (Last 6 months of admissions)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const studentsByMonth = await db.studentProfile.groupBy({
    by: ['admissionDate'],
    _count: { id: true },
    where: { 
      workspaceId: workspace.id,
      admissionDate: { gte: sixMonthsAgo }
    },
  });

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const admissionTrend = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const month = d.getMonth();
    const count = studentsByMonth.filter(s => new Date(s.admissionDate).getMonth() === month).reduce((acc, curr) => acc + curr._count.id, 0);
    return { name: monthNames[month], value: count };
  });

  // Fetch course distribution (aggregated through batches)
  const coursesWithBatches = await db.course.findMany({
    where: { workspaceId: workspace.id },
    select: {
      title: true,
      batches: {
        select: {
          _count: { select: { students: true } }
        }
      }
    }
  });

  const studentDistData = coursesWithBatches.length > 0 
    ? coursesWithBatches.map(c => ({ 
        name: c.title, 
        value: c.batches.reduce((sum, b) => sum + b._count.students, 0) 
      }))
    : [{ name: "General", value: workspace._count.studentProfiles }];

  const stats = [
    { label: "Total Students", value: workspace._count.studentProfiles, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Active Courses", value: workspace._count.courses, icon: BookOpen, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Staff Members", value: workspace._count.roles, icon: UserCheck, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "AI Tokens", value: workspace.tokensBalance, icon: Sparkles, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  const studentLink = await getServerTenantLink("/admin/students", tenant);

  return (
    <div className="p-4 lg:px-10 lg:py-10 max-w-7xl w-full mx-auto space-y-10">
      <AdminPageHeader 
        title="Institute Insights" 
        description={`Welcome back to ${workspace.name}. Here's what's happening in your institute today.`}
      >
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl font-bold h-11 border-2">
            <Wallet className="w-4 h-4 mr-2" /> Buy Tokens
          </Button>
          <Link href={studentLink}>
            <Button className="rounded-xl font-bold h-11 shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" /> New Student
            </Button>
          </Link>
        </div>
      </AdminPageHeader>

      {/* Modern Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="group p-8 bg-white dark:bg-slate-900 border-2 border-slate-100/50 dark:border-slate-800/50 rounded-3xl shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl ${stat.bg} dark:bg-slate-800 transition-colors`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="h-1.5 w-1.5 rounded-full bg-slate-200 dark:bg-slate-800 group-hover:bg-primary transition-colors" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 tracking-widest">{stat.label}</p>
            <p className="text-4xl font-bold text-slate-900 dark:text-white mt-1 leading-none">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Reports Section */}
      <AdminDashboardCharts admissionData={admissionTrend} studentDistData={studentDistData} />

      {/* Quick Actions / Welcome Card */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-10 lg:p-16 text-white shadow-2xl">
        <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12">
           <Sparkles className="w-64 h-64" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 tracking-tight">Your Institute is Growing!</h2>
          <p className="text-slate-400 text-lg font-medium leading-relaxed mb-8">
            You currently have {workspace._count.studentProfiles} students enrolled across {workspace._count.courses} active courses. 
            Keep building your landing page or manage your staff members to optimize operations.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button size="lg" className="rounded-2xl font-bold bg-white text-slate-900 hover:bg-slate-100 h-14 px-10">
              Launch Setup Guide
            </Button>
            <Link href={await getServerTenantLink("/admin/settings", tenant)}>
              <Button size="lg" variant="outline" className="rounded-2xl font-bold border-white/20 hover:bg-white/10 h-14 px-10">
                Landing Page Settings
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
