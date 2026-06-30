"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, GraduationCap, Printer, CheckSquare, Building2, FileText, CheckCircle, ChevronDown, Check, Eye, Download } from "lucide-react";
import { enrollStudentsToExam } from "@/app/actions/exam";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useParams, usePathname, useRouter } from "next/navigation";
import { getTenantLink } from "@/lib/routing";
import { DocumentRenderer, DocumentRendererRef } from "@/components/documents/DocumentRenderer";
import { jsPDF } from "jspdf";

export default function AdmitCardTab({ students, courses, batches, exams }: { students: any[], courses: any[], batches: any[], exams: any[] }) {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const tenant = params.tenant as string;
  
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
        // Deselect all
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
    if (!selectedExamId) return toast.error("Please select an Target Exam first.");

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
      // Trigger render for current student
      const studentId = bulkState.queue[bulkState.currentIndex];
      handlePrintTrigger(studentId, false, true); // true = isBulk mode, so don't show preview
    } else if (bulkState.isActive && bulkState.currentIndex === bulkState.queue.length && bulkState.queue.length > 0) {
      // Finished
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
    
    // We pass `autoDownload` false because bulk uses its own pipeline, preview uses preview.
    setPrintData({ student: mappedStudent, examData, autoDownload: isBulk ? false : autoDownload, timestamp: Date.now() });
  };

  const handleRendererReady = async () => {
    if (!rendererRef.current || !printData) return;

    if (!rendererRef.current.hasTemplate()) {
      // Template missing or failed to load. The DocumentRenderer already toasted an error.
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
      
      // Move to next student
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
    <div className="space-y-8 mt-6">
      {/* Configuration Header */}
      <Card className="border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/20 dark:shadow-none">
        <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b p-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <GraduationCap className="w-5 h-5" />
            </div>
            <CardTitle className="text-xl font-bold">Generate Admit Cards</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            <div className="flex flex-col gap-2 lg:col-span-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">1. Select Target Exam</label>
              <Select value={selectedExamId} onValueChange={(val) => {
                setSelectedExamId(val as string);
                setSelectedShiftId("all");
              }}>
                <SelectTrigger className="h-14 rounded-2xl font-bold bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 text-left px-4">
                  {selectedExam ? (
                    <div className="flex flex-col items-start leading-tight overflow-hidden">
                      <span className="font-bold truncate w-full">{selectedExam.title}</span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {selectedExam.date ? new Date(selectedExam.date).toLocaleDateString('en-GB') : 'No date'} • {selectedExam.shifts?.length || 0} shifts
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-500">Select an offline exam...</span>
                  )}
                </SelectTrigger>
                <SelectContent>
                  {exams.filter(e => e.type === "OFFLINE").map(e => (
                    <SelectItem key={e.id} value={e.id}>
                      <div className="flex flex-col py-1">
                         <span className="font-bold">{e.title}</span>
                         <span className="text-xs text-slate-500 mt-0.5">
                           {e.date ? new Date(e.date).toLocaleDateString('en-GB') : 'No date'} • {e.shifts?.length || 0} shifts
                         </span>
                       </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedExam && (
                <p className="text-[11px] font-bold text-emerald-600 pl-2">
                  Total Capacity: {totalCapacity} Students
                </p>
              )}
            </div>
            
            <div className="flex flex-col gap-2 lg:col-span-1">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">2. Target Shift</label>
              <Select value={selectedShiftId} onValueChange={(val) => setSelectedShiftId(val as string)} disabled={!selectedExamId}>
                <SelectTrigger className="h-14 rounded-2xl font-bold bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 text-sm text-left px-4">
                  {selectedShiftId === "auto_sequential" ? (
                    <span className="text-slate-700 dark:text-slate-300">Auto-Assign (Sequential)</span>
                  ) : selectedShiftId === "auto_equal" ? (
                    <span className="text-slate-700 dark:text-slate-300">Auto-Assign (Equal)</span>
                  ) : (
                    <div className="flex flex-col items-start leading-tight overflow-hidden">
                      <span className="font-bold truncate w-full">{selectedExam?.shifts?.find((s: any) => s.id === selectedShiftId)?.title || "Selected Shift"}</span>
                      <span className="text-[10px] text-emerald-600 font-medium">Selected Shift</span>
                    </div>
                  )}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto_sequential">
                    <div className="flex flex-col py-1">
                      <span className="font-bold">Auto-Assign: Sequential</span>
                      <span className="text-[10px] text-slate-500 mt-0.5">Fill shifts one by one</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="auto_equal">
                    <div className="flex flex-col py-1">
                      <span className="font-bold">Auto-Assign: Equal Distribution</span>
                      <span className="text-[10px] text-slate-500 mt-0.5">Distribute evenly across all shifts</span>
                    </div>
                  </SelectItem>
                  {selectedExam?.shifts?.map((shift: any, index: number) => {
                    const available = shift.capacity - (shift._count?.enrollments || 0);
                    const shiftNumbers = ["One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
                    const shiftName = `Shift ${shiftNumbers[index] || index + 1}`;
                    return (
                      <SelectItem key={shift.id} value={shift.id} disabled={available <= 0}>
                        <div className="flex flex-col py-1">
                           <span className="font-bold">{shiftName}</span>
                           <span className={`text-xs mt-0.5 ${available > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                             {shift.startTime} - {shift.endTime} • {available} seats left
                           </span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2 lg:col-span-1">
              <label className="text-xs font-bold uppercase tracking-widest text-transparent select-none hidden lg:block">Action</label>
              <Button 
                onClick={handleGenerateAdmitCards} 
                disabled={isProcessing || !selectedExamId || selectedStudents.size === 0}
                className="h-14 rounded-2xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white w-full shadow-lg shadow-emerald-600/20 px-2"
              >
                <CheckSquare className="w-4 h-4 mr-1.5 shrink-0" /> Assign ({selectedStudents.size})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
        
        <Select value={filterExamId} onValueChange={(val) => { setFilterExamId(val as string); setFilterShiftId("all"); }}>
          <SelectTrigger className="w-full md:w-[200px] h-12 rounded-2xl font-semibold capitalize px-4 text-left overflow-hidden">
            {filterExamId === "all" ? (
              <span className="text-slate-500">All Exams</span>
            ) : (
              <span className="truncate w-full block">{exams.find(e => e.id === filterExamId)?.title}</span>
            )}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="font-semibold capitalize">All Exams</SelectItem>
            {exams.filter(e => e.type === "OFFLINE").map(e => (
              <SelectItem key={e.id} value={e.id} className="font-semibold capitalize">{e.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterShiftId} onValueChange={(val) => setFilterShiftId(val as string)} disabled={filterExamId === "all"}>
          <SelectTrigger className="w-full md:w-[200px] h-12 rounded-2xl font-semibold capitalize px-4 text-left overflow-hidden">
            {filterShiftId === "all" ? (
              <span className="text-slate-500">All Shifts</span>
            ) : (
              <span className="truncate w-full block">
                {(() => {
                  const shiftIndex = exams.find(e => e.id === filterExamId)?.shifts?.findIndex((s: any) => s.id === filterShiftId);
                  if (shiftIndex === undefined || shiftIndex === -1) return "Selected Shift";
                  const shiftNumbers = ["One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
                  return `Shift ${shiftNumbers[shiftIndex] || shiftIndex + 1}`;
                })()}
              </span>
            )}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="font-semibold capitalize">All Shifts</SelectItem>
            {filterExamId !== "all" && exams.find(e => e.id === filterExamId)?.shifts?.map((shift: any, index: number) => {
              const shiftNumbers = ["One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
              const shiftName = `Shift ${shiftNumbers[index] || index + 1}`;
              return <SelectItem key={shift.id} value={shift.id} className="font-semibold capitalize">{shiftName}</SelectItem>;
            })}
          </SelectContent>
        </Select>
        
        <Button onClick={handlePrintAdmitCards} variant="outline" className="h-12 rounded-2xl font-bold gap-2">
           <Printer className="w-4 h-4" /> Print Admits
        </Button>
      </div>

      <Card className="border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] bg-white dark:bg-slate-900 overflow-hidden">
        {/* Bulk Actions Header */}
        <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 pl-4">
            <Checkbox 
              checked={selectedStudents.size === filteredStudents.length && filteredStudents.length > 0} 
              onCheckedChange={toggleAll}
              className="h-5 w-5 rounded-[6px]"
            />
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Select All ({filteredStudents.length})
            </span>
          </div>
        </div>

        <CardContent className="p-0">
          <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
            {paginatedStudents.map(student => (
              <div 
                key={student.id} 
                className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-6 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all gap-6 group border-l-4 border-slate-900 dark:border-slate-100 cursor-pointer"
                onClick={() => toggleStudent(student.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center shrink-0 w-8" onClick={(e) => e.stopPropagation()}>
                    <Checkbox 
                      checked={selectedStudents.has(student.id)} 
                      onCheckedChange={() => toggleStudent(student.id)}
                      className="h-5 w-5 rounded-[6px]"
                    />
                  </div>
                  <Avatar className="h-14 w-14 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shrink-0 shadow-sm">
                    <AvatarImage src={student.photoUrl || student.admissionApp?.photoUrl || student.user?.image || ""} className="object-cover" />
                    <AvatarFallback className="bg-primary/5 text-primary font-bold rounded-2xl">
                      {student.user?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex flex-col items-start gap-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm text-slate-900 dark:text-white">{student.user?.name}</p>
                        <Badge variant="outline" className="text-[10px] font-bold px-1.5 py-0 rounded uppercase tracking-widest border-none bg-emerald-500/10 text-emerald-600">
                          {student.semesters?.length > 0 ? student.semesters[student.semesters.length - 1].name : "Student"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <p className="text-[10px] font-medium text-slate-500 flex items-center gap-1.5">
                          <Building2 className="h-3 w-3 text-slate-400 shrink-0" /> {student.enrollmentNo || "No Reg No"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 w-full lg:w-auto pl-12 lg:pl-0">
                  <div className="flex flex-wrap md:flex-nowrap gap-4 md:gap-8 w-full md:w-auto bg-slate-50 dark:bg-slate-800/40 lg:bg-transparent p-4 lg:p-0 rounded-xl">
                    <div className="text-left md:text-right w-1/2 md:w-auto">
                      <p className="font-bold font-mono text-sm text-indigo-600 dark:text-indigo-400">
                        {student.batch?.name || "Unassigned"}
                      </p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Batch</p>
                    </div>
                    <div className="text-left md:text-right w-1/2 md:w-auto">
                      <span className="font-medium text-sm text-slate-900 dark:text-white flex items-start md:items-center gap-1 justify-start md:justify-end" title={student.course?.title}>
                        <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5 md:mt-0" />
                        <span className="text-left md:text-right break-words">{student.course?.shortName || student.course?.title?.split(' ').map((w: string) => w[0]).join('').substring(0, 4).toUpperCase() || "No Course"}</span>
                      </span>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Course</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full lg:w-auto mt-2 lg:mt-0 bg-slate-50 dark:bg-slate-800/40 lg:bg-transparent rounded-xl p-1 lg:p-0">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={(e) => { e.stopPropagation(); handleIssueSingle(student.id); }} 
                      disabled={isProcessing}
                      className="h-8 text-xs font-bold gap-1 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-none dark:bg-emerald-900/20"
                    >
                      <CheckSquare className="w-3 h-3" /> Issue
                    </Button>
                    <Button variant="outline" size="sm" onClick={(e) => { 
                      e.stopPropagation(); 
                      handlePrintTrigger(student.id, false);
                    }} className="h-8 text-xs font-bold gap-1 rounded-xl">
                      <Eye className="w-3 h-3" /> View
                    </Button>
                    <Button variant="outline" size="sm" onClick={(e) => { 
                      e.stopPropagation(); 
                      handlePrintTrigger(student.id, true);
                    }} className="h-8 text-xs font-bold gap-1 rounded-xl">
                      <Download className="w-3 h-3" /> Download
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-20">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 mb-4">
                <Search className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Students Found</h3>
              <p className="text-sm font-medium text-slate-500 mt-1">Try adjusting your search criteria or changing tabs.</p>
            </div>
          )}
          {filteredStudents.length > 0 && totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 gap-4">
              <p className="text-sm text-slate-500 font-medium">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredStudents.length)} of {filteredStudents.length} entries
              </p>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-xl font-bold"
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <Button
                      key={i + 1}
                      variant={currentPage === i + 1 ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 p-0 rounded-xl font-bold ${currentPage === i + 1 ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'text-slate-600'}`}
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-xl font-bold"
                >
                  Next
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
