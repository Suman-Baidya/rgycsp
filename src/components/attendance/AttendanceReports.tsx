"use client";

import { useState, useEffect, useMemo } from "react";
import { getBatchAttendanceReport, getStudentAttendanceStats } from "@/app/actions/attendance";
import { getStudents } from "@/app/actions/students";
import { Calendar, Users, ChevronDown, CheckCircle2, XCircle, Search, CalendarDays, LineChart as LineChartIcon, Activity } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type DurationType = "LAST_MONTH" | "LAST_6_MONTHS" | "FULL_COURSE";

export default function AttendanceReports({ batches, workspaceId }: { batches: any[], workspaceId: string }) {
  const [viewMode, setViewMode] = useState<"BATCH" | "STUDENT">("BATCH");
  const [selectedBatch, setSelectedBatch] = useState(batches[0]?.id || "");
  const [selectedDuration, setSelectedDuration] = useState<DurationType>("LAST_MONTH");
  const [attendanceType, setAttendanceType] = useState<"THEORY" | "PRACTICAL">("THEORY");
  const [isLoading, setIsLoading] = useState(false);
  
  // Data states
  const [batchData, setBatchData] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [batchStats, setBatchStats] = useState({ totalStudents: 0, totalClasses: 0, avgAttendance: 0 });
  
  // Student View State
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [studentStats, setStudentStats] = useState<any>(null);
  const [globalStudents, setGlobalStudents] = useState<any[]>([]);

  useEffect(() => {
    if (viewMode === "BATCH" && selectedBatch) {
      loadBatchReport();
    }
  }, [selectedBatch, selectedDuration, viewMode]);

  useEffect(() => {
    if (viewMode === "STUDENT" && selectedStudent) {
      loadStudentStats();
    }
  }, [selectedStudent, viewMode]);

  const loadGlobalStudents = async () => {
    setIsLoading(true);
    const result = await getStudents(workspaceId);
    if (result.success) {
      setGlobalStudents(result.data || []);
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
  };

  const handleSwitchToStudentView = () => {
    setViewMode("STUDENT");
    if (globalStudents.length === 0) {
      loadGlobalStudents();
    }
  };

  const loadBatchReport = async () => {
    setIsLoading(true);
    const result = await getBatchAttendanceReport(selectedBatch, selectedDuration);
    if (result.success) {
      setBatchData(result.data || []);
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
  };

  const loadStudentStats = async () => {
    setIsLoading(true);
    const result = await getStudentAttendanceStats(selectedStudent);
    if (result.success) {
      setStudentStats(result.data);
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (batchData.length > 0) {
      const totalStudents = batchData.length;
      const dateMap = new Map<string, { present: number, absent: number, dateObj: Date }>();
      let overallPresent = 0;
      let overallTotal = 0;

      batchData.forEach(student => {
        const filteredAttendances = student.attendances.filter((a: any) => a.type === attendanceType);
        
        filteredAttendances.forEach((a: any) => {
          const dObj = new Date(a.date);
          const dStr = dObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
          if (!dateMap.has(dStr)) {
            dateMap.set(dStr, { present: 0, absent: 0, dateObj: dObj });
          }
          const stats = dateMap.get(dStr)!;
          if (a.status === "PRESENT") {
            stats.present++;
            overallPresent++;
          }
          if (a.status === "ABSENT") {
            stats.absent++;
          }
          if (a.status === "PRESENT" || a.status === "ABSENT") {
            overallTotal++;
          }
        });
      });

      const avgAttendance = overallTotal > 0 ? Math.round((overallPresent / overallTotal) * 100) : 0;
      setBatchStats({
        totalStudents,
        totalClasses: dateMap.size,
        avgAttendance
      });

      // Sort chronological
      const sortedEntries = Array.from(dateMap.entries()).sort((a, b) => a[1].dateObj.getTime() - b[1].dateObj.getTime());
      
      const cData = sortedEntries.map(([dateStr, stats]) => ({
        date: dateStr,
        Present: stats.present,
        Absent: stats.absent
      }));
      setChartData(cData);
    } else {
      setBatchStats({ totalStudents: 0, totalClasses: 0, avgAttendance: 0 });
      setChartData([]);
    }
  }, [batchData, attendanceType]);

  // Student filtering for Student View
  const filteredStudents = useMemo(() => {
    return globalStudents.filter(s => 
      s.fullName.toLowerCase().includes(studentSearch.toLowerCase()) || 
      (s.enrollmentNo && s.enrollmentNo.toLowerCase().includes(studentSearch.toLowerCase()))
    );
  }, [globalStudents, studentSearch]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 mt-8">
      
      {/* Consolidated Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex gap-4 w-full md:w-auto overflow-x-auto custom-scrollbar pb-2 md:pb-0">
          <button 
            onClick={() => setViewMode("BATCH")}
            className={cn(
              "whitespace-nowrap px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
              viewMode === "BATCH" 
                ? "bg-primary text-primary-foreground shadow-md" 
                : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
            )}
          >
            Batch Monthly View
          </button>
          <button 
            onClick={handleSwitchToStudentView}
            className={cn(
              "whitespace-nowrap px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
              viewMode === "STUDENT" 
                ? "bg-primary text-primary-foreground shadow-md" 
                : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
            )}
          >
            Student Summary View
          </button>
        </div>

        {viewMode === "BATCH" && (
          <div className="bg-slate-100 dark:bg-slate-800/50 p-1 rounded-2xl inline-flex shadow-inner w-full md:w-auto">
            <button
              onClick={() => setAttendanceType("THEORY")}
              className={cn(
                "flex-1 md:flex-none px-8 py-3 rounded-xl text-sm font-black transition-all",
                attendanceType === "THEORY"
                  ? "bg-white dark:bg-slate-700 text-primary shadow-md"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              Theory Classes
            </button>
            <button
              onClick={() => setAttendanceType("PRACTICAL")}
              className={cn(
                "flex-1 md:flex-none px-8 py-3 rounded-xl text-sm font-black transition-all",
                attendanceType === "PRACTICAL"
                  ? "bg-white dark:bg-slate-700 text-primary shadow-md"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              Practical Classes
            </button>
          </div>
        )}
      </div>

      {viewMode === "BATCH" && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-end bg-white dark:bg-slate-900 p-6 rounded-3xl border-2 border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex-1 w-full space-y-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" /> Select Batch
              </label>
              <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                <SelectTrigger className="h-14 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-slate-100 dark:border-slate-800 font-bold focus:ring-primary/20 transition-all">
                  <SelectValue placeholder="Select batch">
                    {batches.find(b => b.id === selectedBatch)?.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-2 border-slate-100 dark:border-slate-800 shadow-xl">
                  {batches.map(b => (
                    <SelectItem key={b.id} value={b.id} className="font-semibold py-3 cursor-pointer">
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full md:w-64 space-y-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-primary" /> Duration
              </label>
              <Select value={selectedDuration} onValueChange={(v) => setSelectedDuration(v as DurationType)}>
                <SelectTrigger className="h-14 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-slate-100 dark:border-slate-800 font-bold focus:ring-primary/20 transition-all">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-2 border-slate-100 dark:border-slate-800 shadow-xl">
                  <SelectItem value="LAST_MONTH" className="font-semibold py-3 cursor-pointer">Last Month</SelectItem>
                  <SelectItem value="LAST_6_MONTHS" className="font-semibold py-3 cursor-pointer">Last 6 Months</SelectItem>
                  <SelectItem value="FULL_COURSE" className="font-semibold py-3 cursor-pointer">Full Course Duration</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {!isLoading && batchData.length > 0 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* Batch Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border-2 border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-center gap-2 relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 opacity-5">
                    <Users className="w-32 h-32" />
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Students</span>
                  <span className="text-4xl font-black text-slate-800 dark:text-white">{batchStats.totalStudents}</span>
                </div>
                
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border-2 border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-center gap-2 relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 opacity-5">
                    <Activity className="w-32 h-32" />
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Classes Conducted</span>
                  <span className="text-4xl font-black text-slate-800 dark:text-white">{batchStats.totalClasses}</span>
                </div>
                
                <div className="bg-primary/5 p-6 rounded-3xl border-2 border-primary/20 shadow-sm flex flex-col justify-center gap-2 relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 opacity-5 text-primary">
                    <LineChartIcon className="w-32 h-32" />
                  </div>
                  <span className="text-xs font-bold text-primary/70 uppercase tracking-widest">Avg Batch Attendance</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-primary">{batchStats.avgAttendance}%</span>
                  </div>
                </div>
              </div>

              {/* Time-Series Graph */}
              {chartData.length > 0 && (
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-3">
                    <LineChartIcon className="w-5 h-5 text-primary" />
                    Attendance Trend
                  </h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis 
                          dataKey="date" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 12, fill: '#94a3b8' }} 
                          dy={10}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 12, fill: '#94a3b8' }}
                        />
                        <Tooltip 
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          cursor={{ stroke: '#cbd5e1', strokeWidth: 2, strokeDasharray: '5 5' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="Present" 
                          stroke="#10b981" 
                          strokeWidth={3}
                          fillOpacity={1} 
                          fill="url(#colorPresent)" 
                          activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                    <th className="px-6 py-4 font-bold text-slate-500 border-r border-slate-100 dark:border-slate-700">Student Info</th>
                    <th className="px-6 py-4 font-bold text-slate-500 text-center">Total Classes</th>
                    <th className="px-6 py-4 font-bold text-slate-500 text-center">Present</th>
                    <th className="px-6 py-4 font-bold text-slate-500 text-center">Absent</th>
                    <th className="px-6 py-4 font-bold text-slate-500 text-center">Avg %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400 animate-pulse">Loading report...</td>
                    </tr>
                  ) : batchData.length > 0 ? (
                    batchData.map((student) => {
                      const filteredAttendances = student.attendances.filter((a: any) => a.type === attendanceType);
                      const totalMarkedDays = filteredAttendances.length;
                      const presentDays = filteredAttendances.filter((a: any) => a.status === "PRESENT").length;
                      const absentDays = filteredAttendances.filter((a: any) => a.status === "ABSENT").length;
                      
                      const percent = totalMarkedDays > 0 ? Math.round((presentDays / totalMarkedDays) * 100) : 0;
                      
                      return (
                        <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="px-6 py-4 border-r border-slate-100 dark:border-slate-800 group-hover:bg-slate-50 dark:group-hover:bg-slate-800">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900 dark:text-white">{student.fullName}</span>
                              <span className="text-[10px] text-slate-400">{student.enrollmentNo}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center font-bold text-slate-600 dark:text-slate-400">{totalMarkedDays}</td>
                          <td className="px-6 py-4 text-center font-bold text-emerald-600 dark:text-emerald-400">{presentDays}</td>
                          <td className="px-6 py-4 text-center font-bold text-red-600 dark:text-red-400">{absentDays}</td>
                          <td className="px-6 py-4 text-center font-black text-primary">{percent}%</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">No students found in this batch.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {viewMode === "STUDENT" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Student Selector Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border-2 border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold tracking-widest text-slate-400">SEARCH STUDENTS</h3>
              <p className="text-xs text-slate-500">Search globally across the franchise by name or enrollment ID.</p>

              <div className="relative pt-4">
                <Search className="absolute left-3 top-1/2 translate-y-[10%] w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Search students..." 
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="pl-9 h-12 bg-slate-50 dark:bg-slate-900/50 rounded-xl"
                />
              </div>

              <div className="space-y-2 mt-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {studentSearch.length > 0 ? (
                  filteredStudents.length > 0 ? (
                    filteredStudents.map(student => (
                      <button
                        key={student.id}
                        onClick={() => setSelectedStudent(student.id)}
                        className={cn(
                          "w-full text-left p-3 rounded-xl transition-all duration-300 border-2",
                          selectedStudent === student.id
                            ? "bg-primary/5 border-primary text-primary"
                            : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                        )}
                      >
                        <div className="font-bold text-sm truncate">{student.fullName}</div>
                        <div className="text-[10px] opacity-60 uppercase tracking-widest">{student.enrollmentNo}</div>
                      </button>
                    ))
                  ) : (
                    <p className="text-center text-xs text-slate-400 italic py-4">No students match search</p>
                  )
                ) : (
                  <p className="text-center text-xs text-slate-400 italic py-4">Type a name or ID to search</p>
                )}
              </div>
            </div>
          </div>

          {/* Student Stats Area */}
          <div className="lg:col-span-2">
            {!selectedStudent ? (
              <div className="bg-white dark:bg-slate-900 h-full min-h-[400px] rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-slate-400">
                <Users className="w-16 h-16 mb-4 opacity-20" />
                <p className="font-bold">Select a student to view their attendance summary.</p>
              </div>
            ) : isLoading ? (
              <div className="bg-white dark:bg-slate-900 h-full min-h-[400px] rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : studentStats ? (
              <div className="space-y-8">
                {/* Theory Stats */}
                <div className="space-y-6">
                  <h3 className="font-bold text-lg border-b-2 border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">T</div>
                    Theory Classes Summary
                  </h3>
                  {studentStats.THEORY && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border-2 border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center">
                          <span className="text-4xl font-black text-primary">{studentStats.THEORY.percentage}%</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Overall</span>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-3xl border-2 border-emerald-100 dark:border-emerald-900/30 shadow-sm flex flex-col items-center justify-center text-center">
                          <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400">{studentStats.THEORY.presentDays}</span>
                          <span className="text-[10px] font-bold text-emerald-600/70 dark:text-emerald-400/70 uppercase tracking-widest mt-2">Present</span>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-3xl border-2 border-red-100 dark:border-red-900/30 shadow-sm flex flex-col items-center justify-center text-center">
                          <span className="text-4xl font-black text-red-600 dark:text-red-400">{studentStats.THEORY.absentDays}</span>
                          <span className="text-[10px] font-bold text-red-600/70 dark:text-red-400/70 uppercase tracking-widest mt-2">Absent</span>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden p-6">
                        <h4 className="font-bold text-sm mb-4 flex items-center gap-2 text-slate-500">
                          <CalendarDays className="w-4 h-4" />
                          Recent Theory Records
                        </h4>
                        
                        {studentStats.THEORY.recentRecords.length > 0 ? (
                          <div className="space-y-3">
                            {studentStats.THEORY.recentRecords.slice(0, 5).map((record: any, idx: number) => (
                              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                                  {new Date(record.date).toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </span>
                                {record.status === "PRESENT" ? (
                                  <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">PRESENT</span>
                                ) : (
                                  <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">ABSENT</span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 italic">No recent theory records.</p>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Practical Stats */}
                <div className="space-y-6">
                  <h3 className="font-bold text-lg border-b-2 border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">P</div>
                    Practical Classes Summary
                  </h3>
                  {studentStats.PRACTICAL && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border-2 border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center">
                          <span className="text-4xl font-black text-amber-600 dark:text-amber-400">{studentStats.PRACTICAL.percentage}%</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Overall</span>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-3xl border-2 border-emerald-100 dark:border-emerald-900/30 shadow-sm flex flex-col items-center justify-center text-center">
                          <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400">{studentStats.PRACTICAL.presentDays}</span>
                          <span className="text-[10px] font-bold text-emerald-600/70 dark:text-emerald-400/70 uppercase tracking-widest mt-2">Present</span>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-3xl border-2 border-red-100 dark:border-red-900/30 shadow-sm flex flex-col items-center justify-center text-center">
                          <span className="text-4xl font-black text-red-600 dark:text-red-400">{studentStats.PRACTICAL.absentDays}</span>
                          <span className="text-[10px] font-bold text-red-600/70 dark:text-red-400/70 uppercase tracking-widest mt-2">Absent</span>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden p-6">
                        <h4 className="font-bold text-sm mb-4 flex items-center gap-2 text-slate-500">
                          <CalendarDays className="w-4 h-4" />
                          Recent Practical Records
                        </h4>
                        
                        {studentStats.PRACTICAL.recentRecords.length > 0 ? (
                          <div className="space-y-3">
                            {studentStats.PRACTICAL.recentRecords.slice(0, 5).map((record: any, idx: number) => (
                              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                                  {new Date(record.date).toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </span>
                                {record.status === "PRESENT" ? (
                                  <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">PRESENT</span>
                                ) : (
                                  <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">ABSENT</span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 italic">No recent practical records.</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

    </div>
  );
}
