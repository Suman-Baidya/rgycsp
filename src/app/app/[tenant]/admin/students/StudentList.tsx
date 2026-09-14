"use client";

import React, { useState, useMemo } from "react";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  UserPlus, 
  Phone, 
  Mail, 
  GraduationCap, 
  FileText, 
  Eye, 
  Pencil, 
  Database, 
  Download, 
  Loader2, 
  CheckCircle, 
  Calendar, 
  User, 
  Award, 
  ShieldCheck, 
  Clock, 
  Rocket, 
  KeyRound, 
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  Upload,
  Building2,
  UserX
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createStudent, updateStudent, adminUpdateStudentPassword } from "@/app/actions/students";
import { importStudentsCSV } from "@/app/actions/students-import";
import { registerStudent, markStudentAsPassOut, toggleDocumentApproval } from "@/app/actions/student-registration";
import { toast } from "sonner";
import { useRouter, usePathname, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { setImpersonation } from "@/app/actions/impersonate";
import Link from "next/link";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Switch } from "@/components/ui/switch";
import { DocumentRenderer, DocumentRendererRef } from "@/components/documents/DocumentRenderer";
import { issueDocumentToStudent, requestDocumentIssue } from "@/app/actions/student-documents";
import { getRegistrationConfig } from "@/app/actions/registration-config";
import { getDocumentStatus } from "@/lib/document-utils";
import { ManageResultModal } from "@/components/students/ManageResultModal";

