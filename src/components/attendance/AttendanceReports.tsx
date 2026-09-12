"use client";

import { useState, useEffect, useMemo } from "react";
import { getBatchAttendanceReport, getStudentAttendanceStats } from "@/app/actions/attendance";
import { getStudents } from "@/app/actions/students";
import { 
  Users, 
  Search, 
  CalendarDays, 
  LineChart as LineChartIcon, 
  Activity, 
  CheckCircle2, 
  XCircle,
  AlertCircle,
  Loader2,
  ChevronRight,
  TrendingUp,
  UserCheck
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/StatCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type DurationType = "LAST_MONTH" | "LAST_6_MONTHS" | "FULL_COURSE";

const DURATION_LABELS: Record<DurationType, string> = {
  LAST_MONTH: "Last Month (30 Days)",
  LAST_6_MONTHS: "Last 6 Months",
  FULL_COURSE: "Full Course Duration"
};

export default function AttendanceReports({ batches = [], workspaceId }: { batches: any[], workspaceId: string }) {
  const [viewMode, setViewMode] = useState<"BATCH" | "STUDENT">("BATCH");
  const [selectedBatch, setSelectedBatch] = useState(batches[0]?.id || "");
  const [selectedDuration, setSelectedDuration] = useState<DurationType>("LAST_MONTH");
  const [attendanceType, setAttendanceType] = useState<"THEORY" | "PRACTICAL">("THEORY");
  const [batchSearch, setBatchSearch] = useState("");
  const [showChart, setShowChart] = useState(false);
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
      toast.error(result.error || "Failed to load students");
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
      toast.error(result.error || "Failed to load report");
    }
    setIsLoading(false);
  };

  const loadStudentStats = async () => {
    setIsLoading(true);
    const result = await getStudentAttendanceStats(selectedStudent);
    if (result.success) {
      setStudentStats(result.data);
    } else {
      toast.error(result.error || "Failed to load student stats");
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

  // Filtered batch students
  const filteredBatchData = useMemo(() => {
    return batchData.filter(student => {
      const q = batchSearch.toLowerCase().trim();
      if (!q) return true;
      return (
        student.fullName?.toLowerCase().includes(q) ||
        (student.enrollmentNo && student.enrollmentNo.toLowerCase().includes(q))
      );
    });
  }, [batchData, batchSearch]);

  // Student filtering for Student View
  const filteredStudents = useMemo(() => {
    return globalStudents.filter(s => 
      s.fullName?.toLowerCase().includes(studentSearch.toLowerCase()) || 
      (s.enrollmentNo && s.enrollmentNo.toLowerCase().includes(studentSearch.toLowerCase()))
    );
  }, [globalStudents, studentSearch]);

  const selectedBatchObj = batches.find(b => b.id === selectedBatch);

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* View Switcher Tabs Pill Bar */}
      <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-1.5 p-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-full">
        <button 
          onClick={() => setViewMode("BATCH")}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium shrink-0 whitespace-nowrap transition-all",
            viewMode === "BATCH" 
              ? "bg-slate-100 dark:bg-slate-800 text-primary dark:text-white font-semibold shadow-inner" 
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50"
          )}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Batch Monthly View</span>
        </button>
        <button 
          onClick={handleSwitchToStudentView}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium shrink-0 whitespace-nowrap transition-all",
            viewMode === "STUDENT" 
              ? "bg-slate-100 dark:bg-slate-800 text-primary dark:text-white font-semibold shadow-inner" 
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50"
          )}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Student Summary View</span>
        </button>
      </div>

      {viewMode === "BATCH" && (
        <div className="space-y-4">
          {/* 3 Metric Stat Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <StatCard
              label="Total Batch Students"
              value={batchStats.totalStudents}
              icon={<Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
            />
            <StatCard
              label="Classes Conducted"
              value={batchStats.totalClasses}
              icon={<Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
            />
            <StatCard
              label="Average Attendance"
              value={`${batchStats.avgAttendance}%`}
              icon={<TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
            />
          </div>

          {/* Main Content Card with Integrated Toolbar */}
          <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden bg-white dark:bg-slate-900">
            {/* Integrated Toolbar Header */}
            <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                {/* Filters */}
                <div className="flex flex-1 flex-wrap items-center gap-2 sm:gap-2.5">
                  {/* Batch Select */}
                  <div className="w-full sm:w-[210px]">
                    <Select value={selectedBatch} onValueChange={(val: any) => setSelectedBatch(val)}>
                      <SelectTrigger className="h-8 sm:h-9 text-xs font-medium rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
                        <SelectValue placeholder="Select Batch">
                          {selectedBatchObj?.name || "Select Batch"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg">
                        {batches.map(b => (
                          <SelectItem key={b.id} value={b.id} className="text-xs font-medium py-1.5 cursor-pointer">
                            <div className="flex flex-col">
                              <span className="font-semibold">{b.name}</span>
                              <span className="text-[9px] text-slate-400">{b.course?.title || "Independent Batch"}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Duration Select with Human-Readable Labels */}
                  <div className="w-full sm:w-[170px]">
                    <Select value={selectedDuration} onValueChange={(v: any) => setSelectedDuration(v as DurationType)}>
                      <SelectTrigger className="h-8 sm:h-9 text-xs font-medium rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
                        <SelectValue placeholder="Select Duration">
                          {DURATION_LABELS[selectedDuration]}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg">
                        <SelectItem value="LAST_MONTH" className="text-xs font-medium py-1.5 cursor-pointer">Last Month (30 Days)</SelectItem>
                        <SelectItem value="LAST_6_MONTHS" className="text-xs font-medium py-1.5 cursor-pointer">Last 6 Months</SelectItem>
                        <SelectItem value="FULL_COURSE" className="text-xs font-medium py-1.5 cursor-pointer">Full Course Duration</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Student Search in Report */}
                  <div className="relative w-full sm:max-w-[200px] group">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-primary transition-colors pointer-events-none" />
                    <Input 
                      placeholder="Search report students..." 
                      value={batchSearch}
                      onChange={(e) => setBatchSearch(e.target.value)}
                      className="pl-8 pr-3 h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 placeholder:text-xs placeholder:text-slate-400 font-normal"
                    />
                  </div>
                </div>

                {/* Right controls: Theory/Practical toggle + Chart Toggle */}
                <div className="flex items-center gap-2 self-end lg:self-auto shrink-0">
                  {chartData.length > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => setShowChart(!showChart)}
                      className={cn(
                        "h-8 sm:h-9 px-2.5 rounded-lg text-xs font-medium border-slate-200 dark:border-slate-700",
                        showChart && "bg-primary/10 text-primary border-primary/30"
                      )}
                    >
                      <LineChartIcon className="w-3.5 h-3.5 mr-1" />
                      {showChart ? "Hide Trend" : "View Trend"}
                    </Button>
                  )}

                  <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                    <button
                      onClick={() => setAttendanceType("THEORY")}
                      className={cn(
                        "px-2.5 py-1 rounded-md text-xs font-semibold transition-all",
                        attendanceType === "THEORY"
                          ? "bg-white dark:bg-slate-700 text-primary dark:text-white shadow-xs"
                          : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                      )}
                    >
                      Theory
                    </button>
                    <button
                      onClick={() => setAttendanceType("PRACTICAL")}
                      className={cn(
                        "px-2.5 py-1 rounded-md text-xs font-semibold transition-all",
                        attendanceType === "PRACTICAL"
                          ? "bg-white dark:bg-slate-700 text-primary dark:text-white shadow-xs"
                          : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                      )}
                    >
                      Practical
                    </button>
                  </div>
                </div>
              </div>
            </CardHeader>

            {/* Optional Chart Display */}
            {showChart && chartData.length > 0 && (
              <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-800 dark:text-white flex items-center gap-1.5">
                    <LineChartIcon className="w-3.5 h-3.5 text-primary" />
                    Attendance Rate Trend ({attendanceType})
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {chartData.length} dates recorded
                  </span>
                </div>
                <div className="h-[180px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}>
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
                        tick={{ fontSize: 10, fill: '#94a3b8' }} 
                        dy={4}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        cursor={{ stroke: '#cbd5e1', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="Present" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorPresent)" 
                        activeDot={{ r: 4, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* High-Density Attendance Table */}
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50/75 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                      <th className="px-4 py-3 w-10">#</th>
                      <th className="px-4 py-3">Student Info</th>
                      <th className="px-4 py-3 text-center">Classes</th>
                      <th className="px-4 py-3 text-center">Present</th>
                      <th className="px-4 py-3 text-center">Absent</th>
                      <th className="px-4 py-3 w-48 text-left">Attendance Rate</th>
                      <th className="px-4 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                    {isLoading ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                            <span className="text-xs font-medium">Loading report data...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredBatchData.length > 0 ? (
                      filteredBatchData.map((student, idx) => {
                        const filteredAttendances = student.attendances?.filter((a: any) => a.type === attendanceType) || [];
                        const totalMarkedDays = filteredAttendances.length;
                        const presentDays = filteredAttendances.filter((a: any) => a.status === "PRESENT").length;
                        const absentDays = filteredAttendances.filter((a: any) => a.status === "ABSENT").length;
                        const percent = totalMarkedDays > 0 ? Math.round((presentDays / totalMarkedDays) * 100) : 0;
                        const isGood = totalMarkedDays > 0 && percent >= 75;

                        return (
                          <tr key={student.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">
                              {idx + 1}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center justify-center shrink-0">
                                  {student.fullName ? student.fullName.slice(0, 2).toUpperCase() : "ST"}
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="font-semibold text-slate-900 dark:text-white text-xs truncate">
                                    {student.fullName}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {student.enrollmentNo || "Pending Roll"}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center font-medium text-slate-700 dark:text-slate-300">
                              {totalMarkedDays}
                            </td>
                            <td className="px-4 py-3 text-center font-semibold text-emerald-600 dark:text-emerald-400">
                              {presentDays}
                            </td>
                            <td className="px-4 py-3 text-center font-semibold text-rose-600 dark:text-rose-400">
                              {absentDays}
                            </td>
                            <td className="px-4 py-3">
                              <div className="space-y-1 max-w-[140px]">
                                <div className="flex items-center justify-between text-[11px] font-semibold">
                                  <span className={cn(
                                    totalMarkedDays === 0 ? "text-slate-400" :
                                    percent >= 75 ? "text-emerald-600 dark:text-emerald-400" :
                                    percent >= 50 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400"
                                  )}>
                                    {percent}%
                                  </span>
                                  <span className="text-[9px] text-slate-400 font-normal">
                                    {presentDays}/{totalMarkedDays}
                                  </span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                  <div 
                                    className={cn(
                                      "h-full rounded-full transition-all duration-300",
                                      totalMarkedDays === 0 ? "bg-slate-200 dark:bg-slate-700" :
                                      percent >= 75 ? "bg-emerald-500" :
                                      percent >= 50 ? "bg-amber-500" : "bg-rose-500"
                                    )}
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {totalMarkedDays === 0 ? (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800">
                                  No Data
                                </span>
                              ) : isGood ? (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50">
                                  <CheckCircle2 className="w-2.5 h-2.5" /> Good
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50">
                                  <AlertCircle className="w-2.5 h-2.5" /> Low
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center text-slate-400 italic text-xs">
                          {batchSearch ? "No students matching your search query." : "No students found in this batch."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Summary Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-2.5 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20 text-xs text-slate-500 gap-2">
                <span>Showing {filteredBatchData.length} of {batchData.length} students</span>
                <div className="flex items-center gap-3 text-[11px] font-medium">
                  <span>Batch: <strong className="text-slate-800 dark:text-slate-200">{selectedBatchObj?.name || "N/A"}</strong></span>
                  <span>Avg Attendance: <strong className="text-primary">{batchStats.avgAttendance}%</strong></span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {viewMode === "STUDENT" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Student Selector Sidebar */}
          <div className="lg:col-span-1 space-y-3">
            <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm bg-white dark:bg-slate-900">
              <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 space-y-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Search Students</h3>
                <p className="text-[11px] text-slate-500">Search across the franchise by name or enrollment ID.</p>

                <div className="relative pt-2">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  <Input 
                    placeholder="Search students..." 
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="pl-8 pr-3 h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60"
                  />
                </div>
              </CardHeader>

              <CardContent className="p-2 max-h-96 overflow-y-auto space-y-1">
                {studentSearch.length > 0 ? (
                  filteredStudents.length > 0 ? (
                    filteredStudents.map(student => (
                      <button
                        key={student.id}
                        onClick={() => setSelectedStudent(student.id)}
                        className={cn(
                          "w-full text-left p-2.5 rounded-lg transition-all text-xs border flex items-center justify-between gap-2",
                          selectedStudent === student.id
                            ? "bg-primary/5 border-primary text-primary font-semibold"
                            : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                        )}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-xs truncate text-slate-900 dark:text-white">{student.fullName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{student.enrollmentNo || "Pending Roll"}</div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      </button>
                    ))
                  ) : (
                    <p className="text-center text-xs text-slate-400 italic py-6">No students match search</p>
                  )
                ) : (
                  <p className="text-center text-xs text-slate-400 italic py-6">Type a student name or ID</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Student Stats Area */}
          <div className="lg:col-span-2">
            {!selectedStudent ? (
              <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm bg-white dark:bg-slate-900 h-full min-h-[300px] flex flex-col items-center justify-center p-6 text-slate-400">
                <Users className="w-10 h-10 mb-2 opacity-30" />
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Select a student</p>
                <p className="text-[11px] text-slate-400">Search and click a student on the left to view attendance summary.</p>
              </Card>
            ) : isLoading ? (
              <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm bg-white dark:bg-slate-900 h-full min-h-[300px] flex items-center justify-center">
                <Loader2 className="animate-spin h-6 w-6 text-primary" />
              </Card>
            ) : studentStats ? (
              <div className="space-y-3 sm:space-y-4">
                {/* Theory Stats */}
                {studentStats.THEORY && (
                  <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
                    <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800">
                      <h3 className="font-semibold text-xs sm:text-sm flex items-center gap-2 text-slate-900 dark:text-white">
                        <span className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">T</span>
                        Theory Classes Summary
                      </h3>
                    </CardHeader>
                    <CardContent className="p-3.5 sm:p-4 space-y-3">
                      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                        <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg text-center">
                          <span className="text-xl sm:text-2xl font-bold text-primary">{studentStats.THEORY.percentage}%</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">Overall</span>
                        </div>
                        <div className="bg-emerald-50/60 dark:bg-emerald-950/20 p-3 rounded-lg text-center">
                          <span className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">{studentStats.THEORY.presentDays}</span>
                          <span className="text-[9px] font-bold text-emerald-600/80 dark:text-emerald-400/80 uppercase tracking-wider block mt-0.5">Present</span>
                        </div>
                        <div className="bg-rose-50/60 dark:bg-rose-950/20 p-3 rounded-lg text-center">
                          <span className="text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400">{studentStats.THEORY.absentDays}</span>
                          <span className="text-[9px] font-bold text-rose-600/80 dark:text-rose-400/80 uppercase tracking-wider block mt-0.5">Absent</span>
                        </div>
                      </div>

                      {studentStats.THEORY.recentRecords?.length > 0 && (
                        <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Recent Theory Records</span>
                          <div className="space-y-1">
                            {studentStats.THEORY.recentRecords.slice(0, 4).map((record: any, idx: number) => (
                              <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-xs">
                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                  {new Date(record.date).toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </span>
                                {record.status === "PRESENT" ? (
                                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">PRESENT</span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">ABSENT</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Practical Stats */}
                {studentStats.PRACTICAL && (
                  <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
                    <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800">
                      <h3 className="font-semibold text-xs sm:text-sm flex items-center gap-2 text-slate-900 dark:text-white">
                        <span className="w-5 h-5 rounded-md bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 text-xs font-bold">P</span>
                        Practical Classes Summary
                      </h3>
                    </CardHeader>
                    <CardContent className="p-3.5 sm:p-4 space-y-3">
                      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                        <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg text-center">
                          <span className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">{studentStats.PRACTICAL.percentage}%</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">Overall</span>
                        </div>
                        <div className="bg-emerald-50/60 dark:bg-emerald-950/20 p-3 rounded-lg text-center">
                          <span className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">{studentStats.PRACTICAL.presentDays}</span>
                          <span className="text-[9px] font-bold text-emerald-600/80 dark:text-emerald-400/80 uppercase tracking-wider block mt-0.5">Present</span>
                        </div>
                        <div className="bg-rose-50/60 dark:bg-rose-950/20 p-3 rounded-lg text-center">
                          <span className="text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400">{studentStats.PRACTICAL.absentDays}</span>
                          <span className="text-[9px] font-bold text-rose-600/80 dark:text-rose-400/80 uppercase tracking-wider block mt-0.5">Absent</span>
                        </div>
                      </div>

                      {studentStats.PRACTICAL.recentRecords?.length > 0 && (
                        <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Recent Practical Records</span>
                          <div className="space-y-1">
                            {studentStats.PRACTICAL.recentRecords.slice(0, 4).map((record: any, idx: number) => (
                              <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-xs">
                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                  {new Date(record.date).toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </span>
                                {record.status === "PRESENT" ? (
                                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">PRESENT</span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">ABSENT</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
