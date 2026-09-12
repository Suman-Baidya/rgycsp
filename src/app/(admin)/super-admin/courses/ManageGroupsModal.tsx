"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Loader2, Plus, Edit2, Trash2, Tag } from "lucide-react";
import { toast } from "sonner";
import {
  getGlobalCourseGroups,
  createGlobalCourseGroup,
  updateGlobalCourseGroup,
  deleteGlobalCourseGroup
} from "@/app/actions/globalCourseGroup";

export default function ManageGroupsModal({ isOpen, onClose, onUpdate }: { isOpen: boolean, onClose: () => void, onUpdate: () => void }) {
  const [groups, setGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [value, setValue] = useState("");
  const [label, setLabel] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [groupToDelete, setGroupToDelete] = useState<any>(null);

  const fetchGroups = async () => {
    setIsLoading(true);
    const res = await getGlobalCourseGroups();
    if (res.success && res.groups) {
      setGroups(res.groups);
    } else {
      toast.error(res.error || "Failed to load groups");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchGroups();
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setEditingId(null);
    setValue("");
    setLabel("");
    setIsActive(true);
  };

  const handleEdit = (group: any) => {
    setEditingId(group.id);
    setValue(group.value);
    setLabel(group.label);
    setIsActive(group.isActive);
  };

  const handleDeleteClick = (group: any) => {
    setGroupToDelete(group);
  };

  const confirmDelete = async () => {
    if (!groupToDelete) return;
    try {
      const res = await deleteGlobalCourseGroup(groupToDelete.id);
      if (res.success) {
        toast.success("Category deleted");
        fetchGroups();
        onUpdate();
      } else {
        toast.error(res.error || "Failed to delete");
      }
    } catch (e) {
      toast.error("Failed to delete");
    } finally {
      setGroupToDelete(null);
    }
  };

  const handleToggleActive = async (group: any) => {
    try {
      const res = await updateGlobalCourseGroup(group.id, { isActive: !group.isActive });
      if (res.success) {
        toast.success(`Category ${!group.isActive ? 'activated' : 'deactivated'}`);
        fetchGroups();
        onUpdate();
      } else {
        toast.error(res.error || "Failed to update");
      }
    } catch (e) {
      toast.error("Failed to update");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value || !label) {
      toast.error("Value and Label are required");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        const res = await updateGlobalCourseGroup(editingId, { value, label, isActive });
        if (res.success) {
          toast.success("Category updated");
          resetForm();
          fetchGroups();
          onUpdate();
        } else {
          toast.error(res.error || "Failed to update");
        }
      } else {
        const res = await createGlobalCourseGroup({ value, label, isActive });
        if (res.success) {
          toast.success("Category created");
          resetForm();
          fetchGroups();
          onUpdate();
        } else {
          toast.error(res.error || "Failed to create");
        }
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden rounded-2xl p-0 border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-950">
        
        <DialogHeader className="p-4 sm:p-5 pb-3 shrink-0 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Tag className="h-4 w-4 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Manage Categories</DialogTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Create, edit, or deactivate course categories globally.</p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 custom-scrollbar">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
            
            {/* Add/Edit Form - Left Side */}
            <div className={`lg:col-span-5 bg-white dark:bg-slate-900 rounded-xl border p-4 shadow-sm transition-colors duration-200 ${editingId ? 'border-primary/50 ring-2 ring-primary/10' : 'border-slate-200 dark:border-slate-800'}`}>
              <div className="flex items-center gap-2 mb-4">
                <div className={`h-6 w-6 rounded-md flex items-center justify-center ${editingId ? 'bg-blue-100 text-blue-600' : 'bg-primary/10 text-primary'}`}>
                  {editingId ? <Edit2 className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                </div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">{editingId ? "Edit Category" : "Add New Category"}</h3>
              </div>
              
              <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">ID / Value <span className="text-red-500">*</span></Label>
                  <Input 
                    placeholder="e.g. diploma" 
                    value={value} 
                    onChange={e => setValue(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    className="h-8 sm:h-9 rounded-lg text-xs bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                  />
                  <p className="text-[9px] text-slate-400">Used in URLs and matching. No spaces allowed.</p>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Display Label <span className="text-red-500">*</span></Label>
                  <Input 
                    placeholder="e.g. Diploma Courses" 
                    value={label} 
                    onChange={e => setLabel(e.target.value)}
                    className="h-8 sm:h-9 rounded-lg text-xs bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50/70 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-700/60 rounded-lg">
                  <div>
                    <Label className="font-semibold text-xs text-slate-900 dark:text-white block">Active Status</Label>
                    <span className="text-[10px] text-slate-500">Is this category visible?</span>
                  </div>
                  <Switch checked={isActive} onCheckedChange={setIsActive} className="scale-90" />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="flex-1 h-8 sm:h-9 rounded-lg text-xs font-semibold bg-primary text-white shadow-sm shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    {isSubmitting && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                    {editingId ? "Save Changes" : "Create Category"}
                  </Button>
                  
                  {editingId && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={resetForm} 
                      className="h-8 sm:h-9 px-3 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </div>

            {/* List - Right Side */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              {isLoading ? (
                <div className="p-12 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <p className="text-xs text-slate-500 font-medium">Loading categories...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="text-[10px] uppercase bg-slate-50/50 dark:bg-slate-800/20 text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800/50">
                      <tr>
                        <th className="py-2.5 px-3">Category Name</th>
                        <th className="py-2.5 px-3">Value ID</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                      {groups.map(group => (
                        <tr key={group.id} className={`transition-colors ${editingId === group.id ? 'bg-primary/5 dark:bg-primary/10' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'}`}>
                          <td className="py-2.5 px-3">
                            <span className="font-semibold text-slate-900 dark:text-white block">{group.label}</span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-mono text-[10px] text-primary bg-primary/10 font-bold rounded px-1.5 py-0.5">
                              {group.value}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-1.5">
                              <Switch 
                                checked={group.isActive} 
                                onCheckedChange={() => handleToggleActive(group)}
                                className="scale-75 origin-left"
                              />
                              <span className={`text-[10px] font-bold uppercase ${group.isActive ? 'text-green-600 dark:text-green-400' : 'text-slate-400'}`}>
                                {group.isActive ? "Active" : "Hidden"}
                              </span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button 
                                variant={editingId === group.id ? "default" : "ghost"} 
                                size="sm" 
                                onClick={() => handleEdit(group)} 
                                className={`h-6 px-2 text-[10px] font-semibold rounded ${editingId === group.id ? 'bg-primary text-white shadow-xs' : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-500/10'}`}
                              >
                                {editingId === group.id ? "Editing" : "Edit"}
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => setGroupToDelete(group)} 
                                className="h-6 w-6 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 rounded"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {groups.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center">
                            <div className="flex flex-col items-center justify-center gap-1">
                              <Tag className="h-6 w-6 text-slate-300" />
                              <p className="text-xs text-slate-500 font-medium">No categories found.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
          </div>
        </div>
      </DialogContent>
      
      <ConfirmDialog 
        open={!!groupToDelete} 
        onOpenChange={(open) => !open && setGroupToDelete(null)}
        title="Delete Category"
        description={
          <>
            Are you sure you want to delete <strong className="text-slate-900 dark:text-white">{groupToDelete?.label}</strong>? Courses using this category will still exist but won't be filterable by this group.
          </>
        }
        onConfirm={confirmDelete}
        confirmText="Delete"
        destructive={true}
      />
    </Dialog>
  );
}
