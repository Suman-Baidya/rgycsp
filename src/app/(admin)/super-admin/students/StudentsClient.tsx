"use client";

import React, { useState, useMemo, useRef } from "react";
import {
  Users, GraduationCap, Building2, Search,
  Eye, Pencil, ChevronLeft, ChevronRight, CheckCircle, FileText, Calendar, Mail, Phone, MoreHorizontal, User, UserCheck, Trash2, ShieldCheck, Download, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AdminPageHeader } from "@/components/layout/AdminPageHeader";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { updateStudent } from "@/app/actions/students";
import { issueStudentDocument } from "@/app/actions/student-documents";
import { registerStudent } from "@/app/actions/student-registration";
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

interface StudentsClientProps {
  initialStudents: any[];
  initialWorkspaces: any[];
}

export default function StudentsClient({ initialStudents, initialWorkspaces }: StudentsClientProps) {
  const router = useRouter();

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("UNREGISTERED");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Edit State
  const [editOpen, setEditOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentToDelete, setStudentToDelete] = useState<any>(null);
  
  // View State
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedStudentForView, setSelectedStudentForView] = useState<any>(null);

  // Docs Modal State
  const [docsModalOpen, setDocsModalOpen] = useState(false);
  const [selectedStudentForDocs, setSelectedStudentForDocs] = useState<any>(null);
  const docRefs = useRef<{ [key: string]: DocumentRendererRef | null }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editFormData, setEditFormData] = useState({
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

  const handleIssueDocument = async (studentId: string, docType: "MARKSHEET" | "CERTIFICATE" | "STUDENT_ID" | "ADMIT_CARD", status: boolean) => {
    const res = await issueStudentDocument(studentId, docType, status);
    if (res.success) {
      toast.success(`${docType.replace('_', ' ')} ${status ? 'Issued' : 'Revoked'} successfully`);
      if (selectedStudentForDocs) {
        setSelectedStudentForDocs({
          ...selectedStudentForDocs,
          ...(docType === "MARKSHEET" && { marksheetApproved: status }),
          ...(docType === "CERTIFICATE" && { certificateApproved: status }),
          ...(docType === "STUDENT_ID" && { registrationCardApproved: status }),
          ...(docType === "ADMIT_CARD" && { admitCardApproved: status }),
        });
      }
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

  const filteredStudents = useMemo(() => {
    return initialStudents.filter(s => {
      const searchLower = searchTerm.toLowerCase();
      const dobStr = s.dob ? new Date(s.dob).toLocaleDateString('en-GB') : "";
      const adminDateStr = s.admissionDate ? new Date(s.admissionDate).toLocaleDateString('en-GB') : "";

      const matchesSearch =
        s.fullName.toLowerCase().includes(searchLower) ||
        s.enrollmentNo.toLowerCase().includes(searchLower) ||
        (s.applicationId && s.applicationId.toLowerCase().includes(searchLower)) ||
        (s.phone && s.phone.includes(searchLower)) ||
        (s.email && s.email.toLowerCase().includes(searchLower)) ||
        dobStr.includes(searchLower) ||
        adminDateStr.includes(searchLower);

      return matchesSearch && s.status === statusFilter;
    });
  }, [initialStudents, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
    { id: "UNREGISTERED", label: "Current Unregistered", icon: User },
    { id: "REGISTERED", label: "Active Registered", icon: UserCheck },
    { id: "PASS_OUT", label: "Pass Out Students", icon: GraduationCap },
  ];

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
        <CardHeader className="p-6 md:p-8 border-b border-slate-50 dark:border-slate-800/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:max-w-[450px] group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <Input
                placeholder="Search by ID, Name, Phone, Email, Date..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-11 pr-4 bg-slate-50 dark:bg-slate-800/40 border-none rounded-2xl h-14 font-bold text-sm transition-all focus-visible:ring-2 focus-visible:ring-primary/20 placeholder:text-slate-400 placeholder:font-medium"
              />
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
                              className="inline-flex items-center justify-center whitespace-nowrap h-10 w-10 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/20"
                              title="Documents"
                            >
                              <MoreHorizontal className="h-4 w-4" />
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
                      <div className="flex items-center gap-1.5"><Badge variant="outline" className="text-xs font-bold font-mono text-primary border-primary/20 bg-primary/5">{selectedStudentForView.enrollmentNo}</Badge></div>
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-8 bg-slate-50/50 dark:bg-slate-950/50 border-2 border-slate-100 dark:border-slate-800">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { id: 'STUDENT_ID', label: 'Student ID Card', desc: 'Identity verification for the student.', approved: selectedStudentForDocs?.registrationCardApproved, icon: <User className="w-4 h-4 text-blue-500" /> },
              { id: 'ADMIT_CARD', label: 'Admit Card', desc: 'Required for appearing in examinations.', approved: selectedStudentForDocs?.admitCardApproved, icon: <Calendar className="w-4 h-4 text-indigo-500" /> },
              { id: 'MARKSHEET', label: 'Marksheet', desc: 'Semester-wise detailed marksheets.', approved: selectedStudentForDocs?.marksheetApproved, icon: <FileText className="w-4 h-4 text-emerald-500" /> },
              { id: 'CERTIFICATE', label: 'Final Certificate', desc: 'Official completion certificate.', approved: selectedStudentForDocs?.certificateApproved, icon: <GraduationCap className="w-4 h-4 text-amber-500" /> }
            ].map((doc) => (
              <div key={doc.id} className="flex flex-col p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl gap-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        {doc.icon}
                      </div>
                      <h3 className="font-black text-slate-900 dark:text-white text-lg tracking-tight">{doc.label}</h3>
                    </div>
                    <p className="text-sm font-medium text-slate-500 leading-snug">{doc.desc}</p>
                  </div>
                  {doc.approved ? (
                    <Badge className="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 hover:bg-emerald-100 border-0 rounded-xl px-3 py-1 font-bold">Issued</Badge>
                  ) : (
                    <Badge className="bg-amber-50 text-amber-600 dark:bg-amber-500/10 hover:bg-amber-100 border-0 rounded-xl px-3 py-1 font-bold">Pending</Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Issue Status</span>
                    <Switch 
                      checked={!!doc.approved} 
                      onCheckedChange={(checked) => {
                        if (docRefs.current[doc.id] && !docRefs.current[doc.id]?.hasTemplate()) {
                          toast.error(`Design template for ${doc.label} does not exist yet!`);
                          return;
                        }
                        handleIssueDocument(selectedStudentForDocs?.id, doc.id as any, checked);
                      }}
                      className={doc.approved ? "data-[state=checked]:bg-emerald-500" : ""}
                    />
                  </div>
                  
                  {/* The Renderer */}
                  <DocumentRenderer 
                    ref={el => { docRefs.current[doc.id] = el; }} 
                    type={doc.id} 
                    student={selectedStudentForDocs} 
                  />

                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-xl h-10 w-10 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      title="Preview Document"
                      onClick={() => {
                        if (docRefs.current[doc.id]) docRefs.current[doc.id]?.preview();
                      }}
                    >
                      <Eye className="w-5 h-5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-xl h-10 w-10 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                      title="Download PDF"
                      onClick={() => {
                        if (docRefs.current[doc.id]) docRefs.current[doc.id]?.downloadPDF();
                      }}
                    >
                      <Download className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      </div>
    </TooltipProvider>
  );
}
