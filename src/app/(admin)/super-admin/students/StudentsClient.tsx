"use client";

import React, { useState, useMemo, useRef } from "react";
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
import { updateStudent } from "@/app/actions/students";
import { issueStudentDocument, markStudentsAsNotPrinted } from "@/app/actions/student-documents";
import { registerStudent } from "@/app/actions/student-registration";
import { updateRegistrationConfig } from "@/app/actions/registration-config";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
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
import { DocumentRenderer, DocumentRendererRef } from "@/components/documents/DocumentRenderer";
import { BulkDocumentGenerator } from "@/components/documents/BulkDocumentGenerator";
import { getDocumentStatus } from "@/lib/document-utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ManageResultModal } from "@/components/students/ManageResultModal";

interface StudentsClientProps {
  initialStudents: any[];
  initialWorkspaces: any[];
  initialConfig: any;
}

export default function StudentsClient({ initialStudents, initialWorkspaces, initialConfig }: StudentsClientProps) {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
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

  // Config State
  const [configData, setConfigData] = useState({
    enrollmentPrefix: initialConfig?.enrollmentPrefix || "RGY",
    enrollmentDigits: initialConfig?.enrollmentDigits || 6,
    registrationSeries: initialConfig?.registrationSeries || "B",
    certificatePrefix: initialConfig?.certificatePrefix || "CERT",
    certificateDigits: initialConfig?.certificateDigits || 4,
    marksheetPrefix: initialConfig?.marksheetPrefix || "MS",
    marksheetDigits: initialConfig?.marksheetDigits || 4,
    autoDocumentIssueEnabled: initialConfig?.autoDocumentIssueEnabled || false,
    autoMarksheetDays: initialConfig?.autoMarksheetDays || 2,
    autoCertificateDays: initialConfig?.autoCertificateDays || 30,
    autoIssueAfterRequestHours: initialConfig?.autoIssueAfterRequestHours || 1,
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
  });

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
      marksheetNo: student.marksheetNo || "",
      certificateNo: student.certificateNo || "",
      loginPassword: student.loginPassword || "",
      phone: student.phone || "",
      email: student.email || "",
      whatsapp: student.whatsapp || "",
      dob: student.dob ? new Date(student.dob).toLocaleDateString('en-GB') : "",
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

  const confirmDelete = () => {
    if (!studentToDelete) return;
    toast.info(`Delete functionality for ${studentToDelete.fullName} will be implemented soon!`);
    setStudentToDelete(null);
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
    return initialStudents.filter(s => {
      const searchLower = searchTerm.toLowerCase();
      const dobStr = s.dob ? new Date(s.dob).toLocaleDateString('en-GB') : "";
      const adminDateStr = s.admissionDate ? new Date(s.admissionDate).toLocaleDateString('en-GB') : "";
      
      // Get all registration numbers for this student as a string array
      const regNos = s.registrations ? s.registrations.map((r: any) => r.registrationNo?.toLowerCase() || "") : [];

      const matchesSearch =
        s.fullName.toLowerCase().includes(searchLower) ||
        s.enrollmentNo.toLowerCase().includes(searchLower) ||
        regNos.some((r: string) => r.includes(searchLower)) ||
        (s.applicationId && s.applicationId.toLowerCase().includes(searchLower)) ||
        (s.phone && s.phone.includes(searchLower)) ||
        (s.email && s.email.toLowerCase().includes(searchLower)) ||
        (s.workspace?.name && s.workspace.name.toLowerCase().includes(searchLower)) ||
        (s.workspace?.centerCode && s.workspace.centerCode.toLowerCase().includes(searchLower)) ||
        dobStr.includes(searchLower) ||
        adminDateStr.includes(searchLower);

      const matchesStatus = s.status === statusFilter;

      let matchesRequest = true;
      if (showRequestsOnly && statusFilter === "REGISTERED") {
        matchesRequest = false;
        if (s.documentIssueRequestedAt) {
          const certStatus = getDocumentStatus(s, null, configData as any);
          if (!(certStatus.finalCertApproved || certStatus.finalCertIssued || certStatus.isCertAuto)) {
            matchesRequest = true;
          }
        }
      }

      return matchesSearch && matchesStatus && matchesRequest;
    });
  }, [initialStudents, searchTerm, statusFilter, showRequestsOnly, configData]);

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  
  // Add state for selected students (for bulk actions)
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [bulkDownloadOpen, setBulkDownloadOpen] = useState(false);

  // Stats for cards
  const stats = useMemo(() => {
    let registered = 0, unregistered = 0, passout = 0;
    initialStudents.forEach(s => {
      if (s.status === "REGISTERED") registered++;
      else if (s.status === "UNREGISTERED") unregistered++;
      else if (s.status === "PASS_OUT") passout++;
    });
    return {
      total: initialStudents.length,
      registered,
      unregistered,
      passout
    };
  }, [initialStudents]);

  const tabs = [
    { id: "UNREGISTERED", label: "Pending Registration", icon: User },
    { id: "REGISTERED", label: "Registered Students", icon: UserCheck },
    { id: "PASS_OUT", label: "Pass Out", icon: GraduationCap },
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
    return (
      <div className="flex items-center justify-between px-6 py-4 border-t border-slate-50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20">
        <div className="text-sm font-medium text-slate-500">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="h-9 px-3 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1 hidden sm:flex">
            {Array.from({ length: totalPages }).map((_, i) => {
              if (
                i === 0 ||
                i === totalPages - 1 ||
                (i >= currentPage - 2 && i <= currentPage)
              ) {
                return (
                  <Button
                    key={i}
                    variant={currentPage === i + 1 ? "default" : "ghost"}
                    onClick={() => setPage(i + 1)}
                    className={cn("h-9 w-9 rounded-xl font-bold text-xs", currentPage === i + 1 ? "shadow-md shadow-primary/20" : "text-slate-500")}
                  >
                    {i + 1}
                  </Button>
                );
              } else if (
                i === currentPage - 3 ||
                i === currentPage + 1
              ) {
                return <span key={i} className="px-1 text-slate-400">...</span>;
              }
              return null;
            })}
          </div>
          <Button variant="outline" size="sm" onClick={() => setPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="h-9 px-3 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <TooltipProvider delay={300}>
      <div className="space-y-10 pb-12 w-full mx-auto">
      <AdminPageHeader
        title="Student Management"
        description="Global directory of all students registered across all franchise workspaces."
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Students", value: stats.total, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Registered", value: stats.registered, icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Unregistered", value: stats.unregistered, icon: FileText, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Pass Out", value: stats.passout, icon: GraduationCap, color: "text-purple-500", bg: "bg-purple-500/10" },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={cn("p-3.5 rounded-2xl", stat.bg)}>
                  <stat.icon className={cn("h-6 w-6", stat.color)} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-0.5">{stat.label}</p>
                  <p className="text-3xl font-bold tracking-tight">{stat.value.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-2 p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-full">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setStatusFilter(tab.id); setCurrentPage(1); }}
            className={cn(
              "flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap shrink-0",
              statusFilter === tab.id
                ? "bg-white dark:bg-slate-700 text-primary shadow-sm border border-slate-200/50 dark:border-slate-700/50"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden transition-all duration-500">
        {statusFilter === "CONFIG" ? (
          <div className="p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                System Configuration
              </h2>
              <Button 
                onClick={handleSaveConfig} 
                disabled={isSavingConfig}
                className="rounded-xl font-bold px-6 h-10 text-sm shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-0.5 w-full sm:w-auto"
              >
                {isSavingConfig ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save Config</>}
              </Button>
            </div>

            <div className="max-w-5xl mx-auto w-full">
              <Accordion defaultValue={[]} className="space-y-6">
                {/* Registration Config Accordion Item */}
                <AccordionItem value="registration" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm px-1">
                  <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-blue-600 dark:text-blue-500" />
                      </div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-200">Registration Number Config</h3>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-6 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 w-full mt-4">
                      {/* Left Side: Inputs */}
                      <div className="space-y-6">
                        <div>
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-1">Enrollment Number Prefix</label>
                          <p className="text-xs text-slate-500 mb-3">Used as the prefix for all generated Enrollment Numbers (e.g., RGY12345678)</p>
                          <Input 
                            value={configData.enrollmentPrefix || ""} 
                            onChange={e => setConfigData(prev => ({ ...prev, enrollmentPrefix: e.target.value.toUpperCase() }))}
                            className="h-12 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl font-bold font-mono tracking-wider"
                            placeholder="e.g. RGY"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-1">Registration Number Series</label>
                          <p className="text-xs text-slate-500 mb-3">Used in the Franchise Registration Number (e.g., WB002Y2026<span className="font-bold text-primary">B</span>12345)</p>
                          <Input 
                            value={configData.registrationSeries || ""} 
                            onChange={e => setConfigData(prev => ({ ...prev, registrationSeries: e.target.value.toUpperCase() }))}
                            className="h-12 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl font-bold font-mono tracking-wider"
                            placeholder="e.g. B"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-1">Enrollment Number Length</label>
                          <p className="text-xs text-slate-500 mb-3">Number of digits in the generated Enrollment Number (6 to 12). (e.g. 6 = {configData.enrollmentPrefix || "RGY"}000001)</p>
                          <Input 
                            type="number"
                            min="6"
                            max="12"
                            value={configData.enrollmentDigits || 6} 
                            onChange={e => setConfigData(prev => ({ ...prev, enrollmentDigits: parseInt(e.target.value) || 6 }))}
                            className="h-12 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl font-bold font-mono tracking-wider"
                            placeholder="e.g. 6"
                          />
                        </div>
                      </div>

                      {/* Right Side: Live Preview */}
                      <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900/50 rounded-[2rem] p-6 lg:p-8 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-center h-full">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200/50 dark:border-slate-700/50">
                          <div className="p-2 bg-primary/10 rounded-xl text-primary">
                            <Eye className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-black text-lg text-slate-800 dark:text-slate-100">Live Preview</h3>
                            <p className="text-xs text-slate-500">How the generated IDs will look</p>
                          </div>
                        </div>
                        
                        <div className="space-y-6">
                          <div className="group">
                            <p className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 mb-2 group-hover:text-primary transition-colors">Sample Enrollment No</p>
                            <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner flex items-center justify-center">
                              <span className="text-xl sm:text-2xl font-black font-mono tracking-widest text-slate-800 dark:text-slate-200">
                                <span className="text-indigo-600 dark:text-indigo-400">{configData.enrollmentPrefix ?? "PREFIX"}</span>
                                <span>{String(123456).padStart(configData.enrollmentDigits || 6, '0')}</span>
                              </span>
                            </div>
                          </div>
                          <div className="group">
                            <p className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 mb-2 group-hover:text-primary transition-colors">Sample Registration No</p>
                            <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner flex items-center justify-center text-center">
                              <span className="text-xl sm:text-2xl font-black font-mono tracking-widest text-slate-800 dark:text-slate-200 break-all">
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
                <AccordionItem value="documentNumber" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm px-1">
                  <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-500" />
                      </div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-200">Document Number Config</h3>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-6 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 w-full mt-4">
                      {/* Left Side: Inputs */}
                      <div className="space-y-6">
                        <div>
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-1">Certificate Prefix</label>
                          <p className="text-xs text-slate-500 mb-3">Prefix used when generating Certificate Numbers (e.g., CERT0001)</p>
                          <Input 
                            value={configData.certificatePrefix || ""} 
                            onChange={e => setConfigData(prev => ({ ...prev, certificatePrefix: e.target.value.toUpperCase() }))}
                            className="h-12 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl font-bold font-mono tracking-wider"
                            placeholder="e.g. CERT"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-1">Certificate Number Length</label>
                          <p className="text-xs text-slate-500 mb-3">Number of numeric digits used (e.g. 4 = CERT0001)</p>
                          <Input 
                            type="number"
                            min="3" max="10"
                            value={configData.certificateDigits || 4} 
                            onChange={e => setConfigData(prev => ({ ...prev, certificateDigits: parseInt(e.target.value) || 4 }))}
                            className="h-12 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl font-bold font-mono tracking-wider"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-1">Marksheet Prefix</label>
                          <p className="text-xs text-slate-500 mb-3">Prefix used when generating Marksheet Numbers (e.g., MS0001)</p>
                          <Input 
                            value={configData.marksheetPrefix || ""} 
                            onChange={e => setConfigData(prev => ({ ...prev, marksheetPrefix: e.target.value.toUpperCase() }))}
                            className="h-12 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl font-bold font-mono tracking-wider"
                            placeholder="e.g. MS"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-1">Marksheet Number Length</label>
                          <p className="text-xs text-slate-500 mb-3">Number of numeric digits used (e.g. 4 = MS0001)</p>
                          <Input 
                            type="number"
                            min="3" max="10"
                            value={configData.marksheetDigits || 4} 
                            onChange={e => setConfigData(prev => ({ ...prev, marksheetDigits: parseInt(e.target.value) || 4 }))}
                            className="h-12 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl font-bold font-mono tracking-wider"
                          />
                        </div>
                      </div>

                      {/* Right Side: Live Preview */}
                      <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900/50 rounded-[2rem] p-6 lg:p-8 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-center h-full">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200/50 dark:border-slate-700/50">
                          <div className="p-2 bg-primary/10 rounded-xl text-primary">
                            <Eye className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-black text-lg text-slate-800 dark:text-slate-100">Live Preview</h3>
                            <p className="text-xs text-slate-500">How the generated document numbers will look</p>
                          </div>
                        </div>
                        
                        <div className="space-y-6">
                          <div className="group">
                            <p className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 mb-2 group-hover:text-primary transition-colors">Sample Certificate No</p>
                            <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner flex items-center justify-center">
                              <span className="text-xl sm:text-2xl font-black font-mono tracking-widest text-slate-800 dark:text-slate-200">
                                <span className="text-indigo-600 dark:text-indigo-400">{configData.certificatePrefix ?? "CERT"}</span>
                                <span>{String(123456).padStart(configData.certificateDigits || 4, '0')}</span>
                              </span>
                            </div>
                          </div>
                          <div className="group">
                            <p className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 mb-2 group-hover:text-primary transition-colors">Sample Marksheet No</p>
                            <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner flex items-center justify-center text-center">
                              <span className="text-xl sm:text-2xl font-black font-mono tracking-widest text-slate-800 dark:text-slate-200 break-all">
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
                <AccordionItem value="documents" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm px-1">
                  <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                          <Settings className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-200">Automatic Document Issue</h3>
                      </div>
                      <div onClick={(e) => e.stopPropagation()}>
                        <Switch 
                          checked={configData.autoDocumentIssueEnabled}
                          onCheckedChange={(checked) => setConfigData(prev => ({ ...prev, autoDocumentIssueEnabled: checked }))}
                          className="data-[state=checked]:bg-primary"
                        />
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-6 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="mt-4">
                      {configData.autoDocumentIssueEnabled ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div>
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-1">Marksheet Delay (Days)</label>
                            <p className="text-xs text-slate-500 mb-3">Days after franchise uploads marks to auto-issue marksheet.</p>
                            <Input 
                              type="number"
                              value={configData.autoMarksheetDays} 
                              onChange={e => setConfigData(prev => ({ ...prev, autoMarksheetDays: parseInt(e.target.value) || 0 }))}
                              className="h-12 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-1">Certificate Delay (Days)</label>
                            <p className="text-xs text-slate-500 mb-3">Days after final marksheet is published to auto-issue certificate.</p>
                            <Input 
                              type="number"
                              value={configData.autoCertificateDays} 
                              onChange={e => setConfigData(prev => ({ ...prev, autoCertificateDays: parseInt(e.target.value) || 0 }))}
                              className="h-12 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl"
                            />
                          </div>
                          <div className="col-span-1 md:col-span-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-1">Quick Issue Delay (Hours)</label>
                            <p className="text-xs text-slate-500 mb-3">Hours to wait after a franchise admin clicks "Request Quick Issue" before auto-approving the documents. Set to 0 to disable quick auto-issue (requires manual approval).</p>
                            <Input 
                              type="number"
                              value={configData.autoIssueAfterRequestHours} 
                              onChange={e => setConfigData(prev => ({ ...prev, autoIssueAfterRequestHours: parseInt(e.target.value) || 0 }))}
                              className="h-12 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl max-w-sm"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
                          Automatic document issuance is currently disabled. Documents will require manual approval.
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        ) : (
          <>
        <CardHeader className="p-6 md:p-8 border-b border-slate-50 dark:border-slate-800/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center flex-wrap md:flex-nowrap gap-4 w-full md:w-auto">
              {statusFilter !== "CONFIG" && (
                <div className="flex items-center gap-3 pr-4 border-r border-slate-200 dark:border-slate-800 h-14">
                  <Checkbox 
                    checked={filteredStudents.length > 0 && selectedStudentIds.length === filteredStudents.length}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedStudentIds(filteredStudents.map(s => s.id));
                      } else {
                        setSelectedStudentIds([]);
                      }
                    }}
                    className="rounded-md w-5 h-5 border-slate-300 dark:border-slate-600 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                    title="Select all filtered students"
                  />
                  {selectedStudentIds.length > 0 && (
                    <Button 
                      variant="default" 
                      onClick={() => setBulkDownloadOpen(true)}
                      className="bg-primary hover:bg-primary/90 text-white font-bold h-10 px-4 rounded-xl shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all text-xs flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" /> Bulk Download ({selectedStudentIds.length})
                    </Button>
                  )}
                </div>
              )}
              <div className="relative w-full md:max-w-[350px] group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <Input
                  placeholder="Search by ID, Name, Phone, Franchise..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="pl-11 pr-4 bg-slate-50 dark:bg-slate-800/40 border-none rounded-2xl h-14 font-bold text-sm transition-all focus-visible:ring-2 focus-visible:ring-primary/20 placeholder:text-slate-400 placeholder:font-medium"
                />
              </div>
              {statusFilter === "REGISTERED" && hasPendingRequests && (
                <div className="flex items-center gap-2 pl-2 shrink-0 w-full md:w-auto">
                  <Checkbox 
                    id="show-requests-only"
                    checked={showRequestsOnly} 
                    onCheckedChange={(c) => { setShowRequestsOnly(!!c); setCurrentPage(1); }} 
                    className="border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white h-5 w-5 rounded shadow-sm shadow-blue-500/20 shrink-0"
                  />
                  <label htmlFor="show-requests-only" className="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer flex items-center gap-2 whitespace-normal md:whitespace-nowrap">
                    Show Only Requested Students
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                  </label>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 self-end md:self-auto w-full md:w-auto">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden md:inline">Show</span>
              <Select value={itemsPerPage.toString()} onValueChange={(v) => { setItemsPerPage(Number(v)); setCurrentPage(1); }}>
                <SelectTrigger className="w-24 h-14 bg-slate-50 dark:bg-slate-800/40 border-none rounded-2xl font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl">
                  <SelectItem value="10" className="rounded-lg font-bold">10</SelectItem>
                  <SelectItem value="25" className="rounded-lg font-bold">25</SelectItem>
                  <SelectItem value="50" className="rounded-lg font-bold">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {paginatedStudents.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 mb-4">
                <Search className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Students Found</h3>
              <p className="text-sm font-medium text-slate-500 mt-1">Try adjusting your search criteria or changing tabs.</p>
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
                  <div key={student.id} className={cn("flex flex-col lg:flex-row items-start lg:items-center justify-between p-6 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all gap-6 group border-l-4", borderColor)}>
                    <div className="flex items-center gap-4">
                      <Checkbox 
                        checked={selectedStudentIds.includes(student.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedStudentIds(prev => [...prev, student.id]);
                          } else {
                            setSelectedStudentIds(prev => prev.filter(id => id !== student.id));
                          }
                        }}
                        className="rounded-md w-5 h-5 border-slate-300 dark:border-slate-600 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground mr-2 shrink-0"
                      />
                      <Avatar className="h-14 w-14 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shrink-0 shadow-sm">
                        <AvatarImage src={student.photoUrl || student.admissionApp?.photoUrl || undefined} className="object-cover" />
                        <AvatarFallback className="bg-primary/5 text-primary font-bold rounded-2xl">
                          {student.fullName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex flex-col items-start gap-1">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-sm text-slate-900 dark:text-white">{student.fullName}</p>
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
                                    <Printer className="w-4 h-4 text-emerald-500 hover:text-red-500 transition-colors" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Printed. Click to unmark.</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                            <Badge variant="outline" className={cn(
                              "text-[10px] font-bold px-1.5 py-0 rounded uppercase tracking-widest border-none",
                              student.status === "REGISTERED" ? "bg-green-500/10 text-green-600" :
                                student.status === "UNREGISTERED" ? "bg-amber-500/10 text-amber-600" :
                                  "bg-purple-500/10 text-purple-600"
                            )}>
                              {student.status.replace("_", " ")}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            {student.phone && (
                              <p className="text-[10px] font-medium text-slate-500 flex items-center gap-1.5">
                                <Phone className="h-3 w-3 text-slate-400 shrink-0" /> {student.phone}
                              </p>
                            )}
                            {student.email && (
                              <Tooltip>
                                <TooltipTrigger className="cursor-help text-left p-0 border-none bg-transparent">
                                  <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1.5 max-w-[120px] sm:max-w-[180px]">
                                    <Mail className="h-3 w-3 shrink-0" /> <span className="truncate">{student.email}</span>
                                  </span>
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

                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6 w-full lg:w-auto">
                      <div className="flex flex-wrap md:flex-nowrap gap-4 md:gap-8 w-full md:w-auto bg-slate-50 dark:bg-slate-800/40 lg:bg-transparent p-4 lg:p-0 rounded-xl">
                        <div className="text-left md:text-right w-1/2 md:w-auto">
                          <p className="font-bold font-mono text-sm text-indigo-600 dark:text-indigo-400">{student.enrollmentNo}</p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Enrollment No</p>
                        </div>
                        {(student.status === "REGISTERED" || student.status === "PASS_OUT") && student.registrations && student.registrations.length > 0 && (
                          <div className="text-left md:text-right w-1/2 md:w-auto">
                            <p className="font-bold font-mono text-sm text-emerald-600 dark:text-emerald-400">{student.registrations[student.registrations.length - 1].registrationNo}</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Reg No</p>
                          </div>
                        )}
                        <div className="text-left md:text-right w-1/2 md:w-auto md:w-32 min-w-0">
                          <Tooltip>
                            <TooltipTrigger className="cursor-help text-left p-0 border-none bg-transparent">
                              <span className="font-medium text-sm text-slate-900 dark:text-white flex items-center gap-1 justify-start md:justify-end">
                                <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                <span className="truncate">{student.workspace?.name || 'Unknown'}</span>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{student.workspace?.name || 'Unknown'}</p>
                            </TooltipContent>
                          </Tooltip>
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Franchise</p>
                        </div>
                        <div className="text-left md:text-right w-1/2 md:w-auto">
                          <Tooltip>
                            <TooltipTrigger className="cursor-help text-left p-0 border-none bg-transparent">
                              <span className="font-medium text-sm text-slate-900 dark:text-white flex items-start md:items-center gap-1 justify-start md:justify-end">
                                <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5 md:mt-0" />
                                <span className="text-left md:text-right break-words">{student.course?.globalCourse?.short || student.course?.code || student.course?.title || 'No Course'}</span>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{student.course?.title || 'No Course'}</p>
                            </TooltipContent>
                          </Tooltip>
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Course</p>
                        </div>
                      </div>

                      {/* Static Style Actions */}
                      <div className="flex items-center gap-0 w-full lg:w-auto mt-2 lg:mt-0 bg-slate-50 dark:bg-slate-800/40 lg:bg-transparent rounded-xl p-1 lg:p-0">
                        {student.status === "UNREGISTERED" && (
                          <Button
                            variant="ghost"
                            onClick={() => handleRegisterStudent(student)}
                            className="h-10 rounded-xl text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors font-semibold px-4 mr-1"
                            title="Register Student"
                          >
                            <UserCheck className="h-4 w-4 mr-2" /> Register
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 rounded-xl text-slate-500 hover:text-primary hover:bg-primary/5 transition-colors"
                          title="View Details"
                          onClick={() => {
                            setSelectedStudentForView(student);
                            setViewOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(student)}
                          className="h-10 w-10 rounded-xl text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
                          title="Edit Student"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(student)}
                          className="h-10 w-10 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                          title="Delete Student"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>

                        {(student.status === "REGISTERED" || student.status === "PASS_OUT") && (
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              className="relative inline-flex items-center justify-center whitespace-nowrap h-10 w-10 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/20"
                              title="Documents"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              {student.documentIssueRequestedAt && (() => {
                                const certStatus = getDocumentStatus(student, null, configData as any);
                                return !(certStatus.finalCertApproved || certStatus.finalCertIssued || certStatus.isCertAuto);
                              })() && (
                                <span className="absolute top-2 right-2 flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>
                              )}
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="top" align="end" className="w-56 rounded-xl font-medium p-1">
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedStudentForDocs(student);
                                  setDocsModalOpen(true);
                                }} 
                                className="cursor-pointer gap-2 py-2.5"
                              >
                                <FileText className="h-4 w-4 text-slate-400" /> Manage Documents
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => setManageResultStudent(student)} 
                                className="cursor-pointer gap-2 py-2.5"
                              >
                                <GraduationCap className="h-4 w-4 text-slate-400" /> Manage Result
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
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden rounded-[2.5rem] p-0 border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          {selectedStudentForView && (
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
              <div className="space-y-6">
                {/* Header Profile Section */}
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <Avatar className="h-24 w-24 border-4 border-slate-50 dark:border-slate-800 shadow-xl">
                    <AvatarImage src={selectedStudentForView.photoUrl || selectedStudentForView.admissionApp?.photoUrl} className="object-cover" />
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                      {selectedStudentForView.fullName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-col md:flex-row md:items-center gap-3">
                      <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                        {selectedStudentForView.fullName}
                      </h2>
                      <Badge className={cn(
                        "rounded-full px-3 py-1 text-[10px] font-black tracking-widest uppercase",
                        selectedStudentForView.status === "REGISTERED" ? "bg-emerald-500 hover:bg-emerald-600" :
                        selectedStudentForView.status === "PASS_OUT" ? "bg-amber-500 hover:bg-amber-600" :
                        "bg-slate-400 hover:bg-slate-500"
                      )}>
                        {selectedStudentForView.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">ENR:</span>
                        <Badge variant="outline" className="text-xs font-bold font-mono text-primary border-primary/20 bg-primary/5">{selectedStudentForView.enrollmentNo}</Badge>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">PWD:</span>
                        <Badge variant="outline" className="text-xs font-bold font-mono text-amber-600 border-amber-600/20 bg-amber-600/5">{selectedStudentForView.loginPassword || "Not Set"}</Badge>
                      </div>
                      <div className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Joined {new Date(selectedStudentForView.admissionDate).toLocaleDateString()}</div>
                      {selectedStudentForView.phone && <div className="flex items-center gap-1.5"><Phone className="h-4 w-4" /> {selectedStudentForView.phone}</div>}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 w-full md:w-auto mt-4 md:mt-0">
                    <Button 
                      onClick={() => { setViewOpen(false); handleEditClick(selectedStudentForView); }} 
                      className="w-full md:w-[160px] rounded-xl shadow-sm" 
                      variant="outline"
                    >
                      <Pencil className="h-4 w-4 mr-2" /> Edit Profile
                    </Button>
                    <Button 
                      onClick={() => window.open(`/app/${selectedStudentForView.workspace?.subdomain}/student/dashboard`, '_blank')} 
                      className="w-full md:w-[160px] rounded-xl shadow-md shadow-primary/20 bg-primary text-primary-foreground hover:scale-[1.02] transition-transform"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" /> Dashboard
                    </Button>
                  </div>
                </div>

                {/* Grid Layout for details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Academic Stats */}
                  <Card className="rounded-[2rem] border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden flex flex-col">
                    <CardHeader className="bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800 pb-4">
                      <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-primary" /> Academic Profile
                      </h3>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4 flex-1">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Course</p>
                        <p className="font-semibold text-slate-900 dark:text-white">{selectedStudentForView.course?.title || "Not Assigned"}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Batch</p>
                          <p className="font-semibold text-slate-900 dark:text-white">{selectedStudentForView.batch?.name || "Not Assigned"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Course Duration</p>
                          <p className="font-semibold text-slate-900 dark:text-white">{selectedStudentForView.course?.duration || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Remaining Months</p>
                          <p className="font-semibold text-slate-900 dark:text-white">
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
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fees Remaining</p>
                          <p className="font-semibold text-amber-600 dark:text-amber-500">N/A (Pending API)</p>
                        </div>
                      </div>
                      {(() => {
                        let qual: any = null;
                        try {
                          qual = typeof selectedStudentForView.qualification === 'string' ? JSON.parse(selectedStudentForView.qualification) : selectedStudentForView.qualification;
                        } catch(e){}
                        if(qual && qual.name) {
                          return (
                            <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Highest Qualification</p>
                              <p className="font-semibold text-slate-900 dark:text-white">{qual.name} ({qual.year}) - {qual.percentage}%</p>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </CardContent>
                  </Card>

                  {/* Documents & Approvals */}
                  <Card className="rounded-[2rem] border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden flex flex-col">
                    <CardHeader className="bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800 pb-4">
                      <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-emerald-500" /> Documents Status
                      </h3>
                    </CardHeader>
                    <CardContent className="p-6 flex-1">
                      <div className="grid grid-cols-2 gap-4 h-full">
                        {[
                          { label: "ID Card", val: selectedStudentForView.registrationCardApproved },
                          { label: "Admit Card", val: selectedStudentForView.admitCardApproved },
                          { label: "Marksheet", val: selectedStudentForView.marksheetApproved },
                          { label: "Certificate", val: selectedStudentForView.certificateApproved },
                        ].map((doc, idx) => (
                          <div key={idx} className="flex flex-col p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 justify-center">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{doc.label}</span>
                            <div className="flex items-center gap-1.5 mt-1.5">
                              {doc.val ? (
                                <><CheckCircle className="h-4 w-4 text-emerald-500" /><span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Issued</span></>
                              ) : (
                                <><div className="h-2 w-2 rounded-full bg-amber-400 ml-1 mr-0.5" /><span className="text-sm font-bold text-amber-600 dark:text-amber-400">Pending</span></>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Personal Details */}
                  <Card className="rounded-[2rem] border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 md:col-span-2 overflow-hidden">
                    <CardHeader className="bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800 pb-4">
                      <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <User className="h-5 w-5 text-blue-500" /> Personal Details
                      </h3>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date of Birth</p>
                          <p className="font-semibold text-slate-900 dark:text-white">{selectedStudentForView.dob ? new Date(selectedStudentForView.dob).toLocaleDateString('en-GB') : "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Gender</p>
                          <p className="font-semibold text-slate-900 dark:text-white capitalize">{selectedStudentForView.gender || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Blood Group</p>
                          <p className="font-semibold text-slate-900 dark:text-white">{selectedStudentForView.bloodGroup || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Religion / Caste</p>
                          <p className="font-semibold text-slate-900 dark:text-white capitalize">{(selectedStudentForView.religion || "N/A")} / {(selectedStudentForView.caste || "N/A")}</p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Father's Name</p>
                          <p className="font-semibold text-slate-900 dark:text-white">{selectedStudentForView.fatherName || "N/A"}</p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mother's Name</p>
                          <p className="font-semibold text-slate-900 dark:text-white">{selectedStudentForView.motherName || "N/A"}</p>
                        </div>
                        
                        <div className="md:col-span-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Contact Details</p>
                                <div className="space-y-2">
                                  {selectedStudentForView.email && (
                                      <div className="flex items-center gap-2 text-sm">
                                          <Mail className="h-4 w-4 text-slate-400" />
                                          <span className="font-medium text-slate-700 dark:text-slate-300">{selectedStudentForView.email}</span>
                                      </div>
                                  )}
                                  {selectedStudentForView.whatsapp && (
                                      <div className="flex items-center gap-2 text-sm">
                                          <Phone className="h-4 w-4 text-emerald-500" />
                                          <span className="font-medium text-slate-700 dark:text-slate-300">{selectedStudentForView.whatsapp} (WhatsApp)</span>
                                      </div>
                                  )}
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Full Address</p>
                                <p className="font-semibold text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
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
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden rounded-[2.5rem] p-0 border-2 border-slate-100 dark:border-slate-800">
          <div className="flex-1 overflow-y-auto p-8 sm:p-10 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-bold tracking-tight">Edit Student Profile</DialogTitle>
              <p className="text-sm text-slate-500 mt-1">Modify the student's information and save changes across the platform.</p>
            </DialogHeader>

            <form onSubmit={handleUpdate}>
              <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* 01 Personal Information */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b pb-2">
                      <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs">01</span>
                      Personal Information
                    </h3>
                    <div className="grid gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400">Full Name *</label>
                        <Input required value={editFormData.fullName} onChange={e => setEditFormData({ ...editFormData, fullName: e.target.value })} className="h-11 rounded-xl" />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-400">Father's Name</label>
                          <Input value={editFormData.fatherName} onChange={e => setEditFormData({ ...editFormData, fatherName: e.target.value })} className="h-11 rounded-xl" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-400">Mother's Name</label>
                          <Input value={editFormData.motherName} onChange={e => setEditFormData({ ...editFormData, motherName: e.target.value })} className="h-11 rounded-xl" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-400">Enrollment No</label>
                          <Input required value={editFormData.enrollmentNo} onChange={e => setEditFormData({ ...editFormData, enrollmentNo: e.target.value })} className="h-11 rounded-xl" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-400">Login Password</label>
                          <Input type="text" value={editFormData.loginPassword} onChange={e => setEditFormData({ ...editFormData, loginPassword: e.target.value })} placeholder="Leave blank to keep current" className="h-11 rounded-xl" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-400">Marksheet No</label>
                          <Input value={editFormData.marksheetNo} onChange={e => setEditFormData({ ...editFormData, marksheetNo: e.target.value })} placeholder="e.g. MS0001" className="h-11 rounded-xl" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-400">Certificate No</label>
                          <Input value={editFormData.certificateNo} onChange={e => setEditFormData({ ...editFormData, certificateNo: e.target.value })} placeholder="e.g. CR0001" className="h-11 rounded-xl" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-400">Date of Birth</label>
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
                            className="h-11 rounded-xl"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-400">Gender</label>
                          <select value={editFormData.gender} onChange={e => setEditFormData({ ...editFormData, gender: e.target.value })} className="flex h-11 w-full rounded-xl border-2 border-slate-100 bg-background px-3 py-2 text-sm focus:border-primary outline-none">
                            <option value="">Select</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-400">Blood Group</label>
                          <select value={editFormData.bloodGroup} onChange={e => setEditFormData({ ...editFormData, bloodGroup: e.target.value })} className="flex h-11 w-full rounded-xl border-2 border-slate-100 bg-background px-3 py-2 text-sm focus:border-primary outline-none">
                            <option value="">Select</option>
                            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-400">Religion</label>
                          <Input value={editFormData.religion} onChange={e => setEditFormData({ ...editFormData, religion: e.target.value })} className="h-11 rounded-xl" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-400">Caste</label>
                          <select value={editFormData.caste} onChange={e => setEditFormData({ ...editFormData, caste: e.target.value })} className="flex h-11 w-full rounded-xl border-2 border-slate-100 bg-background px-3 py-2 text-sm focus:border-primary outline-none">
                            <option value="">Select</option>
                            {["GEN", "SC", "ST", "OBC", "Others"].map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 02 Contact & Address */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b pb-2">
                      <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs">02</span>
                      Contact & Address
                    </h3>
                    <div className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-400">Mobile Number *</label>
                          <Input value={editFormData.phone} onChange={e => setEditFormData({ ...editFormData, phone: e.target.value })} className="h-11 rounded-xl" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-400">WhatsApp Number</label>
                          <Input value={editFormData.whatsapp} onChange={e => setEditFormData({ ...editFormData, whatsapp: e.target.value })} className="h-11 rounded-xl" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400">Email Address</label>
                        <Input type="email" value={editFormData.email} onChange={e => setEditFormData({ ...editFormData, email: e.target.value })} className="h-11 rounded-xl" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400">Guardian Phone</label>
                        <Input value={editFormData.guardianPhone} onChange={e => setEditFormData({ ...editFormData, guardianPhone: e.target.value })} className="h-11 rounded-xl" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-400">Village/Street</label>
                          <Input value={editFormData.addressVill} onChange={e => setEditFormData({ ...editFormData, addressVill: e.target.value })} className="h-11 rounded-xl" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-400">Post Office</label>
                          <Input value={editFormData.addressPO} onChange={e => setEditFormData({ ...editFormData, addressPO: e.target.value })} className="h-11 rounded-xl" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-400">Police Station</label>
                          <Input value={editFormData.addressPS} onChange={e => setEditFormData({ ...editFormData, addressPS: e.target.value })} className="h-11 rounded-xl" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-400">District</label>
                          <Input value={editFormData.addressDist} onChange={e => setEditFormData({ ...editFormData, addressDist: e.target.value })} className="h-11 rounded-xl" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-400">State</label>
                          <Input value={editFormData.addressState} onChange={e => setEditFormData({ ...editFormData, addressState: e.target.value })} className="h-11 rounded-xl" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-400">PIN Code</label>
                          <Input value={editFormData.addressPin} onChange={e => setEditFormData({ ...editFormData, addressPin: e.target.value })} className="h-11 rounded-xl" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* 03 Academic Details */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b pb-2">
                      <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs">03</span>
                      Academic Details
                    </h3>
                    <div className="grid gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400">Qualification Name</label>
                        <Input value={editFormData.qualName} onChange={e => setEditFormData({ ...editFormData, qualName: e.target.value })} placeholder="e.g. 10th, 12th, B.A." className="h-11 rounded-xl" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400">Board/University</label>
                        <Input value={editFormData.qualBoard} onChange={e => setEditFormData({ ...editFormData, qualBoard: e.target.value })} className="h-11 rounded-xl" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-400">Year of Passing</label>
                          <Input value={editFormData.qualYear} onChange={e => setEditFormData({ ...editFormData, qualYear: e.target.value })} placeholder="YYYY" maxLength={4} className="h-11 rounded-xl" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-400">Percentage (%)</label>
                          <Input value={editFormData.qualPercent} onChange={e => setEditFormData({ ...editFormData, qualPercent: e.target.value })} className="h-11 rounded-xl" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 04 Course Details */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b pb-2">
                      <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs">04</span>
                      Course Details
                    </h3>
                    <div className="grid gap-4">
                      <p className="text-xs text-slate-500">Super Admins cannot reassign courses or batches directly across franchises to prevent conflicts. Please have the franchise admin perform this action, or update directly from the DB.</p>
                      <div className="space-y-1.5 opacity-50 pointer-events-none">
                        <label className="text-xs font-bold text-slate-400">Course</label>
                        <Input value={selectedStudent?.course?.title || "N/A"} readOnly className="h-11 rounded-xl" />
                      </div>
                      <div className="space-y-1.5 opacity-50 pointer-events-none">
                        <label className="text-xs font-bold text-slate-400">Batch</label>
                        <Input value={selectedStudent?.batch?.name || "N/A"} readOnly className="h-11 rounded-xl" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 05 Documents */}
              <div className="space-y-6 pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b pb-2">
                  <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs">05</span>
                  Documents
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400">Photo</label>
                    <ImageUpload value={editFormData.photoUrl} onChange={(url) => setEditFormData({ ...editFormData, photoUrl: url })} maxSizeK={100} folder={`RGYCSP/Students`} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400">Signature</label>
                    <ImageUpload value={editFormData.signatureUrl} onChange={(url) => setEditFormData({ ...editFormData, signatureUrl: url })} maxSizeK={100} folder={`RGYCSP/Students`} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400">ID Proof</label>
                    <ImageUpload value={editFormData.idProofUrl} onChange={(url) => setEditFormData({ ...editFormData, idProofUrl: url })} maxSizeK={1024} folder={`RGYCSP/Students`} />
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 sticky bottom-0 bg-white dark:bg-slate-900 z-10 -mx-2 px-2 pb-2">
                <Button type="button" variant="outline" onClick={() => setEditOpen(false)} className="rounded-xl font-bold h-11 px-8" disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="rounded-xl font-bold h-11 px-8 shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all">
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
        <DialogContent className="max-w-3xl w-[95vw] h-[90vh] flex flex-col overflow-hidden rounded-[2.5rem] p-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-2 border-slate-100 dark:border-slate-800 shadow-2xl">
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
            <DialogHeader className="mb-6">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <DialogTitle className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Manage Documents
            </DialogTitle>
            <p className="text-base text-slate-500 font-medium mt-2">
              Issue and manage documents for <strong className="text-slate-900 dark:text-white font-black">{selectedStudentForDocs?.fullName}</strong>.
            </p>
          </DialogHeader>

          <div className="flex flex-col gap-6">
            {(() => {
              const certStatus = getDocumentStatus(selectedStudentForDocs, null, initialConfig);
              return (
                <>
                  {/* Top: Certificate */}
                  <div className="flex flex-col p-6 bg-white dark:bg-slate-900 border-2 border-amber-200/50 dark:border-amber-800/50 rounded-3xl shadow-sm hover:shadow-md transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-bl-[4rem] -z-10"></div>
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                      <GraduationCap className="w-6 h-6 text-amber-600 dark:text-amber-500" />
                    </div>
                    <h3 className="font-black text-slate-900 dark:text-white text-xl tracking-tight">Final Certificate</h3>
                  </div>
                  <p className="text-sm font-medium text-slate-500 leading-snug">Official completion certificate. This is the final milestone document.</p>
                  {selectedStudentForDocs?.certificateNo && (
                    <div className="mt-2 text-xs font-mono font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-md inline-block border border-amber-200 dark:border-amber-800">
                      Cert No: {selectedStudentForDocs.certificateNo}
                    </div>
                  )}
                </div>
                {certStatus.isCertAuto ? (
                  <Badge className="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 border-0 rounded-xl px-4 py-1.5 font-bold shadow-sm">Auto Issued</Badge>
                ) : selectedStudentForDocs?.certificateIssuedToStudent ? (
                  <Badge className="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 border-0 rounded-xl px-4 py-1.5 font-bold shadow-sm">Issued</Badge>
                ) : selectedStudentForDocs?.certificateApproved ? (
                  <Badge className="bg-blue-50 text-blue-600 dark:bg-blue-500/10 border-0 rounded-xl px-4 py-1.5 font-bold shadow-sm">Approved</Badge>
                ) : (
                  <Badge className="bg-amber-50 text-amber-600 dark:bg-amber-500/10 border-0 rounded-xl px-4 py-1.5 font-bold shadow-sm">Pending</Badge>
                )}
              </div>
              
              <div className="flex items-center justify-between pt-5 mt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Super Admin Approval</span>
                  {!certStatus.isCertAuto ? (
                    <Switch 
                      checked={!!selectedStudentForDocs?.certificateApproved} 
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
                
                <DocumentRenderer 
                  ref={el => { docRefs.current['CERTIFICATE'] = el; }} 
                  type="CERTIFICATE" 
                  student={selectedStudentForDocs}
                />

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="rounded-xl font-bold h-10 px-4" onClick={() => docRefs.current['CERTIFICATE']?.preview()}><Eye className="w-4 h-4 mr-2" /> Preview</Button>
                  <Button size="sm" className="rounded-xl font-bold h-10 px-4 shadow-md shadow-primary/20" onClick={() => docRefs.current['CERTIFICATE']?.downloadPDF()}><Download className="w-4 h-4 mr-2" /> Download</Button>
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
                <div className="flex flex-col p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 dark:text-white text-lg tracking-tight">Academic Marksheets</h3>
                      <p className="text-sm font-medium text-slate-500 leading-snug">Semester-wise detailed marksheets. (Total {totalSemesters})</p>
                      {selectedStudentForDocs?.marksheetNo && (
                        <div className="mt-2 text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-md inline-block border border-slate-200 dark:border-slate-700">
                          Marksheet No: {selectedStudentForDocs.marksheetNo}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
                    <Table>
                      <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                        <TableRow>
                          <TableHead className="font-bold">Semester</TableHead>
                          <TableHead className="font-bold">Status</TableHead>
                          <TableHead className="font-bold text-center">SA Approval</TableHead>
                          <TableHead className="font-bold text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {semestersData.map((sem) => {
                          const uniqueKey = `MARKSHEET_${sem.semesterNumber}`;
                          return (
                            <TableRow key={uniqueKey} className="hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/50">
                              <TableCell className="font-bold py-3 text-slate-700 dark:text-slate-300">Semester {sem.semesterNumber}</TableCell>
                              <TableCell className="py-3">
                                {sem.isAuto ? (
                                  <Badge className="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 border-0 rounded-lg font-bold">Auto Issued</Badge>
                                ) : sem.issued ? (
                                  <Badge className="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 border-0 rounded-lg font-bold">Issued</Badge>
                                ) : sem.approved ? (
                                  <Badge className="bg-blue-50 text-blue-600 dark:bg-blue-500/10 border-0 rounded-lg font-bold">Approved</Badge>
                                ) : (
                                  <Badge className="bg-amber-50 text-amber-600 dark:bg-amber-500/10 border-0 rounded-lg font-bold">Pending</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-center py-3">
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
                              <TableCell className="text-right py-3">
                                <div className="flex items-center justify-end gap-1">
                                  <DocumentRenderer ref={el => { docRefs.current[uniqueKey] = el; }} type={`MARKSHEET_SEM_${sem.semesterNumber}`} student={selectedStudentForDocs} semesterNumber={sem.semesterNumber} />
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600" onClick={() => docRefs.current[uniqueKey]?.preview()}><Eye className="w-4 h-4" /></Button>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-emerald-600" onClick={() => docRefs.current[uniqueKey]?.downloadPDF()}><Download className="w-4 h-4" /></Button>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: 'STUDENT_ID', label: 'Student ID Card', desc: 'Identity verification.', icon: <User className="w-5 h-5 text-blue-500 dark:text-blue-400" /> },
                { id: 'ADMIT_CARD', label: 'Admit Card', desc: 'Required for examinations.', icon: <Calendar className="w-5 h-5 text-indigo-500 dark:text-indigo-400" /> }
                ].map((doc) => (
                  <div key={doc.id} className="flex flex-col p-5 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl gap-3 hover:border-blue-200 dark:hover:border-blue-900/50 hover:shadow-md transition-all group">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm">
                        {doc.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-base">{doc.label}</h3>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{doc.desc}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 mt-1 border-t border-slate-200 dark:border-slate-800/60">
                    <div className="flex items-center gap-2 bg-slate-200/50 dark:bg-slate-800 px-2 py-1 rounded-md">
                       <ShieldCheck className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                       <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Delegated to Franchise</span>
                    </div>
                    
                    <DocumentRenderer ref={el => { docRefs.current[doc.id] = el; }} type={doc.id as any} student={selectedStudentForDocs} />
                    
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 dark:hover:bg-slate-800" onClick={() => docRefs.current[doc.id]?.preview()}><Eye className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 dark:hover:bg-slate-800" onClick={() => docRefs.current[doc.id]?.downloadPDF()}><Download className="w-4 h-4" /></Button>
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
      </div>
    </TooltipProvider>
  );
}
