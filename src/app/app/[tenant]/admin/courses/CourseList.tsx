"use client";

import React, { useState, useMemo } from "react";
import { 
  Plus, Search, MoreVertical, BookOpen, Layers, 
  Tag, Trash2, Edit3, ChevronDown, ChevronRight,
  Filter, ArrowUpDown, CheckSquare, Square,
  CheckCircle2, XCircle, MoreHorizontal, GraduationCap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  deleteCourse, 
  deleteMultipleCourses, 
  createBatch 
} from "@/app/actions/courses";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CourseForm } from "./CourseForm";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function CourseList({ 
  workspaceId, 
  initialCourses 
}: { 
  workspaceId: string; 
  initialCourses: any[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  
  const [courseFormOpen, setCourseFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [batchOpen, setBatchOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const router = useRouter();

  // Filter & Sort Logic
  const processedCourses = useMemo(() => {
    let result = initialCourses.filter(c => 
      (c.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (c.code?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (c.category?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    );

    if (sortConfig) {
      result.sort((a, b) => {
        const valA = a[sortConfig.key] || "";
        const valB = b[sortConfig.key] || "";
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [initialCourses, searchTerm, sortConfig]);

  const toggleSort = (key: string) => {
    setSortConfig(prev => {
      if (prev?.key === key) {
        return prev.direction === 'asc' ? { key, direction: 'desc' } : null;
      }
      return { key, direction: 'asc' };
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === processedCourses.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(processedCourses.map(c => c.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course? All associated batches will be removed.")) return;
    setIsDeleting(true);
    const result = await deleteCourse(id);
    setIsDeleting(false);
    if (result.success) {
      toast.success("Course deleted");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} courses?`)) return;
    setIsDeleting(true);
    const result = await deleteMultipleCourses(selectedIds);
    setIsDeleting(false);
    if (result.success) {
      toast.success(`${selectedIds.length} courses deleted`);
      setSelectedIds([]);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 bg-white dark:bg-zinc-900 border border-border/40 rounded-[2.5rem] shadow-sm">
        <div className="flex flex-1 items-center gap-4">
          <div className="relative w-full max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search by title, code or category..." 
              className="pl-12 h-14 bg-slate-50 dark:bg-zinc-800 border-none rounded-2xl font-bold focus:ring-2 focus:ring-primary/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="h-14 w-14 rounded-2xl border-border/40 hover:bg-primary/5 hover:text-primary">
            <Filter className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <Button 
              variant="destructive" 
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="h-14 px-6 rounded-2xl font-black gap-2 animate-in fade-in slide-in-from-right-4 transition-all"
            >
              <Trash2 className="w-5 h-5" />
              Delete ({selectedIds.length})
            </Button>
          )}
          <Button onClick={() => { setEditingCourse(null); setCourseFormOpen(true); }} className="h-14 px-10 rounded-2xl font-black gap-3 bg-primary shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
            <Plus className="w-5 h-5" />
            Create Course
          </Button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-zinc-900 border border-border/40 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/40 bg-slate-50/50 dark:bg-zinc-950/20">
                <th className="p-6 w-14">
                  <Button variant="ghost" size="icon" onClick={toggleSelectAll} className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
                    {selectedIds.length === processedCourses.length && processedCourses.length > 0 ? (
                      <CheckSquare className="w-5 h-5" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </Button>
                </th>
                <th className="p-6">
                  <button onClick={() => toggleSort('title')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                    Course Details <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="p-6 hidden md:table-cell">
                   <button onClick={() => toggleSort('category')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                    Category <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="p-6 hidden lg:table-cell">
                   <button onClick={() => toggleSort('feeAmount')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                    Standard Fee <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="p-6 text-right">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {processedCourses.map((course) => (
                <React.Fragment key={course.id}>
                  <tr className={cn(
                    "group transition-all hover:bg-slate-50/50 dark:hover:bg-zinc-950/20",
                    selectedIds.includes(course.id) && "bg-primary/5"
                  )}>
                    <td className="p-6">
                       <Button variant="ghost" size="icon" onClick={() => toggleSelect(course.id)} className={cn(
                         "h-8 w-8 rounded-lg transition-colors",
                         selectedIds.includes(course.id) ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-primary/5"
                       )}>
                        {selectedIds.includes(course.id) ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                      </Button>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 overflow-hidden">
                          {course.image ? (
                            <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                          ) : (
                            <BookOpen className="w-6 h-6" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                             <h4 className="font-black text-slate-900 dark:text-white leading-tight">{course.title}</h4>
                             {course.isActive === false && <Badge variant="secondary" className="text-[8px] h-4">Inactive</Badge>}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-tighter bg-muted px-1.5 py-0.5 rounded leading-none">
                              {course.code}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-medium">• {course.batches.length} Batches</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 hidden md:table-cell">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold">{course.category || "General"}</span>
                        <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{course.level || "Beginner"}</span>
                      </div>
                    </td>
                    <td className="p-6 hidden lg:table-cell">
                      <div className="flex flex-col gap-1">
                        <span className="text-lg font-black text-primary">₹{course.feeAmount.toLocaleString()}</span>
                        <span className="text-[10px] text-muted-foreground font-bold">{course.duration || "N/A"} Duration</span>
                      </div>
                    </td>
                    <td className="p-6 text-right">
                       <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => toggleExpand(course.id)} className={cn(
                            "h-10 w-10 rounded-xl transition-all",
                            expandedIds.includes(course.id) ? "bg-primary/10 text-primary rotate-90" : "text-muted-foreground"
                          )}>
                             <ChevronRight className="w-5 h-5" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger render={
                              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl">
                                <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
                              </Button>
                            } />
                            <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2 shadow-2xl">
                              <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-3 py-2">Management</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => { setEditingCourse(course); setCourseFormOpen(true); }} className="rounded-xl px-3 py-2 gap-3 cursor-pointer focus:bg-primary/5 focus:text-primary font-bold">
                                <Edit3 className="w-4 h-4" /> Edit Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { setSelectedCourseId(course.id); setBatchOpen(true); }} className="rounded-xl px-3 py-2 gap-3 cursor-pointer focus:bg-primary/5 focus:text-primary font-bold">
                                <Plus className="w-4 h-4" /> Add Batch
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="my-2" />
                              <DropdownMenuItem onClick={() => handleDelete(course.id)} className="rounded-xl px-3 py-2 gap-3 cursor-pointer focus:bg-red-50 focus:text-red-600 font-bold text-red-500">
                                <Trash2 className="w-4 h-4" /> Delete Course
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                       </div>
                    </td>
                  </tr>

                  {/* Expanded Syllabus View */}
                  <AnimatePresence>
                    {expandedIds.includes(course.id) && (
                      <motion.tr 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-slate-50/30 dark:bg-zinc-950/10"
                      >
                        <td colSpan={5} className="p-0 border-b border-border/20">
                          <div className="p-10 pl-24 grid grid-cols-1 lg:grid-cols-2 gap-12">
                             <div className="space-y-6">
                                <div className="flex items-center gap-3 text-primary">
                                   <GraduationCap className="w-5 h-5" />
                                   <h5 className="text-xs font-black uppercase tracking-widest">Course Syllabus / Modules</h5>
                                </div>
                                <div className="space-y-4">
                                  {(course.topics as any[] || []).map((topic, idx) => (
                                    <div key={idx} className="p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-border/40 shadow-sm space-y-4">
                                       <h6 className="font-black text-slate-900 dark:text-white flex items-center gap-3">
                                          <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-[10px]">{idx + 1}</div>
                                          {topic.title}
                                       </h6>
                                       <div className="flex flex-wrap gap-2">
                                          {(topic.items as string[]).map((item, iIdx) => (
                                            <Badge key={iIdx} variant="secondary" className="bg-slate-100 dark:bg-zinc-800 text-muted-foreground font-medium rounded-lg text-[10px] px-2 py-1">
                                               {item}
                                            </Badge>
                                          ))}
                                       </div>
                                    </div>
                                  ))}
                                  {(!course.topics || course.topics.length === 0) && (
                                    <p className="text-xs italic text-muted-foreground pl-4">No syllabus modules defined yet.</p>
                                  )}
                                </div>
                             </div>

                             <div className="space-y-6">
                                <div className="flex items-center gap-3 text-primary">
                                   <Layers className="w-5 h-5" />
                                   <h5 className="text-xs font-black uppercase tracking-widest">Active Batches</h5>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  {course.batches.map((batch: any) => (
                                    <div key={batch.id} className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-border/40 flex items-center gap-3">
                                       <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                                       <span className="text-sm font-black text-slate-700 dark:text-slate-300">{batch.name}</span>
                                    </div>
                                  ))}
                                  <Button onClick={() => { setSelectedCourseId(course.id); setBatchOpen(true); }} variant="outline" className="h-12 rounded-2xl border-dashed border-border/60 text-muted-foreground hover:bg-primary/5 hover:text-primary text-xs font-bold gap-2">
                                    <Plus className="w-4 h-4" /> Add Batch
                                  </Button>
                                </div>
                             </div>
                          </div>
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {processedCourses.length === 0 && (
        <div className="py-32 flex flex-col items-center justify-center text-center space-y-6 bg-white dark:bg-zinc-900 rounded-[3.5rem] border border-dashed border-border/60 shadow-sm">
          <div className="w-24 h-24 rounded-full bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-muted-foreground/30">
            <BookOpen className="w-12 h-12" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">No programs found</h3>
            <p className="text-slate-600 dark:text-slate-400 font-medium max-w-xs mx-auto">Try matching with another keyword or create a new course to begin.</p>
          </div>
          <Button onClick={() => { setEditingCourse(null); setCourseFormOpen(true); }} className="rounded-2xl h-12 px-8 font-black gap-2">
            <Plus className="w-5 h-5" /> Start Designing
          </Button>
        </div>
      )}

      {/* Main Course Form Dialog */}
      <Dialog open={courseFormOpen} onOpenChange={setCourseFormOpen}>
        <DialogContent className="sm:max-w-[800px] rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="p-10 bg-slate-950 text-white flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-3xl font-black">{editingCourse ? "Edit Course" : "New Program"}</DialogTitle>
              <p className="text-zinc-400 text-sm font-medium">Define your curriculum and topic-wise details.</p>
            </div>
            <div className="p-3 bg-white/10 rounded-2xl">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
          </div>
          <div className="p-10 bg-white dark:bg-slate-950">
            <CourseForm 
              workspaceId={workspaceId} 
              course={editingCourse} 
              onSuccess={() => setCourseFormOpen(false)} 
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
