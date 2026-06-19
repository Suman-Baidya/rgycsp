"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Database, UserPlus, FileText } from "lucide-react";
import { registerStudentAction } from "@/app/actions/admissions";
import CsvBulkImport from "./CsvBulkImport";

export default function ManualEnrollmentTab({
  workspaceId,
  courses,
  batches
}: {
  workspaceId: string;
  courses: any[];
  batches: any[];
}) {
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    courseId: "",
    batchId: "",
    fees: ""
  });

  const availableBatches = batches.filter(b => b.courseId === formData.courseId);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.mobile || !formData.courseId) {
      toast.error("Please fill required fields (Name, Mobile, Course)");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await registerStudentAction(workspaceId, formData);
      if (res.success) {
        toast.success("Student registered successfully!");
        setFormData({
          fullName: "", email: "", mobile: "", courseId: "", batchId: "", fees: ""
        });
      } else {
        toast.error(res.error || "Failed to register student");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isBulkMode) {
    return (
      <div className="p-8 bg-white dark:bg-slate-900 border-2 border-slate-100/50 dark:border-slate-800/50 rounded-[2.5rem] shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Bulk Import Students</h2>
          <Button variant="outline" onClick={() => setIsBulkMode(false)} className="rounded-xl border-2 font-bold h-10">
            <UserPlus className="w-4 h-4 mr-2" /> Manual Entry
          </Button>
        </div>
        <CsvBulkImport workspaceId={workspaceId} />
      </div>
    );
  }

  return (
    <div className="p-8 bg-white dark:bg-slate-900 border-2 border-slate-100/50 dark:border-slate-800/50 rounded-[2.5rem] shadow-sm">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Manual Enrollment</h2>
        <Button variant="outline" onClick={() => setIsBulkMode(true)} className="rounded-xl border-2 font-bold h-10">
          <Database className="w-4 h-4 mr-2" /> Import CSV
        </Button>
      </div>
      
      <form onSubmit={handleManualSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
           <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs">01</span>
                Student Information
              </h3>
              <div className="grid gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500">Full Name *</label>
                  <Input 
                    required 
                    value={formData.fullName} 
                    onChange={e => setFormData({...formData, fullName: e.target.value})}
                    className="flex h-12 w-full rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-background px-4 py-2 text-sm focus:border-primary transition-all dark:text-white" 
                    placeholder="Enter student name" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 dark:text-slate-500">Mobile Number *</label>
                    <Input 
                      required 
                      value={formData.mobile} 
                      onChange={e => setFormData({...formData, mobile: e.target.value})}
                      className="flex h-12 w-full rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-background px-4 py-2 text-sm focus:border-primary transition-all dark:text-white" 
                      placeholder="9876543210" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 dark:text-slate-500">Email Address</label>
                    <Input 
                      type="email"
                      value={formData.email} 
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="flex h-12 w-full rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-background px-4 py-2 text-sm focus:border-primary transition-all dark:text-white" 
                      placeholder="student@example.com" 
                    />
                  </div>
                </div>
              </div>
           </div>
           
           <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs">02</span>
                Enrollment Details
              </h3>
              <div className="grid gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500">Course *</label>
                  <select 
                    required
                    value={formData.courseId}
                    onChange={e => {
                      const courseId = e.target.value;
                      const course = courses.find(c => c.id === courseId);
                      setFormData({...formData, courseId, batchId: "", fees: course?.feeAmount?.toString() || ""});
                    }}
                    className="flex h-12 w-full rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-background px-4 py-2 text-sm focus:border-primary transition-all dark:text-white"
                  >
                    <option value="">Select a course...</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 dark:text-slate-500">Batch</label>
                    <select 
                      value={formData.batchId}
                      onChange={e => setFormData({...formData, batchId: e.target.value})}
                      className="flex h-12 w-full rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-background px-4 py-2 text-sm focus:border-primary transition-all dark:text-white"
                      disabled={!formData.courseId}
                    >
                      <option value="">Select a batch...</option>
                      {availableBatches.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 dark:text-slate-500">Fees (₹)</label>
                    <Input 
                      type="number" 
                      value={formData.fees}
                      onChange={e => setFormData({...formData, fees: e.target.value})}
                      className="flex h-12 w-full rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-background px-4 py-2 text-sm focus:border-primary transition-all dark:text-white" 
                      placeholder="0" 
                    />
                  </div>
                </div>
              </div>
           </div>
        </div>
        
        <div className="mt-12 flex justify-end border-t pt-8">
          <Button disabled={isSubmitting} type="submit" size="lg" className="rounded-2xl font-bold h-14 px-10 shadow-lg shadow-primary/20">
            {isSubmitting ? "Enrolling..." : "Confirm & Enroll Student"}
          </Button>
        </div>
      </form>
    </div>
  );
}
