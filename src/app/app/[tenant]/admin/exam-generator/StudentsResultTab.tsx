"use client";

import { useState, useEffect } from "react";
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
  const [marksState, setMarksState] = useState<Record<string, { marksObtained: number, maxMarks: number }>>({});
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({});
  const [openDialogs, setOpenDialogs] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedBatch, selectedCourse]);

  const filteredStudents = students.filter(s => {
    if (selectedBatch !== "all" && s.batchId !== selectedBatch) return false;
    if (selectedCourse !== "all" && s.courseId !== selectedCourse) return false;
    if (search && !s.user?.name?.toLowerCase().includes(search.toLowerCase()) && !s.fullName?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

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
    <div className="space-y-8 mt-6">
      <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-900 p-6 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search students..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800"
          />
        </div>
        <Select value={selectedCourse} onValueChange={(val) => setSelectedCourse(val as string)}>
          <SelectTrigger className="w-full md:w-[200px] h-12 rounded-2xl capitalize">
            <span className="truncate">
              {selectedCourse === "all" ? "All Courses" : courses.find(c => c.id === selectedCourse)?.title || "All Courses"}
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="capitalize">All Courses</SelectItem>
            {courses.map(c => <SelectItem key={c.id} value={c.id} className="capitalize">{c.title}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={selectedBatch} onValueChange={(val) => setSelectedBatch(val as string)}>
          <SelectTrigger className="w-full md:w-[200px] h-12 rounded-2xl capitalize">
            <span className="truncate">
              {selectedBatch === "all" ? "All Batches" : batches.find(b => b.id === selectedBatch)?.name || "All Batches"}
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="capitalize">All Batches</SelectItem>
            {batches.map(b => <SelectItem key={b.id} value={b.id} className="capitalize">{b.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-slate-50/50 dark:bg-slate-950/50 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800/50 p-8 shadow-inner">
        <div className="space-y-4">
          {paginatedStudents.map(student => {
            const topicsObj = getCourseTopics(student.courseId);
            const terms = Object.keys(topicsObj);
            const studentName = student.user?.name || student.fullName;

            return (
              <div 
                key={student.id} 
                className="group bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-100 dark:border-slate-800/50 p-6 transition-all duration-300 hover:border-primary/30 dark:hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 dark:hover:shadow-black/60 flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex items-center gap-5 flex-1 min-w-0">
                  <Avatar className="h-14 w-14 rounded-2xl border-2 border-slate-200/50 dark:border-slate-700/50 shrink-0">
                    <AvatarImage src={student.user?.image || student.photoUrl || undefined} className="object-cover" />
                    <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-primary font-bold text-lg rounded-2xl">
                      {studentName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-900 dark:text-white truncate text-lg leading-none">
                        {studentName} {student.phone ? `- ${student.phone}` : ''}
                      </h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-slate-400 dark:text-slate-500">
                      <span className="text-[10px] font-bold tracking-wider text-primary/70 uppercase">{student.enrollmentNo}</span>
                      <span className="h-1 w-1 rounded-full bg-slate-200 dark:bg-slate-800" />
                      <span className="text-[10px] font-bold whitespace-nowrap truncate max-w-[150px]" title={student.course?.title}>
                        {student.course?.title || "No Course"}
                      </span>
                      {student.course?.duration && (
                        <>
                          <span className="h-1 w-1 rounded-full bg-slate-200 dark:bg-slate-800" />
                          <span className="text-[10px] font-bold whitespace-nowrap">
                            {student.course.duration} Months
                          </span>
                        </>
                      )}
                      {student.admissionDate && (
                        <>
                          <span className="h-1 w-1 rounded-full bg-slate-200 dark:bg-slate-800" />
                          <span className="text-[10px] font-bold whitespace-nowrap">
                            {new Date(student.admissionDate).toLocaleDateString('en-GB')}
                          </span>
                        </>
                      )}
                      {student.batch?.name && (
                        <>
                          <span className="h-1 w-1 rounded-full bg-slate-200 dark:bg-slate-800" />
                          <span className="text-[10px] font-bold whitespace-nowrap truncate max-w-[150px]">
                            {student.batch.name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 shrink-0 flex-wrap max-w-[300px] ml-auto">
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
                            className={`h-9 px-3 rounded-xl font-bold text-xs border-2 transition-all ${semesterData ? 'border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10' : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                          />
                        }>
                          Sem-{toRoman(semesterNumber)}
                        </DialogTrigger>
                        <DialogContent className="max-w-xl rounded-[2rem] p-0 border-none shadow-2xl overflow-hidden bg-white dark:bg-slate-950">
                          <DialogHeader className="p-6 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                            <DialogTitle className="text-xl font-black flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                <FileText className="h-5 w-5" />
                              </div>
                              <div>
                                {studentName} - {term} Marks
                                <p className="text-xs font-medium text-slate-500 mt-1">{student.course?.title}</p>
                              </div>
                            </DialogTitle>
                          </DialogHeader>
                          
                          <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                            {units.length === 0 ? (
                              <p className="text-center text-slate-500 text-sm py-8">No units configured for this semester.</p>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {units.map((unitObj: any, i: number) => {
                                  const unitName = `Unit ${i + 1}`;
                                  const existingMark = semesterData?.marks?.find((m: any) => m.unitName === unitName);
                                  const currentVal = getMarkValue(student.id, semesterNumber, unitName, existingMark?.marksObtained || 0, existingMark?.maxMarks || 100);

                                  return (
                                    <div key={unitName} className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                                      <p className="text-xs font-bold text-slate-500 mb-3 truncate" title={unitObj.title || unitName}>
                                        {unitObj.title || unitName}
                                      </p>
                                      <div className="flex items-center gap-3">
                                        <div className="flex-1">
                                          <p className="text-[10px] font-bold text-slate-400 mb-1 ml-1 uppercase">Obtained</p>
                                          <Input 
                                            type="number" 
                                            value={currentVal.marksObtained}
                                            onChange={(e) => handleMarkChange(student.id, semesterNumber, unitName, "marksObtained", e.target.value)}
                                            className="h-10 rounded-xl font-bold bg-white dark:bg-slate-950"
                                          />
                                        </div>
                                        <div className="w-16">
                                          <p className="text-[10px] font-bold text-slate-400 mb-1 ml-1 uppercase">Total</p>
                                          <Input 
                                            type="number" 
                                            value={currentVal.maxMarks}
                                            onChange={(e) => handleMarkChange(student.id, semesterNumber, unitName, "maxMarks", e.target.value)}
                                            className="h-10 rounded-xl font-bold bg-white dark:bg-slate-950 text-slate-500"
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

                          <DialogFooter className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                            <Button 
                              variant="outline" 
                              className="rounded-xl h-12 font-bold" 
                              onClick={() => setOpenDialogs(prev => ({ ...prev, [processKey]: false }))}
                            >
                              Cancel
                            </Button>
                            <Button 
                              className="rounded-xl h-12 font-bold bg-primary hover:bg-primary/90 text-primary-foreground min-w-[140px]" 
                              disabled={isSaving[processKey] || units.length === 0}
                              onClick={() => saveMarks(student.id, semesterNumber)}
                            >
                              {isSaving[processKey] ? "Saving..." : "Save Marks"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    );
                  })}
                </div>

                <div className="flex items-center gap-8 md:pl-8 md:border-l-2 md:border-slate-100 dark:md:border-slate-800/50 shrink-0">
                  <div className="flex flex-col items-center w-24 justify-center">
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mb-1 flex items-center gap-1">
                      <FileText className="h-2.5 w-2.5" />
                      Result
                    </p>
                    {(() => {
                      if (!student.semesters || student.semesters.length === 0) {
                        return <Badge variant="secondary" className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200">Not Provided</Badge>;
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
                         return <Badge variant="secondary" className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200">Not Provided</Badge>;
                      }
                      
                      return allPassed ? (
                        <Badge className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 hover:bg-emerald-500/20 shadow-none border-none">Pass</Badge>
                      ) : (
                        <Badge className="text-[10px] font-bold text-rose-600 bg-rose-500/10 hover:bg-rose-500/20 shadow-none border-none">Fail</Badge>
                      );
                    })()}
                  </div>
                </div>
              </div>
            );
          })}
          
          {filteredStudents.length === 0 && (
            <div className="py-24 flex flex-col items-center justify-center text-center space-y-4 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
               <div className="w-20 h-20 rounded-[2rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300">
                  <UserCheck className="w-10 h-10" />
               </div>
               <p className="text-lg font-bold text-slate-900 dark:text-white">No students found</p>
               <p className="text-sm font-medium text-slate-500">Try adjusting your filters or search query.</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t-2 border-slate-200/50 dark:border-slate-800/50 mt-4">
              <p className="text-sm font-bold text-slate-500">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredStudents.length)} of {filteredStudents.length} students
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-xl font-bold border-2 h-10 px-4"
                >
                  Previous
                </Button>
                <div className="flex items-center justify-center min-w-[40px] text-sm font-black text-slate-700 dark:text-slate-300">
                  {currentPage} / {totalPages}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-xl font-bold border-2 h-10 px-4"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

