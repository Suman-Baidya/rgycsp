"use client";

import { useState, useEffect, useRef } from "react";
import { AdminPageHeader } from "@/components/layout/AdminPageHeader";
import { Calendar, Users, Save, CheckCircle2, XCircle, Clock, AlertCircle, ChevronDown, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getAttendanceList, saveAttendance } from "@/app/actions/attendance";
import { AttendanceStatus } from "@prisma/client";
import { toast } from "sonner";

// Helper for formatting
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-GB').format(date);
};

const formatDay = (date: Date) => {
  return new Intl.DateTimeFormat('en-GB', { weekday: 'long' }).format(date);
};

export default function AttendanceClient({
  workspaceId,
  batches
}: {
  workspaceId: string;
  batches: any[];
}) {
  const [selectedBatch, setSelectedBatch] = useState(batches[0]?.id || "");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);

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
      toast.error(result.error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchStudents();
  }, [selectedBatch, selectedDate]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setStudents(prev => prev.map(s => 
      s.studentId === studentId ? { ...s, status } : s
    ));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setStudents(prev => prev.map(s => 
      s.studentId === studentId ? { ...s, remarks } : s
    ));
  };

  const handleSave = async () => {
    if (students.length === 0) return;
    
    const unMarked = students.filter(s => !s.status);
    if (unMarked.length > 0) {
      toast.warning(`Please mark attendance for all ${unMarked.length} students.`);
      return;
    }

    setIsSaving(true);
    const result = await saveAttendance(workspaceId, new Date(selectedDate), students);
    if (result.success) {
      toast.success("Attendance saved successfully!");
    } else {
      toast.error(result.error);
    }
    setIsSaving(false);
  };

  // Format date to DD/MM/YYYY for display
  const displayDate = formatDate(new Date(selectedDate));

  if (!mounted) return null;

  return (
    <div className="p-4 lg:p-10 max-w-7xl mx-auto space-y-8">
      <AdminPageHeader 
        title="Attendance Register" 
        description="Monitor student presence and maintain daily attendance records."
      >
        <div className="flex flex-col sm:flex-row items-center gap-3">
           <div className="relative group w-full sm:w-auto">
             <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
               <div className="relative">
                 <Button 
                   variant="outline" 
                   onClick={() => dateInputRef.current?.showPicker()}
                   className="h-11 pl-10 pr-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl text-sm font-bold w-full sm:w-auto flex justify-start items-center"
                 >
                   {displayDate}
                 </Button>
                 <input 
                   ref={dateInputRef}
                   type="date" 
                   value={selectedDate}
                   onChange={(e) => setSelectedDate(e.target.value)}
                   className="absolute inset-0 opacity-0 -z-10 pointer-events-none"
                 />
               </div>
           </div>
           <Button 
             onClick={handleSave} 
             disabled={isSaving || students.length === 0}
             className="w-full sm:w-auto h-11 rounded-xl px-8 font-bold shadow-lg shadow-primary/20 flex items-center gap-2"
           >
             {isSaving ? <Clock className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
             Save Register
           </Button>
        </div>
      </AdminPageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar for Batch Selection */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border-2 border-slate-100 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold tracking-widest text-slate-400 mb-6 flex items-center gap-2">
              <Users className="w-4 h-4" /> Select Batch
            </h3>
            <div className="space-y-2">
              {batches.map((batch) => (
                <button
                  key={batch.id}
                  onClick={() => setSelectedBatch(batch.id)}
                  className={cn(
                    "w-full flex flex-col items-start p-4 rounded-2xl transition-all duration-300 border-2",
                    selectedBatch === batch.id 
                      ? "bg-primary/5 border-primary text-primary" 
                      : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                  )}
                >
                  <span className="font-bold text-sm leading-tight">{batch.name}</span>
                  <span className="text-[10px] uppercase font-black opacity-60 mt-1">{batch.course?.title || "Independent Batch"}</span>
                </button>
              ))}
              {batches.length === 0 && (
                <p className="text-xs text-slate-400 italic text-center py-4">No batches found</p>
              )}
            </div>
          </div>

          <div className="bg-primary/5 p-6 rounded-3xl border-2 border-primary/10">
            <h4 className="font-bold text-primary text-sm flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4" /> Selected Date
            </h4>
            <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {displayDate}
            </p>
            <p className="text-[10px] font-bold text-primary/60 mt-1">
              {formatDay(new Date(selectedDate))}
            </p>
          </div>
        </div>

        {/* Attendance Register Table */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                    <th className="px-8 py-5 text-xs font-bold tracking-widest text-slate-500">Student Info</th>
                    <th className="px-8 py-5 text-xs font-bold tracking-widest text-slate-500 text-center">Attendance Status</th>
                    <th className="px-8 py-5 text-xs font-bold tracking-widest text-slate-500">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {isLoading ? (
                    Array(5).fill(0).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-8 py-6"><div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded"></div></td>
                        <td className="px-8 py-6"><div className="h-8 w-48 bg-slate-100 dark:bg-slate-800 rounded-xl mx-auto"></div></td>
                        <td className="px-8 py-6"><div className="h-4 w-24 bg-slate-100 dark:bg-slate-800 rounded"></div></td>
                      </tr>
                    ))
                  ) : students.length > 0 ? (
                    students.map((student) => (
                      <tr key={student.studentId} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 dark:text-white">{student.fullName}</span>
                            <span className="text-[10px] font-bold text-slate-400">{student.enrollmentNo}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center justify-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit mx-auto">
                            {[
                              { id: "PRESENT", icon: CheckCircle2, label: "P", color: "text-green-600 bg-green-50 dark:bg-green-500/10" },
                              { id: "ABSENT", icon: XCircle, label: "A", color: "text-red-600 bg-red-50 dark:bg-red-500/10" },
                              { id: "LATE", icon: Clock, label: "L", color: "text-amber-600 bg-amber-50 dark:bg-amber-500/10" },
                              { id: "HALF_DAY", icon: AlertCircle, label: "H", color: "text-blue-600 bg-blue-50 dark:bg-blue-500/10" }
                            ].map((opt) => (
                              <button
                                key={opt.id}
                                onClick={() => handleStatusChange(student.studentId, opt.id as AttendanceStatus)}
                                className={cn(
                                  "w-10 h-10 flex items-center justify-center rounded-xl text-[10px] font-bold transition-all duration-300",
                                  student.status === opt.id 
                                    ? opt.color + " shadow-sm ring-2 ring-white dark:ring-slate-900" 
                                    : "text-slate-400 hover:bg-white dark:hover:bg-slate-700"
                                )}
                                title={opt.id}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <input 
                            type="text" 
                            placeholder="Optional note..."
                            value={student.remarks || ""}
                            onChange={(e) => handleRemarksChange(student.studentId, e.target.value)}
                            className="w-full bg-transparent border-b border-transparent hover:border-slate-200 focus:border-primary py-1 text-sm outline-none transition-all dark:text-slate-300"
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 rounded-3xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300">
                             <Users className="w-8 h-8" />
                          </div>
                          <p className="text-sm font-bold text-slate-400 italic">No students found in this batch.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="mt-8 flex items-center justify-between px-10">
            <div className="flex gap-6">
              {[
                { label: "Present", color: "bg-green-500" },
                { label: "Absent", color: "bg-red-500" },
                { label: "Late", color: "bg-amber-500" },
                { label: "Half Day", color: "bg-blue-500" }
              ].map(stat => (
                <div key={stat.label} className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", stat.color)}></div>
                  <span className="text-[10px] font-bold tracking-wider text-slate-400">{stat.label}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] font-bold tracking-widest text-slate-400">
              {students.length} Total Students
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
