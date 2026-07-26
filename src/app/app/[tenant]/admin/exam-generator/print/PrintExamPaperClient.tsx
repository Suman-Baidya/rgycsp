"use client";

import { useState, useEffect } from "react";
import { Download, Loader2, FileCheck2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";

export default function PrintExamPaperClient({
  exam,
  workspace,
  showAnswers = false
}: {
  exam: any;
  workspace: any;
  showAnswers?: boolean;
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const filename = `${exam.title.replace(/\s+/g, '_')}_${showAnswers ? 'Answers' : 'Question_Paper'}.pdf`;

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      // Initialize A4 PDF
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

      // Helper function to check page break
      const checkPageBreak = (neededHeight: number) => {
        if (y + neededHeight > pageHeight - margin) {
          doc.addPage();
          y = margin;
          drawWatermark();
        }
      };

      // Helper for watermark
      const drawWatermark = () => {
        // We will just use text as a watermark if logo isn't easily loadable
        doc.setTextColor(230, 235, 245);
        doc.setFontSize(60);
        doc.setFont("helvetica", "bold");
        
        doc.saveGraphicsState();
        doc.setGState(new (doc as any).GState({opacity: 0.3}));
        // Rotate and draw in center
        const watermarkText = workspace?.name?.toUpperCase() || "CONFIDENTIAL EXAM";
        // Just draw it in center roughly
        doc.text(watermarkText, pageWidth / 2, pageHeight / 2, { align: "center", angle: 45 });
        doc.restoreGraphicsState();
      };

      drawWatermark();

      // --- HEADER ---
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text(workspace?.name?.toUpperCase() || "EXAM ZONE", pageWidth / 2, y, { align: "center" });
      y += 10;

      doc.setTextColor(67, 56, 202); // indigo-700
      doc.setFontSize(16);
      doc.text(exam.title.toUpperCase(), pageWidth / 2, y, { align: "center" });
      y += 8;

      if (showAnswers) {
        doc.setTextColor(220, 38, 38); // red-600
        doc.setFontSize(12);
        doc.text("--- OFFICIAL ANSWER KEY ---", pageWidth / 2, y, { align: "center" });
        y += 8;
      }

      // Stats box
      doc.setDrawColor(226, 232, 240); // border-slate-200
      doc.setFillColor(248, 250, 252); // bg-slate-50
      doc.roundedRect(margin, y, contentWidth, 15, 2, 2, "FD");
      
      doc.setTextColor(100, 116, 139); // text-slate-500
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      
      const colWidth = contentWidth / 3;
      doc.text("DURATION", margin + 5, y + 6);
      doc.text("TOTAL MARKS", margin + colWidth + 5, y + 6);
      doc.text("PASSING MARKS", margin + colWidth * 2 + 5, y + 6);

      doc.setTextColor(15, 23, 42); // text-slate-900
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      
      doc.text(`${exam.duration || 60} Mins`, margin + 5, y + 12);
      doc.text(`${exam.questions.length * (exam.marksPerQuestion || 1)}`, margin + colWidth + 5, y + 12);
      doc.text(`${exam.passingMarks || 40}`, margin + colWidth * 2 + 5, y + 12);

      // Lines between columns
      doc.line(margin + colWidth, y, margin + colWidth, y + 15);
      doc.line(margin + colWidth * 2, y, margin + colWidth * 2, y + 15);

      y += 22;

      // Meta info
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Subject: ${exam.course?.title || "General"}`, margin, y);
      doc.text(`Date: ${exam.date ? new Date(exam.date).toLocaleDateString('en-GB') : "N/A"}`, pageWidth - margin, y, { align: "right" });
      y += 6;
      
      doc.line(margin, y, pageWidth - margin, y);
      y += 12;

      // --- QUESTIONS ---
      exam.questions.forEach((q: any, index: number) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);

        const questionLines = doc.splitTextToSize(`${index + 1}. ${q.questionText}`, contentWidth);
        const questionHeight = questionLines.length * 6;
        
        // Options height
        // Estimate height for options
        const optionLinesA = doc.splitTextToSize(`(A) ${q.optionA}`, (contentWidth / 2) - 5);
        const optionLinesB = doc.splitTextToSize(`(B) ${q.optionB}`, (contentWidth / 2) - 5);
        const optionLinesC = doc.splitTextToSize(`(C) ${q.optionC}`, (contentWidth / 2) - 5);
        const optionLinesD = doc.splitTextToSize(`(D) ${q.optionD}`, (contentWidth / 2) - 5);
        
        const optionsHeight = (Math.max(optionLinesA.length, optionLinesB.length) * 5) + 
                              (Math.max(optionLinesC.length, optionLinesD.length) * 5) + 5;
        
        const answerHeight = showAnswers ? 10 : 0;
        const totalBlockHeight = questionHeight + optionsHeight + answerHeight + 10;

        checkPageBreak(totalBlockHeight);

        // Draw Question
        doc.text(questionLines, margin, y);
        y += questionHeight;

        // Draw Options
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);

        const drawOption = (textObj: any[], label: string, isCorrect: boolean, posX: number, posY: number) => {
          if (showAnswers && isCorrect) {
            doc.setFont("helvetica", "bold");
            doc.setTextColor(22, 101, 52); // green-800
          } else {
            doc.setFont("helvetica", "normal");
            doc.setTextColor(51, 65, 85); // slate-700
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
          doc.setFillColor(240, 253, 244); // bg-green-50
          doc.setDrawColor(220, 252, 231); // border-green-200
          doc.roundedRect(margin + 5, y, 60, 8, 1, 1, "FD");
          
          doc.setTextColor(21, 128, 61); // green-700
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.text(`Correct Answer: Option ${q.correctOption}`, margin + 8, y + 5.5);
          y += 8;
        }

        y += 8; // Spacing between questions
      });

      // Add footer to all pages
      const totalPages = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setTextColor(148, 163, 184); // slate-400
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        
        doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
        doc.text(workspace?.name?.toUpperCase() || "RGYCSP EDUCATION", margin, pageHeight - 10);
        doc.text(`PAGE ${i} OF ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: "center" });
        doc.text("EXAM GENERATED BY PORTAL", pageWidth - margin, pageHeight - 10, { align: "right" });
      }

      // Save PDF
      doc.save(filename);
      
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12 flex justify-center items-center font-sans">
      <div className="bg-white max-w-lg w-full p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 text-center relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="relative z-10">
          <div className="w-24 h-24 bg-indigo-50 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-inner border border-indigo-100/50">
            <FileCheck2 className="w-12 h-12 text-indigo-600" />
          </div>
          
          <h1 className="text-3xl font-black text-slate-900 mb-2">Ready to Download</h1>
          <p className="text-slate-500 mb-8 font-medium">Your PDF document is generated as a true vector file. It is fully text-selectable.</p>
          
          <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100 text-left">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Document Name</div>
            <div className="font-bold text-slate-900 truncate mb-4">{filename}</div>
            
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Document Type</div>
            <div className="font-bold text-indigo-700">
              {showAnswers ? "Official Answer Key" : "Student Question Paper"}
            </div>
          </div>

          <Button 
            onClick={generatePDF}
            disabled={!isClient || isGenerating}
            className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-[0_8px_30px_rgb(79,70,229,0.3)] hover:shadow-[0_8px_30px_rgb(79,70,229,0.5)] transition-all duration-300 group overflow-hidden relative text-lg"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out rounded-2xl" />
            <span className="relative z-10 flex items-center justify-center">
              {isGenerating ? (
                <><Loader2 className="w-6 h-6 mr-3 animate-spin" /> Generating True PDF...</>
              ) : (
                <><Download className="w-6 h-6 mr-3 group-hover:-translate-y-1 transition-transform" /> Save PDF File</>
              )}
            </span>
          </Button>

          <button 
            onClick={() => window.close()} 
            className="mt-6 text-slate-400 hover:text-slate-600 font-semibold text-sm transition-colors flex items-center justify-center w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
}
