"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  Search, 
  LayoutGrid, 
  Calendar, 
  Clock, 
  Trash2, 
  Pencil, 
  GraduationCap, 
  UserCheck, 
  Users 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { createBatch, updateBatch, deleteBatch } from "@/app/actions/batches";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function BatchManagement({ 
  workspaceId, 
  batches: initialBatches = [],
  courses = []
}: { 
  workspaceId: string; 
  batches: any[];
  courses: any[];
}) {
  const router = useRouter();
  const [batches, setBatches] = useState(initialBatches);
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingBatch, setEditingBatch] = useState<any>(null);
  const [batchToDelete, setBatchToDelete] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    schedule: "",
    courseId: "independent",
    capacity: "30",
    teacherName: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: ""
  });

  const filteredBatches = useMemo(() => {
    return batches.filter(b => {
      const q = search.toLowerCase();
      const matchesSearch = 
        !q ||
        b.name?.toLowerCase().includes(q) ||
        b.course?.title?.toLowerCase().includes(q) ||
        b.teacherName?.toLowerCase().includes(q) ||
        b.schedule?.toLowerCase().includes(q);

      const matchesCourse = 
        courseFilter === "all" ||
        (courseFilter === "independent" ? !b.courseId : b.courseId === courseFilter);

      return matchesSearch && matchesCourse;
    });
  }, [batches, search, courseFilter]);

  const handleOpenModal = (batch?: any) => {
    if (batch) {
      setEditingBatch(batch);
      setFormData({
        name: batch.name || "",
        schedule: batch.schedule || "",
        courseId: batch.courseId || "independent",
        capacity: batch.capacity?.toString() || "30",
        teacherName: batch.teacherName || "",
        startDate: batch.startDate ? new Date(batch.startDate).toISOString().split('T')[0] : "",
        endDate: batch.endDate ? new Date(batch.endDate).toISOString().split('T')[0] : "",
        startTime: batch.startTime || "",
        endTime: batch.endTime || ""
      });
    } else {
      setEditingBatch(null);
      setFormData({
        name: "",
        schedule: "",
        courseId: "independent",
        capacity: "30",
        teacherName: "",
        startDate: "",
        endDate: "",
        startTime: "",
        endTime: ""
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a batch name.");
      return;
    }

    setIsProcessing(true);
    try {
      const payload = {
        name: formData.name.trim(),
        schedule: formData.schedule.trim() || undefined,
        courseId: formData.courseId === "independent" || !formData.courseId ? undefined : formData.courseId,
        capacity: parseInt(formData.capacity) || 30,
        teacherName: formData.teacherName.trim() || undefined,
        startDate: formData.startDate ? new Date(formData.startDate) : undefined,
        endDate: formData.endDate ? new Date(formData.endDate) : undefined,
        startTime: formData.startTime || undefined,
        endTime: formData.endTime || undefined,
      };

      if (editingBatch) {
        const res = await updateBatch(editingBatch.id, payload);
        if (res.success) {
          toast.success("Batch updated successfully");
          const linkedCourse = courses.find(c => c.id === payload.courseId);
          setBatches(prev => prev.map(b => b.id === editingBatch.id ? { 
            ...b, 
            ...res.data, 
            course: linkedCourse || (payload.courseId ? b.course : null) 
          } : b));
          setIsModalOpen(false);
          router.refresh();
        } else {
          toast.error(res.error || "Update failed");
        }
      } else {
        const res = await createBatch({ ...payload, workspaceId });
        if (res.success) {
          toast.success("Batch created successfully");
          const linkedCourse = courses.find(c => c.id === payload.courseId);
          const newBatch = {
            ...res.data,
            course: linkedCourse || null,
            _count: { students: 0 }
          };
          setBatches(prev => [newBatch, ...prev]);
          setIsModalOpen(false);
          router.refresh();
        } else {
          toast.error(res.error || "Creation failed");
        }
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteClick = (batch: any) => {
    setBatchToDelete(batch);
  };

  const confirmDelete = async () => {
    if (!batchToDelete) return;
    
    setIsProcessing(true);
    try {
      const result = await deleteBatch(batchToDelete.id);
      if (result.success) {
        setBatches(prev => prev.filter((b: any) => b.id !== batchToDelete.id));
        toast.success("Batch deleted successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete batch");
      }
    } catch (err) {
      toast.error("Delete failed");
    } finally {
      setIsProcessing(false);
      setBatchToDelete(null);
    }
  };

  return (
    <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden bg-white dark:bg-slate-900">
      {/* Integrated Header / Filter Toolbar */}
      <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
          {/* Search & Course Filter */}
          <div className="flex flex-1 flex-wrap sm:flex-nowrap items-center gap-2">
            <div className="relative w-full sm:max-w-[260px] group">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-primary transition-colors pointer-events-none" />
              <Input 
                placeholder="Search batches, teacher..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 placeholder:text-xs placeholder:text-slate-400 font-normal"
              />
            </div>

            <Select value={courseFilter} onValueChange={(val: any) => setCourseFilter(val as string)}>
              <SelectTrigger className="h-8 sm:h-9 w-full sm:w-[190px] text-xs font-medium rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
                <SelectValue placeholder="All Batches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Batches</SelectItem>
                <SelectItem value="independent">Independent Batches</SelectItem>
                {courses.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <span className="hidden md:inline-flex items-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 py-1 bg-slate-100 dark:bg-slate-800/80 rounded-md">
              {filteredBatches.length} {filteredBatches.length === 1 ? 'batch' : 'batches'}
            </span>
          </div>

          {/* Primary Action Button */}
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <Button 
              onClick={() => handleOpenModal()} 
              className="h-8 sm:h-9 px-3 sm:px-4 rounded-lg text-xs font-semibold gap-1.5 shadow-xs bg-primary text-primary-foreground"
            >
              <Plus className="w-3.5 h-3.5" /> Create New Batch
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Content Area */}
      <CardContent className="p-3.5 sm:p-4">
        {filteredBatches.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredBatches.map((batch) => {
              const studentCount = batch._count?.students || 0;
              const capacity = batch.capacity || 30;
              const percentFull = Math.min(Math.round((studentCount / capacity) * 100), 100);
              const isFull = studentCount >= capacity;
              const isNearlyFull = percentFull >= 80 && !isFull;

              return (
                <div 
                  key={batch.id} 
                  className="border border-slate-200/80 dark:border-slate-800 rounded-xl bg-slate-50/40 dark:bg-slate-800/20 hover:bg-white dark:hover:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 transition-all p-3.5 sm:p-4 flex flex-col justify-between group relative overflow-hidden"
                >
                  {/* Top Capacity Accent Line */}
                  <div className={cn(
                    "absolute top-0 left-0 right-0 h-1",
                    isFull ? "bg-red-500" : isNearlyFull ? "bg-amber-500" : "bg-primary"
                  )} />

                  <div className="space-y-3 pt-0.5">
                    {/* Header: Name, Course Tag & Action Buttons */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0 flex-1">
                        <h4 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate" title={batch.name}>
                          {batch.name}
                        </h4>
                        
                        <div className="flex flex-wrap items-center gap-1.5">
                          {batch.courseId ? (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-1.5 py-0.5 rounded uppercase tracking-wider">
                              <GraduationCap className="w-2.5 h-2.5 shrink-0" />
                              <span className="max-w-[140px] truncate">{batch.course?.title || "Linked Course"}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded uppercase tracking-wider">
                              <LayoutGrid className="w-2.5 h-2.5 shrink-0" />
                              Independent Batch
                            </span>
                          )}

                          {isFull && (
                            <span className="text-[9px] font-bold text-red-600 bg-red-50 dark:bg-red-950/50 px-1.5 py-0.5 rounded uppercase tracking-wider">
                              Full
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5 shrink-0">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleOpenModal(batch)} 
                          className="h-7 w-7 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5 transition-colors"
                          title="Edit Batch"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteClick(batch)} 
                          className="h-7 w-7 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          title="Delete Batch"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Metadata: Teacher, Timing, Date Range */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs">
                      {batch.teacherName && (
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                          <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-medium truncate text-xs">
                            Teacher: <span className="font-semibold text-slate-800 dark:text-slate-200">{batch.teacherName}</span>
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-medium truncate text-xs">
                          {batch.schedule || "Regular schedule"}
                          {batch.startTime ? ` • ${batch.startTime}${batch.endTime ? ` - ${batch.endTime}` : ''}` : ''}
                        </span>
                      </div>

                      {(batch.startDate || batch.endDate) && (
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-medium truncate text-[11px]">
                            {batch.startDate ? new Date(batch.startDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "Anytime"}
                            {batch.endDate ? ` to ${new Date(batch.endDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}` : ""}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Capacity Progress Bar at Bottom */}
                  <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/60 space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                      <span className="text-slate-400">Capacity</span>
                      <span className={cn(
                        isFull ? "text-red-600 dark:text-red-400" : isNearlyFull ? "text-amber-600 dark:text-amber-400" : "text-slate-600 dark:text-slate-300"
                      )}>
                        {studentCount} / {capacity} ({percentFull}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          isFull ? "bg-red-500" : isNearlyFull ? "bg-amber-500" : "bg-primary"
                        )}
                        style={{ width: `${percentFull}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="py-12 px-4 flex flex-col items-center justify-center text-center space-y-3 bg-slate-50/50 dark:bg-slate-800/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <div className="space-y-1 max-w-xs">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {search || courseFilter !== "all" ? "No matching batches" : "No batches created yet"}
              </p>
              <p className="text-xs text-slate-500">
                {search || courseFilter !== "all" 
                  ? "Try adjusting your search terms or filters." 
                  : "Organize students into groups with scheduled timing, capacities, and assigned teachers."}
              </p>
            </div>
            <Button 
              onClick={() => {
                setSearch("");
                setCourseFilter("all");
                if (batches.length === 0) handleOpenModal();
              }} 
              className="h-8 px-3 rounded-lg text-xs font-semibold gap-1.5"
            >
              {batches.length === 0 ? (
                <>
                  <Plus className="w-3.5 h-3.5" /> Create First Batch
                </>
              ) : (
                "Clear Filters"
              )}
            </Button>
          </div>
        )}
      </CardContent>

      {/* Create / Edit Batch Modal (Strict Rule 7.7) */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md rounded-2xl p-4 sm:p-5">
          <DialogHeader className="space-y-1 pb-2 border-b border-slate-100 dark:border-slate-800">
            <DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
              {editingBatch ? "Edit Batch" : "Create New Batch"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Organize students into groups for scheduling and tracking.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-3 max-h-[65vh] overflow-y-auto pr-1">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Associated Course</Label>
              <Select value={formData.courseId || ""} onValueChange={(v: any) => setFormData({...formData, courseId: v as string})}>
                <SelectTrigger className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
                  <SelectValue placeholder="Independent Batch (No Course)">
                    {formData.courseId === "independent" || !formData.courseId 
                      ? "Independent Batch (No Course)" 
                      : courses.find(c => c.id === formData.courseId)?.title || "Unknown Course"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="independent">Independent Batch (No Course)</SelectItem>
                  {courses.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Batch Name *</Label>
                <Input 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                  placeholder="e.g., Morning Batch A" 
                  className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Capacity</Label>
                <Input 
                  type="number"
                  value={formData.capacity} 
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })} 
                  className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Teacher's Name</Label>
                <Input 
                  value={formData.teacherName} 
                  onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })} 
                  placeholder="e.g., John Doe" 
                  className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Schedule (Days)</Label>
                <Input 
                  value={formData.schedule} 
                  onChange={(e) => setFormData({ ...formData, schedule: e.target.value })} 
                  placeholder="e.g., Mon, Wed, Fri" 
                  className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Start Time</Label>
                <Input 
                  type="time" 
                  value={formData.startTime} 
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} 
                  className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">End Time</Label>
                <Input 
                  type="time" 
                  value={formData.endTime} 
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} 
                  className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Start Date</Label>
                <Input 
                  type="date" 
                  value={formData.startDate} 
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} 
                  className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">End Date</Label>
                <Input 
                  type="date" 
                  value={formData.endDate} 
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} 
                  className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex-row items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="h-8 sm:h-9 px-3 text-xs rounded-lg font-semibold">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isProcessing} className="h-8 sm:h-9 px-4 text-xs rounded-lg font-semibold bg-primary text-primary-foreground shadow-sm">
              {isProcessing ? "Saving..." : (editingBatch ? "Update Batch" : "Create Batch")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <ConfirmDialog 
        open={!!batchToDelete} 
        onOpenChange={(open) => !open && setBatchToDelete(null)}
        title="Delete Batch"
        description={
          <>
            Are you sure you want to delete <strong className="text-slate-900 dark:text-white">{batchToDelete?.name}</strong>? This action cannot be undone.
          </>
        }
        onConfirm={confirmDelete}
        confirmText="Delete"
        destructive={true}
      />
    </Card>
  );
}
