"use client";

import React, { useState } from "react";
import { Plus, Search, MoreVertical, UserPlus, Phone, Mail, GraduationCap, FileText, Eye, Pencil, Database, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createStudent, updateStudent } from "@/app/actions/students";
import { importStudentsCSV } from "@/app/actions/students-import";
import { toast } from "sonner";
import { useRouter, usePathname, useParams } from "next/navigation";
import Link from "next/link";

export default function StudentList({ 
  workspaceId, 
  initialStudents,
  batches 
}: { 
  workspaceId: string; 
  initialStudents: any[];
  batches: any[];
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
    address: "",
    parentName: "",
    parentPhone: "",
    fatherName: "",
    motherName: "",
    guardianPhone: "",
    batchId: "",
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
    setEditFormData({
      fullName: student.fullName,
      enrollmentNo: student.enrollmentNo,
      phone: student.phone || "",
      email: student.email || "",
      whatsapp: student.whatsapp || "",
      dob: student.dob ? new Date(student.dob).toISOString().split('T')[0] : "",
      gender: student.gender || "",
      bloodGroup: student.bloodGroup || "",
      religion: student.religion || "",
      caste: student.caste || "",
      address: student.address || "",
      parentName: student.parentName || "",
      parentPhone: student.parentPhone || "",
      fatherName: student.fatherName || "",
      motherName: student.motherName || "",
      guardianPhone: student.guardianPhone || "",
      batchId: student.batchId || "",
    });
    setEditOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setIsSubmitting(true);
    const result = await updateStudent(selectedStudent.id, editFormData);
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Student profile updated!");
      setEditOpen(false);
      router.refresh();
    } else {
      toast.error(result.error || "Failed to update student");
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
    parentName: "",
    parentPhone: "",
    fatherName: "",
    motherName: "",
    guardianPhone: "",
    batchId: "",
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
        parentName: "",
        parentPhone: "",
        fatherName: "",
        motherName: "",
        guardianPhone: "",
        batchId: "",
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
                <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary font-bold text-lg border-2 border-slate-200/50 dark:border-slate-700/50 shrink-0">
                  {student.fullName.charAt(0)}
                </div>
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
                      <Avatar className="h-24 w-24 rounded-2xl border-4 border-white dark:border-slate-900">
                        <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
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

              <Button 
                onClick={() => handleEditClick(student)}
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-600"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-4xl rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="bg-primary p-8 text-white">
            <DialogTitle className="font-bold text-2xl">Edit Student Profile</DialogTitle>
            <p className="text-white/70 text-sm mt-1">Modify the student's information and save changes.</p>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="p-8 space-y-8 max-h-[80vh] overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900">
            {/* Section 1: Personal Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <div className="h-1.5 w-1.5 rounded-full bg-white" />
                <h3 className="text-[10px] font-bold text-white tracking-widest">1. Personal Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold text-xs text-slate-500">Full Name</Label>
                  <Input required value={editFormData.fullName} onChange={e => setEditFormData({...editFormData, fullName: e.target.value})} placeholder="Student Name" className="rounded-xl h-11" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-xs text-slate-500">Enrollment No</Label>
                  <Input required value={editFormData.enrollmentNo} onChange={e => setEditFormData({...editFormData, enrollmentNo: e.target.value})} placeholder="STU-XXXX" className="rounded-xl h-11" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-xs text-slate-500">Date of Birth</Label>
                  <div className="relative">
                    <Button 
                      variant="outline" 
                      type="button"
                      className="w-full h-11 rounded-xl font-bold justify-start px-4 pointer-events-none"
                    >
                      {editFormData.dob ? new Date(editFormData.dob).toLocaleDateString('en-GB') : "Select Date"}
                    </Button>
                    <input 
                      type="date" 
                      value={editFormData.dob} 
                      onChange={e => setEditFormData({...editFormData, dob: e.target.value})} 
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-xs text-slate-500">Gender</Label>
                  <Select onValueChange={(val: any) => setEditFormData({...editFormData, gender: val})} value={(editFormData.gender as string) || ""}>
                    <SelectTrigger className="rounded-xl h-11">
                      <SelectValue placeholder="Select Gender" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-xs text-slate-500">Blood Group</Label>
                  <Input value={editFormData.bloodGroup} onChange={e => setEditFormData({...editFormData, bloodGroup: e.target.value})} placeholder="e.g. O+" className="rounded-xl h-11" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-xs text-slate-500">Religion</Label>
                  <Input value={editFormData.religion} onChange={e => setEditFormData({...editFormData, religion: e.target.value})} placeholder="e.g. Hindu" className="rounded-xl h-11" />
                </div>
              </div>
            </div>

            {/* Section 2: Contact & Address */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <h3 className="text-[10px] font-bold text-slate-900 dark:text-slate-200 tracking-widest">2. Contact & Address</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold text-xs text-slate-500">Phone Number</Label>
                  <Input value={editFormData.phone} onChange={e => setEditFormData({...editFormData, phone: e.target.value})} placeholder="+91 XXXXX XXXXX" className="rounded-xl h-11" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-xs text-slate-500">Whatsapp Number</Label>
                  <Input value={editFormData.whatsapp} onChange={e => setEditFormData({...editFormData, whatsapp: e.target.value})} placeholder="+91 XXXXX XXXXX" className="rounded-xl h-11" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="font-bold text-xs text-slate-500">Email Address</Label>
                  <Input type="email" value={editFormData.email} onChange={e => setEditFormData({...editFormData, email: e.target.value})} placeholder="student@example.com" className="rounded-xl h-11" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="font-bold text-xs text-slate-500">Full Address</Label>
                  <Input value={editFormData.address} onChange={e => setEditFormData({...editFormData, address: e.target.value})} placeholder="Village, P.O, P.S, Dist, Pin" className="rounded-xl h-11" />
                </div>
              </div>
            </div>

            {/* Section 3: Guardian & Academic */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <h3 className="text-[10px] font-bold text-slate-900 dark:text-slate-200 tracking-widest">3. Guardian & Academic</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold text-xs text-slate-500">Father's Name</Label>
                  <Input value={editFormData.fatherName} onChange={e => setEditFormData({...editFormData, fatherName: e.target.value})} placeholder="Father's Name" className="rounded-xl h-11" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-xs text-slate-500">Mother's Name</Label>
                  <Input value={editFormData.motherName} onChange={e => setEditFormData({...editFormData, motherName: e.target.value})} placeholder="Mother's Name" className="rounded-xl h-11" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-xs text-slate-500">Guardian Phone</Label>
                  <Input value={editFormData.guardianPhone} onChange={e => setEditFormData({...editFormData, guardianPhone: e.target.value})} placeholder="+91 XXXXX XXXXX" className="rounded-xl h-11" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-xs text-slate-500">Other Guardian Name</Label>
                  <Input value={editFormData.parentName} onChange={e => setEditFormData({...editFormData, parentName: e.target.value})} placeholder="Other Guardian Name" className="rounded-xl h-11" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="font-bold text-xs text-slate-500">Assign Batch</Label>
                  <Select value={(editFormData.batchId as string) || ""} onValueChange={(val: any) => setEditFormData({...editFormData, batchId: val})}>
                    <SelectTrigger className="rounded-xl h-11">
                      <SelectValue placeholder="Select a batch" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {batches.map(batch => (
                        <SelectItem key={batch.id} value={batch.id}>{batch.name}</SelectItem>
                      ))}
                      <SelectItem value="none">No Batch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Button type="submit" disabled={isSubmitting} className="w-full rounded-2xl font-bold py-7 text-lg shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all">
                {isSubmitting ? "Updating..." : "Save Changes"}
              </Button>
            </div>
          </form>
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
    </div>
  );
}


