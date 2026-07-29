"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  BookOpen,
  Monitor,
  X
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
  theoryAttendances, 
  practicalAttendances,
  theoryStats,
  practicalStats, 
  theorySchedule,
  practicalSchedule,
  settings, 
  tenant 
}: { 
  theoryAttendances: any[], 
  practicalAttendances: any[],
  theoryStats: any, 
  practicalStats: any, 
  theorySchedule: any,
  practicalSchedule: any[],
  settings: any, 
  tenant: string 
}) {
  const primaryColor = settings?.primaryColor || "#0f172a";
  const [timeRange, setTimeRange] = useState("6m");
  const [viewMode, setViewMode] = useState<"THEORY" | "PRACTICAL">("THEORY");
  const [showSchedule, setShowSchedule] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const activeAttendances = viewMode === "THEORY" ? theoryAttendances : practicalAttendances;
  const activeStats = viewMode === "THEORY" ? theoryStats : practicalStats;
  const activeColor = viewMode === "THEORY" ? primaryColor : "#f59e0b";

  const attendanceData = [
    { name: "Present", value: activeStats.present + activeStats.late },
    { name: "Absent", value: activeStats.absent },
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
          <Button 
            variant={showSchedule ? "default" : "outline"}
            onClick={() => setShowSchedule(!showSchedule)}
            className="rounded-2xl font-bold gap-2 h-11 px-6 shadow-sm border-slate-200 dark:border-white/10 hidden sm:flex"
            style={showSchedule ? { backgroundColor: primaryColor, color: "white" } : {}}
          >
            <CalendarIcon className="w-4 h-4" /> My Schedule
          </Button>

          <div className="flex bg-slate-100 dark:bg-zinc-800/50 p-1 rounded-2xl h-11">
            <button
              onClick={() => setViewMode("THEORY")}
              className={cn(
                "px-6 py-2.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 flex items-center gap-2",
                viewMode === "THEORY" 
                  ? "bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-sm" 
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              <BookOpen className="w-4 h-4" /> Theory
            </button>
            <button
              onClick={() => setViewMode("PRACTICAL")}
              className={cn(
                "px-6 py-2.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 flex items-center gap-2",
                viewMode === "PRACTICAL" 
                  ? "bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-sm" 
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              <Monitor className="w-4 h-4" /> Practical
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Schedule Button */}
      <div className="sm:hidden w-full">
        <Button 
          variant={showSchedule ? "default" : "outline"}
          onClick={() => setShowSchedule(!showSchedule)}
          className="rounded-2xl font-bold gap-2 w-full h-12 shadow-sm border-slate-200 dark:border-white/10"
          style={showSchedule ? { backgroundColor: primaryColor, color: "white" } : {}}
        >
          <CalendarIcon className="w-4 h-4" /> My Schedule
        </Button>
      </div>

      {/* Schedule Modal Popup via Portal */}
      {mounted && showSchedule && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-50 dark:bg-zinc-900 w-full max-w-4xl rounded-[2.5rem] shadow-2xl border border-slate-200/50 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
            <div className="px-8 py-6 border-b border-slate-200/50 dark:border-white/5 flex items-center justify-between bg-white dark:bg-zinc-900 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: primaryColor }}>
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">My Weekly Schedule</h2>
                  <p className="text-sm font-medium text-slate-500">Your assigned batch and lab slots</p>
                </div>
              </div>
              <button 
                onClick={() => setShowSchedule(false)}
                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-zinc-800/50 overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-2 h-full" style={{ backgroundColor: primaryColor }} />
                  <CardHeader className="pb-2 px-8 pt-8">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <BookOpen className="w-6 h-6" style={{ color: primaryColor }} /> Theory Batch
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-8 pb-8">
                    <div className="space-y-6 mt-4">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Assigned Batch</p>
                        <p className="font-bold text-slate-900 dark:text-white text-xl">{theorySchedule.batchName}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Class Timings</p>
                        <p className="font-medium text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-50 dark:bg-zinc-900 p-4 rounded-2xl border border-slate-100 dark:border-white/5">{theorySchedule.schedule}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-zinc-800/50 overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-2 h-full bg-amber-500" />
                  <CardHeader className="pb-2 px-8 pt-8">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <Monitor className="w-6 h-6 text-amber-500" /> Practical Lab Slots
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-8 pb-8">
                    {practicalSchedule && practicalSchedule.length > 0 ? (
                      <div className="space-y-3 mt-4">
                        {practicalSchedule.map((ps: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-zinc-900 hover:border-amber-500/30 transition-colors">
                            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex flex-col items-center justify-center font-bold text-sm uppercase shrink-0">
                              {daysOfWeek[ps.dayOfWeek].substring(0, 3)}
                            </div>
                            <div>
                              <p className="font-bold text-base text-slate-900 dark:text-white">{daysOfWeek[ps.dayOfWeek]}</p>
                              <p className="text-sm font-medium text-slate-500">{ps.slot?.startTime} - {ps.slot?.endTime}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-4 p-8 text-center rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-dashed border-slate-200 dark:border-white/10">
                        <Monitor className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm font-medium text-slate-500">No practical lab slots assigned yet.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatsCard 
          label={`${viewMode === 'THEORY' ? 'Theory' : 'Practical'} Attendance`} 
          value={`${activeStats.percentage}%`} 
          subtext="Overall performance"
          icon={<ArrowUpRight className="w-5 h-5" />} 
          color={activeColor} 
        />
        <StatsCard 
          label="Present Days" 
          value={activeStats.present.toString()} 
          subtext="On-time sessions"
          icon={<CheckCircle2 className="w-5 h-5" />} 
          color="#10b981" 
        />
        <StatsCard 
          label="Absent Days" 
          value={activeStats.absent.toString()} 
          subtext="Unexcused leaves"
          icon={<XCircle className="w-5 h-5" />} 
          color="#ef4444" 
        />
        <StatsCard 
          label="Total Classes" 
          value={activeStats.total.toString()} 
          subtext="Conducted sessions"
          icon={<BookOpen className="w-5 h-5" />} 
          color="#3b82f6" 
        />
      </div>

      {/* Monthly Trend Report */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <div className="w-2 h-8 rounded-full" style={{ backgroundColor: activeColor }} />
            {viewMode === 'THEORY' ? 'Theory' : 'Practical'} Analytics
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
                  style={{ color: timeRange === range.value ? activeColor : undefined }}
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
                  fill={activeColor} 
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
                    <Cell fill={activeColor} />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pt-8">
                <span className="text-4xl font-bold" style={{ color: activeColor }}>{activeStats.percentage}%</span>
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
              {activeAttendances.length > 0 ? (
                <div className="divide-y divide-slate-50 dark:divide-white/5 max-h-[400px] overflow-y-auto custom-scrollbar">
                  {activeAttendances.map((record: any) => (
                    <div key={record.id} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                      <div className="flex items-center gap-6">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform duration-500 group-hover:brightness-110",
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
                  <p className="text-slate-500 font-medium max-w-xs mx-auto text-sm">No {viewMode.toLowerCase()} attendance logs found.</p>
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
        <div 
          className="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-5 group-hover:opacity-10 transition-opacity blur-2xl" 
          style={{ backgroundColor: color }}
        />
        
        <div className="flex flex-col gap-6">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all duration-500 group-hover:brightness-110 group-hover:rotate-3" 
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
