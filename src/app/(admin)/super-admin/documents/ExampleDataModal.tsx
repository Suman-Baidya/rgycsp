"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Image as ImageIcon, Type, Save } from "lucide-react";
import { toast } from "sonner";

interface ExampleDataModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  previewData: Record<string, string>;
  setPreviewData: (data: Record<string, string>) => void;
}

export function ExampleDataModal({ open, onOpenChange, previewData, setPreviewData }: ExampleDataModalProps) {
  const [localData, setLocalData] = useState<Record<string, string>>(previewData);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Sync when opened
  React.useEffect(() => {
    if (open) {
      setTimeout(() => {
        setLocalData(previewData);
        setNewKey("");
        setNewValue("");
        setSearchQuery("");
        setIsAddingNew(false);
      }, 0);
    }
  }, [open, previewData]);

  const handleSave = () => {
    setPreviewData(localData);
    onOpenChange(false);
    toast.success("Preview data saved successfully!");
  };

  const handleUpdate = (key: string, value: string) => {
    setLocalData((prev) => ({ ...prev, [key]: value }));
  };

  const handleDelete = (key: string) => {
    setLocalData((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    toast.success(`Variable '${key}' removed`);
  };

  const handleAddNew = () => {
    if (newKey && !localData[newKey]) {
      setLocalData((prev) => ({ ...prev, [newKey]: newValue }));
      toast.success(`Variable '${newKey}' added`);
      setNewKey("");
      setNewValue("");
      setIsAddingNew(false);
    } else if (localData[newKey]) {
      toast.error(`Variable '${newKey}' already exists`);
    }
  };

  const filteredKeys = Object.keys(localData).filter((k) =>
    k.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden bg-white dark:bg-slate-900 rounded-3xl border-0 shadow-2xl">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            Example Preview Data
          </DialogTitle>
          <DialogDescription>
            Manage the dummy data used when you toggle &quot;Preview Mode&quot;. You can add new fields or update image URLs.
          </DialogDescription>
          
          <div className="pt-4">
            <Input 
              placeholder="Search keys..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl"
            />
          </div>
        </DialogHeader>

        <div className="flex-1 px-6 py-4 overflow-y-auto">
          <div className="space-y-3">
            {filteredKeys.map((key) => {
              const val = localData[key];
              const isImage = val.startsWith("http") || val.startsWith("data:image");
              
              return (
                <div key={key} className="flex gap-3 items-start p-3 bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-primary/30 transition-colors">
                  <div className="flex-1 space-y-1.5">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{key}</Label>
                    <div className="flex items-center gap-2">
                      {isImage ? (
                        <ImageIcon className="w-4 h-4 text-primary" />
                      ) : (
                        <Type className="w-4 h-4 text-slate-400" />
                      )}
                      <Input
                        value={val}
                        onChange={(e) => handleUpdate(key, e.target.value)}
                        className="h-9 bg-white dark:bg-slate-900 shadow-sm rounded-lg"
                      />
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="mt-6 h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl flex-shrink-0"
                    onClick={() => handleDelete(key)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        {isAddingNew && (
          <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Add New Variable</Label>
            <div className="flex gap-3">
              <Input 
                placeholder="Variable Key (e.g. schoolName)" 
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                className="flex-1 h-11 bg-white dark:bg-slate-900 shadow-sm rounded-xl"
                autoFocus
              />
              <Input 
                placeholder="Value or Image URL" 
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="flex-[2] h-11 bg-white dark:bg-slate-900 shadow-sm rounded-xl"
                onKeyDown={(e) => e.key === 'Enter' && handleAddNew()}
              />
              <Button 
                onClick={handleAddNew}
                disabled={!newKey}
                className="h-11 rounded-xl px-6 bg-slate-900 hover:bg-slate-800 text-white shadow-md shadow-slate-900/10"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => {
                  setIsAddingNew(false);
                  setNewKey("");
                  setNewValue("");
                }}
                className="h-11 px-4 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
          <Button 
            variant="outline" 
            className="h-11 rounded-xl border-dashed border-2 border-slate-300 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white"
            onClick={() => setIsAddingNew(true)}
            disabled={isAddingNew}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Variable
          </Button>

          <div className="flex gap-3">
            <Button variant="outline" className="h-11 rounded-xl px-6" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button className="h-11 rounded-xl px-8 bg-primary text-primary-foreground shadow-lg shadow-primary/20" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save Data
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
