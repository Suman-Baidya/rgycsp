"use client";

import { useState } from "react";
import {
   Sparkles,
   BrainCircuit,
   Settings2,
   FileText,
   CheckCircle2,
   AlertCircle,
   Loader2,
   Plus,
   UploadCloud,
   Save,
   BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createChapter, addManualQuestion, bulkImportQuestions } from "@/app/actions/question-bank";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import Papa from "papaparse";

export default function QuestionPapersTab({ workspaceId, workspaceTokens, courses, chapters }: { workspaceId: string, workspaceTokens: number, courses: any[], chapters: any[] }) {
   const [mode, setMode] = useState<"manual" | "csv" | "ai">("manual");
   
   // State for Chapter Creation
   const [isCreateChapterOpen, setIsCreateChapterOpen] = useState(false);
   const [newChapterCourseId, setNewChapterCourseId] = useState("");
   const [newChapterName, setNewChapterName] = useState("");
   const [isCreatingChapter, setIsCreatingChapter] = useState(false);

   // State for Selections
   const [selectedCourse, setSelectedCourse] = useState("");
   const [selectedChapter, setSelectedChapter] = useState("");

   // State for Manual Entry
   const [manualQ, setManualQ] = useState({
      questionText: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctOption: "A"
   });
   const [isSavingManual, setIsSavingManual] = useState(false);

   // Filter chapters based on selected course
   const filteredChapters = chapters.filter(c => c.courseId === selectedCourse);

   const handleCreateChapter = async () => {
      if (!newChapterCourseId || !newChapterName) return toast.error("Please fill all fields");
      setIsCreatingChapter(true);
      try {
         const res = await createChapter(workspaceId, newChapterCourseId, newChapterName);
         if (res.success) {
            toast.success("Chapter created!");
            setIsCreateChapterOpen(false);
            setNewChapterName("");
            if (selectedCourse === newChapterCourseId) {
               setSelectedChapter(res.data.id);
            }
         } else {
            toast.error(res.error);
         }
      } catch(e: any) {
         toast.error(e.message);
      } finally {
         setIsCreatingChapter(false);
      }
   };

   const handleSaveManual = async () => {
      if (!selectedChapter) return toast.error("Please select a chapter");
      if (!manualQ.questionText || !manualQ.optionA || !manualQ.optionB) return toast.error("Question and at least Options A & B are required");
      
      setIsSavingManual(true);
      try {
         const res = await addManualQuestion(workspaceId, selectedChapter, manualQ);
         if (res.success) {
            toast.success("Question saved to Chapter!");
            setManualQ({
               questionText: "",
               optionA: "",
               optionB: "",
               optionC: "",
               optionD: "",
               correctOption: "A"
            });
         } else {
            toast.error(res.error);
         }
      } catch (e: any) {
         toast.error(e.message);
      } finally {
         setIsSavingManual(false);
      }
   };

   // CSV Import State and Logic
   const [isUploadingCSV, setIsUploadingCSV] = useState(false);

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

   const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!selectedChapter) return toast.error("Please select a chapter first.");
      
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUploadingCSV(true);

      Papa.parse(file, {
         header: true,
         skipEmptyLines: true,
         complete: async (results) => {
            try {
               const parsedQuestions = results.data.map((row: any) => {
                  const getVal = (key1: string, key2: string) => (row[key1] || row[key2] || "").trim();
                  
                  const questionText = getVal("Question Text", "Question");
                  const optionA = getVal("Option A", "A");
                  const optionB = getVal("Option B", "B");
                  const optionC = getVal("Option C", "C");
                  const optionD = getVal("Option D", "D");
                  const correctOption = getVal("Correct Option", "Correct").toUpperCase();

                  if (!questionText || !optionA || !optionB || !['A','B','C','D'].includes(correctOption)) {
                     throw new Error(`Invalid row data format for question: "${questionText.substring(0, 20)}..."`);
                  }

                  return { questionText, optionA, optionB, optionC, optionD, correctOption };
               });

               if (parsedQuestions.length === 0) throw new Error("No valid questions found in CSV.");

               const res = await bulkImportQuestions(workspaceId, selectedChapter, parsedQuestions);
               
               if (res.success) {
                  toast.success(`Successfully imported ${res.count} questions!`);
               } else {
                  toast.error(`Import failed: ${res.error}`);
               }
            } catch (err: any) {
               toast.error(err.message);
            } finally {
               setIsUploadingCSV(false);
               if (e.target) e.target.value = ""; // Reset input
            }
         },
         error: (err) => {
            toast.error(`Error parsing CSV: ${err.message}`);
            setIsUploadingCSV(false);
         }
      });
   };

   return (
      <div className="space-y-6 mt-6">
         {/* Top Controls */}
         <div className="flex flex-col md:flex-row gap-6">
            <Card className="border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/20 dark:shadow-none flex-1">
               <CardContent className="p-6">
                  <div className="flex flex-wrap gap-4">
                     <div className="flex-1 space-y-2 min-w-[200px]">
                        <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Select Course</Label>
                        <Select value={selectedCourse} onValueChange={(val: any) => { setSelectedCourse(val as string); setSelectedChapter(""); }}>
                           <SelectTrigger className="h-12 rounded-2xl font-bold">
                              <SelectValue placeholder="Choose Course">
                                 {selectedCourse ? courses.find(c => c.id === selectedCourse)?.title : undefined}
                              </SelectValue>
                           </SelectTrigger>
                           <SelectContent>
                              {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                           </SelectContent>
                        </Select>
                     </div>
                     <div className="flex-1 space-y-2 min-w-[200px]">
                        <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Select Chapter</Label>
                        <div className="flex gap-2">
                           <Select value={selectedChapter} onValueChange={(val: any) => setSelectedChapter(val as string)} disabled={!selectedCourse}>
                              <SelectTrigger className="h-12 rounded-2xl font-bold flex-1">
                                 <SelectValue placeholder="Choose Chapter">
                                    {selectedChapter ? filteredChapters.find(c => c.id === selectedChapter)?.name : undefined}
                                 </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                 {filteredChapters.map(c => <SelectItem key={c.id} value={c.id}>{c.name} ({c._count?.questions || 0} Qs)</SelectItem>)}
                                 {filteredChapters.length === 0 && <SelectItem value="none" disabled>No chapters found</SelectItem>}
                              </SelectContent>
                           </Select>
                           <Dialog open={isCreateChapterOpen} onOpenChange={setIsCreateChapterOpen}>
                              <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50 border border-slate-200 bg-white shadow-sm hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 dark:hover:text-slate-50 h-12 w-12 rounded-2xl p-0 shrink-0 border-2">
                                 <Plus className="w-5 h-5" />
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px] rounded-[2rem] p-8">
                                 <DialogHeader>
                                    <DialogTitle className="text-2xl font-bold">New Chapter</DialogTitle>
                                 </DialogHeader>
                                 <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                       <Label>Course</Label>
                                       <Select value={newChapterCourseId} onValueChange={(val: any) => setNewChapterCourseId(val as string)}>
                                          <SelectTrigger className="rounded-xl h-12">
                                             <SelectValue placeholder="Select Course">
                                                {newChapterCourseId ? courses.find(c => c.id === newChapterCourseId)?.title : undefined}
                                             </SelectValue>
                                          </SelectTrigger>
                                          <SelectContent>
                                             {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                                          </SelectContent>
                                       </Select>
                                    </div>
                                    <div className="space-y-2">
                                       <Label>Chapter Name</Label>
                                       <Input 
                                          value={newChapterName} 
                                          onChange={e => setNewChapterName(e.target.value)} 
                                          placeholder="e.g. Thermodynamics"
                                          className="rounded-xl h-12" 
                                       />
                                    </div>
                                 </div>
                                 <Button onClick={handleCreateChapter} disabled={isCreatingChapter} className="w-full h-12 rounded-xl font-bold">
                                    {isCreatingChapter ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />} Save Chapter
                                 </Button>
                              </DialogContent>
                           </Dialog>
                        </div>
                     </div>
                  </div>
               </CardContent>
            </Card>
         </div>

         {/* Mode Switcher */}
         <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-2xl w-fit">
            <button
               onClick={() => setMode("manual")}
               className={cn("px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2", mode === "manual" ? "bg-white dark:bg-slate-700 shadow text-primary" : "text-slate-500 hover:text-slate-900 dark:hover:text-white")}
            >
               <FileText className="w-4 h-4" /> Manual Entry
            </button>
            <button
               onClick={() => setMode("csv")}
               className={cn("px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2", mode === "csv" ? "bg-white dark:bg-slate-700 shadow text-primary" : "text-slate-500 hover:text-slate-900 dark:hover:text-white")}
            >
               <UploadCloud className="w-4 h-4" /> Import CSV
            </button>
            <button
               onClick={() => setMode("ai")}
               className={cn("px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2", mode === "ai" ? "bg-white dark:bg-slate-700 shadow text-amber-500" : "text-slate-500 hover:text-slate-900 dark:hover:text-white")}
            >
               <Sparkles className="w-4 h-4" /> AI Generate
            </button>
         </div>

         {/* Main Content Area */}
         <Card className="border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/20 dark:shadow-none min-h-[500px]">
            <CardContent className="p-8">
               {!selectedChapter && (
                  <div className="flex flex-col items-center justify-center text-center py-20 opacity-60">
                     <BookOpen className="w-16 h-16 mb-4 text-slate-300" />
                     <h3 className="text-xl font-bold">Select a Chapter First</h3>
                     <p className="text-slate-500 max-w-sm">You must select or create a chapter to store questions inside it.</p>
                  </div>
               )}

               {selectedChapter && mode === "manual" && (
                  <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-300">
                     <div className="space-y-4">
                        <Label className="text-sm font-bold">Question Text</Label>
                        <Textarea 
                           value={manualQ.questionText}
                           onChange={e => setManualQ({...manualQ, questionText: e.target.value})}
                           placeholder="Type your question here..." 
                           className="min-h-[120px] rounded-2xl resize-none text-lg border-2 p-4"
                        />
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {['A', 'B', 'C', 'D'].map(opt => (
                           <div key={opt} className="space-y-2 relative">
                              <Label className="text-xs font-bold text-slate-500 ml-1">Option {opt}</Label>
                              <Input 
                                 value={(manualQ as any)[`option${opt}`]}
                                 onChange={e => setManualQ({...manualQ, [`option${opt}`]: e.target.value})}
                                 className="h-12 rounded-xl pr-12" 
                              />
                              <div className={cn("absolute right-2 top-8 w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold cursor-pointer transition-colors", manualQ.correctOption === opt ? "bg-green-500 text-white" : "bg-slate-100 text-slate-400 hover:bg-slate-200 dark:bg-slate-800")}
                                 onClick={() => setManualQ({...manualQ, correctOption: opt})}
                              >
                                 {opt}
                              </div>
                           </div>
                        ))}
                     </div>
                     <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="text-sm text-slate-500">
                           Correct Answer: <strong className="text-green-600 dark:text-green-400">Option {manualQ.correctOption}</strong>
                        </div>
                        <Button onClick={handleSaveManual} disabled={isSavingManual} className="h-12 px-8 rounded-xl font-bold text-base">
                           {isSavingManual ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                           Save Question
                        </Button>
                     </div>
                  </div>
               )}

               {selectedChapter && mode === "csv" && (
                  <div className="flex flex-col items-center justify-center py-12 space-y-8 animate-in fade-in zoom-in-95 duration-300">
                     <div className="w-24 h-24 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500">
                        <UploadCloud className="w-10 h-10" />
                     </div>
                     <div className="text-center space-y-2">
                        <h3 className="text-2xl font-bold">Import Questions via CSV</h3>
                        <p className="text-slate-500 max-w-md mx-auto">Upload a CSV file containing your questions and options. Make sure it follows the standard template format.</p>
                     </div>
                     <div className="flex gap-4">
                        <Button 
                           variant="outline" 
                           onClick={handleDownloadTemplate}
                           className="h-12 rounded-xl font-bold border-2"
                        >
                           Download Template
                        </Button>
                        <div className="relative">
                           <input 
                              type="file" 
                              accept=".csv"
                              onChange={handleFileUpload}
                              disabled={isUploadingCSV}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
                           />
                           <Button disabled={isUploadingCSV} className="h-12 rounded-xl font-bold px-8 pointer-events-none">
                              {isUploadingCSV ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UploadCloud className="w-4 h-4 mr-2" />} 
                              {isUploadingCSV ? "Importing..." : "Upload CSV"}
                           </Button>
                        </div>
                     </div>
                     <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-8">
                        Format: Question Text, Option A, Option B, Option C, Option D, Correct Option (A/B/C/D)
                     </p>
                  </div>
               )}

               {selectedChapter && mode === "ai" && (
                  <div className="flex flex-col items-center justify-center py-12 space-y-6 animate-in fade-in zoom-in-95 duration-300">
                     <div className="w-24 h-24 rounded-[2.5rem] bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-500 animate-pulse">
                        <BrainCircuit className="w-12 h-12" />
                     </div>
                     <div className="text-center space-y-2">
                        <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-500">AI Generator Coming Soon</h3>
                        <p className="text-slate-500 max-w-md mx-auto">We are tuning our GPT-4 Omni engine to perfectly align with your curriculum. You will soon be able to generate entire chapters of questions using your {workspaceTokens} tokens.</p>
                     </div>
                  </div>
               )}
            </CardContent>
         </Card>
      </div>
   );
}
