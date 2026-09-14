"use client";

import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2, Download, FileText, Printer, Award, CreditCard, User, Layers } from "lucide-react";
import { DocumentRenderer, DocumentRendererRef } from "./DocumentRenderer";
import type { jsPDF } from "jspdf";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { markStudentsAsPrinted } from "@/app/actions/student-documents";
import { getActiveDocumentTemplates } from "@/app/actions/document-templates";
import { SlidersHorizontal } from "lucide-react";

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
  const [activeTemplates, setActiveTemplates] = useState<any[]>([]);
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<Record<string, string>>({});
  
  // State machine for generation
  const [currentDocTypeIndex, setCurrentDocTypeIndex] = useState(-1);
  const [currentStudentIndex, setCurrentStudentIndex] = useState(-1);
  const [progress, setProgress] = useState({ current: 0, total: 0, text: "" });
  const [printMode, setPrintMode] = useState(false);
  
  const rendererRef = useRef<DocumentRendererRef>(null);
  const pdfRef = useRef<jsPDF | null>(null);
  const documentsOnCurrentPage = useRef(0);

  const selectedStudents = students.filter(s => selectedStudentIds.includes(s.id));

  // Reset and fetch active templates when dialog opens
  useEffect(() => {
    if (!open) {
      setSelectedTypes([]);
      setIsGenerating(false);
      setCurrentDocTypeIndex(-1);
      setCurrentStudentIndex(-1);
      pdfRef.current = null;
    } else {
      getActiveDocumentTemplates().then((templates) => {
        setActiveTemplates(templates);
        const defaults: Record<string, string> = {};
        DOCUMENT_TYPES.forEach((dt) => {
          const typeTemplates = templates.filter((t: any) => t.type === dt.id);
          if (typeTemplates.length > 0) {
            defaults[dt.id] = typeTemplates[0].id;
          }
        });
        setSelectedTemplateIds(defaults);
      });
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
        const { jsPDF } = await import("jspdf");
        const dims = rendererRef.current.getTemplateDimensions();
        if (!dims) {
          toast.error(`Template not found for ${docLabel}. Skipping...`);
          await moveToNextDocType();
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
        text: `Rendering ${docLabel} (${currentStudentIndex + 1} of ${selectedStudents.length}): ${student.fullName}...` 
      });

      // Yield thread briefly so browser can paint the updated progress text and keep spinner rotating
      await new Promise(resolve => setTimeout(resolve, 80));

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
            
            pdfRef.current.addImage(imgData, "PNG", finalX, finalY, printWidth, printHeight, undefined, "FAST");
            documentsOnCurrentPage.current += 1;
          } else {
            // Normal Mode
            if (currentStudentIndex > 0) {
              pdfRef.current.addPage([dims.width, dims.height], dims.orientation);
            }
            pdfRef.current.addImage(imgData, "PNG", 0, 0, dims.width, dims.height, undefined, "FAST");
          }
        }
      }

      // Yield thread again for responsive UI
      await new Promise(resolve => setTimeout(resolve, 60));

      // 5. Check if this is the last student for this DocType
      if (currentStudentIndex === selectedStudents.length - 1) {
        if (pdfRef.current) {
          setProgress({ 
            current: selectedStudents.length, 
            total: selectedStudents.length, 
            text: `Compiling & saving ${docLabel} PDF...` 
          });
          await new Promise(resolve => setTimeout(resolve, 100));

          pdfRef.current.save(`Bulk_${docLabel.replace(/\s+/g, '_')}.pdf`);
          pdfRef.current = null; // reset for next doc type
          toast.success(`Successfully downloaded ${docLabel}`);
        }
        await moveToNextDocType();
      } else {
        // Move to next student
        setCurrentStudentIndex(prev => prev + 1);
      }
    } catch (err) {
      console.error(err);
      toast.error(`Error generating document for ${student.fullName}`);
      // Skip error and move to next
      if (currentStudentIndex === selectedStudents.length - 1) {
        await moveToNextDocType();
      } else {
        setCurrentStudentIndex(prev => prev + 1);
      }
    }
  };

  const moveToNextDocType = async () => {
    if (currentDocTypeIndex === selectedTypes.length - 1) {
      // Done with all!
      if (printMode) {
        try {
          await markStudentsAsPrinted(selectedStudentIds);
        } catch (e) {
          console.error("Failed to mark students as printed:", e);
        }
      }
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
      <DialogContent className="sm:max-w-lg md:max-w-xl max-h-[92vh] flex flex-col rounded-2xl p-0 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-3.5">
          <DialogHeader className="space-y-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Batch Generator</DialogTitle>
                <DialogDescription className="text-xs font-medium text-slate-500">
                  Ready to process <strong className="text-primary font-semibold">{selectedStudents.length}</strong> selected students
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {!isGenerating ? (
            <div className="space-y-3.5 pt-1">
              {/* Document Selection Grid */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Select Documents to Generate
                </label>
                <div className="grid grid-cols-2 gap-2">
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
                          "relative flex items-center p-2 sm:p-2.5 rounded-xl border transition-all text-left group cursor-pointer",
                          isSelected 
                            ? cn("border-primary bg-primary/5 dark:bg-primary/10 shadow-2xs ring-1 ring-primary/25", type.activeBg)
                            : "border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
                        )}
                      >
                        <div className={cn("p-1.5 rounded-lg mr-2.5 transition-transform shrink-0", type.bg, type.color)}>
                          <type.icon className="w-3.5 h-3.5" />
                        </div>
                        <span className={cn(
                          "font-semibold text-xs truncate",
                          isSelected ? "text-primary dark:text-white" : "text-slate-700 dark:text-slate-300"
                        )}>
                          {type.label}
                        </span>
                        
                        {isSelected && (
                          <div className="ml-auto w-4 h-4 rounded-full bg-primary flex items-center justify-center shrink-0">
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* Multi-Template Design Selector */}
              {selectedTypes.some(typeId => activeTemplates.filter(t => t.type === typeId).length > 1) && (
                <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Select Design Template
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      Choose layout for batch
                    </span>
                  </div>

                  <div className="space-y-2">
                    {selectedTypes.map(typeId => {
                      const matching = activeTemplates.filter(t => t.type === typeId);
                      if (matching.length <= 1) return null;
                      const docMeta = DOCUMENT_TYPES.find(d => d.id === typeId);
                      const currentSelectedId = selectedTemplateIds[typeId] || matching[0].id;

                      return (
                        <div key={typeId} className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                              {docMeta && <docMeta.icon className={cn("w-3 h-3", docMeta.color)} />}
                              {docMeta?.label || typeId}
                            </span>
                            <span className="text-[9px] font-semibold text-slate-500 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200/60 dark:border-slate-700">
                              {matching.length} Active
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            {matching.map((tmpl, idx) => {
                              const isSelected = currentSelectedId === tmpl.id;
                              const displayName = (tmpl.name && tmpl.name.trim().length > 0) 
                                ? tmpl.name 
                                : `${docMeta?.label || 'Doc'} Design ${idx + 1}`;
                              const isLandscape = (tmpl.width || 0) > (tmpl.height || 0);

                              return (
                                <button
                                  key={tmpl.id}
                                  type="button"
                                  onClick={() => setSelectedTemplateIds(prev => ({ ...prev, [typeId]: tmpl.id }))}
                                  className={cn(
                                    "flex items-center justify-between p-2 rounded-lg border transition-all text-left cursor-pointer",
                                    isSelected
                                      ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-2xs ring-1 ring-primary/25"
                                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 hover:border-slate-300 dark:hover:border-slate-700"
                                  )}
                                >
                                  <div className="min-w-0 pr-2">
                                    <span className={cn(
                                      "font-semibold text-xs truncate block leading-tight",
                                      isSelected ? "text-primary dark:text-white" : "text-slate-800 dark:text-slate-200"
                                    )}>
                                      {displayName}
                                    </span>
                                    <span className="text-[9px] text-slate-400 block mt-0.5">
                                      {isLandscape ? "Landscape" : "Portrait"} {tmpl.width && tmpl.height ? `· ${tmpl.width}×${tmpl.height}` : ""}
                                    </span>
                                  </div>

                                  {isSelected && (
                                    <div className="w-3.5 h-3.5 rounded-full bg-primary flex items-center justify-center shrink-0">
                                      <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                      </svg>
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Print Mode Toggle */}
              <div className="p-3 bg-slate-50/80 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-white dark:bg-slate-950 rounded-lg border border-slate-200/60 dark:border-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                    <Printer className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-white">Optimize for Printing (18"x12")</h4>
                    <p className="text-[11px] text-slate-500">Places 2 documents side-by-side on an 18x12 page</p>
                  </div>
                </div>
                <Switch 
                  checked={printMode}
                  onCheckedChange={setPrintMode}
                  className="scale-90"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6 py-6 px-2">
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className="relative flex items-center justify-center w-16 h-16">
                  {/* Ambient soft glow */}
                  <div className="absolute inset-0 rounded-full bg-emerald-500/15 blur-lg animate-pulse" />
                  {/* Base full circular track */}
                  <div className="w-14 h-14 rounded-full border-[3px] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-inner" />
                  {/* High-contrast smooth rotating ring */}
                  <div 
                    className="absolute w-14 h-14 rounded-full border-[3px] border-transparent border-t-emerald-600 border-r-emerald-500 animate-spin"
                    style={{ animationDuration: '0.75s', willChange: 'transform' }} 
                  />
                  {/* Centered Printer / Download Icon */}
                  <div className="absolute flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Printer className="w-5 h-5 animate-pulse" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">Generating Documents</h3>
                  <p className="text-xs font-medium text-slate-500 mt-1">{progress.text}</p>
                </div>
              </div>
              
              <div className="space-y-2 px-2">
                <div className="flex justify-between text-xs font-semibold text-slate-500">
                  <span>Overall Progress</span>
                  <span className="text-primary font-bold">{progress.current} / {progress.total}</span>
                </div>
                <Progress value={progress.total > 0 ? (progress.current / progress.total) * 100 : 0} className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-primary" />
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400 p-3.5 rounded-xl text-xs font-medium border border-amber-200/50 dark:border-amber-800/30 flex gap-2.5 items-start">
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <p>Please keep this window open and do not switch tabs until generation finishes.</p>
              </div>
            </div>
          )}

          {/* Hidden Document Renderer for State Machine */}
          {isGenerating && currentDocTypeIndex >= 0 && currentStudentIndex >= 0 && (
            <DocumentRenderer
              key={`${selectedTypes[currentDocTypeIndex]}-${selectedStudents[currentStudentIndex].id}`}
              ref={rendererRef}
              type={selectedTypes[currentDocTypeIndex]}
              templateId={selectedTemplateIds[selectedTypes[currentDocTypeIndex]] || null}
              student={selectedStudents[currentStudentIndex]}
              onReady={handleRendererReady}
            />
          )}
        </div>

        {/* Fixed / Sticky Modal Action Footer */}
        {!isGenerating && (
          <div className="px-4 sm:px-5 py-3 bg-slate-50/80 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 shrink-0">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="h-8 sm:h-9 px-3 sm:px-4 rounded-lg text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleStartGeneration}
              disabled={selectedTypes.length === 0}
              className="h-8 sm:h-9 px-4 sm:px-5 rounded-lg text-xs font-semibold gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" /> 
              Generate {selectedTypes.length > 0 ? selectedTypes.length : ""} Document{selectedTypes.length > 1 ? "s" : ""}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
