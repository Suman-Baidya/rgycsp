"use client";

import React from "react";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar as CalendarIcon, 
  Filter,
  Download,
  ArrowUpRight,
  ChevronRight,
  Activity,
  BarChart2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

export default function StudentAttendanceClient({ 
  attendances, 
  stats, 
  settings, 
  tenant 
}: { 
  attendances: any[], 
  stats: any, 
  settings: any, 
  tenant: string 
}) {
  const primaryColor = settings?.primaryColor || "#0f172a";
  const [timeRange, setTimeRange] = React.useState("6m");

  const attendanceData = [
    { name: "Present", value: stats.present + stats.late },
    { name: "Absent", value: stats.absent },
  ];

  const allMonthlyTrend = [
    { month: "Jan", present: 20, absent: 2 },
    { month: "Feb", present: 18, absent: 4 },
    { month: "Mar", present: 22, absent: 1 },
    { month: "Apr", present: 19, absent: 3 },
    { month: "May", present: 21, absent: 2 },
    { month: "Jun", present: 23, absent: 0 },
    { month: "Jul", present: 20, absent: 2 },
    { month: "Aug", present: 18, absent: 4 },
    { month: "Sep", present: 22, absent: 1 },
    { month: "Oct", present: 19, absent: 3 },
    { month: "Nov", present: 21, absent: 2 },
    { month: "Dec", present: 23, absent: 0 },
  ];

  const filteredTrend = allMonthlyTrend.slice(
    timeRange === "2m" ? -2 : 
    timeRange === "3m" ? -3 : 
    timeRange === "6m" ? -6 : 
    timeRange === "12m" ? -12 : 0
  );

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-12 pb-24">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Attendance Tracker</h1>
          <p className="text-slate-500 font-medium text-lg">Monitor your presence and punctuality trends.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="rounded-2xl font-bold gap-2 h-12 px-6 border-slate-200 dark:border-white/10">
            <Filter className="w-4 h-4" /> Filter Records
          </Button>
          <Button className="rounded-2xl font-bold gap-2 h-12 px-8 shadow-xl shadow-primary/20" style={{ backgroundColor: primaryColor }}>
            <Download className="w-4 h-4" /> Export Report
          </Button>
        </div>
      </div>

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatsCard 
          label="Attendance Rate" 
          value={`${stats.percentage}%`} 
          subtext="Overall performance"
          icon={<ArrowUpRight className="w-5 h-5" />} 
          color={primaryColor} 
        />
        <StatsCard 
          label="Present Days" 
          value={stats.present.toString()} 
          subtext="On-time sessions"
          icon={<CheckCircle2 className="w-5 h-5" />} 
          color="#10b981" 
        />
        <StatsCard 
          label="Late Arrivals" 
          value={stats.late.toString()} 
          subtext="Needs attention"
          icon={<Clock className="w-5 h-5" />} 
          color="#f59e0b" 
        />
        <StatsCard 
          label="Absent Days" 
          value={stats.absent.toString()} 
          subtext="Unexcused leaves"
          icon={<XCircle className="w-5 h-5" />} 
          color="#ef4444" 
        />
      </div>

      {/* Monthly Trend Report */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <div className="w-2 h-8 rounded-full" style={{ backgroundColor: primaryColor }} />
            Attendance Analytics
          </h2>
        </div>

        <Card className="rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-2xl bg-white dark:bg-zinc-900/50 overflow-hidden">
          <CardHeader className="px-8 pt-8 pb-6 border-b border-slate-50 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold tracking-tight">Monthly Presence Trend</CardTitle>
              <CardDescription className="font-bold text-slate-400">Comparative analysis of present vs absent sessions per month</CardDescription>
            </div>
            
            <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-2xl self-start md:self-center border border-slate-200 dark:border-white/5 overflow-x-auto max-w-full">
              {[
                { label: "2M", value: "2m" },
                { label: "3M", value: "3m" },
                { label: "6M", value: "6m" },
                { label: "12M", value: "12m" },
                { label: "Total", value: "all" },
              ].map((range) => (
                <button
                  key={range.value}
                  onClick={() => setTimeRange(range.value)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-300",
                    timeRange === range.value 
                      ? "bg-white dark:bg-zinc-800 text-primary shadow-sm" 
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="h-96 pt-12 pb-6 px-8">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 600, fill: '#94a3b8' }} 
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }} 
                />
                <Legend iconType="circle" />
                <Bar 
                  dataKey="present" 
                  name="Present Days" 
                  fill={primaryColor} 
                  radius={[6, 6, 0, 0]} 
                  barSize={32}
                />
                <Bar 
                  dataKey="absent" 
                  name="Absent Days" 
                  fill="#ef4444" 
                  radius={[6, 6, 0, 0]} 
                  barSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Attendance Chart */}
        <div className="lg:col-span-4">
          <Card className="rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-2xl bg-white dark:bg-zinc-900/50 overflow-hidden h-full">
            <CardHeader className="px-8 pt-8 pb-6 border-b border-slate-50 dark:border-white/5 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold tracking-tight">Visual Report</CardTitle>
                <CardDescription className="font-bold text-slate-400">Overall presence vs absence ratio</CardDescription>
              </div>
              <Activity className="w-5 h-5 text-slate-400" />
            </CardHeader>
            <CardContent className="h-80 flex items-center justify-center relative p-8">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={attendanceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    <Cell fill={primaryColor} />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pt-8">
                <span className="text-4xl font-bold" style={{ color: primaryColor }}>{stats.percentage}%</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rate</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Logs */}
        <div className="lg:col-span-8">
          <Card className="rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-2xl bg-white dark:bg-zinc-900/50 overflow-hidden h-full">
            <CardHeader className="px-8 pt-8 pb-6 border-b border-slate-50 dark:border-white/5 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold tracking-tight">Attendance Logs</CardTitle>
                <CardDescription className="font-bold text-slate-400">Your recent daily presence and punctuality data</CardDescription>
              </div>
              <CalendarIcon className="w-5 h-5 text-slate-400" />
            </CardHeader>
            <CardContent className="p-0">
              {attendances.length > 0 ? (
                <div className="divide-y divide-slate-50 dark:divide-white/5">
                  {attendances.map((record: any) => (
                    <div key={record.id} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                      <div className="flex items-center gap-6">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform duration-500 group-hover:scale-110",
                          record.status === "PRESENT" ? "bg-emerald-500" : record.status === "ABSENT" ? "bg-red-500" : "bg-amber-500"
                        )} style={{ 
                          boxShadow: `0 8px 20px -6px ${record.status === "PRESENT" ? "#10b981" : record.status === "ABSENT" ? "#ef4444" : "#f59e0b"}60`
                        }}>
                          {record.status === "PRESENT" && <CheckCircle2 className="w-6 h-6" />}
                          {record.status === "ABSENT" && <XCircle className="w-6 h-6" />}
                          {record.status === "LATE" && <Clock className="w-6 h-6" />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-lg">{new Date(record.date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{new Date(record.date).toLocaleDateString('en-IN', { weekday: 'long' })}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className={cn(
                          "rounded-xl font-bold text-[10px] px-4 py-1.5 tracking-wider uppercase border-2",
                          record.status === "PRESENT" ? "border-emerald-500/10 bg-emerald-500/5 text-emerald-500" : 
                          record.status === "ABSENT" ? "border-red-500/10 bg-red-500/5 text-red-500" : 
                          "border-amber-500/10 bg-amber-500/5 text-amber-500"
                        )}>
                          {record.status}
                        </Badge>
                        <ChevronRight className="w-5 h-5 text-slate-200" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-24 text-center">
                  <div className="w-20 h-20 rounded-3xl bg-slate-50 dark:bg-white/5 flex items-center justify-center mx-auto mb-6">
                    <CalendarIcon className="w-10 h-10 text-slate-200" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Records Yet</h3>
                  <p className="text-slate-500 font-medium max-w-xs mx-auto text-sm">Attendance logs will appear here once your instructors start recording your presence.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ label, value, subtext, icon, color }: any) {
  return (
    <Card className="rounded-[2rem] border border-slate-100 dark:border-white/5 bg-white dark:bg-zinc-900/50 shadow-sm hover:shadow-xl transition-all duration-500 group overflow-hidden">
      <CardContent className="p-8 relative">
        {/* Subtle background accent */}
        <div 
          className="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-5 group-hover:opacity-10 transition-opacity blur-2xl" 
          style={{ backgroundColor: color }}
        />
        
        <div className="flex flex-col gap-6">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-3" 
            style={{ 
              backgroundColor: color,
              boxShadow: `0 8px 20px -6px ${color}60`
            }}
          >
            {React.cloneElement(icon as React.ReactElement<any>, { className: "w-6 h-6" })}
          </div>
          
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</h3>
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
