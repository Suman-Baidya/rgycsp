"use client";

import React, { useState, useEffect } from "react";
import { 
  Building2, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  MapPin, 
  Laptop, 
  Users, 
  ArrowUpRight, 
  Trash2, 
  AlertCircle,
  FileText,
  Check,
  X,
  User,
  ExternalLink,
  Search,
  Plus,
  Filter,
  Globe,
  Settings,
  MoreVertical,
  Activity,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Layers,
  Shield,
  ShieldOff
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminPageHeader } from "@/components/layout/AdminPageHeader";
import { updateFranchiseApplicationStatus } from "@/app/actions/franchise";
import { createWorkspace, updateCenterConfig } from "@/app/actions/workspaces";
import { importWorkspacesCSV } from "@/app/actions/workspaces-import";
import Papa from "papaparse";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { getRootDomain } from "@/lib/domain";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface FranchiseApplicationsClientProps {
  initialApplications: any[];
  initialWorkspaces: any[];
}

export default function FranchiseApplicationsClient({ 
  initialApplications, 
  initialWorkspaces 
}: FranchiseApplicationsClientProps) {
  const [activeTab, setActiveTab] = useState<"centers" | "applications">("centers");
  const [mounted, setMounted] = useState(false);
  const [rootDomain, setRootDomain] = useState(process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000");
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    if (!process.env.NEXT_PUBLIC_ROOT_DOMAIN) {
      setRootDomain(getRootDomain());
    }
  }, []);

  // Workspace / Active Centers State
  const [searchWorkspace, setSearchWorkspace] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [wsCurrentPage, setWsCurrentPage] = useState(1);
  const [wsOpen, setWsOpen] = useState(false);
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [workspaceFormData, setWorkspaceFormData] = useState({
    name: "",
    subdomain: "",
    ownerName: "",
    ownerEmail: "",
    ownerPassword: "",
    contactPhone: "",
    primaryColor: "#3b82f6",
    brandDescription: ""
  });

  const wsItemsPerPage = 8;

  // Franchise Applications State
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);
  const [appCurrentPage, setAppCurrentPage] = useState(1);
  const appItemsPerPage = 10;
  
  // Application Approval states
  const [approveOpen, setApproveOpen] = useState<boolean>(false);
  const [customSubdomain, setCustomSubdomain] = useState<string>("");
  const [customStateCode, setCustomStateCode] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Application Rejection states
  const [rejectOpen, setRejectOpen] = useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string>("");

  // Edit Center Config State
  const [editConfigOpen, setEditConfigOpen] = useState(false);
  const [isUpdatingConfig, setIsUpdatingConfig] = useState(false);
  const [activeConfigTab, setActiveConfigTab] = useState<"general" | "owner" | "documents">("general");
  const [editConfigData, setEditConfigData] = useState<any>({
    workspaceId: "",
    name: "",
    subdomain: "",
    centerCode: "",
    ownerName: "",
    ownerEmail: "",
    contactPhone: "",
    address: "",
    logoUrl: "",
    signatureUrl: "",
    idProofUrl: ""
  });

  const handleOpenEditConfig = (ws: any) => {
    const adminUser = ws.roles?.[0]?.user;
    setEditConfigData({
      workspaceId: ws.id,
      name: ws.name,
      subdomain: ws.subdomain,
      centerCode: adminUser?.username || "",
      ownerName: adminUser?.name || "",
      ownerEmail: adminUser?.email || "",
      contactPhone: ws.siteSettings?.contactPhone || "",
      address: ws.siteSettings?.address || "",
      logoUrl: ws.logoUrl || "",
      signatureUrl: ws.signatureUrl || "",
      idProofUrl: ws.idProofUrl || ""
    });
    setActiveConfigTab("general");
    setEditConfigOpen(true);
  };

  const handleUpdateConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingConfig(true);
    try {
      const res = await updateCenterConfig(editConfigData.workspaceId, editConfigData);
      if (res.success) {
        toast.success("Center configuration updated successfully.");
        setEditConfigOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || "Update failed.");
      }
    } catch (err) {
      toast.error("Something went wrong updating center config.");
    } finally {
      setIsUpdatingConfig(false);
    }
  };

  // CSV Import State
  const [csvOpen, setCsvOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<any>(null);

  // Stats calculation
  const totalFranchises = initialWorkspaces.length;
  const activeFranchises = initialWorkspaces.filter(ws => ws.isActive !== false).length;
  
  // Filter applications logic
  const filteredApps = initialApplications.filter(app => {
    const matchesSearch = 
      app.centerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.username && app.username.toLowerCase().includes(searchTerm.toLowerCase()));

    if (filterStatus === "ALL") return matchesSearch;
    return app.status === filterStatus && matchesSearch;
  });

  const appTotalPages = Math.ceil(filteredApps.length / appItemsPerPage);
  const paginatedApps = filteredApps.slice((appCurrentPage - 1) * appItemsPerPage, appCurrentPage * appItemsPerPage);

  const pendingApplications = initialApplications.filter(a => a.status === "PENDING").length;
  const totalPlatformStudents = initialWorkspaces.reduce((acc, ws) => acc + (ws._count?.studentProfiles || 0), 0);

  // Filter workspaces logic
  const filteredWorkspaces = initialWorkspaces.filter(ws => {
    const searchLower = searchWorkspace.toLowerCase();
    const matchesSearch = 
      ws.name.toLowerCase().includes(searchLower) || 
      ws.subdomain.toLowerCase().includes(searchLower) ||
      ws.roles?.[0]?.user?.name?.toLowerCase().includes(searchLower) ||
      ws.roles?.[0]?.user?.email?.toLowerCase().includes(searchLower) ||
      ws.roles?.[0]?.user?.username?.toLowerCase().includes(searchLower);
    
    const wsStatus = ws.isActive !== false ? "active" : "inactive";
    const matchesStatus = statusFilter === "All" || wsStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Workspace pagination logic
  const wsTotalPages = Math.ceil(filteredWorkspaces.length / wsItemsPerPage);
  const paginatedWorkspaces = filteredWorkspaces.slice(
    (wsCurrentPage - 1) * wsItemsPerPage,
    wsCurrentPage * wsItemsPerPage
  );

  useEffect(() => {
    setWsCurrentPage(1);
  }, [searchWorkspace, statusFilter]);

  // Handle manual workspace provisioning
  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingWorkspace(true);
    const result = await createWorkspace(workspaceFormData);
    setIsCreatingWorkspace(false);

    if (result.success) {
      toast.success("Franchise center created successfully!");
      setWsOpen(false);
      router.refresh();
      setWorkspaceFormData({ 
        name: "", 
        subdomain: "", 
        ownerName: "", 
        ownerEmail: "", 
        ownerPassword: "",
        contactPhone: "",
        primaryColor: "#3b82f6",
        brandDescription: ""
      });
    } else {
      toast.error(result.error || "Failed to create center");
    }
  };



  const handleOpenDetails = (app: any) => {
    setSelectedApp(app);
    setDetailsOpen(true);
  };

  const handleOpenApprove = () => {
    if (!selectedApp) return;
    
    const stateName = selectedApp.state.trim().toLowerCase();
    let codeSuggestion = "WB";
    if (stateName.includes("bengal")) codeSuggestion = "WB";
    else if (stateName.includes("delhi")) codeSuggestion = "DL";
    else if (stateName.includes("bihar")) codeSuggestion = "BR";
    else if (stateName.includes("maharashtra")) codeSuggestion = "MH";
    else if (stateName.includes("assam")) codeSuggestion = "AS";
    else if (stateName.includes("uttar")) codeSuggestion = "UP";
    else {
      codeSuggestion = stateName.substring(0, 2).toUpperCase();
    }

    setCustomStateCode(codeSuggestion);
    setCustomSubdomain("");
    setApproveOpen(true);
  };

  const handleApproveConfirm = async () => {
    if (!selectedApp) return;
    setIsProcessing(true);
    try {
      const res = await updateFranchiseApplicationStatus(selectedApp.id, "APPROVED", {
        customStateCode: customStateCode.trim() || undefined,
        customSubdomain: customSubdomain.trim() || undefined
      });

      if (res.success) {
        toast.success(`Franchise approved! Code: ${res.username}, Subdomain: ${res.subdomain}`);
        setApproveOpen(false);
        setDetailsOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to approve application.");
      }
    } catch (err: any) {
      toast.error("Approval process failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!selectedApp) return;
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection.");
      return;
    }
    setIsProcessing(true);
    try {
      const res = await updateFranchiseApplicationStatus(selectedApp.id, "REJECTED", {
        rejectionReason: rejectionReason.trim()
      });

      if (res.success) {
        toast.success("Franchise application rejected.");
        setRejectOpen(false);
        setDetailsOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to reject application.");
      }
    } catch (err: any) {
      toast.error("Rejection failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  // CSV Import Handlers
  const handleDownloadTemplate = () => {
    const csvContent = "centerCode,name,subdomain,ownerName,ownerEmail,ownerPassword,contactPhone,primaryColor,brandDescription\nWB-123,Example Institute,example,Admin User,admin@example.com,password123,9876543210,#3b82f6,Welcome to Example Institute";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "franchises_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCsvFile(file);
      setIsParsing(true);
      
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setCsvData(results.data);
          setIsParsing(false);
          setImportResults(null);
        },
        error: (error: any) => {
          console.error("CSV Parse Error", error);
          toast.error("Failed to parse CSV file");
          setIsParsing(false);
        }
      });
    }
  };

  const handleImportCSV = async () => {
    if (!csvData || csvData.length === 0) {
      toast.error("No valid data to import");
      return;
    }
    
    setIsImporting(true);
    try {
      const result = await importWorkspacesCSV(csvData);
      setImportResults(result);
      if (result.success && result.summary.failure === 0) {
        toast.success(`Successfully imported ${result.summary.success} franchises!`);
      } else if (result.success) {
        toast.warning(`Imported ${result.summary.success} franchises with ${result.summary.failure} errors.`);
      } else {
        toast.error((result as any).error || "Import failed");
      }
      
      if (result.success && result.summary.success > 0) {
        router.refresh();
      }
    } catch (err) {
      toast.error("Something went wrong during import.");
    } finally {
      setIsImporting(false);
    }
  };

  const renderPagination = (borderClass: string) => {
    if (wsTotalPages <= 1) return null;
    return (
      <div className={cn("p-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/20 dark:bg-slate-800/10", borderClass)}>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Showing <span className="text-slate-900 dark:text-white">{((wsCurrentPage - 1) * wsItemsPerPage) + 1}</span> to <span className="text-slate-900 dark:text-white">{Math.min(wsCurrentPage * wsItemsPerPage, filteredWorkspaces.length)}</span> of <span className="text-slate-900 dark:text-white">{filteredWorkspaces.length}</span> centers
        </p>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            disabled={wsCurrentPage === 1}
            onClick={() => setWsCurrentPage(prev => prev - 1)}
            className="h-10 w-10 rounded-xl"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: wsTotalPages }).map((_, i) => (
              <Button
                key={i}
                variant={wsCurrentPage === i + 1 ? "default" : "ghost"}
                onClick={() => setWsCurrentPage(i + 1)}
                className={cn(
                  "h-10 w-10 rounded-xl font-bold",
                  wsCurrentPage === i + 1 ? "shadow-lg shadow-primary/20" : ""
                )}
              >
                {i + 1}
              </Button>
            ))}
          </div>

          <Button 
            variant="outline" 
            size="icon" 
            disabled={wsCurrentPage === wsTotalPages}
            onClick={() => setWsCurrentPage(prev => prev + 1)}
            className="h-10 w-10 rounded-xl"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  const renderAppPagination = (borderClass: string) => {
    if (appTotalPages <= 1) return null;
    return (
      <div className={cn("p-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/20 dark:bg-slate-800/10", borderClass)}>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Showing <span className="text-slate-900 dark:text-white">{((appCurrentPage - 1) * appItemsPerPage) + 1}</span> to <span className="text-slate-900 dark:text-white">{Math.min(appCurrentPage * appItemsPerPage, filteredApps.length)}</span> of <span className="text-slate-900 dark:text-white">{filteredApps.length}</span> applications
        </p>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            disabled={appCurrentPage === 1}
            onClick={() => setAppCurrentPage(prev => prev - 1)}
            className="h-10 w-10 rounded-xl"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: appTotalPages }).map((_, i) => (
              <Button
                key={i}
                variant={appCurrentPage === i + 1 ? "default" : "ghost"}
                onClick={() => setAppCurrentPage(i + 1)}
                className={cn(
                  "h-10 w-10 rounded-xl font-bold",
                  appCurrentPage === i + 1 ? "shadow-lg shadow-primary/20" : ""
                )}
              >
                {i + 1}
              </Button>
            ))}
          </div>

          <Button 
            variant="outline" 
            size="icon" 
            disabled={appCurrentPage === appTotalPages}
            onClick={() => setAppCurrentPage(prev => prev + 1)}
            className="h-10 w-10 rounded-xl"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  if (!mounted) return null;

  return (
    <div className="space-y-10 pb-12 w-full mx-auto">
      <AdminPageHeader 
        title="Franchise Management" 
        description="Monitor and manage active computer center workspaces and process online franchise requests."
      >
        <div className="flex gap-3">
          <Dialog open={csvOpen} onOpenChange={(open) => {
            if(!open) {
              setCsvFile(null);
              setCsvData([]);
              setImportResults(null);
            }
            setCsvOpen(open);
          }}>
            <DialogTrigger 
              render={
                <Button variant="outline" className="h-11 px-6 rounded-xl gap-2 font-bold shadow-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  <FileText className="h-4 w-4" />
                  Import CSV
                </Button>
              }
            />
            <DialogContent className="max-w-4xl rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <div className="p-8 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                      <FileText className="h-7 w-7 text-blue-500" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Bulk Import Franchises</h2>
                      <p className="text-slate-500 font-medium text-sm">Upload a CSV file to create multiple computer center workspaces at once.</p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={handleDownloadTemplate} className="gap-2 rounded-xl h-11 border-dashed border-2">
                    <FileText className="h-4 w-4" /> Download Template
                  </Button>
                </div>
              </div>
              
              <div className="p-8 space-y-6 max-h-[65vh] overflow-y-auto custom-scrollbar">
                {!csvFile ? (
                  <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-12 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <input 
                      type="file" 
                      accept=".csv" 
                      onChange={handleFileUpload} 
                      className="hidden" 
                      id="csv-upload" 
                    />
                    <label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                        <Plus className="h-8 w-8 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-base font-bold text-slate-900 dark:text-white">Click to upload CSV file</p>
                        <p className="text-xs text-slate-500 mt-1">Ensure headers match the template exactly.</p>
                      </div>
                    </label>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-green-500/10 rounded-xl flex items-center justify-center text-green-600">
                          <CheckCircle className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">{csvFile.name}</p>
                          <p className="text-xs text-slate-500">{csvData.length} rows detected</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => { setCsvFile(null); setCsvData([]); setImportResults(null); }} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10">
                        Remove
                      </Button>
                    </div>

                    {importResults && importResults.summary && (
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border">
                          <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">Total Processed</p>
                          <p className="text-2xl font-black">{importResults.summary.total}</p>
                        </div>
                        <div className="bg-green-500/10 p-4 rounded-2xl border border-green-500/20">
                          <p className="text-xs text-green-600 uppercase font-bold tracking-widest mb-1">Success</p>
                          <p className="text-2xl font-black text-green-700 dark:text-green-400">{importResults.summary.success}</p>
                        </div>
                        <div className="bg-red-500/10 p-4 rounded-2xl border border-red-500/20">
                          <p className="text-xs text-red-600 uppercase font-bold tracking-widest mb-1">Failed</p>
                          <p className="text-2xl font-black text-red-700 dark:text-red-400">{importResults.summary.failure}</p>
                        </div>
                      </div>
                    )}

                    {csvData.length > 0 && (
                      <div className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
                        <Table>
                          <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                            <TableRow>
                              <TableHead className="w-16">Row</TableHead>
                              <TableHead>Center Code</TableHead>
                              <TableHead>Institute Name</TableHead>
                              <TableHead>Subdomain</TableHead>
                              <TableHead>Owner Email</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {csvData.slice(0, 10).map((row, i) => {
                              const result = importResults?.results?.find((r: any) => r.row === i + 1);
                              return (
                                <TableRow key={i}>
                                  <TableCell className="font-medium text-slate-400">{i + 1}</TableCell>
                                  <TableCell className="font-bold">{row.centerCode || '-'}</TableCell>
                                  <TableCell className="font-bold">{row.name || '-'}</TableCell>
                                  <TableCell className="text-slate-500">{row.subdomain || '-'}</TableCell>
                                  <TableCell className="text-slate-500">{row.ownerEmail || '-'}</TableCell>
                                  <TableCell>
                                    {!importResults ? (
                                      <Badge variant="outline" className="text-slate-500">Ready</Badge>
                                    ) : result?.success ? (
                                      <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Imported</Badge>
                                    ) : (
                                      <div className="group relative flex items-center">
                                        <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Failed</Badge>
                                        <p className="text-[10px] text-red-500 ml-2 line-clamp-1 max-w-[200px]" title={result?.error}>{result?.error}</p>
                                      </div>
                                    )}
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                        {csvData.length > 10 && (
                          <div className="p-3 text-center bg-slate-50 dark:bg-slate-800/20 text-xs font-bold text-slate-500">
                            Showing first 10 rows of {csvData.length}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="p-6 border-t border-slate-50 dark:border-slate-800 flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  onClick={() => setCsvOpen(false)}
                  className="h-12 flex-1 rounded-xl font-bold"
                >
                  Close
                </Button>
                <Button 
                  onClick={handleImportCSV}
                  disabled={!csvData.length || isImporting || isParsing || !!importResults}
                  className="h-12 flex-[2] rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 font-bold"
                >
                  {isImporting ? "Processing Import..." : importResults ? "Import Complete" : "Import All Franchises"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={wsOpen} onOpenChange={setWsOpen}>
            <DialogTrigger 
              render={
                <Button className="h-11 px-6 rounded-xl gap-2 shadow-lg shadow-primary/20 bg-primary font-bold text-primary-foreground hover:scale-[1.02] active:scale-95 transition-all">
                  <Plus className="h-4 w-4" />
                  Provision Center
                </Button>
              }
            />
              <DialogContent className="max-w-2xl rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <div className="p-8 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                      <Building2 className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Provision New Center</h2>
                      <p className="text-slate-500 font-medium text-sm">Initialize a dedicated workspace instance for a franchise computer center.</p>
                    </div>
                  </div>
                </div>
                
                <form onSubmit={handleCreateWorkspace} className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                  {/* Identity */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Institutional Identity</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 ml-1">Institute Name</Label>
                        <Input 
                          required
                          placeholder="e.g. Zenith Academy"
                          className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-medium focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
                          value={workspaceFormData.name}
                          onChange={(e) => setWorkspaceFormData({ ...workspaceFormData, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 ml-1">Subdomain</Label>
                        <div className="relative">
                          <Input 
                            required
                            placeholder="zenith"
                            className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-medium pr-32 focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
                            value={workspaceFormData.subdomain}
                            onChange={(e) => setWorkspaceFormData({ ...workspaceFormData, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase">.{rootDomain}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 ml-1">Brief Description</Label>
                      <Input 
                        placeholder="Short summary of the center..."
                        className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-medium focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
                        value={workspaceFormData.brandDescription}
                        onChange={(e) => setWorkspaceFormData({ ...workspaceFormData, brandDescription: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

                  {/* Master Admin */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                      <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Master Administrator</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 ml-1">Admin Name</Label>
                        <Input 
                          required
                          placeholder="Full Name"
                          className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-medium focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
                          value={workspaceFormData.ownerName}
                          onChange={(e) => setWorkspaceFormData({ ...workspaceFormData, ownerName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 ml-1">Login Email</Label>
                        <Input 
                          required
                          type="email"
                          placeholder="admin@institute.edu"
                          className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-medium focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
                          value={workspaceFormData.ownerEmail}
                          onChange={(e) => setWorkspaceFormData({ ...workspaceFormData, ownerEmail: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 ml-1">Initial Password</Label>
                        <Input 
                          required
                          type="password"
                          placeholder="••••••••"
                          className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-medium focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
                          value={workspaceFormData.ownerPassword}
                          onChange={(e) => setWorkspaceFormData({ ...workspaceFormData, ownerPassword: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 ml-1">Contact Phone</Label>
                        <Input 
                          placeholder="+91 XXXXX XXXXX"
                          className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-medium focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
                          value={workspaceFormData.contactPhone}
                          onChange={(e) => setWorkspaceFormData({ ...workspaceFormData, contactPhone: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

                  {/* Theme */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Branding & Theme</h3>
                    </div>
                    
                    <div className="flex items-center gap-6 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <div className="space-y-2 flex-1">
                        <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 ml-1">Primary Color</Label>
                        <div className="flex items-center gap-4">
                          <input 
                            type="color"
                            className="h-10 w-10 rounded-lg border-none bg-transparent cursor-pointer"
                            value={workspaceFormData.primaryColor}
                            onChange={(e) => setWorkspaceFormData({ ...workspaceFormData, primaryColor: e.target.value })}
                          />
                          <Input 
                            value={workspaceFormData.primaryColor}
                            onChange={(e) => setWorkspaceFormData({ ...workspaceFormData, primaryColor: e.target.value })}
                            className="h-10 flex-1 rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-mono text-sm uppercase"
                          />
                        </div>
                      </div>
                      <p className="flex-1 text-[10px] font-medium text-slate-400 leading-relaxed italic">
                        * Theme color automatically configures the franchise layout.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 pt-4">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={() => setWsOpen(false)}
                      className="h-12 flex-1 rounded-xl font-bold"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isCreatingWorkspace}
                      className="h-12 flex-[1.5] rounded-xl bg-primary font-bold text-primary-foreground shadow-lg shadow-primary/15"
                    >
                      {isCreatingWorkspace ? "Provisioning..." : "Provision Center"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

          <Dialog open={editConfigOpen} onOpenChange={setEditConfigOpen}>
            <DialogContent className="max-w-3xl rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <div className="p-8 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                    <Settings className="h-7 w-7 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Center Configuration</h2>
                    <p className="text-slate-500 font-medium text-sm">Update identity, owner details, and documents for this franchise.</p>
                  </div>
                </div>
              </div>
              
              <div className="flex border-b border-slate-100 dark:border-slate-800">
                {(["general", "owner", "documents"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveConfigTab(tab)}
                    className={cn(
                      "flex-1 py-4 text-sm font-bold capitalize transition-colors border-b-2",
                      activeConfigTab === tab
                        ? "border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-500/5"
                        : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <form onSubmit={handleUpdateConfig} className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {activeConfigTab === "general" && (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-slate-600 ml-1">Institute Name</Label>
                      <Input
                        value={editConfigData.name}
                        onChange={(e) => setEditConfigData({ ...editConfigData, name: e.target.value })}
                        className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 px-4"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-slate-600 ml-1">Subdomain</Label>
                      <div className="flex items-center">
                        <Input
                          value={editConfigData.subdomain}
                          onChange={(e) => setEditConfigData({ ...editConfigData, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "") })}
                          className="h-12 rounded-l-xl rounded-r-none bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 px-4 text-right pr-1"
                          required
                        />
                        <div className="h-12 px-4 flex items-center bg-slate-100 dark:bg-slate-800 border-y border-r border-slate-200 dark:border-slate-700 rounded-r-xl text-slate-500 text-sm font-bold">
                          .{rootDomain}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-slate-600 ml-1">Contact Phone</Label>
                      <Input
                        value={editConfigData.contactPhone}
                        onChange={(e) => setEditConfigData({ ...editConfigData, contactPhone: e.target.value })}
                        className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 px-4"
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label className="text-xs font-semibold text-slate-600 ml-1">Address</Label>
                      <Input
                        value={editConfigData.address}
                        onChange={(e) => setEditConfigData({ ...editConfigData, address: e.target.value })}
                        className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 px-4"
                      />
                    </div>
                  </div>
                )}

                {activeConfigTab === "owner" && (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2 col-span-2">
                      <Label className="text-xs font-semibold text-slate-600 ml-1">Center Code / App No. (e.g., WB-001)</Label>
                      <Input
                        value={editConfigData.centerCode}
                        onChange={(e) => setEditConfigData({ ...editConfigData, centerCode: e.target.value })}
                        className="h-12 rounded-xl bg-blue-50/50 dark:bg-blue-500/10 border-blue-500/20 px-4 font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400"
                        required
                        placeholder="WB-001"
                      />
                      <p className="text-[10px] text-slate-500 ml-2">This is used as the unique identifier and admin username.</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-slate-600 ml-1">Owner Name</Label>
                      <Input
                        value={editConfigData.ownerName}
                        onChange={(e) => setEditConfigData({ ...editConfigData, ownerName: e.target.value })}
                        className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 px-4"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-slate-600 ml-1">Owner Email</Label>
                      <Input
                        type="email"
                        value={editConfigData.ownerEmail}
                        onChange={(e) => setEditConfigData({ ...editConfigData, ownerEmail: e.target.value })}
                        className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 px-4"
                        required
                      />
                    </div>
                  </div>
                )}

                {activeConfigTab === "documents" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ImageUpload 
                      value={editConfigData.logoUrl} 
                      onChange={(url) => setEditConfigData({ ...editConfigData, logoUrl: url })} 
                      label="Institute Logo" 
                      folder={`RGYCSP/Workspaces/${editConfigData.subdomain}`} 
                    />
                    <ImageUpload 
                      value={editConfigData.signatureUrl} 
                      onChange={(url) => setEditConfigData({ ...editConfigData, signatureUrl: url })} 
                      label="Owner Signature" 
                      folder={`RGYCSP/Workspaces/${editConfigData.subdomain}`} 
                    />
                    <ImageUpload 
                      value={editConfigData.idProofUrl} 
                      onChange={(url) => setEditConfigData({ ...editConfigData, idProofUrl: url })} 
                      label="ID Proof" 
                      folder={`RGYCSP/Workspaces/${editConfigData.subdomain}`} 
                    />
                  </div>
                )}

                <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                  <Button 
                    type="button"
                    variant="ghost" 
                    onClick={() => setEditConfigOpen(false)}
                    className="h-12 flex-1 rounded-xl font-bold"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isUpdatingConfig}
                    className="h-12 flex-[2] rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 font-bold"
                  >
                    {isUpdatingConfig ? "Saving Changes..." : "Save Configuration"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </AdminPageHeader>

      {/* Sync platform statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Franchises", value: totalFranchises, icon: Building2, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Active Centers", value: activeFranchises, icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" },
          { label: "Pending Applications", value: pendingApplications, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Platform Students", value: totalPlatformStudents, icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
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

      {/* Tabs */}
      <div className="flex items-center justify-start mt-2">
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/50 w-fit">
          <button
            onClick={() => setActiveTab("centers")}
            className={cn(
              "px-5 py-2 rounded-lg text-sm font-bold transition-all",
              activeTab === "centers"
                ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            Active Centers
          </button>
          <button
            onClick={() => setActiveTab("applications")}
            className={cn(
              "px-5 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
              activeTab === "applications"
                ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            Applications
            {pendingApplications > 0 && (
              <span className="h-5 min-w-5 px-1.5 bg-amber-500 text-white text-[10px] font-black rounded flex items-center justify-center">
                {pendingApplications}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* TABS WORKSPACE vs APPLICATION */}
      {activeTab === "centers" ? (
        /* ACTIVE FRANCHISE CENTERS TAB CONTENT */
        <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden transition-all duration-500">
          <CardHeader className="p-8 border-b border-slate-50 dark:border-slate-800/50">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
              <div className="relative w-full max-w-[450px] group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <Input 
                  placeholder="Search by center code, institute, domain or owner..." 
                  value={searchWorkspace}
                  onChange={(e) => setSearchWorkspace(e.target.value)}
                  className="pl-11 pr-4 bg-slate-50 dark:bg-slate-800/40 border-none rounded-2xl h-14 font-bold text-sm transition-all focus-visible:ring-2 focus-visible:ring-primary/20 placeholder:text-slate-400 placeholder:font-medium" 
                />
              </div>
              
              <div className="flex flex-wrap items-center gap-4">
                <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val as string)}>
                  <SelectTrigger className="w-[180px] h-14 rounded-2xl border-none bg-slate-50 dark:bg-slate-800/40 font-bold px-5 focus:ring-primary/20">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-slate-400" />
                      <SelectValue placeholder="Status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-2xl p-2 bg-white dark:bg-slate-800">
                    <SelectItem value="All" className="rounded-xl font-bold py-3">All Centers</SelectItem>
                    <SelectItem value="active" className="rounded-xl font-bold py-3">Active Only</SelectItem>
                    <SelectItem value="inactive" className="rounded-xl font-bold py-3">Inactive Only</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/40 px-5 py-3.5 rounded-2xl h-14">
                  <Activity className="h-4 w-4 text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Total: <span className="text-slate-900 dark:text-white">{filteredWorkspaces.length}</span>
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>

          {renderPagination("border-b border-slate-50 dark:border-slate-800/50")}

          <CardContent className="p-0 overflow-x-auto custom-scrollbar">
            <Table>
              <TableHeader className="bg-slate-50/30 dark:bg-slate-800/20">
                <TableRow className="border-b border-slate-50 dark:border-slate-800 hover:bg-transparent">
                  <TableHead className="w-[300px] px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Center Identity</TableHead>
                  <TableHead className="py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Center Code</TableHead>
                  <TableHead className="w-[250px] py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Owner Details</TableHead>
                  <TableHead className="py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Capacity</TableHead>
                  <TableHead className="py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Created At</TableHead>
                  <TableHead className="text-right py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 px-8">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedWorkspaces.length > 0 ? (
                  paginatedWorkspaces.map((ws: any) => {
                    const owner = ws.roles?.[0]?.user;
                    const isActive = ws.isActive !== false;
                    
                    return (
                      <TableRow key={ws.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all border-b border-slate-50 dark:border-slate-800 last:border-none">
                        <TableCell className="px-8 py-6">
                          <div className="flex items-center gap-5">
                            <div className="relative">
                              <Avatar className="h-14 w-14 shadow rounded-2xl group-hover:scale-105 transition-transform duration-500">
                                <AvatarImage src={ws.logoUrl} />
                                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl rounded-2xl">
                                  {ws.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className={cn(
                                "absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white dark:border-slate-900",
                                isActive ? "bg-green-500" : "bg-red-500"
                              )}></div>
                            </div>
                            <div className="flex flex-col gap-1 overflow-hidden">
                              <span className="font-bold text-base text-slate-900 dark:text-white leading-tight truncate max-w-[220px]" title={ws.name}>{ws.name}</span>
                              <div className="flex items-center gap-2">
                                <Globe className="h-3 w-3 text-slate-400 shrink-0" />
                                <span className="text-xs font-bold text-slate-500 tracking-tight truncate max-w-[220px]" title={`${ws.subdomain}.${rootDomain}`}>
                                  {ws.subdomain}.{rootDomain}
                                </span>
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge variant="outline" className="text-xs font-bold px-3 py-1 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {owner?.username || "N/A"}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-4">
                            <Avatar className="h-10 w-10 border shrink-0">
                              <AvatarImage src={owner?.image} />
                              <AvatarFallback className="bg-slate-100 text-slate-400 font-bold text-xs">
                                {owner?.name?.charAt(0) || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col overflow-hidden">
                              <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate max-w-[180px]" title={owner?.name || "Unassigned"}>{owner?.name || "Unassigned"}</span>
                              <span className="text-xs font-medium text-slate-400 lowercase truncate max-w-[180px]" title={owner?.email || "n/a"}>{owner?.email || "n/a"}</span>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-500/5 text-blue-600 border border-blue-500/10 w-fit">
                            <Users className="h-3.5 w-3.5" />
                            <span className="text-xs font-bold">{ws._count?.studentProfiles || 0} Students</span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-col gap-0.5 text-slate-500 dark:text-slate-400">
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                              {new Date(ws.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                            <span className="text-[10px] font-medium">
                              {new Date(ws.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="text-right px-8">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-10 w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                              onClick={() => {
                                const protocol = window.location.protocol;
                                const url = `${protocol}//${ws.subdomain}.${rootDomain}`;
                                window.open(url, "_blank");
                              }}
                            >
                              <ExternalLink className="h-4 w-4 text-slate-400" />
                            </Button>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger 
                                render={
                                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                                    <MoreVertical className="h-4 w-4 text-slate-400" />
                                  </Button>
                                }
                              />
                              <DropdownMenuContent align="end" className="w-[240px] rounded-2xl border-none shadow-2xl p-2 bg-white dark:bg-slate-900">
                                <DropdownMenuLabel className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Administrative Tools</DropdownMenuLabel>
                                <DropdownMenuItem 
                                  className="gap-3 rounded-xl py-3 font-bold cursor-pointer"
                                  onClick={() => {
                                    const protocol = window.location.protocol;
                                    const url = `${protocol}//${ws.subdomain}.${rootDomain}/admin`;
                                    window.open(url, "_blank");
                                  }}
                                >
                                  <ExternalLink className="h-4 w-4 text-slate-400" /> Open Center Admin
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-3 rounded-xl py-3 font-bold cursor-pointer">
                                  <Activity className="h-4 w-4 text-slate-400" /> Analytics Report
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="gap-3 rounded-xl py-3 font-bold cursor-pointer"
                                  onClick={() => handleOpenEditConfig(ws)}
                                >
                                  <Settings className="h-4 w-4 text-slate-400" /> Center Config
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="my-2 bg-slate-50 dark:bg-slate-800" />
                                <DropdownMenuItem className={cn(
                                  "gap-3 rounded-xl py-3 font-bold cursor-pointer",
                                  isActive ? "text-amber-600 bg-amber-500/5" : "text-green-600 bg-green-500/5"
                                )}>
                                  {isActive ? (
                                    <><ShieldOff className="h-4 w-4" /> Suspend Instance</>
                                  ) : (
                                    <><Shield className="h-4 w-4" /> Re-Activate System</>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="my-2 bg-slate-50 dark:bg-slate-800" />
                                <DropdownMenuItem className="gap-3 rounded-xl py-3 font-bold cursor-pointer text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10">
                                  <Trash2 className="h-4 w-4" /> Terminate Data
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-[300px] text-center py-20 text-muted-foreground font-bold">
                      No active computer centers found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>

          {/* Pagination Footer */}
          {renderPagination("border-t border-slate-50 dark:border-slate-800/50")}
        </Card>
      ) : (
        /* FRANCHISE REGISTRATION APPLICATIONS TAB CONTENT */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search center, director, code..." 
                className="pl-11 pr-4 bg-slate-50 dark:bg-slate-800/40 border-none rounded-2xl h-14 font-bold text-sm transition-all focus-visible:ring-2 focus-visible:ring-primary/20 placeholder:text-slate-400 placeholder:font-medium" 
              />
            </div>

            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border">
              {["ALL", "PENDING", "APPROVED", "REJECTED"].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    filterStatus === status
                      ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden transition-all duration-500">
            {renderAppPagination("border-b border-slate-50 dark:border-slate-800/50")}
            <CardContent className="p-0 overflow-x-auto custom-scrollbar">
              <Table>
                <TableHeader className="bg-slate-50/30 dark:bg-slate-800/20">
                  <TableRow className="border-b border-slate-50 dark:border-slate-800 hover:bg-transparent">
                    <TableHead className="w-[250px] px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Center Name</TableHead>
                    <TableHead className="w-[200px] py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Owner</TableHead>
                    <TableHead className="w-[150px] py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Location</TableHead>
                    <TableHead className="w-[180px] py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Contact</TableHead>
                    <TableHead className="w-[150px] py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Timing</TableHead>
                    <TableHead className="w-[120px] py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Status</TableHead>
                    <TableHead className="text-right py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 px-8">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedApps.map((app: any) => (
                    <TableRow key={app.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all border-b border-slate-50 dark:border-slate-800 last:border-none">
                      <TableCell className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]" title={app.centerName}>{app.centerName}</span>
                          {app.username ? (
                            <span className="text-[10px] text-primary font-black uppercase tracking-wider">{app.username}</span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-medium">No Code</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-sm truncate max-w-[150px] block" title={app.fullName}>{app.fullName}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-xs">
                          <span className="truncate max-w-[120px]" title={app.district}>{app.district}</span>
                          <span className="text-[10px] text-muted-foreground truncate max-w-[120px]" title={app.state}>{app.state}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-xs">
                          <span className="font-medium">{app.mobile}</span>
                          <span className="text-[10px] text-muted-foreground truncate max-w-[150px]" title={app.email}>{app.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-xs">
                          <span className="font-bold">{new Date(app.createdAt).toLocaleDateString('en-GB')}</span>
                          <span className="text-[10px] text-muted-foreground">{new Date(app.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {app.status === "PENDING" && <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 font-bold uppercase text-[9px]"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>}
                        {app.status === "APPROVED" && <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold uppercase text-[9px]"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>}
                        {app.status === "REJECTED" && <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20 font-bold uppercase text-[9px]"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>}
                      </TableCell>
                      <TableCell className="text-right px-8">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            onClick={() => handleOpenDetails(app)}
                            variant="ghost" 
                            size="icon" 
                            className="h-10 w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Eye className="w-5 h-5 text-slate-400" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-10 w-10 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors group/delete"
                          >
                            <Trash2 className="w-4 h-4 text-slate-400 group-hover/delete:text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}

                {paginatedApps.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-[300px] text-center">
                      <div className="flex flex-col items-center justify-center gap-4 text-slate-400">
                        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem]">
                          <AlertCircle className="h-12 w-12 opacity-20" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-bold text-lg text-slate-600 dark:text-slate-400">No Applications Found</p>
                          <p className="text-xs font-medium uppercase tracking-widest">Adjust your search or filters to see more results</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            </CardContent>
            {renderAppPagination("border-t border-slate-50 dark:border-slate-800/50")}
          </Card>
        </div>
      )}

      {/* Details View Application Dialog */}
      {selectedApp && (
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-900">
            <DialogHeader className="bg-slate-950 p-6 sm:p-8 text-white shrink-0 relative">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pr-6">
                <div className="space-y-1">
                  <DialogTitle className="font-bold text-xl sm:text-2xl leading-tight text-white">{selectedApp.centerName}</DialogTitle>
                  <DialogDescription className="text-slate-400 text-sm">
                    Franchise Application review portal
                  </DialogDescription>
                </div>
                <Badge className={cn("border-none font-black text-[10px] tracking-wider uppercase px-4 py-1.5", 
                  selectedApp.status === "APPROVED" ? "bg-emerald-500 text-white" : 
                  selectedApp.status === "REJECTED" ? "bg-red-500 text-white" : 
                  "bg-amber-500 text-white"
                )}>
                  {selectedApp.status}
                </Badge>
              </div>
            </DialogHeader>

            <div className="p-6 sm:p-8 flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30 dark:bg-slate-950/20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Director Profile */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border shadow-sm space-y-5">
                  <div className="flex items-center gap-3 border-b pb-3 border-slate-100 dark:border-slate-800">
                    <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                      <User className="h-4 w-4" />
                    </div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Director Profile</h4>
                  </div>
                  <div className="space-y-4 text-sm">
                    <div className="flex flex-col"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</span> <span className="font-bold text-slate-900 dark:text-white truncate" title={selectedApp.fullName}>{selectedApp.fullName}</span></div>
                    <div className="flex flex-col"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date of Birth</span> <span className="font-bold text-slate-900 dark:text-white" suppressHydrationWarning>{new Date(selectedApp.dob).toLocaleDateString('en-GB')}</span></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mobile</span> <span className="font-bold text-slate-900 dark:text-white">{selectedApp.mobile}</span></div>
                      <div className="flex flex-col"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">WhatsApp</span> <span className="font-bold text-slate-900 dark:text-white">{selectedApp.whatsapp || "N/A"}</span></div>
                    </div>
                    <div className="flex flex-col"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</span> <span className="font-bold text-slate-900 dark:text-white truncate" title={selectedApp.email}>{selectedApp.email}</span></div>
                  </div>
                </div>

                {/* Center Location */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border shadow-sm space-y-5">
                  <div className="flex items-center gap-3 border-b pb-3 border-slate-100 dark:border-slate-800">
                    <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-600">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Center Location</h4>
                  </div>
                  <div className="space-y-4 text-sm">
                    <div className="flex flex-col"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Center Name</span> <span className="font-bold text-slate-900 dark:text-white truncate" title={selectedApp.centerName}>{selectedApp.centerName}</span></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">State</span> <span className="font-bold text-slate-900 dark:text-white truncate" title={selectedApp.state}>{selectedApp.state}</span></div>
                      <div className="flex flex-col"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">District</span> <span className="font-bold text-slate-900 dark:text-white truncate" title={selectedApp.district}>{selectedApp.district}</span></div>
                    </div>
                    <div className="flex flex-col"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pin Code</span> <span className="font-bold text-slate-900 dark:text-white">{selectedApp.pinCode}</span></div>
                    <div className="flex flex-col"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Address</span> <span className="font-bold text-slate-900 dark:text-white truncate" title={selectedApp.addressDetail}>{selectedApp.addressDetail}</span></div>
                  </div>
                </div>
              </div>

              {/* Infrastructure */}
              <div className="mt-8 bg-white dark:bg-slate-900 rounded-3xl p-6 border shadow-sm space-y-5">
                <div className="flex items-center gap-3 border-b pb-3 border-slate-100 dark:border-slate-800">
                  <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-600">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Infrastructure Details</h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Computers</p>
                    <p className="text-2xl font-black mt-1 text-slate-800 dark:text-slate-100">{selectedApp.computerCount}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Teachers</p>
                    <p className="text-2xl font-black mt-1 text-slate-800 dark:text-slate-100">{selectedApp.teacherCount}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rooms</p>
                    <p className="text-2xl font-black mt-1 text-slate-800 dark:text-slate-100">{selectedApp.roomCount || "N/A"}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Space (Sq Ft)</p>
                    <p className="text-2xl font-black mt-1 text-slate-800 dark:text-slate-100">{selectedApp.spaceSqFt || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Document Previews */}
              <div className="mt-8 bg-white dark:bg-slate-900 rounded-3xl p-6 border shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b pb-4 border-slate-100 dark:border-slate-800">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Document Previews</h4>
                    <span className="text-[10px] text-slate-500 font-medium">Verify the submitted credentials</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="space-y-3 group/card">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest block text-center">Profile Photo</span>
                    <div className="h-48 w-full rounded-2xl border border-slate-200 dark:border-slate-700 shadow-inner overflow-hidden bg-slate-50/80 dark:bg-slate-800/80 flex items-center justify-center relative group transition-all duration-300 hover:shadow-lg hover:border-emerald-500/30">
                      {selectedApp.photoUrl ? (
                        <>
                          <img src={selectedApp.photoUrl} alt="Photo" className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105" />
                          <a href={selectedApp.photoUrl} target="_blank" className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center text-white font-bold gap-2 backdrop-blur-[2px]">
                            <div className="bg-white/20 p-3 rounded-full flex items-center gap-2 hover:bg-white/30 transition-colors">
                              <ExternalLink className="w-5 h-5" /> <span>View Full</span>
                            </div>
                          </a>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-2 opacity-50">
                          <FileText className="w-8 h-8 text-slate-400" />
                          <span className="text-xs font-bold text-slate-400">Not uploaded</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 group/card">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest block text-center">Signature Specimen</span>
                    <div className="h-48 w-full rounded-2xl border border-slate-200 dark:border-slate-700 shadow-inner overflow-hidden bg-slate-50/80 dark:bg-slate-800/80 flex items-center justify-center relative group transition-all duration-300 hover:shadow-lg hover:border-emerald-500/30">
                      {selectedApp.signatureUrl ? (
                        <>
                          <img src={selectedApp.signatureUrl} alt="Signature" className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105" />
                          <a href={selectedApp.signatureUrl} target="_blank" className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center text-white font-bold gap-2 backdrop-blur-[2px]">
                            <div className="bg-white/20 p-3 rounded-full flex items-center gap-2 hover:bg-white/30 transition-colors">
                              <ExternalLink className="w-5 h-5" /> <span>View Full</span>
                            </div>
                          </a>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-2 opacity-50">
                          <FileText className="w-8 h-8 text-slate-400" />
                          <span className="text-xs font-bold text-slate-400">Not uploaded</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 group/card">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest block text-center">ID Proof Document</span>
                    <div className="h-48 w-full rounded-2xl border border-slate-200 dark:border-slate-700 shadow-inner overflow-hidden bg-slate-50/80 dark:bg-slate-800/80 flex items-center justify-center relative group transition-all duration-300 hover:shadow-lg hover:border-emerald-500/30">
                      {selectedApp.idProofUrl ? (
                        <>
                          <img src={selectedApp.idProofUrl} alt="ID Proof" className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105" />
                          <a href={selectedApp.idProofUrl} target="_blank" className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center text-white font-bold gap-2 backdrop-blur-[2px]">
                            <div className="bg-white/20 p-3 rounded-full flex items-center gap-2 hover:bg-white/30 transition-colors">
                              <ExternalLink className="w-5 h-5" /> <span>View Full</span>
                            </div>
                          </a>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-2 opacity-50">
                          <FileText className="w-8 h-8 text-slate-400" />
                          <span className="text-xs font-bold text-slate-400">Not uploaded</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="bg-slate-50 dark:bg-slate-800/40 p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-center sm:justify-center sm:items-center gap-3 sm:space-x-0 border-t border-slate-200 dark:border-slate-700 shrink-0 w-full">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
                <Button 
                  onClick={() => setDetailsOpen(false)}
                  variant="outline" 
                  className="rounded-xl font-bold h-11 px-6 border-2 w-full sm:w-auto"
                >
                  Close
                </Button>

                {selectedApp.status === "PENDING" && (
                  <>
                    <Button 
                      onClick={() => setRejectOpen(true)}
                      variant="destructive" 
                      className="rounded-xl font-bold h-11 gap-1.5 px-6 w-full sm:w-auto"
                    >
                      <X className="w-4 h-4" /> Reject Request
                    </Button>
                    <Button 
                      onClick={handleOpenApprove}
                      className="rounded-xl font-bold h-11 gap-1.5 px-6 shadow-lg shadow-primary/20 w-full sm:w-auto"
                    >
                      <Check className="w-4 h-4" /> Approve Application
                    </Button>
                  </>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Approve Confirm Dialog */}
      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6 bg-white dark:bg-slate-900 border-none">
          <DialogHeader className="mb-4">
            <DialogTitle className="font-bold text-lg">Approve Franchise Center</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Verify credentials settings and set the active domain subdomain details.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="font-bold text-xs text-slate-500">Suggested State Prefix Code</Label>
              <Input 
                value={customStateCode}
                onChange={(e) => setCustomStateCode(e.target.value.toUpperCase())}
                placeholder="e.g. WB" 
                maxLength={3}
                className="rounded-xl font-bold"
              />
            </div>
            
            <div className="space-y-1.5">
              <Label className="font-bold text-xs text-slate-500">Custom Subdomain (Optional)</Label>
              <Input 
                value={customSubdomain}
                onChange={(e) => setCustomSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                placeholder="Leave blank to use lowercased generated username" 
                className="rounded-xl"
              />
            </div>
          </div>

          <DialogFooter className="mt-6 flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setApproveOpen(false)}
              className="rounded-xl font-bold"
            >
              Cancel
            </Button>
            <Button 
              disabled={isProcessing}
              onClick={handleApproveConfirm}
              className="rounded-xl font-bold shadow-lg shadow-primary/20"
            >
              {isProcessing ? "Approving..." : "Confirm Affiliation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Reason Dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6 bg-white dark:bg-slate-900 border-none">
          <DialogHeader className="mb-4">
            <DialogTitle className="font-bold text-lg">Reject Franchise Request</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Provide feedback detailing the application shortcomings.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <Label className="font-bold text-xs text-slate-500">Rejection Reason</Label>
            <textarea 
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Provide clear reasons (e.g., Computer lab count insufficient)."
              className="w-full min-h-[100px] border border-input focus:border-primary outline-none text-xs p-3 rounded-xl bg-background font-medium"
            />
          </div>

          <DialogFooter className="mt-6 flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setRejectOpen(false)}
              className="rounded-xl font-bold"
            >
              Cancel
            </Button>
            <Button 
              disabled={isProcessing}
              variant="destructive"
              onClick={handleRejectConfirm}
              className="rounded-xl font-bold"
            >
              {isProcessing ? "Processing..." : "Reject Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
