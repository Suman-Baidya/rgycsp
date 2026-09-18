"use client";

import React from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, PieChart as PieIcon, Users, BookOpen } from "lucide-react";

interface ChartProps {
  admissionData: { name: string; value: number }[];
  studentDistData: { name: string; value: number }[];
}

const COLORS = ["#4f46e5", "#06b6d4", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"];

export function AdminDashboardCharts({ admissionData, studentDistData }: ChartProps) {
  const totalStudentsInDist = React.useMemo(() => {
    return (studentDistData || []).reduce(
      (acc, curr) => acc + (Number(curr.value) || 0),
      0
    );
  }, [studentDistData]);

  const activeDistData = React.useMemo(() => {
    return (studentDistData || []).filter((d) => d.value > 0);
  }, [studentDistData]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
      {/* Admission Trends */}
      <Card className="rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800/60 px-3.5 sm:px-4 py-2.5 sm:py-3 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
              Admission Trends (Last 6 Months)
            </CardTitle>
          </div>
          <span className="text-[10px] font-medium text-slate-400">Monthly Enrollment</span>
        </CardHeader>
        <CardContent className="p-3.5 sm:p-4 pt-3">
          <div className="h-[210px] sm:h-[230px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={admissionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="admissionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" strokeOpacity={0.06} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 8.5, fill: "#94a3b8" }}
                  dy={4}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  tick={{ fontSize: 8.5, fill: "#94a3b8" }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "10px",
                    border: "1px solid rgba(148, 163, 184, 0.2)",
                    backgroundColor: "rgba(15, 23, 42, 0.92)",
                    color: "#ffffff",
                    boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.3)",
                    fontSize: "11px",
                    padding: "6px 10px",
                    fontWeight: 600
                  }}
                  formatter={(value: any) => [`${value} Students`, "Admissions"]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#admissionGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Course Enrollment Distribution */}
      <Card className="rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800/60 px-3.5 sm:px-4 py-2.5 sm:py-3 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <PieIcon className="h-3.5 w-3.5" />
            </div>
            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
              Course Enrollment Share
            </CardTitle>
          </div>
          <span className="text-[10px] font-medium text-slate-400">Batch Breakdown</span>
        </CardHeader>
        <CardContent className="p-3.5 sm:p-4 pt-3">
          {totalStudentsInDist > 0 && activeDistData.length > 0 ? (
            <div className="h-[210px] sm:h-[230px] w-full flex flex-col sm:flex-row items-center justify-center gap-3">
              <div className="h-full w-full sm:w-1/2 flex items-center justify-center relative min-h-[160px]">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <PieChart>
                    <Pie
                      data={activeDistData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {activeDistData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "10px",
                        border: "1px solid rgba(148, 163, 184, 0.2)",
                        backgroundColor: "rgba(15, 23, 42, 0.92)",
                        color: "#ffffff",
                        fontSize: "11px",
                        padding: "6px 10px"
                      }}
                      formatter={(value: any) => [`${value} Students`, "Enrolled"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                    {totalStudentsInDist}
                  </span>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                    Enrolled
                  </span>
                </div>
              </div>

              {/* Course Legend Breakdown */}
              <div className="w-full sm:w-1/2 flex flex-col gap-1.5 max-h-[190px] overflow-y-auto no-scrollbar pr-1">
                {activeDistData.slice(0, 5).map((course, idx) => {
                  const pct = Math.round((course.value / totalStudentsInDist) * 100);
                  return (
                    <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 dark:border-slate-800/40 last:border-none">
                      <div className="flex items-center gap-1.5 min-w-0 pr-2">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                        />
                        <span className="truncate font-medium text-slate-700 dark:text-slate-300 text-[11px]">
                          {course.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-bold text-slate-900 dark:text-white">
                          {course.value}
                        </span>
                        <span className="text-[9px] font-medium text-slate-400 w-7 text-right">
                          {pct}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-[210px] sm:h-[230px] flex flex-col items-center justify-center text-center p-4">
              <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mb-2">
                <BookOpen className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                No Batch Enrollments Yet
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5 max-w-[220px]">
                Create classroom batches and assign enrolled students to visualize program distribution.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

