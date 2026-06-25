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
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col overflow-hidden rounded-[2rem] p-0 border-0 shadow-2xl bg-slate-50 dark:bg-zinc-950">
        
        <DialogHeader className="p-8 pb-4 shrink-0 bg-white dark:bg-zinc-950 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Tag className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white">Manage Categories</DialogTitle>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Create, edit, or deactivate course categories globally.</p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-8 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:rounded-full">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Add/Edit Form - Left Side */}
            <div className={`lg:col-span-4 sticky top-0 bg-white dark:bg-zinc-900 rounded-[1.5rem] border p-6 shadow-sm transition-colors duration-300 ${editingId ? 'border-primary/50 shadow-primary/10 ring-4 ring-primary/5' : 'border-border/50'}`}>
              <div className="flex items-center gap-2 mb-6">
                {editingId ? (
                  <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Edit2 className="h-4 w-4" />
                  </div>
                ) : (
                  <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Plus className="h-4 w-4" />
                  </div>
                )}
                <h3 className="text-lg font-bold">{editingId ? "Edit Category" : "Add New Category"}</h3>
              </div>
              
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="space-y-2">
                  <Label>ID / Value <span className="text-red-500">*</span></Label>
                  <Input 
                    placeholder="e.g. diploma (no spaces)" 
                    value={value} 
                    onChange={e => setValue(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    className="rounded-xl border-2 h-11"
                  />
                  <p className="text-[10px] text-muted-foreground">Used in URLs and matching. Cannot have spaces.</p>
                </div>
                
                <div className="space-y-2">
                  <Label>Display Label <span className="text-red-500">*</span></Label>
                  <Input 
                    placeholder="e.g. Diploma Courses" 
                    value={label} 
                    onChange={e => setLabel(e.target.value)}
                    className="rounded-xl border-2 h-11"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl mt-2">
                  <div>
                    <Label className="font-bold text-base block mb-0.5">Active Status</Label>
                    <span className="text-xs text-muted-foreground">Is this category visible?</span>
                  </div>
                  <Switch checked={isActive} onCheckedChange={setIsActive} />
                </div>

                <div className="flex flex-col gap-3 mt-4">
                  <Button type="submit" disabled={isSubmitting} className="h-11 rounded-xl font-bold bg-primary text-white shadow-lg shadow-primary/20 w-full">
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingId ? "Save Changes" : "Create Category"}
                  </Button>
                  
                  {editingId && (
                    <Button type="button" variant="outline" onClick={resetForm} className="h-11 rounded-xl font-bold border-2 w-full text-slate-500 hover:text-slate-700 hover:bg-slate-50">
                      Cancel Edit
                    </Button>
                  )}
                </div>
              </form>
            </div>

            {/* List - Right Side */}
            <div className="lg:col-span-8 bg-white dark:bg-zinc-900 rounded-[1.5rem] border border-border/50 overflow-hidden shadow-sm">
              {isLoading ? (
                <div className="p-20 flex flex-col items-center justify-center gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-muted-foreground font-medium text-sm">Loading categories...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-slate-50 dark:bg-zinc-950/50 text-muted-foreground font-bold border-b">
                      <tr>
                        <th className="px-6 py-5">Category Name</th>
                        <th className="px-6 py-5">Value ID</th>
                        <th className="px-6 py-5">Status</th>
                        <th className="px-6 py-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {groups.map(group => (
                        <tr key={group.id} className={`transition-colors ${editingId === group.id ? 'bg-primary/5 dark:bg-primary/10' : 'hover:bg-slate-50/50 dark:hover:bg-white/5'}`}>
                          <td className="px-6 py-4">
                            <span className="font-bold text-slate-900 dark:text-white block">{group.label}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-mono text-xs text-primary bg-primary/10 font-medium rounded-md px-2 py-1">
                              {group.value}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Switch 
                                checked={group.isActive} 
                                onCheckedChange={() => handleToggleActive(group)}
                              />
                              <span className={`text-xs font-bold ${group.isActive ? 'text-green-600' : 'text-slate-400'}`}>
                                {group.isActive ? "Active" : "Hidden"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                variant={editingId === group.id ? "default" : "ghost"} 
                                size="sm" 
                                onClick={() => handleEdit(group)} 
                                className={`h-8 px-3 text-xs font-bold rounded-lg ${editingId === group.id ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'}`}
                              >
                                {editingId === group.id ? "Editing..." : "Edit"}
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => setGroupToDelete(group)} className="h-9 w-9 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 rounded-xl">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {groups.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-16 text-center">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <Tag className="h-8 w-8 text-slate-300" />
                              <p className="text-muted-foreground font-medium">No categories found.</p>
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
