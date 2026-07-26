"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Globe, Clock, FileText, CheckCircle2, Download, MoreVertical, Eye, FileQuestion, BookOpen } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { toggleExamActiveStatus, getExamForPdf } from "@/app/actions/exam";
import { toast } from "sonner";
import Link from "next/link";
import { getTenantLink } from "@/lib/routing";
import { usePathname } from "next/navigation";

export default function OnlineExamTab({ exams = [], workspaceId }: { exams?: any[], workspaceId: string }) {
  const pathname = usePathname();
  const [localExams, setLocalExams] = useState(exams);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    // Optimistic update
    setLocalExams(prev => prev.map(e => e.id === id ? { ...e, isActive: !currentStatus } : e));
    try {
      const res = await toggleExamActiveStatus(id, !currentStatus);
      if (res.success) {
        toast.success(`Exam marked as ${!currentStatus ? 'Active' : 'Inactive'}`);
      } else {
        toast.error(res.error || "Failed to update exam");
        // Revert
        setLocalExams(prev => prev.map(e => e.id === id ? { ...e, isActive: currentStatus } : e));
      }
    } catch (e: any) {
      toast.error(e.message || "An error occurred");
      setLocalExams(prev => prev.map(e => e.id === id ? { ...e, isActive: currentStatus } : e));
    }
  };

  const handleDownloadPdf = async (examId: string, showAnswers: boolean = false) => {
    const loadingToast = toast.loading(`Generating ${showAnswers ? "Answers" : "Question"} PDF...`);
    try {
      const res = await getExamForPdf(examId);
      if (!res.success || !res.data) {
        toast.error(res.error || "Failed to fetch exam data", { id: loadingToast });
        return;
      }

      const { exam, workspace } = res.data;
      const { default: jsPDF } = await import("jspdf");

      const filename = `${exam.title.replace(/\s+/g, '_')}_${showAnswers ? 'Answers' : 'Question_Paper'}.pdf`;

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      const checkPageBreak = (neededHeight: number) => {
        if (y + neededHeight > pageHeight - margin) {
          doc.addPage();
          y = margin;
          drawWatermark();
        }
      };

      const drawWatermark = () => {
        doc.saveGraphicsState();
        doc.setGState(new (doc as any).GState({opacity: 0.15}));
        doc.setTextColor(230, 235, 245);
        doc.setFontSize(60);
        doc.setFont("helvetica", "bold");
        doc.text("RGYCSP", pageWidth / 2, pageHeight / 2, { align: "center", angle: 45 });
        doc.restoreGraphicsState();
      };

      drawWatermark();

      // No top header as requested

      doc.setTextColor(67, 56, 202);
      doc.setFontSize(16);
      doc.text(exam.title.toUpperCase(), pageWidth / 2, y, { align: "center" });
      y += 8;

      if (showAnswers) {
        doc.setTextColor(220, 38, 38);
        doc.setFontSize(12);
        doc.text("--- OFFICIAL ANSWER KEY ---", pageWidth / 2, y, { align: "center" });
        y += 8;
      }

      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, y, contentWidth, 15, 2, 2, "FD");
      
      doc.setTextColor(100, 116, 139);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      
      const colWidth = contentWidth / 3;
      doc.text("DURATION", margin + 5, y + 6);
      doc.text("TOTAL MARKS", margin + colWidth + 5, y + 6);
      doc.text("PASSING MARKS", margin + colWidth * 2 + 5, y + 6);

      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      
      doc.text(`${exam.duration || 60} Mins`, margin + 5, y + 12);
      doc.text(`${exam.questions.length * (exam.marksPerQuestion || 1)}`, margin + colWidth + 5, y + 12);
      doc.text(`${exam.passingMarks || 40}`, margin + colWidth * 2 + 5, y + 12);

      doc.line(margin + colWidth, y, margin + colWidth, y + 15);
      doc.line(margin + colWidth * 2, y, margin + colWidth * 2, y + 15);
      y += 22;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Subject: ${exam.course?.title || "General"}`, margin, y);
      doc.text(`Date: ${exam.date ? new Date(exam.date).toLocaleDateString('en-GB') : "N/A"}`, pageWidth - margin, y, { align: "right" });
      y += 6;
      doc.line(margin, y, pageWidth - margin, y);
      y += 12;

      exam.questions.forEach((q: any, index: number) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);

        const questionLines = doc.splitTextToSize(`${index + 1}. ${q.questionText}`, contentWidth);
        const questionHeight = questionLines.length * 6;
        
        const optionLinesA = doc.splitTextToSize(`(A) ${q.optionA}`, (contentWidth / 2) - 5);
        const optionLinesB = doc.splitTextToSize(`(B) ${q.optionB}`, (contentWidth / 2) - 5);
        const optionLinesC = doc.splitTextToSize(`(C) ${q.optionC}`, (contentWidth / 2) - 5);
        const optionLinesD = doc.splitTextToSize(`(D) ${q.optionD}`, (contentWidth / 2) - 5);
        
        const optionsHeight = (Math.max(optionLinesA.length, optionLinesB.length) * 5) + 
                              (Math.max(optionLinesC.length, optionLinesD.length) * 5) + 5;
        
        const answerHeight = showAnswers ? 10 : 0;
        const totalBlockHeight = questionHeight + optionsHeight + answerHeight + 10;

        checkPageBreak(totalBlockHeight);

        doc.text(questionLines, margin, y);
        y += questionHeight;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);

        const drawOption = (textObj: any[], label: string, isCorrect: boolean, posX: number, posY: number) => {
          if (showAnswers && isCorrect) {
            doc.setFont("helvetica", "bold");
            doc.setTextColor(22, 101, 52);
          } else {
            doc.setFont("helvetica", "normal");
            doc.setTextColor(51, 65, 85);
          }
          doc.text(textObj, posX, posY);
        };

        const halfWidth = contentWidth / 2;
        let optY = y;
        
        drawOption(optionLinesA, 'A', q.correctOption === 'A', margin + 5, optY);
        drawOption(optionLinesB, 'B', q.correctOption === 'B', margin + 5 + halfWidth, optY);
        optY += Math.max(optionLinesA.length, optionLinesB.length) * 5;
        
        drawOption(optionLinesC, 'C', q.correctOption === 'C', margin + 5, optY);
        drawOption(optionLinesD, 'D', q.correctOption === 'D', margin + 5 + halfWidth, optY);
        optY += Math.max(optionLinesC.length, optionLinesD.length) * 5;
        y = optY;

        if (showAnswers) {
          y += 2;
          doc.setFillColor(240, 253, 244);
          doc.setDrawColor(220, 252, 231);
          doc.roundedRect(margin + 5, y, 60, 8, 1, 1, "FD");
          doc.setTextColor(21, 128, 61);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.text(`Correct Answer: Option ${q.correctOption}`, margin + 8, y + 5.5);
          y += 8;
        }
        y += 8;
      });

      const totalPages = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setTextColor(148, 163, 184);
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
        doc.text(workspace?.name?.toUpperCase() || "RGYCSP EDUCATION", margin, pageHeight - 10);
        doc.text(`PAGE ${i} OF ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: "center" });
        doc.text("EXAM GENERATED BY PORTAL", pageWidth - margin, pageHeight - 10, { align: "right" });
      }

      doc.save(filename);
      toast.success("PDF Downloaded Successfully", { id: loadingToast });
      
    } catch (error: any) {
      console.error(error);
      toast.error("An error occurred generating PDF", { id: loadingToast });
    }
  };

  if (localExams.length === 0) {
    return (
      <Card className="border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900 mt-6">
        <CardContent className="p-24 flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Globe className="w-12 h-12" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold">No Online Exams</h2>
            <p className="text-slate-500 max-w-md mx-auto">Create an online exam from the Question Papers tab by selecting your questions.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mt-8 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {localExams.map(exam => (
          <Card key={exam.id} className="group relative flex flex-col border border-slate-200/50 dark:border-slate-800/50 rounded-[2rem] overflow-hidden bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            {/* Gradient accent top border */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-80 group-hover:opacity-100 transition-opacity" />
            
            <CardHeader className="relative p-6 pb-4 border-b border-slate-100/50 dark:border-slate-800/50 z-10">
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-black leading-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {exam.title}
                  </CardTitle>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                    {exam.course?.title || "General Exam"}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="h-8 w-8 inline-flex shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-indigo-100 hover:text-indigo-600 dark:hover:bg-indigo-500/20 dark:hover:text-indigo-300 transition-colors focus-visible:outline-none">
                      <MoreVertical className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-2xl shadow-xl border-slate-200/50 dark:border-slate-800/50 p-2">
                      <DropdownMenuItem className="rounded-xl focus:bg-indigo-50 dark:focus:bg-indigo-500/10 transition-colors cursor-pointer" onClick={() => handleDownloadPdf(exam.id, false)}>
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center mr-3 text-indigo-600 dark:text-indigo-400">
                          <Download className="h-4 w-4" />
                        </div>
                        <span className="font-semibold">Download Questions</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="rounded-xl focus:bg-pink-50 dark:focus:bg-pink-500/10 transition-colors cursor-pointer mt-1" onClick={() => handleDownloadPdf(exam.id, true)}>
                        <div className="w-8 h-8 rounded-lg bg-pink-100 dark:bg-pink-500/20 flex items-center justify-center mr-3 text-pink-600 dark:text-pink-400">
                          <BookOpen className="h-4 w-4" />
                        </div>
                        <span className="font-semibold">Download Answers</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 rounded-full px-1 py-1 pr-3 border border-slate-100 dark:border-slate-800">
                    <Switch 
                      checked={exam.isActive} 
                      onCheckedChange={() => handleToggleActive(exam.id, exam.isActive ?? true)}
                      className="scale-75 data-[state=checked]:bg-green-500"
                    />
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${exam.isActive ? 'text-green-600 dark:text-green-400' : 'text-slate-400'}`}>
                      {exam.isActive ? 'Live' : 'Draft'}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative p-6 space-y-6 flex-grow z-10">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50/80 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex items-center gap-3 transition-colors group-hover:bg-indigo-50/50 dark:group-hover:bg-indigo-900/20 group-hover:border-indigo-100 dark:group-hover:border-indigo-800/50">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Clock className="w-5 h-5"/>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Duration</div>
                    <div className="font-black text-slate-900 dark:text-white leading-tight">{exam.duration || 60}m</div>
                  </div>
                </div>
                <div className="bg-slate-50/80 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex items-center gap-3 transition-colors group-hover:bg-purple-50/50 dark:group-hover:bg-purple-900/20 group-hover:border-purple-100 dark:group-hover:border-purple-800/50">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                    <FileText className="w-5 h-5"/>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Marks/Q</div>
                    <div className="font-black text-slate-900 dark:text-white leading-tight">{exam.marksPerQuestion || 2}</div>
                  </div>
                </div>
                <div className="bg-slate-50/80 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex items-center gap-3 transition-colors group-hover:bg-emerald-50/50 dark:group-hover:bg-emerald-900/20 group-hover:border-emerald-100 dark:group-hover:border-emerald-800/50">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-5 h-5"/>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Passing</div>
                    <div className="font-black text-slate-900 dark:text-white leading-tight">{exam.passingMarks || 40}</div>
                  </div>
                </div>
                <div className="bg-slate-50/80 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex items-center gap-3 transition-colors group-hover:bg-pink-50/50 dark:group-hover:bg-pink-900/20 group-hover:border-pink-100 dark:group-hover:border-pink-800/50">
                  <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 dark:text-pink-400">
                    <Globe className="w-5 h-5"/>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Created</div>
                    <div className="font-black text-slate-900 dark:text-white leading-tight text-sm">{new Date(exam.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="relative p-6 pt-0 z-10">
              <Link 
                href={getTenantLink(`/admin/exam-generator/${exam.id}`, workspaceId, pathname)}
                className="inline-flex justify-center items-center w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all duration-300 group/btn overflow-hidden relative"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Eye className="w-5 h-5 group-hover/btn:scale-110 transition-transform" /> 
                  View Details & Merit List
                </span>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
