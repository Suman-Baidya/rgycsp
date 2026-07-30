"use client";

import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from "react";
import { createPortal } from "react-dom";
import { getDocumentTemplateByType } from "@/app/actions/document-templates";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QRCodeCanvas } from "qrcode.react";

export interface DocumentRendererRef {
  downloadPDF: () => Promise<void>;
  preview: () => Promise<void>;
  hasTemplate: () => boolean;
  getImgData: () => Promise<string | null>;
  getTemplateDimensions: () => { width: number; height: number; orientation: "portrait" | "landscape" } | null;
}

interface DocumentRendererProps {
  type: string;
  student: any;
  examData?: any;
  workspaceId?: string | null;
  semesterNumber?: number;
  onReady?: () => void;
}

const DPI = 96;
const MM_PER_INCH = 25.4;

export const DocumentRenderer = forwardRef<DocumentRendererRef, DocumentRendererProps>(
  ({ type, student, examData, workspaceId = null, semesterNumber, onReady }, ref) => {
    const [template, setTemplate] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
    const canvasRef = useRef<HTMLDivElement>(null);
    const hasCalledOnReady = useRef(false);
    // Keep a stable ref of onReady
    const onReadyRef = useRef(onReady);
    useEffect(() => {
      onReadyRef.current = onReady;
    }, [onReady]);

    useEffect(() => {
      if (!isLoading) {
        if (!template) {
          if (onReadyRef.current && !hasCalledOnReady.current) {
            hasCalledOnReady.current = true;
            onReadyRef.current();
          }
        } else if (onReadyRef.current && !hasCalledOnReady.current) {
          hasCalledOnReady.current = true;
          // Use a small timeout to let the DOM paint, but DO NOT cancel it if dependencies change
          setTimeout(() => {
            if (onReadyRef.current) onReadyRef.current();
          }, 150);
        }
      }
    }, [isLoading, template]);

    useEffect(() => {
      const fetchTemplate = async () => {
        setIsLoading(true);
        hasCalledOnReady.current = false;
        const data = await getDocumentTemplateByType(type, workspaceId);
        if (data) {
          setTemplate(data);
        }
        setIsLoading(false);
      };
      fetchTemplate();
    }, [type, workspaceId]);

    // Data Mapping Logic
    const mapVariable = (varName: string) => {
      if (!student) return "";
      
      const getActiveExam = () => {
        if (examData) return examData;
        if (!student?.examEnrollments?.length) return null;
        
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        
        const activeEnrollments = student.examEnrollments.filter((enrollment: any) => {
          const exam = enrollment.shift?.exam;
          if (!exam) return false;
          
          const isAutoCompleted = exam.date && new Date(exam.date) < now && !exam.forceUncomplete;
          const isCompleted = exam.isCompleted || isAutoCompleted;
          
          return !isCompleted;
        });
        
        if (activeEnrollments.length === 0) return null;
        
        activeEnrollments.sort((a: any, b: any) => {
          if (!a.shift.exam.date) return 1;
          if (!b.shift.exam.date) return -1;
          return new Date(a.shift.exam.date).getTime() - new Date(b.shift.exam.date).getTime();
        });
        
        const closest = activeEnrollments[0];
        return {
          title: closest.shift.exam.title,
          date: closest.shift.exam.date,
          time: (closest.shift.startTime && closest.shift.endTime) ? `${closest.shift.startTime} - ${closest.shift.endTime}` : (closest.shift.startTime || ""),
          duration: closest.shift.exam.duration,
          syllabus: closest.shift.exam.syllabus,
          rollNo: closest.rollNo
        };
      };
      const activeExam = getActiveExam();

      switch (varName) {
        // Base Student Fields
        case "studentName": return student.fullName || "";
        case "enrollmentNo": return student.enrollmentNo || "";
        case "registrationNo": return student.registrationNo || "";
        case "certificateNo": return student.certificateNo || "";
        case "marksheetNo": return student.marksheetNo || "";
        case "dob": return student.dob ? new Date(student.dob).toLocaleDateString('en-GB') : "";
        case "gender": return student.gender || "";
        case "bloodGroup": return student.bloodGroup || "";
        case "phone": return student.phone || "";
        case "email": return student.email || "";
        case "fatherName": return student.fatherName || "";
        case "motherName": return student.motherName || "";
        case "address": 
          if (student.address) {
            try {
              const a = JSON.parse(student.address);
              return `${a.vill ? a.vill + ", " : ""}${a.po ? "PO: " + a.po + ", " : ""}${a.ps ? "PS: " + a.ps + ", " : ""}${a.dist ? "Dist: " + a.dist + ", " : ""}${a.state ? a.state + " - " : ""}${a.pin || ""}`;
            } catch (e) { return student.address; }
          }
          return "";
          
        // Course & Batch Fields
        case "courseName": return student.course?.title || "";
        case "courseCode": return student.course?.code || "";
        case "courseDuration": return student.course?.duration ? `${student.course.duration} Months` : "";
        case "batchName": return student.batch?.name || "";
        case "batchTime": return student.batch?.timing || "";
        
        // Franchise Fields
        case "franchiseName": return student.workspace?.name || "Super Admin";
        case "franchiseCode": return student.workspace?.subdomain || "";
        case "franchiseAddress": return student.workspace?.address || "";
        case "franchisePhone": return student.workspace?.phone || "";
        case "franchiseEmail": return student.workspace?.email || "";
        case "franchiseOwnerName": return student.workspace?.ownerName || "";
        
        // Image & Signature Fields (return URL or empty string for blank)
        case "studentPhoto": return student.photoUrl || student.admissionApp?.photoUrl || "";
        case "studentSign": return student.signatureUrl || student.admissionApp?.signatureUrl || "";
        case "principalSign": return "/placeholder-signature.png"; // Replace with global setting
        case "centerHeadSign": return student.workspace?.signatureUrl || "";
        case "franchiseOwnerPhoto": return student.workspace?.ownerPhotoUrl || "";
        case "franchiseOwnerSign": return student.workspace?.ownerSignatureUrl || "";
        case "staffPhoto": return ""; // Staff context specific
        case "staffSign": return ""; // Staff context specific

        // System & Notice
        case "issueDate": return new Date().toLocaleDateString('en-GB');
        case "validUntil": 
          const valid = new Date();
          valid.setFullYear(valid.getFullYear() + 1);
          return valid.toLocaleDateString('en-GB');
        case "noticeDate": return new Date().toLocaleDateString('en-GB');
        case "noticeTitle": return "";
        case "noticeBody": return "";
        
        // Exam Fields
        case "examName": return activeExam?.title || "";
        case "examDate": return activeExam?.date ? new Date(activeExam.date).toLocaleDateString('en-GB') : "";
        case "examTime": return activeExam?.time || "";
        case "examDuration": return activeExam?.duration ? `${activeExam.duration} Minutes` : "";
        case "examSyllabus": return activeExam?.syllabus || "";
        case "examRollNo": return activeExam?.rollNo || "";
        
        // Marksheet Fields (Fallback to static if not deeply mapped yet)
        // Marksheet Fields
        case "semesterName": {
          const activeSem = semesterNumber ? student?.semesters?.find((s:any) => s.semesterNumber === semesterNumber) : ((student?.semesters && student.semesters.length > 0) ? student.semesters[0] : null);
          if (!activeSem) return "";
          const roman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
          const numStr = roman[activeSem.semesterNumber - 1] || activeSem.semesterNumber.toString();
          return `SEMESTER - ${numStr}`;
        }
        case "unit1Name": return "Subject 1"; case "unit1Marks": return "";
        case "unit2Name": return "Subject 2"; case "unit2Marks": return "";
        case "unit3Name": return "Subject 3"; case "unit3Marks": return "";
        case "unit4Name": return "Subject 4"; case "unit4Marks": return "";
        case "unit5Name": return "Subject 5"; case "unit5Marks": return "";
        case "unit6Name": return "Subject 6"; case "unit6Marks": return "";
        
        // Multi-line Dynamic Marksheet Fields
        case "marksheet_subjects": {
          const activeSem = semesterNumber ? student?.semesters?.find((s:any) => s.semesterNumber === semesterNumber) : ((student?.semesters && student.semesters.length > 0) ? student.semesters[0] : null);
          if (activeSem?.marks) return activeSem.marks.map((m: any) => m.unitName).join("\n");
          return "Subject 1\nSubject 2\nSubject 3";
        }
        case "marksheet_max_marks": {
          const activeSem = semesterNumber ? student?.semesters?.find((s:any) => s.semesterNumber === semesterNumber) : ((student?.semesters && student.semesters.length > 0) ? student.semesters[0] : null);
          if (activeSem?.marks) return activeSem.marks.map((m: any) => m.maxMarks || 100).join("\n");
          return "100\n100\n100";
        }
        case "marksheet_obtained_marks": {
          const activeSem = semesterNumber ? student?.semesters?.find((s:any) => s.semesterNumber === semesterNumber) : ((student?.semesters && student.semesters.length > 0) ? student.semesters[0] : null);
          if (activeSem?.marks) return activeSem.marks.map((m: any) => m.marksObtained).join("\n");
          return "0\n0\n0";
        }
        
        case "totalMarksObtained": {
          const activeSem = semesterNumber ? student?.semesters?.find((s:any) => s.semesterNumber === semesterNumber) : ((student?.semesters && student.semesters.length > 0) ? student.semesters[0] : null);
          return activeSem ? `${activeSem.totalMarks}` : "";
        }
        case "totalMaxMarks": {
          const activeSem = semesterNumber ? student?.semesters?.find((s:any) => s.semesterNumber === semesterNumber) : ((student?.semesters && student.semesters.length > 0) ? student.semesters[0] : null);
          return activeSem?.marks ? `${activeSem.marks.reduce((sum: number, m: any) => sum + (m.maxMarks || 100), 0)}` : "600";
        }
        case "totalSemesterMarks": {
          const activeSem = semesterNumber ? student?.semesters?.find((s:any) => s.semesterNumber === semesterNumber) : ((student?.semesters && student.semesters.length > 0) ? student.semesters[0] : null);
          if (!activeSem) return "";
          const max = activeSem.marks ? activeSem.marks.reduce((sum: number, m: any) => sum + (m.maxMarks || 100), 0) : 600;
          return `${activeSem.totalMarks}/${max}`;
        }
        case "percentage": {
          const activeSem = semesterNumber ? student?.semesters?.find((s:any) => s.semesterNumber === semesterNumber) : ((student?.semesters && student.semesters.length > 0) ? student.semesters[0] : null);
          return activeSem ? `${activeSem.percentage}` : "";
        }
        case "grade": {
          const activeSem = semesterNumber ? student?.semesters?.find((s:any) => s.semesterNumber === semesterNumber) : ((student?.semesters && student.semesters.length > 0) ? student.semesters[0] : null);
          return activeSem ? `${activeSem.grade}` : "";
        }
        case "resultStatus": {
          const activeSem = semesterNumber ? student?.semesters?.find((s:any) => s.semesterNumber === semesterNumber) : ((student?.semesters && student.semesters.length > 0) ? student.semesters[0] : null);
          return activeSem ? `${activeSem.status}` : "";
        }
        
        // Cumulative Fields
        case "grandTotalMarks":
        case "grandPercentage":
        case "grandGrade":
        case "division": {
          const activeSem = semesterNumber ? student?.semesters?.find((s:any) => s.semesterNumber === semesterNumber) : ((student?.semesters && student.semesters.length > 0) ? student.semesters[0] : null);
          if (!activeSem || !student?.semesters) return "";
          
          const previousSems = student.semesters.filter((s: any) => s.semesterNumber <= activeSem.semesterNumber);
          let grandObtained = 0;
          let grandMax = 0;
          
          previousSems.forEach((sem: any) => {
            grandObtained += sem.totalMarks || 0;
            if (sem.marks && sem.marks.length > 0) {
              grandMax += sem.marks.reduce((sum: number, m: any) => sum + (m.maxMarks || 100), 0);
            } else {
              grandMax += 600;
            }
          });
          
          const grandPercentRaw = grandMax > 0 ? (grandObtained / grandMax) * 100 : 0;
          const grandPercentStr = grandPercentRaw.toFixed(2) + "%";
          
          let grandGrade = "FAIL";
          if (grandPercentRaw >= 80) grandGrade = "A+";
          else if (grandPercentRaw >= 70) grandGrade = "A";
          else if (grandPercentRaw >= 60) grandGrade = "B+";
          else if (grandPercentRaw >= 50) grandGrade = "B";
          else if (grandPercentRaw >= 40) grandGrade = "C";

          let divisionStr = "Fail";
          if (grandPercentRaw >= 60) divisionStr = "1st Division";
          else if (grandPercentRaw >= 50) divisionStr = "2nd Division";
          else if (grandPercentRaw >= 40) divisionStr = "3rd Division";

          if (varName === "grandTotalMarks") return `${grandObtained}/${grandMax}`;
          if (varName === "grandPercentage") return grandPercentStr;
          if (varName === "grandGrade") return grandGrade;
          if (varName === "division") return divisionStr;
          return "";
        }

        // Staff specific
        case "staffName": return "";
        case "staffId": return "";
        case "staffRole": return "";
        case "staffPhone": return "";

        default: return "";
      }
    };

    const generateImage = async (): Promise<string | null> => {
      if (!canvasRef.current || !template) return null;
      try {
        // Wait for React to render the DOM and apply styles
        await new Promise(resolve => setTimeout(resolve, 500));

        // Wait for background image if exists
        if (template.background) {
          await Promise.race([
            new Promise((resolve) => {
              const img = new Image();
              img.crossOrigin = "anonymous";
              img.onload = resolve;
              img.onerror = resolve;
              img.src = template.background;
            }),
            new Promise((resolve) => setTimeout(resolve, 2000))
          ]);
        }

        // Ensure all child images are loaded
        const images = canvasRef.current.querySelectorAll("img");
        await Promise.all(Array.from(images).map(img => {
          if (img.complete) return Promise.resolve();
          return Promise.race([
            new Promise((resolve) => {
              img.onload = resolve;
              img.onerror = resolve;
            }),
            new Promise((resolve) => setTimeout(resolve, 2000))
          ]);
        }));

        // Ensure fonts are fully loaded before capture to prevent baseline shifts
        if (document.fonts) {
          await document.fonts.ready;
        }

        const { toJpeg } = await import("html-to-image");
        const imgData = await toJpeg(canvasRef.current, { 
          quality: 1.0,
          pixelRatio: 4,
          backgroundColor: '#ffffff'
        });
        return imgData;
      } catch (err) {
        console.error(err);
        toast.error("Failed to render document image.");
        return null;
      }
    };

    useImperativeHandle(ref, () => {
      const formatType = (t: string) => t.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
      
      return {
      downloadPDF: async () => {
        if (!template) {
          toast.error(`${formatType(type)} template not found! Please ask Super Admin to create one.`);
          return;
        }
        const loadingToast = toast.loading("Generating PDF...");
        const imgData = await generateImage();
        if (!imgData) {
          toast.dismiss(loadingToast);
          return;
        }

        const { jsPDF } = await import("jspdf");
        const pdf = new jsPDF({
          orientation: template.width > template.height ? "landscape" : "portrait",
          unit: "px",
          format: [template.width, template.height]
        });
        pdf.addImage(imgData, "JPEG", 0, 0, template.width, template.height);
        pdf.save(`${student?.fullName || "Student"}_${type}.pdf`);
        toast.success("PDF Downloaded successfully", { id: loadingToast });
      },
      preview: async () => {
        if (!template) {
          toast.error(`${formatType(type)} template not found! Please ask Super Admin to create one.`);
          return;
        }
        const loadingToast = toast.loading("Generating Preview...");
        const imgData = await generateImage();
        if (imgData) {
          setPreviewDataUrl(imgData);
          setPreviewOpen(true);
          toast.success("Preview generated", { id: loadingToast });
        } else {
          toast.dismiss(loadingToast);
        }
      },
      getImgData: async () => {
        return await generateImage();
      },
      getTemplateDimensions: () => {
        if (!template) return null;
        return {
          width: template.width,
          height: template.height,
          orientation: template.width > template.height ? "landscape" : "portrait"
        };
      },
      hasTemplate: () => !!template
    };
  });

    if (isLoading) {
      return (
        <div className="hidden">
          <Loader2 className="animate-spin" />
        </div>
      );
    }

    if (!template) {
      return null;
    }

    const config = (typeof template.config === "string" ? JSON.parse(template.config) : template.config) || [];

    return (
      <>
        {/* Hidden Render Canvas Portaled to body to avoid affecting modal scroll */}
        {typeof document !== 'undefined' && createPortal(
          <div className="font-sans" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: -9999 }}>
            <style dangerouslySetInnerHTML={{ __html: `@import url('https://fonts.googleapis.com/css2?family=Charm:wght@400;700&family=Inter:wght@400;700;900&family=Montserrat:wght@400;700;900&family=Open+Sans:wght@400;700;800&family=Oswald:wght@400;700&family=Pacifico&family=Playfair+Display:wght@400;700;900&family=Roboto:wght@400;700;900&display=swap');` }} />
            <div style={{ width: `${template.width}px`, height: `${template.height}px` }}>
              <div
                ref={canvasRef}
                className="relative bg-white overflow-hidden w-full h-full"
              >
                {template.background && (
                  <img src={template.background} crossOrigin="anonymous" alt="BG" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
                )}
                {config.map((item: any) => {
                  if (item.type === "qrcode") {
                    const parseQrContent = (template: string = "") => {
                      return template.replace(/\{(\w+)\}/g, (_: string, key: string) => {
                        return mapVariable(key) || "";
                      });
                    };
                    
                    return (
                      <div
                        key={item.id}
                        style={{
                          position: "absolute",
                          left: `${item.x}px`,
                          top: `${item.y}px`,
                          width: `${item.width}px`,
                          height: `${item.height}px`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden"
                        }}
                      >
                        <QRCodeCanvas
                          value={parseQrContent(item.qrContentTemplate)}
                          size={Math.min(item.width || 100, item.height || 100)}
                          level="H"
                          includeMargin={false}
                        />
                      </div>
                    );
                  }

                  const mappedValue = mapVariable(item.name);
                  
                  if (item.type === "image" || item.type === "signature") {
                    if (!mappedValue) return null;
                    return (
                      <img
                        key={item.id}
                        src={mappedValue}
                        alt={item.name}
                        style={{
                          position: "absolute",
                          left: `${item.x}px`,
                          top: `${item.y}px`,
                          width: `${item.width}px`,
                          height: `${item.height}px`,
                          objectFit: item.objectFit || "fill",
                          borderRadius: item.borderRadius !== undefined ? `${item.borderRadius}px` : "0",
                        }}
                        crossOrigin="anonymous"
                      />
                    );
                  }

                  let displayValue = mappedValue;
                  if (item.type === "text") {
                    const templateStr = item.textContent !== undefined ? item.textContent : `{${item.name}}`;
                    displayValue = templateStr.replace(/\{(\w+)\}/g, (_: string, key: string) => {
                      return mapVariable(key) || "";
                    });
                  }

                  return (
                    <div
                      key={item.id}
                      style={{
                        position: "absolute",
                        left: `${item.x}px`,
                        top: `${item.y}px`,
                        transform: (!item.width && item.type === "text") 
                          ? (item.textAlign === "center" ? "translateX(-50%)" : item.textAlign === "right" ? "translateX(-100%)" : "none")
                          : "none",
                      }}
                    >
                      <span 
                        style={{
                          fontSize: `${item.fontSize}px`,
                          fontWeight: item.fontWeight,
                          fontFamily: item.fontFamily || "Inter",
                          color: item.color,
                          whiteSpace: item.width ? "pre-wrap" : "pre",
                          width: item.width ? `${item.width}px` : "auto",
                          display: "block",
                          textAlign: item.textAlign || "left",
                          lineHeight: item.lineHeight || 1,
                          margin: 0,
                          padding: 0
                        }}
                        dangerouslySetInnerHTML={{ __html: displayValue || " " }}
                      />
                    </div>
                  );
                })}
          </div>
        </div>
      </div>, document.body)}

      {/* Preview Modal */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden rounded-[2rem] p-0 border-2 border-slate-100 dark:border-slate-800">
            <DialogHeader className="p-6 pb-2 shrink-0">
              <DialogTitle className="text-xl font-bold">{type.replace('_', ' ')} Preview</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-900/50 text-center">
              {previewDataUrl ? (
                <img src={previewDataUrl} alt="Preview" className="max-w-full h-auto shadow-2xl rounded-lg mx-auto" />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="animate-spin w-8 h-8 text-slate-400" />
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <Button onClick={() => setPreviewOpen(false)} variant="outline" className="rounded-xl">Close</Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }
);
DocumentRenderer.displayName = "DocumentRenderer";
