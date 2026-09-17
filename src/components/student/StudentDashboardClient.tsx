"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Calendar,
  Bell,
  User,
  Wallet,
  CheckCircle2,
  Clock,
  Award,
  FileText,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  GraduationCap,
  ShieldCheck,
  Download,
  ArrowUpRight,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getTenantLink } from "@/lib/routing";
import { cn } from "@/lib/utils";
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

interface StudentDashboardProps {
  student: any;
  tenant: string;
  settings?: any;
  notices?: any[];
  dashboardData?: any;
  workspace?: any;
}

export default function StudentDashboardClient({
  student,
  tenant,
  settings,
  notices = [],
  dashboardData,
  workspace
}: StudentDashboardProps) {
  const pathname = usePathname();
  const profile = student?.studentProfile || {};
  const batch = profile.batch;
  const course = profile.course || batch?.course;

  const centerName = workspace?.name || settings?.siteName || "Academic Center";
  const centerCode = workspace?.centerCode || settings?.centerCode || tenant?.toUpperCase();
  const primaryColor = settings?.primaryColor || "#0284c7";

  const displayNotices = notices && notices.length > 0 ? notices.slice(0, 4) : [];
  const upcomingExams = dashboardData?.upcomingExams || [];
  const issuedDocuments = dashboardData?.issuedDocuments || [];
  const remainingBalance = dashboardData?.remainingBalance || 0;
  const attendancePercent = dashboardData?.attendancePercentage ?? 100;

  const currentBatchName = batch?.name || "Standard Batch";
  const courseTitle = course?.title || "Enrolled Diploma Course";
  const courseCode = course?.code || "COURSE";
  const courseDuration = course?.duration || "Regular";

  // Attendance chart data
  const attendanceData = [
    { name: "Present", value: attendancePercent },
    { name: "Absent", value: Math.max(0, 100 - attendancePercent) },
  ];

  // Real academic score curve derived from evaluated semesters
  const realSemesters = (profile.semesters || [])
    .filter((s: any) => (s.percentage && s.percentage > 0) || (s.marks && s.marks.length > 0))
    .sort((a: any, b: any) => a.semesterNumber - b.semesterNumber);

  const progressData = realSemesters.length > 0
    ? realSemesters.map((sem: any) => ({
        month: `Sem ${sem.semesterNumber}`,
        score: Math.round(sem.percentage || 0)
      }))
    : [];

  // Document verification checklist
  const documentsStatus = [
    {
      title: "Enrollment & Registration Card",
      issued: !!profile.registrationCardIssuedToStudent || issuedDocuments.some((d: any) => d.name?.toLowerCase().includes("registration")),
      actionText: "Download Card",
      href: getTenantLink("/student/profile", tenant, pathname),
      statusBadge: !!profile.registrationCardIssuedToStudent ? "ISSUED" : "PROCESSING",
      statusColor: !!profile.registrationCardIssuedToStudent ? "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/40" : "text-amber-700 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/40"
    },
    {
      title: "Exam Admit Card / Hall Ticket",
      issued: !!profile.admitCardIssuedToStudent || issuedDocuments.some((d: any) => d.name?.toLowerCase().includes("admit")),
      actionText: "View Ticket",
      href: getTenantLink("/student/exams", tenant, pathname),
      statusBadge: !!profile.admitCardIssuedToStudent ? "AVAILABLE" : upcomingExams.length > 0 ? "SCHEDULED" : "UPCOMING",
      statusColor: !!profile.admitCardIssuedToStudent ? "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/40" : "text-blue-700 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/40"
    },
    {
      title: "Semester Marksheet / Transcript",
      issued: (profile.semesters && profile.semesters.length > 0) || issuedDocuments.some((d: any) => d.name?.toLowerCase().includes("marksheet")),
      actionText: "View Results",
      href: getTenantLink("/student/exams", tenant, pathname),
      statusBadge: (profile.semesters && profile.semesters.length > 0) ? "AVAILABLE" : "ONGOING",
      statusColor: (profile.semesters && profile.semesters.length > 0) ? "text-indigo-700 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/40" : "text-slate-600 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
    },
    {
      title: "Course Completion Certificate",
      issued: !!profile.certificateIssuedToStudent || !!profile.certificateApproved || issuedDocuments.some((d: any) => d.name?.toLowerCase().includes("certificate")),
      actionText: "Get Certificate",
      href: getTenantLink("/student/profile", tenant, pathname),
      statusBadge: (profile.certificateIssuedToStudent || profile.certificateApproved) ? "VERIFIED & ISSUED" : "IN PROGRESS",
      statusColor: (profile.certificateIssuedToStudent || profile.certificateApproved) ? "text-purple-700 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/40" : "text-slate-600 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
    }
  ];

  // Invoices
  const recentInvoices = (profile.invoices || []).slice(0, 3);

  // Center contact info
  const centerPhone = settings?.phone || workspace?.phone || "";
  const centerEmail = settings?.email || workspace?.email || "";
  const centerAddress = settings?.address || workspace?.address || "Franchise Center Campus";

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 w-full mx-auto">
      {/* 1. Executive Student Welcome Banner (Rule 7.1) */}
      <div className="relative overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 sm:gap-4">
            <Avatar className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl border-2 border-primary/20 shadow-xs shrink-0">
              <AvatarImage src={student.image} alt={student.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-base font-bold rounded-xl">
                {student.name?.charAt(0) || "S"}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Welcome back, {student.name?.split(" ")[0] || "Student"}!
                </h1>
                <Badge variant="outline" className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider bg-primary/10 text-primary border-primary/20">
                  Active Learner
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span>Enrollment: <strong className="text-slate-700 dark:text-slate-200 font-semibold">{profile.enrollmentNo || "Pending"}</strong></span>
                {(profile.registrationNo || profile.rollNo) && (
                  <>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span>Roll No: <strong className="text-slate-700 dark:text-slate-200 font-semibold">{profile.registrationNo || profile.rollNo}</strong></span>
                  </>
                )}
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span>Center: <strong className="text-slate-700 dark:text-slate-200 font-semibold">{centerName} ({centerCode})</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto shrink-0 pt-2 md:pt-0">
            <Link href={getTenantLink("/student/profile", tenant, pathname)} className="flex-1 md:flex-initial">
              <Button variant="outline" className="w-full h-8 sm:h-9 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold gap-1.5 border-slate-200 dark:border-slate-700">
                <User className="w-3.5 h-3.5" />
                View Profile
              </Button>
            </Link>
            {remainingBalance > 0 ? (
              <Link href={getTenantLink("/student/fees", tenant, pathname)} className="flex-1 md:flex-initial">
                <Button className="w-full h-8 sm:h-9 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold gap-1.5 bg-amber-600 hover:bg-amber-700 text-white shadow-xs">
                  <Wallet className="w-3.5 h-3.5" />
                  Pay Dues (₹{remainingBalance.toLocaleString()})
                </Button>
              </Link>
            ) : (
              <Link href={getTenantLink("/student/courses", tenant, pathname)} className="flex-1 md:flex-initial">
                <Button className="w-full h-8 sm:h-9 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  My Course
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 2. Metric / Stat Cards Grid (Rule 7.2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Attendance */}
        <Card className="border border-slate-100 dark:border-white/5 shadow-xs rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">Overall Attendance</p>
                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{attendancePercent}%</p>
                <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {attendancePercent >= 75 ? "Eligible for examinations" : "Low attendance notice"}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metric 2: Remaining Balance */}
        <Card className="border border-slate-100 dark:border-white/5 shadow-xs rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">Fee Balance</p>
                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  ₹{remainingBalance.toLocaleString()}
                </p>
                <p className={cn("text-[10px] font-semibold mt-0.5", remainingBalance > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400")}>
                  {remainingBalance > 0 ? "Pending installments" : "All payments cleared"}
                </p>
              </div>
              <div className={cn("p-2.5 rounded-lg", remainingBalance > 0 ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400")}>
                <Wallet className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metric 3: Active Course */}
        <Card className="border border-slate-100 dark:border-white/5 shadow-xs rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">Enrolled Course</p>
                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white truncate" title={courseTitle}>
                  {courseCode}
                </p>
                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  Batch: {currentBatchName}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                <BookOpen className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metric 4: Exams & Credentials */}
        <Card className="border border-slate-100 dark:border-white/5 shadow-xs rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">Exams & Documents</p>
                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {upcomingExams.length} <span className="text-sm font-semibold text-slate-500">Scheduled</span>
                </p>
                <p className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 mt-0.5">
                  {issuedDocuments.length} Verified Document{issuedDocuments.length === 1 ? "" : "s"}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Award className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>


      {/* 4. Main 2-Column Split Layout (8 cols left / 4 cols right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-5">
          {/* A. Academic Analytics & Progress Card */}
          <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden bg-white dark:bg-slate-900">
            <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                  Academic Performance & Attendance
                </CardTitle>
                <CardDescription className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                  Classroom consistency and performance progression
                </CardDescription>
              </div>
              <Link href={getTenantLink("/student/attendance", tenant, pathname)}>
                <Button variant="ghost" className="h-7 sm:h-8 px-2 sm:px-2.5 rounded-lg text-xs font-semibold text-primary hover:text-primary gap-1">
                  Attendance Details <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </CardHeader>

            <CardContent className="p-3.5 sm:p-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Donut Attendance Dial */}
                <div className="md:col-span-4 flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/60">
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={attendanceData}
                          cx="50%"
                          cy="50%"
                          innerRadius={48}
                          outerRadius={62}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          <Cell fill={primaryColor} />
                          <Cell fill="#e2e8f0" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                        {attendancePercent}%
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Attendance</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primaryColor }}></span>
                      <span>Present</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                      <span>Absent</span>
                    </div>
                  </div>
                </div>

                {/* Performance Progress Graph */}
                {/* Performance Progress Graph */}
                <div className="md:col-span-8">
                  {progressData.length > 0 ? (
                    <div className="h-44 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={progressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={primaryColor} stopOpacity={0.25} />
                              <stop offset="95%" stopColor={primaryColor} stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.2} />
                          <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 9, fontWeight: 600, fill: "#94a3b8" }}
                          />
                          <YAxis
                            domain={[0, 100]}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 9, fontWeight: 600, fill: "#94a3b8" }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#0f172a",
                              borderRadius: "8px",
                              border: "none",
                              color: "#fff",
                              fontSize: "11px",
                              fontWeight: 600
                            }}
                            formatter={(val: any) => [`${val}%`, "Semester Score"]}
                          />
                          <Area
                            type="monotone"
                            dataKey="score"
                            stroke={primaryColor}
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#scoreGradient)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-44 w-full flex flex-col items-center justify-center text-center p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20">
                      <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mb-1.5">
                        <Award className="h-5 w-5" />
                      </div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Semester Evaluations In Progress
                      </p>
                      <p className="text-[10px] text-slate-400 max-w-xs mt-0.5 leading-normal">
                        Your performance curve will plot here automatically as your semester marks and assessments are published by the center.
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800 mt-1">
                    <span>Attendance: {attendancePercent}% Recorded</span>
                    <span className={cn("font-semibold flex items-center gap-1", attendancePercent >= 75 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400")}>
                      <ShieldCheck className="w-3.5 h-3.5" /> 
                      {attendancePercent >= 75 ? "Exam Eligible (>= 75%)" : "Attendance Low (< 75%)"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* B. Active Course & Batch Details Card */}
          <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden bg-white dark:bg-slate-900">
            <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                    Enrolled Program & Schedule
                  </CardTitle>
                  <CardDescription className="text-[11px] sm:text-xs text-slate-500">
                    Current curriculum batch specifications
                  </CardDescription>
                </div>
              </div>
              <Link href={getTenantLink("/student/courses", tenant, pathname)}>
                <Button variant="outline" className="h-7 sm:h-8 px-2.5 rounded-lg text-xs font-semibold gap-1">
                  Curriculum <ArrowUpRight className="w-3 h-3" />
                </Button>
              </Link>
            </CardHeader>

            <CardContent className="p-3.5 sm:p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Course Name</p>
                  <p className="font-semibold text-xs text-slate-900 dark:text-white mt-0.5 truncate" title={courseTitle}>
                    {courseTitle}
                  </p>
                  <p className="text-[9px] font-medium text-slate-500 mt-0.5">Code: {courseCode}</p>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Batch Group</p>
                  <p className="font-semibold text-xs text-slate-900 dark:text-white mt-0.5 truncate">
                    {currentBatchName}
                  </p>
                  <p className="text-[9px] font-medium text-slate-500 mt-0.5">{batch?.days || "Mon - Sat"}</p>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Class Timings</p>
                  <p className="font-semibold text-xs text-slate-900 dark:text-white mt-0.5">
                    {batch?.startTime && batch?.endTime ? `${batch.startTime} - ${batch.endTime}` : "Daily Regular Slot"}
                  </p>
                  <p className="text-[9px] font-medium text-slate-500 mt-0.5">Theory & Lab Slot</p>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Program Duration</p>
                  <p className="font-semibold text-xs text-slate-900 dark:text-white mt-0.5">
                    {courseDuration}
                  </p>
                  <p className="text-[9px] font-medium text-emerald-600 font-semibold mt-0.5">Approved Track</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* C. Credentials & Document Status Tracker (Rule 7.5 List Format) */}
          <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden bg-white dark:bg-slate-900">
            <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                  Credentials & Document Status
                </CardTitle>
                <CardDescription className="text-[11px] sm:text-xs text-slate-500">
                  Official certificates, hall tickets, and marksheet readiness
                </CardDescription>
              </div>
              <Link href={getTenantLink("/student/profile", tenant, pathname)}>
                <Button variant="ghost" className="h-7 sm:h-8 px-2 sm:px-2.5 rounded-lg text-xs font-semibold text-primary hover:text-primary gap-1">
                  View All Docs <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </CardHeader>

            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {documentsStatus.map((doc, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors gap-3 group border-l-[3px] border-primary"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                          {doc.title}
                        </h4>
                        <p className="text-[10px] font-medium text-slate-500 mt-0.5">
                          Verified through Center Examination Registry
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end shrink-0">
                      <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider", doc.statusColor)}>
                        {doc.statusBadge}
                      </span>
                      <Link href={doc.href}>
                        <Button
                          variant={doc.issued ? "default" : "outline"}
                          className="h-7 sm:h-8 px-2.5 rounded-lg text-xs font-semibold gap-1 shrink-0"
                        >
                          {doc.issued && <Download className="w-3 h-3" />}
                          {doc.actionText}
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* D. Recent Fee Invoices & Payment Ledger */}
          {recentInvoices.length > 0 && (
            <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden bg-white dark:bg-slate-900">
              <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                    Recent Billing & Invoices
                  </CardTitle>
                  <CardDescription className="text-[11px] sm:text-xs text-slate-500">
                    Tuition fees and payment transaction receipts
                  </CardDescription>
                </div>
                <Link href={getTenantLink("/student/fees", tenant, pathname)}>
                  <Button variant="ghost" className="h-7 sm:h-8 px-2 sm:px-2.5 rounded-lg text-xs font-semibold text-primary hover:text-primary gap-1">
                    Complete Ledger <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </CardHeader>

              <CardContent className="p-0">
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {recentInvoices.map((inv: any, idx: number) => {
                    const isPaid = inv.status === "PAID";
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 sm:p-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", isPaid ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30" : "bg-amber-50 text-amber-600 dark:bg-amber-950/30")}>
                            <Wallet className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <h5 className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                              Invoice #{inv.invoiceNumber || inv.id?.substring(0, 8).toUpperCase()}
                            </h5>
                            <p className="text-[10px] font-medium text-slate-500 mt-0.5">
                              {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Recent"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                              ₹{Number(inv.amount || 0).toLocaleString()}
                            </p>
                            <span className={cn("text-[9px] font-bold px-1.5 py-0.2 rounded uppercase", isPaid ? "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40" : "text-amber-700 bg-amber-50 dark:bg-amber-950/40")}>
                              {inv.status}
                            </span>
                          </div>
                          <Link href={getTenantLink("/student/fees", tenant, pathname)}>
                            <Button variant="outline" className="h-7 px-2 rounded-md text-xs font-semibold">
                              Receipt
                            </Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4 space-y-4 sm:space-y-5">
          {/* 1. Upcoming Exams Widget */}
          <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden bg-white dark:bg-slate-900">
            <div className="h-1.5 w-full bg-rose-500 shrink-0" />
            <CardHeader className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-rose-500" />
                <CardTitle className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                  Scheduled Exams
                </CardTitle>
              </div>
              <Link href={getTenantLink("/student/exams", tenant, pathname)}>
                <Button variant="ghost" className="h-6 px-1.5 text-[11px] font-semibold text-rose-600 hover:text-rose-700">
                  Hall Tickets
                </Button>
              </Link>
            </CardHeader>

            <CardContent className="p-0">
              {upcomingExams.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {upcomingExams.map((exam: any, idx: number) => {
                    const examDate = new Date(exam.date);
                    return (
                      <div key={idx} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors flex items-start gap-3">
                        <div className="flex flex-col items-center justify-center w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 shrink-0 border border-rose-100 dark:border-rose-900/30">
                          <span className="text-[10px] font-extrabold uppercase leading-none">{examDate.toLocaleString("en-US", { month: "short" })}</span>
                          <span className="text-xs font-black leading-none mt-0.5">{examDate.getDate()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-xs text-slate-900 dark:text-white truncate" title={exam.title}>
                            {exam.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
                              {exam.type || "Theory"}
                            </span>
                            <span className="text-[10px] font-medium text-slate-400">
                              {examDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-5 text-center space-y-1.5">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No Pending Exams</p>
                  <p className="text-[10px] text-slate-400 font-medium">All current semester tests are clear.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 2. Notice Board / Announcements */}
          <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden bg-white dark:bg-slate-900">
            <div className="h-1.5 w-full bg-blue-500 shrink-0" />
            <CardHeader className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-500" />
                <CardTitle className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                  Notice Board
                </CardTitle>
              </div>
              <Link href={getTenantLink("/student/notices", tenant, pathname)}>
                <Button variant="ghost" className="h-6 px-1.5 text-[11px] font-semibold text-blue-600 hover:text-blue-700">
                  All Notices
                </Button>
              </Link>
            </CardHeader>

            <CardContent className="p-0">
              {displayNotices.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {displayNotices.map((notice: any, idx: number) => (
                    <div key={idx} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/30 uppercase tracking-wider">
                          {notice.category || "NOTICE"}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400">
                          {notice.date || "Today"}
                        </span>
                      </div>
                      <h4 className="font-semibold text-xs text-slate-900 dark:text-white leading-snug line-clamp-2">
                        {notice.title}
                      </h4>
                      {notice.content && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {notice.content}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-5 text-center space-y-1.5">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                    <Bell className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No New Circulars</p>
                  <p className="text-[10px] text-slate-400 font-medium">Center administration notices will appear here.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 3. Center Help Desk & Coordinator Contact */}
          <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden bg-white dark:bg-slate-900">
            <CardHeader className="p-3.5 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                Center Help Desk
              </CardTitle>
              <CardDescription className="text-[11px] text-slate-500">
                Direct academic & administrative support
              </CardDescription>
            </CardHeader>

            <CardContent className="p-3.5 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-2 text-[11px]">{centerAddress}</span>
                </div>
                {centerPhone && (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <a href={`tel:${centerPhone}`} className="text-[11px] font-semibold text-primary hover:underline">
                      {centerPhone}
                    </a>
                  </div>
                )}
                {centerEmail && (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <a href={`mailto:${centerEmail}`} className="text-[11px] font-medium text-slate-500 hover:underline truncate">
                      {centerEmail}
                    </a>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                {centerPhone ? (
                  <a
                    href={`https://wa.me/${centerPhone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full"
                  >
                    <Button
                      variant="outline"
                      className="w-full h-8 rounded-lg text-xs font-semibold gap-1.5 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100/60 border-emerald-200 dark:border-emerald-800"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Contact on WhatsApp
                    </Button>
                  </a>
                ) : (
                  <Link href={getTenantLink("/student/profile", tenant, pathname)} className="w-full">
                    <Button variant="outline" className="w-full h-8 rounded-lg text-xs font-semibold">
                      Student Help Desk
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
