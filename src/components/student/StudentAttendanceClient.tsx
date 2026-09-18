"use client";

import React, { useState, useMemo } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Calendar as CalendarIcon,
  Filter,
  ArrowUpRight,
  ChevronRight,
  BookOpen,
  Monitor,
  Activity,
  Layers,
  ChevronLeft,
  X,
  Search,
  CheckCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from "recharts";

interface StudentAttendanceProps {
  attendances?: any[];
  theoryAttendances: any[];
  practicalAttendances: any[];
  theoryStats: any;
  practicalStats: any;
  overallStats: any;
  theorySchedule: any;
  practicalSchedule: any[];
  settings?: any;
  tenant: string;
  workspace?: any;
}

export default function StudentAttendanceClient({
  attendances = [],
  theoryAttendances = [],
  practicalAttendances = [],
  theoryStats,
  practicalStats,
  overallStats,
  theorySchedule,
  practicalSchedule = [],
  settings,
  tenant,
  workspace
}: StudentAttendanceProps) {
  const primaryColor = settings?.primaryColor || "#0284c7";
  const [viewMode, setViewMode] = useState<"ALL" | "THEORY" | "PRACTICAL">("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 250);
  const [timeRange, setTimeRange] = useState("6m");
  const [showSchedule, setShowSchedule] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  // Active dataset according to viewMode
  const baseRecords = useMemo(() => {
    if (viewMode === "THEORY") return theoryAttendances;
    if (viewMode === "PRACTICAL") return practicalAttendances;
    return attendances.length > 0 ? attendances : [...theoryAttendances, ...practicalAttendances];
  }, [viewMode, theoryAttendances, practicalAttendances, attendances]);

  const activeStats = useMemo(() => {
    if (viewMode === "THEORY") return theoryStats;
    if (viewMode === "PRACTICAL") return practicalStats;
    return overallStats;
  }, [viewMode, theoryStats, practicalStats, overallStats]);

  // Filtering records by status and search
  const filteredRecords = useMemo(() => {
    const q = debouncedSearchQuery.toLowerCase().trim();
    return baseRecords.filter((rec: any) => {
      const matchesStatus = statusFilter === "ALL" || rec.status === statusFilter;
      if (!matchesStatus) return false;
      if (!q) return true;

      const recDate = new Date(rec.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
      return (
        recDate.toLowerCase().includes(q) ||
        (rec.remarks && rec.remarks.toLowerCase().includes(q)) ||
        (rec.type && rec.type.toLowerCase().includes(q))
      );
    });
  }, [baseRecords, statusFilter, debouncedSearchQuery]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  // Donut chart dataset
  const attendanceData = [
    { name: "Present", value: (activeStats?.present || 0) + (activeStats?.late || 0) },
    { name: "Absent", value: activeStats?.absent || 0 },
  ];

  // Monthly trend mock or derived calculation
  const monthlyTrendData = [
    { month: "Jan", present: 20, absent: 2 },
    { month: "Feb", present: 19, absent: 3 },
    { month: "Mar", present: 22, absent: 1 },
    { month: "Apr", present: 21, absent: 2 },
    { month: "May", present: 23, absent: 1 },
    { month: "Jun", present: 24, absent: 0 },
    { month: "Jul", present: 20, absent: 3 },
    { month: "Aug", present: 22, absent: 2 },
    { month: "Sep", present: 21, absent: 1 },
    { month: "Oct", present: 23, absent: 2 },
    { month: "Nov", present: 20, absent: 4 },
    { month: "Dec", present: 24, absent: 1 },
  ];

  const filteredTrend = monthlyTrendData.slice(
    timeRange === "2m" ? -2 :
    timeRange === "3m" ? -3 :
    timeRange === "6m" ? -6 : 0
  );

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 w-full mx-auto">
      {/* 1. Page Header (Rule 7.1) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Attendance Registry
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
            Monitor classroom presence, practical laboratory logs, and timetable schedule.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            variant="outline"
            onClick={() => setShowSchedule(true)}
            className="h-8 sm:h-9 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold gap-1.5 border-slate-200 dark:border-slate-700"
          >
            <CalendarIcon className="w-3.5 h-3.5 text-primary" />
            Class Schedule
          </Button>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200/80 dark:border-slate-700/60 h-8 sm:h-9">
            <button
              onClick={() => { setViewMode("ALL"); setCurrentPage(1); }}
              className={cn(
                "px-2.5 sm:px-3 py-1 rounded-md text-xs font-semibold transition-all",
                viewMode === "ALL"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
              )}
            >
              All
            </button>
            <button
              onClick={() => { setViewMode("THEORY"); setCurrentPage(1); }}
              className={cn(
                "px-2.5 sm:px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1",
                viewMode === "THEORY"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
              )}
            >
              <BookOpen className="w-3 h-3" /> Theory
            </button>
            <button
              onClick={() => { setViewMode("PRACTICAL"); setCurrentPage(1); }}
              className={cn(
                "px-2.5 sm:px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1",
                viewMode === "PRACTICAL"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
              )}
            >
              <Monitor className="w-3 h-3" /> Practical
            </button>
          </div>
        </div>
      </div>

      {/* 2. Metric / Stat Cards Grid (Rule 7.2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Rate */}
        <Card className="border border-slate-100 dark:border-white/5 shadow-xs rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">Attendance Rate</p>
                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{activeStats?.percentage ?? 100}%</p>
                <p className={cn("text-[10px] font-semibold mt-0.5", (activeStats?.percentage ?? 100) >= 75 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400")}>
                  {(activeStats?.percentage ?? 100) >= 75 ? "Eligible for final exams" : "Requirement is 75%"}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metric 2: Present Days */}
        <Card className="border border-slate-100 dark:border-white/5 shadow-xs rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">Present Days</p>
                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {(activeStats?.present || 0) + (activeStats?.late || 0)}
                </p>
                <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {activeStats?.late > 0 ? `${activeStats.late} late arrivals counted` : "Regular attendance"}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                <ArrowUpRight className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metric 3: Absent Days */}
        <Card className="border border-slate-100 dark:border-white/5 shadow-xs rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">Absences</p>
                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {activeStats?.absent || 0}
                </p>
                <p className={cn("text-[10px] font-semibold mt-0.5", (activeStats?.absent || 0) > 3 ? "text-rose-600 dark:text-rose-400" : "text-slate-400")}>
                  {(activeStats?.absent || 0) === 0 ? "Perfect attendance" : "Unexcused sessions"}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 shrink-0">
                <XCircle className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metric 4: Total Sessions */}
        <Card className="border border-slate-100 dark:border-white/5 shadow-xs rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">Total Classes</p>
                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {activeStats?.total || 0}
                </p>
                <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                  Conducted by center faculty
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                <BookOpen className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Analytics Section (Rule 7.4 Main Card) */}
      <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden bg-white dark:bg-slate-900">
        <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 dark:text-white">
              Attendance Distribution & Monthly Breakdown
            </CardTitle>
            <CardDescription className="text-[11px] sm:text-xs text-slate-500">
              Comparative review of attended vs missed lectures
            </CardDescription>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200/80 dark:border-slate-700/60 self-start sm:self-center">
            {[
              { label: "2 Months", value: "2m" },
              { label: "3 Months", value: "3m" },
              { label: "6 Months", value: "6m" },
            ].map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all",
                  timeRange === range.value
                    ? "bg-white dark:bg-slate-900 text-primary dark:text-white shadow-xs font-bold"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                {range.label}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-3.5 sm:p-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            {/* Visual Ratio Donut */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/60">
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
                      <Cell fill="#ef4444" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {activeStats?.percentage ?? 100}%
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Present Rate</span>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-2 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primaryColor }}></span>
                  <span>Present ({attendanceData[0].value})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span>Absent ({attendanceData[1].value})</span>
                </div>
              </div>
            </div>

            {/* Monthly Trend Bars */}
            <div className="lg:col-span-8">
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filteredTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 600, fill: "#94a3b8" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 600, fill: "#94a3b8" }}
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
                    />
                    <Bar dataKey="present" name="Present Days" fill={primaryColor} radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar dataKey="absent" name="Absent Days" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>Minimum 75% mandatory for hall ticket issuance</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Registry Updated Daily
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Attendance Log Records Table / List (Rule 7.4 & 7.5) */}
      <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden bg-white dark:bg-slate-900">
        <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 dark:text-white">
              Class Attendance History
            </CardTitle>
            <CardDescription className="text-[11px] sm:text-xs text-slate-500">
              Showing {filteredRecords.length} recorded session log{filteredRecords.length === 1 ? "" : "s"}
            </CardDescription>
          </div>

          {/* Filter Toolbar (Rule 7.4) */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-48">
              <Search className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none h-3.5 w-3.5 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Search date or remarks..."
                className="h-8 pl-8 pr-3 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 rounded-lg text-xs placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 h-8">
              {["ALL", "PRESENT", "LATE", "ABSENT"].map((st) => (
                <button
                  key={st}
                  onClick={() => { setStatusFilter(st); setCurrentPage(1); }}
                  className={cn(
                    "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase transition-all",
                    statusFilter === st
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
                  )}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {paginatedRecords.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {paginatedRecords.map((record: any, idx: number) => {
                const recDate = new Date(record.date);
                const isPresent = record.status === "PRESENT";
                const isLate = record.status === "LATE";
                const isAbsent = record.status === "ABSENT";

                const statusColor = isPresent
                  ? "border-emerald-500"
                  : isLate
                  ? "border-amber-500"
                  : "border-rose-500";

                return (
                  <div
                    key={record.id || idx}
                    className={cn(
                      "flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors gap-3 group border-l-[3px]",
                      statusColor
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={cn(
                          "w-9 h-9 rounded-lg flex flex-col items-center justify-center font-bold text-xs shrink-0 border",
                          isPresent
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800/40"
                            : isLate
                            ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800/40"
                            : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800/40"
                        )}
                      >
                        <span className="text-[9px] uppercase leading-none font-bold">
                          {recDate.toLocaleString("en-US", { month: "short" })}
                        </span>
                        <span className="text-xs font-black leading-none mt-0.5">
                          {recDate.getDate()}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">
                            {recDate.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                          </h4>
                          <Badge variant="outline" className="text-[9px] font-bold px-1.5 py-0.2 rounded uppercase border-slate-200 dark:border-slate-700 text-slate-500">
                            {record.type || "THEORY"}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                          {record.remarks || "Regular session attendance recorded by instructor."}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end shrink-0">
                      <span
                        className={cn(
                          "text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider",
                          isPresent
                            ? "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/40"
                            : isLate
                            ? "text-amber-700 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/40"
                            : "text-rose-700 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/40"
                        )}
                      >
                        {record.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No Attendance Records Found</p>
              <p className="text-[10px] text-slate-400 font-medium">
                No matching sessions recorded for the selected filter or date.
              </p>
            </div>
          )}
        </CardContent>

        {/* Standard Pagination (Rule 7.6) */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20">
            <span className="text-xs font-medium text-slate-500">
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredRecords.length)} of {filteredRecords.length}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="h-7 px-2 rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xs text-xs font-semibold"
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Prev
              </Button>

              <span className="px-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                {currentPage} / {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="h-7 px-2 rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xs text-xs font-semibold"
              >
                Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* 5. Class Schedule Dialog Modal (Rule 7.7) */}
      <Dialog open={showSchedule} onOpenChange={setShowSchedule}>
        <DialogContent className="max-w-2xl rounded-2xl p-4 sm:p-6 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
          <DialogHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <CalendarIcon className="w-4 h-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
                  My Weekly Timetable & Schedule
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Assigned theory lecture timings and laboratory practical slots
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 pt-3">
            {/* Theory Batch Routine */}
            <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-primary" /> Theory Classroom Batch
                </span>
                <Badge variant="outline" className="text-[9px] font-bold px-1.5 py-0.2 rounded uppercase">
                  Classroom Slot
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Batch Name</span>
                  <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">{theorySchedule?.batchName || "Standard Batch"}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Timings & Routine</span>
                  <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">{theorySchedule?.schedule || "Regular daily schedule"}</span>
                </div>
              </div>
            </div>

            {/* Practical Lab Slots */}
            <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5 text-amber-500" /> Laboratory Practical Slots
                </span>
                <Badge variant="outline" className="text-[9px] font-bold px-1.5 py-0.2 rounded uppercase border-amber-300 dark:border-amber-700 text-amber-600">
                  Lab Practical
                </Badge>
              </div>

              {practicalSchedule && practicalSchedule.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {practicalSchedule.map((ps: any, idx: number) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-md bg-amber-500/10 text-amber-600 font-bold text-xs flex items-center justify-center uppercase">
                          {daysOfWeek[ps.dayOfWeek]?.substring(0, 3) || "DAY"}
                        </span>
                        <div>
                          <p className="font-semibold text-xs text-slate-900 dark:text-white">{daysOfWeek[ps.dayOfWeek]}</p>
                          <p className="text-[10px] text-slate-400">{ps.slot?.startTime} - {ps.slot?.endTime}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[8px] font-bold px-1.5 py-0.2 rounded">
                        Lab Slot
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic pt-1">
                  No dedicated practical computer lab slots registered. Hands-on practicals are included within regular classroom sessions.
                </p>
              )}
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSchedule(false)}
              className="h-8 px-4 rounded-lg text-xs font-semibold"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
