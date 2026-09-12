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
    fullName: "", email: "", mobile: "", whatsapp: "", courseId: "", batchId: "", fees: "", paymentType: "ONE_TIME",
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
      paymentType: draft.paymentType || "ONE_TIME",
      customData: draft.customData || {}
    });
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearForm = () => {
    setActiveDraftId(null);
    setFormData({
      fullName: "", email: "", mobile: "", whatsapp: "", courseId: "", batchId: "", fees: "", paymentType: "ONE_TIME",
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
      <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white">Bulk Import Students</h2>
          <Button variant="outline" onClick={() => setIsBulkMode(false)} className="h-8 sm:h-9 px-3 rounded-lg text-xs font-semibold">
            <UserPlus className="w-3.5 h-3.5 mr-1.5" /> Manual Entry
          </Button>
        </div>
        <CsvBulkImport workspaceId={workspaceId} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Form Section Modal (Rule 7.7) */}
      <Dialog open={isFormOpen} onOpenChange={(open) => !open && handleCancel()}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden rounded-2xl p-0 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl">
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 custom-scrollbar">
            <DialogHeader className="mb-3">
              <DialogTitle className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                {isEditingOnline ? "Review Online Application" : (activeDraftId ? "Editing Draft Application" : "New Manual Enrollment")}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                {isEditingOnline ? "Edit the submitted application and assign a batch before approving." : "Fill out the details below. You can save as a draft or finalize enrollment."}
              </DialogDescription>
            </DialogHeader>
          
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Column 1 */}
              <div className="space-y-6">
                
                {/* 01 Personal Information */}
                <div className="space-y-3.5">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="w-5 h-5 rounded bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">01</span>
                    Personal Information
                  </h3>
                  
                  <div className="grid gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Full Name *</label>
                      <Input value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Father's Name</label>
                        <Input value={formData.fatherName} onChange={e => setFormData({...formData, fatherName: e.target.value})} className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Mother's Name</label>
                        <Input value={formData.motherName} onChange={e => setFormData({...formData, motherName: e.target.value})} className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Guardian Phone</label>
                        <Input value={formData.guardianPhone} onChange={e => setFormData({...formData, guardianPhone: e.target.value})} className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Date of Birth</label>
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
                          className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Gender</label>
                        <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="flex h-8 sm:h-9 w-full rounded-lg border border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/50 px-2.5 text-xs outline-none">
                          <option value="">Select</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Blood Group</label>
                        <select value={formData.bloodGroup} onChange={e => setFormData({...formData, bloodGroup: e.target.value})} className="flex h-8 sm:h-9 w-full rounded-lg border border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/50 px-2.5 text-xs outline-none">
                          <option value="">Select</option>
                          {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Religion</label>
                        <Input value={formData.religion} onChange={e => setFormData({...formData, religion: e.target.value})} className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Caste</label>
                        <select value={formData.caste} onChange={e => setFormData({...formData, caste: e.target.value})} className="flex h-8 sm:h-9 w-full rounded-lg border border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/50 px-2.5 text-xs outline-none">
                          <option value="">Select</option>
                          {["GEN", "SC", "ST", "OBC", "Others"].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Row 1 - Column 2 */}
              <div className="space-y-6">
                
                {/* 02 Contact & Address */}
                <div className="space-y-3.5">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="w-5 h-5 rounded bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">02</span>
                    Contact & Address
                  </h3>
                  
                  <div className="grid gap-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Mobile *</label>
                        <Input value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Email</label>
                        <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400">WhatsApp Number</label>
                        <div className="flex items-center space-x-1.5">
                          <Checkbox id="same-wp-admin" onCheckedChange={handleWhatsappCheck} />
                          <label htmlFor="same-wp-admin" className="text-[10px] font-medium text-slate-500 cursor-pointer">Same as Mobile</label>
                        </div>
                      </div>
                      <Input value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400">PIN Code</label>
                        <Input value={formData.pin} onChange={e => setFormData({...formData, pin: e.target.value})} onBlur={handlePinBlur} maxLength={6} className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400">State</label>
                        <Input value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400">District</label>
                        <Input value={formData.dist} onChange={e => setFormData({...formData, dist: e.target.value})} className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Police Station</label>
                        <Input value={formData.ps} onChange={e => setFormData({...formData, ps: e.target.value})} className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Post Office</label>
                        <Input value={formData.po} onChange={e => setFormData({...formData, po: e.target.value})} className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Village / Street</label>
                        <Input value={formData.vill} onChange={e => setFormData({...formData, vill: e.target.value})} className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Academic & Course */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
              {/* Row 2 - Column 1 */}
              <div className="space-y-6">
                {/* 03 Academic Details */}
                <div className="space-y-3.5">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="w-5 h-5 rounded bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">03</span>
                    Academic Details
                  </h3>
                  <div className="grid gap-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Qualification Name</label>
                        <Input value={formData.qualName} onChange={e => setFormData({...formData, qualName: e.target.value})} placeholder="e.g. 10th/12th" className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Board/University</label>
                        <Input value={formData.qualBoard} onChange={e => setFormData({...formData, qualBoard: e.target.value})} className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Year of Passing</label>
                        <Input value={formData.qualYear} onChange={e => setFormData({...formData, qualYear: e.target.value})} maxLength={4} className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Percentage</label>
                        <Input value={formData.qualPercent} onChange={e => setFormData({...formData, qualPercent: e.target.value})} className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2 - Column 2 */}
              <div className="space-y-6">
                {/* 04 Course Details */}
                <div className="space-y-3.5">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="w-5 h-5 rounded bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">04</span>
                    Course & Fees
                  </h3>
                  <div className="grid gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Select Course *</label>
                      <select value={formData.courseId} onChange={(e) => setFormData({...formData, courseId: e.target.value, batchId: ""})} className="flex h-8 sm:h-9 w-full rounded-lg border border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/50 px-2.5 text-xs outline-none">
                        <option value="">Select a Course</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.title} - ₹{c.feeAmount}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Assign Batch</label>
                        <select value={formData.batchId} onChange={(e) => setFormData({...formData, batchId: e.target.value})} className="flex h-8 sm:h-9 w-full rounded-lg border border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/50 px-2.5 text-xs outline-none">
                          <option value="">Select Batch</option>
                          {batches.filter(b => !b.courseId || b.courseId === formData.courseId).map(b => {
                            const isFull = (b._count?.students || 0) >= (b.capacity || 30);
                            const timing = b.startTime && b.endTime ? ` (${b.startTime} - ${b.endTime})` : "";
                            return (
                              <option key={b.id} value={b.id} disabled={isFull}>
                                {b.name}{timing} {isFull ? " - Full" : ` - (${b._count?.students || 0}/${b.capacity || 30})`}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Payment Type *</label>
                        <select value={formData.paymentType} onChange={(e) => setFormData({...formData, paymentType: e.target.value})} className="flex h-8 sm:h-9 w-full rounded-lg border border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/50 px-2.5 text-xs outline-none">
                          <option value="ONE_TIME">One Time Payment</option>
                          <option value="EMI">EMI (Installments)</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Admission Fees Received (₹)</label>
                      <Input type="number" value={formData.fees} onChange={e => setFormData({...formData, fees: e.target.value})} className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60" placeholder="₹ Amount" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 05 Documents (Full Width) */}
            <div className="space-y-3 pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="w-5 h-5 rounded bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">05</span>
                Documents
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Photo</label>
                  <ImageUpload value={formData.photoUrl} onChange={(url) => setFormData({...formData, photoUrl: url})} maxSizeK={100} folder={`RGYCSP/Workspaces/${workspaceId}/admissions`} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Signature</label>
                  <ImageUpload value={formData.signatureUrl} onChange={(url) => setFormData({...formData, signatureUrl: url})} maxSizeK={100} folder={`RGYCSP/Workspaces/${workspaceId}/admissions`} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ID Proof</label>
                  <ImageUpload value={formData.idProofUrl} onChange={(url) => setFormData({...formData, idProofUrl: url})} maxSizeK={1024} folder={`RGYCSP/Workspaces/${workspaceId}/admissions`} />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-5 mt-5 border-t border-slate-100 dark:border-slate-800 justify-end">
              {isEditingOnline ? (
                <>
                  <Button 
                    type="button" 
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    variant="outline"
                    className="h-8 sm:h-9 px-4 rounded-lg text-xs font-semibold"
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1.5" /> Cancel
                  </Button>
                  
                  <Button 
                    type="button" 
                    onClick={handleSaveAndApprove}
                    disabled={isSubmitting}
                    className="h-8 sm:h-9 px-4 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> {isSubmitting ? "Approving..." : "Save & Approve"}
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    type="button" 
                    onClick={handleSaveDraft}
                    disabled={isSubmitting}
                    variant="outline"
                    className="h-8 sm:h-9 px-4 rounded-lg text-xs font-semibold border-amber-200 dark:border-amber-900/40 text-amber-700 dark:text-amber-400 hover:bg-amber-50"
                  >
                    <Save className="w-3.5 h-3.5 mr-1.5" /> {isSubmitting ? "Saving..." : "Save as Draft"}
                  </Button>
                  
                  <Button 
                    type="button" 
                    onClick={handleFinalEnroll}
                    disabled={isSubmitting}
                    className="h-8 sm:h-9 px-4 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> {isSubmitting ? "Enrolling..." : "Final Enroll"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Drafts List Card (Rule 7.4) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden animate-in fade-in duration-300">
        <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              Current Draft Enrollments ({drafts.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Draft student applications awaiting complete information or batch assignment.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setIsFormOpen(true)} className="h-8 sm:h-9 px-3 rounded-lg text-xs font-semibold gap-1.5 shadow-xs">
              <UserPlus className="w-3.5 h-3.5" /> New Entry Student
            </Button>
            <Button variant="outline" onClick={() => setIsBulkMode(true)} className="h-8 sm:h-9 px-3 rounded-lg text-xs font-semibold gap-1.5">
              <Database className="w-3.5 h-3.5" /> Import CSV
            </Button>
          </div>
        </div>

        {/* Search Toolbar */}
        <div className="p-3 sm:p-3.5 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm w-full">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <Input 
              placeholder="Search drafts by student name, app #..." 
              className="pl-8 h-8 sm:h-9 text-xs rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700/60 placeholder:text-xs placeholder:text-slate-400 font-normal"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Bulk Actions Bar */}
          {selectedDraftIds.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                {selectedDraftIds.length} selected
              </span>
              <Button variant="destructive" size="sm" className="h-7 sm:h-8 px-2.5 rounded-lg text-xs font-semibold gap-1" onClick={() => handleDeleteDrafts(selectedDraftIds)} disabled={isSubmitting}>
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </Button>
              <Button size="sm" className="h-7 sm:h-8 px-2.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-1" onClick={() => handleBulkApprove(selectedDraftIds)} disabled={isSubmitting}>
                <CheckCircle2 className="w-3.5 h-3.5" /> Approve
              </Button>
            </div>
          )}
        </div>
        
        {drafts.length > 0 ? (
          <div>
            {/* Select All Bar (when no items selected) */}
            {selectedDraftIds.length === 0 && paginatedDrafts.length > 0 && (
              <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-50/60 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
                <Checkbox 
                  checked={false} 
                  onCheckedChange={handleSelectAll} 
                />
                <span className="text-[11px] font-medium text-slate-500">Select All on Current Page</span>
              </div>
            )}

            {filteredDrafts.length === 0 ? (
              <div className="text-center py-10 px-4">
                <p className="text-xs font-semibold text-slate-900 dark:text-white">No drafts match your search</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Try searching with different terms.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {paginatedDrafts.map((draft) => {
                  const course = courses.find(c => c.id === draft.courseId);
                  
                  const formatDDMMYYYY = (dateString: string | Date) => {
                    if (!dateString) return "-";
                    const d = new Date(dateString);
                    if (isNaN(d.getTime())) return "-";
                    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
                  };

                  return (
                    <div 
                      key={draft.id} 
                      className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-3 sm:p-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all gap-3 sm:gap-4 group border-l-[3px] border-amber-400"
                    >
                      {/* Left Side: Applicant Info with Checkbox */}
                      <div className="flex items-center gap-3 min-w-0">
                        <Checkbox 
                          checked={selectedDraftIds.includes(draft.id)} 
                          onCheckedChange={(c) => handleSelectOne(draft.id, !!c)} 
                          className="shrink-0"
                        />
                        <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                          {draft.photoUrl ? (
                            <img src={draft.photoUrl} alt={draft.fullName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold text-xs">
                              {draft.fullName?.charAt(0) || '?'}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                              {draft.fullName || "Unnamed Student"}
                            </h3>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                              {draft.source || "MANUAL"}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                            <span>{draft.applicationNo}</span>
                            <span>•</span>
                            <span className="font-sans">{draft.mobile || "No Mobile"}</span>
                            <span>•</span>
                            <span className="font-sans text-slate-400">Upd: {formatDDMMYYYY(draft.updatedAt)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Middle: Course Details & Actions */}
                      <div className="flex flex-wrap lg:flex-nowrap items-center gap-3 sm:gap-4 w-full lg:w-auto justify-between lg:justify-end text-xs">
                        <div className="text-left lg:text-right shrink-0">
                          <span className="inline-flex items-center text-xs font-semibold text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 truncate max-w-[150px]">
                            {course ? (course.shortName || course.title) : "Not Assigned"}
                          </span>
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                            Course
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 shrink-0 ml-auto lg:ml-0">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => loadDraft(draft)} 
                            className="h-7 sm:h-8 px-2.5 rounded-lg text-xs font-semibold gap-1 text-slate-600 dark:text-slate-300"
                            title="Edit Draft"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDeleteDrafts([draft.id])} 
                            disabled={isSubmitting} 
                            className="h-7 sm:h-8 px-2.5 rounded-lg text-xs font-semibold text-red-600 border-red-200 dark:border-red-900/40 hover:bg-red-50"
                            title="Delete Draft"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => handleBulkApprove([draft.id])} 
                            disabled={isSubmitting} 
                            className="h-7 sm:h-8 px-2.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
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
          <div className="text-center py-12 px-4">
            <UserPlus className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">No Drafts Available</h3>
            <p className="text-xs text-slate-500 mt-0.5 mb-3">Click "New Entry Student" to add a student, or Import a CSV.</p>
            <Button variant="outline" size="sm" onClick={() => setIsFormOpen(true)} className="h-8 px-3 rounded-lg text-xs font-semibold gap-1.5">
              <UserPlus className="w-3.5 h-3.5" /> Start New Entry
            </Button>
          </div>
        )}

        {/* Standardized Pagination Bar (Rule 7.6) */}
        {filteredDrafts.length > 0 && (
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20">
            <span className="text-xs font-medium text-slate-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredDrafts.length)} of {filteredDrafts.length}
            </span>

            <div className="flex items-center gap-1">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-7 w-7 rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <span className="px-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                {currentPage} / {totalPages || 1}
              </span>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-7 w-7 rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <Dialog open={confirmDialog.isOpen} onOpenChange={(open) => !open && setConfirmDialog(prev => ({ ...prev, isOpen: false }))}>
        <DialogContent className="sm:max-w-md rounded-2xl p-4 sm:p-5">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 dark:text-white">{confirmDialog.title}</DialogTitle>
            <DialogDescription className="whitespace-pre-line text-xs text-slate-500 mt-1.5 leading-relaxed">
              {confirmDialog.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))} className="h-8 sm:h-9 px-3 rounded-lg text-xs font-semibold" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant={confirmDialog.actionVariant} onClick={confirmDialog.onConfirm} disabled={isSubmitting} className="h-8 sm:h-9 px-3 rounded-lg text-xs font-semibold shadow-xs">
              {confirmDialog.actionLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
