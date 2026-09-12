"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { createGlobalCourse, updateGlobalCourse } from "@/app/actions/globalCourse";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

const generateSyllabusScaffold = (duration: string) => {
  let semestersCount = 0;
  if (duration === "6 Month") semestersCount = 1;
  else if (duration === "12 Month") semestersCount = 2;
  else if (duration === "18 Month") semestersCount = 3;
  else if (duration === "24 Month") semestersCount = 4;
  else if (duration === "36 Month") semestersCount = 6;
  
  const newSyllabus: Record<string, any[]> = {};
  
  if (duration === "3 Month") {
    newSyllabus["Modules"] = [
      { unit: "1", title: "", detail: "" },
      { unit: "2", title: "", detail: "" },
      { unit: "3", title: "", detail: "" }
    ];
  } else if (semestersCount > 0) {
    for (let i = 0; i < semestersCount; i++) {
      const termName = `Semester ${i + 1}`;
      const numeral = romanNumerals[i] || `${i + 1}`;
      newSyllabus[termName] = [
        { unit: "1", title: "", detail: "" },
        { unit: "2", title: "", detail: "" },
        { unit: "3", title: "", detail: "" },
        { unit: "4", title: "", detail: "" },
        { unit: "5", title: `Lab - ${numeral}`, detail: "Practical lab sessions and assignments." },
        { unit: "6", title: `Project Work - ${numeral}`, detail: "End of semester project work and viva." }
      ];
    }
  } else {
    newSyllabus["Term 1"] = [
      { unit: "1", title: "", detail: "" }
    ];
  }
  
  return newSyllabus;
};

