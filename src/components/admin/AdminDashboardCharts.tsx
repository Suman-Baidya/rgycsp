"use client";

import React from "react";
import {
  BarChart,
  Bar,
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

interface ChartProps {
  admissionData: any[];
  studentDistData: any[];
}

export function AdminDashboardCharts({ admissionData, studentDistData }: ChartProps) {
  const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
      {/* Admission Trends */}
      <Card className="rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
        <CardHeader className="border-b border-slate-50 dark:border-slate-800/50 px-4 py-3">
          <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Admission Trends
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="h-[230px] sm:h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={admissionData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" strokeOpacity={0.08} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: "currentColor", fillOpacity: 0.5 }}
                  dy={6}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: "currentColor", fillOpacity: 0.5 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: "12px", 
                    border: "1px solid rgba(148, 163, 184, 0.2)", 
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    color: "#ffffff",
                    boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.2)",
                    fontSize: "11px",
                    fontWeight: "700"
                  }} 
                  itemStyle={{ color: "#38bdf8" }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#0284c7" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Student Distribution */}
      <Card className="rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
        <CardHeader className="border-b border-slate-50 dark:border-slate-800/50 px-4 py-3">
          <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Student Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="h-[230px] sm:h-[250px] w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie
                  data={studentDistData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={6}
                  dataKey="value"
                >
                  {studentDistData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: "12px", 
                    border: "1px solid rgba(148, 163, 184, 0.2)", 
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    color: "#ffffff",
                    boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.2)",
                    fontSize: "11px",
                    fontWeight: "700"
                  }} 
                  itemStyle={{ color: "#38bdf8" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center pointer-events-none">
               <span className="text-2xl font-black text-slate-900 dark:text-white">
                 {studentDistData.reduce((acc, curr) => acc + curr.value, 0)}
               </span>
               <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Students</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
