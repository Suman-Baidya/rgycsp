"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Save, CalendarDays, Users, Clock, Printer, Trash2, Edit, AlertTriangle } from "lucide-react";
import { createExam, createExamShift, deleteExam, updateExam } from "@/app/actions/exam";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";

export default function OfflineExamTab({ workspaceId, workspace, superAdminName, courses, exams, students = [] }: { workspaceId: string, workspace?: any, superAdminName?: string, courses: any[], exams: any[], students?: any[] }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    courseId: "",
    date: "",
    duration: "180",
    syllabus: ""
  });

  const [editExamId, setEditExamId] = useState<string | null>(null);
  const [examToDelete, setExamToDelete] = useState<{ id: string, title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [shifts, setShifts] = useState([{ name: "Morning Shift", startTime: "10:00 AM", endTime: "01:00 PM", capacity: 50 }]);
  const [printData, setPrintData] = useState<{ exam: any, shift: any, enrolledStudents: any[] }[] | null>(null);

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
          duration: formData.duration || undefined,
          syllabus: formData.syllabus || undefined
        }, shifts);

        if (res.success) {
          toast.success("Exam updated successfully!");
          setFormData({ title: "", courseId: "", date: "", duration: "180", syllabus: "" });
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
          duration: formData.duration || undefined,
          syllabus: formData.syllabus || undefined
        });

        if (res.success && res.data) {
          for (const shift of shifts) {
            await createExamShift(res.data.id, shift);
          }
          toast.success("Exam and shifts created successfully!");
          setFormData({ title: "", courseId: "", date: "", duration: "180", syllabus: "" });
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
      syllabus: exam.syllabus || ""
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

      const pdf = new jsPDF('p', 'pt', 'a4');

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
      <div className="space-y-10 mt-6 print:hidden">
        <div className="flex justify-end px-2">
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap text-sm h-12 px-6 rounded-2xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50" onClick={() => {
              setEditExamId(null);
              setFormData({ title: "", courseId: "", date: "", duration: "180", syllabus: "" });
              setShifts([{ name: "Morning Shift", startTime: "10:00 AM", endTime: "01:00 PM", capacity: 50 }]);
            }}>
              <Plus className="w-5 h-5 mr-2" /> Create Offline Exam
            </DialogTrigger>
            <DialogContent className="max-w-4xl p-0 border-0 bg-transparent">
              <Card className="border-0 rounded-[2rem] bg-white dark:bg-slate-900 shadow-xl w-full max-h-[90vh] flex flex-col overflow-hidden">
                <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b p-8 rounded-t-[2rem] shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
                        <CalendarDays className="w-5 h-5" />
                      </div>
                      <CardTitle className="text-xl font-bold">{editExamId ? "Edit Offline Exam" : "Create Offline Exam"}</CardTitle>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="ghost" onClick={() => setIsFormOpen(false)} className="rounded-xl font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100">
                        Cancel
                      </Button>
                      <Button onClick={handleSaveExam} disabled={isCreating} className="rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white">
                        <Save className="w-4 h-4 mr-2" /> Save Exam
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-8 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Exam Title *</Label>
                      <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Final Semester Exam" className="h-12 rounded-2xl font-bold" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Select Course</Label>
                      <Select value={formData.courseId} onValueChange={(v: any) => setFormData({ ...formData, courseId: v as string })}>
                        <SelectTrigger className="h-12 rounded-2xl font-bold">
                          <SelectValue placeholder="All Courses / General">
                            {formData.courseId ? courses.find(c => c.id === formData.courseId)?.title : "All Courses / General"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Courses / General</SelectItem>
                          {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Exam Date</Label>
                      <Input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="h-12 rounded-2xl font-bold" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Duration (Minutes)</Label>
                      <Input type="number" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} className="h-12 rounded-2xl font-bold" />
                    </div>
                    <div className="col-span-full space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Syllabus</Label>
                      <Textarea value={formData.syllabus} onChange={e => setFormData({ ...formData, syllabus: e.target.value })} placeholder="e.g. Units 1-5" className="min-h-[120px] rounded-2xl font-bold p-4" />
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold">Exam Shifts</h3>
                      <Button variant="outline" size="sm" onClick={() => setShifts([...shifts, { name: `Shift ${shifts.length + 1}`, startTime: "", endTime: "", capacity: 50 }])} className="rounded-xl font-bold">
                        <Plus className="w-4 h-4 mr-2" /> Add Shift
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {shifts.map((shift, idx) => (
                        <div key={idx} className="flex gap-4 items-end bg-slate-50 dark:bg-slate-800/50 p-4 rounded-[1.5rem]">
                          <div className="flex-1 space-y-2">
                            <Label className="text-xs font-bold text-slate-500">Shift Name</Label>
                            <Input value={shift.name} onChange={e => { const s = [...shifts]; s[idx].name = e.target.value; setShifts(s); }} className="h-11 rounded-xl" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <Label className="text-xs font-bold text-slate-500">Start Time</Label>
                            <Input value={shift.startTime} onChange={e => { const s = [...shifts]; s[idx].startTime = e.target.value; setShifts(s); }} className="h-11 rounded-xl" placeholder="10:00 AM" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <Label className="text-xs font-bold text-slate-500">End Time</Label>
                            <Input value={shift.endTime} onChange={e => { const s = [...shifts]; s[idx].endTime = e.target.value; setShifts(s); }} className="h-11 rounded-xl" placeholder="01:00 PM" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <Label className="text-xs font-bold text-slate-500">Student Capacity</Label>
                            <Input type="number" value={shift.capacity} onChange={e => { const s = [...shifts]; s[idx].capacity = parseInt(e.target.value) || 0; setShifts(s); }} className="h-11 rounded-xl" />
                          </div>
                          <Button variant="ghost" className="h-11 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => setShifts(shifts.filter((_, i) => i !== idx))}>
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold px-2">Scheduled Offline Exams</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exams.filter(e => e.type === "OFFLINE").map((exam) => (
              <Card key={exam.id} className="relative group border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] bg-white dark:bg-slate-900 shadow-lg shadow-slate-200/40 dark:shadow-none overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                <div className="p-6 border-b border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100">{exam.title}</h4>
                      <div className="flex items-center gap-4 text-sm font-semibold text-slate-500">
                        <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full"><CalendarDays className="w-4 h-4 text-indigo-500" /> {exam.date ? new Date(exam.date).toLocaleDateString() : "TBD"}</span>
                        <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full"><Clock className="w-4 h-4 text-orange-500" /> {exam.shifts.length} Shifts</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-blue-500 hover:bg-blue-50 hover:text-blue-600" onClick={() => handleEditExam(exam)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => setExamToDelete({ id: exam.id, title: exam.title })}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4 bg-slate-50/50 dark:bg-slate-800/20 flex-1 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-black uppercase tracking-widest text-slate-400">Shifts & Signature Lists</h5>
                    {exam.shifts.length > 0 && (
                      <Button variant="outline" size="sm" onClick={() => handlePrintAll(exam.id)} className="rounded-xl h-8 text-xs font-bold gap-2 text-slate-500 hover:text-slate-900 shadow-sm">
                        <Printer className="w-3.5 h-3.5" /> Print All
                      </Button>
                    )}
                  </div>
                  <div className="space-y-3">
                    {exam.shifts.length === 0 ? (
                      <p className="text-sm text-slate-500 italic">No shifts configured.</p>
                    ) : (
                      exam.shifts.map((shift: any, index: number) => {
                        const enrolled = shift._count?.enrollments || 0;
                        const available = shift.capacity - enrolled;
                        const shiftNumbers = ["One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
                        const shiftName = `Shift ${shiftNumbers[index] || index + 1}`;

                        return (
                          <div key={shift.id} className="group/shift flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900 transition-colors shadow-sm">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-slate-700 dark:text-slate-200">{shiftName}</p>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${available > 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                                  {available} left
                                </span>
                              </div>
                              <p className="text-xs font-medium text-slate-500 flex items-center gap-2 mt-1.5">
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{shift.startTime} - {shift.endTime}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                <span className="flex items-center gap-1"><Users className="w-3 h-3" />Assigned: {enrolled} / {shift.capacity}</span>
                              </p>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => handlePrintSignatureList(exam.id, shift)} className="rounded-xl gap-2 font-bold text-indigo-600 border-indigo-100 hover:bg-indigo-600 hover:text-white dark:border-slate-700 dark:text-indigo-400 dark:hover:bg-indigo-600 dark:hover:text-white transition-all shadow-sm">
                              <Printer className="w-4 h-4" /> Print Sheet
                            </Button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </Card>
            ))}

            {exams.filter(e => e.type === "OFFLINE").length === 0 && (
              <div className="col-span-full py-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] bg-slate-50/50 dark:bg-slate-900/50">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 text-slate-400">
                  <CalendarDays className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-slate-700 dark:text-slate-300">No Exams Scheduled</h4>
                <p className="text-slate-500 font-medium max-w-sm mt-1">Click the "Create Offline Exam" button above to schedule your first offline examination.</p>
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!examToDelete} onOpenChange={(open) => !open && setExamToDelete(null)}>
          <DialogContent className="max-w-md p-6 rounded-[2rem] border-0 shadow-2xl bg-white dark:bg-slate-900">
            <div className="flex flex-col items-center text-center space-y-4 pt-4">
              <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500 mb-2">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <DialogTitle className="text-2xl font-bold">Delete Exam?</DialogTitle>
              <DialogDescription className="text-slate-500 text-base">
                Are you sure you want to delete <strong>{examToDelete?.title}</strong>? This action cannot be undone and will remove all associated shifts and enrollments.
              </DialogDescription>
              <div className="flex w-full gap-3 pt-6">
                <Button variant="outline" className="flex-1 h-12 rounded-xl font-bold border-2" onClick={() => setExamToDelete(null)} disabled={isDeleting}>
                  Cancel
                </Button>
                <Button variant="destructive" className="flex-1 h-12 rounded-xl font-bold bg-red-500 hover:bg-red-600" onClick={confirmDelete} disabled={isDeleting}>
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
