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
    schedule: ""
  });

  const filteredBatches = batches.filter(b => 
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.course?.title?.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenModal = (batch?: any) => {
    if (batch) {
      setEditingBatch(batch);
      setFormData({
        name: batch.name,
        schedule: batch.schedule || ""
      });
    } else {
      setEditingBatch(null);
      setFormData({
        name: "",
        schedule: ""
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
      if (editingBatch) {
        const res = await updateBatch(editingBatch.id, formData);
        if (res.success) {
          toast.success("Batch updated successfully");
          setBatches(prev => prev.map(b => b.id === editingBatch.id ? { ...b, ...formData } : b));
          setIsModalOpen(false);
        } else {
          toast.error(res.error || "Update failed");
        }
      } else {
        const res = await createBatch({ ...formData, workspaceId });
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
                <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest bg-primary/5 w-fit px-3 py-1 rounded-full">
                  <GraduationCap className="w-3 h-3" />
                  Independent Batch
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-50 dark:border-slate-800/50">
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="font-medium">{batch.schedule || "No schedule set"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="font-medium">{batch._count?.students || 0} Students Enrolled</span>
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
        <DialogContent className="max-w-md rounded-[2.5rem] p-8">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl font-bold">
              {editingBatch ? "Edit Batch" : "Create New Batch"}
            </DialogTitle>
            <DialogDescription>
              Organize your students into groups for better scheduling and attendance tracking.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Batch Name</Label>
              <Input 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                placeholder="e.g., Morning Batch A" 
                className="h-12 rounded-2xl font-bold"
              />
            </div>



            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Schedule (Optional)</Label>
              <Input 
                value={formData.schedule} 
                onChange={(e) => setFormData({ ...formData, schedule: e.target.value })} 
                placeholder="e.g., Mon, Wed, Fri - 10:00 AM" 
                className="h-12 rounded-2xl font-bold"
              />
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
