"use client";

import { useState, useMemo } from "react";
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
  Eye, 
  CheckCircle, 
  XCircle, 
  Search, 
  FileText, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  Calendar
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { updateApplicationStatus } from "@/app/actions/admission";
import Image from "next/image";
import { ApplicationDetailsModal } from "./ApplicationDetailsModal";
import { useDebounce } from "@/hooks/useDebounce";

export function AdminApplicationsClient({ 
  workspaceId, 
  initialData = [], 
  batches = [], 
  courses = [], 
  onEditOnlineApp 
}: any) {
  const [data, setData] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 250);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  
  // Modal states
  const [actionApp, setActionApp] = useState<any>(null);
  const [actionType, setActionType] = useState<"APPROVE" | "REJECT" | null>(null);
  const [reason, setReason] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const itemsPerPage = 12;

  const filteredData = useMemo(() => {
    const q = debouncedSearch.toLowerCase().trim();
    return data.filter((app: any) => {
      const matchStatus = statusFilter === "ALL" || app.status === statusFilter;
      if (!matchStatus) return false;
      if (!q) return true;
      return (
        app.fullName?.toLowerCase().includes(q) ||
        app.applicationNo?.toLowerCase().includes(q) ||
        app.appliedCourse?.toLowerCase().includes(q)
      );
    });
  }, [data, statusFilter, debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const paginatedData = useMemo(() => {
    return filteredData.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredData, currentPage, itemsPerPage]);

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
      const res = await updateApplicationStatus(
        actionApp.id, 
        status, 
        actionType === "REJECT" ? reason : undefined, 
        actionType === "APPROVE" ? selectedBatchId : undefined
      );

      if (res.success) {
        toast.success(`Application ${status.toLowerCase()} successfully.`);
        setData((prev: any[]) => prev.map(a => a.id === actionApp.id ? { ...a, status } : a));
        setActionType(null);
        setActionApp(null);
        setReason("");
        setSelectedBatchId("");
      } else {
        toast.error(res.error || "Failed to update status.");
      }
    } catch (e) {
      toast.error("An error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  const totalApps = data.length;
  const pendingApps = data.filter((a: any) => a.status === "PENDING").length;
  const approvedApps = data.filter((a: any) => a.status === "APPROVED").length;
  const rejectedApps = data.filter((a: any) => a.status === "REJECTED").length;

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Main Content Card & Filter Toolbar (Rule 7.4) */}
      <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden bg-white dark:bg-slate-900">
        <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" /> Online Admission Applications
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Review submitted admission forms, assign batches, and finalize enrollments.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              {/* Search Box */}
              <div className="relative w-full sm:w-64 group">
                <Search className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none h-3.5 w-3.5 text-slate-400 my-auto" />
                <Input 
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search by student name, app #..."
                  className="h-8 sm:h-9 pl-8 pr-3 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 rounded-lg font-normal text-xs placeholder:text-xs placeholder:text-slate-400"
                />
              </div>

              {/* Status Filter Pills */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-lg border border-slate-200 dark:border-slate-700/60 overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => { setStatusFilter("ALL"); setCurrentPage(1); }}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-xs font-semibold transition-all shrink-0",
                    statusFilter === "ALL" 
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs" 
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  All ({totalApps})
                </button>
                <button
                  type="button"
                  onClick={() => { setStatusFilter("PENDING"); setCurrentPage(1); }}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-xs font-semibold transition-all shrink-0",
                    statusFilter === "PENDING" 
                      ? "bg-amber-500 text-white shadow-xs" 
                      : "text-amber-600 dark:text-amber-400 hover:text-amber-700"
                  )}
                >
                  Pending ({pendingApps})
                </button>
                <button
                  type="button"
                  onClick={() => { setStatusFilter("APPROVED"); setCurrentPage(1); }}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-xs font-semibold transition-all shrink-0",
                    statusFilter === "APPROVED" 
                      ? "bg-emerald-600 text-white shadow-xs" 
                      : "text-emerald-600 dark:text-emerald-400 hover:text-emerald-700"
                  )}
                >
                  Approved ({approvedApps})
                </button>
                <button
                  type="button"
                  onClick={() => { setStatusFilter("REJECTED"); setCurrentPage(1); }}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-xs font-semibold transition-all shrink-0",
                    statusFilter === "REJECTED" 
                      ? "bg-red-600 text-white shadow-xs" 
                      : "text-red-600 dark:text-red-400 hover:text-red-700"
                  )}
                >
                  Rejected ({rejectedApps})
                </button>
              </div>
            </div>
          </div>
        </CardHeader>

        {/* List Rows (Rule 7.5) */}
        <CardContent className="p-0">
          {filteredData.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-900 dark:text-white">No applications found</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Try adjusting your search query or filter.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {paginatedData.map((app: any) => {
                const isPending = app.status === "PENDING";
                const isApproved = app.status === "APPROVED";
                const statusBorder = isPending ? "border-amber-500" : isApproved ? "border-emerald-500" : "border-red-500";

                return (
                  <div 
                    key={app.id} 
                    className={cn(
                      "flex flex-col lg:flex-row items-start lg:items-center justify-between p-3 sm:p-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all gap-3 sm:gap-4 group border-l-[3px]",
                      statusBorder
                    )}
                  >
                    {/* Applicant Profile */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                        {app.photoUrl ? (
                          <Image src={app.photoUrl} alt={app.fullName} fill sizes="40px" className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-xs text-slate-500">
                            {app.fullName ? app.fullName.charAt(0).toUpperCase() : <FileText className="w-4 h-4" />}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                            {app.fullName}
                          </span>
                          <Badge variant="outline" className={cn(
                            "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border-none",
                            isApproved ? "bg-emerald-500/10 text-emerald-600" : 
                            isPending ? "bg-amber-500/10 text-amber-600" : 
                            "bg-red-500/10 text-red-600"
                          )}>
                            {app.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                          <span>App #: {app.applicationNo}</span>
                          <span>•</span>
                          <span className="font-sans flex items-center gap-1 text-slate-600 dark:text-slate-400">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {new Date(app.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Metadata & Actions */}
                    <div className="flex flex-wrap lg:flex-nowrap items-center gap-3 sm:gap-4 w-full lg:w-auto justify-between lg:justify-end text-xs">
                      {/* Applied Course */}
                      <div className="text-left lg:text-right shrink-0">
                        <span className="inline-flex items-center gap-1 font-semibold text-xs text-primary px-2 py-0.5 rounded-md bg-primary/5">
                          <BookOpen className="w-3 h-3" /> {app.appliedCourse || "N/A"}
                        </span>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                          Applied Course
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 shrink-0 ml-auto lg:ml-0">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setSelectedApp(app)}
                          className="h-7 sm:h-8 px-2.5 rounded-lg text-xs font-semibold gap-1 text-slate-600 dark:text-slate-300"
                        >
                          <Eye className="w-3.5 h-3.5" /> Details
                        </Button>
                        
                        {isPending ? (
                          <Button 
                            size="sm" 
                            onClick={() => onEditOnlineApp && onEditOnlineApp(app)}
                            className="h-7 sm:h-8 px-2.5 rounded-lg text-xs font-semibold gap-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Review & Approve
                          </Button>
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger className="inline-flex items-center justify-center h-7 sm:h-8 px-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg outline-none cursor-pointer">
                              Options
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl p-1 min-w-[140px] text-xs">
                              <DropdownMenuItem 
                                onClick={() => { setActionApp(app); setActionType("REJECT"); }} 
                                className="text-red-600 focus:text-red-600 text-xs py-1.5 cursor-pointer"
                              >
                                <XCircle className="w-3.5 h-3.5 mr-1.5" />
                                Reject Application
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
        </CardContent>

        {/* Standardized Pagination Bar (Rule 7.6) */}
        {filteredData.length > 0 && (
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20">
            <span className="text-xs font-medium text-slate-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length}
            </span>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="h-7 w-7 rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>

              {getPageNumbers().map((p, idx) => (
                p === "..." ? (
                  <span key={`dots-${idx}`} className="px-1 text-slate-400 text-xs select-none">...</span>
                ) : (
                  <Button
                    key={`page-${p}`}
                    variant={currentPage === p ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setCurrentPage(Number(p))}
                    className="h-7 w-7 rounded-md font-semibold text-xs"
                  >
                    {p}
                  </Button>
                )
              ))}

              <Button
                variant="outline"
                size="icon"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="h-7 w-7 rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Application Details Modal */}
      <ApplicationDetailsModal
        isOpen={!!selectedApp}
        onClose={() => setSelectedApp(null)}
        app={selectedApp}
        onUpdateStatus={(id: string, status: string) => {
          setSelectedApp(null);
          setActionApp(selectedApp);
          setActionType(status as "APPROVE" | "REJECT");
        }}
      />

      {/* Approve Modal (Rule 7.7) */}
      <Dialog open={actionType === "APPROVE" && !!actionApp} onOpenChange={() => { setActionType(null); setActionApp(null); }}>
        <DialogContent className="sm:max-w-md rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xl">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Approve Admission
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Assign <strong>{actionApp?.fullName}</strong> to a batch to finalize enrollment.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Select Batch *</label>
              <select
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                className="w-full h-8 sm:h-9 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium outline-none"
              >
                <option value="">-- Choose a batch --</option>
                {batches.filter((b: any) => !b.courseId || b.courseId === actionApp?.courseId).map((batch: any) => (
                  <option key={batch.id} value={batch.id}>{batch.name}</option>
                ))}
              </select>
              {batches.filter((b: any) => !b.courseId || b.courseId === actionApp?.courseId).length === 0 && (
                <p className="text-[11px] text-red-500 mt-1">No batches available for this course. Please create a batch first.</p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setActionType(null)} className="h-8 sm:h-9 text-xs rounded-lg">
              Cancel
            </Button>
            <Button 
              onClick={handleStatusUpdate} 
              disabled={isProcessing || !selectedBatchId} 
              className="h-8 sm:h-9 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isProcessing ? "Approving..." : "Confirm & Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal (Rule 7.7) */}
      <Dialog open={actionType === "REJECT" && !!actionApp} onOpenChange={() => { setActionType(null); setActionApp(null); }}>
        <DialogContent className="sm:max-w-md rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xl">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-base font-bold text-red-600 flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-red-600" /> Reject Application
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Provide a reason for rejecting <strong>{actionApp?.fullName}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <textarea
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 p-2.5 text-xs bg-white dark:bg-slate-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500 h-20 resize-none"
              placeholder="e.g. Uploaded documents are blurry, incomplete marksheet..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setActionType(null)} className="h-8 sm:h-9 text-xs rounded-lg">
              Cancel
            </Button>
            <Button 
              onClick={handleStatusUpdate} 
              disabled={isProcessing || !reason.trim()} 
              className="h-8 sm:h-9 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white"
            >
              {isProcessing ? "Rejecting..." : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
