"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, GripVertical, BookOpen, GraduationCap, Clock, Award } from "lucide-react";
import { toast } from "sonner";
import { createCourse, updateCourse } from "@/app/actions/courses";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface Topic {
  title: string;
  items: string[];
}

interface CourseFormProps {
  workspaceId: string;
  course?: any; // Existing course for editing
  onSuccess: () => void;
}

export function CourseForm({ workspaceId, course, onSuccess }: CourseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: course?.title || "",
    code: course?.code || "",
    description: course?.description || "",
    feeAmount: course?.feeAmount?.toString() || "0",
    category: course?.category || "General",
    level: course?.level || "Beginner",
    duration: course?.duration || "",
    image: course?.image || "",
    isActive: course?.isActive !== undefined ? course.isActive : true,
  });

  const [topics, setTopics] = useState<Topic[]>(course?.topics || []);

  const addTopic = () => {
    setTopics([...topics, { title: "", items: [""] }]);
  };

  const removeTopic = (index: number) => {
    setTopics(topics.filter((_, i) => i !== index));
  };

  const updateTopicTitle = (index: number, title: string) => {
    const next = [...topics];
    next[index].title = title;
    setTopics(next);
  };

  const addTopicItem = (topicIndex: number) => {
    const next = [...topics];
    next[topicIndex].items.push("");
    setTopics(next);
  };

  const updateTopicItem = (topicIndex: number, itemIndex: number, value: string) => {
    const next = [...topics];
    next[topicIndex].items[itemIndex] = value;
    setTopics(next);
  };

  const removeTopicItem = (topicIndex: number, itemIndex: number) => {
    const next = [...topics];
    next[topicIndex].items = next[topicIndex].items.filter((_, i) => i !== itemIndex);
    setTopics(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = { ...formData, topics };
    const result = course 
      ? await updateCourse(course.id, data)
      : await createCourse(workspaceId, data);

    setIsSubmitting(false);

    if (result.success) {
      toast.success(course ? "Course updated!" : "Course created!");
      onSuccess();
      router.refresh();
    } else {
      toast.error(result.error || "Something went wrong");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10 py-6 max-h-[80vh] overflow-y-auto px-1 scrollbar-thin scrollbar-thumb-primary/10">
      {/* Basic Info Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 text-primary">
          <BookOpen className="w-5 h-5" />
          <h3 className="font-black uppercase tracking-widest text-xs">Basic Information</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Course Title</Label>
            <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Full Stack Web Development" className="h-12 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Course Code</Label>
            <Input required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} placeholder="e.g. CS-101" className="h-12 rounded-xl" />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Banner Image URL</Label>
          <Input value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} placeholder="https://images.unsplash.com/photo-..." className="h-12 rounded-xl" />
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Short Description</Label>
          <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Briefly describe what students will learn..." rows={3} className="rounded-2xl resize-none" />
        </div>
      </div>

      {/* Details & Pricing Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 text-primary">
          <Award className="w-5 h-5" />
          <h3 className="font-black uppercase tracking-widest text-xs">Curriculum & Fees</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Category</Label>
            <Input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="e.g. Technology" className="h-12 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Level</Label>
            <select value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})} className="w-full h-12 bg-zinc-50 dark:bg-zinc-900 border border-border/40 rounded-xl px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20">
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Duration</Label>
            <Input value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} placeholder="e.g. 6 Months" className="h-12 rounded-xl" />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Fee Amount (Standard)</Label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-black">₹</span>
            <Input type="number" required value={formData.feeAmount} onChange={e => setFormData({...formData, feeAmount: e.target.value})} className="h-12 pl-10 rounded-xl font-black text-primary" />
          </div>
        </div>
      </div>

      {/* Topics Section */}
      <div className="space-y-8 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-primary">
            <GraduationCap className="w-5 h-5" />
            <h3 className="font-black uppercase tracking-widest text-xs">Course Modules / Topics</h3>
          </div>
          <Button type="button" variant="outline" onClick={addTopic} className="rounded-xl h-10 border-primary/20 text-primary font-bold hover:bg-primary/5">
            <Plus className="w-4 h-4 mr-2" /> Add Module
          </Button>
        </div>

        <div className="space-y-6">
          {topics.map((topic, tIdx) => (
            <div key={tIdx} className="p-8 bg-zinc-50 dark:bg-zinc-950 rounded-[2.5rem] border border-border/40 relative group/topic">
              <Button type="button" variant="ghost" size="icon" className="absolute top-4 right-4 h-8 w-8 text-red-500 opacity-0 group-hover/topic:opacity-100 transition-opacity" onClick={() => removeTopic(tIdx)}>
                <Trash2 className="w-4 h-4" />
              </Button>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Module Title</Label>
                  <Input value={topic.title} onChange={e => updateTopicTitle(tIdx, e.target.value)} placeholder="e.g. Introduction to React" className="h-11 rounded-xl font-bold bg-white dark:bg-zinc-900 border-none shadow-sm" />
                </div>

                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Key Items / Lessons</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {topic.items.map((item, iIdx) => (
                      <div key={iIdx} className="flex gap-2 group/item">
                        <Input value={item} onChange={e => updateTopicItem(tIdx, iIdx, e.target.value)} placeholder="e.g. Hooks API" className="h-10 rounded-xl bg-white dark:bg-zinc-900 border-none text-xs" />
                        <Button type="button" variant="ghost" size="icon" className="h-10 w-10 shrink-0 opacity-0 group-hover/item:opacity-100 transition-opacity text-red-400" onClick={() => removeTopicItem(tIdx, iIdx)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button type="button" variant="ghost" onClick={() => addTopicItem(tIdx)} className="h-10 rounded-xl border border-dashed border-border/60 text-muted-foreground hover:bg-primary/5 hover:text-primary text-xs font-bold gap-2">
                      <Plus className="w-3 h-3" /> Add Item
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {topics.length === 0 && (
            <div className="py-12 border-2 border-dashed border-border/60 rounded-[3rem] flex flex-col items-center justify-center text-center space-y-4 text-muted-foreground">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
                <Plus className="w-6 h-6 opacity-20" />
              </div>
              <p className="text-sm font-medium">No modules added yet. Define your syllabus for better student engagement.</p>
            </div>
          )}
        </div>
      </div>

      <div className="pt-6 sticky bottom-0 bg-white dark:bg-slate-950 pb-2">
        <Button type="submit" disabled={isSubmitting} className="w-full h-14 rounded-2xl font-black text-lg bg-primary shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all">
          {isSubmitting ? (course ? "Updating..." : "Creating...") : (course ? "Commit Changes" : "Save Course")}
        </Button>
      </div>
    </form>
  );
}
