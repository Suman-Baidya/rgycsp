"use client";

import { useState, useEffect, useMemo } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Search, UserCheck, Phone, GraduationCap, FileText } from "lucide-react";
import { saveStudentMarksBatch } from "@/app/actions/exam";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

export default function StudentsResultTab({ students, courses, batches }: { students: any[], courses: any[], batches: any[] }) {
  const [selectedBatch, setSelectedBatch] = useState<string>("all");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 250);
  const [marksState, setMarksState] = useState<Record<string, { marksObtained: number, maxMarks: number }>>({});
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({});
  const [openDialogs, setOpenDialogs] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedBatch, selectedCourse]);

  const filteredStudents = useMemo(() => {
    const q = debouncedSearch.toLowerCase().trim();
    return students.filter(s => {
      if (selectedBatch !== "all" && s.batchId !== selectedBatch) return false;
      if (selectedCourse !== "all" && s.courseId !== selectedCourse) return false;
      if (q && !s.user?.name?.toLowerCase().includes(q) && !s.fullName?.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [students, selectedBatch, selectedCourse, debouncedSearch]);

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getMarkValue = (studentId: string, semesterNumber: number, unitName: string, initialObtained: number, initialMax: number) => {
    const key = `${studentId}-${semesterNumber}-${unitName}`;
    return marksState[key] || { marksObtained: initialObtained, maxMarks: initialMax };
  };

  const handleMarkChange = (studentId: string, semesterNumber: number, unitName: string, field: "marksObtained" | "maxMarks", value: string) => {
    const key = `${studentId}-${semesterNumber}-${unitName}`;
    const numValue = parseFloat(value) || 0;
    setMarksState(prev => ({
      ...prev,
      [key]: {
        ...(prev[key] || { marksObtained: 0, maxMarks: 100 }),
        [field]: numValue
      }
    }));
  };

  const getCourseTopics = (courseId?: string) => {
    const course = courses.find(c => c.id === courseId);
    let topicsObj: any = null;
    if (course?.topics) {
      if (typeof course.topics === 'string') {
        try { topicsObj = JSON.parse(course.topics); } catch (e) {}
      } else {
        topicsObj = course.topics;
      }
    }
    
    if (!topicsObj || Object.keys(topicsObj).length === 0) {
      return {
        "Semester 1": [
          { title: "Unit 1" }, { title: "Unit 2" }, { title: "Unit 3" },
          { title: "Unit 4" }, { title: "Unit 5" }, { title: "Unit 6" }
        ]
      };
    }
    return topicsObj;
  };

  const saveMarks = async (studentId: string, semesterNumber: number) => {
    const processKey = `${studentId}-${semesterNumber}`;
    setIsSaving(prev => ({ ...prev, [processKey]: true }));
    try {
      const marksToSave = [];
      for (const key of Object.keys(marksState)) {
        if (key.startsWith(`${studentId}-${semesterNumber}-`)) {
          const parts = key.split('-');
          const unitName = parts.slice(2).join('-');
          marksToSave.push({
            semesterNumber,
            unitName,
            marksObtained: marksState[key].marksObtained,
            maxMarks: marksState[key].maxMarks
          });
        }
      }

      if (marksToSave.length === 0) {
        toast.info("No marks modified to save. Try editing a mark first.");
        setIsSaving(prev => ({ ...prev, [processKey]: false }));
        return;
      }

      const res = await saveStudentMarksBatch(studentId, marksToSave);
      if (res.success) {
        toast.success("Marks saved successfully!");
        setOpenDialogs(prev => ({ ...prev, [processKey]: false })); // Close dialog on success
      } else {
        toast.error(res.error || "Failed to save marks");
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsSaving(prev => ({ ...prev, [processKey]: false }));
    }
  };

  const toRoman = (num: number) => {
    const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
    return romanNumerals[num - 1] || num.toString();
  };

  return (
    <div className="space-y-4">
      {/* Filter Toolbar (Rule 7.4) */}
      <div className="border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 sm:p-3.5 bg-white dark:bg-slate-900 shadow-xs flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <Input 
            placeholder="Search students by name or phone..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 font-medium"
          />
        </div>
        <div className="flex flex-wrap sm:flex-nowrap gap-2 items-center">
          <Select value={selectedCourse} onValueChange={(val) => setSelectedCourse(val as string)}>
            <SelectTrigger className="w-full sm:w-[180px] h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
              <span className="truncate text-left block w-full pr-1">
                {selectedCourse === "all" ? "All Courses" : courses.find(c => c.id === selectedCourse)?.title || "All Courses"}
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedBatch} onValueChange={(val) => setSelectedBatch(val as string)}>
            <SelectTrigger className="w-full sm:w-[180px] h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
              <span className="truncate text-left block w-full pr-1">
                {selectedBatch === "all" ? "All Batches" : batches.find(b => b.id === selectedBatch)?.name || "All Batches"}
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Batches</SelectItem>
              {batches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Student List Card (Rule 7.4 & 7.5) */}
      <div className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden bg-white dark:bg-slate-900">
        <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
          {paginatedStudents.map(student => {
            const topicsObj = getCourseTopics(student.courseId);
            const terms = Object.keys(topicsObj);
            const studentName = student.user?.name || student.fullName;

            return (
              <div 
                key={student.id} 
                className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-3 sm:p-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all gap-3 group"
              >
                {/* Primary Student Info */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Avatar className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shrink-0">
                    <AvatarImage src={student.user?.image || student.photoUrl || undefined} className="object-cover" />
                    <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-primary font-bold text-xs rounded-xl">
                      {studentName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                        {studentName}
                      </h4>
                      {student.phone && (
                        <span className="text-[10px] text-slate-400 font-medium">({student.phone})</span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-medium text-slate-500">
                      <span className="font-bold text-primary dark:text-primary/90">{student.enrollmentNo}</span>
                      <span>•</span>
                      <span className="truncate max-w-[140px]" title={student.course?.title}>{student.course?.title || "No Course"}</span>
                      {student.batch?.name && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-[120px]">{student.batch.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Semesters & Marks Buttons */}
                <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between lg:justify-end shrink-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {terms.map((term, index) => {
                      const semesterNumber = index + 1;
                      const semesterData = student.semesters?.find((s: any) => s.semesterNumber === semesterNumber);
                      const units = topicsObj[term] || [];
                      const processKey = `${student.id}-${semesterNumber}`;
                      const isOpen = openDialogs[processKey] || false;

                      return (
                        <Dialog 
                          key={term} 
                          open={isOpen} 
                          onOpenChange={(open) => setOpenDialogs(prev => ({ ...prev, [processKey]: open }))}
                        >
                          <DialogTrigger render={
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className={`h-7 px-2.5 rounded-md text-[11px] font-semibold transition-all ${semesterData ? 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
                            />
                          }>
                            Sem-{toRoman(semesterNumber)}
                          </DialogTrigger>
                          <DialogContent className="max-w-xl rounded-2xl p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900">
                            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
                              <DialogTitle className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <FileText className="h-4 w-4 text-primary" />
                                <span>{studentName} - {term} Marks</span>
                              </DialogTitle>
                              <span className="text-xs text-slate-500 font-medium truncate max-w-[180px]">{student.course?.title}</span>
                            </div>
                            
                            <div className="p-4 sm:p-5 space-y-3 max-h-[60vh] overflow-y-auto">
                              {units.length === 0 ? (
                                <p className="text-center text-slate-400 text-xs py-6">No units configured for this semester.</p>
                              ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                  {units.map((unitObj: any, i: number) => {
                                    const unitName = `Unit ${i + 1}`;
                                    const existingMark = semesterData?.marks?.find((m: any) => m.unitName === unitName);
                                    const currentVal = getMarkValue(student.id, semesterNumber, unitName, existingMark?.marksObtained || 0, existingMark?.maxMarks || 100);

                                    return (
                                      <div key={unitName} className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-3 border border-slate-100 dark:border-slate-800 space-y-2">
                                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate" title={unitObj.title || unitName}>
                                          {unitObj.title || unitName}
                                        </p>
                                        <div className="flex items-center gap-2">
                                          <div className="flex-1 space-y-0.5">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase">Obtained</span>
                                            <Input 
                                              type="number" 
                                              value={currentVal.marksObtained}
                                              onChange={(e) => handleMarkChange(student.id, semesterNumber, unitName, "marksObtained", e.target.value)}
                                              className="h-8 text-xs rounded-lg font-medium"
                                            />
                                          </div>
                                          <div className="w-16 space-y-0.5">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase">Max</span>
                                            <Input 
                                              type="number" 
                                              value={currentVal.maxMarks}
                                              onChange={(e) => handleMarkChange(student.id, semesterNumber, unitName, "maxMarks", e.target.value)}
                                              className="h-8 text-xs rounded-lg font-medium bg-slate-100 dark:bg-slate-800 text-slate-500"
                                              readOnly 
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>

                            <div className="p-3.5 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 px-3 rounded-lg text-xs font-semibold text-slate-500" 
                                onClick={() => setOpenDialogs(prev => ({ ...prev, [processKey]: false }))}
                              >
                                Cancel
                              </Button>
                              <Button 
                                size="sm"
                                className="h-8 px-4 rounded-lg text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground" 
                                disabled={isSaving[processKey] || units.length === 0}
                                onClick={() => saveMarks(student.id, semesterNumber)}
                              >
                                {isSaving[processKey] ? "Saving..." : "Save Marks"}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      );
                    })}
                  </div>

                  {/* Status Badge */}
                  <div className="shrink-0 text-right min-w-[70px]">
                    {(() => {
                      if (!student.semesters || student.semesters.length === 0) {
                        return <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase tracking-wider">Pending</span>;
                      }
                      
                      let allPassed = true;
                      let marksExist = false;
                      for (const sem of student.semesters) {
                        if (sem.marks && sem.marks.length > 0) {
                          marksExist = true;
                          for (const mark of sem.marks) {
                            const percent = (mark.marksObtained / mark.maxMarks) * 100;
                            if (percent < 40) {
                              allPassed = false;
                            }
                          }
                        }
                      }
                      
                      if (!marksExist) {
                        return <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase tracking-wider">Pending</span>;
                      }
                      
                      return allPassed ? (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Passed</span>
                      ) : (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 uppercase tracking-wider">Failed</span>
                      );
                    })()}
                  </div>
                </div>
              </div>
            );
          })}
          
          {filteredStudents.length === 0 && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <UserCheck className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">No students found</p>
              <p className="text-[11px] text-slate-400">Try adjusting your filters or search query.</p>
            </div>
          )}
        </div>

        {/* Pagination Footer (Rule 7.6) */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20">
            <div className="text-xs font-medium text-slate-500">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredStudents.length)} of {filteredStudents.length} students
            </div>
            <div className="flex items-center gap-1">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-7 px-2 rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xs text-xs font-semibold"
              >
                Previous
              </Button>
              <span className="px-2 text-xs font-semibold text-slate-700 dark:text-slate-300 select-none">
                {currentPage} / {totalPages}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-7 px-2 rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xs text-xs font-semibold"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

