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
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xl">
        <DialogHeader className="px-4 sm:px-5 pt-4 sm:pt-5 pb-3 sm:pb-4 border-b border-slate-100 dark:border-slate-800">
          <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Example Preview Data
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage the dummy data used when you toggle &quot;Preview Mode&quot;. You can add new fields or update image URLs.
          </DialogDescription>
          
          <div className="pt-3">
            <Input 
              placeholder="Search keys..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 sm:h-9 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 rounded-lg text-xs placeholder:text-xs placeholder:text-slate-400"
            />
          </div>
        </DialogHeader>

        <div className="flex-1 px-4 sm:px-5 py-3 overflow-y-auto">
          <div className="space-y-2.5">
            {filteredKeys.map((key) => {
              const val = localData[key];
              const isImage = val.startsWith("http") || val.startsWith("data:image");
              
              return (
                <div key={key} className="flex gap-2.5 items-start p-2.5 sm:p-3 bg-slate-50/60 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-primary/30 transition-colors">
                  <div className="flex-1 space-y-1">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{key}</Label>
                    <div className="flex items-center gap-2">
                      {isImage ? (
                        <ImageIcon className="w-3.5 h-3.5 text-primary shrink-0" />
                      ) : (
                        <Type className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                      <Input
                        value={val}
                        onChange={(e) => handleUpdate(key, e.target.value)}
                        className="h-8 bg-white dark:bg-slate-900 shadow-sm rounded-lg border-slate-200 dark:border-slate-700 text-xs"
                      />
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="mt-5 h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg shrink-0"
                    onClick={() => handleDelete(key)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        {isAddingNew && (
          <div className="p-3.5 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Add New Variable</Label>
            <div className="flex gap-2">
              <Input 
                placeholder="Key (e.g. schoolName)" 
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                className="flex-1 h-8 sm:h-9 bg-white dark:bg-slate-900 shadow-sm rounded-lg border-slate-200 dark:border-slate-700 text-xs"
                autoFocus
              />
              <Input 
                placeholder="Value or Image URL" 
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="flex-[2] h-8 sm:h-9 bg-white dark:bg-slate-900 shadow-sm rounded-lg border-slate-200 dark:border-slate-700 text-xs"
                onKeyDown={(e) => e.key === 'Enter' && handleAddNew()}
              />
              <Button 
                onClick={handleAddNew}
                disabled={!newKey}
                className="h-8 sm:h-9 rounded-lg px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shrink-0"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => {
                  setIsAddingNew(false);
                  setNewKey("");
                  setNewValue("");
                }}
                className="h-8 sm:h-9 px-2.5 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white shrink-0"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="p-3.5 sm:p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
          <Button 
            variant="outline" 
            className="h-8 sm:h-9 rounded-lg border-dashed border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold px-3"
            onClick={() => setIsAddingNew(true)}
            disabled={isAddingNew}
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            New Variable
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" className="h-8 sm:h-9 rounded-lg px-3.5 text-xs font-medium" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button className="h-8 sm:h-9 rounded-lg px-4 bg-primary text-primary-foreground text-xs font-semibold shadow-sm" onClick={handleSave}>
              <Save className="w-3.5 h-3.5 mr-1.5" />
              Save Data
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
