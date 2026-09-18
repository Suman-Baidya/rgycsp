"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Clock,
  Award,
  ChevronRight,
  Calendar,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  FileText,
  BarChart3,
  Timer,
  ExternalLink,
  Search,
  Filter,
  TrendingUp,
  Target,
  ShieldCheck,
  Trophy,
  Download,
  Info,
  CheckCircle,
  XCircle,
  GraduationCap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getTenantLink } from "@/lib/routing";
import { cn } from "@/lib/utils";

interface StudentExamsClientProps {
  settings?: any;
  tenant: string;
  exams?: any[];
  profile?: any;
  workspace?: any;
}

export default function StudentExamsClient({
  settings,
  tenant,
  exams = [],
  profile,
  workspace
}: StudentExamsClientProps) {
  const pathname = usePathname();
  const primaryColor = settings?.primaryColor || "#0284c7";
  const [activeTab, setActiveTab] = useState<"pending" | "completed" | "analytics" | "guidelines">("pending");

  const pendingExams = useMemo(() => {
    return (exams || []).filter((e) => !e.results || e.results.length === 0);
  }, [exams]);

  const completedExams = useMemo(() => {
    return (exams || []).filter((e) => e.results && e.results.length > 0);
  }, [exams]);

  // Calculate genuine average score across completed exams
  const avgScore = useMemo(() => {
    if (completedExams.length === 0) return null;
    const totalPercentage = completedExams.reduce((acc, exam) => {
      const result = exam.results[0];
      const maxMarks = (exam._count?.questions || 0) * (exam.marksPerQuestion || 1);
      const pct = maxMarks > 0 ? (result.marksObtained / maxMarks) * 100 : 0;
      return acc + pct;
    }, 0);
    return Math.round(totalPercentage / completedExams.length);
  }, [completedExams]);

  const isAdmitCardReady = !!profile?.admitCardIssuedToStudent;

  // Real score trends from completed tests
  const scoreTrends = useMemo(() => {
    return completedExams.map((exam, idx) => {
      const result = exam.results[0];
      const maxMarks = (exam._count?.questions || 0) * (exam.marksPerQuestion || 1);
      const score = maxMarks > 0 ? Math.round((result.marksObtained / maxMarks) * 100) : 0;
      return {
        name: exam.title?.substring(0, 10) || `Exam ${idx + 1}`,
        score
      };
    });
  }, [completedExams]);

  // Real competency radar mapping derived from student semester unit marks or completed exams
  const performanceData = useMemo(() => {
    const allMarks: { subject: string; A: number; fullMark: number }[] = [];
    (profile?.semesters || []).forEach((sem: any) => {
      (sem.marks || []).forEach((m: any) => {
        const pct = m.maxMarks > 0 ? Math.round((m.marksObtained / m.maxMarks) * 100) : 0;
        allMarks.push({
          subject: m.unitName || `Unit ${allMarks.length + 1}`,
          A: pct,
          fullMark: 100
        });
      });
    });

    if (allMarks.length >= 3) {
      return allMarks.slice(0, 6);
    }

    if (completedExams.length >= 3) {
      return completedExams.slice(0, 5).map((e: any, i: number) => {
        const res = e.results[0];
        const max = (e._count?.questions || 0) * (e.marksPerQuestion || 1);
        const pct = max > 0 ? Math.round((res.marksObtained / max) * 100) : 0;
        return {
          subject: e.title?.substring(0, 10) || `Topic ${i + 1}`,
          A: pct,
          fullMark: 100
        };
      });
    }

    return [];
  }, [profile, completedExams]);

  const tabs = [
    { id: "pending", label: "Live Exams", count: pendingExams.length, icon: FileText },
    { id: "completed", label: "Results", count: completedExams.length, icon: CheckCircle2 },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "guidelines", label: "Admit Card", icon: ShieldCheck },
  ];

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 w-full mx-auto">
      {/* 1. Page Header (Rule 7.1) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Examination Portal
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
            Attend computer-based assessments, view hall tickets, and review qualification scores.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link href={getTenantLink("/student/profile", tenant, pathname)}>
            <Button variant="outline" className="h-8 sm:h-9 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold gap-1.5 border-slate-200 dark:border-slate-700">
              <Award className="w-3.5 h-3.5" />
              Credentials & Certs
            </Button>
          </Link>
          <Link href={getTenantLink("/student/courses", tenant, pathname)}>
            <Button variant="outline" className="h-8 sm:h-9 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold gap-1.5 border-slate-200 dark:border-slate-700">
              <BookOpen className="w-3.5 h-3.5" />
              My Course
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Metric / Stat Cards Grid (Rule 7.2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Pending Exams */}
        <Card className="border border-slate-100 dark:border-white/5 shadow-xs rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">Live Assessments</p>
                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {pendingExams.length} <span className="text-sm font-semibold text-slate-500">Scheduled</span>
                </p>
                <p className={cn("text-[10px] font-semibold mt-0.5", pendingExams.length > 0 ? "text-blue-600 dark:text-blue-400" : "text-emerald-600 dark:text-emerald-400")}>
                  {pendingExams.length > 0 ? "Ready to attempt online" : "All exams caught up"}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                <FileText className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metric 2: Completed Exams */}
        <Card className="border border-slate-100 dark:border-white/5 shadow-xs rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">Completed Tests</p>
                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {completedExams.length} <span className="text-sm font-semibold text-slate-500">Passed</span>
                </p>
                <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  Verified assessment records
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metric 3: Overall Average Score */}
        <Card className="border border-slate-100 dark:border-white/5 shadow-xs rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">Assessment Standing</p>
                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {avgScore !== null ? `${avgScore}%` : "Pending"}
                </p>
                <p className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 mt-0.5">
                  {avgScore !== null ? (avgScore >= 75 ? "Distinction standing" : "Satisfactory passing mark") : "Awaiting initial test"}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
                <Trophy className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metric 4: Admit Card Status */}
        <Card className="border border-slate-100 dark:border-white/5 shadow-xs rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">Hall Ticket / Admit Card</p>
                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {isAdmitCardReady ? "Issued" : "Verified"}
                </p>
                <p className={cn("text-[10px] font-semibold mt-0.5", isAdmitCardReady ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400")}>
                  {isAdmitCardReady ? "Ready for download" : "Registration approved"}
                </p>
              </div>
              <div className={cn("p-2.5 rounded-lg shrink-0", isAdmitCardReady ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400")}>
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Horizontal Navigation Tabs (Rule 7.3) */}
      <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-1.5 p-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs max-w-full">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium shrink-0 whitespace-nowrap transition-all",
                isActive
                  ? "bg-slate-100 dark:bg-slate-800 text-primary dark:text-white font-semibold shadow-inner"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50"
              )}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={cn("ml-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold", isActive ? "bg-primary text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300")}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 4. Tab Contents */}
      {/* TAB 1: Pending & Scheduled Exams */}
      {activeTab === "pending" && (
        <div className="space-y-4">
          {pendingExams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {pendingExams.map((exam) => {
                const totalMarks = (exam._count?.questions || 0) * (exam.marksPerQuestion || 1);
                const takeHref = getTenantLink(`/student/exams/${exam.id}/take`, tenant, pathname);

                return (
                  <Card
                    key={exam.id}
                    className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden bg-white dark:bg-slate-900 hover:border-primary/40 transition-all flex flex-col justify-between"
                  >
                    <div className="p-3.5 sm:p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Badge variant="outline" className="mb-1 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40">
                            ONLINE CBT EXAM
                          </Badge>
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                            {exam.title}
                          </h3>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <BookOpen className="w-3.5 h-3.5" />
                            {exam.course?.title || "Enrolled Curriculum Course"}
                          </p>
                        </div>
                      </div>

                      {/* Metadata Grid (Rule 7.5 style) */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                        <div>
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Duration</span>
                          <span className="font-semibold text-xs text-slate-900 dark:text-white mt-0.5 flex items-center gap-1">
                            <Timer className="w-3 h-3 text-primary" /> {exam.duration || 60}m
                          </span>
                        </div>
                        <div>
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Questions</span>
                          <span className="font-semibold text-xs text-slate-900 dark:text-white mt-0.5 flex items-center gap-1">
                            <FileText className="w-3 h-3 text-primary" /> {exam._count?.questions || 0} Qs
                          </span>
                        </div>
                        <div>
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Total Marks</span>
                          <span className="font-semibold text-xs text-slate-900 dark:text-white mt-0.5 flex items-center gap-1">
                            <Target className="w-3 h-3 text-primary" /> {totalMarks} pts
                          </span>
                        </div>
                        <div>
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Passing</span>
                          <span className="font-semibold text-xs text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> {exam.passingMarks || Math.round(totalMarks * 0.4)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 pt-0 border-t border-slate-100 dark:border-slate-800/60 mt-2">
                      <Link href={takeHref} className="w-full">
                        <Button className="w-full h-8 sm:h-9 rounded-lg text-xs font-semibold gap-1.5 bg-primary hover:bg-primary/90 text-white shadow-xs">
                          <PlayCircle className="w-3.5 h-3.5" />
                          Start Examination Now
                        </Button>
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="rounded-xl p-8 text-center border-dashed border border-slate-200 dark:border-slate-800 bg-transparent">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3 opacity-60" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">You're All Caught Up!</h3>
              <p className="text-slate-500 font-medium mt-1 text-xs max-w-sm mx-auto">
                There are no pending examinations for your enrolled course right now. Your teacher or center administration will notify you when the next test is scheduled.
              </p>
            </Card>
          )}
        </div>
      )}

      {/* TAB 2: Completed Results */}
      {activeTab === "completed" && (
        <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden bg-white dark:bg-slate-900">
          <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 dark:text-white">
              Assessment Results & Transcripts
            </CardTitle>
            <CardDescription className="text-[11px] sm:text-xs text-slate-500">
              Historical performance records from completed online examinations
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            {completedExams.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {completedExams.map((exam) => {
                  const result = exam.results[0];
                  const totalMarks = (exam._count?.questions || 0) * (exam.marksPerQuestion || 1);
                  const isPassed = result.isPassed;
                  const pct = totalMarks > 0 ? Math.round((result.marksObtained / totalMarks) * 100) : 0;

                  return (
                    <div
                      key={exam.id}
                      className={cn(
                        "flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors gap-3 border-l-[3px]",
                        isPassed ? "border-emerald-500" : "border-rose-500"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={cn(
                            "w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border",
                            isPassed
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800/40"
                              : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800/40"
                          )}
                        >
                          {isPassed ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                            {exam.title}
                          </h4>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {exam.course?.title || "Enrolled Curriculum Course"} • Passing: {exam.passingMarks || 0}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end shrink-0">
                        <div className="text-right">
                          <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                            {result.marksObtained} / {totalMarks} pts
                          </p>
                          <span className="text-[10px] font-semibold text-slate-500">{pct}%</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider",
                            isPassed
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800/40"
                              : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800/40"
                          )}
                        >
                          {isPassed ? "PASSED" : "NEEDS RETAKE"}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center space-y-2">
                <FileText className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No Past Results Recorded</p>
                <p className="text-[10px] text-slate-400 font-medium">
                  Completed examination marks and scorecards will be listed here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB 3: Academic Analytics */}
      {activeTab === "analytics" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
          {/* Score Progression BarChart */}
          <div className="lg:col-span-7">
            <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden bg-white dark:bg-slate-900 h-full">
              <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Score Progression Across Assessments
                </CardTitle>
                <CardDescription className="text-[11px] text-slate-500">
                  Percentage trends across recent test evaluations
                </CardDescription>
              </CardHeader>

              <CardContent className="p-3.5 sm:p-4">
                {scoreTrends.length > 0 ? (
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={scoreTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.2} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 600, fill: "#94a3b8" }} />
                        <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 600, fill: "#94a3b8" }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0f172a",
                            borderRadius: "8px",
                            border: "none",
                            color: "#fff",
                            fontSize: "11px",
                            fontWeight: 600
                          }}
                          formatter={(val: any) => [`${val}%`, "Assessment Score"]}
                        />
                        <Bar dataKey="score" name="Percentage" fill={primaryColor} radius={[4, 4, 0, 0]} barSize={28} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-56 w-full flex flex-col items-center justify-center text-center p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20">
                    <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mb-1.5">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      No Assessment Trends Yet
                    </p>
                    <p className="text-[10px] text-slate-400 max-w-xs mt-0.5 leading-normal">
                      Complete scheduled computer-based assessments to generate your historical score progression curve.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Competency Radar Chart */}
          <div className="lg:col-span-5">
            <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden bg-white dark:bg-slate-900 h-full">
              <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  <Target className="w-4 h-4 text-amber-500" />
                  Subject Competency Mapping
                </CardTitle>
                <CardDescription className="text-[11px] text-slate-500">
                  Curriculum capability indicators
                </CardDescription>
              </CardHeader>

              <CardContent className="p-3.5 sm:p-4 flex items-center justify-center">
                {performanceData.length >= 3 ? (
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={performanceData}>
                        <PolarGrid stroke="#e2e8f0" strokeOpacity={0.2} />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fontWeight: 600, fill: "#64748b" }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar name="Proficiency" dataKey="A" stroke={primaryColor} strokeWidth={2} fill={primaryColor} fillOpacity={0.2} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-56 w-full flex flex-col items-center justify-center text-center p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20">
                    <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mb-1.5">
                      <Target className="h-5 w-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Competency Mapping Pending
                    </p>
                    <p className="text-[10px] text-slate-400 max-w-xs mt-0.5 leading-normal">
                      Subject capability radar will plot as unit test marks and semester marksheet evaluations are published.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 4: Admit Card & Examination Guidelines */}
      {activeTab === "guidelines" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Admit Card Status Card */}
          <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden bg-white dark:bg-slate-900">
            <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  Hall Ticket Verification
                </CardTitle>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider",
                    isAdmitCardReady ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-amber-700 bg-amber-50 border-amber-200"
                  )}
                >
                  {isAdmitCardReady ? "ISSUED & VALID" : "UNDER REGISTRATION"}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-3.5 sm:p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Enrollment No</span>
                  <span className="font-semibold text-xs text-slate-900 dark:text-white mt-0.5 block">{profile?.enrollmentNo || "Pending"}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Roll No</span>
                  <span className="font-semibold text-xs text-slate-900 dark:text-white mt-0.5 block">{profile?.rollNo || "Assigned by Center"}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Center Code</span>
                  <span className="font-semibold text-xs text-slate-900 dark:text-white mt-0.5 block">{workspace?.centerCode || tenant?.toUpperCase()}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Session</span>
                  <span className="font-semibold text-xs text-slate-900 dark:text-white mt-0.5 block">2026 Academic Session</span>
                </div>
              </div>

              <div className="pt-1">
                <Link href={getTenantLink("/student/profile", tenant, pathname)}>
                  <Button variant="outline" className="w-full h-8 rounded-lg text-xs font-semibold gap-1.5 border-slate-200 dark:border-slate-700">
                    <Download className="w-3.5 h-3.5" />
                    Download Official Admit Card
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Examination Rules Card */}
          <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden bg-white dark:bg-slate-900">
            <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-500" />
                Examination Instructions & Rules
              </CardTitle>
            </CardHeader>

            <CardContent className="p-3.5 sm:p-4 space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <p>Maintain continuous Internet connection during the test window. Timer starts immediately upon launch.</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <p>Do not refresh or switch browser tabs while attempting the exam to prevent automatic submission.</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <p>Minimum 40% aggregate required for marksheet qualification and diploma issuance eligibility.</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <p>Contact your center coordinator if you experience technical interruptions or login timeouts.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
