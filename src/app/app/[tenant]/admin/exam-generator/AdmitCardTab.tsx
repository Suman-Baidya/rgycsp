"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Search, GraduationCap, Printer, CheckSquare, Building2, ChevronLeft, ChevronRight, Eye, Download } from "lucide-react";
import { enrollStudentsToExam } from "@/app/actions/exam";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DocumentRenderer, DocumentRendererRef } from "@/components/documents/DocumentRenderer";
import type { jsPDF } from "jspdf";

export default function AdmitCardTab({ students, courses, batches, exams }: { students: any[], courses: any[], batches: any[], exams: any[] }) {
  const [search, setSearch] = useState("");
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [filterExamId, setFilterExamId] = useState<string>("all");
  const [filterShiftId, setFilterShiftId] = useState<string>("all");
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedShiftId, setSelectedShiftId] = useState<string>("auto_sequential");
  
  const rendererRef = useRef<DocumentRendererRef>(null);
  const pdfRef = useRef<jsPDF | null>(null);
  
  const [printData, setPrintData] = useState<{student: any, examData: any, autoDownload: boolean, timestamp: number} | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterExamId, filterShiftId]);
  
  // Bulk Printing State
  const [bulkState, setBulkState] = useState<{
    isActive: boolean;
    queue: string[]; // student IDs
    currentIndex: number;
    examId: string;
  }>({ isActive: false, queue: [], currentIndex: 0, examId: "" });

  const filteredStudents = students.filter(s => {
    if (search && !s.user?.name?.toLowerCase().includes(search.toLowerCase())) return false;
    
    if (filterExamId !== "all") {
      const enrollmentsForExam = s.examEnrollments?.filter((enr: any) => 
        exams.find(e => e.id === filterExamId)?.shifts?.some((sh: any) => sh.id === enr.examShiftId)
      );
      if (!enrollmentsForExam || enrollmentsForExam.length === 0) return false;
      
      if (filterShiftId !== "all") {
        const isInShift = enrollmentsForExam.some((enr: any) => enr.examShiftId === filterShiftId);
        if (!isInShift) return false;
      }
    }
    return true;
  });

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  };

  const toggleStudent = (id: string) => {
    const newSet = new Set(selectedStudents);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedStudents(newSet);
  };

  const toggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(new Set(filteredStudents.map(s => s.id)));
    } else {
      setSelectedStudents(new Set());
    }
  };

  const handleGenerateAdmitCards = async () => {
    if (!selectedExamId) return toast.error("Please select an exam first.");
    if (selectedStudents.size === 0) return toast.error("Please select at least one student.");

    let strategy: 'sequential' | 'equal' = 'sequential';
    let shiftId = undefined;

    if (selectedShiftId === "auto_sequential") {
      strategy = "sequential";
    } else if (selectedShiftId === "auto_equal") {
      strategy = "equal";
    } else {
      shiftId = selectedShiftId;
    }

    setIsProcessing(true);
    try {
      const studentIds = Array.from(selectedStudents);
      const res = await enrollStudentsToExam(selectedExamId, studentIds, {
        shiftId,
        strategy
      });
      if (res.success) {
        toast.success(res.message);
        setSelectedStudents(new Set());
      } else {
        toast.error(res.error || "Failed to enroll students");
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleIssueSingle = async (studentId: string) => {
    if (!selectedExamId) return toast.error("Please select a Target Exam first.");

    let strategy: 'sequential' | 'equal' = 'sequential';
    let shiftId = undefined;

    if (selectedShiftId === "auto_sequential") {
      strategy = "sequential";
    } else if (selectedShiftId === "auto_equal") {
      strategy = "equal";
    } else {
      shiftId = selectedShiftId;
    }

    setIsProcessing(true);
    try {
      const res = await enrollStudentsToExam(selectedExamId, [studentId], {
        shiftId,
        strategy
      });
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.error || "Failed to issue admit card");
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrintAdmitCards = () => {
    if (selectedStudents.size === 0) {
      return toast.error("Please select at least one student to print.");
    }
    const targetExamId = filterExamId !== "all" ? filterExamId : selectedExamId;
    if (!targetExamId) {
      return toast.error("Please select a target exam first.");
    }
    
    setBulkState({
      isActive: true,
      queue: Array.from(selectedStudents),
      currentIndex: 0,
      examId: targetExamId
    });
    pdfRef.current = null;
    toast.loading("Starting Bulk PDF Generation...", { id: "bulk-print" });
  };

  useEffect(() => {
    if (bulkState.isActive && bulkState.currentIndex < bulkState.queue.length) {
      const studentId = bulkState.queue[bulkState.currentIndex];
      handlePrintTrigger(studentId, false, true);
    } else if (bulkState.isActive && bulkState.currentIndex === bulkState.queue.length && bulkState.queue.length > 0) {
      if (pdfRef.current) {
        pdfRef.current.save(`Bulk_Admit_Cards.pdf`);
        toast.success(`Successfully generated ${bulkState.queue.length} admit cards!`, { id: "bulk-print" });
      } else {
        toast.error("Failed to generate PDF.", { id: "bulk-print" });
      }
      setBulkState({ isActive: false, queue: [], currentIndex: 0, examId: "" });
      pdfRef.current = null;
    }
  }, [bulkState.currentIndex, bulkState.isActive]);

  const handlePrintTrigger = (studentId: string, autoDownload: boolean, isBulk: boolean = false) => {
    const targetExamId = isBulk ? bulkState.examId : (filterExamId !== "all" ? filterExamId : selectedExamId);
    if (!targetExamId) { 
      toast.error("Please select an exam first"); 
      return; 
    }

    const student = students.find(s => s.id === studentId);
    const exam = exams.find(e => e.id === targetExamId);
    
    if (!student || !exam) {
      toast.error("Could not find student or exam details");
      return;
    }

    const enrolledShift = exam.shifts?.find((s: any) => 
      student.examEnrollments?.some((enr: any) => enr.examShiftId === s.id)
    );
    const enrollment = student.examEnrollments?.find((enr: any) => enr.examShiftId === enrolledShift?.id);

    const examData = {
      title: exam.title,
      date: exam.date,
      duration: exam.duration,
      syllabus: exam.syllabus,
      time: enrolledShift ? `${enrolledShift.startTime || ""} - ${enrolledShift.endTime || ""}` : "",
      rollNo: enrollment?.rollNo || student.enrollmentNo
    };

    const mappedStudent = {
      ...student,
      fullName: student.user?.name,
      email: student.user?.email,
    };
    
    if (isBulk) {
      toast.loading(`Processing Admit Card ${bulkState.currentIndex + 1} of ${bulkState.queue.length}...`, { id: "bulk-print" });
    } else {
      toast.info("Preparing rendering engine...");
    }
    
    setPrintData({ student: mappedStudent, examData, autoDownload: isBulk ? false : autoDownload, timestamp: Date.now() });
  };

  const handleRendererReady = async () => {
    if (!rendererRef.current || !printData) return;

    if (!rendererRef.current.hasTemplate()) {
      if (bulkState.isActive) {
        setBulkState({ isActive: false, queue: [], currentIndex: 0, examId: "" });
        pdfRef.current = null;
      }
      setPrintData(null);
      return;
    }

    if (bulkState.isActive) {
      const imgData = await rendererRef.current.getImgData();
      const dims = rendererRef.current.getTemplateDimensions();
      if (imgData && dims) {
        if (!pdfRef.current) {
          const { jsPDF } = await import("jspdf");
          pdfRef.current = new jsPDF({
            orientation: dims.orientation,
            unit: "px",
            format: [dims.width, dims.height]
          });
        } else {
          pdfRef.current.addPage([dims.width, dims.height], dims.orientation);
        }
        pdfRef.current.addImage(imgData, "JPEG", 0, 0, dims.width, dims.height);
      }
      
      setBulkState(prev => ({ ...prev, currentIndex: prev.currentIndex + 1 }));
    } else {
      if (printData.autoDownload) {
        rendererRef.current.downloadPDF();
      } else {
        rendererRef.current.preview();
      }
    }
  };

  const selectedExam = exams.find(e => e.id === selectedExamId);
  const totalCapacity = selectedExam?.shifts?.reduce((acc: number, shift: any) => acc + shift.capacity - (shift._count?.enrollments || 0), 0) || 0;

  return (
    <div className="space-y-4">
      {/* 1. Assignment Toolbar Card (Rule 7.4) */}
      <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden bg-white dark:bg-slate-900">
        <div className="p-3 sm:p-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
              <GraduationCap className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                Batch Admit Card Assignment
              </h3>
              <p className="text-[11px] font-medium text-slate-500">
                Assign selected students to offline exam shifts and issue roll numbers
              </p>
            </div>
          </div>
          {selectedExam && (
            <Badge variant="outline" className="text-[10px] font-bold px-2 py-0.5 rounded-md border-emerald-500/20 bg-emerald-500/10 text-emerald-600 self-start sm:self-auto">
              Total Capacity: {totalCapacity} Seats
            </Badge>
          )}
        </div>

        <CardContent className="p-3 sm:p-3.5">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-end">
            <div className="flex flex-col gap-1 md:col-span-5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">1. Target Offline Exam</label>
              <Select value={selectedExamId} onValueChange={(val) => {
                setSelectedExamId(val as string);
                setSelectedShiftId("auto_sequential");
              }}>
                <SelectTrigger className="h-8 sm:h-9 text-xs font-medium rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
                  {selectedExam ? (
                    <span className="truncate block text-left font-semibold text-slate-900 dark:text-white">
                      {selectedExam.title} <span className="font-normal text-slate-400">({selectedExam.date ? new Date(selectedExam.date).toLocaleDateString('en-GB') : 'No date'} • {selectedExam.shifts?.length || 0} shifts)</span>
                    </span>
                  ) : (
                    <span className="text-slate-400 text-xs">Select an offline exam...</span>
                  )}
                </SelectTrigger>
                <SelectContent>
                  {exams.filter(e => e.type === "OFFLINE").map(e => (
                    <SelectItem key={e.id} value={e.id} className="text-xs">
                      <div className="flex flex-col py-0.5">
                        <span className="font-semibold">{e.title}</span>
                        <span className="text-[10px] text-slate-400">
                          {e.date ? new Date(e.date).toLocaleDateString('en-GB') : 'No date'} • {e.shifts?.length || 0} shifts
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1 md:col-span-4">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">2. Target Shift</label>
              <Select value={selectedShiftId} onValueChange={(val) => setSelectedShiftId(val as string)} disabled={!selectedExamId}>
                <SelectTrigger className="h-8 sm:h-9 text-xs font-medium rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
                  <span className="truncate block text-left font-medium">
                    {selectedShiftId === "auto_sequential" 
                      ? "Auto-Assign: Sequential" 
                      : selectedShiftId === "auto_equal" 
                        ? "Auto-Assign: Equal Distribution" 
                        : selectedExam?.shifts?.find((s: any) => s.id === selectedShiftId)?.title || "Selected Shift"}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto_sequential" className="text-xs font-medium">
                    Auto-Assign: Sequential (Fill shifts one by one)
                  </SelectItem>
                  <SelectItem value="auto_equal" className="text-xs font-medium">
                    Auto-Assign: Equal (Distribute evenly)
                  </SelectItem>
                  {selectedExam?.shifts?.map((shift: any, index: number) => {
                    const available = shift.capacity - (shift._count?.enrollments || 0);
                    const shiftNumbers = ["One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
                    const shiftName = `Shift ${shiftNumbers[index] || index + 1}`;
                    return (
                      <SelectItem key={shift.id} value={shift.id} disabled={available <= 0} className="text-xs">
                        <span className="font-semibold">{shiftName}</span>
                        <span className={`ml-2 text-[10px] ${available > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                          ({shift.startTime} - {shift.endTime} • {available} seats left)
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-3">
              <Button 
                onClick={handleGenerateAdmitCards} 
                disabled={isProcessing || !selectedExamId || selectedStudents.size === 0}
                className="h-8 sm:h-9 px-3 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white w-full gap-1.5 shadow-xs"
              >
                <CheckSquare className="w-3.5 h-3.5 shrink-0" />
                Assign Selected ({selectedStudents.size})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Filter Toolbar (Rule 7.4) */}
      <div className="border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 sm:p-3.5 bg-white dark:bg-slate-900 shadow-xs flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
        <div className="relative flex-1 md:max-w-[300px] group">
          <Search className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none h-3.5 w-3.5 text-slate-400" />
          <Input 
            placeholder="Search students..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 sm:h-9 pl-8 pr-3 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 rounded-lg font-normal text-[11px] sm:text-xs placeholder:text-[11px] sm:placeholder:text-xs placeholder:text-slate-400"
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap gap-2 items-center">
          <Select value={filterExamId} onValueChange={(val) => { setFilterExamId(val as string); setFilterShiftId("all"); }}>
            <SelectTrigger className="w-full sm:w-[170px] h-8 sm:h-9 text-xs font-medium rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
              <span className="truncate text-left block w-full pr-1">
                {filterExamId === "all" ? "All Exams" : exams.find(e => e.id === filterExamId)?.title || "All Exams"}
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Exams</SelectItem>
              {exams.filter(e => e.type === "OFFLINE").map(e => (
                <SelectItem key={e.id} value={e.id} className="text-xs">{e.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterShiftId} onValueChange={(val) => setFilterShiftId(val as string)} disabled={filterExamId === "all"}>
            <SelectTrigger className="w-full sm:w-[150px] h-8 sm:h-9 text-xs font-medium rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
              <span className="truncate text-left block w-full pr-1">
                {filterShiftId === "all" ? "All Shifts" : (() => {
                  const shiftIndex = exams.find(e => e.id === filterExamId)?.shifts?.findIndex((s: any) => s.id === filterShiftId);
                  if (shiftIndex === undefined || shiftIndex === -1) return "Selected Shift";
                  const shiftNumbers = ["One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
                  return `Shift ${shiftNumbers[shiftIndex] || shiftIndex + 1}`;
                })()}
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Shifts</SelectItem>
              {filterExamId !== "all" && exams.find(e => e.id === filterExamId)?.shifts?.map((shift: any, index: number) => {
                const shiftNumbers = ["One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
                const shiftName = `Shift ${shiftNumbers[index] || index + 1}`;
                return <SelectItem key={shift.id} value={shift.id} className="text-xs">{shiftName}</SelectItem>;
              })}
            </SelectContent>
          </Select>

          <Button 
            onClick={handlePrintAdmitCards} 
            variant="outline" 
            size="sm"
            className="h-8 sm:h-9 px-3 text-xs font-semibold rounded-lg border-slate-200 dark:border-slate-700 gap-1.5 shrink-0"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Admits</span>
            {selectedStudents.size > 0 && (
              <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4 font-bold">
                {selectedStudents.size}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* 3. Main Student List Card (Rule 7.4 & 7.5) */}
      <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden bg-white dark:bg-slate-900">
        {/* Selection Bar */}
        <div className="flex items-center justify-between px-3.5 sm:px-4 py-2 bg-slate-50/60 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <Checkbox 
              checked={filteredStudents.length > 0 && selectedStudents.size === filteredStudents.length} 
              onCheckedChange={toggleAll}
              className="h-4 w-4 rounded"
            />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Select All ({filteredStudents.length})
            </span>
          </div>
          {selectedStudents.size > 0 && (
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              {selectedStudents.size} student{selectedStudents.size > 1 ? "s" : ""} selected
            </span>
          )}
        </div>

        <CardContent className="p-0">
          <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
            {paginatedStudents.map(student => {
              const isSelected = selectedStudents.has(student.id);
              const studentName = student.user?.name || student.fullName || "Student";
              return (
                <div 
                  key={student.id} 
                  className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-3 sm:p-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all gap-3 sm:gap-4 group border-l-[3px] border-emerald-500 cursor-pointer"
                  onClick={() => toggleStudent(student.id)}
                >
                  {/* Primary Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center justify-center shrink-0" onClick={(e) => e.stopPropagation()}>
                      <Checkbox 
                        checked={isSelected} 
                        onCheckedChange={() => toggleStudent(student.id)}
                        className="h-4 w-4 rounded"
                      />
                    </div>
                    <Avatar className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shrink-0">
                      <AvatarImage src={student.photoUrl || student.admissionApp?.photoUrl || student.user?.image || ""} className="object-cover" />
                      <AvatarFallback className="bg-primary/5 text-primary font-bold text-xs rounded-xl">
                        {studentName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                          {studentName}
                        </p>
                        <Badge variant="outline" className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border-none bg-emerald-500/10 text-emerald-600">
                          {student.semesters?.length > 0 ? student.semesters[student.semesters.length - 1].name : "Student"}
                        </Badge>
                      </div>
                      <p className="text-[10px] font-medium text-slate-500 flex items-center gap-1.5">
                        <Building2 className="h-3 w-3 text-slate-400 shrink-0" />
                        <span>{student.enrollmentNo || "No Reg No"}</span>
                      </p>
                    </div>
                  </div>

                  {/* Metadata and Actions Group */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between lg:justify-end gap-3 w-full lg:w-auto pl-7 lg:pl-0">
                    {/* Metadata columns */}
                    <div className="flex flex-wrap md:flex-nowrap items-center gap-3 sm:gap-4 md:gap-5 w-full md:w-auto bg-slate-50/70 dark:bg-slate-800/30 lg:bg-transparent p-2 md:p-0 rounded-lg text-xs">
                      <div className="text-left shrink-0">
                        <span className="font-semibold text-xs text-indigo-600 dark:text-indigo-400 font-mono block">
                          {student.batch?.name || "Unassigned"}
                        </span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 block">Batch</span>
                      </div>

                      <div className="text-left shrink-0 max-w-[130px] sm:max-w-[150px] min-w-0">
                        <span className="font-medium text-xs text-slate-900 dark:text-white truncate block" title={student.course?.title}>
                          {student.course?.title || "No Course"}
                        </span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 block">Course</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleIssueSingle(student.id)} 
                        disabled={isProcessing}
                        className="h-7 sm:h-8 px-2.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 border-none dark:bg-emerald-950/30 dark:text-emerald-400 gap-1"
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>Issue</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handlePrintTrigger(student.id, false)} 
                        className="h-7 sm:h-8 px-2.5 rounded-lg text-xs font-semibold border-slate-200 dark:border-slate-700 gap-1"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>View</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handlePrintTrigger(student.id, true)} 
                        className="h-7 sm:h-8 px-2.5 rounded-lg text-xs font-semibold border-slate-200 dark:border-slate-700 gap-1"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-500" />
                        <span>Download</span>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredStudents.length === 0 && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">No students found</p>
              <p className="text-[11px] text-slate-400">Try adjusting your search criteria or target exam filter.</p>
            </div>
          )}

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
                  <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Prev
                </Button>
                <div className="flex items-center gap-1">
                  {getPageNumbers().map((p, i) => 
                    p === "..." ? (
                      <span key={`ellipsis-${i}`} className="px-1 text-slate-400 text-xs select-none">...</span>
                    ) : (
                      <Button
                        key={p}
                        variant={currentPage === p ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setCurrentPage(p as number)}
                        className="h-7 w-7 rounded-md font-semibold text-xs p-0"
                      >
                        {p}
                      </Button>
                    )
                  )}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="h-7 px-2 rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xs text-xs font-semibold"
                >
                  Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Internal Rendering Engine */}
      {printData && (
        <div className="relative">
          <DocumentRenderer 
            key={printData.timestamp}
            ref={rendererRef} 
            type="ADMIT_CARD" 
            student={printData.student} 
            examData={printData.examData} 
            workspaceId={null} 
            onReady={handleRendererReady}
          />
        </div>
      )}
    </div>
  );
}
