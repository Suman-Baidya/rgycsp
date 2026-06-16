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
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden rounded-[2rem] p-0 border-0 shadow-2xl bg-white dark:bg-zinc-950">
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-8 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:rounded-full">
          <DialogHeader className="mb-6 shrink-0">
            <DialogTitle className="text-2xl font-black">{course ? "Edit Course" : "Add New Course"}</DialogTitle>
          </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* General Information */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b">General Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Course Name <span className="text-red-500">*</span></Label>
                <Input 
                  required 
                  placeholder="e.g. Diploma in Computer Application"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="rounded-xl border-2 h-11"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Short Name / Code</Label>
                <Input 
                  placeholder="e.g. DCA"
                  value={formData.short}
                  onChange={e => setFormData({...formData, short: e.target.value})}
                  className="rounded-xl border-2 h-11"
                />
              </div>

              <div className="space-y-2">
                <Label>Category Group <span className="text-red-500">*</span></Label>
                <select 
                  value={formData.groupId} 
                  onChange={(e) => setFormData({...formData, groupId: e.target.value})}
                  className="w-full h-11 bg-white dark:bg-zinc-950 border-2 border-border rounded-xl px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 capitalize"
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

              <div className="space-y-2">
                <Label>Duration</Label>
                <select 
                  value={formData.duration} 
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  className="w-full h-11 bg-white dark:bg-zinc-950 border-2 border-border rounded-xl px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
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
            <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b">Pricing & Offers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <Label>Price (Number) <span className="text-red-500">*</span></Label>
                <Input 
                  type="number"
                  required 
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                  className="rounded-xl border-2 h-11"
                />
              </div>

              <div className="space-y-2">
                <Label>Price Display (Text)</Label>
                <Input 
                  placeholder="e.g. ₹5,000"
                  value={formData.priceDisplay}
                  onChange={e => setFormData({...formData, priceDisplay: e.target.value})}
                  className="rounded-xl border-2 h-11"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Discount Offer Text</Label>
                <Input 
                  placeholder="e.g. 20% Off or Special Offer"
                  value={formData.discountText}
                  onChange={e => setFormData({...formData, discountText: e.target.value})}
                  className="rounded-xl border-2 h-11"
                />
              </div>

              <div className="space-y-2">
                <Label>Course Rating (1-5)</Label>
                <Input 
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={formData.rating}
                  onChange={e => setFormData({...formData, rating: Number(e.target.value)})}
                  className="rounded-xl border-2 h-11"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <Switch 
                checked={formData.showFee} 
                onCheckedChange={v => setFormData({...formData, showFee: v})}
              />
              <div>
                <Label className="text-base font-bold">Show Course Fee Publicly</Label>
                <p className="text-sm text-slate-500">If disabled, the Discount Offer Text will be shown instead of the fee.</p>
              </div>
            </div>
          </div>

          {/* Details & Media */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b">Details & Media</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  placeholder="Course description..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="rounded-xl border-2 min-h-[100px]"
                />
              </div>

              <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <Label className="text-base font-bold">Banner Image</Label>
                
                <ImageUpload 
                  value={formData.banner} 
                  onChange={(url) => setFormData({...formData, banner: url})} 
                  folder="courses"
                />
                
                {!formData.banner && (
                  <div className="flex items-center gap-3 pt-2">
                    <div className="h-[1px] flex-1 bg-border/60"></div>
                    <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">OR PASTE DIRECT LINK</span>
                    <div className="h-[1px] flex-1 bg-border/60"></div>
                  </div>
                )}

                {!formData.banner && (
                  <Input 
                    placeholder="https://example.com/image.jpg"
                    value={formData.banner}
                    onChange={e => setFormData({...formData, banner: e.target.value})}
                    className="rounded-xl border-2 h-11"
                  />
                )}
              </div>

              <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100 dark:bg-zinc-900/50 dark:border-zinc-800">
                <div className="flex justify-between items-center mb-4">
                  <Label className="text-base font-bold">Course Syllabus</Label>
                  
                  <div className="flex bg-slate-200 dark:bg-zinc-800 p-1 rounded-lg">
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
                      className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${syllabusMode === "visual" ? "bg-white dark:bg-zinc-950 shadow-sm text-primary" : "text-slate-500"}`}
                    >
                      Visual Builder
                    </button>
                    <button 
                      type="button" 
                      onClick={() => {
                        setSyllabusStr(JSON.stringify(syllabusData, null, 2));
                        setSyllabusMode("json");
                      }} 
                      className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${syllabusMode === "json" ? "bg-white dark:bg-zinc-950 shadow-sm text-primary" : "text-slate-500"}`}
                    >
                      JSON Editor
                    </button>
                  </div>
                </div>

                {syllabusMode === "visual" ? (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-slate-200 dark:border-zinc-800 pb-3">
                      <p className="text-sm text-slate-500">Easily manage semesters and units.</p>
                      <Button 
                        type="button" 
                        variant="default" 
                        size="sm" 
                        onClick={handleGenerateTemplate}
                        className="h-8 text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary shadow-none border-0"
                      >
                        Auto-Generate from Duration
                      </Button>
                    </div>
                    
                    {Object.keys(syllabusData).length === 0 ? (
                      <div className="text-center p-8 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-xl text-slate-400">
                        No syllabus defined yet. Click "Auto-Generate from Duration" or switch to JSON editor.
                      </div>
                    ) : (
                      Object.entries(syllabusData).map(([term, units]) => (
                        <div key={term} className="p-4 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 space-y-4 shadow-sm">
                          <div className="font-black text-lg text-slate-900 dark:text-white uppercase">{term}</div>
                          <div className="space-y-4 pl-2 sm:pl-4 border-l-2 border-slate-100 dark:border-zinc-800">
                            {units.map((u: any, idx: number) => (
                              <div key={idx} className="flex flex-col gap-3 p-3 bg-slate-50 dark:bg-zinc-900/50 rounded-lg border border-slate-100 dark:border-zinc-800">
                                <div className="flex items-center gap-3">
                                  <div className="bg-primary text-white px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider whitespace-nowrap shadow-sm">
                                    UNIT {u.unit}
                                  </div>
                                  <Input 
                                    value={u.title} 
                                    onChange={e => updateUnit(term, idx, "title", e.target.value)}
                                    placeholder="Unit Title (e.g. Computer Fundamentals)"
                                    className="h-9 border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-bold"
                                  />
                                </div>
                                <Textarea 
                                  value={u.detail}
                                  onChange={e => updateUnit(term, idx, "detail", e.target.value)}
                                  placeholder="Unit details and topics (e.g. Hardware, Software, OS...)"
                                  className="h-16 border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm resize-none"
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
                    <p className="text-xs text-slate-500 mb-2">Structure: <code>{`{"Term Name": [{"unit": "1", "title": "...", "detail": "..."}]}`}</code></p>
                    <Textarea 
                      placeholder='{"Semester 1": [{"unit": "1", "title": "Intro", "detail": "..."}]}'
                      value={syllabusStr}
                      onChange={e => setSyllabusStr(e.target.value)}
                      className="rounded-xl border-2 min-h-[300px] font-mono text-sm bg-white dark:bg-zinc-950"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status Settings */}
          <div className="flex flex-wrap gap-6 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-2">
              <Switch 
                checked={formData.isActive} 
                onCheckedChange={v => setFormData({...formData, isActive: v})}
              />
              <Label className="font-bold">Active Status</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch 
                checked={formData.popular} 
                onCheckedChange={v => setFormData({...formData, popular: v})}
              />
              <Label className="font-bold">Mark as Popular</Label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-border mt-6">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl h-11 px-6">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="rounded-xl h-11 px-8 font-bold bg-primary text-white shadow-lg shadow-primary/20">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {course ? "Update Course" : "Create Course"}
            </Button>
          </div>
        </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
// refresh