export default function StudentList({ 
  workspaceId, 
  initialStudents,
  batches,
  courses,
  status,
  hasDocumentAuthority
}: { 
  workspaceId: string; 
  initialStudents: any[];
  batches: any[];
  courses: any[];
  status?: string;
  hasDocumentAuthority?: boolean;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [viewingStudent, setViewingStudent] = useState<any>(null);
  const [selectedBatchId, setSelectedBatchId] = useState<string>("all");
  
  const { update } = useSession();
  
  const handleImpersonate = async (studentId: string) => {
    const loadingId = toast.loading("Connecting to student dashboard...");
    try {
      const result = await setImpersonation(studentId);
      if (result.success) {
        toast.success("Connected!", { id: loadingId });
        window.open(`${workspaceBase}/student/dashboard`, '_blank');
      } else {
        toast.error(result.error || "Failed to impersonate", { id: loadingId });
      }
    } catch (e) {
      toast.error("An error occurred", { id: loadingId });
    }
  };
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [manageResultStudent, setManageResultStudent] = useState<any>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const tenant = (params?.tenant as string) || "";
  const isSubdirectoryMode = pathname.startsWith('/app/');
  const workspaceBase = isSubdirectoryMode ? `/app/${tenant}` : '';

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
    admissionDate: "",
  });

  const [docsModalOpen, setDocsModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const docRefs = React.useRef<Record<string, DocumentRendererRef | null>>({});
  const [globalConfig, setGlobalConfig] = useState<any>(null);

  React.useEffect(() => {
    async function loadConfig() {
      const config = await getRegistrationConfig();
      setGlobalConfig(config);
    }
    loadConfig();
  }, []);

  const [isRequestingIssue, setIsRequestingIssue] = useState(false);

  const handleRequestIssue = async (studentId: string) => {
    if (!studentId) return;
    setIsRequestingIssue(true);
    try {
      const res = await requestDocumentIssue(studentId);
      if (res.success) {
        toast.success("Document issue requested successfully!");
        // Update local state to reflect the request
        router.refresh();
        if (selectedStudent && selectedStudent.id === studentId) {
          setSelectedStudent({ ...selectedStudent, documentIssueRequestedAt: new Date() });
        }
      } else {
        toast.error(res.error || "Failed to request document issue.");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred.");
    } finally {
      setIsRequestingIssue(false);
    }
  };

  const handleIssueToStudent = async (studentId: string, docType: "MARKSHEET" | "CERTIFICATE" | "STUDENT_ID" | "ADMIT_CARD", status: boolean, semesterNumber?: number) => {
    const res = await issueDocumentToStudent(studentId, docType, status, semesterNumber);
    if (res.success) {
      toast.success(`${docType.replace('_', ' ')} ${status ? 'Issued' : 'Revoked'} successfully`);
      if (selectedStudent) {
        if (semesterNumber && docType === "MARKSHEET") {
          const updatedSemesters = [...(selectedStudent.semesters || [])];
          const semIndex = updatedSemesters.findIndex(s => s.semesterNumber === semesterNumber);
          if (semIndex >= 0) {
            updatedSemesters[semIndex].marksheetIssuedToStudent = status;
          } else {
            updatedSemesters.push({ semesterNumber, marksheetIssuedToStudent: status });
          }
          setSelectedStudent({ ...selectedStudent, semesters: updatedSemesters });
        } else {
          setSelectedStudent({
            ...selectedStudent,
            ...(docType === "CERTIFICATE" && { certificateIssuedToStudent: status }),
            ...(docType === "STUDENT_ID" && { registrationCardIssuedToStudent: status }),
            ...(docType === "ADMIT_CARD" && { admitCardIssuedToStudent: status }),
          });
        }
      }
      router.refresh();
    } else {
      toast.error(res.error || "Failed to update document status");
    }
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFile(file);
  };

  const handleImportCSVSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) {
      toast.error("Please select a CSV file.");
      return;
    }

    setImporting(true);
    const reader = new FileReader();
    reader.readAsText(csvFile);
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/);
        if (lines.length < 2) {
          toast.error("CSV file is empty or has no header row.");
          setImporting(false);
          return;
        }

        // Parse headers
        const headers = lines[0].split(",").map(h => h.trim().replace(/^["']|["']$/g, ""));
        const parsedRecords: any[] = [];

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          // Simple CSV line splitter (handling basic quotes)
          const cols: string[] = [];
          let current = "";
          let inQuotes = false;
          for (let c = 0; c < line.length; c++) {
            const char = line[c];
            if (char === '"' || char === "'") {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              cols.push(current.trim());
              current = "";
            } else {
              current += char;
            }
          }
          cols.push(current.trim());

          const record: any = {};
          headers.forEach((header, index) => {
            const val = cols[index] ? cols[index].replace(/^["']|["']$/g, "") : "";
            record[header] = val;
          });

          if (record.fullName || record.FullName) {
            parsedRecords.push(record);
          }
        }

        if (parsedRecords.length === 0) {
          toast.error("No valid student records found (Full Name is required).");
          setImporting(false);
          return;
        }

        const res = await importStudentsCSV(workspaceId, parsedRecords);
        if (res.success) {
          toast.success(`Imported ${res.importedCount} students successfully!`);
          if (res.errors) {
            console.warn("Import warnings:", res.errors);
            toast.warning(`Some rows failed to import. Check console logs.`);
          }
          setImportOpen(false);
          setCsvFile(null);
          router.refresh();
        } else {
          toast.error(res.error || "Failed to import CSV.");
        }
      } catch (err) {
        toast.error("Error reading or parsing CSV file.");
      } finally {
        setImporting(false);
      }
    };
  };

  const handleEditClick = (student: any) => {
    setSelectedStudent(student);
    let qual: any = null;
    try {
      if (typeof student.qualification === 'string') {
        qual = JSON.parse(student.qualification);
      } else if (student.qualification) {
        qual = student.qualification;
      }
    } catch (e) { }

    let addrObj: any = {};
    try {
      if (typeof student.address === 'string') {
        if (student.address.trim().startsWith('{')) {
          addrObj = JSON.parse(student.address);
        } else {
          addrObj = { vill: student.address };
        }
      } else if (student.address) {
        addrObj = student.address;
      } else if (student.admissionApp?.address) {
        if (typeof student.admissionApp.address === 'string') {
          addrObj = JSON.parse(student.admissionApp.address);
        } else {
          addrObj = student.admissionApp.address;
        }
      }
    } catch (e) { }

    setEditFormData({
      fullName: student.fullName,
      enrollmentNo: student.enrollmentNo,
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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setIsSubmitting(true);
    
    let parsedDob = editFormData.dob;
    if (parsedDob && parsedDob.includes('/')) {
      const [dd, mm, yyyy] = parsedDob.split('/');
      if (dd && mm && yyyy) {
        parsedDob = `${yyyy}-${mm}-${dd}`;
      }
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
    const res = await adminUpdateStudentPassword(selectedStudent.id, newPassword);
    setIsSubmitting(false);
    
    if (res.success) {
      toast.success("Student password updated successfully!");
      setPasswordModalOpen(false);
      setNewPassword("");
      setConfirmPassword("");
      // Update selected student local state so UI reflects it
      setSelectedStudent({ ...selectedStudent, loginPassword: newPassword });
      router.refresh();
    } else {
      toast.error(res.error || "Failed to update password");
    }
  };

  const [isActioning, setIsActioning] = useState<string | null>(null);
  const [studentToRegister, setStudentToRegister] = useState<any>(null);
  const [studentToPassout, setStudentToPassout] = useState<any>(null);

  const handleRegisterClick = (student: any) => {
    setStudentToRegister(student);
  };

  const confirmRegister = async () => {
    if (!studentToRegister) return;
    setIsActioning(studentToRegister.id);
    const result = await registerStudent(studentToRegister.id, typeof tenant === 'string' ? tenant : '');
    setIsActioning(null);
    setStudentToRegister(null);

    if (result.success) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.error || "Failed to register student");
    }
  };

  const handleDocumentApproval = async (student: any, docType: 'admitCard' | 'registrationCard' | 'marksheet' | 'certificate') => {
    setIsActioning(`${student.id}-${docType}`);
    const result = await toggleDocumentApproval(student.id, docType, typeof tenant === 'string' ? tenant : '');
    setIsActioning(null);

    if (result.success) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.error || "Failed to update document approval");
    }
  };

  const handlePassOutClick = (student: any) => {
    setStudentToPassout(student);
  };

  const confirmPassOut = async () => {
    if (!studentToPassout) return;
    setIsActioning(studentToPassout.id);
    const result = await markStudentAsPassOut(studentToPassout.id, typeof tenant === 'string' ? tenant : '');
    setIsActioning(null);
    setStudentToPassout(null);

    if (result.success) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.error || "Failed to mark student as pass out");
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    fullName: "",
    enrollmentNo: "", // Initialize empty
    phone: "",
    email: "",
    whatsapp: "",
    dob: "",
    gender: "",
    bloodGroup: "",
    religion: "",
    caste: "",
    address: "",
    fatherName: "",
    motherName: "",
    guardianPhone: "",
    batchId: "",
    courseId: "",
    photoUrl: "",
    signatureUrl: "",
    idProofUrl: "",
  });

  const filteredStudents = useMemo(() => {
    return initialStudents.filter((s: any) => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch = !term ||
                            s.fullName?.toLowerCase().includes(term) ||
                            s.enrollmentNo?.toLowerCase().includes(term) ||
                            s.phone?.includes(term) ||
                            s.email?.toLowerCase().includes(term) ||
                            s.registrations?.some((r: any) => r.registrationNo?.toLowerCase().includes(term));
      const matchesStatus = !status || s.status === status;
      const matchesBatch = selectedBatchId === "all" || s.batchId === selectedBatchId;
      return matchesSearch && matchesStatus && matchesBatch;
    });
  }, [initialStudents, searchTerm, status, selectedBatchId]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / itemsPerPage));
  const paginatedStudents = useMemo(() => {
    return filteredStudents.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredStudents, currentPage, itemsPerPage]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await createStudent(workspaceId, formData);
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Student enrolled successfully!");
      setOpen(false);
      router.refresh();
      setFormData({
        fullName: "",
        enrollmentNo: "",
        phone: "",
        email: "",
        whatsapp: "",
        dob: "",
        gender: "",
        bloodGroup: "",
        religion: "",
        caste: "",
        address: "",
        fatherName: "",
        motherName: "",
        guardianPhone: "",
        batchId: "",
        courseId: "",
        photoUrl: "",
        signatureUrl: "",
        idProofUrl: "",
      });
    } else {
      toast.error(result.error || "Failed to enroll student");
    }
  };

  return (
    <TooltipProvider delay={300}>
      <div className="space-y-4">
        {/* Main Student Directory Card */}
        <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden bg-white dark:bg-slate-900">
          <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 flex-1">
                {/* Search Input */}
                <div className="relative w-full sm:max-w-[280px] group">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                    <Search className="h-3.5 w-3.5 text-slate-400 group-focus-within:text-primary transition-colors" />
                  </div>
                  <Input
                    placeholder="Search by name, ENR, phone, reg no..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="h-8 sm:h-9 pl-8 pr-3 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 rounded-lg text-[11px] sm:text-xs placeholder:text-slate-400"
                  />
                </div>

                {/* Batch Filter Dropdown */}
                <div className="w-full sm:w-[200px]">
                  <Select value={selectedBatchId} onValueChange={(val) => { setSelectedBatchId((val as string) || "all"); setCurrentPage(1); }}>
                    <SelectTrigger className="h-8 sm:h-9 text-xs font-medium rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
                      <SelectValue placeholder="All Batches">
                        {selectedBatchId === "all" || !selectedBatchId
                          ? "All Batches"
                          : (batches.find((b: any) => b.id === selectedBatchId)?.name || "All Batches")}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Batches ({initialStudents.length})</SelectItem>
                      {batches.map((b: any) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name} ({b._count?.students || 0})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <span className="text-[11px] font-semibold text-slate-400 shrink-0 hidden md:inline">
                  {filteredStudents.length} student{filteredStudents.length === 1 ? '' : 's'}
                </span>
              </div>

              {/* Right Side Actions */}
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <Button
                  variant="outline"
                  onClick={() => setImportOpen(true)}
                  className="h-8 sm:h-9 px-3 text-xs font-semibold rounded-lg border-slate-200 dark:border-slate-700 gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-500" /> Import CSV
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Student List Items */}
          <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
            {paginatedStudents.map((student: any) => {
              const statusColor = student.status === "REGISTERED"
                ? "border-l-emerald-500"
                : student.status === "PASS_OUT"
                ? "border-l-purple-500"
                : "border-l-amber-500";

              return (
                <div 
                  key={student.id}
                  className={cn(
                    "flex flex-col lg:flex-row items-start lg:items-center justify-between p-3 sm:p-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all gap-3 sm:gap-4 group border-l-[3px]",
                    statusColor
                  )}
                >
                  {/* Primary Info (Avatar + Names + Status + Contact) */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Avatar className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shrink-0">
                      <AvatarImage src={student.photoUrl || student.admissionApp?.photoUrl || undefined} className="object-cover" />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs sm:text-sm rounded-xl">
                        {student.fullName?.charAt(0) || "S"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white uppercase truncate">
                          {student.fullName}
                        </span>
                        
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border-none",
                            student.status === "REGISTERED" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                            student.status === "PASS_OUT" ? "bg-purple-500/10 text-purple-600 dark:text-purple-400" :
                            "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          )}
                        >
                          {student.status?.replace("_", " ")}
                        </Badge>

                        {student.admissionApp && (
                          <span className="text-[8px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded tracking-wider uppercase">
                            Online
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-slate-500 flex-wrap">
                        {student.phone && (
                          <span className="text-[10px] font-medium flex items-center gap-1">
                            <Phone className="h-2.5 w-2.5 text-slate-400 shrink-0" />
                            {student.phone}
                          </span>
                        )}
                        {student.email && (
                          <Tooltip>
                            <TooltipTrigger className="cursor-help text-[10px] font-medium text-slate-400 flex items-center gap-1 max-w-[140px] truncate p-0 border-none bg-transparent outline-none">
                              <Mail className="h-2.5 w-2.5 text-slate-400 shrink-0" />
                              <span className="truncate">{student.email}</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">{student.email}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Metadata Column Group */}
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4 w-full lg:w-auto">
                    <div className="flex flex-wrap md:flex-nowrap items-center gap-3 sm:gap-4 md:gap-5 w-full md:w-auto bg-slate-50/70 dark:bg-slate-800/30 lg:bg-transparent p-2 md:p-0 rounded-lg text-xs">
                      {/* Enrollment No */}
                      <div className="text-left shrink-0 min-w-[75px]">
                        <p className="font-semibold font-mono text-xs text-indigo-600 dark:text-indigo-400">{student.enrollmentNo}</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">ENROLLMENT NO</p>
                      </div>

                      {/* Reg No if exists */}
                      {(student.status === "REGISTERED" || student.status === "PASS_OUT") && student.registrations && student.registrations.length > 0 && (
                        <div className="text-left shrink-0 min-w-[75px]">
                          <p className="font-semibold font-mono text-xs text-emerald-600 dark:text-emerald-400">
                            {student.registrations[student.registrations.length - 1].registrationNo}
                          </p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">REG NO</p>
                        </div>
                      )}

                      {/* Batch */}
                      <div className="text-left max-w-[130px] sm:max-w-[150px] min-w-0 shrink-0">
                        <Tooltip>
                          <TooltipTrigger className="cursor-help flex items-center gap-1 overflow-hidden p-0 border-none bg-transparent text-left outline-none w-full">
                            <GraduationCap className="h-3 w-3 text-slate-400 shrink-0" />
                            <span className="font-medium text-xs text-slate-800 dark:text-slate-200 truncate block">
                              {student.batch?.name || "Unassigned"}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">{student.batch?.name || "Unassigned"}</p>
                          </TooltipContent>
                        </Tooltip>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">BATCH</p>
                      </div>

                      {/* Admission Date */}
                      <div className="text-left shrink-0 min-w-[70px]">
                        <span className="font-medium text-xs text-slate-600 dark:text-slate-400" suppressHydrationWarning>
                          {student.admissionDate ? new Date(student.admissionDate).toLocaleDateString('en-GB') : "N/A"}
                        </span>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">ADMIT DATE</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5 shrink-0 self-end md:self-auto">
                      {/* View Profile Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setViewingStudent(student)}
                        className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg text-slate-500 hover:text-primary hover:bg-primary/5 transition-colors"
                        title="View Profile"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>

                      {/* Register Button (for Unregistered) */}
                      {student.status === "UNREGISTERED" && (
                        <Button
                          onClick={() => handleRegisterClick(student)}
                          disabled={isActioning === student.id}
                          className="h-7 sm:h-8 px-2.5 rounded-lg text-xs font-semibold gap-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                        >
                          {isActioning === student.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserPlus className="h-3 w-3" />}
                          Register
                        </Button>
                      )}

                      {/* Pass Out Button (for Registered) */}
                      {student.status === "REGISTERED" && (
                        <Button
                          onClick={() => handlePassOutClick(student)}
                          disabled={isActioning === student.id}
                          variant="ghost"
                          className="h-7 sm:h-8 px-2 rounded-lg text-xs font-semibold text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20"
                        >
                          {isActioning === student.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <GraduationCap className="h-3 w-3 mr-1" />}
                          Pass Out
                        </Button>
                      )}

                      {/* More Menu Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 shrink-0 outline-none">
                          <MoreVertical className="h-3.5 w-3.5" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52 rounded-xl p-1 text-xs">
                          <DropdownMenuItem 
                            onClick={(e) => { e.preventDefault(); handleImpersonate(student.id); }} 
                            className="cursor-pointer py-2 px-2.5 rounded-lg font-medium text-slate-700 dark:text-slate-300 hover:text-primary"
                          >
                            <LayoutDashboard className="mr-2 h-3.5 w-3.5 text-slate-400" /> Student Dashboard
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => { setSelectedStudent(student); setDocsModalOpen(true); }} 
                            className="cursor-pointer py-2 px-2.5 rounded-lg font-medium text-slate-700 dark:text-slate-300 hover:text-primary"
                          >
                            <FileText className="mr-2 h-3.5 w-3.5 text-slate-400" /> Manage Documents
                          </DropdownMenuItem>
                          {student.status !== "PASS_OUT" && (
                            <DropdownMenuItem 
                              onClick={() => setManageResultStudent(student)} 
                              className="cursor-pointer py-2 px-2.5 rounded-lg font-medium text-slate-700 dark:text-slate-300 hover:text-primary"
                            >
                              <GraduationCap className="mr-2 h-3.5 w-3.5 text-slate-400" /> Manage Result
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => handleEditClick(student)} 
                            className="cursor-pointer py-2 px-2.5 rounded-lg font-medium text-slate-700 dark:text-slate-300 hover:text-primary"
                          >
                            <Pencil className="mr-2 h-3.5 w-3.5 text-slate-400" /> Edit Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => {
                              setSelectedStudent(student);
                              setNewPassword("");
                              setConfirmPassword("");
                              setPasswordModalOpen(true);
                            }} 
                            className="cursor-pointer py-2 px-2.5 rounded-lg font-medium text-amber-600 hover:text-amber-700"
                          >
                            <KeyRound className="mr-2 h-3.5 w-3.5 text-amber-500" /> Reset Password
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Empty State */}
            {paginatedStudents.length === 0 && (
              <div className="py-16 text-center">
                <User className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">No students found</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Try adjusting your search query or batch filter.</p>
              </div>
            )}
          </div>

          {/* Standard Pagination Footer */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20">
              <div className="text-xs font-medium text-slate-500">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredStudents.length)} of {filteredStudents.length} students
              </div>
              <div className="flex items-center gap-1.5">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} 
                  disabled={currentPage === 1} 
                  className="h-7 px-2 rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <div className="flex items-center gap-1 hidden sm:flex">
                  {getPageNumbers().map((page, idx) => {
                    if (page === '...') {
                      return <span key={`ellipsis-${idx}`} className="px-1 text-slate-400 text-xs select-none">...</span>;
                    }
                    const pageNum = page as number;
                    return (
                      <Button
                        key={`page-${pageNum}`}
                        variant={currentPage === pageNum ? "default" : "ghost"}
                        onClick={() => setCurrentPage(pageNum)}
                        className={cn("h-7 w-7 rounded-md font-semibold text-xs", currentPage === pageNum ? "shadow-sm shadow-primary/20" : "text-slate-500")}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} 
                  disabled={currentPage === totalPages} 
                  className="h-7 px-2 rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </Card>

      {/* View Student Profile Modal */}
      <Dialog open={!!viewingStudent} onOpenChange={(isOpen) => !isOpen && setViewingStudent(null)}>
        <DialogContent className="max-w-3xl max-h-[88vh] flex flex-col overflow-hidden rounded-2xl p-0 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl">
          {viewingStudent && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {/* Header Profile Card */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3.5">
                  <Avatar className="h-16 w-16 rounded-xl border-2 border-white dark:border-slate-800 shadow-sm">
                    <AvatarImage src={viewingStudent.photoUrl || viewingStudent.admissionApp?.photoUrl || undefined} className="object-cover" />
                    <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold rounded-xl">
                      {viewingStudent.fullName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white uppercase">{viewingStudent.fullName}</h3>
                      <Badge className={cn(
                        "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border-none",
                        viewingStudent.status === "REGISTERED" ? "bg-emerald-500 text-white" :
                        viewingStudent.status === "PASS_OUT" ? "bg-purple-500 text-white" :
                        "bg-amber-500 text-white"
                      )}>
                        {viewingStudent.status?.replace("_", " ")}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5 mt-1 text-xs text-slate-500">
                      <span className="font-mono text-primary font-semibold">ENR: {viewingStudent.enrollmentNo}</span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span 
                        className="font-mono text-amber-600 cursor-pointer hover:underline"
                        onClick={() => {
                          setSelectedStudent(viewingStudent);
                          setNewPassword("");
                          setConfirmPassword("");
                          setPasswordModalOpen(true);
                        }}
                      >
                        PWD: {viewingStudent.loginPassword || "Not Set"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      handleEditClick(viewingStudent);
                      setViewingStudent(null);
                    }}
                    className="h-8 text-xs font-semibold rounded-lg gap-1 border-slate-200 dark:border-slate-700"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => handleImpersonate(viewingStudent.id)}
                    className="h-8 text-xs font-semibold rounded-lg gap-1 bg-primary text-primary-foreground"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                  </Button>
                </div>
              </div>

              {/* Document Approval Badges */}
              <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Approvals:</span>
                {[
                  { label: "Admit Card", val: viewingStudent.admitCardApproved },
                  { label: "Marksheet", val: viewingStudent.marksheetApproved },
                  { label: "Certificate", val: viewingStudent.certificateApproved },
                ].map((doc, idx) => (
                  <span 
                    key={idx} 
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold",
                      doc.val ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-slate-100 text-slate-500 dark:bg-slate-800"
                    )}
                  >
                    {doc.val ? <CheckCircle className="h-3 w-3 text-emerald-500" /> : <Clock className="h-3 w-3 text-amber-500" />}
                    {doc.label}
                  </span>
                ))}
              </div>

              {/* Academic Details Card */}
              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5 text-primary" /> Academic Profile
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Course</p>
                    <p className="font-semibold text-slate-900 dark:text-white truncate">{viewingStudent.course?.title || viewingStudent.batch?.course?.title || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Batch</p>
                    <p className="font-semibold text-slate-900 dark:text-white truncate">{viewingStudent.batch?.name || "Unassigned"}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Admit Date</p>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {viewingStudent.admissionDate ? new Date(viewingStudent.admissionDate).toLocaleDateString('en-GB') : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Fees Due</p>
                    <p className="font-semibold text-amber-600">
                      {(() => {
                        if (!viewingStudent.invoices || viewingStudent.invoices.length === 0) return "₹0.00";
                        const due = viewingStudent.invoices.filter((i: any) => i.status !== "PAID").reduce((sum: number, val: any) => sum + (val.amount || 0), 0);
                        return due > 0 ? `₹${due.toFixed(2)}` : "₹0.00";
                      })()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Personal Details Card */}
              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-blue-500" /> Personal Details
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">DOB</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{viewingStudent.dob ? new Date(viewingStudent.dob).toLocaleDateString('en-GB') : "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Gender</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 capitalize">{viewingStudent.gender || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Blood Group</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{viewingStudent.bloodGroup || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Religion / Caste</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{(viewingStudent.religion || "N/A")} / {(viewingStudent.caste || "N/A")}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Father's Name</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{viewingStudent.fatherName || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Mother's Name</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{viewingStudent.motherName || "N/A"}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Contact</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {viewingStudent.phone || "N/A"} {viewingStudent.whatsapp ? `• WA: ${viewingStudent.whatsapp}` : ''}
                    </p>
                  </div>
                  <div className="sm:col-span-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Address</p>
                    <p className="font-medium text-slate-700 dark:text-slate-300 mt-0.5">
                      {(() => {
                        let addrObj: any = {};
                        try {
                          addrObj = typeof viewingStudent.address === 'string' ? JSON.parse(viewingStudent.address) : viewingStudent.address;
                        } catch(e) {}
                        if (addrObj?.vill) {
                          return `${addrObj.vill}, PO: ${addrObj.po || "N/A"}, PS: ${addrObj.ps || "N/A"}, Dist: ${addrObj.dist || "N/A"}, State: ${addrObj.state || "N/A"} - ${addrObj.pin || "N/A"}`;
                        }
                        return viewingStudent.address || "N/A";
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="p-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setViewingStudent(null)} className="h-8 px-4 text-xs font-semibold rounded-lg">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Reset Modal */}
      <Dialog open={passwordModalOpen} onOpenChange={setPasswordModalOpen}>
        <DialogContent className="max-w-md rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xl">
          <DialogHeader className="space-y-1 pb-2 border-b border-slate-100 dark:border-slate-800">
            <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              <KeyRound className="w-4 h-4 text-amber-500" /> Reset Password
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Update password for <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedStudent?.fullName}</span>
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePasswordUpdate} className="space-y-3 py-3">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">New Password</Label>
              <Input 
                type="text" 
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                placeholder="Enter new password"
                required
                minLength={4}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Confirm Password</Label>
              <Input 
                type="text" 
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                placeholder="Confirm password"
                required
                minLength={4}
              />
            </div>

            <DialogFooter className="flex-row items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="ghost" onClick={() => setPasswordModalOpen(false)} className="h-8 text-xs font-semibold rounded-lg">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="h-8 px-4 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-700 text-white shadow-xs">
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                Update Password
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* CSV Import Modal */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-md rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xl">
          <DialogHeader className="space-y-1 pb-2 border-b border-slate-100 dark:border-slate-800">
            <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
              <Upload className="w-4 h-4 text-primary" /> Import Students via CSV
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Upload a .csv file containing student records to batch enroll them.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleImportCSVSubmit} className="space-y-3 py-3">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Select CSV File</Label>
              <Input 
                type="file" 
                accept=".csv" 
                onChange={handleCSVUpload} 
                className="h-9 text-xs cursor-pointer file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary" 
              />
              <p className="text-[10px] text-slate-400">Required: "fullName" column. Optional: "phone", "email", "gender", etc.</p>
            </div>

            <DialogFooter className="flex-row items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="ghost" onClick={() => setImportOpen(false)} className="h-8 text-xs font-semibold rounded-lg">
                Cancel
              </Button>
              <Button type="submit" disabled={importing || !csvFile} className="h-8 px-4 text-xs font-semibold rounded-lg bg-primary text-primary-foreground shadow-xs">
                {importing ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Upload className="w-3.5 h-3.5 mr-1.5" />}
                {importing ? "Importing..." : "Upload & Import"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-3xl w-[95vw] max-h-[88vh] flex flex-col overflow-hidden rounded-2xl p-0 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
            <DialogHeader className="mb-3 space-y-0.5">
              <DialogTitle className="text-base sm:text-lg font-bold tracking-tight">Edit Student Profile</DialogTitle>
              <p className="text-xs text-slate-500">Modify the student's information and save changes.</p>
            </DialogHeader>
            
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* 01 Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b pb-1.5 border-slate-100 dark:border-slate-800">
                      <span className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center text-[11px] font-bold">01</span>
                      Personal Information
                    </h3>
                    <div className="grid gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Name *</label>
                        <Input required value={editFormData.fullName} onChange={e => setEditFormData({...editFormData, fullName: e.target.value})} className="h-9 text-xs rounded-lg" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Father's Name</label>
                          <Input value={editFormData.fatherName} onChange={e => setEditFormData({...editFormData, fatherName: e.target.value})} className="h-9 text-xs rounded-lg" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mother's Name</label>
                          <Input value={editFormData.motherName} onChange={e => setEditFormData({...editFormData, motherName: e.target.value})} className="h-9 text-xs rounded-lg" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Enrollment No</label>
                          <Input required value={editFormData.enrollmentNo} onChange={e => setEditFormData({...editFormData, enrollmentNo: e.target.value})} className="h-9 text-xs rounded-lg" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Login Password</label>
                          <Input value={editFormData.loginPassword} onChange={e => setEditFormData({...editFormData, loginPassword: e.target.value})} className="h-9 text-xs rounded-lg" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Date of Birth</label>
                          <Input 
                            type="text" 
                            placeholder="DD/MM/YYYY"
                            value={editFormData.dob} 
                            onChange={e => {
                              let val = e.target.value.replace(/\D/g, '');
                              if (val.length > 8) val = val.slice(0, 8);
                              if (val.length >= 2 && val.length < 4) val = val.slice(0,2) + '/' + val.slice(2);
                              else if (val.length >= 4) val = val.slice(0,2) + '/' + val.slice(2,4) + '/' + val.slice(4,8);
                              setEditFormData({...editFormData, dob: val});
                            }} 
                            maxLength={10}
                            className="h-9 text-xs rounded-lg" 
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
                              if (val.length >= 2 && val.length < 4) val = val.slice(0,2) + '/' + val.slice(2);
                              else if (val.length >= 4) val = val.slice(0,2) + '/' + val.slice(2,4) + '/' + val.slice(4,8);
                              setEditFormData({...editFormData, admissionDate: val});
                            }} 
                            maxLength={10}
                            className="h-9 text-xs rounded-lg" 
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Gender</label>
                          <select value={editFormData.gender} onChange={e => setEditFormData({...editFormData, gender: e.target.value})} className="flex h-9 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-background px-3 py-1 text-xs focus:border-primary outline-none">
                            <option value="">Select</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Blood Group</label>
                          <select value={editFormData.bloodGroup} onChange={e => setEditFormData({...editFormData, bloodGroup: e.target.value})} className="flex h-9 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-background px-3 py-1 text-xs focus:border-primary outline-none">
                            <option value="">Select</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Religion</label>
                          <Input value={editFormData.religion} onChange={e => setEditFormData({...editFormData, religion: e.target.value})} className="h-9 text-xs rounded-lg" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Caste</label>
                          <Input value={editFormData.caste} onChange={e => setEditFormData({...editFormData, caste: e.target.value})} className="h-9 text-xs rounded-lg" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 02 Contact & Address */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b pb-1.5 border-slate-100 dark:border-slate-800">
                      <span className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center text-[11px] font-bold">02</span>
                      Contact & Address
                    </h3>
                    <div className="grid gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone Number</label>
                        <Input value={editFormData.phone} onChange={e => setEditFormData({...editFormData, phone: e.target.value})} className="h-9 text-xs rounded-lg" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</label>
                        <Input type="email" value={editFormData.email} onChange={e => setEditFormData({...editFormData, email: e.target.value})} className="h-9 text-xs rounded-lg" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">WhatsApp Number</label>
                        <Input value={editFormData.whatsapp} onChange={e => setEditFormData({...editFormData, whatsapp: e.target.value})} className="h-9 text-xs rounded-lg" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Village / Street</label>
                          <Input value={editFormData.addressVill} onChange={e => setEditFormData({...editFormData, addressVill: e.target.value})} className="h-9 text-xs rounded-lg" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Post Office (PO)</label>
                          <Input value={editFormData.addressPO} onChange={e => setEditFormData({...editFormData, addressPO: e.target.value})} className="h-9 text-xs rounded-lg" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Police Station (PS)</label>
                          <Input value={editFormData.addressPS} onChange={e => setEditFormData({...editFormData, addressPS: e.target.value})} className="h-9 text-xs rounded-lg" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">District</label>
                          <Input value={editFormData.addressDist} onChange={e => setEditFormData({...editFormData, addressDist: e.target.value})} className="h-9 text-xs rounded-lg" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">State</label>
                          <Input value={editFormData.addressState} onChange={e => setEditFormData({...editFormData, addressState: e.target.value})} className="h-9 text-xs rounded-lg" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">PIN Code</label>
                          <Input value={editFormData.addressPin} onChange={e => setEditFormData({...editFormData, addressPin: e.target.value})} className="h-9 text-xs rounded-lg" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 03 Academic Details */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b pb-1.5 border-slate-100 dark:border-slate-800">
                      <span className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center text-[11px] font-bold">03</span>
                      Academic Details
                    </h3>
                    <div className="grid gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Qualification Name</label>
                        <Input value={editFormData.qualName} onChange={e => setEditFormData({...editFormData, qualName: e.target.value})} placeholder="e.g. 10th, 12th, B.A." className="h-9 text-xs rounded-lg" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Board/University</label>
                        <Input value={editFormData.qualBoard} onChange={e => setEditFormData({...editFormData, qualBoard: e.target.value})} className="h-9 text-xs rounded-lg" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Year of Passing</label>
                          <Input value={editFormData.qualYear} onChange={e => setEditFormData({...editFormData, qualYear: e.target.value})} placeholder="YYYY" maxLength={4} className="h-9 text-xs rounded-lg" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Percentage (%)</label>
                          <Input value={editFormData.qualPercent} onChange={e => setEditFormData({...editFormData, qualPercent: e.target.value})} className="h-9 text-xs rounded-lg" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 04 Course Details */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b pb-1.5 border-slate-100 dark:border-slate-800">
                      <span className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center text-[11px] font-bold">04</span>
                      Course Details
                    </h3>
                    <div className="grid gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assign Course</label>
                        <select value={editFormData.courseId} onChange={e => setEditFormData({...editFormData, courseId: e.target.value})} className="flex h-9 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-background px-3 py-1 text-xs focus:border-primary outline-none">
                          <option value="">Select a course</option>
                          {courses.map((course: any) => (
                            <option key={course.id} value={course.id}>{course.title}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assign Batch</label>
                        <select value={editFormData.batchId} onChange={e => setEditFormData({...editFormData, batchId: e.target.value})} className="flex h-9 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-background px-3 py-1 text-xs focus:border-primary outline-none">
                          <option value="">Select a batch</option>
                          {batches.map((batch: any) => (
                            <option key={batch.id} value={batch.id}>{batch.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 05 Documents (Full Width) */}
              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b pb-1.5 border-slate-100 dark:border-slate-800">
                  <span className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center text-[11px] font-bold">05</span>
                  Documents
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Photo</label>
                    <ImageUpload value={editFormData.photoUrl} onChange={(url) => setEditFormData({...editFormData, photoUrl: url})} maxSizeK={100} folder={`RGYCSP/Workspaces/${workspaceId}/students`} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Signature</label>
                    <ImageUpload value={editFormData.signatureUrl} onChange={(url) => setEditFormData({...editFormData, signatureUrl: url})} maxSizeK={100} folder={`RGYCSP/Workspaces/${workspaceId}/students`} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">ID Proof</label>
                    <ImageUpload value={editFormData.idProofUrl} onChange={(url) => setEditFormData({...editFormData, idProofUrl: url})} maxSizeK={1024} folder={`RGYCSP/Workspaces/${workspaceId}/students`} />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 sticky bottom-0 bg-white dark:bg-slate-900 z-10 px-1 pb-1">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditOpen(false)} className="h-8 px-4 text-xs font-semibold rounded-lg" disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isSubmitting} className="h-8 px-4 text-xs font-semibold rounded-lg shadow-sm">
                  {isSubmitting ? "Updating..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>


      
      <ConfirmDialog 
        open={!!studentToRegister} 
        onOpenChange={(open) => !open && setStudentToRegister(null)}
        title="Register Student"
        description={
          <>
            Are you sure you want to register <strong className="text-slate-900 dark:text-white">{studentToRegister?.fullName}</strong>? Registration fees will be deducted from your wallet based on the course duration.
          </>
        }
        onConfirm={confirmRegister}
        confirmText="Register"
        destructive={false}
      />

      <ConfirmDialog 
        open={!!studentToPassout} 
        onOpenChange={(open) => !open && setStudentToPassout(null)}
        title="Mark as Passed Out"
        description={
          <>
            Are you sure you want to mark <strong className="text-slate-900 dark:text-white">{studentToPassout?.fullName}</strong> as passed out? This action cannot be undone.
          </>
        }
        onConfirm={confirmPassOut}
        confirmText="Mark Pass Out"
        destructive={true}
      />

      {/* Docs Modal for Franchise Admin */}
      <Dialog open={docsModalOpen} onOpenChange={setDocsModalOpen}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[88vh] flex flex-col overflow-hidden rounded-2xl p-0 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xl">
          {/* Static Pinned Header */}
          <div className="shrink-0 px-4 sm:px-5 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 pr-10">
            <DialogHeader className="space-y-1">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <DialogTitle className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                    Document Management
                  </DialogTitle>
                  <p className="text-xs text-slate-500 font-medium">
                    Issue and preview documents for <strong className="text-slate-800 dark:text-slate-200 font-semibold">{selectedStudent?.fullName}</strong>
                  </p>
                </div>
              </div>
            </DialogHeader>
          </div>

          {/* Scrollable Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
            <div className="flex flex-col gap-3.5">
              {(() => {
                const certStatus = getDocumentStatus(selectedStudent, null, globalConfig);
                return (
                  <div className="flex flex-col p-3.5 sm:p-4 bg-white dark:bg-slate-900 border border-amber-200/60 dark:border-amber-800/50 rounded-xl shadow-xs hover:shadow-sm transition-all relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-[3rem] -z-10"></div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-center gap-2.5 mb-1.5">
                          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
                            <GraduationCap className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                          </div>
                          <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base tracking-tight">Final Certificate</h3>
                        </div>
                        <p className="text-xs text-slate-500 leading-snug">Official completion certificate. This is the final milestone document.</p>
                        {selectedStudent?.certificateNo && (
                          <div className="mt-1.5 text-[11px] font-mono font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-2.5 py-0.5 rounded border border-amber-200 dark:border-amber-800 inline-block">
                            Cert No: {selectedStudent.certificateNo}
                          </div>
                        )}
                      </div>
                      <div className="shrink-0">
                        {certStatus.isCertAuto ? (
                          <Badge className="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 border-0 rounded-lg px-2.5 py-1 text-xs font-bold">Auto Issued</Badge>
                        ) : certStatus.finalCertApproved ? (
                          <Badge className="bg-amber-50 text-amber-600 dark:bg-amber-500/10 border-0 rounded-lg px-2.5 py-1 text-xs font-bold">Approved</Badge>
                        ) : certStatus.finalCertIssued ? (
                          <Badge className="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 border-0 rounded-lg px-2.5 py-1 text-xs font-bold">Issued</Badge>
                        ) : hasDocumentAuthority ? (
                          <Badge className="bg-blue-50 text-blue-600 dark:bg-blue-500/10 border-0 rounded-lg px-2.5 py-1 text-xs font-bold">Authority</Badge>
                        ) : (
                          <Badge className="bg-red-50 text-red-600 dark:bg-red-500/10 border-0 rounded-lg px-2.5 py-1 text-xs font-bold">Pending</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 mt-2.5 border-t border-slate-100 dark:border-slate-800 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Issue Status</span>
                        {(certStatus.finalCertApproved || hasDocumentAuthority || certStatus.finalCertIssued) && !certStatus.isCertAuto ? (
                          <Switch 
                            checked={!!selectedStudent?.certificateIssuedToStudent} 
                            disabled={selectedStudent?.status === "PASS_OUT"}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                const remainingBalance = (selectedStudent?.invoices || [])
                                  .filter((i: any) => i.status === "PENDING" || i.status === "OVERDUE")
                                  .reduce((sum: number, i: any) => sum + Number(i.amount), 0);
                                
                                if (remainingBalance > 0) {
                                  toast.error(`Cannot issue certificate. Student has a pending fee balance of Rs. ${remainingBalance.toFixed(2)}`);
                                  return;
                                }
                              }

                              if (docRefs.current['CERTIFICATE'] && !docRefs.current['CERTIFICATE']?.hasTemplate()) {
                                toast.error(`Design template for Certificate does not exist yet!`);
                                return;
                              }
                              handleIssueToStudent(selectedStudent?.id, 'CERTIFICATE', checked);
                            }}
                            className={selectedStudent?.certificateIssuedToStudent ? "data-[state=checked]:bg-emerald-500" : ""}
                          />
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">
                            {certStatus.isCertAuto ? "Auto Issued" : "-"}
                          </span>
                        )}
                      </div>
                      
                      {!(certStatus.finalCertApproved || hasDocumentAuthority || certStatus.finalCertIssued || certStatus.isCertAuto) && (
                        <div className="flex items-center gap-2 ml-auto">
                          {selectedStudent?.documentIssueRequestedAt ? (
                            <Badge variant="outline" className="text-amber-500 border-amber-200 text-xs py-0.5">
                              <Clock className="w-3 h-3 mr-1" /> Request Pending
                            </Badge>
                          ) : (
                            <Button 
                              onClick={() => handleRequestIssue(selectedStudent?.id)}
                              disabled={isRequestingIssue}
                              variant="outline" 
                              size="sm" 
                              className="rounded-lg font-semibold h-8 px-3 text-xs text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                            >
                              {isRequestingIssue ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Rocket className="w-3.5 h-3.5 mr-1.5" />}
                              Request Quick Issue
                            </Button>
                          )}
                        </div>
                      )}

                      {(certStatus.finalCertApproved || hasDocumentAuthority || certStatus.finalCertIssued) && (
                        <>
                          <DocumentRenderer 
                            ref={el => { docRefs.current['CERTIFICATE'] = el; }} 
                            type="CERTIFICATE" 
                            student={selectedStudent}
                          />
                          <div className="flex items-center gap-1.5 ml-auto">
                            <Button variant="outline" size="sm" className="rounded-lg font-semibold h-8 px-3 text-xs" onClick={() => docRefs.current['CERTIFICATE']?.preview()}><Eye className="w-3.5 h-3.5 mr-1" /> Preview</Button>
                            <Button size="sm" className="rounded-lg font-semibold h-8 px-3 text-xs shadow-sm shadow-primary/20" onClick={() => docRefs.current['CERTIFICATE']?.downloadPDF()}><Download className="w-3.5 h-3.5 mr-1" /> Download</Button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Middle: Marksheets */}
              {(() => {
                let totalSemesters = 1;
                if (selectedStudent?.course?.duration) {
                  const durationStr = String(selectedStudent.course.duration).toLowerCase().trim();
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
                  const semData = selectedStudent?.semesters?.find((s:any) => s.semesterNumber === i);
                  const status = getDocumentStatus(selectedStudent, semData, globalConfig);
                  semestersData.push({ 
                    semesterNumber: i, 
                    superAdminApproved: status.finalMarksheetApproved,
                    issuedToStudent: status.finalMarksheetIssued,
                    isAuto: status.isMarksheetAuto,
                    rawIssued: semData?.marksheetIssuedToStudent || false
                  });
                }

                return (
                  <div className="flex flex-col p-3.5 sm:p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs">
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base tracking-tight">Academic Marksheets</h3>
                          <p className="text-xs text-slate-500 leading-snug">Semester-wise detailed marksheets. (Total {totalSemesters})</p>
                          {selectedStudent?.marksheetNo && (
                            <div className="mt-1 text-[11px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 inline-block">
                              Marksheet No: {selectedStudent.marksheetNo}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="border border-slate-100 dark:border-slate-800 rounded-lg overflow-hidden max-h-[220px] overflow-y-auto">
                      <Table>
                        <TableHeader className="bg-slate-50 dark:bg-slate-900/50 sticky top-0 z-10">
                          <TableRow>
                            <TableHead className="font-semibold text-xs py-2">Semester</TableHead>
                            <TableHead className="font-semibold text-xs py-2">Super Admin Status</TableHead>
                            <TableHead className="font-semibold text-xs py-2 text-center">Issue Status</TableHead>
                            <TableHead className="font-semibold text-xs py-2 text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {semestersData.map((sem) => {
                            const uniqueKey = `MARKSHEET_SEM_${sem.semesterNumber}`;
                            return (
                              <TableRow key={uniqueKey} className="hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/50">
                                <TableCell className="font-semibold text-xs py-2 text-slate-700 dark:text-slate-300">Semester {sem.semesterNumber}</TableCell>
                                <TableCell className="py-2">
                                  {sem.isAuto ? (
                                    <Badge className="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 border-0 rounded px-2 py-0.5 text-[10px] font-bold">Auto Issued</Badge>
                                  ) : sem.superAdminApproved ? (
                                    <Badge className="bg-amber-50 text-amber-600 dark:bg-amber-500/10 border-0 rounded px-2 py-0.5 text-[10px] font-bold">Approved</Badge>
                                  ) : sem.issuedToStudent ? (
                                    <Badge className="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 border-0 rounded px-2 py-0.5 text-[10px] font-bold">Issued</Badge>
                                  ) : hasDocumentAuthority ? (
                                    <Badge className="bg-blue-50 text-blue-600 dark:bg-blue-500/10 border-0 rounded px-2 py-0.5 text-[10px] font-bold">Authority</Badge>
                                  ) : (
                                    <Badge className="bg-red-50 text-red-600 dark:bg-red-500/10 border-0 rounded px-2 py-0.5 text-[10px] font-bold">Pending</Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-center py-2">
                                  {(sem.superAdminApproved || hasDocumentAuthority || sem.issuedToStudent) && !sem.isAuto ? (
                                    <Switch 
                                      checked={!!sem.rawIssued} 
                                      disabled={selectedStudent?.status === "PASS_OUT"}
                                      onCheckedChange={(checked) => {
                                        if (docRefs.current[uniqueKey] && !docRefs.current[uniqueKey]?.hasTemplate()) {
                                          toast.error(`Design template for Marksheet Sem ${sem.semesterNumber} does not exist yet!`);
                                          return;
                                        }
                                        handleIssueToStudent(selectedStudent?.id, 'MARKSHEET', checked, sem.semesterNumber);
                                      }}
                                      className={sem.rawIssued ? "data-[state=checked]:bg-emerald-500" : ""}
                                    />
                                  ) : (
                                    <span className="text-xs text-slate-400 font-medium">
                                      {sem.isAuto ? "Auto Issued" : "-"}
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell className="text-right py-2">
                                  {(sem.superAdminApproved || hasDocumentAuthority || sem.issuedToStudent) && (
                                    <div className="flex items-center justify-end gap-1">
                                      <DocumentRenderer ref={el => { docRefs.current[uniqueKey] = el; }} type="MARKSHEET" student={selectedStudent} semesterNumber={sem.semesterNumber} />
                                      <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-blue-600" onClick={() => docRefs.current[uniqueKey]?.preview()}><Eye className="w-3.5 h-3.5" /></Button>
                                      <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-emerald-600" onClick={() => docRefs.current[uniqueKey]?.downloadPDF()}><Download className="w-3.5 h-3.5" /></Button>
                                    </div>
                                  )}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { id: 'STUDENT_ID', label: 'Student ID Card', desc: 'Identity verification.', icon: <User className="w-4 h-4 text-blue-500 dark:text-blue-400" />, isIssued: selectedStudent?.registrationCardIssuedToStudent },
                  { id: 'ADMIT_CARD', label: 'Admit Card', desc: 'Required for examinations.', icon: <Calendar className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />, isIssued: selectedStudent?.admitCardIssuedToStudent }
                ].map((doc) => (
                  <div key={doc.id} className="flex flex-col p-3 sm:p-3.5 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-xl gap-2 hover:border-blue-200 dark:hover:border-blue-900/50 hover:shadow-xs transition-all group">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 flex items-center justify-center shadow-xs shrink-0">
                          {doc.icon}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">{doc.label}</h3>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{doc.desc}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 mt-1 border-t border-slate-100 dark:border-slate-800/60 flex-wrap gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Issue:</span>
                        <Switch 
                          checked={!!doc.isIssued} 
                          disabled={selectedStudent?.status === "PASS_OUT"}
                          onCheckedChange={(checked) => {
                            if (docRefs.current[doc.id] && !docRefs.current[doc.id]?.hasTemplate()) {
                              toast.error(`Design template for ${doc.label} does not exist yet!`);
                              return;
                            }
                            handleIssueToStudent(selectedStudent?.id, doc.id as any, checked);
                          }}
                          className={doc.isIssued ? "data-[state=checked]:bg-emerald-500" : ""}
                        />
                      </div>
                      
                      <DocumentRenderer ref={el => { docRefs.current[doc.id] = el; }} type={doc.id as any} student={selectedStudent} />
                      
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
          <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex items-center justify-between shrink-0">
            <span className="text-[11px] text-slate-400 font-medium">
              Approved documents can be downloaded or previewed at high resolution.
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setDocsModalOpen(false)}
              className="h-7 px-3 text-xs font-semibold rounded-lg"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Manage Result Modal */}
      <ManageResultModal
        isOpen={!!manageResultStudent}
        onClose={() => setManageResultStudent(null)}
        student={manageResultStudent}
        onSave={() => router.refresh()}
      />
      </div>
    </TooltipProvider>
  );
}


