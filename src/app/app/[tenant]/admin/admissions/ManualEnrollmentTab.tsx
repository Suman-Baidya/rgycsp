"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Database, UserPlus, Save, CheckCircle2, Edit2, XCircle, Trash2, Search, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { saveDraftApplication, finalEnrollApplication, updatePendingApplication, deleteDraftApplications } from "@/app/actions/admissions";
import CsvBulkImport from "./CsvBulkImport";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { getPincodeDetails } from "@/app/actions/pincode";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
export default function ManualEnrollmentTab({
  workspaceId,
  courses,
  batches,
  drafts = [],
  editingOnlineApp,
  onCancelEdit
}: {
  workspaceId: string;
  courses: any[];
  batches: any[];
  drafts?: any[];
  editingOnlineApp?: any;
  onCancelEdit?: () => void;
}) {
  const isEditingOnline = !!editingOnlineApp;
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [selectedDraftIds, setSelectedDraftIds] = useState<string[]>([]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionLabel: string;
    actionVariant: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    onConfirm: () => void;
  }>({
    isOpen: false, title: "", description: "", actionLabel: "", actionVariant: "default", onConfirm: () => {}
  });

  const filteredDrafts = drafts.filter(draft => 
    (draft.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
    (draft.applicationNo || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (draft.mobile || "").includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredDrafts.length / itemsPerPage);
  const paginatedDrafts = filteredDrafts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedDraftIds(paginatedDrafts.map(d => d.id));
    else setSelectedDraftIds([]);
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) setSelectedDraftIds(prev => [...prev, id]);
    else setSelectedDraftIds(prev => prev.filter(draftId => draftId !== id));
  };

  const handleDeleteDrafts = (ids: string[]) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Drafts",
      description: `Are you sure you want to delete ${ids.length} selected draft(s)? This action cannot be undone.`,
      actionLabel: "Delete",
      actionVariant: "destructive",
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        setIsSubmitting(true);
        try {
          const res = await deleteDraftApplications(workspaceId, ids);
          if (res.success) {
            toast.success(`Deleted ${ids.length} draft(s).`);
            setSelectedDraftIds([]);
          } else {
            toast.error((res as any).error || "Failed to delete drafts.");
          }
        } catch (e) {
          toast.error("Error occurred while deleting drafts.");
        } finally {
          setIsSubmitting(false);
        }
      }
    });
  };

  const handleBulkApprove = (ids: string[]) => {
    setConfirmDialog({
      isOpen: true,
      title: "Approve Drafts",
      description: `Are you sure you want to approve ${ids.length} selected draft(s)?\nEnsure all selected drafts have mandatory fields (Name, Mobile, Course).`,
      actionLabel: "Approve",
      actionVariant: "default",
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        setIsSubmitting(true);
        let successCount = 0;
        let failCount = 0;
        try {
          for (const id of ids) {
            const res = await finalEnrollApplication(workspaceId, id);
            if (res.success) successCount++;
            else failCount++;
          }
          if (successCount > 0) toast.success(`Successfully approved ${successCount} student(s).`);
          if (failCount > 0) toast.error(`Failed to approve ${failCount} student(s). Check missing fields.`);
          setSelectedDraftIds([]);
        } catch (e) {
          toast.error("Error occurred during bulk approval.");
        } finally {
          setIsSubmitting(false);
        }
      }
    });
  };

  const [formData, setFormData] = useState({
    fullName: "", email: "", mobile: "", whatsapp: "", courseId: "", batchId: "", fees: "",
    fatherName: "", motherName: "", guardianPhone: "", dob: "", gender: "", bloodGroup: "", religion: "", caste: "",
    vill: "", po: "", ps: "", dist: "", pin: "", state: "",
    qualName: "", qualYear: "", qualPercent: "", qualBoard: "",
    photoUrl: "", signatureUrl: "", idProofUrl: "",
    customData: {} as any
  });

  const loadDraft = (draft: any) => {
    setActiveDraftId(draft.id);
    const address = draft.address ? (typeof draft.address === 'string' ? JSON.parse(draft.address) : draft.address) : null;
    const qual = draft.qualification ? (typeof draft.qualification === 'string' ? JSON.parse(draft.qualification) : draft.qualification) : null;
    
    const formatDobForForm = (dobString: string | Date | null) => {
      if (!dobString) return "";
      const d = new Date(dobString);
      if (isNaN(d.getTime())) return "";
      return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    };

    setFormData({
      fullName: draft.fullName || "",
      email: draft.email || "",
      mobile: draft.mobile || "",
      whatsapp: draft.whatsapp || "",
      courseId: draft.courseId || "",
      batchId: draft.batchId || "",
      fees: draft.fees?.toString() || "",
      fatherName: draft.fatherName || "",
      motherName: draft.motherName || "",
      guardianPhone: draft.guardianPhone || "",
      dob: formatDobForForm(draft.dob),
      gender: draft.gender || "",
      bloodGroup: draft.bloodGroup || "",
      religion: draft.religion || "",
      caste: draft.caste || "",
      vill: address?.vill || "",
      po: address?.po || "",
      ps: address?.ps || "",
      dist: address?.dist || "",
      pin: address?.pin || "",
      state: address?.state || "",
      qualName: qual?.name || "",
      qualYear: qual?.year || "",
      qualPercent: qual?.percentage || "",
      qualBoard: qual?.board || "",
      photoUrl: draft.photoUrl || "",
      signatureUrl: draft.signatureUrl || "",
      idProofUrl: draft.idProofUrl || "",
      customData: draft.customData || {}
    });
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearForm = () => {
    setActiveDraftId(null);
    setFormData({
      fullName: "", email: "", mobile: "", whatsapp: "", courseId: "", batchId: "", fees: "",
      fatherName: "", motherName: "", guardianPhone: "", dob: "", gender: "", bloodGroup: "", religion: "", caste: "",
      vill: "", po: "", ps: "", dist: "", pin: "", state: "",
      qualName: "", qualYear: "", qualPercent: "", qualBoard: "",
      photoUrl: "", signatureUrl: "", idProofUrl: "",
      customData: {}
    });
    setIsFormOpen(false);
  };

  const handlePinBlur = async () => {
    if (formData.pin && formData.pin.length === 6) {
      toast.info("Fetching location details...");
      const res = await getPincodeDetails(formData.pin);
      if (res.success) {
        setFormData(prev => ({ ...prev, dist: res.district || "", state: res.state || "" }));
        toast.success("Location details fetched successfully");
      } else {
        toast.error("Invalid PIN code or no details found");
      }
    }
  };

  const handleWhatsappCheck = (checked: boolean) => {
    if (checked) setFormData(prev => ({ ...prev, whatsapp: prev.mobile }));
    else setFormData(prev => ({ ...prev, whatsapp: "" }));
  };

  useEffect(() => {
    if (editingOnlineApp) {
      loadDraft(editingOnlineApp);
    }
  }, [editingOnlineApp]);

  const handleCancel = () => {
    if (isEditingOnline && onCancelEdit) {
      onCancelEdit();
    } else {
      clearForm();
    }
  };

  const parseDDMMYYYYtoISO = (dateStr: string) => {
    if (!dateStr || dateStr.length !== 10) return dateStr;
    const [dd, mm, yyyy] = dateStr.split('/');
    if (!dd || !mm || !yyyy) return dateStr;
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleSaveAndApprove = async () => {
    const missingFields: string[] = [];
    if (!formData.fullName) missingFields.push("Full Name");
    if (!formData.mobile) missingFields.push("Mobile");
    if (!formData.fatherName) missingFields.push("Father's Name");
    if (!formData.motherName) missingFields.push("Mother's Name");
    if (!formData.dob) missingFields.push("Date of Birth");
    if (!formData.vill || !formData.po || !formData.ps || !formData.dist || !formData.pin || !formData.state) {
      missingFields.push("Complete Address");
    }
    if (!formData.courseId) missingFields.push("Course");
    if (!formData.batchId) missingFields.push("Batch");
    if (!formData.photoUrl) missingFields.push("Photo");
    if (!formData.signatureUrl) missingFields.push("Signature");
    if (!formData.idProofUrl) missingFields.push("ID Proof");

    if (missingFields.length > 0) {
      toast.error(`Please complete: ${missingFields.join(', ')}`);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = { ...formData, dob: parseDDMMYYYYtoISO(formData.dob) };
      const updateRes = await updatePendingApplication(workspaceId, activeDraftId!, payload);
      if (!updateRes.success) {
        toast.error(updateRes.error || "Failed to save changes.");
        setIsSubmitting(false);
        return;
      }
      
      const enrollRes = await finalEnrollApplication(workspaceId, activeDraftId!, {
        courseId: formData.courseId,
        batchId: formData.batchId,
        fees: formData.fees
      });

      if (enrollRes.success) {
        toast.success("Application Approved successfully!");
        if (onCancelEdit) onCancelEdit();
        else clearForm();
      } else {
        toast.error((enrollRes as any).error || "Failed to approve application.");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    try {
      const payload = { ...formData, dob: parseDDMMYYYYtoISO(formData.dob) };
      const res = await saveDraftApplication(workspaceId, payload, activeDraftId || undefined);
      if (res.success) {
        toast.success("Draft saved successfully!");
        clearForm();
      } else {
        toast.error((res as any).error || "Failed to save draft");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalEnroll = async () => {
    const missingFields: string[] = [];
    if (!formData.fullName) missingFields.push("Full Name");
    if (!formData.mobile) missingFields.push("Mobile");
    if (!formData.fatherName) missingFields.push("Father's Name");
    if (!formData.motherName) missingFields.push("Mother's Name");
    if (!formData.dob) missingFields.push("Date of Birth");
    if (!formData.vill || !formData.po || !formData.ps || !formData.dist || !formData.pin || !formData.state) {
      missingFields.push("Complete Address");
    }
    if (!formData.courseId) missingFields.push("Course");
    if (!formData.batchId) missingFields.push("Batch");
    
    if (!formData.photoUrl) missingFields.push("Photo");
    if (!formData.signatureUrl) missingFields.push("Signature");
    if (!formData.batchId) missingFields.push("Batch");

    if (missingFields.length > 0) {
      toast.error(`Please complete: ${missingFields.join(', ')}`);
      return;
    }
    
    setIsSubmitting(true);
    try {
      const payload = { ...formData, dob: parseDDMMYYYYtoISO(formData.dob) };
      const draftRes = await saveDraftApplication(workspaceId, payload, activeDraftId || undefined);
      if (!draftRes.success || !(draftRes as any).application) {
        toast.error((draftRes as any).error || "Failed to process application data.");
        setIsSubmitting(false);
        return;
      }
      const enrollRes = await finalEnrollApplication(workspaceId, (draftRes as any).application.id, {
        courseId: formData.courseId,
        batchId: formData.batchId,
        fees: formData.fees
      });

      if (enrollRes.success) {
        toast.success("Student finally enrolled and moved to Current Unregistered!");
        clearForm();
      } else {
        toast.error((enrollRes as any).error || "Failed to enroll student.");
      }
    } catch (error) {
      toast.error("An error occurred during enrollment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDirectFinalEnroll = async (draft: any) => {
    if (!draft.fullName || !draft.mobile || !draft.courseId) {
      toast.error("Draft is missing mandatory fields (Name, Mobile, Course). Please click Edit first.");
      return;
    }
    setIsSubmitting(true);
    try {
      const enrollRes = await finalEnrollApplication(workspaceId, draft.id);
      if (enrollRes.success) {
        toast.success("Student finally enrolled and moved to Current Unregistered!");
        if (activeDraftId === draft.id) clearForm();
      } else {
        toast.error((enrollRes as any).error || "Failed to enroll student.");
      }
    } catch (error) {
      toast.error("An error occurred during enrollment");
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
    <div className="space-y-8">
      {/* Form Section Modal */}
      <Dialog open={isFormOpen} onOpenChange={(open) => !open && handleCancel()}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden rounded-[2.5rem] p-0 border-2 border-slate-100 dark:border-slate-800">
          <div className="flex-1 overflow-y-auto p-8 sm:p-10 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
            <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-bold tracking-tight">
              {isEditingOnline ? "Review Online Application" : (activeDraftId ? "Editing Draft Application" : "New Manual Enrollment")}
            </DialogTitle>
            <DialogDescription>
              {isEditingOnline ? "Edit the submitted application and assign a batch before approving." : "Fill out the details below. You can save as a draft to complete later, or Final Enroll if all required fields are present."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
             {/* Column 1 */}
             <div className="space-y-10">
                
                {/* 01 Personal Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b pb-2">
                    <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs">01</span>
                    Personal Information
                  </h3>
                  
                  <div className="grid gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400">Full Name *</label>
                      <Input value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="h-11 rounded-xl" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400">Father's Name</label>
                        <Input value={formData.fatherName} onChange={e => setFormData({...formData, fatherName: e.target.value})} className="h-11 rounded-xl" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400">Mother's Name</label>
                        <Input value={formData.motherName} onChange={e => setFormData({...formData, motherName: e.target.value})} className="h-11 rounded-xl" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400">Guardian Phone</label>
                        <Input value={formData.guardianPhone} onChange={e => setFormData({...formData, guardianPhone: e.target.value})} className="h-11 rounded-xl" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400">Date of Birth</label>
                        <Input 
                          type="text" 
                          placeholder="DD/MM/YYYY"
                          value={formData.dob} 
                          onChange={e => {
                            let val = e.target.value.replace(/\D/g, '');
                            if (val.length > 8) val = val.slice(0, 8);
                            if (val.length >= 2 && val.length < 4) val = val.slice(0,2) + '/' + val.slice(2);
                            else if (val.length >= 4) val = val.slice(0,2) + '/' + val.slice(2,4) + '/' + val.slice(4,8);
                            setFormData({...formData, dob: val});
                          }} 
                          maxLength={10}
                          className="h-11 rounded-xl" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400">Gender</label>
                        <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="flex h-11 w-full rounded-xl border-2 border-slate-100 bg-background px-3 py-2 text-sm focus:border-primary outline-none">
                          <option value="">Select</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400">Blood Group</label>
                        <select value={formData.bloodGroup} onChange={e => setFormData({...formData, bloodGroup: e.target.value})} className="flex h-11 w-full rounded-xl border-2 border-slate-100 bg-background px-3 py-2 text-sm focus:border-primary outline-none">
                          <option value="">Select</option>
                          {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400">Religion</label>
                        <Input value={formData.religion} onChange={e => setFormData({...formData, religion: e.target.value})} className="h-11 rounded-xl" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400">Caste</label>
                        <select value={formData.caste} onChange={e => setFormData({...formData, caste: e.target.value})} className="flex h-11 w-full rounded-xl border-2 border-slate-100 bg-background px-3 py-2 text-sm focus:border-primary outline-none">
                          <option value="">Select</option>
                          {["GEN", "SC", "ST", "OBC", "Others"].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

             </div>

             {/* Row 1 - Column 2 */}
             <div className="space-y-10">
                
                {/* 02 Contact & Address */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b pb-2">
                    <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs">02</span>
                    Contact & Address
                  </h3>
                  
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400">Mobile *</label>
                        <Input value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="h-11 rounded-xl" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400">Email</label>
                        <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="h-11 rounded-xl" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-400">WhatsApp Number</label>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="same-wp-admin" onCheckedChange={handleWhatsappCheck} />
                          <label htmlFor="same-wp-admin" className="text-[10px] font-bold text-slate-500 cursor-pointer">Same as Mobile</label>
                        </div>
                      </div>
                      <Input value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="h-11 rounded-xl" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400">PIN Code</label>
                        <Input value={formData.pin} onChange={e => setFormData({...formData, pin: e.target.value})} onBlur={handlePinBlur} maxLength={6} className="h-11 rounded-xl" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400">State</label>
                        <Input value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="h-11 rounded-xl" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400">District</label>
                        <Input value={formData.dist} onChange={e => setFormData({...formData, dist: e.target.value})} className="h-11 rounded-xl" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400">Police Station</label>
                        <Input value={formData.ps} onChange={e => setFormData({...formData, ps: e.target.value})} className="h-11 rounded-xl" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400">Post Office</label>
                        <Input value={formData.po} onChange={e => setFormData({...formData, po: e.target.value})} className="h-11 rounded-xl" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400">Village / Street</label>
                        <Input value={formData.vill} onChange={e => setFormData({...formData, vill: e.target.value})} className="h-11 rounded-xl" />
                      </div>
                    </div>
                  </div>
                </div>
             </div>
          </div>

          {/* Row 2: Academic & Course */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-slate-100 dark:border-slate-800 mt-10">
             {/* Row 2 - Column 1 */}
             <div className="space-y-10">
                {/* 03 Academic Details */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b pb-2">
                    <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs">03</span>
                    Academic Details
                  </h3>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400">Qualification Name</label>
                        <Input value={formData.qualName} onChange={e => setFormData({...formData, qualName: e.target.value})} placeholder="e.g. 10th/12th" className="h-11 rounded-xl" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400">Board/University</label>
                        <Input value={formData.qualBoard} onChange={e => setFormData({...formData, qualBoard: e.target.value})} className="h-11 rounded-xl" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400">Year of Passing</label>
                        <Input value={formData.qualYear} onChange={e => setFormData({...formData, qualYear: e.target.value})} maxLength={4} className="h-11 rounded-xl" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400">Percentage</label>
                        <Input value={formData.qualPercent} onChange={e => setFormData({...formData, qualPercent: e.target.value})} className="h-11 rounded-xl" />
                      </div>
                    </div>
                  </div>
                </div>
             </div>

             {/* Row 2 - Column 2 */}
             <div className="space-y-10">
                {/* 04 Course Details */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b pb-2">
                    <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs">04</span>
                    Course Details
                  </h3>
                  <div className="grid gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400">Select Course *</label>
                      <select value={formData.courseId} onChange={(e) => setFormData({...formData, courseId: e.target.value, batchId: ""})} className="flex h-11 w-full rounded-xl border-2 border-slate-100 bg-background px-3 py-2 text-sm focus:border-primary outline-none">
                        <option value="">Select a Course</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.title} - ₹{c.feeAmount}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400">Assign Batch (Optional)</label>
                        <select value={formData.batchId} onChange={(e) => setFormData({...formData, batchId: e.target.value})} className="flex h-11 w-full rounded-xl border-2 border-slate-100 bg-background px-3 py-2 text-sm focus:border-primary outline-none">
                          <option value="">Select Batch</option>
                          {batches.filter(b => !b.courseId || b.courseId === formData.courseId).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400">Admission Fees Received</label>
                        <Input type="number" value={formData.fees} onChange={e => setFormData({...formData, fees: e.target.value})} className="h-11 rounded-xl" placeholder="₹ Amount" />
                      </div>
                    </div>
                  </div>
                </div>
             </div>
          </div>

          {/* 05 Documents (Full Width) */}
          <div className="space-y-6 pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b pb-2">
              <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs">05</span>
              Documents
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400">Photo</label>
                <ImageUpload value={formData.photoUrl} onChange={(url) => setFormData({...formData, photoUrl: url})} maxSizeK={100} folder={`RGYCSP/Workspaces/${workspaceId}/admissions`} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400">Signature</label>
                <ImageUpload value={formData.signatureUrl} onChange={(url) => setFormData({...formData, signatureUrl: url})} maxSizeK={100} folder={`RGYCSP/Workspaces/${workspaceId}/admissions`} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400">ID Proof</label>
                <ImageUpload value={formData.idProofUrl} onChange={(url) => setFormData({...formData, idProofUrl: url})} maxSizeK={1024} folder={`RGYCSP/Workspaces/${workspaceId}/admissions`} />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
            {isEditingOnline ? (
              <>
                <Button 
                  type="button" 
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  variant="outline"
                  className="flex-1 h-14 rounded-2xl border-2 font-bold text-base hover:bg-slate-50 text-slate-600"
                >
                  <XCircle className="w-5 h-5 mr-2" /> Cancel
                </Button>
                
                <Button 
                  type="button" 
                  onClick={handleSaveAndApprove}
                  disabled={isSubmitting}
                  className="flex-1 h-14 rounded-2xl font-bold text-base shadow-lg hover:shadow-xl transition-all bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <CheckCircle2 className="w-5 h-5 mr-2" /> {isSubmitting ? "Approving..." : "Save & Approve"}
                </Button>
              </>
            ) : (
              <>
                <Button 
                  type="button" 
                  onClick={handleSaveDraft}
                  disabled={isSubmitting}
                  variant="outline"
                  className="flex-1 h-14 rounded-2xl border-2 font-bold text-base bg-amber-50 hover:bg-amber-100 hover:text-amber-700 text-amber-600 border-amber-200"
                >
                  <Save className="w-5 h-5 mr-2" /> {isSubmitting ? "Saving..." : "Save as Draft"}
                </Button>
                
                <Button 
                  type="button" 
                  onClick={handleFinalEnroll}
                  disabled={isSubmitting}
                  className="flex-1 h-14 rounded-2xl font-bold text-base shadow-lg hover:shadow-xl transition-all"
                >
                  <CheckCircle2 className="w-5 h-5 mr-2" /> {isSubmitting ? "Enrolling..." : "Final Enroll"}
                </Button>
              </>
            )}
          </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Drafts Table - Always Visible */}
      <div className="p-8 bg-white dark:bg-slate-900 border-2 border-slate-100/50 dark:border-slate-800/50 rounded-[2.5rem] shadow-sm animate-in fade-in duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <span className="w-2 h-6 bg-amber-400 rounded-full"></span>
            Current Drafts ({drafts.length})
          </h2>
          <div className="flex gap-3">
            <Button onClick={() => setIsFormOpen(true)} className="rounded-xl font-bold h-10 shadow-sm">
              <UserPlus className="w-4 h-4 mr-2" /> New Entry Student
            </Button>
            <Button variant="outline" onClick={() => setIsBulkMode(true)} className="rounded-xl border-2 font-bold h-10">
              <Database className="w-4 h-4 mr-2" /> Import CSV
            </Button>
          </div>
        </div>

        {/* Search & Pagination Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm mb-6">
          <div className="relative flex-1 max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name, app no, mobile..." 
              className="pl-10 rounded-xl border-slate-200 font-medium h-10"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto justify-between">
             <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
                  Page {currentPage} of {totalPages || 1}
                </span>
                <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-inner">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-lg"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-lg"
                    disabled={currentPage === totalPages || totalPages === 0}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
             </div>
          </div>
        </div>
        
        {drafts.length > 0 ? (
          <div className="space-y-4">
            {/* Bulk Actions Bar */}
            {selectedDraftIds.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-slate-100 dark:border-slate-700/50 gap-4">
                <div className="flex items-center gap-3">
                  <Checkbox 
                    checked={drafts.length > 0 && selectedDraftIds.length === drafts.length} 
                    onCheckedChange={handleSelectAll} 
                  />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{selectedDraftIds.length} student(s) selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="destructive" size="sm" className="h-9 rounded-xl text-xs font-bold shadow-sm hover:shadow-md transition-all" onClick={() => handleDeleteDrafts(selectedDraftIds)} disabled={isSubmitting}>
                    <Trash2 className="w-4 h-4 mr-1.5" /> Delete Selected
                  </Button>
                  <Button size="sm" className="h-9 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow-md transition-all" onClick={() => handleBulkApprove(selectedDraftIds)} disabled={isSubmitting}>
                    <CheckCircle2 className="w-4 h-4 mr-1.5" /> Approve Selected
                  </Button>
                </div>
              </div>
            )}
            
            {/* Select All Bar (when no items selected) */}
            {selectedDraftIds.length === 0 && paginatedDrafts.length > 0 && (
              <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-slate-100 dark:border-slate-700/50">
                <Checkbox 
                  checked={false} 
                  onCheckedChange={handleSelectAll} 
                />
                <span className="text-sm font-bold text-slate-500">Select All on Page</span>
              </div>
            )}

            {filteredDrafts.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/20 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-400">No Drafts Match Search</h3>
                <p className="text-sm text-slate-500 mt-1">Try adjusting your search terms.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {paginatedDrafts.map((draft, index) => {
                    const course = courses.find(c => c.id === draft.courseId);
                    
                    const formatDDMMYYYY = (dateString: string | Date) => {
                      if (!dateString) return "-";
                      const d = new Date(dateString);
                      if (isNaN(d.getTime())) return "-";
                      return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
                    };

                    return (
                      <div key={draft.id} className="group relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-5 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-primary/5 hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-300">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                          
                          {/* Left Side: Applicant Info with Checkbox */}
                          <div className="flex items-center gap-5">
                            <Checkbox 
                              checked={selectedDraftIds.includes(draft.id)} 
                              onCheckedChange={(c) => handleSelectOne(draft.id, !!c)} 
                              className="mt-1 self-start md:self-auto"
                            />
                            <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-700 shadow-sm group-hover:scale-105 transition-transform duration-300 shrink-0">
                              {draft.photoUrl ? (
                                <img src={draft.photoUrl} alt={draft.fullName} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400 font-semibold text-2xl">
                                  {draft.fullName?.charAt(0) || '?'}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-3 mb-1.5">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{draft.fullName || "Unnamed Student"}</h3>
                                <span className="px-2.5 py-1 rounded-full text-[9px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 uppercase tracking-wider">
                                  {draft.source}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                                <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" /> {draft.applicationNo}
                                </span>
                                <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" /> {draft.mobile || "No Mobile"}
                                </span>
                                <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" /> Upd: {formatDDMMYYYY(draft.updatedAt)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Middle: Course Details */}
                          <div className="flex flex-col md:items-center">
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Applied Course</p>
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 px-4 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                              {course ? (course.shortName || course.title) : "Not Assigned"}
                            </p>
                          </div>

                          {/* Right: Actions */}
                          <div className="flex items-center gap-3 self-end md:self-center">
                            <Button size="icon" variant="outline" onClick={() => loadDraft(draft)} className="h-10 w-10 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all shadow-sm">
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="outline" onClick={() => handleDeleteDrafts([draft.id])} disabled={isSubmitting} className="h-10 w-10 text-red-500 hover:text-white hover:bg-red-500 hover:border-red-500 rounded-xl transition-all shadow-sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                            <Button size="sm" onClick={() => handleBulkApprove([draft.id])} disabled={isSubmitting} className="h-10 rounded-xl font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-md hover:shadow-lg text-white px-5 transition-all">
                              <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
                            </Button>
                          </div>

                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/20 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-400">No Drafts Found</h3>
            <p className="text-sm text-slate-500 mt-1 mb-4">Click "New Entry Student" to add a student, or Import a CSV.</p>
            <Button variant="outline" onClick={() => setIsFormOpen(true)} className="rounded-xl font-bold">
              <UserPlus className="w-4 h-4 mr-2" /> Start First Entry
            </Button>
          </div>
        )}
      </div>
      
      <Dialog open={confirmDialog.isOpen} onOpenChange={(open) => !open && setConfirmDialog(prev => ({ ...prev, isOpen: false }))}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>{confirmDialog.title}</DialogTitle>
            <DialogDescription className="whitespace-pre-line text-sm text-slate-500 mt-2 leading-relaxed">
              {confirmDialog.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex gap-2 sm:gap-2 justify-end">
            <Button variant="outline" onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))} className="rounded-xl h-10 font-semibold" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant={confirmDialog.actionVariant} onClick={confirmDialog.onConfirm} disabled={isSubmitting} className="rounded-xl h-10 font-semibold shadow-sm">
              {confirmDialog.actionLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
