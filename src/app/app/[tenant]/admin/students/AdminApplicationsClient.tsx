"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  MoreHorizontal, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Search,
  Filter,
  FileText,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { updateApplicationStatus } from "@/app/actions/admission";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import Image from "next/image";
import { ApplicationDetailsModal } from "./ApplicationDetailsModal";

export function AdminApplicationsClient({ workspaceId, initialData, batches = [] }: any) {
  const [data, setData] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("PENDING");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  
  // Modal states
  const [actionApp, setActionApp] = useState<any>(null);
  const [actionType, setActionType] = useState<"APPROVE" | "REJECT" | null>(null);
  const [reason, setReason] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const itemsPerPage = 10;
  
  const params = useParams();
  const pathname = usePathname();
  
  const getTenant = () => {
    if (params?.tenant) return params.tenant as string;
    if (pathname.startsWith('/app/')) return pathname.split('/')[2];
    return "";
  };

  const tenant = getTenant();
  const isSubdirectoryMode = pathname.startsWith('/app/');
  const workspaceBase = isSubdirectoryMode ? `/app/${tenant}` : '';
  const adminBase = `${workspaceBase}/admin/students`;

  const filteredData = data.filter((app: any) => 
    (statusFilter === "ALL" || app.status === statusFilter) && (
      app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicationNo.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );


  const handleStatusUpdate = async () => {
    if (!actionApp || !actionType) return;
    
    if (actionType === "REJECT" && !reason.trim()) {
      toast.error("Please provide a rejection reason.");
      return;
    }

    if (actionType === "APPROVE" && !selectedBatchId) {
      toast.error("Please select a batch.");
      return;
    }

    setIsProcessing(true);
    const status = actionType === "APPROVE" ? "APPROVED" : "REJECTED";

    try {
      const res = await updateApplicationStatus(actionApp.id, status, reason, selectedBatchId);
      if (res.success) {
        toast.success(`Application ${status.toLowerCase()} successfully`);
        // Remove from list if approved (since they move to unregistered) or update it
        if (status === "APPROVED") {
          setData(data.filter((a: any) => a.id !== actionApp.id));
        } else {
          setData(data.map((a: any) => a.id === actionApp.id ? { ...a, status, rejectionReason: reason } : a));
        }
        setActionApp(null);
        setActionType(null);
        setReason("");
        setSelectedBatchId("");
      } else {
        toast.error(res.error || "Failed to update status");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setIsProcessing(false);
    }
  };
  
  const totalApps = data.length;
  const pendingApps = data.filter((a: any) => a.status === "PENDING").length;
  const approvedApps = data.filter((a: any) => a.status === "APPROVED").length;
  const rejectedApps = data.filter((a: any) => a.status === "REJECTED").length;

  return (
    <div className="space-y-6">
      {/* Interactive Stats Summary Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button 
          onClick={() => { setStatusFilter("ALL"); setCurrentPage(1); }}
          className={cn(
            "text-left bg-white dark:bg-slate-900 border p-5 rounded-2xl shadow-sm flex items-center justify-between transition-all hover:-translate-y-0.5",
            statusFilter === "ALL" ? "border-blue-500 ring-2 ring-blue-500/20" : "border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900/50"
          )}
        >
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Apps</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{totalApps}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
            <FileText className="w-5 h-5" />
          </div>
        </button>
        
        <button 
          onClick={() => { setStatusFilter("PENDING"); setCurrentPage(1); }}
          className={cn(
            "text-left bg-white dark:bg-slate-900 border p-5 rounded-2xl shadow-sm flex items-center justify-between transition-all hover:-translate-y-0.5",
            statusFilter === "PENDING" ? "border-amber-500 ring-2 ring-amber-500/20 shadow-amber-500/10" : "border-amber-100 dark:border-amber-900/30 shadow-amber-500/5 hover:border-amber-300 dark:hover:border-amber-700/50"
          )}
        >
          <div>
            <p className="text-[10px] font-bold text-amber-500/80 dark:text-amber-500/60 uppercase tracking-wider mb-1">Pending</p>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-500">{pendingApps}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-500 shrink-0">
            <Search className="w-5 h-5" />
          </div>
        </button>

        <button 
          onClick={() => { setStatusFilter("APPROVED"); setCurrentPage(1); }}
          className={cn(
            "text-left bg-white dark:bg-slate-900 border p-5 rounded-2xl shadow-sm flex items-center justify-between transition-all hover:-translate-y-0.5",
            statusFilter === "APPROVED" ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-emerald-500/10" : "border-emerald-100 dark:border-emerald-900/30 shadow-emerald-500/5 hover:border-emerald-300 dark:hover:border-emerald-700/50"
          )}
        >
          <div>
            <p className="text-[10px] font-bold text-emerald-500/80 dark:text-emerald-500/60 uppercase tracking-wider mb-1">Approved</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-500">{approvedApps}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-500 shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
        </button>

        <button 
          onClick={() => { setStatusFilter("REJECTED"); setCurrentPage(1); }}
          className={cn(
            "text-left bg-white dark:bg-slate-900 border p-5 rounded-2xl shadow-sm flex items-center justify-between transition-all hover:-translate-y-0.5",
            statusFilter === "REJECTED" ? "border-red-500 ring-2 ring-red-500/20 shadow-red-500/10" : "border-red-100 dark:border-red-900/30 shadow-red-500/5 hover:border-red-300 dark:hover:border-red-700/50"
          )}
        >
          <div>
            <p className="text-[10px] font-bold text-red-500/80 dark:text-red-500/60 uppercase tracking-wider mb-1">Rejected</p>
            <p className="text-2xl font-black text-red-600 dark:text-red-500">{rejectedApps}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-500 shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
        </button>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search pending applications..." 
            className="pl-10 rounded-xl border-slate-200 font-medium"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto justify-between">
           {/* Pagination Controls */}
           <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 hidden sm:inline">
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

           <Button variant="outline" className="rounded-xl font-bold border-slate-200 dark:border-slate-700">
             <Filter className="w-4 h-4 mr-2" /> Filter
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {paginatedData.length > 0 ? (
          paginatedData.map((app: any) => (
            <div key={app.id} className="group relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-5 hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  {/* Left Side: Applicant Info */}
                  <div className="flex items-center gap-5">
                     <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-800 shadow-sm group-hover:scale-105 transition-transform duration-300">
                        {app.photoUrl ? (
                          <Image src={app.photoUrl} alt={app.fullName} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-300">
                            <FileText className="w-6 h-6" />
                          </div>
                        )}
                     </div>
                     <div>
                        <div className="flex items-center gap-3 mb-1">
                           <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{app.fullName}</h3>
                           <Badge variant="outline" className={cn(
                              "rounded-full px-3 py-0.5 text-[9px] font-bold border-none shadow-sm",
                              app.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-600" : 
                              app.status === "REJECTED" ? "bg-red-500/10 text-red-600" : 
                              "bg-amber-500/10 text-amber-600"
                            )}>
                              {app.status}
                           </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                           <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                             <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" /> {app.applicationNo}
                           </span>
                           <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5" suppressHydrationWarning>
                             <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" /> {new Date(app.createdAt).toLocaleDateString('en-GB')}
                           </span>
                        </div>
                     </div>
                  </div>

                  {/* Middle: Course Details */}
                  <div className="flex flex-col md:items-center">
                     <p className="text-[10px] font-bold text-slate-400 mb-1">Applied For</p>
                     <p className="text-sm font-bold text-primary bg-primary/5 dark:bg-primary/10 px-4 py-1.5 rounded-xl border border-primary/10">
                        {app.appliedCourse}
                     </p>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-3 self-end md:self-center">
                     <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-xl font-bold border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-white"
                        onClick={() => setSelectedApp(app)}
                     >
                        <Eye className="w-4 h-4 mr-2" /> Details
                     </Button>
                     
                     <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex h-9 items-center justify-center rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-bold px-4 text-sm cursor-pointer shadow-sm transition-all active:scale-95 outline-none">
                              Update Status
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-2xl p-2 min-w-[160px] shadow-2xl border-none ring-1 ring-slate-100 dark:ring-slate-800 bg-white dark:bg-slate-900">
                          {app.status === "PENDING" && (
                            <>
                              <DropdownMenuItem onClick={() => { setActionApp(app); setActionType("APPROVE"); }}>
                                <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { setActionApp(app); setActionType("REJECT"); }} className="text-red-600">
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                     </DropdownMenu>
                  </div>
               </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
             <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-300" />
             </div>
             <h3 className="text-lg font-bold text-slate-900 dark:text-white">No applications found</h3>
             <p className="text-slate-400 font-bold text-xs mt-1">Try adjusting your search terms</p>
          </div>
        )}
      </div>

      <ApplicationDetailsModal
        isOpen={!!selectedApp}
        onClose={() => setSelectedApp(null)}
        app={selectedApp}
        onUpdateStatus={(id, status) => {
          setSelectedApp(null);
          setActionApp(selectedApp);
          setActionType(status as "APPROVE" | "REJECT");
        }}
      />

      {/* Approve Modal */}
      <Dialog open={actionType === "APPROVE" && !!actionApp} onOpenChange={() => { setActionType(null); setActionApp(null); }}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle>Approve Student Admission</DialogTitle>
            <DialogDescription>
              Assign <strong>{actionApp?.fullName}</strong> to a batch to complete enrollment.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Batch *</label>
              <select
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                className="w-full flex h-10 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:border-emerald-500 transition-all outline-none"
              >
                <option value="">-- Choose a batch --</option>
                {batches.filter((b: any) => b.courseId === actionApp?.courseId).map((batch: any) => (
                  <option key={batch.id} value={batch.id}>{batch.name}</option>
                ))}
              </select>
              {batches.filter((b: any) => b.courseId === actionApp?.courseId).length === 0 && (
                <p className="text-xs text-red-500 mt-1">No batches available for this course. Please create a batch first.</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionType(null)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleStatusUpdate} disabled={isProcessing || !selectedBatchId} className="rounded-xl bg-emerald-600 hover:bg-emerald-700">
              {isProcessing ? "Approving..." : "Confirm & Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={actionType === "REJECT" && !!actionApp} onOpenChange={() => { setActionType(null); setActionApp(null); }}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-red-600">Reject Application</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting <strong>{actionApp?.fullName}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <textarea
              className="w-full rounded-xl border p-3 text-sm focus:border-red-500 outline-none transition-all resize-none h-24"
              placeholder="e.g., Documents are blurry, missing marksheet..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionType(null)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleStatusUpdate} disabled={isProcessing || !reason.trim()} variant="destructive" className="rounded-xl">
              {isProcessing ? "Rejecting..." : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