export default function AdminCourseFormModal({ 
  isOpen, 
  onClose, 
  course, 
  onSuccess,
  groups = [] 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  course?: any, 
  onSuccess: () => void,
  groups?: any[]
}) {
  const [formData, setFormData] = useState({
    name: "",
    short: "",
    groupId: groups.length > 0 ? groups[0].value : "",
    duration: "",
    price: 0,
    priceDisplay: "",
    discountText: "",
    showFee: true,
    rating: 5,
    description: "",
    banner: "",
    isActive: true,
    popular: false,
    syllabus: null as any,
  });
  const [syllabusMode, setSyllabusMode] = useState<"visual" | "json">("visual");
  const [syllabusData, setSyllabusData] = useState<Record<string, any[]>>({});
  const [syllabusStr, setSyllabusStr] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (course) {
      setFormData({
        name: course.name || "",
        short: course.short || "",
        groupId: course.groupId || (groups.length > 0 ? groups[0].value : ""),
        duration: course.duration || "",
        price: course.price || 0,
        priceDisplay: course.priceDisplay || "",
        discountText: course.discountText || "",
        showFee: course.showFee ?? true,
        rating: course.rating ?? 5,
        description: course.description || "",
        banner: course.banner || "",
        isActive: course.isActive ?? true,
        popular: course.popular ?? false,
        syllabus: course.syllabus || null,
      });
      const initialSyllabus = course.syllabus || {};
      setSyllabusData(initialSyllabus);
      setSyllabusStr(Object.keys(initialSyllabus).length > 0 ? JSON.stringify(initialSyllabus, null, 2) : "");
    } else {
      setFormData({
        name: "",
        short: "",
        groupId: groups.length > 0 ? groups[0].value : "",
        duration: "",
        price: 0,
        priceDisplay: "",
        discountText: "",
        showFee: true,
        rating: 5,
        description: "",
        banner: "",
        isActive: true,
        popular: false,
        syllabus: null,
      });
      setSyllabusData({});
      setSyllabusStr("");
    }
    setSyllabusMode("visual");
  }, [course, isOpen]);

  const handleGenerateTemplate = () => {
    if (!formData.duration) {
      toast.error("Please select a duration first");
      return;
    }
    const scaffold = generateSyllabusScaffold(formData.duration);
    setSyllabusData(scaffold);
    setSyllabusStr(JSON.stringify(scaffold, null, 2));
    toast.success("Syllabus template generated!");
  };

  const updateUnit = (term: string, unitIndex: number, field: string, value: string) => {
    const newData = { ...syllabusData };
    newData[term][unitIndex][field] = value;
    setSyllabusData(newData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      let parsedSyllabus = null;
      if (syllabusMode === "visual") {
        parsedSyllabus = Object.keys(syllabusData).length > 0 ? syllabusData : null;
      } else {
        if (syllabusStr.trim()) {
          try {
            parsedSyllabus = JSON.parse(syllabusStr);
          } catch (e) {
            toast.error("Invalid Syllabus JSON format. Please correct it.");
            setIsLoading(false);
            return;
          }
        }
      }

      const dataToSave = { ...formData, price: Number(formData.price), syllabus: parsedSyllabus };
      
      let res;
      if (course) {
        res = await updateGlobalCourse(course.id, dataToSave);
      } else {
        res = await createGlobalCourse(dataToSave);
      }

      if (res.success) {
        toast.success(course ? "Course updated" : "Course created");
        onSuccess();
        onClose();
      } else {
        toast.error(res.error || "Something went wrong");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden rounded-2xl p-0 border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-950">
        <DialogHeader className="p-4 sm:p-5 pb-3 shrink-0 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {course ? "Edit Course" : "Add New Course"}
          </DialogTitle>
          <p className="text-xs text-slate-500 font-medium">
            Configure course curriculum, metadata, pricing, and visual syllabus.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 custom-scrollbar">
            {/* General Information */}
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3 pb-1.5 border-b border-slate-100 dark:border-slate-800">
                General Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Course Name <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    required 
                    placeholder="e.g. Diploma in Computer Application"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="h-8 sm:h-9 rounded-lg text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Short Name / Code
                  </Label>
                  <Input 
                    placeholder="e.g. DCA"
                    value={formData.short}
                    onChange={e => setFormData({...formData, short: e.target.value})}
                    className="h-8 sm:h-9 rounded-lg text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Category Group <span className="text-red-500">*</span>
                  </Label>
                  <select 
                    value={formData.groupId} 
                    onChange={(e) => setFormData({...formData, groupId: e.target.value})}
                    className="w-full h-8 sm:h-9 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 text-xs text-slate-700 dark:text-slate-300 outline-none focus:ring-1 focus:ring-primary/20 capitalize font-medium"
                  >
                    {groups.length === 0 ? (
                      <option value="" disabled>No categories available</option>
                    ) : (
                      groups.map(g => (
                        <option key={g.value} value={g.value}>
                          {g.label} {!g.isActive && "(Hidden)"}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Duration
                  </Label>
                  <select 
                    value={formData.duration} 
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    className="w-full h-8 sm:h-9 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 text-xs text-slate-700 dark:text-slate-300 outline-none focus:ring-1 focus:ring-primary/20 font-medium"
                  >
                    <option value="" disabled>Select Duration</option>
                    <option value="3 Month">3 Month</option>
                    <option value="6 Month">6 Month</option>
                    <option value="12 Month">12 Month</option>
                    <option value="18 Month">18 Month</option>
                    <option value="24 Month">24 Month</option>
                    <option value="36 Month">36 Month</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Pricing & Offers */}
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3 pb-1.5 border-b border-slate-100 dark:border-slate-800">
                Pricing & Offers
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-3">
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Price (₹) <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    type="number"
                    required 
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                    className="h-8 sm:h-9 rounded-lg text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Price Display
                  </Label>
                  <Input 
                    placeholder="e.g. ₹5,000"
                    value={formData.priceDisplay}
                    onChange={e => setFormData({...formData, priceDisplay: e.target.value})}
                    className="h-8 sm:h-9 rounded-lg text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Discount Offer Text
                  </Label>
                  <Input 
                    placeholder="e.g. 20% Off"
                    value={formData.discountText}
                    onChange={e => setFormData({...formData, discountText: e.target.value})}
                    className="h-8 sm:h-9 rounded-lg text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800 rounded-lg text-xs">
                <div>
                  <p className="font-semibold text-xs text-slate-900 dark:text-white">Show Course Fee Publicly</p>
                  <p className="text-[10px] text-slate-500">If disabled, the Discount Offer Text will be shown instead of numeric fee.</p>
                </div>
                <Switch 
                  checked={formData.showFee} 
                  onCheckedChange={v => setFormData({...formData, showFee: v})}
                  className="scale-90"
                />
              </div>
            </div>

            {/* Details & Media */}
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3 pb-1.5 border-b border-slate-100 dark:border-slate-800">
                Details & Media
              </h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Description</Label>
                  <Textarea 
                    placeholder="Course description and curriculum overview..."
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="rounded-lg text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 min-h-[70px] resize-none"
                  />
                </div>

                <div className="space-y-2 bg-slate-50/70 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <Label className="text-xs font-bold text-slate-900 dark:text-white">Banner Image</Label>
                  <ImageUpload 
                    value={formData.banner} 
                    onChange={(url) => setFormData({...formData, banner: url})} 
                    folder="courses"
                  />
                  
                  {!formData.banner && (
                    <div className="pt-1">
                      <Input 
                        placeholder="Or paste direct image URL (https://...)"
                        value={formData.banner}
                        onChange={e => setFormData({...formData, banner: e.target.value})}
                        className="h-8 sm:h-9 rounded-lg text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                      />
                    </div>
                  )}
                </div>

                {/* Course Syllabus */}
                <div className="space-y-2 bg-slate-50/70 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-xs font-bold text-slate-900 dark:text-white">Course Syllabus</Label>
                    
                    <div className="flex bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-lg gap-1">
                      <button 
                        type="button" 
                        onClick={() => {
                          try {
                            const parsed = syllabusStr.trim() ? JSON.parse(syllabusStr) : {};
                            setSyllabusData(parsed);
                            setSyllabusMode("visual");
                          } catch(e) {
                            toast.error("Invalid JSON. Fix errors before switching.");
                          }
                        }} 
                        className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${syllabusMode === "visual" ? "bg-white dark:bg-slate-900 shadow-sm text-primary" : "text-slate-500"}`}
                      >
                        Visual Builder
                      </button>
                      <button 
                        type="button" 
                        onClick={() => {
                          setSyllabusStr(JSON.stringify(syllabusData, null, 2));
                          setSyllabusMode("json");
                        }} 
                        className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${syllabusMode === "json" ? "bg-white dark:bg-slate-900 shadow-sm text-primary" : "text-slate-500"}`}
                      >
                        JSON Editor
                      </button>
                    </div>
                  </div>

                  {syllabusMode === "visual" ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center border-b border-slate-200/60 dark:border-slate-800 pb-2">
                        <p className="text-[11px] text-slate-500">Easily organize terms and unit topics.</p>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          onClick={handleGenerateTemplate}
                          className="h-7 text-xs font-semibold text-primary hover:bg-primary/10"
                        >
                          Auto-Generate from Duration
                        </Button>
                      </div>
                      
                      {Object.keys(syllabusData).length === 0 ? (
                        <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg text-slate-400 text-xs">
                          No syllabus defined yet. Click "Auto-Generate from Duration" or switch to JSON editor.
                        </div>
                      ) : (
                        Object.entries(syllabusData).map(([term, units]) => (
                          <div key={term} className="p-3 border border-slate-200/80 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 space-y-2.5 shadow-sm">
                            <div className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">{term}</div>
                            <div className="space-y-2 pl-2 border-l-2 border-primary/20">
                              {units.map((u: any, idx: number) => (
                                <div key={idx} className="flex flex-col gap-1.5 p-2 bg-slate-50 dark:bg-slate-900 rounded-md border border-slate-100 dark:border-slate-800 text-xs">
                                  <div className="flex items-center gap-2">
                                    <span className="bg-primary text-white px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider whitespace-nowrap">
                                      UNIT {u.unit}
                                    </span>
                                    <Input 
                                      value={u.title} 
                                      onChange={e => updateUnit(term, idx, "title", e.target.value)}
                                      placeholder="Unit Title (e.g. Computer Fundamentals)"
                                      className="h-7 text-xs border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 font-medium"
                                    />
                                  </div>
                                  <Textarea 
                                    value={u.detail}
                                    onChange={e => updateUnit(term, idx, "detail", e.target.value)}
                                    placeholder="Unit details and topics..."
                                    className="h-12 text-xs border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 resize-none"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="text-[10px] text-slate-500 mb-1.5 font-mono">Format: {`{"Term 1": [{"unit": "1", "title": "...", "detail": "..."}]}`}</p>
                      <Textarea 
                        placeholder='{"Semester 1": [{"unit": "1", "title": "Intro", "detail": "..."}]}'
                        value={syllabusStr}
                        onChange={e => setSyllabusStr(e.target.value)}
                        className="rounded-lg border border-slate-200 dark:border-slate-800 min-h-[160px] font-mono text-xs bg-white dark:bg-slate-950"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Status & Visibility Flags */}
            <div className="flex flex-wrap gap-4 p-3 bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800 rounded-lg text-xs">
              <div className="flex items-center gap-2">
                <Switch 
                  checked={formData.isActive} 
                  onCheckedChange={v => setFormData({...formData, isActive: v})}
                  className="scale-90"
                />
                <Label className="text-xs font-semibold cursor-pointer">Active Status</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  checked={formData.popular} 
                  onCheckedChange={v => setFormData({...formData, popular: v})}
                  className="scale-90"
                />
                <Label className="text-xs font-semibold cursor-pointer">Mark as Popular</Label>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 p-3 px-4 sm:px-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 shrink-0">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose} 
              className="h-8 sm:h-9 px-3.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="h-8 sm:h-9 px-4 rounded-lg text-xs font-semibold bg-primary text-white shadow-sm shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              {isLoading && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              {course ? "Update Course" : "Create Course"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
// refresh
