"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Save, CalendarDays, Users, Clock, Printer, Trash2, Edit, AlertTriangle, CheckCircle, Send } from "lucide-react";
import { createExam, createExamShift, deleteExam, updateExam, toggleExamCompletion, bulkIssueAdmitCards } from "@/app/actions/exam";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

export default function OfflineExamTab({ workspaceId, workspace, superAdminName, courses, exams, students = [] }: { workspaceId: string, workspace?: any, superAdminName?: string, courses: any[], exams: any[], students?: any[] }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    courseId: "",
    date: "",
    duration: "180",
    syllabus: "",
    semesterNumber: ""
  });

  const [editExamId, setEditExamId] = useState<string | null>(null);
  const [examToDelete, setExamToDelete] = useState<{ id: string, title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [shifts, setShifts] = useState([{ name: "Morning Shift", startTime: "10:00 AM", endTime: "01:00 PM", capacity: 50 }]);
  const [printData, setPrintData] = useState<{ exam: any, shift: any, enrolledStudents: any[] }[] | null>(null);

  const [isProcessingToggle, setIsProcessingToggle] = useState<string | null>(null);

  const handleToggleCompletion = async (examId: string, isCurrentlyCompleted: boolean) => {
    setIsProcessingToggle(examId);
    
    // Toggle logic: If it's currently completed, we want to reopen it (newIsCompleted = false)
    // and force it to stay uncompleted even if the date is passed.
    const newIsCompleted = !isCurrentlyCompleted;
    const newForceUncomplete = !newIsCompleted; 
    
    const res = await toggleExamCompletion(examId, newIsCompleted, newForceUncomplete);
    if (res.success) {
      toast.success(newIsCompleted ? "Exam marked as completed." : "Exam reopened.");
    } else {
      toast.error(res.error || "Failed to update status");
    }
    setIsProcessingToggle(null);
  };

  const handleBulkIssueAdmitCards = async (examId: string) => {
    const loadingToast = toast.loading("Issuing admit cards...");
    const res = await bulkIssueAdmitCards(examId);
    if (res.success) {
      toast.success(`Successfully issued admit cards to ${res.count} students.`, { id: loadingToast });
    } else {
      toast.error(res.error || "Failed to issue admit cards", { id: loadingToast });
    }
  };

  const handleSaveExam = async () => {
    if (!formData.title) return toast.error("Exam title is required.");
    setIsCreating(true);
    try {
      if (editExamId) {
        const res = await updateExam(editExamId, {
          title: formData.title,
          type: "OFFLINE",
          date: formData.date ? new Date(formData.date) : undefined,
          courseId: formData.courseId || undefined,
          semesterNumber: formData.semesterNumber ? parseInt(formData.semesterNumber) : undefined,
          duration: formData.duration || undefined,
          syllabus: formData.syllabus || undefined
        } as any, shifts);

        if (res.success) {
          toast.success("Exam updated successfully!");
          setFormData({ title: "", courseId: "", date: "", duration: "180", syllabus: "", semesterNumber: "" });
          setEditExamId(null);
          setIsFormOpen(false);
        } else {
          toast.error(res.error || "Failed to update exam");
        }
      } else {
        const res = await createExam(workspaceId, {
          title: formData.title,
          type: "OFFLINE",
          date: formData.date ? new Date(formData.date) : undefined,
          courseId: formData.courseId || undefined,
          semesterNumber: formData.semesterNumber ? parseInt(formData.semesterNumber) : undefined,
          duration: formData.duration || undefined,
          syllabus: formData.syllabus || undefined
        } as any);

        if (res.success && res.data) {
          for (const shift of shifts) {
            await createExamShift(res.data.id, shift);
          }
          toast.success("Exam and shifts created successfully!");
          setFormData({ title: "", courseId: "", date: "", duration: "180", syllabus: "", semesterNumber: "" });
          setIsFormOpen(false);
        } else {
          toast.error(res.error || "Failed to create exam");
        }
      }
    } catch (err: any) {
      toast.error("Error: " + err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditExam = (exam: any) => {
    setEditExamId(exam.id);
    setFormData({
      title: exam.title,
      courseId: exam.courseId || "",
      date: exam.date ? new Date(exam.date).toISOString().split('T')[0] : "",
      duration: exam.duration || "180",
      syllabus: exam.syllabus || "",
      semesterNumber: exam.semesterNumber?.toString() || ""
    });
    setShifts(exam.shifts && exam.shifts.length > 0 ? exam.shifts : [{ name: "Morning Shift", startTime: "10:00 AM", endTime: "01:00 PM", capacity: 50 }]);
    setIsFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!examToDelete) return;
    setIsDeleting(true);
    const res = await deleteExam(examToDelete.id);
    if (res.success) {
      toast.success("Exam deleted successfully!");
      setExamToDelete(null);
    } else {
      toast.error(res.error || "Failed to delete exam");
    }
    setIsDeleting(false);
  };

  const generatePDF = async (filename: string) => {
    const loadingToast = toast.loading("Generating PDF... please wait.");
    try {
      // Give DOM time to render the off-screen element
      await new Promise(r => setTimeout(r, 800));

      const pages = document.querySelectorAll('.pdf-page');
      if (pages.length === 0) {
        toast.error("No data found to generate PDF", { id: loadingToast });
        setPrintData(null);
        return;
      }

      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF('p', 'pt', 'a4');

      const html2canvas = (await import("html2canvas")).default;
      for (let i = 0; i < pages.length; i++) {
        const canvas = await html2canvas(pages[i] as HTMLElement, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff'
        });
        const imgData = canvas.toDataURL('image/jpeg', 1.0);

        if (i > 0) pdf.addPage();

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      }

      pdf.save(filename);
      toast.success("PDF Downloaded successfully!", { id: loadingToast });
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF.", { id: loadingToast });
    } finally {
      setPrintData(null);
    }
  };

  const handlePrintSignatureList = (examId: string, shift: any) => {
    const exam = exams.find(e => e.id === examId);
    if (!exam) return;
    const enrolledStudents = students.filter(s =>
      s.examEnrollments?.some((e: any) => e.examShiftId === shift.id)
    );
    setPrintData([{ exam, shift, enrolledStudents }]);
    generatePDF(`Attendance_${shift.name.replace(/\s+/g, '_')}.pdf`);
  };

  const handlePrintAll = (examId: string) => {
    const exam = exams.find(e => e.id === examId);
    if (!exam) return;
    const printShifts = exam.shifts.map((shift: any) => ({
      exam,
      shift,
      enrolledStudents: students.filter(s =>
        s.examEnrollments?.some((e: any) => e.examShiftId === shift.id)
      )
    }));
    setPrintData(printShifts);
    generatePDF(`Attendance_All_Shifts.pdf`);
  };

  return (
    <>
      <div className="space-y-4 print:hidden">
        {/* Toolbar & Action Header (Rule 7.4) */}
        <div className="border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 sm:p-3.5 bg-white dark:bg-slate-900 shadow-xs flex flex-row items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Scheduled Offline Exams</h3>
            <p className="text-[11px] text-slate-500">Configure physical exam dates, shifts, print attendance sheets, and issue admit cards.</p>
          </div>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger render={<Button className="h-8 sm:h-9 px-3.5 rounded-lg text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs flex items-center gap-1.5 shrink-0" />}>
              <Plus className="w-3.5 h-3.5" />
              <span>Create Offline Exam</span>
            </DialogTrigger>
            <DialogContent className="max-w-2xl rounded-2xl p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900 max-h-[85vh] flex flex-col">
              <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <CalendarDays className="w-4 h-4" />
                  </div>
                  <DialogTitle className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">{editExamId ? "Edit Offline Exam" : "Create Offline Exam"}</DialogTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setIsFormOpen(false)} className="h-8 px-3 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-900">
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveExam} disabled={isCreating} className="h-8 px-3 rounded-lg text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Save className="w-3.5 h-3.5 mr-1.5" /> Save Exam
                  </Button>
                </div>
              </div>

              <div className="p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[65vh]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1 sm:col-span-2">
                    <Label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Exam Title *</Label>
                    <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Annual Offline Examination 2026" className="h-8 sm:h-9 text-xs rounded-lg" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Select Course</Label>
                    <Select value={formData.courseId} onValueChange={(v: any) => setFormData({ ...formData, courseId: v as string })}>
                      <SelectTrigger className="h-8 sm:h-9 text-xs rounded-lg">
                        <span className="truncate text-left block w-full pr-1">{formData.courseId ? courses.find(c => c.id === formData.courseId)?.title : "All Courses / General"}</span>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Courses / General</SelectItem>
                        {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Exam Date</Label>
                    <Input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="h-8 sm:h-9 text-xs rounded-lg" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Duration (Minutes)</Label>
                    <Input type="number" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} className="h-8 sm:h-9 text-xs rounded-lg" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Semester Number (Optional)</Label>
                    <Input type="number" value={formData.semesterNumber} onChange={e => setFormData({ ...formData, semesterNumber: e.target.value })} placeholder="1" className="h-8 sm:h-9 text-xs rounded-lg" />
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <Label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Syllabus</Label>
                    <Textarea value={formData.syllabus} onChange={e => setFormData({ ...formData, syllabus: e.target.value })} placeholder="e.g. Modules 1 to 4, Practical Lab" className="min-h-[70px] text-xs rounded-lg resize-none" />
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Exam Shifts</h4>
                    <Button variant="outline" size="sm" onClick={() => setShifts([...shifts, { name: `Shift ${shifts.length + 1}`, startTime: "", endTime: "", capacity: 50 }])} className="h-7 px-2.5 rounded-lg text-xs font-semibold">
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Shift
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {shifts.map((shift, idx) => (
                      <div key={idx} className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                        <div className="space-y-0.5">
                          <Label className="text-[9px] font-bold text-slate-400 uppercase">Shift Name</Label>
                          <Input value={shift.name} onChange={e => { const s = [...shifts]; s[idx].name = e.target.value; setShifts(s); }} className="h-7 sm:h-8 text-xs rounded-md" />
                        </div>
                        <div className="space-y-0.5">
                          <Label className="text-[9px] font-bold text-slate-400 uppercase">Start Time</Label>
                          <Input value={shift.startTime} onChange={e => { const s = [...shifts]; s[idx].startTime = e.target.value; setShifts(s); }} className="h-7 sm:h-8 text-xs rounded-md" placeholder="10:00 AM" />
                        </div>
                        <div className="space-y-0.5">
                          <Label className="text-[9px] font-bold text-slate-400 uppercase">End Time</Label>
                          <Input value={shift.endTime} onChange={e => { const s = [...shifts]; s[idx].endTime = e.target.value; setShifts(s); }} className="h-7 sm:h-8 text-xs rounded-md" placeholder="01:00 PM" />
                        </div>
                        <div className="space-y-0.5 flex items-end gap-1.5">
                          <div className="flex-1">
                            <Label className="text-[9px] font-bold text-slate-400 uppercase">Capacity</Label>
                            <Input type="number" value={shift.capacity} onChange={e => { const s = [...shifts]; s[idx].capacity = parseInt(e.target.value) || 0; setShifts(s); }} className="h-7 sm:h-8 text-xs rounded-md" />
                          </div>
                          {shifts.length > 1 && (
                            <Button variant="ghost" size="sm" className="h-7 sm:h-8 px-2 text-xs font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md" onClick={() => setShifts(shifts.filter((_, i) => i !== idx))}>
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Scheduled Offline Exams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {exams.filter(e => e.type === "OFFLINE").map((exam) => {
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            const isAutoCompleted = exam.date && new Date(exam.date) < now && !exam.forceUncomplete;
            const isCurrentlyCompleted = exam.isCompleted || isAutoCompleted;

            return (
              <Card key={exam.id} className="relative group border border-slate-200/80 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-xs overflow-hidden flex flex-col justify-between">
                <CardHeader className="p-3.5 sm:p-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-start gap-2.5">
                    <div className="space-y-1 min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate" title={exam.title}>{exam.title}</h4>
                      <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold text-slate-500">
                        <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md"><CalendarDays className="w-3 h-3 text-indigo-500" /> {exam.date ? new Date(exam.date).toLocaleDateString() : "TBD"}</span>
                        <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md"><Clock className="w-3 h-3 text-orange-500" /> {exam.shifts.length} Shifts</span>
                        {isCurrentlyCompleted && <span className="flex items-center gap-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-md"><CheckCircle className="w-3 h-3" /> Completed</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-slate-500 hover:text-primary hover:bg-primary/5" onClick={() => handleEditExam(exam)} title="Edit Exam">
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30" onClick={() => setExamToDelete({ id: exam.id, title: exam.title })} title="Delete Exam">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-3.5 space-y-3 bg-slate-50/50 dark:bg-slate-800/20 flex-1 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Shifts & Signature Lists</span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <Switch 
                          checked={isCurrentlyCompleted} 
                          onCheckedChange={() => handleToggleCompletion(exam.id, isCurrentlyCompleted)}
                          disabled={isProcessingToggle === exam.id}
                          className="scale-75 data-[state=checked]:bg-emerald-600"
                        />
                        <span className="text-[10px] font-bold text-slate-500">{isCurrentlyCompleted ? "Completed" : "Active"}</span>
                      </div>
                      
                      {exam.shifts.length > 0 && !isCurrentlyCompleted && (
                        <Button variant="outline" size="sm" onClick={() => handleBulkIssueAdmitCards(exam.id)} className="h-7 px-2 text-[10px] font-semibold gap-1 text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:border-indigo-900/50 dark:hover:bg-indigo-900/20 shadow-xs">
                          <Send className="w-3 h-3" /> Admit Cards
                        </Button>
                      )}

                      {exam.shifts.length > 0 && (
                        <Button variant="outline" size="sm" onClick={() => handlePrintAll(exam.id)} className="h-7 px-2 text-[10px] font-semibold gap-1 text-slate-600 hover:text-slate-900 shadow-xs">
                          <Printer className="w-3 h-3" /> Print All
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {exam.shifts.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No shifts configured.</p>
                    ) : (
                      exam.shifts.map((shift: any, index: number) => {
                        const enrolled = shift._count?.enrollments || 0;
                        const available = shift.capacity - enrolled;
                        const shiftNumbers = ["One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
                        const shiftName = `Shift ${shiftNumbers[index] || index + 1}`;

                        return (
                          <div key={shift.id} className="flex items-center justify-between bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 shadow-xs">
                            <div className="min-w-0 flex-1 mr-2">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-xs text-slate-800 dark:text-slate-200">{shiftName}</p>
                                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${available > 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                                  {available} left
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{shift.startTime} - {shift.endTime}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{enrolled} / {shift.capacity}</span>
                              </p>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => handlePrintSignatureList(exam.id, shift)} className="h-7 px-2 text-[10px] font-semibold gap-1 text-indigo-600 border-indigo-100 hover:bg-indigo-50 dark:border-slate-700 dark:text-indigo-400 shrink-0">
                              <Printer className="w-3 h-3" /> Sheet
                            </Button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {exams.filter(e => e.type === "OFFLINE").length === 0 && (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3 text-slate-400">
                <CalendarDays className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Offline Exams Scheduled</h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1">Click the &quot;Create Offline Exam&quot; button above to schedule your examination shifts.</p>
            </div>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!examToDelete} onOpenChange={(open) => !open && setExamToDelete(null)}>
          <DialogContent className="max-w-md p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900">
            <div className="flex flex-col items-center text-center space-y-3 pt-2">
              <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <DialogTitle className="text-base font-bold text-slate-900 dark:text-white">Delete Exam?</DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Are you sure you want to delete <strong>{examToDelete?.title}</strong>? This action cannot be undone and will remove all associated shifts and enrollments.
              </DialogDescription>
              <div className="flex w-full gap-2 pt-3">
                <Button variant="outline" size="sm" className="flex-1 h-8 rounded-lg text-xs font-semibold" onClick={() => setExamToDelete(null)} disabled={isDeleting}>
                  Cancel
                </Button>
                <Button variant="destructive" size="sm" className="flex-1 h-8 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-700" onClick={confirmDelete} disabled={isDeleting}>
                  {isDeleting ? "Deleting..." : "Yes, Delete"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Printable Signature Sheet (Off-screen for PDF generation) */}
      {printData && (
        <div className="absolute top-0 left-[-9999px] w-[794px] font-sans z-[-9999]" style={{ backgroundColor: '#ffffff', color: '#000000' }}>
          {printData.map((data, index) => (
            <div key={index} className="pdf-page p-8 min-h-[1123px] relative" style={{ backgroundColor: '#ffffff' }}>
              {/* Header */}
              <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-6">
                {/* Logo */}
                <div className="w-24 h-24 shrink-0 flex items-center justify-center">
                  {workspace?.logoUrl ? (
                    <img src={workspace.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" crossOrigin="anonymous" />
                  ) : null}
                </div>

                {/* Titles */}
                <div className="flex-1 text-center px-4">
                  <h1 className="text-3xl font-black uppercase tracking-wider" style={{ color: '#1e3a8a' }}>{workspace?.name || "Exam Center"}</h1>
                  <h2 className="text-lg font-bold mt-1 tracking-wider capitalize" style={{ color: '#4338ca', textDecoration: 'underline' }}>
                    An authorised study centre of {superAdminName?.toLowerCase() || "rajeev gandhi youth computer shiksha parishad"}
                  </h2>
                  <h3 className="text-xl font-bold mt-3" style={{ color: '#0f172a' }}>Attendance & Signature Sheet</h3>
                </div>

                <div className="w-24 h-24 shrink-0 opacity-0 hidden sm:block"></div>
              </div>

              {/* Exam Info */}
              <div className="flex justify-between items-center mb-6 text-sm font-bold p-4 border rounded-xl" style={{ backgroundColor: '#f8fafc', borderColor: '#cbd5e1', color: '#334155' }}>
                <div className="flex flex-col gap-1.5">
                  <span className="text-base" style={{ color: '#0f172a' }}>Exam: {data.exam.title}</span>
                  <span>Shift: <span style={{ color: '#4338ca' }}>{data.shift.name}</span></span>
                </div>
                <div className="flex flex-col gap-1.5 text-right">
                  <span className="text-base" style={{ color: '#0f172a' }}>Date: {data.exam.date ? new Date(data.exam.date).toLocaleDateString('en-GB') : "TBD"}</span>
                  <span>Time: <span style={{ color: '#4338ca' }}>{data.shift.startTime} - {data.shift.endTime}</span></span>
                </div>
              </div>

              <table className="w-full border-collapse border text-sm" style={{ borderColor: '#cbd5e1' }}>
                <thead>
                  <tr style={{ backgroundColor: '#e0e7ff', color: '#312e81' }}>
                    <th className="border p-3 text-center w-12 font-bold" style={{ borderColor: '#cbd5e1' }}>Sl</th>
                    <th className="border p-3 text-center w-20 font-bold" style={{ borderColor: '#cbd5e1' }}>Picture</th>
                    <th className="border p-3 text-left font-bold" style={{ borderColor: '#cbd5e1' }}>Registration No</th>
                    <th className="border p-3 text-left font-bold" style={{ borderColor: '#cbd5e1' }}>Name</th>
                    <th className="border p-3 text-center w-40 font-bold" style={{ borderColor: '#cbd5e1' }}>Student Sign</th>
                  </tr>
                </thead>
                <tbody>
                  {data.enrolledStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="border p-4 text-center italic" style={{ borderColor: '#cbd5e1', color: '#64748b' }}>No students enrolled in this shift</td>
                    </tr>
                  ) : (
                    data.enrolledStudents.map((student: any, i: number) => {
                      const enrollment = student.examEnrollments?.find((e: any) => e.examShiftId === data.shift.id);
                      const photoUrl = student.photoUrl || student.admissionApp?.photoUrl || null;
                      return (
                        <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                          <td className="border p-3 text-center align-middle font-medium" style={{ borderColor: '#cbd5e1', color: '#475569' }}>{i + 1}</td>
                          <td className="border p-3 text-center align-middle" style={{ borderColor: '#cbd5e1' }}>
                            <div className="w-12 h-14 border mx-auto overflow-hidden flex items-center justify-center rounded bg-white shadow-sm" style={{ borderColor: '#e2e8f0' }}>
                              {photoUrl ? (
                                <img src={photoUrl} alt="Photo" className="w-full h-full object-cover" crossOrigin="anonymous" />
                              ) : (
                                <span className="text-[10px]" style={{ color: '#94a3b8' }}>No Pic</span>
                              )}
                            </div>
                          </td>
                          <td className="border p-3 align-middle" style={{ borderColor: '#cbd5e1', color: '#334155' }}>
                            <div className="font-semibold">{enrollment?.rollNo || student.enrollmentNo}</div>
                            <div className="text-[11px] font-bold mt-1 uppercase" style={{ color: '#4338ca' }}>
                              {student.course?.code || ""}
                            </div>
                          </td>
                          <td className="border p-3 align-middle" style={{ borderColor: '#cbd5e1' }}>
                            <div className="font-bold text-sm" style={{ color: '#0f172a' }}>{student.fullName || student.user?.name}</div>
                            <div className="text-xs mt-1 font-medium" style={{ color: '#64748b' }}>{student.phone || "No Mobile"}</div>
                          </td>
                          <td className="border p-3 align-middle" style={{ borderColor: '#cbd5e1' }}></td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
              <div className="mt-24 flex justify-between items-end text-sm font-bold" style={{ color: '#334155' }}>
                <div className="border-t pt-3 px-12 text-center" style={{ borderColor: '#cbd5e1' }}>Center Head Signature</div>
                <div className="border-t pt-3 px-12 text-center" style={{ borderColor: '#cbd5e1' }}>Exam Controller Signature</div>
              </div>

              {/* Page Number Footer */}
              <div className="absolute bottom-8 right-8 text-xs font-bold" style={{ color: '#6b7280' }}>
                Page {index + 1} of {printData.length}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
