"use client";

import { useState, useMemo } from "react";
import {
   Sparkles, BrainCircuit, Settings2, FileText, CheckCircle2, AlertCircle, Loader2, Plus, UploadCloud, Save, BookOpen, ChevronLeft, ChevronRight, Search, Edit2, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createChapter, addManualQuestion, bulkImportQuestions, updateQuestion, deleteQuestion } from "@/app/actions/question-bank";
import { createOnlineExam } from "@/app/actions/exam";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function QuestionPapersTab({ workspaceId, workspaceTokens, courses, chapters }: { workspaceId: string, workspaceTokens: number, courses: any[], chapters: any[] }) {
   // Table State
   const [currentPage, setCurrentPage] = useState(1);
   const [selectedCourseFilter, setSelectedCourseFilter] = useState("all");
   const [selectedChapterFilter, setSelectedChapterFilter] = useState("all");
   const [searchQuery, setSearchQuery] = useState("");
   const itemsPerPage = 20;

   // Selection State
   const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());

   // Create Question Modal State
   const [isCreateQuestionOpen, setIsCreateQuestionOpen] = useState(false);
   const [mode, setMode] = useState<"manual" | "csv" | "ai">("manual");
   
   // Create Exam Modal State
   const [isCreateExamOpen, setIsCreateExamOpen] = useState(false);
   const [isCreatingExam, setIsCreatingExam] = useState(false);
   const [examConfig, setExamConfig] = useState({
      title: "",
      courseId: "",
      date: "",
      duration: "60",
      marksPerQuestion: "2",
      passingMarks: "40"
   });

   // Chapter Creation inside Modal
   const [isCreateChapterOpen, setIsCreateChapterOpen] = useState(false);
   const [newChapterCourseId, setNewChapterCourseId] = useState("");
   const [newChapterName, setNewChapterName] = useState("");
   const [isCreatingChapter, setIsCreatingChapter] = useState(false);
   const [selectedCourse, setSelectedCourse] = useState("");
   const [selectedChapter, setSelectedChapter] = useState("");

   // Manual Entry
   const [manualQ, setManualQ] = useState({ questionText: "", optionA: "", optionB: "", optionC: "", optionD: "", correctOption: "A" });
   const [isSavingManual, setIsSavingManual] = useState(false);
   const [isUploadingCSV, setIsUploadingCSV] = useState(false);

   // Edit & Delete State
   const [editingQuestion, setEditingQuestion] = useState<any>(null);
   const [isEditing, setIsEditing] = useState(false);
   const [isSavingEdit, setIsSavingEdit] = useState(false);
   const [isDeleting, setIsDeleting] = useState<string | null>(null);
   
   // Delete Confirmation State
   const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
   const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);

   // Flatten all questions for the table
   const allQuestions = useMemo(() => {
      const qList: any[] = [];
      chapters.forEach(c => {
         if (c.questions && Array.isArray(c.questions)) {
            c.questions.forEach((q: any) => {
               qList.push({
                  ...q,
                  chapterName: c.name,
                  courseId: c.courseId,
                  courseName: courses.find(course => course.id === c.courseId)?.title || "Unknown Course"
               });
            });
         }
      });
      return qList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
   }, [chapters, courses]);

   // Filter questions for table
   const filteredQuestions = useMemo(() => {
      return allQuestions.filter(q => {
         if (selectedCourseFilter !== "all" && q.courseId !== selectedCourseFilter) return false;
         if (selectedChapterFilter !== "all" && q.chapterId !== selectedChapterFilter) return false;
         if (searchQuery.trim() !== "") {
            const query = searchQuery.toLowerCase();
            return (
               q.questionText?.toLowerCase().includes(query) ||
               q.courseName?.toLowerCase().includes(query) ||
               q.chapterName?.toLowerCase().includes(query)
            );
         }
         return true;
      });
   }, [allQuestions, selectedCourseFilter, selectedChapterFilter, searchQuery]);

   // Pagination logic
   const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage) || 1;
   const paginatedQuestions = filteredQuestions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

   const handleSelectAll = (checked: boolean) => {
      if (checked) {
         const newSelected = new Set(selectedQuestionIds);
         paginatedQuestions.forEach(q => newSelected.add(q.id));
         setSelectedQuestionIds(newSelected);
      } else {
         const newSelected = new Set(selectedQuestionIds);
         paginatedQuestions.forEach(q => newSelected.delete(q.id));
         setSelectedQuestionIds(newSelected);
      }
   };

   const toggleSelection = (id: string) => {
      const newSelected = new Set(selectedQuestionIds);
      if (newSelected.has(id)) newSelected.delete(id);
      else newSelected.add(id);
      setSelectedQuestionIds(newSelected);
   };

   // Actions
   const handleCreateChapter = async () => {
      if (!newChapterCourseId || !newChapterName) return toast.error("Please fill all fields");
      setIsCreatingChapter(true);
      try {
         const res = await createChapter(workspaceId, newChapterCourseId, newChapterName);
         if (res.success) {
            toast.success("Chapter created!");
            setIsCreateChapterOpen(false);
            setNewChapterName("");
            if (selectedCourse === newChapterCourseId && res.data?.id) setSelectedChapter(res.data.id);
         } else toast.error(res.error);
      } catch(e: any) { toast.error(e.message); } 
      finally { setIsCreatingChapter(false); }
   };

   const handleSaveManual = async () => {
      if (!selectedChapter) return toast.error("Please select a chapter");
      if (!manualQ.questionText || !manualQ.optionA || !manualQ.optionB) return toast.error("Question and at least Options A & B are required");
      
      setIsSavingManual(true);
      try {
         const res = await addManualQuestion(workspaceId, selectedChapter, manualQ);
         if (res.success) {
            toast.success("Question saved to Chapter!");
            setManualQ({ questionText: "", optionA: "", optionB: "", optionC: "", optionD: "", correctOption: "A" });
         } else toast.error(res.error);
      } catch (e: any) { toast.error(e.message); } 
      finally { setIsSavingManual(false); }
   };

   const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!selectedChapter) return toast.error("Please select a chapter first.");
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUploadingCSV(true);
      const Papa = (await import("papaparse")).default;

      Papa.parse(file, {
         header: true, skipEmptyLines: true,
         complete: async (results) => {
            try {
               const parsedQuestions = results.data.map((row: any) => {
                  const getVal = (k1: string, k2: string) => (row[k1] || row[k2] || "").trim();
                  const questionText = getVal("Question Text", "Question");
                  const optionA = getVal("Option A", "A"), optionB = getVal("Option B", "B"), optionC = getVal("Option C", "C"), optionD = getVal("Option D", "D");
                  const correctOption = getVal("Correct Option", "Correct").toUpperCase();

                  if (!questionText || !optionA || !optionB || !['A','B','C','D'].includes(correctOption)) throw new Error("Invalid format");
                  return { questionText, optionA, optionB, optionC, optionD, correctOption };
               });
               const res = await bulkImportQuestions(workspaceId, selectedChapter, parsedQuestions);
               if (res.success) toast.success(`Imported ${res.count} questions!`);
               else toast.error(`Import failed: ${res.error}`);
            } catch (err: any) { toast.error(err.message); } 
            finally { setIsUploadingCSV(false); if (e.target) e.target.value = ""; }
         },
         error: (err) => { toast.error(`Error parsing CSV: ${err.message}`); setIsUploadingCSV(false); }
      });
   };

   const handleDownloadTemplate = () => {
      const csvContent = "Question Text,Option A,Option B,Option C,Option D,Correct Option\nWhat is the capital of France?,Paris,London,Berlin,Madrid,A";
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "questions_template.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
   };

   const handleCreateExam = async () => {
      if (!examConfig.title) return toast.error("Exam Title is required");
      if (selectedQuestionIds.size === 0) return toast.error("Please select at least 1 question");

      setIsCreatingExam(true);
      try {
         const res = await createOnlineExam(workspaceId, {
            title: examConfig.title,
            courseId: (examConfig.courseId === "all" || examConfig.courseId === "") ? undefined : examConfig.courseId,
            date: examConfig.date ? new Date(examConfig.date) : undefined,
            duration: examConfig.duration,
            marksPerQuestion: parseFloat(examConfig.marksPerQuestion),
            passingMarks: parseFloat(examConfig.passingMarks),
            questionIds: Array.from(selectedQuestionIds)
         });

         if (res.success) {
            toast.success("Exam Created successfully! Check Online Exam tab.");
            setIsCreateExamOpen(false);
            setSelectedQuestionIds(new Set());
         } else {
            toast.error(res.error);
         }
      } catch (err: any) {
         toast.error(err.message);
      } finally {
         setIsCreatingExam(false);
      }
   };

   const handleDeleteQuestion = (id: string) => {
      setQuestionToDelete(id);
      setDeleteConfirmOpen(true);
   };

   const performDelete = async () => {
      if (!questionToDelete) return;
      setIsDeleting(questionToDelete);
      try {
         const res = await deleteQuestion(questionToDelete);
         if (res.success) toast.success("Question deleted!");
         else toast.error(res.error);
      } catch(e: any) { toast.error(e.message); }
      finally { 
         setIsDeleting(null);
         setDeleteConfirmOpen(false);
         setQuestionToDelete(null);
      }
   };

   const handleSaveEdit = async () => {
      if (!editingQuestion) return;
      setIsSavingEdit(true);
      try {
         const res = await updateQuestion(editingQuestion.id, {
            questionText: editingQuestion.questionText,
            optionA: editingQuestion.optionA,
            optionB: editingQuestion.optionB,
            optionC: editingQuestion.optionC,
            optionD: editingQuestion.optionD,
            correctOption: editingQuestion.correctOption
         });
         if (res.success) {
            toast.success("Question updated!");
            setEditingQuestion(null);
            setIsEditing(false);
         } else toast.error(res.error);
      } catch (e: any) { toast.error(e.message); }
      finally { setIsSavingEdit(false); }
   };

   return (
      <div className="space-y-4">
         {/* Top Action Bar & Filter Toolbar (Rule 7.4) */}
         <div className="border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 sm:p-3.5 bg-white dark:bg-slate-900 shadow-xs flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
            <div className="flex flex-wrap gap-2 items-center flex-1">
               <div className="relative w-full sm:w-64 group">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                  <Input 
                     placeholder="Search questions, courses..." 
                     value={searchQuery}
                     onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                     className="pl-8 h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 font-medium"
                  />
               </div>
               
               <Select value={selectedCourseFilter} onValueChange={(v: any) => { setSelectedCourseFilter(v); setSelectedChapterFilter("all"); setCurrentPage(1); }}>
                  <SelectTrigger className="h-8 sm:h-9 w-full sm:w-[180px] rounded-lg text-xs font-medium bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
                     <span className="truncate text-left block w-full pr-1">{selectedCourseFilter === "all" ? "All Courses" : courses.find(c => c.id === selectedCourseFilter)?.title || "All Courses"}</span>
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="all">All Courses</SelectItem>
                     {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                  </SelectContent>
               </Select>

               <Select value={selectedChapterFilter} onValueChange={(v: any) => { setSelectedChapterFilter(v); setCurrentPage(1); }} disabled={selectedCourseFilter === "all"}>
                  <SelectTrigger className="h-8 sm:h-9 w-full sm:w-[180px] rounded-lg text-xs font-medium bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
                     <span className="truncate text-left block w-full pr-1">{selectedChapterFilter === "all" ? "All Chapters" : chapters.find(c => c.id === selectedChapterFilter)?.name || "All Chapters"}</span>
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="all">All Chapters</SelectItem>
                     {chapters.filter(c => c.courseId === selectedCourseFilter).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
               </Select>
            </div>

            <div className="flex items-center gap-2">
               <Dialog open={isCreateQuestionOpen} onOpenChange={setIsCreateQuestionOpen}>
                  <DialogTrigger render={<Button className="h-8 sm:h-9 px-3.5 rounded-lg text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs flex items-center gap-1.5" />}>
                     <Plus className="w-3.5 h-3.5" />
                     <span>Add Questions</span>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl rounded-2xl p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900">
                     <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                        <DialogTitle className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Add Questions to Bank</DialogTitle>
                        <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit mt-3">
                           <button onClick={() => setMode("manual")} className={cn("px-3 py-1.5 rounded-lg font-semibold text-xs transition-all flex items-center gap-1.5", mode === "manual" ? "bg-white dark:bg-slate-700 shadow-xs text-primary dark:text-white" : "text-slate-500 hover:text-slate-900")}>
                              <FileText className="w-3.5 h-3.5" /> Manual Entry
                           </button>
                           <button onClick={() => setMode("csv")} className={cn("px-3 py-1.5 rounded-lg font-semibold text-xs transition-all flex items-center gap-1.5", mode === "csv" ? "bg-white dark:bg-slate-700 shadow-xs text-primary dark:text-white" : "text-slate-500 hover:text-slate-900")}>
                              <UploadCloud className="w-3.5 h-3.5" /> CSV Import
                           </button>
                           <button onClick={() => setMode("ai")} className={cn("px-3 py-1.5 rounded-lg font-semibold text-xs transition-all flex items-center gap-1.5", mode === "ai" ? "bg-white dark:bg-slate-700 shadow-xs text-amber-600 dark:text-amber-400" : "text-slate-500 hover:text-slate-900")}>
                              <Sparkles className="w-3.5 h-3.5" /> AI Generate
                           </button>
                        </div>
                     </div>

                     <div className="p-4 sm:p-5 overflow-y-auto max-h-[60vh] space-y-4">
                        {/* Select Course & Chapter for Creation */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                           <div className="space-y-1">
                              <Label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Target Course</Label>
                              <Select value={selectedCourse} onValueChange={(v: any) => { setSelectedCourse(v); setSelectedChapter(""); }}>
                                 <SelectTrigger className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"><span className="truncate text-left block w-full pr-1">{selectedCourse ? courses.find(c => c.id === selectedCourse)?.title || "Select Course" : "Select Course"}</span></SelectTrigger>
                                 <SelectContent>{courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}</SelectContent>
                              </Select>
                           </div>
                           <div className="space-y-1">
                              <Label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Target Chapter</Label>
                              <div className="flex gap-1.5">
                                 <Select value={selectedChapter} onValueChange={(v: any) => setSelectedChapter(v)} disabled={!selectedCourse}>
                                    <SelectTrigger className="h-8 sm:h-9 text-xs rounded-lg flex-1 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"><span className="truncate text-left block w-full pr-1">{selectedChapter ? chapters.find(c => c.id === selectedChapter)?.name || "Select Chapter" : "Select Chapter"}</span></SelectTrigger>
                                    <SelectContent>
                                    {chapters.filter(c => c.courseId === selectedCourse).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                 </SelectContent>
                              </Select>
                              <Dialog open={isCreateChapterOpen} onOpenChange={setIsCreateChapterOpen}>
                                 <DialogTrigger render={<Button variant="outline" className="h-8 sm:h-9 w-9 p-0 rounded-lg shrink-0" title="Create new chapter" />}>
                                    <Plus className="w-4 h-4"/>
                                 </DialogTrigger>
                                 <DialogContent className="max-w-md rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900">
                                    <DialogTitle className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Create New Chapter</DialogTitle>
                                    <div className="space-y-3 py-2">
                                       <div className="space-y-1">
                                           <Label className="text-[11px] font-semibold">Course</Label>
                                           <Select value={newChapterCourseId} onValueChange={(v: any) => setNewChapterCourseId(v)}>
                                             <SelectTrigger className="h-8 sm:h-9 text-xs rounded-lg"><span className="truncate text-left block w-full pr-1">{newChapterCourseId ? courses.find(c => c.id === newChapterCourseId)?.title || "Select Course" : "Select Course"}</span></SelectTrigger>
                                             <SelectContent>{courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}</SelectContent>
                                          </Select>
                                       </div>
                                       <div className="space-y-1">
                                          <Label className="text-[11px] font-semibold">Chapter Name</Label>
                                          <Input placeholder="e.g. Chapter 1: Introduction to Computing" value={newChapterName} onChange={e => setNewChapterName(e.target.value)} className="h-8 sm:h-9 text-xs rounded-lg" />
                                       </div>
                                       <Button onClick={handleCreateChapter} disabled={isCreatingChapter} className="w-full h-8 sm:h-9 rounded-lg text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground mt-2">
                                          {isCreatingChapter ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Save className="w-3.5 h-3.5 mr-1.5" />} Save Chapter
                                       </Button>
                                    </div>
                                 </DialogContent>
                              </Dialog>
                           </div>
                        </div>
                     </div>

                     {!selectedChapter && (
                        <div className="text-center py-8 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-700/60 text-slate-400 space-y-1">
                           <BookOpen className="w-8 h-8 mx-auto opacity-40"/>
                           <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Select a course and chapter to continue</p>
                        </div>
                     )}

                     {selectedChapter && mode === "manual" && (
                        <div className="space-y-3 pt-1">
                           <div className="space-y-1">
                              <Label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Question Statement</Label>
                              <Textarea value={manualQ.questionText} onChange={e => setManualQ({...manualQ, questionText: e.target.value})} placeholder="Type the question..." className="min-h-[70px] text-xs rounded-lg resize-none" />
                           </div>
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {['A','B','C','D'].map(opt => (
                                 <div key={opt} className="relative space-y-1">
                                    <Label className="text-[10px] font-semibold text-slate-500 uppercase">Option {opt}</Label>
                                    <div className="relative">
                                       <Input value={(manualQ as any)[`option${opt}`]} onChange={e => setManualQ({...manualQ, [`option${opt}`]: e.target.value})} className="h-8 sm:h-9 text-xs rounded-lg pr-9" placeholder={`Answer ${opt}`} />
                                       <button 
                                          type="button"
                                          onClick={() => setManualQ({...manualQ, correctOption: opt})} 
                                          title="Mark as correct answer"
                                          className={cn("absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold cursor-pointer transition-colors", manualQ.correctOption === opt ? "bg-emerald-600 text-white shadow-xs" : "bg-slate-100 text-slate-400 hover:bg-slate-200 dark:bg-slate-800")}
                                       >
                                          {opt}
                                       </button>
                                    </div>
                                 </div>
                              ))}
                           </div>
                           <div className="pt-2">
                              <Button onClick={handleSaveManual} disabled={isSavingManual} className="w-full h-8 sm:h-9 rounded-lg text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs">
                                 {isSavingManual ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5"/> : <Save className="w-3.5 h-3.5 mr-1.5"/>} Save Question to Bank
                              </Button>
                           </div>
                        </div>
                     )}

                     {selectedChapter && mode === "csv" && (
                        <div className="text-center py-6 space-y-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-700/60">
                           <UploadCloud className="w-10 h-10 text-blue-500 mx-auto" />
                           <div className="space-y-1">
                              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Bulk Upload Questions via CSV</p>
                              <p className="text-[11px] text-slate-400">Download the formatted template and fill in Question, Option A-D, and Correct Answer.</p>
                           </div>
                           <div className="flex flex-wrap justify-center gap-2 pt-1">
                              <Button variant="outline" size="sm" onClick={handleDownloadTemplate} className="h-8 rounded-lg text-xs font-semibold">
                                 Download Template
                              </Button>
                              <div className="relative inline-block">
                                 <input type="file" accept=".csv" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                 <Button disabled={isUploadingCSV} size="sm" className="h-8 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white pointer-events-none">
                                    {isUploadingCSV ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5"/> : <UploadCloud className="w-3.5 h-3.5 mr-1.5"/>}
                                    {isUploadingCSV ? "Importing..." : "Upload CSV"}
                                 </Button>
                              </div>
                           </div>
                        </div>
                     )}

                     {selectedChapter && mode === "ai" && (
                        <div className="text-center py-8 opacity-60 rounded-xl bg-slate-50 dark:bg-slate-800/30">
                           <BrainCircuit className="w-10 h-10 text-amber-500 mx-auto mb-2" />
                           <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">AI Generator Coming Soon</h3>
                           <p className="text-[11px] text-slate-400 mt-1">Automatic question synthesis based on course syllabus is undergoing evaluation.</p>
                        </div>
                     )}
                  </div>
               </DialogContent>
            </Dialog>

            {selectedQuestionIds.size > 0 && (
               <Dialog open={isCreateExamOpen} onOpenChange={setIsCreateExamOpen}>
                  <DialogTrigger render={<Button className="h-8 sm:h-9 px-3 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs animate-in fade-in flex items-center gap-1.5" />}>
                     <CheckCircle2 className="w-3.5 h-3.5" />
                     <span>Create Exam ({selectedQuestionIds.size})</span>
                  </DialogTrigger>
                  <DialogContent className="max-w-md rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900">
                     <DialogTitle className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Create Online Exam</DialogTitle>
                     <div className="space-y-3 pt-2">
                        <div className="space-y-1">
                           <Label className="text-[11px] font-semibold">Exam Title</Label>
                           <Input placeholder="e.g. Final Semester Examination" value={examConfig.title} onChange={e => setExamConfig({...examConfig, title: e.target.value})} className="h-8 sm:h-9 text-xs rounded-lg" />
                        </div>
                        <div className="space-y-1">
                           <Label className="text-[11px] font-semibold">Course Link (Optional)</Label>
                           <Select value={examConfig.courseId} onValueChange={(v: any) => setExamConfig({...examConfig, courseId: v})}>
                              <SelectTrigger className="h-8 sm:h-9 text-xs rounded-lg"><span className="truncate text-left block w-full pr-1">{examConfig.courseId === "all" || !examConfig.courseId ? "None" : courses.find(c => c.id === examConfig.courseId)?.title || "None"}</span></SelectTrigger>
                              <SelectContent>
                                 <SelectItem value="all">None</SelectItem>
                                 {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                              </SelectContent>
                           </Select>
                        </div>
                        <div className="space-y-1">
                           <Label className="text-[11px] font-semibold">Date of Exam (Optional)</Label>
                           <Input type="date" value={examConfig.date} onChange={e => setExamConfig({...examConfig, date: e.target.value})} className="h-8 sm:h-9 text-xs rounded-lg" />
                        </div>
                        <div className="grid grid-cols-2 gap-2.5">
                           <div className="space-y-1">
                              <Label className="text-[11px] font-semibold">Marks / Question</Label>
                              <Input type="number" min="1" value={examConfig.marksPerQuestion} onChange={e => setExamConfig({...examConfig, marksPerQuestion: e.target.value})} className="h-8 sm:h-9 text-xs rounded-lg" />
                           </div>
                           <div className="space-y-1">
                              <Label className="text-[11px] font-semibold">Duration (Mins)</Label>
                              <Input type="number" min="10" value={examConfig.duration} onChange={e => setExamConfig({...examConfig, duration: e.target.value})} className="h-8 sm:h-9 text-xs rounded-lg" />
                           </div>
                        </div>
                        <div className="space-y-1">
                           <Label className="text-[11px] font-semibold">Passing Marks</Label>
                           <Input type="number" min="1" value={examConfig.passingMarks} onChange={e => setExamConfig({...examConfig, passingMarks: e.target.value})} className="h-8 sm:h-9 text-xs rounded-lg" />
                        </div>
                        <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs flex justify-between items-center text-emerald-800 dark:text-emerald-300">
                           <span>Questions: <b>{selectedQuestionIds.size}</b></span>
                           <span>Total Marks: <b>{selectedQuestionIds.size * parseFloat(examConfig.marksPerQuestion || "0")}</b></span>
                        </div>
                        <Button onClick={handleCreateExam} disabled={isCreatingExam} className="w-full h-8 sm:h-9 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs mt-1">
                           {isCreatingExam ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />} Publish Online Exam
                        </Button>
                     </div>
                  </DialogContent>
               </Dialog>
            )}
         </div>
      </div>

      {/* Questions Table (Rule 7.4 & 7.5) */}
      <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden bg-white dark:bg-slate-900">
         <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
               <CardTitle className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Question Bank</CardTitle>
               <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">{filteredQuestions.length} Questions</span>
            </div>
            {selectedQuestionIds.size > 0 && (
               <span className="text-xs font-medium text-primary">
                  {selectedQuestionIds.size} selected
               </span>
            )}
         </CardHeader>
         <CardContent className="p-0">
            <div className="overflow-x-auto">
               <table className="w-full text-xs text-left">
                  <thead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
                     <tr>
                        <th className="px-3 py-2.5 w-10">
                           <input 
                              type="checkbox" 
                              className="w-3.5 h-3.5 rounded text-primary border-slate-300 dark:border-slate-700 cursor-pointer"
                              checked={paginatedQuestions.length > 0 && paginatedQuestions.every(q => selectedQuestionIds.has(q.id))}
                              onChange={(e) => handleSelectAll(e.target.checked)}
                           />
                        </th>
                        <th className="px-3 py-2.5 w-12">#</th>
                        <th className="px-3 py-2.5 min-w-[200px]">Question Statement</th>
                        <th className="px-3 py-2.5 w-40">Course</th>
                        <th className="px-3 py-2.5 w-36">Chapter</th>
                        <th className="px-3 py-2.5 w-20 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                     {paginatedQuestions.map((q, i) => (
                        <tr key={q.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                           <td className="px-3 py-2.5">
                              <input 
                                 type="checkbox" 
                                 className="w-3.5 h-3.5 rounded text-primary border-slate-300 dark:border-slate-700 cursor-pointer"
                                 checked={selectedQuestionIds.has(q.id)}
                                 onChange={() => toggleSelection(q.id)}
                              />
                           </td>
                           <td className="px-3 py-2.5 text-slate-400 font-medium">
                              {(currentPage - 1) * itemsPerPage + i + 1}
                           </td>
                           <td className="px-3 py-2.5 font-medium text-slate-800 dark:text-slate-200">
                              <div className="line-clamp-2 leading-relaxed">{q.questionText}</div>
                           </td>
                           <td className="px-3 py-2.5 text-slate-500">
                              <span className="truncate block max-w-[150px] font-medium" title={q.courseName}>{q.courseName}</span>
                           </td>
                           <td className="px-3 py-2.5">
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                 {q.chapterName}
                              </span>
                           </td>
                           <td className="px-3 py-2.5 text-right">
                              <div className="flex items-center justify-end gap-1">
                                 <button onClick={() => { setEditingQuestion(q); setIsEditing(true); }} className="h-7 w-7 rounded-lg text-slate-500 hover:text-primary hover:bg-primary/5 flex items-center justify-center transition-colors" title="Edit Question">
                                    <Edit2 className="w-3.5 h-3.5" />
                                 </button>
                                 <button disabled={isDeleting === q.id} onClick={() => handleDeleteQuestion(q.id)} className="h-7 w-7 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center justify-center transition-colors disabled:opacity-50" title="Delete Question">
                                    {isDeleting === q.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                 </button>
                              </div>
                           </td>
                        </tr>
                     ))}
                     {paginatedQuestions.length === 0 && (
                        <tr>
                           <td colSpan={6} className="px-4 py-8 text-center text-xs text-slate-400">
                              No questions found matching your filter criteria.
                           </td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>
            
            {/* Pagination Footer (Rule 7.6) */}
            {totalPages > 1 && (
               <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20">
                  <div className="text-xs font-medium text-slate-500">
                     Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredQuestions.length)} of {filteredQuestions.length}
                  </div>
                  <div className="flex items-center gap-1">
                     <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="h-7 px-2 rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xs text-xs font-semibold">
                        <ChevronLeft className="w-3.5 h-3.5 mr-0.5" /> Prev
                     </Button>
                     <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="h-7 px-2 rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xs text-xs font-semibold">
                        Next <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                     </Button>
                  </div>
               </div>
            )}
         </CardContent>
      </Card>

      {/* Edit Question Modal (Rule 7.7) */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
         <DialogContent className="max-w-xl rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900">
            <DialogTitle className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-2">Edit Question</DialogTitle>
            {editingQuestion && (
               <div className="space-y-3.5">
                  <div className="space-y-1">
                     <Label className="text-[11px] font-semibold">Question Text</Label>
                     <Textarea value={editingQuestion.questionText} onChange={e => setEditingQuestion({...editingQuestion, questionText: e.target.value})} className="min-h-[80px] text-xs rounded-lg resize-none" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                     {['A','B','C','D'].map(opt => (
                        <div key={opt} className="relative space-y-1">
                           <Label className="text-[10px] font-semibold text-slate-500 uppercase">Option {opt}</Label>
                           <div className="relative">
                              <Input value={(editingQuestion as any)[`option${opt}`] || ""} onChange={e => setEditingQuestion({...editingQuestion, [`option${opt}`]: e.target.value})} className="h-8 sm:h-9 text-xs rounded-lg pr-9" />
                              <button 
                                 type="button" 
                                 onClick={() => setEditingQuestion({...editingQuestion, correctOption: opt})} 
                                 className={cn("absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold cursor-pointer transition-colors", editingQuestion.correctOption === opt ? "bg-emerald-600 text-white shadow-xs" : "bg-slate-100 text-slate-400 dark:bg-slate-800")}
                              >
                                 {opt}
                              </button>
                           </div>
                        </div>
                     ))}
                  </div>
                  <Button onClick={handleSaveEdit} disabled={isSavingEdit} className="w-full h-8 sm:h-9 rounded-lg text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs mt-2">
                     {isSavingEdit ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5"/> : <Save className="w-3.5 h-3.5 mr-1.5"/>} Save Changes
                  </Button>
               </div>
            )}
         </DialogContent>
      </Dialog>
      <ConfirmDialog 
         open={deleteConfirmOpen} 
         onOpenChange={setDeleteConfirmOpen}
         title="Delete Question"
         description="Are you absolutely sure you want to delete this question? This action cannot be undone."
         confirmText={isDeleting ? "Deleting..." : "Delete"}
         cancelText="Cancel"
         destructive={true}
         onConfirm={performDelete}
      />
   </div>
);
}
