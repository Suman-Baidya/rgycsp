"use client";

import React from "react";
import {
  User,
  BookOpen,
  Calendar,
  Bell,
  ChevronRight,
  LayoutDashboard,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Wallet
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

export default function StudentDashboardClient({ student, tenant, settings, notices }: { student: any, tenant: string, settings: any, notices: any[] }) {
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);
  const profile = student.studentProfile || {};
  const primaryColor = settings?.primaryColor || "#0f172a";

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const displayNotices = notices && notices.length > 0 ? notices.slice(0, 3) : [
    { title: "No recent notices found", date: "Today", category: "INFO" }
  ];

  const attendancePercent = 92;
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

  const upcomingClasses = [
    { subject: "Mathematics", time: "10:30 AM", room: "Room 102", type: "LIVE" },
    { subject: "Physics", time: "02:00 PM", room: "Lab A", type: "PRACTICAL" },
    { subject: "Chemistry", time: "Tomorrow", room: "Room 201", type: "THEORY" },
  ];

  if (!mounted) return null; // Or a skeleton

  return (
    <div className="pb-20">
      {/* Welcome Banner */}
      <div className="px-6 py-8 lg:py-10">
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
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                label="Enrolled Course"
                value={profile.batch?.course?.title || "Pending Assignment"}
                icon={<BookOpen className="w-5 h-5" />}
                color={primaryColor}
              />
              <StatsCard
                label="Remaining Balance"
                value="₹4,500"
                subtext="Due next month"
                icon={<Wallet className="w-5 h-5" />}
                color="#f59e0b"
              />
              <StatsCard
                label="Current Batch"
                value={profile.batch?.name || "N/A"}
                icon={<Calendar className="w-5 h-5" />}
                color="#8b5cf6"
              />
              <StatsCard
                label="Attendance"
                value="92%"
                subtext="This month"
                icon={<CheckCircle2 className="w-5 h-5" />}
                color="#10b981"
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

              {/* Class Schedule */}
              <div className="lg:col-span-8">
                <Card className="rounded-3xl border-slate-100 dark:border-slate-800 shadow-xl bg-white dark:bg-zinc-900 overflow-hidden h-full">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-bold tracking-tight">Class Schedule</CardTitle>
                      <CardDescription>Your upcoming academic sessions</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs font-bold text-primary">View Calendar</Button>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-slate-50 dark:divide-slate-800">
                      {upcomingClasses.map((item, idx) => (
                        <div key={idx} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-zinc-800 flex flex-col items-center justify-center">
                              <span className="text-[10px] font-bold text-slate-500 uppercase">{item.time.split(' ')[1]}</span>
                              <span className="text-sm font-bold text-slate-900 dark:text-white">{item.time.split(' ')[0]}</span>
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white">{item.subject}</p>
                              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                                <MapPin className="w-3 h-3" /> {item.room}
                              </p>
                            </div>
                          </div>
                          <Badge className={cn(
                            "rounded-lg px-2 py-1 text-[9px] font-bold tracking-wider",
                            item.type === "LIVE" ? "bg-green-100 text-green-600 hover:bg-green-100" : "bg-blue-100 text-blue-600 hover:bg-blue-100"
                          )}>
                            {item.type}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Performance Chart */}
            <Card className="rounded-3xl border-slate-100 dark:border-slate-800 shadow-xl bg-white dark:bg-zinc-900 overflow-hidden">
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

            {/* Notifications / Notices */}
            <Card className="rounded-3xl border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden bg-white dark:bg-zinc-900">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 dark:border-slate-800 px-8 py-6">
                <div>
                  <CardTitle className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Recent Notices</CardTitle>
                  <CardDescription className="font-bold text-slate-400">Stay updated with the latest institutional announcements.</CardDescription>
                </div>
                <Button variant="ghost" size="icon" className="rounded-xl"><Bell className="w-5 h-5" /></Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-50 dark:divide-slate-800">
                  {displayNotices.map((notice: any, idx: number) => (
                    <NoticeItem
                      key={idx}
                      title={notice.title}
                      date={notice.date}
                      category={notice.category || "GENERAL"}
                      color={idx === 0 ? primaryColor : idx === 1 ? "#f59e0b" : "#ef4444"}
                    />
                  ))}
                </div>
                <div className="p-6 text-center">
                  <Link href={getTenantLink("/student/notices", tenant, pathname)}>
                    <Button variant="link" className="font-bold text-xs uppercase tracking-wider text-primary gap-2">View All Notices <ChevronRight className="w-4 h-4" /></Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            {/* Profile Info */}
            <Card className="rounded-3xl border-slate-100 dark:border-slate-800 shadow-xl bg-white dark:bg-zinc-900 overflow-hidden">
              <div className="h-2" style={{ backgroundColor: primaryColor }}></div>
              <CardHeader className="px-8 pt-8 pb-4">
                <CardTitle className="text-lg font-bold tracking-tight">Student Details</CardTitle>
              </CardHeader>
              <CardContent className="px-8 pb-8 space-y-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Username / App No</p>
                  <p className="font-bold text-slate-900 dark:text-white">{student.username}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Email Address</p>
                  <p className="font-bold text-slate-900 dark:text-white">{student.email || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Enrollment Date</p>
                  <p className="font-bold text-slate-900 dark:text-white">{new Date(student.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <Button variant="outline" className="w-full rounded-2xl font-bold h-12 uppercase text-[11px] tracking-widest gap-2">
                  <User className="w-4 h-4" /> Edit Profile
                </Button>
              </CardContent>
            </Card>

            {/* Support / Quick Help */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-zinc-900 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
              <h3 className="text-xl font-bold tracking-tight mb-2">Need Help?</h3>
              <p className="text-sm text-slate-400 font-medium mb-6 leading-relaxed">Having trouble with your portal or studies? Our support team is here for you.</p>
              <Link href="/contact">
                <Button className="w-full bg-white text-zinc-950 hover:bg-slate-100 rounded-2xl h-12 font-bold uppercase text-[11px] tracking-wider shadow-xl">Contact Support</Button>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function StatsCard({ label, value, subtext, icon, color }: any) {
  return (
    <Card className="rounded-3xl border border-slate-100 dark:border-white/5 bg-white dark:bg-zinc-900/50 shadow-sm hover:shadow-xl transition-all duration-500 group overflow-hidden">
      <CardContent className="p-6 relative">
        {/* Subtle background accent */}
        <div
          className="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-5 group-hover:opacity-10 transition-opacity blur-2xl"
          style={{ backgroundColor: color }}
        />

        <div className="flex flex-col gap-4">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
            style={{
              backgroundColor: color,
              boxShadow: `0 8px 20px -6px ${color}60`
            }}
          >
            {React.cloneElement(icon as React.ReactElement<any>, { className: "w-5 h-5" })}
          </div>

          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</h3>
              {subtext && (
                <span className="text-[10px] font-medium text-slate-400">{subtext}</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function NoticeItem({ title, date, category, color }: any) {
  return (
    <div className="p-6 flex items-start gap-5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
      <div className="mt-1">
        <Badge variant="outline" className="rounded-lg font-bold text-[9px] px-2 py-1 tracking-wider uppercase border-2" style={{ borderColor: `${color}40`, color: color }}>
          {category}
        </Badge>
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">{title}</h4>
        <div className="flex items-center gap-3 mt-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{date}</span>
        </div>
      </div>
      <Button variant="ghost" size="icon" className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
        <ChevronRight className="w-5 h-5 text-slate-300" />
      </Button>
    </div>
  );
}
