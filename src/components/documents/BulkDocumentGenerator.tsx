"use client";

import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2, Download, FileText, Printer, Award, CreditCard, User, Layers } from "lucide-react";
import { DocumentRenderer, DocumentRendererRef } from "./DocumentRenderer";
import { jsPDF } from "jspdf";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface BulkDocumentGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedStudentIds: string[];
  students: any[];
}

const DOCUMENT_TYPES = [
  { id: 'CERTIFICATE', label: 'Certificates', icon: Award, color: 'text-amber-500', bg: 'bg-amber-500/10', ring: 'ring-amber-500/50', activeBg: 'bg-amber-500/5' },
  { id: 'MARKSHEET', label: 'Marksheets', icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10', ring: 'ring-blue-500/50', activeBg: 'bg-blue-500/5' },
  { id: 'ADMIT_CARD', label: 'Admit Cards', icon: User, color: 'text-emerald-500', bg: 'bg-emerald-500/10', ring: 'ring-emerald-500/50', activeBg: 'bg-emerald-500/5' },
  { id: 'STUDENT_ID', label: 'ID Cards', icon: CreditCard, color: 'text-purple-500', bg: 'bg-purple-500/10', ring: 'ring-purple-500/50', activeBg: 'bg-purple-500/5' }
];

export function BulkDocumentGenerator({ open, onOpenChange, selectedStudentIds, students }: BulkDocumentGeneratorProps) {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // State machine for generation
  const [currentDocTypeIndex, setCurrentDocTypeIndex] = useState(-1);
  const [currentStudentIndex, setCurrentStudentIndex] = useState(-1);
  const [progress, setProgress] = useState({ current: 0, total: 0, text: "" });
  const [printMode, setPrintMode] = useState(false);
  
  const rendererRef = useRef<DocumentRendererRef>(null);
  const pdfRef = useRef<jsPDF | null>(null);
  const documentsOnCurrentPage = useRef(0);

  const selectedStudents = students.filter(s => selectedStudentIds.includes(s.id));

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedTypes([]);
      setIsGenerating(false);
      setCurrentDocTypeIndex(-1);
      setCurrentStudentIndex(-1);
      pdfRef.current = null;
    }
  }, [open]);

  const handleStartGeneration = () => {
    if (selectedTypes.length === 0) {
      toast.error("Please select at least one document type.");
      return;
    }
    setIsGenerating(true);
    setCurrentDocTypeIndex(0);
    setCurrentStudentIndex(0);
    documentsOnCurrentPage.current = 0;
    setProgress({ current: 0, total: selectedStudents.length, text: `Initializing...` });
  };

  // State machine effect
  useEffect(() => {
    if (!isGenerating || currentDocTypeIndex < 0 || currentDocTypeIndex >= selectedTypes.length) return;
    
    // We are currently processing selectedTypes[currentDocTypeIndex]
    const docType = selectedTypes[currentDocTypeIndex];
    const docLabel = DOCUMENT_TYPES.find(d => d.id === docType)?.label || docType;
    
    if (currentStudentIndex === 0 && !pdfRef.current) {
      // Setup new PDF for this document type (Wait for first template dimensions in onReady)
      setProgress({ current: 0, total: selectedStudents.length, text: `Preparing ${docLabel}...` });
    }
  }, [isGenerating, currentDocTypeIndex, currentStudentIndex, selectedTypes, selectedStudents.length]);

  const handleRendererReady = async () => {
    if (!isGenerating || currentDocTypeIndex < 0 || currentStudentIndex < 0) return;
    if (!rendererRef.current) return;

    const docType = selectedTypes[currentDocTypeIndex];
    const docLabel = DOCUMENT_TYPES.find(d => d.id === docType)?.label || docType;
    const student = selectedStudents[currentStudentIndex];

    try {
      // 1. Initialize PDF if it's the first student
      if (currentStudentIndex === 0) {
        const dims = rendererRef.current.getTemplateDimensions();
        if (!dims) {
          toast.error(`Template not found for ${docLabel}. Skipping...`);
          moveToNextDocType();
          return;
        }
        if (printMode) {
          pdfRef.current = new jsPDF({
            orientation: "landscape",
            unit: "in",
            format: [18, 12]
          });
        } else {
          pdfRef.current = new jsPDF({
            orientation: dims.orientation,
            unit: "px",
            format: [dims.width, dims.height]
          });
        }
      }

      // 2. Update progress UI
      setProgress({ 
        current: currentStudentIndex + 1, 
        total: selectedStudents.length, 
        text: `Generating ${docLabel} for ${student.fullName}...` 
      });

      // 3. Extract Image Data
      const imgData = await rendererRef.current.getImgData();
      
      // 4. Add to PDF
      if (imgData && pdfRef.current) {
        const dims = rendererRef.current.getTemplateDimensions();
        if (dims) {
          if (printMode) {
            // Print Mode: 18x12 inches, 2 documents per page side-by-side
            if (currentStudentIndex > 0 && documentsOnCurrentPage.current === 2) {
              pdfRef.current.addPage([18, 12], "landscape");
              documentsOnCurrentPage.current = 0;
            }
            
            const blockWidth = 9;
            const blockHeight = 12;
            const imgAspect = dims.width / dims.height;
            const blockAspect = blockWidth / blockHeight;
            
            let printWidth, printHeight;
            if (imgAspect > blockAspect) {
              printWidth = blockWidth - 0.5; // 0.25 inch margin
              printHeight = printWidth / imgAspect;
            } else {
              printHeight = blockHeight - 0.5;
              printWidth = printHeight * imgAspect;
            }
            
            const xOffset = (blockWidth - printWidth) / 2;
            const yOffset = (blockHeight - printHeight) / 2;
            const finalX = (documentsOnCurrentPage.current === 1 ? 9 : 0) + xOffset;
            const finalY = yOffset;
            
            pdfRef.current.addImage(imgData, "JPEG", finalX, finalY, printWidth, printHeight);
            documentsOnCurrentPage.current += 1;
          } else {
            // Normal Mode
            if (currentStudentIndex > 0) {
              pdfRef.current.addPage([dims.width, dims.height], dims.orientation);
            }
            pdfRef.current.addImage(imgData, "JPEG", 0, 0, dims.width, dims.height);
          }
        }
      }

      // 5. Check if this is the last student for this DocType
      if (currentStudentIndex === selectedStudents.length - 1) {
        if (pdfRef.current) {
          pdfRef.current.save(`Bulk_${docLabel.replace(/\s+/g, '_')}.pdf`);
          pdfRef.current = null; // reset for next doc type
          toast.success(`Successfully downloaded ${docLabel}`);
        }
        moveToNextDocType();
      } else {
        // Move to next student
        setCurrentStudentIndex(prev => prev + 1);
      }
    } catch (err) {
      console.error(err);
      toast.error(`Error generating document for ${student.fullName}`);
      // Skip error and move to next
      if (currentStudentIndex === selectedStudents.length - 1) {
        moveToNextDocType();
      } else {
        setCurrentStudentIndex(prev => prev + 1);
      }
    }
  };

  const moveToNextDocType = () => {
    if (currentDocTypeIndex === selectedTypes.length - 1) {
      // Done with all!
      setIsGenerating(false);
      setCurrentDocTypeIndex(-1);
      setCurrentStudentIndex(-1);
      toast.success("All selected bulk documents have been downloaded.");
      onOpenChange(false);
    } else {
      // Move to next doc type
      setCurrentDocTypeIndex(prev => prev + 1);
      setCurrentStudentIndex(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={isGenerating ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-0 bg-white dark:bg-slate-950 border-none shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-br from-primary/10 via-transparent to-transparent p-6 sm:p-8">
          <DialogHeader className="mb-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <DialogTitle className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white">Batch Generator</DialogTitle>
                <DialogDescription className="text-sm font-medium text-slate-500 mt-1">
                  Ready to process <strong className="text-primary">{selectedStudents.length}</strong> selected students
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {!isGenerating ? (
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Select Documents to Generate</label>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {DOCUMENT_TYPES.map((type) => {
                    const isSelected = selectedTypes.includes(type.id);
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) setSelectedTypes(prev => prev.filter(t => t !== type.id));
                          else setSelectedTypes(prev => [...prev, type.id]);
                        }}
                        className={cn(
                          "relative flex flex-row items-center p-3 sm:p-4 rounded-xl border-2 transition-all duration-300 text-left group overflow-hidden",
                          isSelected 
                            ? cn("border-primary bg-primary/5 dark:bg-primary/10 shadow-sm shadow-primary/10", type.activeBg)
                            : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm"
                        )}
                      >
                        <div className={cn("p-2 rounded-lg mr-3 transition-transform duration-300 group-hover:scale-110", type.bg, type.color)}>
                          <type.icon className="w-5 h-5" />
                        </div>
                        <span className={cn(
                          "font-bold text-sm",
                          isSelected ? "text-primary dark:text-primary" : "text-slate-700 dark:text-slate-300"
                        )}>
                          {type.label}
                        </span>
                        
                        {isSelected && (
                          <div className="absolute top-1/2 -translate-y-1/2 right-4 w-5 h-5 rounded-full bg-primary flex items-center justify-center animate-in zoom-in-50">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* Print Mode Toggle */}
              <div className="relative overflow-hidden p-5 sm:p-6 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                <div className="flex items-center gap-4 relative z-10">
                  <div className="p-3 bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                    <Printer className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 dark:text-white text-base">Optimize for Printing (18"x12")</h4>
                    <p className="text-sm font-medium text-slate-500 mt-0.5">Places 2 documents side-by-side on an 18x12 page.</p>
                  </div>
                </div>
                <Switch 
                  checked={printMode}
                  onCheckedChange={setPrintMode}
                  className="scale-110 relative z-10"
                />
              </div>
              
              <DialogFooter className="pt-4 border-t border-slate-100 dark:border-slate-800 gap-3 sm:gap-0">
                <Button 
                  variant="ghost" 
                  onClick={() => onOpenChange(false)}
                  className="rounded-xl h-14 font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 px-6"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleStartGeneration}
                  disabled={selectedTypes.length === 0}
                  className="rounded-xl h-14 font-bold px-8 shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all flex gap-3 text-base group"
                >
                  <Download className="w-5 h-5 group-hover:animate-bounce" /> 
                  Generate {selectedTypes.length > 0 ? selectedTypes.length : ""} Document{selectedTypes.length > 1 ? "s" : ""}
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-10 py-10">
              <div className="flex flex-col items-center justify-center space-y-6 text-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                  <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-full shadow-2xl flex items-center justify-center relative z-10 border border-slate-100 dark:border-slate-800">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Layers className="w-4 h-4 text-primary opacity-50" />
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-black text-2xl text-slate-900 dark:text-white">Processing Documents</h3>
                  <p className="text-base font-medium text-slate-500 mt-2">{progress.text}</p>
                </div>
              </div>
              
              <div className="space-y-3 px-4">
                <div className="flex justify-between text-sm font-bold text-slate-500">
                  <span>Overall Progress</span>
                  <span className="text-primary">{progress.current} / {progress.total}</span>
                </div>
                <Progress value={progress.total > 0 ? (progress.current / progress.total) * 100 : 0} className="h-4 rounded-full bg-slate-100 dark:bg-slate-800 text-primary" />
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400 p-5 rounded-2xl text-sm font-bold border border-amber-200/50 dark:border-amber-800/30 flex gap-3 mx-4 items-start">
                <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <p>Please keep this window open and do not switch tabs until the generation is fully completed. Large batches may take a few minutes.</p>
              </div>
            </div>
          )}

          {/* Hidden Document Renderer for State Machine */}
          {isGenerating && currentDocTypeIndex >= 0 && currentStudentIndex >= 0 && (
            <DocumentRenderer
              key={`${selectedTypes[currentDocTypeIndex]}-${selectedStudents[currentStudentIndex].id}`}
              ref={rendererRef}
              type={selectedTypes[currentDocTypeIndex]}
              student={selectedStudents[currentStudentIndex]}
              onReady={handleRendererReady}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
