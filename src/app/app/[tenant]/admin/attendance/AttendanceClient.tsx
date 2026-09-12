"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { AdminPageHeader } from "@/components/layout/AdminPageHeader";
import { 
  Users, 
  Save, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  CalendarDays, 
  BarChart3, 
  Edit3, 
  Camera, 
  Search, 
  TrendingUp, 
  Check, 
  X,
  Filter,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/StatCard";
import { getAttendanceList, saveAttendance } from "@/app/actions/attendance";
import { toast } from "sonner";
import AttendanceReports from "@/components/attendance/AttendanceReports";
import PracticalClassesTab from "./PracticalClassesTab";
import QRScanner from "@/components/attendance/QRScanner";

// Helper for formatting
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-GB').format(date);
};

const formatDay = (date: Date) => {
  return new Intl.DateTimeFormat('en-GB', { weekday: 'long' }).format(date);
};

export default function AttendanceClient({
  workspaceId,
  batches = [],
  initialStudents = []
}: {
  workspaceId: string;
  batches: any[];
  initialStudents?: any[];
}) {
  const [activeTab, setActiveTab] = useState("take_attendance");
  const [selectedBatch, setSelectedBatch] = useState(batches[0]?.id || "");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<any[]>(initialStudents || []);
  const [studentSearch, setStudentSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PRESENT" | "ABSENT" | "UNMARKED">("ALL");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchStudents = async () => {
    if (!selectedBatch) return;
    setIsLoading(true);
    const result = await getAttendanceList(selectedBatch, new Date(selectedDate));
    if (result.success) {
      setStudents(result.data || []);
    } else {
      toast.error(result.error || "Failed to load attendance list");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    fetchStudents();
  }, [selectedBatch, selectedDate]);

  const handleStatusChange = (studentId: string, isPresent: boolean) => {
    setStudents(prev => prev.map(s => 
      s.studentId === studentId ? { ...s, status: isPresent ? "PRESENT" : "ABSENT" } : s
    ));
  };

  const handleMarkAllPresent = () => {
    if (students.length === 0) return;
    setStudents(prev => prev.map(s => ({ ...s, status: "PRESENT" })));
    toast.success(`Marked all ${students.length} students as present.`);
  };

  const handleMarkAllAbsent = () => {
    if (students.length === 0) return;
    setStudents(prev => prev.map(s => ({ ...s, status: "ABSENT" })));
    toast.info(`Marked all ${students.length} students as absent.`);
  };

  const handleSave = async () => {
    if (students.length === 0) return;
    
    const unMarked = students.filter(s => !s.status);
    if (unMarked.length > 0) {
      toast.warning(`Please mark attendance for all ${unMarked.length} remaining students.`);
      return;
    }

    setIsSaving(true);
    const result = await saveAttendance(workspaceId, new Date(selectedDate), students, "THEORY");
    if (result.success) {
      toast.success("Attendance register saved successfully!");
    } else {
      toast.error(result.error || "Failed to save attendance");
    }
    setIsSaving(false);
  };

  // Real-time Statistics
  const stats = useMemo(() => {
    const total = students.length;
    const present = students.filter(s => s.status === "PRESENT").length;
    const absent = students.filter(s => s.status === "ABSENT").length;
    const unmarked = students.filter(s => !s.status).length;
    const markedTotal = present + absent;
    const rate = markedTotal > 0 ? Math.round((present / markedTotal) * 100) : 0;
    return { total, present, absent, unmarked, rate, batchCount: batches.length };
  }, [students, batches]);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const q = studentSearch.toLowerCase().trim();
      const matchesSearch = !q || 
        s.fullName?.toLowerCase().includes(q) || 
        s.enrollmentNo?.toLowerCase().includes(q) ||
        (s.rollNo && s.rollNo.toString().toLowerCase().includes(q));

      const matchesStatus = 
        statusFilter === "ALL" ||
        (statusFilter === "PRESENT" && s.status === "PRESENT") ||
        (statusFilter === "ABSENT" && s.status === "ABSENT") ||
        (statusFilter === "UNMARKED" && !s.status);

      return matchesSearch && matchesStatus;
    });
  }, [students, studentSearch, statusFilter]);

  const displayDate = formatDate(new Date(selectedDate));
  const selectedBatchObj = batches.find(b => b.id === selectedBatch);

  const tabs = [
    { id: "take_attendance", label: "Theory Classes", icon: Edit3, count: stats.total },
    { id: "practical_classes", label: "Practical Classes", icon: CalendarDays },
    { id: "qr_scanner", label: "QR Scanner", icon: Camera },
    { id: "reports", label: "Attendance Reports", icon: BarChart3 },
  ];

  if (!mounted) return null;

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 w-full mx-auto">
      {/* Standard Admin Page Header */}
      <AdminPageHeader 
        title="Attendance Register" 
        description="Monitor student presence, record theory and practical classes, scan QR passes, and track reports."
      />

      {/* 4 Metric / Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Total Students"
          value={stats.total}
          icon={<Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
        />
        <StatCard
          label="Marked Present"
          value={stats.present}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
        />
        <StatCard
          label="Marked Absent"
          value={stats.absent}
          icon={<XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
        />
        <StatCard
          label="Attendance Rate"
          value={`${stats.rate}%`}
          icon={<TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
        />
      </div>

      {/* Standard Horizontal Tabs Pill Container */}
      <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-1.5 p-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-full">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium shrink-0 whitespace-nowrap transition-all",
              activeTab === tab.id
                ? "bg-slate-100 dark:bg-slate-800 text-primary dark:text-white font-semibold shadow-inner"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50"
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={cn(
                "ml-1 text-[10px] font-bold px-1.5 py-0.2 rounded-full",
                activeTab === tab.id
                  ? "bg-primary/10 text-primary dark:bg-white/10 dark:text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500"
              )}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="transition-all duration-300">
        {activeTab === "take_attendance" && (
          <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden bg-white dark:bg-slate-900">
            {/* Integrated Toolbar Header */}
            <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                {/* Batch, Date & Search Controls */}
                <div className="flex flex-1 flex-wrap items-center gap-2 sm:gap-2.5">
                  {/* Batch Select */}
                  <div className="w-full sm:w-[200px]">
                    <Select value={selectedBatch} onValueChange={(val: any) => setSelectedBatch(val)}>
                      <SelectTrigger className="h-8 sm:h-9 text-xs font-medium rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
                        <SelectValue placeholder="Select Batch...">
                          {selectedBatchObj ? selectedBatchObj.name : "Select Batch..."}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border border-slate-200 dark:border-slate-800">
                        {batches.length === 0 ? (
                          <div className="p-3 text-center text-xs text-slate-500 italic">No batches found</div>
                        ) : (
                          batches.map((batch) => (
                            <SelectItem key={batch.id} value={batch.id} className="text-xs font-medium py-1.5 cursor-pointer">
                              <div className="flex flex-col">
                                <span className="font-semibold">{batch.name}</span>
                                <span className="text-[9px] text-slate-400">{batch.course?.title || "Independent Batch"}</span>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date Picker Button */}
                  <div className="relative">
                    <Button 
                      variant="outline" 
                      onClick={() => dateInputRef.current?.showPicker()}
                      className="h-8 sm:h-9 px-3 rounded-lg text-xs font-medium border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-1.5 text-slate-700 dark:text-slate-200"
                    >
                      <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                      <span>{displayDate}</span>
                      <span className="text-[10px] text-slate-400 hidden sm:inline">({formatDay(new Date(selectedDate)).slice(0, 3)})</span>
                    </Button>
                    <input 
                      ref={dateInputRef}
                      type="date" 
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="absolute inset-0 opacity-0 -z-10 pointer-events-none"
                    />
                  </div>

                  {/* Search Input */}
                  <div className="relative w-full sm:max-w-[220px] group">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-primary transition-colors pointer-events-none" />
                    <Input 
                      placeholder="Search students, roll..." 
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="pl-8 pr-3 h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 placeholder:text-xs placeholder:text-slate-400 font-normal"
                    />
                  </div>

                  {/* Status Filter */}
                  <Select value={statusFilter} onValueChange={(val: any) => setStatusFilter(val)}>
                    <SelectTrigger className="h-8 sm:h-9 w-[120px] text-xs font-medium rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Status</SelectItem>
                      <SelectItem value="PRESENT">Present ({stats.present})</SelectItem>
                      <SelectItem value="ABSENT">Absent ({stats.absent})</SelectItem>
                      <SelectItem value="UNMARKED">Unmarked ({stats.unmarked})</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Batch Action Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 self-end lg:self-auto shrink-0">
                  <Button 
                    onClick={handleMarkAllPresent} 
                    disabled={isSaving || students.length === 0}
                    variant="outline"
                    className="h-8 sm:h-9 px-2.5 sm:px-3 rounded-lg text-xs font-semibold border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900/40 dark:text-emerald-400 dark:hover:bg-emerald-950/20"
                  >
                    <Check className="w-3.5 h-3.5 mr-1" />
                    All Present
                  </Button>
                  <Button 
                    onClick={handleMarkAllAbsent} 
                    disabled={isSaving || students.length === 0}
                    variant="outline"
                    className="h-8 sm:h-9 px-2.5 sm:px-3 rounded-lg text-xs font-semibold border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-900/40 dark:text-rose-400 dark:hover:bg-rose-950/20"
                  >
                    <X className="w-3.5 h-3.5 mr-1" />
                    All Absent
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    disabled={isSaving || students.length === 0}
                    className="h-8 sm:h-9 px-3.5 rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 bg-primary text-primary-foreground"
                  >
                    {isSaving ? <Clock className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Save Register
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Attendance Table */}
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50/75 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                      <th className="px-4 py-3 w-12">#</th>
                      <th className="px-4 py-3">Student Info</th>
                      <th className="px-4 py-3">Enrollment / Roll</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-right">Attendance Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                    {isLoading ? (
                      Array(5).fill(0).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="px-4 py-3"><div className="h-4 w-4 bg-slate-100 dark:bg-slate-800 rounded"></div></td>
                          <td className="px-4 py-3"><div className="h-4 w-36 bg-slate-100 dark:bg-slate-800 rounded"></div></td>
                          <td className="px-4 py-3"><div className="h-4 w-24 bg-slate-100 dark:bg-slate-800 rounded"></div></td>
                          <td className="px-4 py-3"><div className="h-5 w-16 bg-slate-100 dark:bg-slate-800 rounded mx-auto"></div></td>
                          <td className="px-4 py-3"><div className="h-7 w-20 bg-slate-100 dark:bg-slate-800 rounded-lg ml-auto"></div></td>
                        </tr>
                      ))
                    ) : filteredStudents.length > 0 ? (
                      filteredStudents.map((student, idx) => {
                        const isPresent = student.status === "PRESENT";
                        const isAbsent = student.status === "ABSENT";
                        const isUnmarked = !student.status;

                        return (
                          <tr 
                            key={student.studentId} 
                            className={cn(
                              "hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors",
                              isPresent ? "border-l-[3px] border-emerald-500" : isAbsent ? "border-l-[3px] border-rose-500" : "border-l-[3px] border-transparent"
                            )}
                          >
                            <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">
                              {idx + 1}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                <div className={cn(
                                  "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0",
                                  isPresent ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400" :
                                  isAbsent ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400" :
                                  "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                                )}>
                                  {student.fullName ? student.fullName.slice(0, 2).toUpperCase() : "ST"}
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="font-semibold text-slate-900 dark:text-white text-xs truncate">{student.fullName}</span>
                                  <span className="text-[10px] text-slate-400">{selectedBatchObj?.name || "Batch student"}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-col gap-0.5">
                                <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
                                  {student.enrollmentNo || "Pending Roll"}
                                </span>
                                {student.rollNo && (
                                  <span className="text-[9px] text-slate-400">Roll: {student.rollNo}</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {isPresent ? (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded uppercase tracking-wider">
                                  <CheckCircle2 className="w-3 h-3" /> Present
                                </span>
                              ) : isAbsent ? (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded uppercase tracking-wider">
                                  <XCircle className="w-3 h-3" /> Absent
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded uppercase tracking-wider">
                                  Unmarked
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="inline-flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800/80 rounded-lg">
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(student.studentId, true)}
                                  className={cn(
                                    "flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all",
                                    isPresent
                                      ? "bg-emerald-600 text-white shadow-xs"
                                      : "text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400"
                                  )}
                                  title="Mark Present"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Present</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(student.studentId, false)}
                                  className={cn(
                                    "flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all",
                                    isAbsent
                                      ? "bg-rose-600 text-white shadow-xs"
                                      : "text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400"
                                  )}
                                  title="Mark Absent"
                                >
                                  <X className="w-3 h-3" />
                                  <span>Absent</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center space-y-2 text-slate-400">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                              <Users className="w-5 h-5 text-slate-400" />
                            </div>
                            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                              {studentSearch || statusFilter !== "ALL" ? "No students matching filters" : "No students in this batch"}
                            </p>
                            <p className="text-[11px] text-slate-400 max-w-xs">
                              {studentSearch || statusFilter !== "ALL" ? "Try clearing your search query or status filter." : "Select another batch or enroll students to start tracking attendance."}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Standard Summary Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-2.5 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20 text-xs text-slate-500 gap-2">
                <span>Showing {filteredStudents.length} of {students.length} students</span>
                <div className="flex items-center gap-3 text-[11px] font-medium">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> {stats.present} Present
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" /> {stats.absent} Absent
                  </span>
                  {stats.unmarked > 0 && (
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" /> {stats.unmarked} Unmarked
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "practical_classes" && (
          <PracticalClassesTab workspaceId={workspaceId} />
        )}

        {activeTab === "qr_scanner" && (
          <div className="py-2">
            <QRScanner workspaceId={workspaceId} type="THEORY" />
          </div>
        )}

        {activeTab === "reports" && (
          <AttendanceReports batches={batches} workspaceId={workspaceId} />
        )}
      </div>
    </div>
  );
}
