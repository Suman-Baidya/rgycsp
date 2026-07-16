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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
      {/* Admission Trends */}
      <Card className="rounded-3xl border-2 border-slate-100/50 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
        <CardHeader className="border-b border-slate-50 dark:border-slate-800/50 p-6">
          <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400">
            Admission Trends
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={admissionData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" strokeOpacity={0.1} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: "currentColor", fillOpacity: 0.5 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: "currentColor", fillOpacity: 0.5 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: "16px", 
                    border: "none", 
                    boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                    fontSize: "12px",
                    fontWeight: "700"
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="var(--primary)" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Student Distribution */}
      <Card className="rounded-3xl border-2 border-slate-100/50 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
        <CardHeader className="border-b border-slate-50 dark:border-slate-800/50 p-6">
          <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400">
            Student Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie
                  data={studentDistData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {studentDistData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ 
                    borderRadius: "16px", 
                    border: "none", 
                    boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                    fontSize: "12px",
                    fontWeight: "700"
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center">
               <span className="text-3xl font-black text-slate-900 dark:text-white">
                 {studentDistData.reduce((acc, curr) => acc + curr.value, 0)}
               </span>
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Students</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
