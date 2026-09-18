"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { getActiveDocumentTemplates } from "@/app/actions/document-templates";
import Link from "next/link";
import {
  Users, GraduationCap, Building2, Search,
  Eye, Pencil, ChevronLeft, ChevronRight, CheckCircle, FileText, Calendar, Mail, Phone, MoreHorizontal, User, UserCheck, Trash2, ShieldCheck, Download, ExternalLink, Settings, Save, Printer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { AdminPageHeader } from "@/components/layout/AdminPageHeader";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { updateStudent, toggleStudentActiveStatus, deleteStudent, adminUpdateStudentPassword } from "@/app/actions/students";
import { issueStudentDocument, markStudentsAsNotPrinted } from "@/app/actions/student-documents";
import { registerStudent } from "@/app/actions/student-registration";
import { updateRegistrationConfig } from "@/app/actions/registration-config";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { setImpersonation } from "@/app/actions/impersonate";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import dynamic from "next/dynamic";
import { DocumentRenderer, DocumentRendererRef } from "@/components/documents/DocumentRenderer";
const BulkDocumentGenerator = dynamic(() => import("@/components/documents/BulkDocumentGenerator").then(mod => mod.BulkDocumentGenerator), { ssr: false });
import { getDocumentStatus } from "@/lib/document-utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ManageResultModal } from "@/components/students/ManageResultModal";
import { useDebounce } from "@/hooks/useDebounce";

interface StudentsClientProps {
  initialStudents: any[];
  initialWorkspaces: any[];
  initialConfig: any;
}

export default function StudentsClient({ initialStudents, initialWorkspaces, initialConfig }: StudentsClientProps) {
  const router = useRouter();
  const { update } = useSession();

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 250);
  const [statusFilter, setStatusFilter] = useState("REGISTERED");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showRequestsOnly, setShowRequestsOnly] = useState(false);

  // Edit State
  const [editOpen, setEditOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentToDelete, setStudentToDelete] = useState<any>(null);
  
  // View State
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedStudentForView, setSelectedStudentForView] = useState<any>(null);

  // Password Reset State
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Config State
  const [configData, setConfigData] = useState({
    enrollmentPrefix: initialConfig?.enrollmentPrefix || "RGY",
    enrollmentDigits: initialConfig?.enrollmentDigits || 6,
    registrationSeries: initialConfig?.registrationSeries || "B",
    certificatePrefix: initialConfig?.certificatePrefix || "CERT",
    certificateDigits: initialConfig?.certificateDigits || 4,
    marksheetPrefix: initialConfig?.marksheetPrefix || "MS",
    marksheetDigits: initialConfig?.marksheetDigits || 4,
    autoMarksheetIssueEnabled: initialConfig?.autoMarksheetIssueEnabled || false,
    autoCertificateIssueEnabled: initialConfig?.autoCertificateIssueEnabled || false,
    autoQuickIssueEnabled: initialConfig?.autoQuickIssueEnabled || false,
    autoMarksheetDays: initialConfig?.autoMarksheetDays || 2,
    autoCertificateDays: initialConfig?.autoCertificateDays || 30,
    autoIssueAfterRequestMinutes: initialConfig?.autoIssueAfterRequestMinutes || 60,
  });
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  // Docs Modal State
  const [docsModalOpen, setDocsModalOpen] = useState(false);
  const [selectedStudentForDocs, setSelectedStudentForDocs] = useState<any>(null);
  const [manageResultStudent, setManageResultStudent] = useState<any>(null);
  const docRefs = useRef<{ [key: string]: DocumentRendererRef | null }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editFormData, setEditFormData] = useState({
    fullName: "",
    enrollmentNo: "",
    loginPassword: "",
    phone: "",
    email: "",
    whatsapp: "",
    dob: "",
    gender: "",
    bloodGroup: "",
    religion: "",
    caste: "",
    addressVill: "",
    addressPO: "",
    addressPS: "",
    addressDist: "",
    addressState: "",
    addressPin: "",
    fatherName: "",
    motherName: "",
    guardianPhone: "",
    batchId: "",
    courseId: "",
    qualName: "",
    qualYear: "",
    qualPercent: "",
    qualBoard: "",
    photoUrl: "",
    signatureUrl: "",
    idProofUrl: "",
    marksheetNo: "",
    certificateNo: "",
    registrationNo: "",
    admissionDate: "",
  });

  const handleImpersonate = async (studentId: string, subdomain: string) => {
    const loadingId = toast.loading("Connecting to student dashboard...");
    try {
      const result = await setImpersonation(studentId);
      if (result.success) {
        toast.success("Connected!", { id: loadingId });
        window.open(`/app/${subdomain}/student/dashboard`, '_blank');
      } else {
        toast.error(result.error || "Failed to impersonate", { id: loadingId });
      }
    } catch (e) {
      toast.error("An error occurred", { id: loadingId });
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    if (newPassword.length < 4) {
      toast.error("Password must be at least 4 characters long.");
      return;
    }
    setIsSubmitting(true);
    const res = await adminUpdateStudentPassword(selectedStudentForView?.id, newPassword);
    setIsSubmitting(false);
    
    if (res.success) {
      toast.success("Student password updated successfully!");
      setPasswordModalOpen(false);
      setNewPassword("");
      setConfirmPassword("");
      setSelectedStudentForView({ ...selectedStudentForView, loginPassword: newPassword });
      router.refresh();
    } else {
      toast.error(res.error || "Failed to update password");
    }
  };

  const handleEditClick = (student: any) => {
    setSelectedStudent(student);
    let qual: any = null;
    try {
      if (typeof student.qualification === 'string') qual = JSON.parse(student.qualification);
      else if (student.qualification) qual = student.qualification;
    } catch (e) { }

    let addrObj: any = {};
    try {
      if (typeof student.address === 'string') {
        if (student.address.trim().startsWith('{')) addrObj = JSON.parse(student.address);
        else addrObj = { vill: student.address };
      } else if (student.address) addrObj = student.address;
      else if (student.admissionApp?.address) {
        if (typeof student.admissionApp.address === 'string') addrObj = JSON.parse(student.admissionApp.address);
        else addrObj = student.admissionApp.address;
      }
    } catch (e) { }

    setEditFormData({
      fullName: student.fullName,
      enrollmentNo: student.enrollmentNo,
      registrationNo: student.registrationNo || (student.registrations && student.registrations.length > 0 ? student.registrations[0].registrationNo : "") || "",
      marksheetNo: student.marksheetNo || "",
      certificateNo: student.certificateNo || "",
      loginPassword: student.loginPassword || "",
      phone: student.phone || "",
      email: student.email || "",
      whatsapp: student.whatsapp || "",
      dob: student.dob ? new Date(student.dob).toLocaleDateString('en-GB') : "",
      admissionDate: student.admissionDate ? new Date(student.admissionDate).toLocaleDateString('en-GB') : "",
      gender: student.gender || "",
      bloodGroup: student.bloodGroup || "",
      religion: student.religion || "",
      caste: student.caste || "",
      addressVill: addrObj?.vill || "",
      addressPO: addrObj?.po || "",
      addressPS: addrObj?.ps || "",
      addressDist: addrObj?.dist || "",
      addressState: addrObj?.state || "",
      addressPin: addrObj?.pin || "",
      fatherName: student.fatherName || "",
      motherName: student.motherName || "",
      guardianPhone: student.guardianPhone || "",
      batchId: student.batchId || "",
      courseId: student.courseId || "",
      qualName: qual?.name || "",
      qualYear: qual?.year || "",
      qualPercent: qual?.percentage || "",
      qualBoard: qual?.board || "",
      photoUrl: student.photoUrl || student.admissionApp?.photoUrl || "",
      signatureUrl: student.signatureUrl || student.admissionApp?.signatureUrl || "",
      idProofUrl: student.idProofUrl || student.admissionApp?.idProofUrl || "",
    });
    setEditOpen(true);
  };

  const handleIssueDocument = async (studentId: string, docType: "MARKSHEET" | "CERTIFICATE" | "STUDENT_ID" | "ADMIT_CARD", status: boolean, semesterNumber?: number) => {
    const res = await issueStudentDocument(studentId, docType, status, semesterNumber);
    if (res.success) {
      toast.success(`Document status updated`);
      if (selectedStudentForDocs) {
        if (docType === "MARKSHEET" && semesterNumber) {
          let updatedSemesters = [...(selectedStudentForDocs.semesters || [])];
          const existingIndex = updatedSemesters.findIndex(s => s.semesterNumber === semesterNumber);
          if (existingIndex >= 0) {
            updatedSemesters[existingIndex] = { ...updatedSemesters[existingIndex], marksheetApproved: status };
          } else {
            updatedSemesters.push({
              studentProfileId: studentId,
              semesterNumber,
              marksheetApproved: status,
              marksheetIssuedToStudent: false
            } as any);
          }
          setSelectedStudentForDocs({ 
            ...selectedStudentForDocs, 
            semesters: updatedSemesters,
            marksheetNo: res.marksheetNo || selectedStudentForDocs.marksheetNo
          });
        } else {
          setSelectedStudentForDocs({
            ...selectedStudentForDocs,
            ...(docType === "CERTIFICATE" && { certificateApproved: status, certificateNo: res.certificateNo || selectedStudentForDocs.certificateNo }),
            ...(docType === "STUDENT_ID" && { registrationCardApproved: status }),
            ...(docType === "ADMIT_CARD" && { admitCardApproved: status }),
            ...(docType === "MARKSHEET" && !semesterNumber && { marksheetApproved: status })
          });
        }
      }
      router.refresh();
    } else {
      toast.error(res.error || "Failed to update document status");
    }
  };

  const handleDeleteClick = (student: any) => {
    setStudentToDelete(student);
  };

  const handleRegisterStudent = async (student: any) => {
    const loadingToast = toast.loading(`Registering ${student.fullName}...`);
    try {
      const result = await registerStudent(student.id, "super-admin");
      if (result.success) {
        toast.success(result.message || "Student registered successfully!", { id: loadingToast });
        router.refresh();
      } else {
        toast.error(result.error || "Failed to register student", { id: loadingToast });
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred", { id: loadingToast });
    }
  };

  const confirmDelete = async () => {
    if (!studentToDelete) return;
    const toastId = toast.loading(`Deleting ${studentToDelete.fullName}...`);
    try {
      const res = await deleteStudent(studentToDelete.id);
      if (res.success) {
        toast.success("Student deleted successfully!", { id: toastId });
        setStudentToDelete(null);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to delete student", { id: toastId });
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred", { id: toastId });
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setIsSubmitting(true);

    let parsedDob = editFormData.dob;
    if (parsedDob && parsedDob.includes('/')) {
      const [dd, mm, yyyy] = parsedDob.split('/');
      if (dd && mm && yyyy) parsedDob = `${yyyy}-${mm}-${dd}`;
    }

    let parsedAdmissionDate = editFormData.admissionDate;
    if (parsedAdmissionDate && parsedAdmissionDate.includes('/')) {
      const [dd, mm, yyyy] = parsedAdmissionDate.split('/');
      if (dd && mm && yyyy) parsedAdmissionDate = `${yyyy}-${mm}-${dd}`;
    }

    const existingAdmDate = selectedStudent.admissionDate ? new Date(selectedStudent.admissionDate) : null;
    const existingYear = existingAdmDate ? existingAdmDate.getFullYear() : null;
    let newYear = null;
    if (parsedAdmissionDate) {
      newYear = new Date(parsedAdmissionDate).getFullYear();
    }
    
    if (existingYear && newYear && existingYear !== newYear && selectedStudent.registrationNo) {
       const confirmMsg = `Changing the admission date will automatically modify the student's registration number year from ${existingYear} to ${newYear}. Are you sure?`;
       if (!window.confirm(confirmMsg)) {
         setIsSubmitting(false);
         return;
       }
    }

    const qualObj = {
      name: editFormData.qualName,
      year: editFormData.qualYear,
      percentage: editFormData.qualPercent,
      board: editFormData.qualBoard
    };

    const addrObj = {
      vill: editFormData.addressVill,
      po: editFormData.addressPO,
      ps: editFormData.addressPS,
      dist: editFormData.addressDist,
      state: editFormData.addressState,
      pin: editFormData.addressPin
    };

    const {
      qualName, qualYear, qualPercent, qualBoard,
      addressVill, addressPO, addressPS, addressDist, addressState, addressPin,
      ...restPayload
    } = editFormData;

    const payload = {
      ...restPayload,
      dob: parsedDob,
      admissionDate: parsedAdmissionDate,
      qualification: qualObj,
      address: JSON.stringify(addrObj)
    };
    const result = await updateStudent(selectedStudent.id, payload);
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Student profile updated!");
      setEditOpen(false);
      router.refresh();
    } else {
      toast.error(result.error || "Failed to update student");
    }
  };

  const hasPendingRequests = useMemo(() => {
    return initialStudents.some(s => {
      if (s.documentIssueRequestedAt) {
        const certStatus = getDocumentStatus(s, null, configData as any);
        return !(certStatus.finalCertApproved || certStatus.finalCertIssued || certStatus.isCertAuto);
      }
      return false;
    });
  }, [initialStudents, configData]);

  const filteredStudents = useMemo(() => {
    const searchLower = debouncedSearch.toLowerCase().trim();

    return initialStudents.filter(s => {
      let matchesStatus = false;
      if (statusFilter === "PAUSED") {
        matchesStatus = s.isActive === false;
      } else {
        matchesStatus = s.status === statusFilter && s.isActive !== false;
      }
      if (!matchesStatus) return false;

      if (showRequestsOnly && statusFilter === "REGISTERED") {
        if (!s.documentIssueRequestedAt) return false;
        const certStatus = getDocumentStatus(s, null, configData as any);
        if (certStatus.finalCertApproved || certStatus.finalCertIssued || certStatus.isCertAuto) {
          return false;
        }
      }

      if (!searchLower) return true;

      const dobStr = s.dob ? new Date(s.dob).toLocaleDateString('en-GB') : "";
      const adminDateStr = s.admissionDate ? new Date(s.admissionDate).toLocaleDateString('en-GB') : "";
      const regNos = s.registrations ? s.registrations.map((r: any) => r.registrationNo?.toLowerCase() || "") : [];

      return (
        s.fullName?.toLowerCase().includes(searchLower) ||
        s.enrollmentNo?.toLowerCase().includes(searchLower) ||
        regNos.some((r: string) => r.includes(searchLower)) ||
        (s.applicationId && s.applicationId.toLowerCase().includes(searchLower)) ||
        (s.phone && s.phone.includes(searchLower)) ||
        (s.email && s.email.toLowerCase().includes(searchLower)) ||
        (s.workspace?.name && s.workspace.name.toLowerCase().includes(searchLower)) ||
        (s.workspace?.centerCode && s.workspace.centerCode.toLowerCase().includes(searchLower)) ||
        dobStr.includes(searchLower) ||
        adminDateStr.includes(searchLower)
      );
    });
  }, [initialStudents, debouncedSearch, statusFilter, showRequestsOnly, configData]);

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  
  // Add state for selected students (for bulk actions)
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [bulkDownloadOpen, setBulkDownloadOpen] = useState(false);

  // Active document templates for multi-design support
  const [activeTemplates, setActiveTemplates] = useState<any[]>([]);
  const [selectedDocTemplates, setSelectedDocTemplates] = useState<Record<string, string>>({});
  const [printSettingsOpen, setPrintSettingsOpen] = useState(false);

  useEffect(() => {
    getActiveDocumentTemplates().then((templates) => {
      if (Array.isArray(templates)) {
        setActiveTemplates(templates);
        const defaults: Record<string, string> = {};
        ['CERTIFICATE', 'MARKSHEET', 'ADMIT_CARD', 'STUDENT_ID'].forEach((type) => {
          const matching = templates.filter((t: any) => t.type === type);
          if (matching.length > 0) {
            defaults[type] = matching[0].id;
          }
        });
        setSelectedDocTemplates(prev => ({ ...defaults, ...prev }));
      }
    });
  }, []);

  // Stats for cards
  const stats = useMemo(() => {
    let registered = 0, unregistered = 0, passout = 0, paused = 0;
    initialStudents.forEach(s => {
      if (s.isActive === false) {
        paused++;
      } else {
        if (s.status === "REGISTERED") registered++;
        else if (s.status === "UNREGISTERED") unregistered++;
        else if (s.status === "PASS_OUT") passout++;
      }
    });
    return {
      total: initialStudents.length,
      registered,
      unregistered,
      passout,
      paused
    };
  }, [initialStudents]);

  const tabs = [
    { id: "UNREGISTERED", label: "Pending Registration", icon: User },
    { id: "REGISTERED", label: "Registered Students", icon: UserCheck },
    { id: "PASS_OUT", label: "Pass Out", icon: GraduationCap },
    { id: "PAUSED", label: "Paused", icon: ShieldCheck },
    { id: "CONFIG", label: "Configuration", icon: Settings },
  ];

  const handleSaveConfig = async () => {
    setIsSavingConfig(true);
    const res = await updateRegistrationConfig(configData);
    setIsSavingConfig(false);
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.error);
    }
  };

  const renderPagination = (currentPage: number, totalPages: number, setPage: (p: number) => void) => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
      }
      if (currentPage <= 4) {
        return [1, 2, 3, 4, 5, '...', totalPages];
      }
      if (currentPage >= totalPages - 3) {
        return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
      }
      return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
    };

    const pages = getPageNumbers();

    return (
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20">
        <div className="text-xs font-medium text-slate-500">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" onClick={() => setPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="h-7 px-2 rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <div className="flex items-center gap-1 hidden sm:flex">
            {pages.map((page, idx) => {
              if (page === '...') {
                return <span key={`ellipsis-${idx}`} className="px-1 text-slate-400 text-xs select-none">...</span>;
              }
              const pageNum = page as number;
              return (
                <Button
                  key={`page-${pageNum}`}
                  variant={currentPage === pageNum ? "default" : "ghost"}
                  onClick={() => setPage(pageNum)}
                  className={cn("h-7 w-7 rounded-md font-semibold text-xs", currentPage === pageNum ? "shadow-sm shadow-primary/20" : "text-slate-500")}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          <Button variant="outline" size="sm" onClick={() => setPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="h-7 px-2 rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <TooltipProvider delay={300}>
      <div className="space-y-4 sm:space-y-5 pb-8 w-full mx-auto">
      <AdminPageHeader
        title="Student Management"
        description="Global directory of all students registered across all franchise workspaces."
      />

      {/* Stats Cards - Consistent with Franchises and State Manager */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Students", value: stats.total, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Registered", value: stats.registered, icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Unregistered", value: stats.unregistered, icon: FileText, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Pass Out", value: stats.passout, icon: GraduationCap, color: "text-purple-500", bg: "bg-purple-500/10" },
        ].map((stat, i) => (
          <Card key={i} className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
            <CardContent className="p-3.5">
              <div className="flex items-center gap-3">
                <div className={cn("p-2.5 rounded-lg", stat.bg)}>
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">{stat.label}</p>
                  <p className="text-2xl font-bold tracking-tight">{stat.value.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-1.5 p-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-full">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setStatusFilter(tab.id); setCurrentPage(1); }}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs transition-all duration-150 whitespace-nowrap shrink-0 font-medium",
              statusFilter === tab.id
                ? "bg-slate-100 dark:bg-slate-800 text-primary dark:text-white font-semibold shadow-inner"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50"
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden bg-white dark:bg-slate-900">
        {statusFilter === "CONFIG" ? (
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-5 gap-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Settings className="w-4 h-4 text-primary" />
                System Configuration
              </h2>
              <Button 
                onClick={handleSaveConfig} 
                disabled={isSavingConfig}
                className="rounded-lg font-semibold px-4 h-8 text-xs shadow-sm shadow-primary/20 hover:shadow-primary/30 transition-all w-full sm:w-auto gap-1.5"
              >
                {isSavingConfig ? "Saving..." : <><Save className="w-3.5 h-3.5" /> Save Config</>}
              </Button>
            </div>

            <div className="max-w-5xl mx-auto w-full">
              <Accordion defaultValue={[]} className="space-y-4">
                {/* Registration Config Accordion Item */}
                <AccordionItem value="registration" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                        <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-500" />
                      </div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Registration Number Config</h3>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 sm:p-5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 w-full mt-2">
                      {/* Left Side: Inputs */}
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-0.5">Enrollment Number Prefix</label>
                          <p className="text-[11px] text-slate-500 mb-1.5">Used as the prefix for all generated Enrollment Numbers (e.g., RGY12345678)</p>
                          <Input 
                            value={configData.enrollmentPrefix || ""} 
                            onChange={e => setConfigData(prev => ({ ...prev, enrollmentPrefix: e.target.value.toUpperCase() }))}
                            className="h-8 sm:h-9 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg font-bold font-mono text-xs tracking-wider"
                            placeholder="e.g. RGY"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-0.5">Registration Number Series</label>
                          <p className="text-[11px] text-slate-500 mb-1.5">Used in the Franchise Registration Number (e.g., WB002Y2026<span className="font-bold text-primary">B</span>12345)</p>
                          <Input 
                            value={configData.registrationSeries || ""} 
                            onChange={e => setConfigData(prev => ({ ...prev, registrationSeries: e.target.value.toUpperCase() }))}
                            className="h-8 sm:h-9 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg font-bold font-mono text-xs tracking-wider"
                            placeholder="e.g. B"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-0.5">Enrollment Number Length</label>
                          <p className="text-[11px] text-slate-500 mb-1.5">Number of digits in the generated Enrollment Number (6 to 12). (e.g. 6 = {configData.enrollmentPrefix || "RGY"}000001)</p>
                          <Input 
                            type="number"
                            min="6"
                            max="12"
                            value={configData.enrollmentDigits || 6} 
                            onChange={e => setConfigData(prev => ({ ...prev, enrollmentDigits: parseInt(e.target.value) || 6 }))}
                            className="h-8 sm:h-9 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg font-bold font-mono text-xs tracking-wider"
                            placeholder="e.g. 6"
                          />
                        </div>
                      </div>

                      {/* Right Side: Live Preview */}
                      <div className="bg-slate-50/70 dark:bg-slate-800/40 rounded-xl p-4 sm:p-5 border border-slate-100 dark:border-slate-800 flex flex-col justify-center h-full">
                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200/50 dark:border-slate-700/50">
                          <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                            <Eye className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Live Preview</h3>
                            <p className="text-[10px] text-slate-500">How the generated IDs will look</p>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <p className="text-[9px] uppercase font-bold tracking-[0.15em] text-slate-400 mb-1">Sample Enrollment No</p>
                            <div className="bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-inner flex items-center justify-center">
                              <span className="text-base sm:text-lg font-bold font-mono tracking-widest text-slate-800 dark:text-slate-200">
                                <span className="text-indigo-600 dark:text-indigo-400">{configData.enrollmentPrefix ?? "PREFIX"}</span>
                                <span>{String(123456).padStart(configData.enrollmentDigits || 6, '0')}</span>
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="text-[9px] uppercase font-bold tracking-[0.15em] text-slate-400 mb-1">Sample Registration No</p>
                            <div className="bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-inner flex items-center justify-center text-center">
                              <span className="text-base sm:text-lg font-bold font-mono tracking-widest text-slate-800 dark:text-slate-200 break-all">
                                <span>WB002Y2026</span>
                                <span className="text-primary">{configData.registrationSeries ?? "SERIES"}</span>
                                <span>123456</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Document Number Config Accordion Item */}
                <AccordionItem value="documentNumber" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                        <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-500" />
                      </div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Document Number Config</h3>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 sm:p-5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 w-full mt-2">
                      {/* Left Side: Inputs */}
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-0.5">Certificate Prefix</label>
                          <p className="text-[11px] text-slate-500 mb-1.5">Prefix used when generating Certificate Numbers (e.g., CERT0001)</p>
                          <Input 
                            value={configData.certificatePrefix || ""} 
                            onChange={e => setConfigData(prev => ({ ...prev, certificatePrefix: e.target.value.toUpperCase() }))}
                            className="h-8 sm:h-9 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg font-bold font-mono text-xs tracking-wider"
                            placeholder="e.g. CERT"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-0.5">Certificate Number Length</label>
                          <p className="text-[11px] text-slate-500 mb-1.5">Number of numeric digits used (e.g. 4 = CERT0001)</p>
                          <Input 
                            type="number"
                            min="3" max="10"
                            value={configData.certificateDigits || 4} 
                            onChange={e => setConfigData(prev => ({ ...prev, certificateDigits: parseInt(e.target.value) || 4 }))}
                            className="h-8 sm:h-9 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg font-bold font-mono text-xs tracking-wider"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-0.5">Marksheet Prefix</label>
                          <p className="text-[11px] text-slate-500 mb-1.5">Prefix used when generating Marksheet Numbers (e.g., MS0001)</p>
                          <Input 
                            value={configData.marksheetPrefix || ""} 
                            onChange={e => setConfigData(prev => ({ ...prev, marksheetPrefix: e.target.value.toUpperCase() }))}
                            className="h-8 sm:h-9 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg font-bold font-mono text-xs tracking-wider"
                            placeholder="e.g. MS"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-0.5">Marksheet Number Length</label>
                          <p className="text-[11px] text-slate-500 mb-1.5">Number of numeric digits used (e.g. 4 = MS0001)</p>
                          <Input 
                            type="number"
                            min="3" max="10"
                            value={configData.marksheetDigits || 4} 
                            onChange={e => setConfigData(prev => ({ ...prev, marksheetDigits: parseInt(e.target.value) || 4 }))}
                            className="h-8 sm:h-9 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg font-bold font-mono text-xs tracking-wider"
                          />
                        </div>
                      </div>

                      {/* Right Side: Live Preview */}
                      <div className="bg-slate-50/70 dark:bg-slate-800/40 rounded-xl p-4 sm:p-5 border border-slate-100 dark:border-slate-800 flex flex-col justify-center h-full">
                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200/50 dark:border-slate-700/50">
                          <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                            <Eye className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Live Preview</h3>
                            <p className="text-[10px] text-slate-500">How the generated document numbers will look</p>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <p className="text-[9px] uppercase font-bold tracking-[0.15em] text-slate-400 mb-1">Sample Certificate No</p>
                            <div className="bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-inner flex items-center justify-center">
                              <span className="text-base sm:text-lg font-bold font-mono tracking-widest text-slate-800 dark:text-slate-200">
                                <span className="text-indigo-600 dark:text-indigo-400">{configData.certificatePrefix ?? "CERT"}</span>
                                <span>{String(123456).padStart(configData.certificateDigits || 4, '0')}</span>
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="text-[9px] uppercase font-bold tracking-[0.15em] text-slate-400 mb-1">Sample Marksheet No</p>
                            <div className="bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-inner flex items-center justify-center text-center">
                              <span className="text-base sm:text-lg font-bold font-mono tracking-widest text-slate-800 dark:text-slate-200 break-all">
                                <span className="text-indigo-600 dark:text-indigo-400">{configData.marksheetPrefix ?? "MS"}</span>
                                <span>{String(123456).padStart(configData.marksheetDigits || 4, '0')}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Auto Issue Config Accordion Item */}
                <AccordionItem value="documents" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors text-sm">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                          <Settings className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500" />
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Automatic Document Issue</h3>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 sm:p-5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Marksheet Settings */}
                      <div className="p-3.5 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-0.5">Auto Marksheet Issue</label>
                            <p className="text-[11px] text-slate-500">Automatically issue marksheets to students.</p>
                          </div>
                          <Switch 
                            checked={configData.autoMarksheetIssueEnabled}
                            onCheckedChange={(checked) => setConfigData(prev => ({ ...prev, autoMarksheetIssueEnabled: checked }))}
                            className="data-[state=checked]:bg-primary"
                          />
                        </div>
                        {configData.autoMarksheetIssueEnabled && (
                          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-0.5">Marksheet Delay (Days)</label>
                            <p className="text-[11px] text-slate-500 mb-2">Days after franchise uploads marks to auto-issue marksheet.</p>
                            <Input 
                              type="number"
                              value={configData.autoMarksheetDays} 
                              onChange={e => setConfigData(prev => ({ ...prev, autoMarksheetDays: parseInt(e.target.value) || 0 }))}
                              className="h-8 sm:h-9 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                            />
                          </div>
                        )}
                      </div>

                      {/* Certificate Settings */}
                      <div className="p-3.5 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-0.5">Auto Certificate Issue</label>
                            <p className="text-[11px] text-slate-500">Automatically issue certificates to students.</p>
                          </div>
                          <Switch 
                            checked={configData.autoCertificateIssueEnabled}
                            onCheckedChange={(checked) => setConfigData(prev => ({ ...prev, autoCertificateIssueEnabled: checked }))}
                            className="data-[state=checked]:bg-primary"
                          />
                        </div>
                        {configData.autoCertificateIssueEnabled && (
                          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-0.5">Certificate Delay (Days)</label>
                            <p className="text-[11px] text-slate-500 mb-2">Days after final marksheet is published to auto-issue certificate.</p>
                            <Input 
                              type="number"
                              value={configData.autoCertificateDays} 
                              onChange={e => setConfigData(prev => ({ ...prev, autoCertificateDays: parseInt(e.target.value) || 0 }))}
                              className="h-8 sm:h-9 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                            />
                          </div>
                        )}
                      </div>

                      {/* Quick Issue Delay */}
                      <div className="p-3.5 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800 col-span-1 md:col-span-2">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-0.5">Auto Quick Issue</label>
                            <p className="text-[11px] text-slate-500">Automatically issue documents when a franchise clicks "Request Quick Issue".</p>
                          </div>
                          <Switch 
                            checked={configData.autoQuickIssueEnabled}
                            onCheckedChange={(checked) => setConfigData(prev => ({ ...prev, autoQuickIssueEnabled: checked }))}
                            className="data-[state=checked]:bg-primary"
                          />
                        </div>
                        {configData.autoQuickIssueEnabled && (
                          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-0.5">Quick Issue Delay (Minutes)</label>
                            <p className="text-[11px] text-slate-500 mb-2">Minutes to wait after a franchise admin clicks "Request Quick Issue" before auto-approving the documents.</p>
                            <Input 
                              type="number"
                              value={configData.autoIssueAfterRequestMinutes} 
                              onChange={e => setConfigData(prev => ({ ...prev, autoIssueAfterRequestMinutes: parseInt(e.target.value) || 0 }))}
                              className="h-8 sm:h-9 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg max-w-sm text-xs"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        ) : (
          <>
        <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-center flex-wrap gap-2.5 w-full md:w-auto flex-1">
              {statusFilter !== "CONFIG" && (
                <div className="flex items-center gap-2 pr-2.5 border-r border-slate-200 dark:border-slate-800 h-8">
                  <Checkbox 
                    checked={filteredStudents.length > 0 && selectedStudentIds.length === filteredStudents.length}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedStudentIds(filteredStudents.map(s => s.id));
                      } else {
                        setSelectedStudentIds([]);
                      }
                    }}
                    className="rounded w-4 h-4 border-slate-300 dark:border-slate-600 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                    title="Select all filtered students"
                  />
                  {selectedStudentIds.length > 0 && (
                    <Button 
                      variant="default" 
                      onClick={() => setBulkDownloadOpen(true)}
                      className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-semibold h-7 px-2.5 rounded-lg shadow-sm text-xs flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" /> Bulk Print ({selectedStudentIds.length})
                    </Button>
                  )}
                </div>
              )}
              <div className="relative w-full md:max-w-[300px] group">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <Search className="h-3.5 w-3.5 text-slate-400" />
                </div>
                <Input
                  placeholder="Search by ID, Name, Phone, Franchise..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="pl-8 pr-3 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 rounded-lg h-8 sm:h-9 font-normal text-[11px] sm:text-xs transition-all focus-visible:ring-1 focus-visible:ring-primary/30 placeholder:text-[11px] sm:placeholder:text-xs placeholder:text-slate-400"
                />
              </div>
              {statusFilter === "REGISTERED" && hasPendingRequests && (
                <div className="flex items-center gap-1.5 pl-1 shrink-0">
                  <Checkbox 
                    id="show-requests-only"
                    checked={showRequestsOnly} 
                    onCheckedChange={(c) => { setShowRequestsOnly(!!c); setCurrentPage(1); }} 
                    className="border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white h-4 w-4 rounded shadow-sm shrink-0"
                  />
                  <label htmlFor="show-requests-only" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer flex items-center gap-1.5 whitespace-nowrap">
                    Requested Only
                    <span className="relative flex h-1.5 w-1.5 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
                    </span>
                  </label>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPrintSettingsOpen(true)}
                className="h-8 sm:h-9 px-2.5 sm:px-3 text-xs font-semibold rounded-lg border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800 gap-1.5 text-slate-700 dark:text-slate-200 shadow-xs"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span className="hidden sm:inline">Print Settings</span>
                <span className="sm:hidden">Print</span>
              </Button>
              <span className="text-xs font-medium text-slate-400">Show:</span>
              <Select value={itemsPerPage.toString()} onValueChange={(v) => { setItemsPerPage(Number(v)); setCurrentPage(1); }}>
                <SelectTrigger className="w-16 h-8 sm:h-9 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 rounded-lg text-xs font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-lg border border-slate-200 dark:border-slate-700 shadow-md">
                  <SelectItem value="10" className="rounded-md text-xs">10</SelectItem>
                  <SelectItem value="25" className="rounded-md text-xs">25</SelectItem>
                  <SelectItem value="50" className="rounded-md text-xs">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {paginatedStudents.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 mb-3">
                <Search className="h-7 w-7 text-slate-400" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">No Students Found</h3>
              <p className="text-xs text-slate-500 mt-1">Try adjusting your search criteria or changing tabs.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {paginatedStudents.map((student) => {
                const borderColors = {
                  "REGISTERED": "border-green-500",
                  "UNREGISTERED": "border-amber-500",
                  "PASS_OUT": "border-purple-500"
                };
                const borderColor = borderColors[student.status as keyof typeof borderColors] || "border-primary";

                return (
                  <div key={student.id} className={cn("flex flex-col lg:flex-row items-start lg:items-center justify-between p-3 sm:p-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all gap-3 sm:gap-4 group border-l-[3px]", borderColor)}>
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        checked={selectedStudentIds.includes(student.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedStudentIds(prev => [...prev, student.id]);
                          } else {
                            setSelectedStudentIds(prev => prev.filter(id => id !== student.id));
                          }
                        }}
                        className="rounded w-4 h-4 border-slate-300 dark:border-slate-600 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground mr-1 shrink-0"
                      />
                      <Avatar className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shrink-0 shadow-sm">
                        <AvatarImage src={student.photoUrl || student.admissionApp?.photoUrl || undefined} className="object-cover" />
                        <AvatarFallback className="bg-primary/5 text-primary font-bold text-sm rounded-xl">
                          {student.fullName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex flex-col items-start">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">{student.fullName}</p>
                            {student.documentsPrinted && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <div
                                    role="button"
                                    tabIndex={0}
                                    className="cursor-pointer flex items-center justify-center outline-none"
                                    onClick={async (e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      toast.loading("Updating print status...", { id: `print-${student.id}` });
                                      const res = await markStudentsAsNotPrinted([student.id]);
                                      if(res.success) {
                                        toast.success("Document unmarked as printed", { id: `print-${student.id}` });
                                        router.refresh();
                                      } else {
                                        toast.error(res.error || "Failed to update", { id: `print-${student.id}` });
                                      }
                                    }}
                                  >
                                    <Printer className="w-3.5 h-3.5 text-emerald-500 hover:text-red-500 transition-colors" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Printed. Click to unmark.</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                            <Badge variant="outline" className={cn(
                              "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border-none",
                              student.status === "REGISTERED" ? "bg-green-500/10 text-green-600" :
                                student.status === "UNREGISTERED" ? "bg-amber-500/10 text-amber-600" :
                                  "bg-purple-500/10 text-purple-600"
                            )}>
                              {student.status.replace("_", " ")}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2.5 mt-0.5">
                            {student.phone && (
                              <p className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                                <Phone className="h-2.5 w-2.5 text-slate-400 shrink-0" /> {student.phone}
                              </p>
                            )}
                            {student.email && (
                              <Tooltip>
                                <TooltipTrigger className="cursor-help text-[10px] font-medium text-slate-400 flex items-center gap-1 max-w-[120px] sm:max-w-[160px] p-0 border-none bg-transparent outline-none">
                                  <Mail className="h-2.5 w-2.5 shrink-0" /> <span className="truncate">{student.email}</span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{student.email}</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4 w-full lg:w-auto">
                      <div className="flex flex-wrap md:flex-nowrap items-center gap-3 sm:gap-4 md:gap-5 w-full md:w-auto bg-slate-50/70 dark:bg-slate-800/30 lg:bg-transparent p-2 md:p-0 rounded-lg text-xs">
                        <div className="text-left shrink-0 min-w-[70px]">
                          <p className="font-semibold font-mono text-xs text-indigo-600 dark:text-indigo-400">{student.enrollmentNo}</p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Enrollment No</p>
                        </div>
                        {(student.status === "REGISTERED" || student.status === "PASS_OUT") && (student.registrations && student.registrations.length > 0) && (
                          <div className="text-left shrink-0 min-w-[70px]">
                            <p className="font-semibold font-mono text-xs text-emerald-600 dark:text-emerald-400">{student.registrations[student.registrations.length - 1].registrationNo}</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Reg No</p>
                          </div>
                        )}
                        <div className="text-left max-w-[130px] sm:max-w-[150px] min-w-0 shrink-0">
                          <Tooltip>
                            <TooltipTrigger className="cursor-help flex items-center gap-1 overflow-hidden p-0 border-none bg-transparent text-left outline-none w-full">
                              <Building2 className="h-3 w-3 text-slate-400 shrink-0" />
                              <span className="font-medium text-xs text-slate-800 dark:text-slate-200 truncate block">
                                {student.workspace?.name || 'Unknown'}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs max-w-xs font-medium">
                              <p className="font-semibold">{student.workspace?.name || 'Unknown'}</p>
                              {student.workspace?.subdomain && (
                                <p className="text-[10px] text-slate-400 font-mono">Subdomain: {student.workspace.subdomain}</p>
                              )}
                            </TooltipContent>
                          </Tooltip>
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Franchise</p>
                        </div>
                        <div className="text-left max-w-[90px] sm:max-w-[120px] min-w-0 shrink-0">
                          <Tooltip>
                            <TooltipTrigger className="cursor-help flex items-center gap-1 overflow-hidden p-0 border-none bg-transparent text-left outline-none w-full">
                              <FileText className="h-3 w-3 text-slate-400 shrink-0" />
                              <span className="font-medium text-xs text-slate-800 dark:text-slate-200 truncate block">
                                {student.course?.globalCourse?.short || student.course?.code || student.course?.title || 'No Course'}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs max-w-xs">
                              <p className="font-medium">{student.course?.title || student.course?.globalCourse?.name || 'No Course'}</p>
                            </TooltipContent>
                          </Tooltip>
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Course</p>
                        </div>
                      </div>

                      {/* Static Style Actions */}
                      <div className="flex items-center gap-1 w-full lg:w-auto mt-1 lg:mt-0 justify-end">
                        {student.status === "UNREGISTERED" && (
                          <Button
                            variant="ghost"
                            onClick={() => handleRegisterStudent(student)}
                            className="h-7 sm:h-8 rounded-lg text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors font-semibold text-xs px-2.5 mr-0.5"
                            title="Register Student"
                          >
                            <UserCheck className="h-3.5 w-3.5 mr-1.5" /> Register
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg text-slate-500 hover:text-primary hover:bg-primary/5 transition-colors"
                          title="View Details"
                          onClick={() => {
                            setSelectedStudentForView(student);
                            setViewOpen(true);
                          }}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(student)}
                          className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
                          title="Edit Student"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(student)}
                          className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                          title="Delete Student"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>

                        {(student.status === "REGISTERED" || student.status === "PASS_OUT") && (
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              className="relative inline-flex items-center justify-center whitespace-nowrap h-7 w-7 sm:h-8 sm:w-8 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/20"
                              title="Documents"
                            >
                              <MoreHorizontal className="h-3.5 w-3.5" />
                              {student.documentIssueRequestedAt && (() => {
                                const certStatus = getDocumentStatus(student, null, configData as any);
                                return !(certStatus.finalCertApproved || certStatus.finalCertIssued || certStatus.isCertAuto);
                              })() && (
                                <span className="absolute top-1.5 right-1.5 flex h-1.5 w-1.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                                </span>
                              )}
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="top" align="end" className="w-52 rounded-xl font-medium p-1 text-xs">
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedStudentForDocs(student);
                                  setDocsModalOpen(true);
                                }} 
                                className="cursor-pointer gap-2 py-2"
                              >
                                <FileText className="h-3.5 w-3.5 text-slate-400" /> Manage Documents
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => setManageResultStudent(student)} 
                                className="cursor-pointer gap-2 py-2"
                              >
                                <GraduationCap className="h-3.5 w-3.5 text-slate-400" /> Manage Result
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className={cn("cursor-pointer gap-2 py-2 transition-colors", student.isActive !== false ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50 focus:text-amber-700 focus:bg-amber-50" : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 focus:text-emerald-700 focus:bg-emerald-50")}
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  const currentlyActive = student.isActive !== false;
                                  const toastId = toast.loading(currentlyActive ? "Pausing student..." : "Reactivating student...");
                                  const res = await toggleStudentActiveStatus(student.id, !currentlyActive);
                                  if (res.success) {
                                    toast.success(`Student ${currentlyActive ? 'paused' : 'reactivated'} successfully!`, { id: toastId });
                                    router.refresh();
                                  } else {
                                    toast.error(res.error || "Failed to update status", { id: toastId });
                                  }
                                }}
                              >
                                <ShieldCheck className="h-3.5 w-3.5" /> {student.isActive !== false ? "Pause" : "Re Active"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {renderPagination(currentPage, totalPages, setCurrentPage)}
        </CardContent>
        </>
        )}
      </Card>

      {/* View Student Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col overflow-hidden rounded-2xl p-0 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          {selectedStudentForView && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
              <div className="space-y-3.5">
                {/* Header Profile Section */}
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                  <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-2 border-slate-100 dark:border-slate-800 rounded-xl shadow-md">
                    <AvatarImage src={selectedStudentForView.photoUrl || selectedStudentForView.admissionApp?.photoUrl || undefined} className="object-cover" />
                    <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold rounded-xl">
                      {selectedStudentForView.fullName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex flex-col md:flex-row md:items-center gap-2">
                      <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">
                        {selectedStudentForView.fullName}
                      </h2>
                      <Badge className={cn(
                        "rounded-md px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase w-fit",
                        selectedStudentForView.status === "REGISTERED" ? "bg-emerald-500 hover:bg-emerald-600 text-white" :
                        selectedStudentForView.status === "PASS_OUT" ? "bg-amber-500 hover:bg-amber-600 text-white" :
                        "bg-slate-400 hover:bg-slate-500 text-white"
                      )}>
                        {selectedStudentForView.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">ENR:</span>
                        <Badge variant="outline" className="text-xs font-semibold font-mono text-primary border-primary/20 bg-primary/5 px-1.5 py-0.5">{selectedStudentForView.enrollmentNo}</Badge>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">PWD:</span>
                        <Badge variant="outline" className="text-xs font-semibold font-mono text-amber-600 border-amber-600/20 bg-amber-600/5 cursor-pointer hover:bg-amber-600/10 transition-colors px-1.5 py-0.5" onClick={() => {
                          setNewPassword("");
                          setConfirmPassword("");
                          setPasswordModalOpen(true);
                        }}>
                          {selectedStudentForView.loginPassword || "Not Set"}
                        </Badge>
                      </div>
                      {selectedStudentForView.phone && <div className="flex items-center gap-1 text-xs"><Phone className="h-3 w-3 text-slate-400" /> {selectedStudentForView.phone}</div>}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-row gap-2 w-full md:w-auto mt-2 md:mt-0 justify-end md:ml-auto">
                    <Button 
                      onClick={() => { setViewOpen(false); handleEditClick(selectedStudentForView); }} 
                      size="icon"
                      variant="outline"
                      title="Edit Profile"
                      className="h-8 w-8 rounded-lg shadow-sm border-slate-200 dark:border-slate-700"
                    >
                      <Pencil className="h-3.5 w-3.5 text-slate-700 dark:text-slate-300" />
                    </Button>
                    <Button 
                      onClick={() => handleImpersonate(selectedStudentForView.id, selectedStudentForView.workspace?.subdomain)} 
                      size="icon"
                      className="h-8 w-8 rounded-lg shadow-sm bg-primary text-primary-foreground hover:scale-105 transition-transform"
                      title="Dashboard"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                    {selectedStudentForView.applicationId && (
                      <Link href={`/app/${selectedStudentForView.workspace?.subdomain}/admission/print/${selectedStudentForView.applicationId}`} target="_blank">
                        <Button size="icon" variant="outline" className="h-8 w-8 rounded-lg shadow-sm border-slate-200 dark:border-slate-700" title="Download Form">
                          <Download className="h-3.5 w-3.5 text-slate-700 dark:text-slate-300" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>

                {/* Horizontal Documents Status & Admission Date */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white dark:bg-slate-900 p-2.5 px-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                  <div className="flex flex-wrap items-center gap-2 flex-1">
                    {[
                      { label: "ID Card", val: selectedStudentForView.registrationCardApproved },
                      { label: "Admit Card", val: selectedStudentForView.admitCardApproved },
                      { label: "Marksheet", val: selectedStudentForView.marksheetApproved },
                      { label: "Certificate", val: selectedStudentForView.certificateApproved },
                    ].map((doc, idx) => (
                      <div key={idx} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-semibold shadow-sm transition-colors ${doc.val ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700'}`}>
                        {doc.val ? (
                          <CheckCircle className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <div className="h-1.5 w-1.5 rounded-full bg-amber-400 mx-0.5" />
                        )}
                        <span>{doc.label}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/10 justify-center shrink-0">
                    <Calendar className="h-4 w-4 text-primary" />
                    <div className="flex flex-col">
                       <span className="text-[9px] font-bold text-primary/70 uppercase tracking-wider leading-none mb-0.5">Admission Date</span>
                       <span className="text-xs font-bold text-primary leading-none">{new Date(selectedStudentForView.admissionDate).toLocaleDateString('en-GB')}</span>
                    </div>
                  </div>
                </div>

                {/* Stacked Layout for details */}
                <div className="flex flex-col gap-3.5">
                  {/* Academic Stats */}
                  <Card className="rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden flex flex-col">
                    <CardHeader className="bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800 py-2.5 px-4">
                      <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 text-xs sm:text-sm">
                        <GraduationCap className="h-4 w-4 text-primary" /> Academic Profile
                      </h3>
                    </CardHeader>
                    <CardContent className="p-3.5 sm:p-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                        <div className="md:col-span-2">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Course</p>
                          <p className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">{selectedStudentForView.course?.title || "Not Assigned"}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Batch</p>
                          <p className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">{selectedStudentForView.batch?.name || "Not Assigned"}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Course Duration</p>
                          <p className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">{selectedStudentForView.course?.duration || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Remaining Months</p>
                          <p className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">
                            {(() => {
                              const durationStr = selectedStudentForView.course?.duration;
                              if (!durationStr || !selectedStudentForView.admissionDate) return "N/A";
                              const match = durationStr.match(/(\d+)/);
                              if (match) {
                                const durationMonths = parseInt(match[1]);
                                const isYears = durationStr.toLowerCase().includes('year');
                                const totalMonths = isYears ? durationMonths * 12 : durationMonths;
                                
                                const admissionDate = new Date(selectedStudentForView.admissionDate);
                                const currentDate = new Date();
                                const monthsPassed = (currentDate.getFullYear() - admissionDate.getFullYear()) * 12 + (currentDate.getMonth() - admissionDate.getMonth());
                                
                                const remaining = totalMonths - monthsPassed;
                                return remaining > 0 ? `${remaining} Months` : "Completed";
                              }
                              return "N/A";
                            })()}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Fees Remaining</p>
                          <p className="font-semibold text-xs sm:text-sm text-amber-600 dark:text-amber-500">
                            {(() => {
                              if (!selectedStudentForView.invoices || selectedStudentForView.invoices.length === 0) return "₹0.00";
                              const due = selectedStudentForView.invoices.filter((i: any) => i.status !== "PAID").reduce((sum: number, val: any) => sum + (val.amount || 0), 0);
                              return due > 0 ? `₹${due.toFixed(2)}` : "₹0.00";
                            })()}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Attendance</p>
                          <p className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">
                            {(() => {
                              if (!selectedStudentForView.attendances || selectedStudentForView.attendances.length === 0) return "No Data";
                              const present = selectedStudentForView.attendances.filter((a: any) => a.status === "PRESENT").length;
                              return `${Math.round((present / selectedStudentForView.attendances.length) * 100)}%`;
                            })()}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Status</p>
                          <p className={`font-semibold text-xs sm:text-sm ${selectedStudentForView.status === "PASS_OUT" ? "text-emerald-600 dark:text-emerald-500" : "text-blue-600 dark:text-blue-400"}`}>
                            {selectedStudentForView.status === "PASS_OUT" ? "Completed" : "In Progress"}
                          </p>
                        </div>
                        
                        {(() => {
                          let qual: any = null;
                          try {
                            qual = typeof selectedStudentForView.qualification === 'string' ? JSON.parse(selectedStudentForView.qualification) : selectedStudentForView.qualification;
                          } catch(e){}
                          if(qual && qual.name) {
                            return (
                              <div className="md:col-span-4 pt-3 mt-1 border-t border-slate-100 dark:border-slate-800">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Highest Qualification</p>
                                <p className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">{qual.name} ({qual.year}) - {qual.percentage}%</p>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Personal Details */}
                  <Card className="rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 md:col-span-2 overflow-hidden">
                    <CardHeader className="bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800 py-2.5 px-4">
                      <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 text-xs sm:text-sm">
                        <User className="h-4 w-4 text-blue-500" /> Personal Details
                      </h3>
                    </CardHeader>
                    <CardContent className="p-3.5 sm:p-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Date of Birth</p>
                          <p className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">{selectedStudentForView.dob ? new Date(selectedStudentForView.dob).toLocaleDateString('en-GB') : "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Gender</p>
                          <p className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white capitalize">{selectedStudentForView.gender || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Blood Group</p>
                          <p className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">{selectedStudentForView.bloodGroup || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Religion / Caste</p>
                          <p className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white capitalize">{(selectedStudentForView.religion || "N/A")} / {(selectedStudentForView.caste || "N/A")}</p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Father's Name</p>
                          <p className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">{selectedStudentForView.fatherName || "N/A"}</p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Mother's Name</p>
                          <p className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">{selectedStudentForView.motherName || "N/A"}</p>
                        </div>
                        
                        <div className="md:col-span-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Contact Details</p>
                                <div className="space-y-1.5 text-xs">
                                  {selectedStudentForView.email && (
                                      <div className="flex items-center gap-2">
                                          <Mail className="h-3.5 w-3.5 text-slate-400" />
                                          <span className="font-medium text-slate-700 dark:text-slate-300">{selectedStudentForView.email}</span>
                                      </div>
                                  )}
                                  {selectedStudentForView.whatsapp && (
                                      <div className="flex items-center gap-2">
                                          <Phone className="h-3.5 w-3.5 text-emerald-500" />
                                          <span className="font-medium text-slate-700 dark:text-slate-300">{selectedStudentForView.whatsapp} (WhatsApp)</span>
                                      </div>
                                  )}
                                </div>
                            </div>
                            <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Full Address</p>
                                <p className="font-medium text-slate-700 dark:text-slate-300 leading-relaxed text-xs">
                                    {(() => {
                                    let addrObj: any = {};
                                    try {
                                        addrObj = typeof selectedStudentForView.address === 'string' ? JSON.parse(selectedStudentForView.address) : selectedStudentForView.address;
                                    } catch(e) {}
                                    if(addrObj?.vill) {
                                        return `${addrObj.vill}, PO: ${addrObj.po || "N/A"}, PS: ${addrObj.ps || "N/A"}, Dist: ${addrObj.dist || "N/A"}, State: ${addrObj.state || "N/A"} - ${addrObj.pin || "N/A"}`;
                                    }
                                    return selectedStudentForView.address || "N/A";
                                    })()}
                                </p>
                            </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col overflow-hidden rounded-2xl p-0 border border-slate-200 dark:border-slate-800">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-lg sm:text-xl font-bold tracking-tight">Edit Student Profile</DialogTitle>
              <p className="text-xs text-slate-500 mt-0.5">Modify the student's information and save changes across the platform.</p>
            </DialogHeader>

            <form onSubmit={handleUpdate}>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* 01 Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b pb-1.5">
                      <span className="w-5 h-5 rounded bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">01</span>
                      Personal Information
                    </h3>
                    <div className="grid gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Name *</label>
                        <Input required value={editFormData.fullName} onChange={e => setEditFormData({ ...editFormData, fullName: e.target.value })} className="h-8 sm:h-9 rounded-lg text-xs" />
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Father's Name</label>
                          <Input value={editFormData.fatherName} onChange={e => setEditFormData({ ...editFormData, fatherName: e.target.value })} className="h-8 sm:h-9 rounded-lg text-xs" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mother's Name</label>
                          <Input value={editFormData.motherName} onChange={e => setEditFormData({ ...editFormData, motherName: e.target.value })} className="h-8 sm:h-9 rounded-lg text-xs" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Enrollment No</label>
                          <Input required value={editFormData.enrollmentNo} onChange={e => setEditFormData({ ...editFormData, enrollmentNo: e.target.value })} className="h-8 sm:h-9 rounded-lg text-xs" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Registration No</label>
                          <Input value={editFormData.registrationNo} onChange={e => setEditFormData({ ...editFormData, registrationNo: e.target.value.toUpperCase() })} placeholder="e.g. WB002Y2026B00001" className="h-8 sm:h-9 rounded-lg text-xs" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Login Password</label>
                          <Input type="text" value={editFormData.loginPassword} onChange={e => setEditFormData({ ...editFormData, loginPassword: e.target.value })} placeholder="Leave blank to keep current" className="h-8 sm:h-9 rounded-lg text-xs" />
                        </div>
                        <div className="hidden md:block"></div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Marksheet No</label>
                          <Input value={editFormData.marksheetNo} onChange={e => setEditFormData({ ...editFormData, marksheetNo: e.target.value })} placeholder="e.g. MS0001" className="h-8 sm:h-9 rounded-lg text-xs" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Certificate No</label>
                          <Input value={editFormData.certificateNo} onChange={e => setEditFormData({ ...editFormData, certificateNo: e.target.value })} placeholder="e.g. CR0001" className="h-8 sm:h-9 rounded-lg text-xs" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Date of Birth</label>
                          <Input
                            type="text"
                            placeholder="DD/MM/YYYY"
                            value={editFormData.dob}
                            onChange={e => {
                              let val = e.target.value.replace(/\D/g, '');
                              if (val.length > 8) val = val.slice(0, 8);
                              if (val.length >= 2 && val.length < 4) val = val.slice(0, 2) + '/' + val.slice(2);
                              else if (val.length >= 4) val = val.slice(0, 2) + '/' + val.slice(2, 4) + '/' + val.slice(4, 8);
                              setEditFormData({ ...editFormData, dob: val });
                            }}
                            maxLength={10}
                            className="h-8 sm:h-9 rounded-lg text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Admission Date</label>
                          <Input
                            type="text"
                            placeholder="DD/MM/YYYY"
                            value={editFormData.admissionDate}
                            onChange={e => {
                              let val = e.target.value.replace(/\D/g, '');
                              if (val.length > 8) val = val.slice(0, 8);
                              if (val.length >= 2 && val.length < 4) val = val.slice(0, 2) + '/' + val.slice(2);
                              else if (val.length >= 4) val = val.slice(0, 2) + '/' + val.slice(2, 4) + '/' + val.slice(4, 8);
                              setEditFormData({ ...editFormData, admissionDate: val });
                            }}
                            maxLength={10}
                            className="h-8 sm:h-9 rounded-lg text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Gender</label>
                          <select value={editFormData.gender} onChange={e => setEditFormData({ ...editFormData, gender: e.target.value })} className="flex h-8 sm:h-9 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-background px-2.5 py-1 text-xs outline-none">
                            <option value="">Select</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Blood Group</label>
                          <select value={editFormData.bloodGroup} onChange={e => setEditFormData({ ...editFormData, bloodGroup: e.target.value })} className="flex h-8 sm:h-9 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-background px-2.5 py-1 text-xs outline-none">
                            <option value="">Select</option>
                            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Religion</label>
                          <Input value={editFormData.religion} onChange={e => setEditFormData({ ...editFormData, religion: e.target.value })} className="h-8 sm:h-9 rounded-lg text-xs" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Caste</label>
                          <select value={editFormData.caste} onChange={e => setEditFormData({ ...editFormData, caste: e.target.value })} className="flex h-8 sm:h-9 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-background px-2.5 py-1 text-xs outline-none">
                            <option value="">Select</option>
                            {["GEN", "SC", "ST", "OBC", "Others"].map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 02 Contact & Address */}
                  <div className="space-y-4">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b pb-1.5">
                      <span className="w-5 h-5 rounded bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">02</span>
                      Contact & Address
                    </h3>
                    <div className="grid gap-3">
                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mobile Number *</label>
                          <Input value={editFormData.phone} onChange={e => setEditFormData({ ...editFormData, phone: e.target.value })} className="h-8 sm:h-9 rounded-lg text-xs" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">WhatsApp</label>
                          <Input value={editFormData.whatsapp} onChange={e => setEditFormData({ ...editFormData, whatsapp: e.target.value })} className="h-8 sm:h-9 rounded-lg text-xs" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</label>
                        <Input type="email" value={editFormData.email} onChange={e => setEditFormData({ ...editFormData, email: e.target.value })} className="h-8 sm:h-9 rounded-lg text-xs" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Guardian Phone</label>
                        <Input value={editFormData.guardianPhone} onChange={e => setEditFormData({ ...editFormData, guardianPhone: e.target.value })} className="h-8 sm:h-9 rounded-lg text-xs" />
                      </div>
                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Village/Street</label>
                          <Input value={editFormData.addressVill} onChange={e => setEditFormData({ ...editFormData, addressVill: e.target.value })} className="h-8 sm:h-9 rounded-lg text-xs" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Post Office</label>
                          <Input value={editFormData.addressPO} onChange={e => setEditFormData({ ...editFormData, addressPO: e.target.value })} className="h-8 sm:h-9 rounded-lg text-xs" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Police Station</label>
                          <Input value={editFormData.addressPS} onChange={e => setEditFormData({ ...editFormData, addressPS: e.target.value })} className="h-8 sm:h-9 rounded-lg text-xs" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">District</label>
                          <Input value={editFormData.addressDist} onChange={e => setEditFormData({ ...editFormData, addressDist: e.target.value })} className="h-8 sm:h-9 rounded-lg text-xs" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">State</label>
                          <Input value={editFormData.addressState} onChange={e => setEditFormData({ ...editFormData, addressState: e.target.value })} className="h-8 sm:h-9 rounded-lg text-xs" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">PIN Code</label>
                          <Input value={editFormData.addressPin} onChange={e => setEditFormData({ ...editFormData, addressPin: e.target.value })} className="h-8 sm:h-9 rounded-lg text-xs" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* 03 Academic Details */}
                  <div className="space-y-4">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b pb-1.5">
                      <span className="w-5 h-5 rounded bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">03</span>
                      Academic Details
                    </h3>
                    <div className="grid gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Qualification Name</label>
                        <Input value={editFormData.qualName} onChange={e => setEditFormData({ ...editFormData, qualName: e.target.value })} placeholder="e.g. 10th, 12th, B.A." className="h-8 sm:h-9 rounded-lg text-xs" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Board/University</label>
                        <Input value={editFormData.qualBoard} onChange={e => setEditFormData({ ...editFormData, qualBoard: e.target.value })} className="h-8 sm:h-9 rounded-lg text-xs" />
                      </div>
                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Year of Passing</label>
                          <Input value={editFormData.qualYear} onChange={e => setEditFormData({ ...editFormData, qualYear: e.target.value })} placeholder="YYYY" maxLength={4} className="h-8 sm:h-9 rounded-lg text-xs" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Percentage (%)</label>
                          <Input value={editFormData.qualPercent} onChange={e => setEditFormData({ ...editFormData, qualPercent: e.target.value })} className="h-8 sm:h-9 rounded-lg text-xs" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 04 Course Details */}
                  <div className="space-y-4">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b pb-1.5">
                      <span className="w-5 h-5 rounded bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">04</span>
                      Course Details
                    </h3>
                    <div className="grid gap-3">
                      <p className="text-[11px] text-slate-500">Super Admins cannot reassign courses or batches directly across franchises to prevent conflicts. Please have the franchise admin perform this action, or update directly from the DB.</p>
                      <div className="space-y-1 opacity-60 pointer-events-none">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Course</label>
                        <Input value={selectedStudent?.course?.title || "N/A"} readOnly className="h-8 sm:h-9 rounded-lg text-xs" />
                      </div>
                      <div className="space-y-1 opacity-60 pointer-events-none">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Batch</label>
                        <Input value={selectedStudent?.batch?.name || "N/A"} readOnly className="h-8 sm:h-9 rounded-lg text-xs" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 05 Documents */}
              <div className="space-y-3 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b pb-1.5">
                  <span className="w-5 h-5 rounded bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">05</span>
                  Documents
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Photo</label>
                    <ImageUpload value={editFormData.photoUrl} onChange={(url) => setEditFormData({ ...editFormData, photoUrl: url })} maxSizeK={100} folder={`RGYCSP/Students`} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Signature</label>
                    <ImageUpload value={editFormData.signatureUrl} onChange={(url) => setEditFormData({ ...editFormData, signatureUrl: url })} maxSizeK={100} folder={`RGYCSP/Students`} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">ID Proof</label>
                    <ImageUpload value={editFormData.idProofUrl} onChange={(url) => setEditFormData({ ...editFormData, idProofUrl: url })} maxSizeK={1024} folder={`RGYCSP/Students`} />
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5 sticky bottom-0 bg-white dark:bg-slate-900 z-10 -mx-2 px-2 pb-1">
                <Button type="button" variant="outline" onClick={() => setEditOpen(false)} className="rounded-lg font-semibold h-8 sm:h-9 px-4 text-xs" disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="rounded-lg font-semibold h-8 sm:h-9 px-5 text-xs shadow-sm shadow-primary/20 hover:shadow-primary/30 transition-all">
                  {isSubmitting ? "Updating..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
      
      <ConfirmDialog 
        open={!!studentToDelete} 
        onOpenChange={(open) => !open && setStudentToDelete(null)}
        title="Are you absolutely sure?"
        description={
          <>
            This action cannot be undone. This will permanently delete <strong className="text-slate-900 dark:text-white">{studentToDelete?.fullName}</strong> from the system and remove their data from our servers.
          </>
        }
        onConfirm={confirmDelete}
        confirmText="Delete Student"
      />

      {/* Docs Modal */}
      <Dialog open={docsModalOpen} onOpenChange={setDocsModalOpen}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[88vh] flex flex-col overflow-hidden rounded-2xl p-0 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
            <DialogHeader className="mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2">
                <FileText className="w-5 h-5" />
              </div>
              <DialogTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Manage Documents
              </DialogTitle>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Issue and manage documents for <strong className="text-slate-900 dark:text-white font-bold">{selectedStudentForDocs?.fullName}</strong>.
              </p>
            </DialogHeader>

            <div className="flex flex-col gap-4">
              {(() => {
                const certStatus = getDocumentStatus(selectedStudentForDocs, null, initialConfig);
                return (
                  <>
                    {/* Top: Certificate */}
                    <div className="flex flex-col p-4 bg-white dark:bg-slate-900 border border-amber-200/60 dark:border-amber-800/50 rounded-xl shadow-sm hover:shadow transition-all relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-[3rem] -z-10"></div>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 pr-3">
                          <div className="flex items-center gap-2.5 mb-1.5">
                            <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                              <GraduationCap className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                            </div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight">Final Certificate</h3>
                          </div>
                          <p className="text-xs text-slate-500 leading-snug">Official completion certificate. This is the final milestone document.</p>
                          {selectedStudentForDocs?.certificateNo && (
                            <div className="mt-1.5 text-[11px] font-mono font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-2.5 py-0.5 rounded border border-amber-200 dark:border-amber-800 inline-block">
                              Cert No: {selectedStudentForDocs.certificateNo}
                            </div>
                          )}
                        </div>
                        {certStatus.isCertAuto ? (
                          <Badge className="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 border-0 rounded-lg px-2.5 py-1 text-xs font-bold">Auto Issued</Badge>
                        ) : selectedStudentForDocs?.certificateIssuedToStudent ? (
                          <Badge className="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 border-0 rounded-lg px-2.5 py-1 text-xs font-bold">Issued</Badge>
                        ) : selectedStudentForDocs?.certificateApproved ? (
                          <Badge className="bg-blue-50 text-blue-600 dark:bg-blue-500/10 border-0 rounded-lg px-2.5 py-1 text-xs font-bold">Approved</Badge>
                        ) : (
                          <Badge className="bg-amber-50 text-amber-600 dark:bg-amber-500/10 border-0 rounded-lg px-2.5 py-1 text-xs font-bold">Pending</Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between pt-3 mt-2.5 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Super Admin Approval</span>
                          {!certStatus.isCertAuto ? (
                            <Switch 
                              checked={!!selectedStudentForDocs?.certificateApproved} 
                              disabled={!!selectedStudentForDocs?.certificateApproved && selectedStudentForDocs.status === "PASS_OUT"}
                              onCheckedChange={(checked) => {
                                if (docRefs.current['CERTIFICATE'] && !docRefs.current['CERTIFICATE']?.hasTemplate()) {
                                  toast.error(`Design template for Certificate does not exist yet!`);
                                  return;
                                }
                                handleIssueDocument(selectedStudentForDocs?.id, 'CERTIFICATE', checked);
                              }}
                              className={selectedStudentForDocs?.certificateApproved ? "data-[state=checked]:bg-emerald-500" : ""}
                            />
                          ) : (
                            <span className="text-xs text-slate-400 font-medium">Auto Issued</span>
                          )}
                        </div>
                        
                        {activeTemplates.filter(t => t.type === 'CERTIFICATE').length > 1 && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-semibold text-slate-500">Design:</span>
                            <Select 
                              value={selectedDocTemplates['CERTIFICATE'] || activeTemplates.find(t => t.type === 'CERTIFICATE')?.id || ''}
                              onValueChange={(val: any) => setSelectedDocTemplates(prev => ({ ...prev, CERTIFICATE: String(val) }))}
                            >
                              <SelectTrigger className="h-7 text-[11px] font-medium bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 max-w-[170px]">
                                <SelectValue placeholder="Select Template">
                                  {activeTemplates.find(t => t.id === (selectedDocTemplates['CERTIFICATE'] || activeTemplates.find(a => a.type === 'CERTIFICATE')?.id))?.name || "Select Template"}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {activeTemplates.filter(t => t.type === 'CERTIFICATE').map(t => (
                                  <SelectItem key={t.id} value={t.id} className="text-xs">
                                    {t.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        <DocumentRenderer 
                          ref={el => { docRefs.current['CERTIFICATE'] = el; }} 
                          type="CERTIFICATE" 
                          templateId={selectedDocTemplates['CERTIFICATE'] || null}
                          student={selectedStudentForDocs}
                        />

                        <div className="flex items-center gap-1.5">
                          <Button variant="outline" size="sm" className="rounded-lg font-semibold h-8 px-3 text-xs" onClick={() => docRefs.current['CERTIFICATE']?.preview()}><Eye className="w-3.5 h-3.5 mr-1" /> Preview</Button>
                          <Button size="sm" className="rounded-lg font-semibold h-8 px-3 text-xs shadow-sm shadow-primary/20" onClick={() => docRefs.current['CERTIFICATE']?.downloadPDF()}><Download className="w-3.5 h-3.5 mr-1" /> Download</Button>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}

              {/* Middle: Marksheets */}
              {(() => {
                let totalSemesters = 1;
                if (selectedStudentForDocs?.course?.duration) {
                  const durationStr = String(selectedStudentForDocs.course.duration).toLowerCase().trim();
                  if (!isNaN(Number(durationStr))) {
                    totalSemesters = Math.max(1, Math.floor(Number(durationStr) / 6));
                  } else {
                    if (durationStr.includes('1 year') || durationStr.includes('1 yr')) totalSemesters = 2;
                    else if (durationStr.includes('2 year') || durationStr.includes('2 yr')) totalSemesters = 4;
                    else if (durationStr.includes('3 year') || durationStr.includes('3 yr')) totalSemesters = 6;
                    else if (durationStr.includes('12')) totalSemesters = 2;
                    else if (durationStr.includes('18')) totalSemesters = 3;
                    else if (durationStr.includes('24')) totalSemesters = 4;
                    else if (durationStr.includes('30')) totalSemesters = 5;
                    else if (durationStr.includes('36')) totalSemesters = 6;
                    else if (durationStr.includes('6')) totalSemesters = 1;
                  }
                }

                const semestersData = [];
                for (let i = 1; i <= totalSemesters; i++) {
                  const semData = selectedStudentForDocs?.semesters?.find((s:any) => s.semesterNumber === i);
                  const status = getDocumentStatus(selectedStudentForDocs, semData, initialConfig);
                  semestersData.push({ 
                    semesterNumber: i, 
                    approved: semData?.marksheetApproved || false,
                    issued: semData?.marksheetIssuedToStudent || false,
                    isAuto: status.isMarksheetAuto,
                    finalIssued: status.finalMarksheetIssued,
                    finalApproved: status.finalMarksheetApproved
                  });
                }

                return (
                  <div className="flex flex-col p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm">
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight">Academic Marksheets</h3>
                        <p className="text-xs text-slate-500 leading-snug">Semester-wise detailed marksheets. (Total {totalSemesters})</p>
                        {selectedStudentForDocs?.marksheetNo && (
                          <div className="mt-1 text-[11px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 inline-block">
                            Marksheet No: {selectedStudentForDocs.marksheetNo}
                          </div>
                        )}
                      </div>
                      {activeTemplates.filter(t => t.type === 'MARKSHEET').length > 1 && (
                        <div className="flex items-center gap-1.5 ml-auto">
                          <span className="text-[10px] font-semibold text-slate-500">Design:</span>
                          <Select 
                            value={selectedDocTemplates['MARKSHEET'] || activeTemplates.find(t => t.type === 'MARKSHEET')?.id || ''}
                            onValueChange={(val: any) => setSelectedDocTemplates(prev => ({ ...prev, MARKSHEET: String(val) }))}
                          >
                            <SelectTrigger className="h-7 text-[11px] font-medium bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 max-w-[170px]">
                              <SelectValue placeholder="Select Template">
                                {activeTemplates.find(t => t.id === (selectedDocTemplates['MARKSHEET'] || activeTemplates.find(a => a.type === 'MARKSHEET')?.id))?.name || "Select Template"}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {activeTemplates.filter(t => t.type === 'MARKSHEET').map(t => (
                                <SelectItem key={t.id} value={t.id} className="text-xs">
                                  {t.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                    
                    <div className="border border-slate-100 dark:border-slate-800 rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                          <TableRow>
                            <TableHead className="font-semibold text-xs py-2">Semester</TableHead>
                            <TableHead className="font-semibold text-xs py-2">Status</TableHead>
                            <TableHead className="font-semibold text-xs py-2 text-center">SA Approval</TableHead>
                            <TableHead className="font-semibold text-xs py-2 text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {semestersData.map((sem) => {
                            const uniqueKey = `MARKSHEET_${sem.semesterNumber}`;
                            return (
                              <TableRow key={uniqueKey} className="hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/50">
                                <TableCell className="font-semibold text-xs py-2 text-slate-700 dark:text-slate-300">Semester {sem.semesterNumber}</TableCell>
                                <TableCell className="py-2">
                                  {sem.isAuto ? (
                                    <Badge className="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 border-0 rounded px-2 py-0.5 text-[10px] font-bold">Auto Issued</Badge>
                                  ) : sem.issued ? (
                                    <Badge className="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 border-0 rounded px-2 py-0.5 text-[10px] font-bold">Issued</Badge>
                                  ) : sem.approved ? (
                                    <Badge className="bg-blue-50 text-blue-600 dark:bg-blue-500/10 border-0 rounded px-2 py-0.5 text-[10px] font-bold">Approved</Badge>
                                  ) : (
                                    <Badge className="bg-amber-50 text-amber-600 dark:bg-amber-500/10 border-0 rounded px-2 py-0.5 text-[10px] font-bold">Pending</Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-center py-2">
                                  {!sem.isAuto ? (
                                    <Switch 
                                      checked={!!sem.approved} 
                                      onCheckedChange={(checked) => {
                                        if (docRefs.current[uniqueKey] && !docRefs.current[uniqueKey]?.hasTemplate()) {
                                          toast.error(`Design template for Marksheet Sem ${sem.semesterNumber} does not exist yet!`);
                                          return;
                                        }
                                        handleIssueDocument(selectedStudentForDocs?.id, 'MARKSHEET', checked, sem.semesterNumber);
                                      }}
                                      className={sem.approved ? "data-[state=checked]:bg-emerald-500" : ""}
                                    />
                                  ) : (
                                    <span className="text-xs text-slate-400 font-medium">Auto Issued</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-right py-2">
                                  <div className="flex items-center justify-end gap-1">
                                    <DocumentRenderer ref={el => { docRefs.current[uniqueKey] = el; }} type="MARKSHEET" templateId={selectedDocTemplates['MARKSHEET'] || null} student={selectedStudentForDocs} semesterNumber={sem.semesterNumber} />
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-blue-600" onClick={() => docRefs.current[uniqueKey]?.preview()}><Eye className="w-3.5 h-3.5" /></Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-emerald-600" onClick={() => docRefs.current[uniqueKey]?.downloadPDF()}><Download className="w-3.5 h-3.5" /></Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                );
              })()}

              {/* Bottom: Auxiliary Documents */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'STUDENT_ID', label: 'Student ID Card', desc: 'Identity verification.', icon: <User className="w-4 h-4 text-blue-500 dark:text-blue-400" /> },
                  { id: 'ADMIT_CARD', label: 'Admit Card', desc: 'Required for examinations.', icon: <Calendar className="w-4 h-4 text-indigo-500 dark:text-indigo-400" /> }
                ].map((doc) => (
                  <div key={doc.id} className="flex flex-col p-3.5 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-xl gap-2.5 hover:border-blue-200 dark:hover:border-blue-900/50 hover:shadow-sm transition-all group">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 flex items-center justify-center shadow-xs">
                          {doc.icon}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white text-sm">{doc.label}</h3>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{doc.desc}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2.5 mt-0.5 border-t border-slate-100 dark:border-slate-800/60">
                      <div className="flex items-center gap-1.5">
                        {activeTemplates.filter(t => t.type === doc.id).length > 1 ? (
                          <Select 
                            value={selectedDocTemplates[doc.id] || activeTemplates.find(t => t.type === doc.id)?.id || ''}
                            onValueChange={(val: any) => setSelectedDocTemplates(prev => ({ ...prev, [doc.id]: String(val) }))}
                          >
                            <SelectTrigger className="h-6 text-[10px] font-medium bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 max-w-[140px]">
                              <SelectValue placeholder="Select Template">
                                {activeTemplates.find(t => t.id === (selectedDocTemplates[doc.id] || activeTemplates.find(a => a.type === doc.id)?.id))?.name || "Select Template"}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {activeTemplates.filter(t => t.type === doc.id).map(t => (
                                <SelectItem key={t.id} value={t.id} className="text-xs">
                                  {t.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[9px] font-semibold text-slate-600 dark:text-slate-400">
                            <ShieldCheck className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                            <span className="uppercase tracking-wider">Delegated</span>
                          </div>
                        )}
                      </div>
                      
                      <DocumentRenderer ref={el => { docRefs.current[doc.id] = el; }} type={doc.id as any} templateId={selectedDocTemplates[doc.id] || null} student={selectedStudentForDocs} />
                      
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400" onClick={() => docRefs.current[doc.id]?.preview()}><Eye className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400" onClick={() => docRefs.current[doc.id]?.downloadPDF()}><Download className="w-3.5 h-3.5" /></Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {manageResultStudent && (
        <ManageResultModal
          isOpen={!!manageResultStudent}
          onClose={() => setManageResultStudent(null)}
          student={manageResultStudent}
          onSave={() => router.refresh()}
        />
      )}

      <BulkDocumentGenerator 
        open={bulkDownloadOpen}
        onOpenChange={setBulkDownloadOpen}
        selectedStudentIds={selectedStudentIds}
        students={initialStudents}
      />

      {/* Document Print & Download Settings Modal */}
      <Dialog open={printSettingsOpen} onOpenChange={setPrintSettingsOpen}>
        <DialogContent className="max-w-xl rounded-2xl p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl">
          <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Printer className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Document Print & Download Settings</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Configure default templates and print quality for student documents</p>
                </div>
              </div>
            </div>

            {/* Quality & High-Res Clarity Banner */}
            <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 rounded-xl flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-800 dark:text-emerald-300">
                <p className="font-semibold">Full Resolution Printing Active</p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400/90 mt-0.5">
                  Document templates are rendered without lossy compression and exported at 300 DPI high-clarity background print mode.
                </p>
              </div>
            </div>

            {/* Active Templates Config Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Default Active Templates for Printing</h4>
                <Link 
                  href="/super-admin/documents" 
                  className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
                >
                  Manage Templates <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-2.5">
                {[
                  { type: 'CERTIFICATE', label: 'Certificate Template', desc: 'Design used for student completion certificates' },
                  { type: 'MARKSHEET', label: 'Marksheet Template', desc: 'Design used for semester and final marksheets' },
                  { type: 'ADMIT_CARD', label: 'Admit Card Template', desc: 'Design used for exam hall admit cards' },
                  { type: 'STUDENT_ID', label: 'Student ID Card Template', desc: 'Design used for student identification cards' }
                ].map(item => {
                  const matchingTemplates = activeTemplates.filter(t => t.type === item.type);
                  const currentSelected = selectedDocTemplates[item.type] || matchingTemplates[0]?.id || "";

                  return (
                    <div key={item.type} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.label}</span>
                          <Badge variant="outline" className="text-[9px] font-semibold border-slate-200 dark:border-slate-700 text-slate-500">
                            {matchingTemplates.length} {matchingTemplates.length === 1 ? 'Design Active' : 'Designs Active'}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
                      </div>

                      <div className="w-full sm:w-56 shrink-0">
                        {matchingTemplates.length === 0 ? (
                          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">No active template found</span>
                        ) : (
                          <Select
                            value={currentSelected}
                            onValueChange={(val: any) => {
                              setSelectedDocTemplates(prev => ({ ...prev, [item.type]: String(val) }));
                              toast.success(`Default ${item.label} updated to ${matchingTemplates.find(t => t.id === val)?.name}`);
                            }}
                          >
                            <SelectTrigger className="h-8 text-xs font-medium bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-lg">
                              <SelectValue placeholder="Choose template">
                                {matchingTemplates.find(t => t.id === currentSelected)?.name || "Choose template"}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {matchingTemplates.map(t => (
                                <SelectItem key={t.id} value={t.id} className="text-xs">
                                  {t.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPrintSettingsOpen(false)}
                className="h-8 text-xs font-semibold rounded-lg"
              >
                Close
              </Button>
              <Button 
                size="sm" 
                onClick={() => {
                  setPrintSettingsOpen(false);
                  toast.success("Print settings preferences saved for this session!");
                }}
                className="h-8 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4"
              >
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Password Reset Modal */}
      <Dialog open={passwordModalOpen} onOpenChange={setPasswordModalOpen}>
        <DialogContent className="sm:max-w-[380px] rounded-2xl p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="bg-white dark:bg-slate-900 p-5 sm:p-6">
            <div className="flex flex-col items-center text-center space-y-1.5 mb-4">
              <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center mb-1">
                <ShieldCheck className="h-5 w-5 text-amber-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Change Password</h3>
              <p className="text-xs text-slate-500">Set a new login password for {selectedStudentForView?.fullName}</p>
            </div>
            
            <form onSubmit={handlePasswordUpdate} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">New Password</label>
                <Input 
                  type="text" 
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="h-8 sm:h-9 rounded-lg text-xs bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confirm Password</label>
                <Input 
                  type="text" 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="h-8 sm:h-9 rounded-lg text-xs bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                />
              </div>
              <div className="pt-2 flex gap-2">
                <Button type="button" variant="outline" className="flex-1 rounded-lg h-8 sm:h-9 text-xs font-semibold" onClick={() => setPasswordModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1 rounded-lg h-8 sm:h-9 text-xs bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-sm shadow-amber-500/20">
                  {isSubmitting ? "Updating..." : "Update"}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </TooltipProvider>
  );
}
