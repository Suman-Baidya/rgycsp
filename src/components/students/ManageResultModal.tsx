"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, UserCheck, GraduationCap } from "lucide-react";
import { saveStudentMarksBatch } from "@/app/actions/exam";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ManageResultModalProps {
  student: any;
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
}

export function ManageResultModal({ student, isOpen, onClose, onSave }: ManageResultModalProps) {
  const [marksState, setMarksState] = useState<Record<string, { marksObtained: number, maxMarks: number }>>({});
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isOpen && student) {
      // Pre-fill existing marks when modal opens
      const initialMarks: Record<string, { marksObtained: number, maxMarks: number }> = {};
      if (student.semesters) {
        student.semesters.forEach((sem: any) => {
          if (sem.marks) {
            sem.marks.forEach((mark: any) => {
              const key = `${student.id}-${sem.semesterNumber}-${mark.unitName}`;
              initialMarks[key] = {
                marksObtained: mark.marksObtained,
                maxMarks: mark.maxMarks
              };
            });
          }
        });
      }
      setMarksState(initialMarks);
    }
  }, [isOpen, student]);

  if (!student) return null;

  const toRoman = (num: number) => {
    const roman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
    return roman[num - 1] || num.toString();
  };

  const getSemestersData = () => {
    let topicsObj = null;
    if (student.course?.topics) {
      if (typeof student.course.topics === 'string') {
        try { topicsObj = JSON.parse(student.course.topics); } catch (e) {}
      } else {
        topicsObj = student.course.topics;
      }
    }
    
    if (!topicsObj || Object.keys(topicsObj).length === 0) {
      return [{
        semesterNumber: 1,
        unitsList: [
          { title: "Unit 1" }, { title: "Unit 2" }, { title: "Unit 3" },
          { title: "Unit 4" }, { title: "Unit 5" }, { title: "Unit 6" }
        ]
      }];
    }

    if (Array.isArray(topicsObj)) {
      return topicsObj.map((sem, idx) => {
        const units = Array.isArray(sem.items) ? sem.items : (Array.isArray(sem.units) ? sem.units : sem);
        return {
          semesterNumber: idx + 1,
          unitsList: Array.isArray(units) ? units : []
        };
      });
    }

    if (typeof topicsObj === 'object' && topicsObj !== null) {
      const keys = Object.keys(topicsObj).filter(k => k.toLowerCase().startsWith('sem'));
      if (keys.length > 0) {
        return keys.map((key, idx) => {
          const numMatch = key.match(/\d+/);
          const semesterNumber = numMatch ? parseInt(numMatch[0]) : idx + 1;
          const unitsList = topicsObj[key] || [];
          return { semesterNumber, unitsList: Array.isArray(unitsList) ? unitsList : [] };
        }).sort((a, b) => a.semesterNumber - b.semesterNumber);
      }
      return [{
        semesterNumber: 1,
        unitsList: Array.isArray(topicsObj) ? topicsObj : Object.values(topicsObj).flat()
      }];
    }
    
    return [{ semesterNumber: 1, unitsList: [] }];
  };

  const semestersList = getSemestersData();

  const getMarkValue = (semesterNumber: number, unitName: string, initialObtained: number, initialMax: number) => {
    const key = `${student.id}-${semesterNumber}-${unitName}`;
    return marksState[key] || { marksObtained: initialObtained, maxMarks: initialMax };
  };

  const handleMarkChange = (semesterNumber: number, unitName: string, field: "marksObtained" | "maxMarks", value: string) => {
    const key = `${student.id}-${semesterNumber}-${unitName}`;
    const numValue = parseFloat(value) || 0;
    setMarksState(prev => ({
      ...prev,
      [key]: {
        ...(prev[key] || { marksObtained: 0, maxMarks: 100 }),
        [field]: numValue
      }
    }));
  };

  const handleSaveMarks = async (semesterNumber: number) => {
    const processKey = `${student.id}-${semesterNumber}`;
    setIsSaving(prev => ({ ...prev, [processKey]: true }));
    try {
      const marksToSave = [];
      for (const key of Object.keys(marksState)) {
        if (key.startsWith(`${student.id}-${semesterNumber}-`)) {
          const parts = key.split('-');
          const unitName = parts.slice(2).join('-');
          marksToSave.push({
            semesterNumber,
            unitName,
            marksObtained: marksState[key].marksObtained,
            maxMarks: marksState[key].maxMarks
          });
        }
      }

      if (marksToSave.length === 0) {
        toast.error("Please enter some marks first");
        return;
      }

      const res = await saveStudentMarksBatch(student.id, marksToSave);
      if (res.error) throw new Error(res.error);
      
      toast.success(`Marks for Semester ${semesterNumber} saved successfully`);
      if (onSave) onSave();
    } catch (error: any) {
      toast.error(error.message || "Failed to save marks");
    } finally {
      setIsSaving(prev => ({ ...prev, [processKey]: false }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl w-[95vw] max-h-[88vh] flex flex-col overflow-hidden rounded-2xl p-0 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xl">
        {/* Pinned Static Header */}
        <div className="shrink-0 px-4 sm:px-5 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 pr-10">
          <DialogHeader className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <DialogTitle className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  Manage Results
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 font-medium">
                  View and edit semester marks for this student. Saved marks will automatically sync with the Marksheet Document system.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-slate-50/30 dark:bg-slate-950/20 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
          {/* Student Profile Card */}
          <div className="flex items-center gap-3 p-3 sm:p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <Avatar className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
              <AvatarImage src={student.avatarUrl || student.admissionApp?.photoUrl} />
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold text-xs sm:text-sm rounded-xl">
                {student.fullName?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                <span className="truncate">{student.fullName}</span>
                <UserCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              </h3>
              <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-slate-500 dark:text-slate-400 text-[11px]">
                <span className="font-mono font-semibold text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded border border-slate-200/60 dark:border-slate-700">
                  {student.registrationNumber}
                </span>
                <span>•</span>
                <span className="truncate flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 shrink-0" /> {student.course?.title}
                </span>
              </div>
            </div>
          </div>

          {/* Semesters List */}
          <div className="space-y-3">
            {semestersList.map(({ semesterNumber, unitsList }) => {
              const semesterData = student.semesters?.find((s: any) => s.semesterNumber === semesterNumber);
              const processKey = `${student.id}-${semesterNumber}`;
              
              return (
                <div key={semesterNumber} className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-xs">
                  <div className="bg-slate-50/70 dark:bg-slate-800/40 px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0">
                        {toRoman(semesterNumber)}
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                        Semester {semesterNumber}
                      </h4>
                      {semesterData?.marksFinalizedAt && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200/60 dark:border-emerald-900/40">
                          <UserCheck className="w-3 h-3" /> Finalized: {new Date(semesterData.marksFinalizedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <Button 
                      size="sm"
                      className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-3 h-7 sm:h-8 text-xs gap-1.5 shadow-xs transition-all active:scale-95 ml-auto"
                      onClick={() => handleSaveMarks(semesterNumber)}
                      disabled={isSaving[processKey]}
                    >
                      {isSaving[processKey] ? "Saving..." : <><Save className="w-3.5 h-3.5" /> Save Changes</>}
                    </Button>
                  </div>
                  
                  <div className="p-3 sm:p-3.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {unitsList.length > 0 ? (
                      unitsList.map((unit: any, uIdx: number) => {
                        const dbUnitName = `Unit ${uIdx + 1}`;
                        const displayUnitName = unit.title || dbUnitName;
                        const existingMark = semesterData?.marks?.find((m: any) => m.unitName === dbUnitName);
                        const currentVal = getMarkValue(semesterNumber, dbUnitName, existingMark?.marksObtained || 0, existingMark?.maxMarks || 100);
                        
                        return (
                          <div key={uIdx} className="bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/80 p-2.5 rounded-lg hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-colors">
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5 truncate" title={displayUnitName}>
                              {displayUnitName}
                            </p>
                            <div className="flex gap-2 items-center">
                              <div className="space-y-0.5 flex-1">
                                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Obtained</label>
                                <Input 
                                  type="number" 
                                  className="h-7 sm:h-8 text-xs font-bold bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 px-2 rounded-md"
                                  value={currentVal.marksObtained ?? ""}
                                  onChange={(e) => handleMarkChange(semesterNumber, dbUnitName, "marksObtained", e.target.value)}
                                />
                              </div>
                              <div className="text-slate-300 dark:text-slate-600 mt-3.5 text-xs font-bold">/</div>
                              <div className="space-y-0.5 flex-1">
                                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Max</label>
                                <Input 
                                  type="number" 
                                  className="h-7 sm:h-8 text-xs font-bold bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 px-2 rounded-md text-slate-500"
                                  value={currentVal.maxMarks ?? ""}
                                  onChange={(e) => handleMarkChange(semesterNumber, dbUnitName, "maxMarks", e.target.value)}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="col-span-full py-6 text-center text-xs text-slate-400">
                        <p>No units found for this semester in the course topics.</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pinned Static Footer */}
        <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400 font-medium">
            Make sure to click "Save Changes" on each semester after editing marks.
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClose}
            className="h-7 sm:h-8 px-3 text-xs font-semibold rounded-lg"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
