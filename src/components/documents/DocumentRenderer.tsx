"use client";

import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from "react";
import { getDocumentTemplateByType } from "@/app/actions/document-templates";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
  onReady?: () => void;
}

const DPI = 96;
const MM_PER_INCH = 25.4;

export const DocumentRenderer = forwardRef<DocumentRendererRef, DocumentRendererProps>(
  ({ type, student, examData, workspaceId = null, onReady }, ref) => {
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
          toast.dismiss();
          toast.error("Admit Card template not found! Please ask Super Admin to create one.");
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
      
      switch (varName) {
        // Base Student Fields
        case "studentName": return student.fullName || "";
        case "registrationNo": return student.enrollmentNo || "";
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
        case "examName": return examData?.title || "";
        case "examDate": return examData?.date ? new Date(examData.date).toLocaleDateString('en-GB') : "";
        case "examTime": return examData?.time || "";
        case "examDuration": return examData?.duration ? `${examData.duration} Minutes` : "";
        case "examSyllabus": return examData?.syllabus || "";
        case "examRollNo": return examData?.rollNo || "";
        
        // Marksheet Fields (Fallback to static if not deeply mapped yet)
        case "semesterName": return "Semester 1";
        case "unit1Name": return "Subject 1"; case "unit1Marks": return "";
        case "unit2Name": return "Subject 2"; case "unit2Marks": return "";
        case "unit3Name": return "Subject 3"; case "unit3Marks": return "";
        case "unit4Name": return "Subject 4"; case "unit4Marks": return "";
        case "unit5Name": return "Subject 5"; case "unit5Marks": return "";
        case "unit6Name": return "Subject 6"; case "unit6Marks": return "";
        case "totalMarksObtained": return "";
        case "totalMaxMarks": return "600";
        case "percentage": return "";
        case "grade": return "";
        case "resultStatus": return "";

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
        // Wait for background image if exists
        if (template.background) {
          await Promise.race([
            new Promise((resolve) => {
              const img = new Image();
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

        // Give layout 100ms to stabilize after images load
        await new Promise(r => setTimeout(r, 100));

        const canvas = await html2canvas(canvasRef.current, { 
          scale: 2, 
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        });
        return canvas.toDataURL("image/jpeg", 1.0);
      } catch (err) {
        console.error(err);
        toast.error("Failed to render document image.");
        return null;
      }
    };

    useImperativeHandle(ref, () => ({
      downloadPDF: async () => {
        if (!template) {
          toast.error("No template found to download.");
          return;
        }
        const loadingToast = toast.loading("Generating PDF...");
        const imgData = await generateImage();
        if (!imgData) {
          toast.dismiss(loadingToast);
          return;
        }

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
          toast.error("No template found to preview.");
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
    }));

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
        {/* Hidden Render Canvas */}
        <div style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: -9999 }}>
          <div
            ref={canvasRef}
            style={{
              width: `${template.width}px`,
              height: `${template.height}px`,
              backgroundColor: "#ffffff",
              backgroundImage: template.background ? `url(${template.background})` : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
              position: "relative",
            }}
          >
            {config.map((item: any) => {
              const mappedValue = mapVariable(item.name);
              
              if (item.type === "image" || item.type === "signature") {
                // If there's no photo URL, keep it blank (user feedback)
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
                      objectFit: "cover",
                      borderRadius: item.type === "image" ? "8px" : "0",
                    }}
                    crossOrigin="anonymous"
                  />
                );
              }

              return (
                <div
                  key={item.id}
                  style={{
                    position: "absolute",
                    left: `${item.x}px`,
                    top: `${item.y}px`,
                    fontSize: `${item.fontSize}px`,
                    fontWeight: item.fontWeight,
                    color: item.color,
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.2,
                  }}
                >
                  {mappedValue || " "}
                </div>
              );
            })}
          </div>
        </div>

        {/* Preview Modal */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden rounded-[2rem] p-0 border-2 border-slate-100 dark:border-slate-800">
            <DialogHeader className="p-6 pb-2 shrink-0">
              <DialogTitle className="text-xl font-bold">{type.replace('_', ' ')} Preview</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center">
              {previewDataUrl ? (
                <img src={previewDataUrl} alt="Preview" className="max-w-full h-auto shadow-2xl rounded-lg" />
              ) : (
                <Loader2 className="animate-spin w-8 h-8 text-slate-400" />
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
