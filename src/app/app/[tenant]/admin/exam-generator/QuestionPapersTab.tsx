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
      <div className="space-y-6 mt-6">
         {/* Top Action Bar */}
         <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex flex-wrap gap-4 items-center flex-1">
               <div className="relative max-w-sm w-full lg:w-[300px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input 
                     placeholder="Search questions, courses..." 
                     value={searchQuery}
                     onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                     className="pl-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-950 border-none font-medium"
                  />
               </div>
               
               <Select value={selectedCourseFilter} onValueChange={v => { setSelectedCourseFilter(v); setSelectedChapterFilter("all"); setCurrentPage(1); }}>
                  <SelectTrigger className="h-10 w-[200px] rounded-xl font-bold bg-slate-50 dark:bg-slate-950 border-none">
                     <span className="truncate text-left block w-full pr-2">{selectedCourseFilter === "all" ? "All Courses" : courses.find(c => c.id === selectedCourseFilter)?.title || "All Courses"}</span>
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="all">All Courses</SelectItem>
                     {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                  </SelectContent>
               </Select>

               <Select value={selectedChapterFilter} onValueChange={v => { setSelectedChapterFilter(v); setCurrentPage(1); }} disabled={selectedCourseFilter === "all"}>
                  <SelectTrigger className="h-10 w-[200px] rounded-xl font-bold bg-slate-50 dark:bg-slate-950 border-none">
                     <span className="truncate text-left block w-full pr-2">{selectedChapterFilter === "all" ? "All Chapters" : chapters.find(c => c.id === selectedChapterFilter)?.name || "All Chapters"}</span>
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="all">All Chapters</SelectItem>
                     {chapters.filter(c => c.courseId === selectedCourseFilter).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
               </Select>
            </div>

            <Dialog open={isCreateQuestionOpen} onOpenChange={setIsCreateQuestionOpen}>
               <DialogTrigger render={<Button className="rounded-xl h-10 px-6 font-bold shadow-md shadow-primary/20" />}>
                  <Plus className="w-4 h-4 mr-2" /> Add Questions
               </DialogTrigger>
               <DialogContent className="sm:max-w-[700px] rounded-[2rem] p-0 overflow-hidden border-2 bg-slate-50 dark:bg-zinc-950">
                  <div className="bg-white dark:bg-slate-900 p-6 border-b border-slate-100 dark:border-slate-800">
                     <DialogTitle className="text-xl font-bold">Add Questions</DialogTitle>
                     <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-2xl w-fit mt-4">
                        <button onClick={() => setMode("manual")} className={cn("px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2", mode === "manual" ? "bg-white dark:bg-slate-700 shadow text-primary" : "text-slate-500 hover:text-slate-900")}>
                           <FileText className="w-4 h-4" /> Manual
                        </button>
                        <button onClick={() => setMode("csv")} className={cn("px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2", mode === "csv" ? "bg-white dark:bg-slate-700 shadow text-primary" : "text-slate-500 hover:text-slate-900")}>
                           <UploadCloud className="w-4 h-4" /> CSV Import
                        </button>
                        <button onClick={() => setMode("ai")} className={cn("px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2", mode === "ai" ? "bg-white dark:bg-slate-700 shadow text-amber-500" : "text-slate-500 hover:text-slate-900")}>
                           <Sparkles className="w-4 h-4" /> AI Generate
                        </button>
                     </div>
                  </div>

                  <div className="p-6 overflow-y-auto max-h-[60vh]">
                     {/* Select Course & Chapter for Creation */}
                     <div className="flex gap-4 mb-6">
                        <div className="flex-1 space-y-2">
                           <Label className="text-xs font-bold uppercase text-slate-400">Course</Label>
                           <Select value={selectedCourse} onValueChange={v => { setSelectedCourse(v); setSelectedChapter(""); }}>
                              <SelectTrigger className="h-12 rounded-xl"><span className="truncate text-left block w-full pr-2">{selectedCourse ? courses.find(c => c.id === selectedCourse)?.title || "Select Course" : "Select Course"}</span></SelectTrigger>
                              <SelectContent>{courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}</SelectContent>
                           </Select>
                        </div>
                        <div className="flex-1 space-y-2">
                           <Label className="text-xs font-bold uppercase text-slate-400">Chapter</Label>
                           <div className="flex gap-2">
                              <Select value={selectedChapter} onValueChange={v => setSelectedChapter(v)} disabled={!selectedCourse}>
                                 <SelectTrigger className="h-12 rounded-xl flex-1"><span className="truncate text-left block w-full pr-2">{selectedChapter ? chapters.find(c => c.id === selectedChapter)?.name || "Select Chapter" : "Select Chapter"}</span></SelectTrigger>
                                 <SelectContent>
                                    {chapters.filter(c => c.courseId === selectedCourse).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                 </SelectContent>
                              </Select>
                              <Dialog open={isCreateChapterOpen} onOpenChange={setIsCreateChapterOpen}>
                                 <DialogTrigger render={<Button variant="outline" className="h-12 w-12 p-0 rounded-xl shrink-0" />}>
                                    <Plus className="w-5 h-5"/>
                                 </DialogTrigger>
                                 <DialogContent className="sm:max-w-md rounded-[2rem] p-6">
                                    <DialogTitle>New Chapter</DialogTitle>
                                    <div className="space-y-4 py-4">
                                       <Select value={newChapterCourseId} onValueChange={v => setNewChapterCourseId(v)}>
                                          <SelectTrigger className="h-12 rounded-xl"><span className="truncate text-left block w-full pr-2">{newChapterCourseId ? courses.find(c => c.id === newChapterCourseId)?.title || "Select Course" : "Select Course"}</span></SelectTrigger>
                                          <SelectContent>{courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}</SelectContent>
                                       </Select>
                                       <Input placeholder="Chapter Name" value={newChapterName} onChange={e => setNewChapterName(e.target.value)} className="h-12 rounded-xl" />
                                       <Button onClick={handleCreateChapter} disabled={isCreatingChapter} className="w-full h-12 rounded-xl font-bold">
                                          {isCreatingChapter ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />} Save Chapter
                                       </Button>
                                    </div>
                                 </DialogContent>
                              </Dialog>
                           </div>
                        </div>
                     </div>

                     {!selectedChapter && <div className="text-center py-10 opacity-50"><BookOpen className="w-12 h-12 mx-auto mb-2"/>Select a chapter first</div>}

                     {selectedChapter && mode === "manual" && (
                        <div className="space-y-6">
                           <Textarea value={manualQ.questionText} onChange={e => setManualQ({...manualQ, questionText: e.target.value})} placeholder="Question Text..." className="min-h-[100px] rounded-xl resize-none" />
                           <div className="grid grid-cols-2 gap-4">
                              {['A','B','C','D'].map(opt => (
                                 <div key={opt} className="relative">
                                    <Label className="text-xs ml-1 text-slate-500">Option {opt}</Label>
                                    <Input value={(manualQ as any)[`option${opt}`]} onChange={e => setManualQ({...manualQ, [`option${opt}`]: e.target.value})} className="h-12 rounded-xl pr-10" />
                                    <div onClick={() => setManualQ({...manualQ, correctOption: opt})} className={cn("absolute right-2 top-7 w-6 h-6 rounded flex items-center justify-center text-xs font-bold cursor-pointer", manualQ.correctOption === opt ? "bg-green-500 text-white" : "bg-slate-100 text-slate-400 hover:bg-slate-200")}>{opt}</div>
                                 </div>
                              ))}
                           </div>
                           <Button onClick={handleSaveManual} disabled={isSavingManual} className="w-full h-12 rounded-xl font-bold">{isSavingManual ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <Save className="w-4 h-4 mr-2"/>} Save Question</Button>
                        </div>
                     )}

                     {selectedChapter && mode === "csv" && (
                        <div className="text-center py-8 space-y-6">
                           <UploadCloud className="w-16 h-16 text-blue-500 mx-auto" />
                           <div className="flex justify-center gap-4">
                              <Button variant="outline" onClick={handleDownloadTemplate} className="h-12 px-6 rounded-xl font-bold border-2 border-slate-200 dark:border-slate-800">
                                Download Template
                              </Button>
                              <div className="relative inline-block">
                                 <input type="file" accept=".csv" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                 <Button disabled={isUploadingCSV} className="h-12 px-6 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white pointer-events-none">
                                    {isUploadingCSV ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <UploadCloud className="w-4 h-4 mr-2"/>}
                                    {isUploadingCSV ? "Importing..." : "Upload CSV"}
                                 </Button>
                              </div>
                           </div>
                        </div>
                     )}

                     {selectedChapter && mode === "ai" && (
                        <div className="text-center py-8 opacity-60">
                           <BrainCircuit className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                           <h3 className="text-lg font-bold">AI Generator Coming Soon</h3>
                        </div>
                     )}
                  </div>
               </DialogContent>
            </Dialog>
         </div>

         {/* Questions Table */}
         <Card className="border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/20 dark:shadow-none overflow-hidden">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-800/30 px-6 py-4 flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800">
               <div className="flex items-center gap-4">
                  <CardTitle className="text-lg font-bold">Question Bank</CardTitle>
                  <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">{allQuestions.length} Total</span>
               </div>
               
               {selectedQuestionIds.size > 0 && (
                  <Dialog open={isCreateExamOpen} onOpenChange={setIsCreateExamOpen}>
                     <DialogTrigger render={<Button className="h-10 rounded-xl font-bold bg-green-600 hover:bg-green-700 text-white animate-in fade-in slide-in-from-right-4" />}>
                        Create Exam ({selectedQuestionIds.size})
                     </DialogTrigger>
                     <DialogContent className="sm:max-w-md rounded-[2rem] p-6">
                        <DialogTitle className="text-xl font-bold mb-4">Create Online Exam</DialogTitle>
                        <div className="space-y-4">
                           <div className="space-y-2">
                              <Label>Exam Title</Label>
                              <Input placeholder="e.g. Final Semester Exam" value={examConfig.title} onChange={e => setExamConfig({...examConfig, title: e.target.value})} className="h-12 rounded-xl" />
                           </div>
                           <div className="space-y-2">
                              <Label>Course Link (Optional)</Label>
                              <Select value={examConfig.courseId} onValueChange={v => setExamConfig({...examConfig, courseId: v})}>
                                 <SelectTrigger className="h-12 rounded-xl"><span className="truncate text-left block w-full pr-2">{examConfig.courseId === "all" || !examConfig.courseId ? "None" : courses.find(c => c.id === examConfig.courseId)?.title || "None"}</span></SelectTrigger>
                                 <SelectContent>
                                    <SelectItem value="all">None</SelectItem>
                                    {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                                 </SelectContent>
                              </Select>
                           </div>
                           <div className="space-y-2">
                              <Label>Date of Exam (Optional)</Label>
                              <Input type="date" value={examConfig.date} onChange={e => setExamConfig({...examConfig, date: e.target.value})} className="h-12 rounded-xl" />
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                 <Label>Marks Per Question</Label>
                                 <Input type="number" min="1" value={examConfig.marksPerQuestion} onChange={e => setExamConfig({...examConfig, marksPerQuestion: e.target.value})} className="h-12 rounded-xl" />
                              </div>
                              <div className="space-y-2">
                                 <Label>Duration (Mins)</Label>
                                 <Input type="number" min="10" value={examConfig.duration} onChange={e => setExamConfig({...examConfig, duration: e.target.value})} className="h-12 rounded-xl" />
                              </div>
                           </div>
                           <div className="space-y-2">
                              <Label>Passing Marks</Label>
                              <Input type="number" min="1" value={examConfig.passingMarks} onChange={e => setExamConfig({...examConfig, passingMarks: e.target.value})} className="h-12 rounded-xl" />
                           </div>
                           <div className="pt-2">
                              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-2xl mb-4 border border-green-100 dark:border-green-900/50">
                                 <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-500">Selected Questions:</span>
                                    <span className="font-bold">{selectedQuestionIds.size}</span>
                                 </div>
                                 <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Total Marks:</span>
                                    <span className="font-bold text-green-600 dark:text-green-400">{selectedQuestionIds.size * parseFloat(examConfig.marksPerQuestion || "0")}</span>
                                 </div>
                              </div>
                              <Button onClick={handleCreateExam} disabled={isCreatingExam} className="w-full h-12 rounded-xl font-bold bg-green-600 hover:bg-green-700 text-white">
                                 {isCreatingExam ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <CheckCircle2 className="w-5 h-5 mr-2" />} Publish Exam
                              </Button>
                           </div>
                        </div>
                     </DialogContent>
                  </Dialog>
               )}
            </CardHeader>
            <CardContent className="p-0">
               <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                     <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                        <tr>
                           <th className="px-6 py-4 w-12">
                              <input 
                                 type="checkbox" 
                                 className="w-4 h-4 rounded text-primary"
                                 checked={paginatedQuestions.length > 0 && paginatedQuestions.every(q => selectedQuestionIds.has(q.id))}
                                 onChange={(e) => handleSelectAll(e.target.checked)}
                              />
                           </th>
                           <th className="px-6 py-4 font-bold tracking-widest w-16">S.No</th>
                           <th className="px-6 py-4 font-bold tracking-widest">Question Text</th>
                           <th className="px-6 py-4 font-bold tracking-widest w-48">Course</th>
                           <th className="px-6 py-4 font-bold tracking-widest w-48">Chapter</th>
                           <th className="px-6 py-4 font-bold tracking-widest w-24">Actions</th>
                        </tr>
                     </thead>
                     <tbody>
                        {paginatedQuestions.map((q, i) => (
                           <tr key={q.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                              <td className="px-6 py-4">
                                 <input 
                                    type="checkbox" 
                                    className="w-4 h-4 rounded text-primary"
                                    checked={selectedQuestionIds.has(q.id)}
                                    onChange={() => toggleSelection(q.id)}
                                 />
                              </td>
                              <td className="px-6 py-4 text-slate-500 font-medium">
                                 {(currentPage - 1) * itemsPerPage + i + 1}
                              </td>
                              <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-200">
                                 <div className="line-clamp-2">{q.questionText}</div>
                              </td>
                              <td className="px-6 py-4 text-slate-500">
                                 <div className="truncate max-w-[10rem]" title={q.courseName}>{q.courseName}</div>
                              </td>
                              <td className="px-6 py-4">
                                 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300">
                                    {q.chapterName}
                                 </span>
                              </td>
                              <td className="px-6 py-4">
                                 <div className="flex gap-2">
                                    <button onClick={() => { setEditingQuestion(q); setIsEditing(true); }} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors" title="Edit Question">
                                       <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button disabled={isDeleting === q.id} onClick={() => handleDeleteQuestion(q.id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors disabled:opacity-50" title="Delete Question">
                                       {isDeleting === q.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                    </button>
                                 </div>
                              </td>
                           </tr>
                        ))}
                        {paginatedQuestions.length === 0 && (
                           <tr>
                              <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                 No questions found. Try adding some or changing your filters!
                              </td>
                           </tr>
                        )}
                     </tbody>
                  </table>
               </div>
               
               {/* Pagination Footer */}
               {totalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
                     <div className="text-sm text-slate-500 font-medium">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredQuestions.length)} of {filteredQuestions.length} Questions
                     </div>
                     <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="rounded-lg font-bold">
                           <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                        </Button>
                        <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="rounded-lg font-bold">
                           Next <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                     </div>
                  </div>
               )}
            </CardContent>
         </Card>

         {/* Edit Question Modal */}
         <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogContent className="sm:max-w-[700px] rounded-[2rem] p-6 border-2 bg-slate-50 dark:bg-zinc-950">
               <DialogTitle className="text-xl font-bold mb-4">Edit Question</DialogTitle>
               {editingQuestion && (
                  <div className="space-y-6">
                     <Textarea value={editingQuestion.questionText} onChange={e => setEditingQuestion({...editingQuestion, questionText: e.target.value})} className="min-h-[100px] rounded-xl resize-none bg-white dark:bg-slate-900" />
                     <div className="grid grid-cols-2 gap-4">
                        {['A','B','C','D'].map(opt => (
                           <div key={opt} className="relative">
                              <Label className="text-xs ml-1 text-slate-500">Option {opt}</Label>
                              <Input value={(editingQuestion as any)[`option${opt}`] || ""} onChange={e => setEditingQuestion({...editingQuestion, [`option${opt}`]: e.target.value})} className="h-12 rounded-xl pr-10 bg-white dark:bg-slate-900" />
                              <div onClick={() => setEditingQuestion({...editingQuestion, correctOption: opt})} className={cn("absolute right-2 top-7 w-6 h-6 rounded flex items-center justify-center text-xs font-bold cursor-pointer transition-colors", editingQuestion.correctOption === opt ? "bg-green-500 text-white shadow-sm" : "bg-slate-100 text-slate-400 dark:bg-slate-800")}>{opt}</div>
                           </div>
                        ))}
                     </div>
                     <Button onClick={handleSaveEdit} disabled={isSavingEdit} className="w-full h-12 rounded-xl font-bold">{isSavingEdit ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <Save className="w-4 h-4 mr-2"/>} Save Changes</Button>
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
