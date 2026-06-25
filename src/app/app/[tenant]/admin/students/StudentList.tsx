"use client";

import React, { useState } from "react";
import { Plus, Search, MoreVertical, UserPlus, Phone, Mail, GraduationCap, FileText, Eye, Pencil, Database, Download, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
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
import { createStudent, updateStudent } from "@/app/actions/students";
import { importStudentsCSV } from "@/app/actions/students-import";
import { registerStudent, markStudentAsPassOut, toggleDocumentApproval } from "@/app/actions/student-registration";
import { toast } from "sonner";
import { useRouter, usePathname, useParams } from "next/navigation";
import Link from "next/link";
import { ImageUpload } from "@/components/ui/ImageUpload";

export default function StudentList({ 
  workspaceId, 
  initialStudents,
  batches,
  courses,
  status
}: { 
  workspaceId: string; 
  initialStudents: any[];
  batches: any[];
  courses: any[];
  status?: string;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const tenant = params?.tenant;

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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setIsSubmitting(true);
    
    // Parse DD/MM/YYYY to YYYY-MM-DD
    let parsedDob = editFormData.dob;
    if (parsedDob && parsedDob.includes('/')) {
      const [dd, mm, yyyy] = parsedDob.split('/');
      if (dd && mm && yyyy) {
        parsedDob = `${yyyy}-${mm}-${dd}`;
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

  const isSubdirectoryMode = pathname.startsWith('/app/');
  const workspaceBase = isSubdirectoryMode ? `/app/${tenant}` : '';

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

  // Set initial enrollment no on client mount to avoid hydration mismatch
  React.useEffect(() => {
    setFormData(prev => ({
      ...prev,
      enrollmentNo: `STU-${Math.floor(1000 + Math.random() * 9000)}`
    }));
  }, []);

  const filteredStudents = initialStudents.filter(s => {
    const matchesSearch = s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.enrollmentNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !status || s.status === status;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
        enrollmentNo: `STU-${Math.floor(1000 + Math.random() * 9000)}`,
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search students or enrollment no..." 
            className="pl-9 rounded-xl border-slate-200 font-medium h-11"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Modern Vertical List */}
      <div className="bg-slate-50/50 dark:bg-slate-950/50 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800/50 p-8 shadow-inner">
        <div className="space-y-4">
          {paginatedStudents.map((student) => (
            <div 
              key={student.id} 
              className="group bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-100 dark:border-slate-800/50 p-6 transition-all duration-300 hover:border-primary/30 dark:hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 dark:hover:shadow-black/60 flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex items-center gap-5 flex-1 min-w-0">
                <Avatar className="h-14 w-14 rounded-2xl border-2 border-slate-200/50 dark:border-slate-700/50 shrink-0">
                  <AvatarImage src={student.photoUrl || student.admissionApp?.photoUrl || undefined} className="object-cover" />
                  <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-primary font-bold text-lg rounded-2xl">
                    {student.fullName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-slate-900 dark:text-white truncate text-lg leading-none">{student.fullName}</h3>
                    {student.admissionApp && (
                      <span className="text-[8px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded tracking-tight">
                        Online
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500">
                    <span className="text-[10px] font-bold tracking-wider text-primary/70">{student.enrollmentNo}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-200 dark:bg-slate-800" />
                    <span className="text-[10px] font-bold whitespace-nowrap" suppressHydrationWarning>
                      Joined {new Date(student.admissionDate).toLocaleDateString('en-GB')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8 md:px-8 md:border-x-2 md:border-slate-100 dark:md:border-slate-800/50">
                <div className="flex flex-col">
                  <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mb-1 flex items-center gap-1">
                    <GraduationCap className="h-2.5 w-2.5" />
                    Batch
                  </p>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    {student.batch?.name || "Unassigned"}
                  </p>
                </div>
                <div className="flex flex-col">
                  <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mb-1 flex items-center gap-1">
                    <Phone className="h-2.5 w-2.5" />
                    Contact
                  </p>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    {student.phone || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 shrink-0">
                <Dialog>
                  <DialogTrigger render={
                    <Button variant="outline" size="sm" className="rounded-xl h-10 font-bold text-[10px] gap-2 border-2 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                      <Eye className="h-3.5 w-3.5 text-primary" />
                      View Details
                    </Button>
                  } />
                <DialogContent className="max-w-2xl rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
                  <div className="bg-primary h-32 w-full relative">
                    <div className="absolute -bottom-12 left-8 p-1 bg-white dark:bg-slate-900 rounded-3xl shadow-xl">
                      <Avatar className="h-24 w-24 rounded-2xl border-4 border-white dark:border-slate-900 shadow-sm">
                        <AvatarImage src={student.photoUrl || student.admissionApp?.photoUrl || undefined} className="object-cover" />
                        <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold rounded-2xl">
                          {student.fullName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                  
                  <div className="px-8 pt-16 pb-8 space-y-8 bg-white dark:bg-slate-900">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{student.fullName}</h2>
                        <p className="text-xs font-bold text-slate-400 tracking-wider mt-1">{student.enrollmentNo}</p>
                      </div>
                      <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none font-bold px-4 py-1 rounded-full text-[10px]">
                        Active Student
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <h4 className="text-[10px] font-bold text-slate-400 tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">Academic Info</h4>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                                <GraduationCap className="h-4 w-4 text-slate-400" />
                              </div>
                              <div>
                                <p className="text-[9px] font-bold text-slate-400">Batch / Course</p>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{student.batch?.name || "Not Assigned"}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                                <FileText className="h-4 w-4 text-slate-400" />
                              </div>
                              <div>
                                <p className="text-[9px] font-bold text-slate-400">Admission Date</p>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200" suppressHydrationWarning>
                                  {new Date(student.admissionDate).toLocaleDateString('en-GB')}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-4">
                          <h4 className="text-[10px] font-bold text-slate-400 tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">Contact Details</h4>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                                <Phone className="h-4 w-4 text-slate-400" />
                              </div>
                              <div>
                                <p className="text-[9px] font-bold text-slate-400">Phone Number</p>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{student.phone || "N/A"}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                                <Mail className="h-4 w-4 text-slate-400" />
                              </div>
                              <div>
                                <p className="text-[9px] font-bold text-slate-400">Email Address</p>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate max-w-[180px]">{student.email || "N/A"}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {student.applicationId && (
                          <Link href={`${workspaceBase}/admission/print/${student.applicationId}`} target="_blank">
                            <Button variant="ghost" size="sm" className="font-bold text-[10px] text-primary gap-2 hover:bg-primary/5">
                              <FileText className="h-3 w-3" />
                              View Original Form
                            </Button>
                          </Link>
                        )}
                      </div>
                      <Button 
                        onClick={() => handleEditClick(student)}
                        variant="outline" 
                        className="rounded-xl font-bold px-6 h-10 border-slate-200 dark:border-slate-800"
                      >
                        Edit Profile
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <div className="flex items-center gap-1">
                {student.status === "UNREGISTERED" && (
                  <Button
                    onClick={() => handleRegisterClick(student)}
                    disabled={isActioning === student.id}
                    className="h-9 rounded-lg font-bold text-[10px] px-3 gap-2 bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                    {isActioning === student.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserPlus className="h-3 w-3" />}
                    Register
                  </Button>
                )}

                {student.status === "REGISTERED" && (
                  <>
                    <div className="flex gap-1 border-r border-slate-200 dark:border-slate-800 pr-2 mr-1 items-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex items-center justify-center h-9 w-9 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-600 shrink-0 outline-none">
                          <MoreVertical className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 rounded-xl">
                          <DropdownMenuItem 
                            onClick={() => handleDocumentApproval(student, 'admitCard')}
                            disabled={isActioning === `${student.id}-admitCard`}
                            className="text-xs font-bold cursor-pointer py-2"
                          >
                            {isActioning === `${student.id}-admitCard` ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : (student.admitCardApproved ? <CheckCircle className="h-3.5 w-3.5 mr-2 text-indigo-500" /> : <FileText className="h-3.5 w-3.5 mr-2 text-slate-400" />)}
                            Admit Card {student.admitCardApproved && <span className="ml-auto text-[9px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">Approved</span>}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDocumentApproval(student, 'registrationCard')}
                            disabled={isActioning === `${student.id}-registrationCard`}
                            className="text-xs font-bold cursor-pointer py-2"
                          >
                            {isActioning === `${student.id}-registrationCard` ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : (student.registrationCardApproved ? <CheckCircle className="h-3.5 w-3.5 mr-2 text-indigo-500" /> : <FileText className="h-3.5 w-3.5 mr-2 text-slate-400" />)}
                            Registration Card {student.registrationCardApproved && <span className="ml-auto text-[9px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">Approved</span>}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDocumentApproval(student, 'marksheet')}
                            disabled={isActioning === `${student.id}-marksheet`}
                            className="text-xs font-bold cursor-pointer py-2"
                          >
                            {isActioning === `${student.id}-marksheet` ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : (student.marksheetApproved ? <CheckCircle className="h-3.5 w-3.5 mr-2 text-indigo-500" /> : <FileText className="h-3.5 w-3.5 mr-2 text-slate-400" />)}
                            Marksheet {student.marksheetApproved && <span className="ml-auto text-[9px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">Approved</span>}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDocumentApproval(student, 'certificate')}
                            disabled={isActioning === `${student.id}-certificate`}
                            className="text-xs font-bold cursor-pointer py-2"
                          >
                            {isActioning === `${student.id}-certificate` ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : (student.certificateApproved ? <CheckCircle className="h-3.5 w-3.5 mr-2 text-indigo-500" /> : <FileText className="h-3.5 w-3.5 mr-2 text-slate-400" />)}
                            Certificate {student.certificateApproved && <span className="ml-auto text-[9px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">Approved</span>}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <Button
                      onClick={() => handlePassOutClick(student)}
                      disabled={isActioning === student.id}
                      variant="ghost"
                      size="sm"
                      className="h-9 rounded-lg font-bold text-[10px] px-2 text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                    >
                      {isActioning === student.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <GraduationCap className="h-3 w-3 mr-1" />}
                      Pass Out
                    </Button>
                  </>
                )}

                {student.status !== "PASS_OUT" && (
                  <Button 
                    onClick={() => handleEditClick(student)}
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-600 shrink-0"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden rounded-[2.5rem] p-0 border-2 border-slate-100 dark:border-slate-800">
          <div className="flex-1 overflow-y-auto p-8 sm:p-10 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-bold tracking-tight">Edit Student Profile</DialogTitle>
              <p className="text-sm text-slate-500 mt-1">Modify the student's information and save changes.</p>
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
                        <Input required value={editFormData.fullName} onChange={e => setEditFormData({...editFormData, fullName: e.target.value})} className="h-11 rounded-xl" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-400">Father's Name</label>
                          <Input value={editFormData.fatherName} onChange={e => setEditFormData({...editFormData, fatherName: e.target.value})} className="h-11 rounded-xl" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-400">Mother's Name</label>
                          <Input value={editFormData.motherName} onChange={e => setEditFormData({...editFormData, motherName: e.target.value})} className="h-11 rounded-xl" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-400">Enrollment No</label>
                          <Input required value={editFormData.enrollmentNo} onChange={e => setEditFormData({...editFormData, enrollmentNo: e.target.value})} className="h-11 rounded-xl" />
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
                              if (val.length >= 2 && val.length < 4) val = val.slice(0,2) + '/' + val.slice(2);
                              else if (val.length >= 4) val = val.slice(0,2) + '/' + val.slice(2,4) + '/' + val.slice(4,8);
                              setEditFormData({...editFormData, dob: val});
                            }} 
                            maxLength={10}
                            className="h-11 rounded-xl" 
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-400">Gender</label>
                          <select value={editFormData.gender} onChange={e => setEditFormData({...editFormData, gender: e.target.value})} className="flex h-11 w-full rounded-xl border-2 border-slate-100 bg-background px-3 py-2 text-sm focus:border-primary outline-none">
                            <option value="">Select</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-400">Blood Group</label>
                          <select value={editFormData.bloodGroup} onChange={e => setEditFormData({...editFormData, bloodGroup: e.target.value})} className="flex h-11 w-full rounded-xl border-2 border-slate-100 bg-background px-3 py-2 text-sm focus:border-primary outline-none">
                            <option value="">Select</option>
                            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-400">Religion</label>
                          <Input value={editFormData.religion} onChange={e => setEditFormData({...editFormData, religion: e.target.value})} className="h-11 rounded-xl" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-400">Caste</label>
                          <select value={editFormData.caste} onChange={e => setEditFormData({...editFormData, caste: e.target.value})} className="flex h-11 w-full rounded-xl border-2 border-slate-100 bg-background px-3 py-2 text-sm focus:border-primary outline-none">
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
                          <Input value={editFormData.phone} onChange={e => setEditFormData({...editFormData, phone: e.target.value})} className="h-11 rounded-xl" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-400">WhatsApp Number</label>
                          <Input value={editFormData.whatsapp} onChange={e => setEditFormData({...editFormData, whatsapp: e.target.value})} className="h-11 rounded-xl" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400">Email Address</label>
                        <Input type="email" value={editFormData.email} onChange={e => setEditFormData({...editFormData, email: e.target.value})} className="h-11 rounded-xl" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400">Guardian Phone</label>
                        <Input value={editFormData.guardianPhone} onChange={e => setEditFormData({...editFormData, guardianPhone: e.target.value})} className="h-11 rounded-xl" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-400">Village/Street</label>
                          <Input value={editFormData.addressVill} onChange={e => setEditFormData({...editFormData, addressVill: e.target.value})} className="h-11 rounded-xl" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-400">Post Office</label>
                          <Input value={editFormData.addressPO} onChange={e => setEditFormData({...editFormData, addressPO: e.target.value})} className="h-11 rounded-xl" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-400">Police Station</label>
                          <Input value={editFormData.addressPS} onChange={e => setEditFormData({...editFormData, addressPS: e.target.value})} className="h-11 rounded-xl" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-400">District</label>
                          <Input value={editFormData.addressDist} onChange={e => setEditFormData({...editFormData, addressDist: e.target.value})} className="h-11 rounded-xl" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-400">State</label>
                          <Input value={editFormData.addressState} onChange={e => setEditFormData({...editFormData, addressState: e.target.value})} className="h-11 rounded-xl" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-400">PIN Code</label>
                          <Input value={editFormData.addressPin} onChange={e => setEditFormData({...editFormData, addressPin: e.target.value})} className="h-11 rounded-xl" />
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
                        <Input value={editFormData.qualName} onChange={e => setEditFormData({...editFormData, qualName: e.target.value})} placeholder="e.g. 10th, 12th, B.A." className="h-11 rounded-xl" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400">Board/University</label>
                        <Input value={editFormData.qualBoard} onChange={e => setEditFormData({...editFormData, qualBoard: e.target.value})} className="h-11 rounded-xl" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-400">Year of Passing</label>
                          <Input value={editFormData.qualYear} onChange={e => setEditFormData({...editFormData, qualYear: e.target.value})} placeholder="YYYY" maxLength={4} className="h-11 rounded-xl" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-400">Percentage (%)</label>
                          <Input value={editFormData.qualPercent} onChange={e => setEditFormData({...editFormData, qualPercent: e.target.value})} className="h-11 rounded-xl" />
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
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400">Assign Course</label>
                        <select value={editFormData.courseId} onChange={e => setEditFormData({...editFormData, courseId: e.target.value})} className="flex h-11 w-full rounded-xl border-2 border-slate-100 bg-background px-3 py-2 text-sm focus:border-primary outline-none">
                          <option value="">Select a course</option>
                          {courses.map((course: any) => (
                            <option key={course.id} value={course.id}>{course.title}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400">Assign Batch</label>
                        <select value={editFormData.batchId} onChange={e => setEditFormData({...editFormData, batchId: e.target.value})} className="flex h-11 w-full rounded-xl border-2 border-slate-100 bg-background px-3 py-2 text-sm focus:border-primary outline-none">
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
              <div className="space-y-6 pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b pb-2">
                  <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs">05</span>
                  Documents
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400">Photo</label>
                    <ImageUpload value={editFormData.photoUrl} onChange={(url) => setEditFormData({...editFormData, photoUrl: url})} maxSizeK={100} folder={`RGYCSP/Workspaces/${workspaceId}/students`} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400">Signature</label>
                    <ImageUpload value={editFormData.signatureUrl} onChange={(url) => setEditFormData({...editFormData, signatureUrl: url})} maxSizeK={100} folder={`RGYCSP/Workspaces/${workspaceId}/students`} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400">ID Proof</label>
                    <ImageUpload value={editFormData.idProofUrl} onChange={(url) => setEditFormData({...editFormData, idProofUrl: url})} maxSizeK={1024} folder={`RGYCSP/Workspaces/${workspaceId}/students`} />
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs font-bold text-slate-400">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredStudents.length)} of {filteredStudents.length} Students
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="rounded-lg font-bold text-xs border-slate-200 dark:border-slate-800"
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <Button
                  key={i}
                  variant={currentPage === i + 1 ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentPage(i + 1)}
                  className={`h-8 w-8 rounded-lg font-bold text-xs ${currentPage === i + 1 ? "shadow-md shadow-primary/20" : ""}`}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="rounded-lg font-bold text-xs border-slate-200 dark:border-slate-800"
            >
              Next
            </Button>
          </div>
        </div>
      )}
      
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
    </div>
  );
}


