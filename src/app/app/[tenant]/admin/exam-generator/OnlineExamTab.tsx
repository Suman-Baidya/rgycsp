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
      <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 mt-4">
        <CardContent className="p-12 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Globe className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">No Online Exams Created</h2>
            <p className="text-xs text-slate-500 max-w-sm">Create an online exam from the Question Papers tab by selecting questions and clicking &quot;Create Exam&quot;.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {localExams.map(exam => (
          <Card key={exam.id} className="group relative flex flex-col border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs hover:shadow-md transition-all">
            <CardHeader className="p-3.5 sm:p-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-start gap-2.5">
                <div className="space-y-0.5 min-w-0 flex-1">
                  <CardTitle className="text-sm font-bold leading-snug text-slate-900 dark:text-white truncate" title={exam.title}>
                    {exam.title}
                  </CardTitle>
                  <p className="text-[11px] text-slate-500 truncate" title={exam.course?.title || "General Exam"}>
                    {exam.course?.title || "General Exam"}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg px-2 py-0.5 border border-slate-200/60 dark:border-slate-700/60">
                    <Switch 
                      checked={exam.isActive} 
                      onCheckedChange={() => handleToggleActive(exam.id, exam.isActive ?? true)}
                      className="scale-75 data-[state=checked]:bg-emerald-600"
                    />
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${exam.isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                      {exam.isActive ? 'Live' : 'Draft'}
                    </span>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger className="h-7 w-7 inline-flex shrink-0 items-center justify-center rounded-lg text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none">
                      <MoreVertical className="h-3.5 w-3.5" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52 rounded-xl shadow-lg border-slate-200 dark:border-slate-800 p-1.5">
                      <DropdownMenuItem className="rounded-lg text-xs font-semibold focus:bg-slate-100 dark:focus:bg-slate-800 transition-colors cursor-pointer py-1.5" onClick={() => handleDownloadPdf(exam.id, false)}>
                        <Download className="h-3.5 w-3.5 mr-2 text-blue-600 dark:text-blue-400" />
                        <span>Download Questions</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="rounded-lg text-xs font-semibold focus:bg-slate-100 dark:focus:bg-slate-800 transition-colors cursor-pointer py-1.5" onClick={() => handleDownloadPdf(exam.id, true)}>
                        <BookOpen className="h-3.5 w-3.5 mr-2 text-emerald-600 dark:text-emerald-400" />
                        <span>Download Answers</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3.5 space-y-3 flex-grow">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 dark:bg-slate-800/40 rounded-lg p-2.5 border border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Clock className="w-3.5 h-3.5"/>
                  </div>
                  <div>
                    <div className="text-[8px] font-bold uppercase tracking-wider text-slate-400">Duration</div>
                    <div className="font-bold text-xs text-slate-800 dark:text-slate-200">{exam.duration || 60}m</div>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/40 rounded-lg p-2.5 border border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <FileText className="w-3.5 h-3.5"/>
                  </div>
                  <div>
                    <div className="text-[8px] font-bold uppercase tracking-wider text-slate-400">Marks/Q</div>
                    <div className="font-bold text-xs text-slate-800 dark:text-slate-200">{exam.marksPerQuestion || 2}</div>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/40 rounded-lg p-2.5 border border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5"/>
                  </div>
                  <div>
                    <div className="text-[8px] font-bold uppercase tracking-wider text-slate-400">Passing</div>
                    <div className="font-bold text-xs text-slate-800 dark:text-slate-200">{exam.passingMarks || 40}</div>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/40 rounded-lg p-2.5 border border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Globe className="w-3.5 h-3.5"/>
                  </div>
                  <div>
                    <div className="text-[8px] font-bold uppercase tracking-wider text-slate-400">Questions</div>
                    <div className="font-bold text-xs text-slate-800 dark:text-slate-200">{exam.questions?.length || 0} Qs</div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-3.5 pt-0">
              <Link 
                href={getTenantLink(`/admin/exam-generator/${exam.id}`, workspaceId, pathname)}
                className="inline-flex justify-center items-center w-full h-8 sm:h-9 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold shadow-xs transition-colors"
              >
                <Eye className="w-3.5 h-3.5 mr-1.5" /> 
                View Merit & Submissions
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
