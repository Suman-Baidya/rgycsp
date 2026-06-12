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
  });
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
      });
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
      });
    }
  }, [course, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const dataToSave = { ...formData, price: Number(formData.price) };
      
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
                <Input 
                  placeholder="e.g. 6 Months"
                  value={formData.duration}
                  onChange={e => setFormData({...formData, duration: e.target.value})}
                  className="rounded-xl border-2 h-11"
                />
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
