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
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 flex flex-col overflow-hidden rounded-[2rem] border-0 shadow-2xl">
        <DialogHeader className="p-6 md:p-8 pb-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 shrink-0 z-10">
          <DialogTitle className="text-2xl font-black">Manage Results</DialogTitle>
          <DialogDescription className="text-slate-500 mt-1">
            View and edit semester marks for this student. Saving marks will automatically sync with the Marksheet Document system.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 pt-4 bg-slate-50/50 dark:bg-slate-950/30">
          <div className="flex items-center gap-4 p-5 bg-white dark:bg-slate-900 rounded-2xl mb-8 border border-slate-200/60 dark:border-slate-800 shadow-sm">
          <Avatar className="h-16 w-16 shadow-sm border-2 border-white dark:border-slate-800">
            <AvatarImage src={student.avatarUrl || student.admissionApp?.photoUrl} />
            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold text-xl">
              {student.fullName?.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-black text-xl text-slate-900 dark:text-white flex items-center gap-2">
              {student.fullName}
              <UserCheck className="w-5 h-5 text-emerald-500" />
            </h3>
            <div className="flex items-center gap-2 mt-1 text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-xs tracking-wider uppercase">{student.registrationNumber}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-sm"><GraduationCap className="w-4 h-4" /> {student.course?.title}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {semestersList.map(({ semesterNumber, unitsList }) => {
            const semesterData = student.semesters?.find((s: any) => s.semesterNumber === semesterNumber);
            const processKey = `${student.id}-${semesterNumber}`;
            
            return (
              <div key={semesterNumber} className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-slate-50/50 dark:bg-slate-900/40 p-5 md:p-6 border-b border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm">
                        {toRoman(semesterNumber)}
                      </div>
                      Semester {semesterNumber}
                    </h4>
                    {semesterData?.marksFinalizedAt && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1 pl-10 flex items-center gap-1">
                        <UserCheck className="w-3 h-3" /> Finalized on {new Date(semesterData.marksFinalizedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <Button 
                    className="rounded-xl shadow-md bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 h-11 w-full md:w-auto transition-all active:scale-95"
                    onClick={() => handleSaveMarks(semesterNumber)}
                    disabled={isSaving[processKey]}
                  >
                    {isSaving[processKey] ? "Saving..." : <><Save className="w-5 h-5 mr-2" /> Save Changes</>}
                  </Button>
                </div>
                
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {unitsList.length > 0 ? (
                    unitsList.map((unit: any, uIdx: number) => {
                      const dbUnitName = `Unit ${uIdx + 1}`;
                      const displayUnitName = unit.title || dbUnitName;
                      const existingMark = semesterData?.marks?.find((m: any) => m.unitName === dbUnitName);
                      const currentVal = getMarkValue(semesterNumber, dbUnitName, existingMark?.marksObtained || 0, existingMark?.maxMarks || 100);
                      
                      return (
                        <div key={uIdx} className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-3 rounded-xl hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-colors">
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 truncate" title={displayUnitName}>
                            {displayUnitName}
                          </p>
                          <div className="flex gap-2 items-center">
                            <div className="space-y-1 flex-1">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Obtained</label>
                              <Input 
                                type="number" 
                                className="h-9 font-bold bg-slate-50 dark:bg-slate-900 border-none"
                                value={currentVal.marksObtained ?? ""}
                                onChange={(e) => handleMarkChange(semesterNumber, dbUnitName, "marksObtained", e.target.value)}
                              />
                            </div>
                            <div className="text-slate-300 dark:text-slate-700 mt-5">/</div>
                            <div className="space-y-1 flex-1">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Max</label>
                              <Input 
                                type="number" 
                                className="h-9 font-bold bg-slate-50 dark:bg-slate-900 border-none text-slate-500"
                                value={currentVal.maxMarks ?? ""}
                                onChange={(e) => handleMarkChange(semesterNumber, dbUnitName, "maxMarks", e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-full py-8 text-center text-slate-400">
                      <p>No units found for this semester in the course topics.</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
