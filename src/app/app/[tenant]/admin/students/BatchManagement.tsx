"use client";

import { useState } from "react";
import { Plus, Search, LayoutGrid, Calendar, Clock, Trash2, Pencil, X, Save, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  batches: initialBatches,
  courses 
}: { 
  workspaceId: string; 
  batches: any[];
  courses: any[];
}) {
  const [batches, setBatches] = useState(initialBatches);
  const [search, setSearch] = useState("");
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
    endDate: ""
  });

  const filteredBatches = batches.filter(b => 
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.course?.title?.toLowerCase().includes(search.toLowerCase()) ||
    b.teacherName?.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenModal = (batch?: any) => {
    if (batch) {
      setEditingBatch(batch);
      setFormData({
        name: batch.name,
        schedule: batch.schedule || "",
        courseId: batch.courseId || "independent",
        capacity: batch.capacity?.toString() || "30",
        teacherName: batch.teacherName || "",
        startDate: batch.startDate ? new Date(batch.startDate).toISOString().split('T')[0] : "",
        endDate: batch.endDate ? new Date(batch.endDate).toISOString().split('T')[0] : ""
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
        endDate: ""
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name) {
      toast.error("Please fill in the batch name.");
      return;
    }

    setIsProcessing(true);
    try {
      const payload = {
        name: formData.name,
        schedule: formData.schedule,
        courseId: formData.courseId === "independent" ? undefined : formData.courseId,
        capacity: parseInt(formData.capacity) || 30,
        teacherName: formData.teacherName,
        startDate: formData.startDate ? new Date(formData.startDate) : undefined,
        endDate: formData.endDate ? new Date(formData.endDate) : undefined,
      };

      if (editingBatch) {
        const res = await updateBatch(editingBatch.id, payload);
        if (res.success) {
          toast.success("Batch updated successfully");
          setBatches(prev => prev.map(b => b.id === editingBatch.id ? { ...b, ...res.data } : b));
          setIsModalOpen(false);
        } else {
          toast.error(res.error || "Update failed");
        }
      } else {
        const res = await createBatch({ ...payload, workspaceId });
        if (res.success) {
          toast.success("Batch created successfully");
          // In a real app we'd probably revalidate, but for UI feel:
          window.location.reload(); 
        } else {
          toast.error(res.error || "Creation failed");
        }
      }
    } catch (err) {
      toast.error("An error occurred");
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
        setBatches(batches.filter((b: any) => b.id !== batchToDelete.id));
        toast.success("Batch deleted successfully");
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-6 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search batches..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-12 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-900 transition-all"
          />
        </div>
        <Button onClick={() => handleOpenModal()} className="h-12 px-8 rounded-2xl font-bold gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
          <Plus className="w-5 h-5" /> Create New Batch
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBatches.map((batch) => (
          <div key={batch.id} className="group bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 hover:border-primary/30 transition-all hover:shadow-xl hover:shadow-primary/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
               <Button variant="ghost" size="icon" onClick={() => handleOpenModal(batch)} className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 hover:text-primary">
                 <Pencil className="w-4 h-4" />
               </Button>
               <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(batch)} className="h-10 w-10 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-500 hover:text-white">
                 <Trash2 className="w-4 h-4" />
               </Button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <LayoutGrid className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">{batch.name}</h4>
                {batch.courseId ? (
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 w-fit px-3 py-1 rounded-full">
                    <GraduationCap className="w-3 h-3" />
                    {batch.course?.title || "Linked Course"}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 w-fit px-3 py-1 rounded-full">
                    <LayoutGrid className="w-3 h-3" />
                    Independent Batch
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-50 dark:border-slate-800/50">
                {batch.teacherName && (
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                      <GraduationCap className="w-3 h-3 text-slate-400" />
                    </div>
                    <span className="font-medium text-slate-700 dark:text-slate-300">Teacher: {batch.teacherName}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="font-medium">{batch.schedule || "No schedule set"}</span>
                </div>
                
                {/* Capacity Progress Bar */}
                <div className="pt-2 space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <span>Capacity</span>
                    <span className={cn(
                      batch._count?.students >= (batch.capacity || 30) ? "text-red-500" : "text-primary"
                    )}>
                      {batch._count?.students || 0} / {batch.capacity || 30}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        batch._count?.students >= (batch.capacity || 30) ? "bg-red-500" : "bg-primary"
                      )}
                      style={{ width: `${Math.min(((batch._count?.students || 0) / (batch.capacity || 30)) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
              
              <Button variant="outline" className="w-full rounded-xl font-bold h-11 border-slate-200 dark:border-slate-800 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                View Batch Details
              </Button>
            </div>
          </div>
        ))}

        {filteredBatches.length === 0 && (
          <div className="col-span-full py-24 flex flex-col items-center justify-center text-center space-y-4 bg-slate-50/50 dark:bg-slate-800/20 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
             <div className="w-20 h-20 rounded-[2rem] bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-300">
                <LayoutGrid className="w-10 h-10" />
             </div>
             <div className="space-y-1">
                <p className="text-lg font-bold text-slate-900 dark:text-white">No batches found</p>
                <p className="text-sm text-slate-500">Try adjusting your search or create your first batch.</p>
             </div>
             <Button onClick={() => handleOpenModal()} variant="outline" className="rounded-xl font-bold">
               Create Batch
             </Button>
          </div>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl rounded-[2.5rem] p-8">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl font-bold">
              {editingBatch ? "Edit Batch" : "Create New Batch"}
            </DialogTitle>
            <DialogDescription>
              Organize your students into groups for better scheduling and attendance tracking.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-6 max-h-[60vh] overflow-y-auto px-2 -mx-2">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Associated Course</Label>
              <Select value={formData.courseId} onValueChange={(v) => setFormData({...formData, courseId: v})}>
                <SelectTrigger className="h-12 rounded-2xl font-bold bg-slate-50/50 dark:bg-slate-900/50">
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Batch Name *</Label>
                <Input 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                  placeholder="e.g., Morning Batch A" 
                  className="h-12 rounded-2xl font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Capacity</Label>
                <Input 
                  type="number"
                  value={formData.capacity} 
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })} 
                  className="h-12 rounded-2xl font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Teacher's Name</Label>
              <Input 
                value={formData.teacherName} 
                onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })} 
                placeholder="e.g., John Doe" 
                className="h-12 rounded-2xl font-bold"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Schedule</Label>
              <Input 
                value={formData.schedule} 
                onChange={(e) => setFormData({ ...formData, schedule: e.target.value })} 
                placeholder="e.g., Mon, Wed, Fri - 10:00 AM" 
                className="h-12 rounded-2xl font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Start Date</Label>
                <Input 
                  type="date"
                  value={formData.startDate} 
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} 
                  className="h-12 rounded-2xl font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">End Date</Label>
                <Input 
                  type="date"
                  value={formData.endDate} 
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} 
                  className="h-12 rounded-2xl font-bold"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-xl font-bold flex-1 h-12">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isProcessing} className="rounded-xl font-bold flex-1 h-12 shadow-lg shadow-primary/20">
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
    </div>
  );
}
