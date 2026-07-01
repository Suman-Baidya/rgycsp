"use client";

import React from "react";
import {
  User,
  Calendar,
  Bell,
  ChevronRight,
  LayoutDashboard,
  Clock,
  CheckCircle2,
  Wallet,
  FileText,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { getTenantLink } from "@/lib/routing";
import { usePathname } from "next/navigation";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from "recharts";

export default function StudentDashboardClient({ student, tenant, settings, notices, dashboardData }: { student: any, tenant: string, settings: any, notices: any[], dashboardData?: any }) {
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);
  const profile = student.studentProfile || {};
  const primaryColor = settings?.primaryColor || "#0f172a";

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const displayNotices = notices && notices.length > 0 ? notices.slice(0, 3) : [];
  const upcomingExams = dashboardData?.upcomingExams || [];
  const issuedDocuments = dashboardData?.issuedDocuments || [];
  
  const remainingBalance = dashboardData?.remainingBalance || 0;
  const attendancePercent = dashboardData?.attendancePercentage ?? 100;
  const currentBatch = profile.batch?.name || "Pending Assignment";

  const attendanceData = [
    { name: "Present", value: attendancePercent },
    { name: "Absent", value: 100 - attendancePercent },
  ];

  const progressData = [
    { month: "Jan", score: 65 },
    { month: "Feb", score: 78 },
    { month: "Mar", score: 72 },
    { month: "Apr", score: 85 },
    { month: "May", score: 89 },
    { month: "Jun", score: 92 },
  ];

  if (!mounted) return null;

  return (
    <div className="pb-20">
      {/* Welcome Banner */}
      <div className="px-6 py-6 lg:py-8">
        <div className="relative overflow-hidden rounded-3xl p-8 lg:p-10 text-white shadow-xl" style={{ backgroundColor: primaryColor }}>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 border-8 border-white rounded-full -ml-24 -mb-24"></div>
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20 ring-4 ring-white/20 shadow-2xl shrink-0">
                <AvatarImage src={student.image} />
                <AvatarFallback className="bg-white text-primary text-xl font-bold">{student.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold tracking-tight mb-1">Hi, {student.name.split(' ')[0]}!</h1>
                <p className="opacity-80 text-sm font-bold flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" /> Learner Portal Overview
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 self-start md:self-center">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase opacity-60">Current Session</p>
                <p className="text-sm font-bold">{new Date().getFullYear()} Academic Year</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            {/* Quick Stats (3 Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatsCard
                label="Remaining Balance"
                value={`₹${remainingBalance.toLocaleString()}`}
                subtext={remainingBalance > 0 ? "Pending payment" : "All cleared"}
                icon={<Wallet className="w-5 h-5" />}
                color={primaryColor}
              />
              <StatsCard
                label="Current Batch"
                value={currentBatch}
                icon={<Calendar className="w-5 h-5" />}
                color={primaryColor}
              />
              <StatsCard
                label="Attendance"
                value={`${attendancePercent}%`}
                subtext="Overall"
                icon={<CheckCircle2 className="w-5 h-5" />}
                color={primaryColor}
              />
            </div>

            {/* Insights & Progress Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Attendance Chart */}
              <div className="lg:col-span-4">
                <Card className="rounded-3xl border-slate-100 dark:border-slate-800 shadow-xl bg-white dark:bg-zinc-900 overflow-hidden h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold tracking-tight">Attendance</CardTitle>
                  </CardHeader>
                  <CardContent className="h-64 flex items-center justify-center relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={attendanceData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          <Cell fill={primaryColor} />
                          <Cell fill={`${primaryColor}20`} />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pt-4">
                      <span className="text-2xl font-bold" style={{ color: primaryColor }}>{attendancePercent}%</span>
                      <span className="text-[8px] font-medium text-slate-400 uppercase tracking-wider">Present</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Chart */}
              <div className="lg:col-span-8">
                <Card className="rounded-3xl border-slate-100 dark:border-slate-800 shadow-xl bg-white dark:bg-zinc-900 overflow-hidden h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold tracking-tight">Academic Progress</CardTitle>
                    <CardDescription>Monthly performance trend</CardDescription>
                  </CardHeader>
                  <CardContent className="h-64 pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={progressData}>
                        <defs>
                          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={primaryColor} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis
                          dataKey="month"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }}
                        />
                        <YAxis hide />
                        <Tooltip
                          contentStyle={{
                            borderRadius: '16px',
                            border: 'none',
                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="score"
                          stroke={primaryColor}
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorScore)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Notifications, Exams, Documents */}
          <div className="lg:col-span-4 space-y-8 h-full">
            <Card className="rounded-3xl border-slate-100 dark:border-slate-800 shadow-xl bg-white dark:bg-zinc-900 overflow-hidden flex flex-col h-full min-h-[400px]">
              <div className="h-2 shrink-0" style={{ backgroundColor: primaryColor }}></div>
              <CardHeader className="px-8 pt-6 pb-4 shrink-0 flex flex-row items-center justify-between border-b border-slate-50 dark:border-slate-800">
                <CardTitle className="text-lg font-bold tracking-tight flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" style={{ color: primaryColor }} /> Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-50 dark:divide-slate-800">
                  
                  {/* Exams Section */}
                  {upcomingExams.map((exam: any, idx: number) => (
                    <div key={`exam-${idx}`} className="p-6 flex items-start gap-5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                      <div className="mt-1">
                        <Badge variant="outline" className="rounded-lg font-bold text-[9px] px-2 py-1 tracking-wider uppercase border-2 text-rose-500 border-rose-500/40">
                          EXAM
                        </Badge>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">{exam.title}</h4>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            {new Date(exam.date).toLocaleDateString()} • {exam.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Documents Section */}
                  {issuedDocuments.map((doc: any, idx: number) => (
                    <div key={`doc-${idx}`} className="p-6 flex items-start gap-5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                      <div className="mt-1">
                        <Badge variant="outline" className="rounded-lg font-bold text-[9px] px-2 py-1 tracking-wider uppercase border-2 text-blue-500 border-blue-500/40">
                          ISSUED
                        </Badge>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">{doc.name} Generated</h4>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Please collect / download</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Notices Section */}
                  {displayNotices.map((notice: any, idx: number) => (
                    <div key={`notice-${idx}`} className="p-6 flex items-start gap-5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                      <div className="mt-1">
                        <Badge variant="outline" className="rounded-lg font-bold text-[9px] px-2 py-1 tracking-wider uppercase border-2 text-slate-500 border-slate-500/40">
                          {notice.category || "NOTICE"}
                        </Badge>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">{notice.title}</h4>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{notice.date}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {upcomingExams.length === 0 && issuedDocuments.length === 0 && displayNotices.length === 0 && (
                    <div className="p-8 text-center text-slate-400 text-sm font-medium flex flex-col items-center gap-3">
                      <AlertCircle className="w-8 h-8 opacity-20" />
                      No new notifications
                    </div>
                  )}

                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}

function StatsCard({ label, value, subtext, icon, color }: any) {
  return (
    <Card className="rounded-3xl border border-slate-100 dark:border-white/5 bg-white dark:bg-zinc-900/50 shadow-sm hover:shadow-xl transition-all duration-500 group overflow-hidden">
      <CardContent className="p-5 relative">
        {/* Subtle background accent */}
        <div
          className="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 group-hover:opacity-20 transition-opacity blur-2xl"
          style={{ backgroundColor: color }}
        />

        <div className="flex flex-col gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
            style={{
              backgroundColor: color,
              boxShadow: `0 8px 20px -6px ${color}60`
            }}
          >
            {React.cloneElement(icon as React.ReactElement<any>, { className: "w-5 h-5" })}
          </div>

          <div className="space-y-1 overflow-hidden">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-xl lg:text-2xl font-black tracking-tight truncate" style={{ color }} title={value}>{value}</h3>
              {subtext && (
                <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap hidden sm:inline-block">{subtext}</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
