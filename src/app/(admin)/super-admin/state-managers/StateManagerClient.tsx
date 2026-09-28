"use client";

import React, { useState, useMemo } from "react";
import { 
  updateFranchiseCommissionSettings, 
  promoteToStateManager, 
  updateStateManagerConfig, 
  assignReferralToFranchise, 
  generateUniqueReferralId, 
  clearPendingCommissions, 
  revokeStateManager,
  processDueCommissions,
  approveCommissionWithdrawal,
  rejectCommissionWithdrawal
} from "@/app/actions/state-manager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";
import { 
  Settings, Building2, Link as LinkIcon, Edit2, ShieldCheck, Shield, Network, 
  Search, Download, ChevronLeft, ChevronRight, CheckCircle2, Copy, Unlink, 
  RefreshCw, AlertTriangle, ArrowRight, Clock, IndianRupee, Zap, X, Wallet, Check
} from "lucide-react";
import { AdminPageHeader } from "@/components/layout/AdminPageHeader";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useDebounce } from "@/hooks/useDebounce";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function StateManagerClient({ 
  initialManagers, 
  franchises, 
  allWithdrawals = [] 
}: { 
  initialManagers: any[], 
  franchises: any[], 
  allWithdrawals?: any[] 
}) {
  const [managers, setManagers] = useState(initialManagers);
  const [activeTab, setActiveTab] = useState<"managers" | "hierarchy" | "withdrawals">("managers");
  
  // Ensure state syncs if props change during client navigation
  React.useEffect(() => {
    setManagers(initialManagers);
  }, [initialManagers]);
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 250);
  const [showOnlyLinked, setShowOnlyLinked] = useState(false);
  
  // Pagination
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPageManagers, setCurrentPageManagers] = useState(1);
  const [currentPageHierarchy, setCurrentPageHierarchy] = useState(1);
  const [currentPagePending, setCurrentPagePending] = useState(1);
  const [currentPageHistory, setCurrentPageHistory] = useState(1);
  const itemsPerPageWithdrawals = 20;
  
  // Dialog States
  const [isPromoteOpen, setIsPromoteOpen] = useState(false);
  const [promoteForm, setPromoteForm] = useState({ workspaceId: "", referralId: "", commissionReleaseHours: 24 });
  const [isGeneratingPromoteId, setIsGeneratingPromoteId] = useState(false);
  
  // Edit State Manager Dialog State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isRegeneratingEditId, setIsRegeneratingEditId] = useState(false);
  
  const [managerToClear, setManagerToClear] = useState<string | null>(null);
  const [managerToRevoke, setManagerToRevoke] = useState<string | null>(null);
  const [franchiseToUnlink, setFranchiseToUnlink] = useState<string | null>(null);
  const [isProcessingDue, setIsProcessingDue] = useState(false);

  // Reject Withdrawal Modal
  const [rejectModal, setRejectModal] = useState<{ open: boolean; transactionId: string; reason: string }>({
    open: false,
    transactionId: "",
    reason: ""
  });

  // Default 1 year expiry
  const defaultExpiryDate = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({ 
    workspaceId: "", 
    appliedReferralId: "", 
    referralCommissionRate: "10", 
    referralCommissionExpiry: defaultExpiryDate, 
    isReferralCommissionEnabled: true 
  });

  const [isOverrideOpen, setIsOverrideOpen] = useState(false);
  const [overrideForm, setOverrideForm] = useState({ 
    workspaceId: "", 
    isReferralCommissionEnabled: true, 
    referralCommissionRate: "10", 
    referralCommissionExpiry: "" 
  });

  const pendingWithdrawals = useMemo(() => allWithdrawals.filter(w => w.status === 'PENDING'), [allWithdrawals]);
  const historyWithdrawals = useMemo(() => allWithdrawals.filter(w => w.status !== 'PENDING'), [allWithdrawals]);
  const [withdrawalTab, setWithdrawalTab] = useState<"pending" | "history">("pending");
  const [historySearchQuery, setHistorySearchQuery] = useState("");
  const debouncedHistorySearch = useDebounce(historySearchQuery, 250);

  const filteredHistoryWithdrawals = useMemo(() => {
    if (!debouncedHistorySearch) return historyWithdrawals;
    const q = debouncedHistorySearch.toLowerCase().trim();
    return historyWithdrawals.filter(w => {
      const nameMatch = w.workspace?.name?.toLowerCase().includes(q) || false;
      const refMatch = w.workspace?.ownReferralId?.toLowerCase().includes(q) || false;
      const dateMatch = new Date(w.createdAt).toLocaleString().toLowerCase().includes(q) || false;
      return nameMatch || refMatch || dateMatch;
    });
  }, [historyWithdrawals, debouncedHistorySearch]);

  const handlePromote = async () => {
    if (!promoteForm.workspaceId || !promoteForm.referralId) {
      return toast.error("Please fill all required fields");
    }
    
    const res = await promoteToStateManager(
      promoteForm.workspaceId, 
      promoteForm.referralId, 
      promoteForm.commissionReleaseHours
    );
    
    if (res.success) {
      toast.success("Franchise promoted to State Manager successfully");
      setIsPromoteOpen(false);
      window.location.reload();
    } else {
      toast.error(res.error || "Failed to promote franchise");
    }
  };

  const handleEdit = async () => {
    if (!editForm.id) return;
    setIsSavingEdit(true);
    try {
      const res = await updateStateManagerConfig(editForm.id, {
        commissionReleaseHours: parseInt(editForm.commissionReleaseHours?.toString() || "24"),
        referralId: editForm.ownReferralId?.trim()
      });

      if (res.success) {
        toast.success("State Manager settings updated successfully");
        setIsEditOpen(false);
        window.location.reload();
      } else {
        toast.error(res.error || "Failed to update configuration");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update configuration");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleRegenerateEditReferralId = async () => {
    setIsRegeneratingEditId(true);
    try {
      const newId = await generateUniqueReferralId();
      setEditForm((prev: any) => ({ ...prev, ownReferralId: newId }));
      toast.success("Generated new unique Referral ID");
    } catch {
      toast.error("Failed to generate unique Referral ID");
    } finally {
      setIsRegeneratingEditId(false);
    }
  };

  const handleRegeneratePromoteReferralId = async () => {
    setIsGeneratingPromoteId(true);
    try {
      const newId = await generateUniqueReferralId();
      setPromoteForm((prev: any) => ({ ...prev, referralId: newId }));
      toast.success("Generated new unique Referral ID");
    } catch {
      toast.error("Failed to generate unique Referral ID");
    } finally {
      setIsGeneratingPromoteId(false);
    }
  };

  const handleAssign = async () => {
    if (!assignForm.workspaceId) return toast.error("Select a franchise");
    
    const expiryDate = assignForm.referralCommissionExpiry ? new Date(assignForm.referralCommissionExpiry) : null;
    const rate = assignForm.referralCommissionRate ? parseFloat(assignForm.referralCommissionRate) : 0;

    const res = await assignReferralToFranchise(
      assignForm.workspaceId, 
      assignForm.appliedReferralId || null,
      assignForm.appliedReferralId ? { rate, expiry: expiryDate, enabled: assignForm.isReferralCommissionEnabled } : undefined
    );
    
    if (res.success) {
      toast.success("Referral linked successfully");
      setIsAssignOpen(false);
      window.location.reload();
    } else {
      toast.error(res.error || "Failed to assign referral");
    }
  };

  const handleOverride = async () => {
    if (!overrideForm.workspaceId) return toast.error("Select a franchise");
    
    const expiryDate = overrideForm.referralCommissionExpiry ? new Date(overrideForm.referralCommissionExpiry) : null;
    const rate = overrideForm.referralCommissionRate ? parseFloat(overrideForm.referralCommissionRate) : 0;

    const res = await updateFranchiseCommissionSettings(overrideForm.workspaceId, {
      isReferralCommissionEnabled: overrideForm.isReferralCommissionEnabled,
      referralCommissionRate: rate,
      referralCommissionExpiry: expiryDate
    });

    if (res.success) {
      toast.success("Franchise commission settings updated!");
      setIsOverrideOpen(false);
      window.location.reload();
    } else {
      toast.error(res.error || "Failed to update settings");
    }
  };

  const handleClearNowClick = (id: string) => {
    setManagerToClear(id);
  };

  const confirmClearNow = async () => {
    if (!managerToClear) return;
    const res = await clearPendingCommissions(managerToClear);
    if(res.success) {
      toast.success(`Cleared and released ${formatCurrency(res.amountCleared || 0)} successfully.`);
      window.location.reload();
    } else {
      toast.error(res.error || "Failed to clear commissions.");
    }
    setManagerToClear(null);
  };

  const handleRevokeClick = (id: string) => {
    setManagerToRevoke(id);
  };

  const confirmRevoke = async () => {
    if (!managerToRevoke) return;
    const res = await revokeStateManager(managerToRevoke);
    if(res.success) {
      toast.success("State Manager privileges revoked successfully.");
      setIsEditOpen(false);
      window.location.reload();
    } else {
      toast.error(res.error || "Failed to revoke privileges.");
    }
    setManagerToRevoke(null);
  };

  const handleProcessDueCommissions = async () => {
    setIsProcessingDue(true);
    try {
      const res = await processDueCommissions();
      if (res.success) {
        if (res.processed && res.processed > 0) {
          toast.success(`Successfully processed & unlocked ${res.processed} pending commission(s)!`);
          window.location.reload();
        } else {
          toast.info(res.message || "No pending commissions are currently due for release.");
        }
      } else {
        toast.error(res.error || "Failed to process due commissions.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to process due commissions.");
    } finally {
      setIsProcessingDue(false);
    }
  };

  const handleApproveWithdrawal = async (transactionId: string) => {
    const res = await approveCommissionWithdrawal(transactionId);
    if(res.success) {
      toast.success("Withdrawal approved successfully.");
      window.location.reload();
    } else {
      toast.error(res.error || "Failed to approve withdrawal.");
    }
  };

  const submitRejectWithdrawal = async () => {
    if (!rejectModal.reason.trim()) {
      return toast.error("Please enter a valid rejection reason");
    }
    const res = await rejectCommissionWithdrawal(rejectModal.transactionId, rejectModal.reason.trim());
    if(res.success) {
      toast.success("Withdrawal rejected and refunded back to manager.");
      setRejectModal({ open: false, transactionId: "", reason: "" });
      window.location.reload();
    } else {
      toast.error(res.error || "Failed to reject withdrawal.");
    }
  };

  const handleDownloadReport = () => {
    if (!managers || managers.length === 0) {
      return toast.error("No State Manager data to export.");
    }

    const headers = [
      "State Manager Name",
      "Subdomain",
      "Referral ID",
      "Release Delay (Hours)",
      "Referred Franchises",
      "Commission Rate",
      "Total Commission Earned (INR)",
      "Pending Commission (INR)",
      "Commission Balance (INR)",
      "Wallet Balance (INR)",
      "Validity"
    ];

    const rows = managers.map(m => [
      `"${(m.name || "").replace(/"/g, '""')}"`,
      `"${m.subdomain || ""}"`,
      `"${m.ownReferralId || ""}"`,
      m.commissionReleaseHours || 24,
      m._count?.referredWorkspaces || 0,
      `"${m.displayRate || "0%"}"`,
      m.totalEarned || 0,
      m.totalPending || 0,
      m.commissionBalance || 0,
      m.walletBalance || 0,
      `"${m.displayValidity || "N/A"}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `state_managers_report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("State Managers CSV report downloaded!");
  };

  const handleFilterByReferral = (referralId: string) => {
    if (!referralId) return;
    setSearchQuery(referralId);
    setShowOnlyLinked(true);
    setActiveTab("hierarchy");
  };

  const normalFranchises = useMemo(() => franchises.filter(f => !f.isStateManager), [franchises]);
  const linkedFranchisesCount = useMemo(() => normalFranchises.filter(f => f.referredBy).length, [normalFranchises]);
  const independentFranchisesCount = useMemo(() => normalFranchises.length - linkedFranchisesCount, [normalFranchises, linkedFranchisesCount]);
  
  // Memoized Lists & Pagination logic
  const filteredManagers = useMemo(() => {
    const q = debouncedSearch.toLowerCase().trim();
    if (!q) return managers;
    return managers.filter(m => 
      m.name?.toLowerCase().includes(q) || 
      (m.ownReferralId && m.ownReferralId.toLowerCase().includes(q)) ||
      m.subdomain?.toLowerCase().includes(q)
    );
  }, [managers, debouncedSearch]);

  const totalPagesManagers = Math.ceil(filteredManagers.length / itemsPerPage);
  const paginatedManagers = useMemo(() => {
    const start = (currentPageManagers - 1) * itemsPerPage;
    return filteredManagers.slice(start, start + itemsPerPage);
  }, [filteredManagers, currentPageManagers, itemsPerPage]);

  const filteredHierarchy = useMemo(() => {
    const q = debouncedSearch.toLowerCase().trim();
    return normalFranchises.filter(f => {
      const matchesLink = showOnlyLinked ? f.referredBy !== null : true;
      if (!matchesLink) return false;
      if (!q) return true;
      return (
        f.name?.toLowerCase().includes(q) || 
        f.subdomain?.toLowerCase().includes(q) ||
        (f.appliedReferralId && f.appliedReferralId.toLowerCase().includes(q)) ||
        (f.referredBy?.name && f.referredBy.name.toLowerCase().includes(q))
      );
    });
  }, [normalFranchises, debouncedSearch, showOnlyLinked]);

  const totalPagesHierarchy = Math.ceil(filteredHierarchy.length / itemsPerPage);
  const paginatedHierarchy = useMemo(() => {
    const start = (currentPageHierarchy - 1) * itemsPerPage;
    return filteredHierarchy.slice(start, start + itemsPerPage);
  }, [filteredHierarchy, currentPageHierarchy, itemsPerPage]);

  const totalPagesPending = Math.ceil(pendingWithdrawals.length / itemsPerPageWithdrawals);
  const paginatedPending = useMemo(() => {
    const start = (currentPagePending - 1) * itemsPerPageWithdrawals;
    return pendingWithdrawals.slice(start, start + itemsPerPageWithdrawals);
  }, [pendingWithdrawals, currentPagePending]);

  const totalPagesHistory = Math.ceil(filteredHistoryWithdrawals.length / itemsPerPageWithdrawals);
  const paginatedHistory = useMemo(() => {
    const start = (currentPageHistory - 1) * itemsPerPageWithdrawals;
    return filteredHistoryWithdrawals.slice(start, start + itemsPerPageWithdrawals);
  }, [filteredHistoryWithdrawals, currentPageHistory]);

  React.useEffect(() => { setCurrentPageManagers(1); }, [debouncedSearch, itemsPerPage]);
  React.useEffect(() => { setCurrentPageHierarchy(1); }, [debouncedSearch, showOnlyLinked, itemsPerPage]);
  React.useEffect(() => { setCurrentPageHistory(1); }, [debouncedHistorySearch]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  // Rule 7.6 Standardized Pagination logic
  const getPageNumbers = (current: number, total: number) => {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 4) {
      return [1, 2, 3, 4, 5, '...', total];
    }
    if (current >= total - 3) {
      return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    }
    return [1, '...', current - 1, current, current + 1, '...', total];
  };

  const renderPagination = (currentPage: number, totalPages: number, setPage: (p: number) => void) => {
    if (totalPages <= 1) return null;
    const pages = getPageNumbers(currentPage, totalPages);
    return (
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20">
        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setPage(Math.max(1, currentPage - 1))} 
            disabled={currentPage === 1} 
            className="h-7 px-2 rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm disabled:opacity-40"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          
          <div className="hidden sm:flex items-center gap-1">
            {pages.map((p, idx) => {
              if (p === '...') {
                return <span key={`ellipsis-${idx}`} className="px-1 text-slate-400 text-xs select-none">...</span>;
              }
              const pageNum = Number(p);
              const isCurrent = pageNum === currentPage;
              return (
                <Button
                  key={`page-${pageNum}`}
                  variant={isCurrent ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setPage(pageNum)}
                  className={cn(
                    "h-7 w-7 rounded-md font-semibold text-xs p-0 transition-all",
                    isCurrent 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setPage(Math.min(totalPages, currentPage + 1))} 
            disabled={currentPage === totalPages} 
            className="h-7 px-2 rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm disabled:opacity-40"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    );
  };

  const copyToClipboard = (text: string, label: string = "Referral ID") => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  // Helper presets for Release Delay
  const releaseHoursPresets = [
    { label: "0h (Immediate)", value: 0 },
    { label: "12 Hours", value: 12 },
    { label: "24 Hours (Standard)", value: 24 },
    { label: "48 Hours", value: 48 },
    { label: "7 Days (168h)", value: 168 }
  ];

  return (
    <TooltipProvider>
      <div className="space-y-4 sm:space-y-5 pb-8 w-full mx-auto">
        {/* Header Rule 7.1 */}
        <AdminPageHeader 
          title="State Managers & Hierarchy" 
          description="Manage master state managers, configure automatic release delays, monitor referral networks, and process commissions."
        >
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={handleProcessDueCommissions}
              disabled={isProcessingDue}
              className="h-8 sm:h-9 px-3 rounded-lg text-xs font-semibold gap-1.5 shadow-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-emerald-700 dark:text-emerald-400"
            >
              <Zap className={cn("h-3.5 w-3.5 text-emerald-500", isProcessingDue && "animate-spin")} />
              {isProcessingDue ? "Processing..." : "Process Due Commissions"}
            </Button>

            <Button 
              variant="outline" 
              className="h-8 sm:h-9 px-3 rounded-lg text-xs font-semibold gap-1.5 shadow-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300"
              onClick={handleDownloadReport}
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              Download Report
            </Button>
          </div>
        </AdminPageHeader>

        {/* Metric / Stat Cards Grid (Rule 7.2) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { 
              label: "State Managers", 
              value: managers.length, 
              icon: ShieldCheck, 
              color: "text-amber-500", 
              bg: "bg-amber-500/10",
              sub: "Master hierarchy leaders"
            },
            { 
              label: "Linked Franchises", 
              value: linkedFranchisesCount, 
              icon: Network, 
              color: "text-emerald-500", 
              bg: "bg-emerald-500/10",
              sub: "Referred under managers"
            },
            { 
              label: "Independent Franchises", 
              value: independentFranchisesCount, 
              icon: Building2, 
              color: "text-purple-500", 
              bg: "bg-purple-500/10",
              sub: "Direct / Unlinked nodes"
            },
            { 
              label: "Pending Payout Requests", 
              value: pendingWithdrawals.length, 
              icon: Wallet, 
              color: "text-rose-500", 
              bg: "bg-rose-500/10",
              sub: pendingWithdrawals.length > 0 ? "Awaiting admin clearance" : "All payouts up to date"
            },
          ].map((stat, i) => (
            <Card key={i} className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
              <CardContent className="p-3.5">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2.5 rounded-lg shrink-0", stat.bg)}>
                    <stat.icon className={cn("h-5 w-5", stat.color)} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5 truncate">{stat.label}</p>
                    <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{stat.value.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">{stat.sub}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Horizontal Navigation Tabs (Rule 7.3) */}
        <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-1.5 p-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-full">
          <button
            onClick={() => setActiveTab("managers")}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium shrink-0 whitespace-nowrap transition-all",
              activeTab === "managers"
                ? "bg-slate-100 dark:bg-slate-800 text-primary dark:text-white font-semibold shadow-inner"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50"
            )}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
            State Managers
            <Badge className="ml-1 px-1.5 py-0 text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold border-none">
              {managers.length}
            </Badge>
          </button>
          
          <button
            onClick={() => setActiveTab("hierarchy")}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium shrink-0 whitespace-nowrap transition-all",
              activeTab === "hierarchy"
                ? "bg-slate-100 dark:bg-slate-800 text-primary dark:text-white font-semibold shadow-inner"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50"
            )}
          >
            <Network className="w-3.5 h-3.5 text-indigo-500" />
            Franchise Hierarchy
            <Badge className="ml-1 px-1.5 py-0 text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold border-none">
              {normalFranchises.length}
            </Badge>
          </button>
          
          <button
            onClick={() => setActiveTab("withdrawals")}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium shrink-0 whitespace-nowrap transition-all relative",
              activeTab === "withdrawals"
                ? "bg-slate-100 dark:bg-slate-800 text-primary dark:text-white font-semibold shadow-inner"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50"
            )}
          >
            <Wallet className="w-3.5 h-3.5 text-emerald-500" />
            Commission Withdrawals
            {pendingWithdrawals.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-bold text-[9px] leading-none animate-pulse">
                {pendingWithdrawals.length}
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: STATE MANAGERS */}
        {activeTab === "managers" && (
          <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden bg-white dark:bg-slate-900">
            {/* Toolbar (Rule 7.4) */}
            <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative w-full sm:max-w-[320px] group">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                    <Search className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                  <Input 
                    placeholder="Search by name, ID or subdomain..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 sm:h-9 pl-8 pr-3 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 rounded-lg font-normal text-[11px] sm:text-xs placeholder:text-[11px] sm:placeholder:text-xs placeholder:text-slate-400" 
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery("")} 
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 justify-end">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:inline">Per Page</span>
                  <Select value={itemsPerPage.toString()} onValueChange={(v) => setItemsPerPage(Number(v))}>
                    <SelectTrigger className="w-20 h-8 sm:h-9 text-xs font-medium rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg border border-slate-200 dark:border-slate-700 shadow-xl">
                      <SelectItem value="10" className="text-xs font-semibold">10</SelectItem>
                      <SelectItem value="20" className="text-xs font-semibold">20</SelectItem>
                      <SelectItem value="50" className="text-xs font-semibold">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {paginatedManagers.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 mb-3">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">No State Managers Found</h3>
                  <p className="text-xs font-medium text-slate-500 mt-1 max-w-sm mx-auto">
                    {searchQuery ? `No state manager matches "${searchQuery}". Clear your search to see all records.` : "Promote normal franchises from the 'Franchise Hierarchy' tab to establish State Managers."}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                  {paginatedManagers.map((m) => {
                    const hasReferrals = m._count.referredWorkspaces > 0;
                    return (
                      <div 
                        key={m.id} 
                        className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-3 sm:p-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all gap-3 sm:gap-4 group border-l-[3px] border-amber-500"
                      >
                        {/* Primary Info (Avatar + Name) */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20 text-amber-600 dark:text-amber-500">
                            <ShieldCheck className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate">{m.name}</p>
                              {hasReferrals ? (
                                <Badge className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border-none bg-emerald-500/10 text-emerald-600">Active</Badge>
                              ) : (
                                <Badge className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border-none bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">Idle</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-medium text-slate-500 mt-0.5">
                              <span className="font-mono text-slate-600 dark:text-slate-400">{m.subdomain}</span>
                              <span>•</span>
                              <button 
                                onClick={() => handleFilterByReferral(m.ownReferralId)}
                                className="text-primary hover:underline font-semibold flex items-center gap-1"
                              >
                                {m._count.referredWorkspaces} branches attached
                                <ArrowRight className="h-2.5 w-2.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Metadata Column Group (Rule 7.5) */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full lg:w-auto">
                          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4 md:gap-5 w-full sm:w-auto bg-slate-50/70 dark:bg-slate-800/30 lg:bg-transparent p-2.5 sm:p-0 rounded-lg text-xs">
                            {/* Referral ID */}
                            <div className="text-left shrink-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-bold text-xs text-slate-900 dark:text-white tracking-widest">{m.ownReferralId}</span>
                                <Tooltip>
                                  <TooltipTrigger
                                    onClick={() => copyToClipboard(m.ownReferralId, "Referral ID")}
                                    className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors p-0.5 rounded cursor-pointer"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </TooltipTrigger>
                                  <TooltipContent side="top">Copy Code</TooltipContent>
                                </Tooltip>
                              </div>
                              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Referral ID</p>
                            </div>

                            {/* Release Delay */}
                            <div className="text-left shrink-0">
                              <p className="font-semibold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1">
                                <Clock className="h-3 w-3 text-slate-400" />
                                {m.commissionReleaseHours || 24}h
                              </p>
                              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Release Delay</p>
                            </div>

                            {/* Total Earned */}
                            <div className="text-left shrink-0">
                              <p className="font-semibold text-xs text-emerald-600 dark:text-emerald-400">{formatCurrency(m.totalEarned || 0)}</p>
                              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Total Earned</p>
                            </div>

                            {/* Pending Commission */}
                            <div className="text-left shrink-0">
                              <div className="flex items-center gap-1.5">
                                <p className="font-semibold text-xs text-amber-500">{formatCurrency(m.totalPending || 0)}</p>
                                {m.totalPending > 0 && (
                                  <Button 
                                    onClick={() => handleClearNowClick(m.id)} 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-5 px-1.5 rounded text-[9px] font-bold border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-900/60 dark:text-emerald-400"
                                  >
                                    Clear Now
                                  </Button>
                                )}
                              </div>
                              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Pending Commission</p>
                            </div>

                            {/* Commission Balance */}
                            <div className="text-left shrink-0 hidden md:block">
                              <p className="font-semibold text-xs text-slate-900 dark:text-white">{formatCurrency(m.commissionBalance || 0)}</p>
                              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Unwithdrawn</p>
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => { 
                                setEditForm({
                                  ...m,
                                  commissionReleaseHours: m.commissionReleaseHours ?? 24
                                }); 
                                setIsEditOpen(true); 
                              }} 
                              className="h-7 sm:h-8 px-2.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 gap-1.5"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-amber-500" /> 
                              Configure
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {renderPagination(currentPageManagers, totalPagesManagers, setCurrentPageManagers)}
            </CardContent>
          </Card>
        )}

        {/* TAB 2: FRANCHISE HIERARCHY */}
        {activeTab === "hierarchy" && (
          <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden bg-white dark:bg-slate-900">
            {/* Toolbar (Rule 7.4) */}
            <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:max-w-xl">
                  <div className="relative w-full group">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                      <Search className="h-3.5 w-3.5 text-slate-400" />
                    </div>
                    <Input 
                      placeholder="Search normal franchises by name, domain, or referral ID..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-8 sm:h-9 pl-8 pr-3 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 rounded-lg font-normal text-[11px] sm:text-xs placeholder:text-[11px] sm:placeholder:text-xs placeholder:text-slate-400" 
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery("")} 
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700/60 h-8 sm:h-9">
                    <Switch id="linked-toggle" checked={showOnlyLinked} onCheckedChange={setShowOnlyLinked} />
                    <label htmlFor="linked-toggle" className="text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                      Linked Only
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-2 justify-end">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:inline">Per Page</span>
                  <Select value={itemsPerPage.toString()} onValueChange={(v) => setItemsPerPage(Number(v))}>
                    <SelectTrigger className="w-20 h-8 sm:h-9 text-xs font-medium rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg border border-slate-200 dark:border-slate-700 shadow-xl">
                      <SelectItem value="10" className="text-xs font-semibold">10</SelectItem>
                      <SelectItem value="20" className="text-xs font-semibold">20</SelectItem>
                      <SelectItem value="50" className="text-xs font-semibold">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {paginatedHierarchy.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 mb-3">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Franchises Found</h3>
                  <p className="text-xs font-medium text-slate-500 mt-1 max-w-sm mx-auto">
                    {searchQuery ? `No franchise matching "${searchQuery}".` : "No non-state-manager franchises currently match the filter."}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                  {paginatedHierarchy.map((f) => {
                    const isLinked = f.referredBy !== null;
                    return (
                      <div 
                        key={f.id} 
                        className={cn(
                          "flex flex-col lg:flex-row items-start lg:items-center justify-between p-3 sm:p-3.5 transition-all gap-3 sm:gap-4 group border-l-[3px]",
                          isLinked 
                            ? "border-emerald-500 bg-white dark:bg-slate-900 hover:bg-slate-50/80 dark:hover:bg-slate-800/40" 
                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                        )}
                      >
                        {/* Primary Info */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={cn(
                            "h-10 w-10 sm:h-11 sm:w-11 rounded-xl flex items-center justify-center shrink-0 border",
                            isLinked 
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" 
                              : "bg-indigo-500/10 border-indigo-500/20 text-indigo-600"
                          )}>
                            <Building2 className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate">{f.name}</p>
                              {isLinked ? (
                                <Badge className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border-none bg-emerald-500/10 text-emerald-600">Linked</Badge>
                              ) : (
                                <Badge className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border-none bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">Independent</Badge>
                              )}
                            </div>
                            <p className="text-[10px] font-medium text-slate-500 mt-0.5 truncate font-mono">
                              {f.subdomain}
                            </p>
                          </div>
                        </div>
                        
                        {/* Metadata & Actions */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full lg:w-auto">
                          {/* Hierarchy Status Column */}
                          <div className="text-left shrink-0 bg-slate-50/70 dark:bg-slate-800/30 lg:bg-transparent p-2.5 sm:p-0 rounded-lg">
                            {f.referredBy ? (
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-none font-bold font-mono tracking-widest text-[9px] px-1.5 py-0.5">
                                    {f.appliedReferralId}
                                  </Badge>
                                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                </div>
                                <p className="text-xs font-semibold text-slate-900 dark:text-white mt-0.5 truncate max-w-[150px]">{f.referredBy.name}</p>
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Parent State Manager</p>
                              </div>
                            ) : (
                              <div>
                                <span className="text-xs font-semibold text-slate-400 italic">No Referral Linked</span>
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Status</p>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                            {!isLinked ? (
                              <>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={async () => { 
                                    const uniqueId = await generateUniqueReferralId();
                                    setPromoteForm({ workspaceId: f.id, referralId: uniqueId, commissionReleaseHours: 24 }); 
                                    setIsPromoteOpen(true); 
                                  }} 
                                  className="h-7 sm:h-8 px-2.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-500/10 shadow-sm gap-1.5"
                                >
                                  <ShieldCheck className="w-3.5 h-3.5" /> 
                                  Make State Manager
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => { 
                                    setAssignForm({ 
                                      workspaceId: f.id, 
                                      appliedReferralId: "", 
                                      referralCommissionRate: "10", 
                                      referralCommissionExpiry: defaultExpiryDate,
                                      isReferralCommissionEnabled: true 
                                    }); 
                                    setIsAssignOpen(true); 
                                  }} 
                                  className="h-7 sm:h-8 px-2.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 shadow-sm gap-1.5"
                                >
                                  <LinkIcon className="w-3.5 h-3.5" /> 
                                  Link Referral
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => setFranchiseToUnlink(f.id)} 
                                  className="h-7 sm:h-8 px-2.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-500/10 shadow-sm gap-1.5"
                                >
                                  <Unlink className="w-3.5 h-3.5" /> 
                                  Unlink
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => { 
                                    setOverrideForm({ 
                                      workspaceId: f.id,
                                      isReferralCommissionEnabled: f.isReferralCommissionEnabled ?? true,
                                      referralCommissionRate: f.referralCommissionRate?.toString() || "10",
                                      referralCommissionExpiry: f.referralCommissionExpiry ? new Date(f.referralCommissionExpiry).toISOString().split('T')[0] : ""
                                    }); 
                                    setIsOverrideOpen(true); 
                                  }} 
                                  className="h-7 sm:h-8 px-2.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 shadow-sm gap-1.5"
                                >
                                  <Settings className="w-3.5 h-3.5" /> 
                                  Commission Rules
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {renderPagination(currentPageHierarchy, totalPagesHierarchy, setCurrentPageHierarchy)}
            </CardContent>
          </Card>
        )}

        {/* TAB 3: COMMISSION WITHDRAWALS */}
        {activeTab === "withdrawals" && (
          <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden bg-white dark:bg-slate-900">
            <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Withdrawal & Payout Management</h2>
                <p className="text-xs font-medium text-slate-500 mt-0.5">Review, approve, or reject offline commission payout requests from State Managers.</p>
              </div>
              <div className="flex bg-slate-100 dark:bg-slate-800/60 p-1 rounded-lg border border-slate-200 dark:border-slate-700/50 self-start sm:self-auto">
                <button
                  onClick={() => setWithdrawalTab("pending")}
                  className={cn(
                    "px-3 py-1 rounded-md text-xs font-semibold transition-all", 
                    withdrawalTab === "pending" 
                      ? "bg-white dark:bg-slate-700 shadow-sm text-primary dark:text-white" 
                      : "text-slate-500 hover:text-slate-800"
                  )}
                >
                  Pending ({pendingWithdrawals.length})
                </button>
                <button
                  onClick={() => setWithdrawalTab("history")}
                  className={cn(
                    "px-3 py-1 rounded-md text-xs font-semibold transition-all", 
                    withdrawalTab === "history" 
                      ? "bg-white dark:bg-slate-700 shadow-sm text-primary dark:text-white" 
                      : "text-slate-500 hover:text-slate-800"
                  )}
                >
                  History ({historyWithdrawals.length})
                </button>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {withdrawalTab === "pending" ? (
                pendingWithdrawals.length === 0 ? (
                  <div className="text-center py-16 px-4">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 mb-3">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">All Clear! No Pending Requests</h3>
                    <p className="text-xs font-medium text-slate-500 mt-1 max-w-sm mx-auto">
                      All commission withdrawal requests have been reviewed and processed.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                    {paginatedPending.map((req) => (
                      <div 
                        key={req.id} 
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 sm:p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 gap-4"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                              {req.workspace?.name}
                            </p>
                            <Badge className="bg-amber-500/10 text-amber-700 border-none text-[9px] font-mono font-bold tracking-widest px-1.5">
                              {req.workspace?.ownReferralId}
                            </Badge>
                          </div>
                          <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                            Requested: {new Date(req.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-mono">Ref: {req.id}</p>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                          <div className="text-left sm:text-right">
                            <p className="font-bold text-sm text-emerald-600 dark:text-emerald-400">{formatCurrency(req.amount)}</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Payout Amount</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleApproveWithdrawal(req.id)} 
                              className="h-8 px-3 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                            >
                              Approve Payout
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => setRejectModal({ open: true, transactionId: req.id, reason: "" })} 
                              className="h-8 px-3 rounded-lg text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {renderPagination(currentPagePending, totalPagesPending, setCurrentPagePending)}
                  </div>
                )
              ) : (
                historyWithdrawals.length === 0 ? (
                  <div className="text-center py-16 px-4">
                    <p className="text-xs font-medium text-slate-500">No withdrawal history recorded yet.</p>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                      <div className="relative max-w-sm">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <Input 
                          placeholder="Search history by name, ID or date..." 
                          value={historySearchQuery}
                          onChange={(e) => setHistorySearchQuery(e.target.value)}
                          className="h-8 sm:h-9 pl-8 pr-3 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700/60 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                    
                    {filteredHistoryWithdrawals.length === 0 ? (
                      <div className="text-center py-12 px-4">
                        <p className="text-xs font-medium text-slate-500">No matches found for "{historySearchQuery}".</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                        {paginatedHistory.map((req) => (
                          <div 
                            key={req.id} 
                            className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 sm:p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 gap-4"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                                  {req.workspace?.name}
                                </p>
                                <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-none text-[9px] font-mono font-bold tracking-widest px-1.5">
                                  {req.workspace?.ownReferralId}
                                </Badge>
                              </div>
                              <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                                Date: {new Date(req.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                              </p>
                              {req.rejectionReason && (
                                <p className="text-[10px] text-rose-500 font-medium mt-0.5">
                                  Reason: {req.rejectionReason}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                              <div className="text-left sm:text-right">
                                <p className={cn("font-bold text-sm", req.status === "APPROVED" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
                                  {formatCurrency(req.amount)}
                                </p>
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Amount</p>
                              </div>
                              <Badge className={cn(
                                "font-bold border-none px-2 py-0.5 text-[10px] tracking-wider uppercase",
                                req.status === "APPROVED" 
                                  ? "bg-emerald-500/10 text-emerald-600" 
                                  : "bg-rose-500/10 text-rose-600"
                              )}>
                                {req.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                        {renderPagination(currentPageHistory, totalPagesHistory, setCurrentPageHistory)}
                      </div>
                    )}
                  </div>
                )
              )}
            </CardContent>
          </Card>
        )}

        {/* ========================================================================= */}
        {/* MODAL 1: EDIT STATE MANAGER (Redesigned strictly per Rule 7 standards) */}
        {/* ========================================================================= */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-900">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-500 shrink-0">
                  <Edit2 className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    Edit State Manager
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500 font-medium mt-0.5">
                    Configure referral codes, automatic release delays, and network permissions for <strong className="text-slate-800 dark:text-slate-200">{editForm.name}</strong>.
                  </DialogDescription>
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Franchise Snapshot Strip */}
              <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 p-3 sm:p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-xs text-slate-900 dark:text-white">{editForm.name}</h4>
                    <p className="text-[11px] font-mono text-slate-500">{editForm.subdomain}</p>
                  </div>
                  <Badge className="bg-amber-500/10 text-amber-600 border-none text-[9px] uppercase font-bold tracking-wider">
                    State Manager
                  </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Branches</p>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                      {editForm._count?.referredWorkspaces || 0} attached
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Earned</p>
                    <p className="font-bold text-emerald-600 mt-0.5">
                      {formatCurrency(editForm.totalEarned || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Pending</p>
                    <p className="font-bold text-amber-500 mt-0.5">
                      {formatCurrency(editForm.totalPending || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Available Bal</p>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                      {formatCurrency(editForm.commissionBalance || 0)}
                    </p>
                  </div>
                </div>

                {editForm.totalPending > 0 && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/40 text-xs mt-1">
                    <span className="text-[11px] font-medium text-amber-800 dark:text-amber-300">
                      {formatCurrency(editForm.totalPending)} pending commission waiting for release delay.
                    </span>
                    <Button
                      size="sm"
                      onClick={() => handleClearNowClick(editForm.id)}
                      className="h-6 px-2 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded"
                    >
                      Clear & Release Now
                    </Button>
                  </div>
                )}
              </div>

              {/* Referral ID Field */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Referral ID (Unique 5-Digit Identifier)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Used by sub-franchises during registration</span>
                </label>
                <div className="relative flex items-center">
                  <Input 
                    className="h-8 sm:h-9 text-xs font-mono font-bold tracking-widest uppercase bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-lg pl-3 pr-20 text-slate-900 dark:text-white" 
                    value={editForm.ownReferralId || ''} 
                    onChange={(e) => setEditForm({ ...editForm, ownReferralId: e.target.value })} 
                    placeholder="e.g. 98068"
                  />
                  <div className="absolute right-1 flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger
                        type="button"
                        onClick={() => copyToClipboard(editForm.ownReferralId, "Referral ID")}
                        className="h-7 w-7 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-md inline-flex items-center justify-center cursor-pointer"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </TooltipTrigger>
                      <TooltipContent side="top">Copy Referral Code</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger
                        type="button"
                        disabled={isRegeneratingEditId}
                        onClick={handleRegenerateEditReferralId}
                        className="h-7 w-7 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 rounded-md inline-flex items-center justify-center cursor-pointer disabled:opacity-40"
                      >
                        <RefreshCw className={cn("h-3.5 w-3.5", isRegeneratingEditId && "animate-spin text-amber-500")} />
                      </TooltipTrigger>
                      <TooltipContent side="top">Generate New Unique Code</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500">
                  Changing this referral ID will automatically sync across all existing connected sub-franchises.
                </p>
              </div>

              {/* Commission Release Delay (Hours) Field */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Commission Release Delay (Hours)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Holding period before funds unlock</span>
                </label>
                <Input 
                  type="number" 
                  min="0"
                  max="720"
                  className="h-8 sm:h-9 text-xs font-bold bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-lg px-3 text-slate-900 dark:text-white" 
                  value={editForm.commissionReleaseHours ?? 24} 
                  onChange={(e) => setEditForm({ ...editForm, commissionReleaseHours: e.target.value })} 
                />

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {releaseHoursPresets.map((preset) => {
                    const isSelected = Number(editForm.commissionReleaseHours) === preset.value;
                    return (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => setEditForm({ ...editForm, commissionReleaseHours: preset.value })}
                        className={cn(
                          "px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all border",
                          isSelected 
                            ? "bg-amber-500 text-white border-amber-600 shadow-sm" 
                            : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                        )}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  When a linked franchise recharges their wallet, commission will be held in pending status for this many hours before moving to the withdrawable commission balance.
                </p>
              </div>

              {/* Danger Zone Box */}
              <div className="rounded-xl border border-rose-200/80 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/10 p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-2">
                <div>
                  <h5 className="text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Revoke State Manager Privileges
                  </h5>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Removes all manager powers, unlinks referred franchises, and hides the state manager portal.
                  </p>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm"
                  type="button"
                  onClick={() => handleRevokeClick(editForm.id)} 
                  className="h-8 px-3 rounded-lg text-xs font-semibold shrink-0"
                >
                  Revoke Power
                </Button>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-3.5 sm:p-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-2 bg-slate-50/50 dark:bg-slate-800/20">
              <Button 
                variant="outline" 
                type="button"
                onClick={() => setIsEditOpen(false)} 
                className="h-8 sm:h-9 px-3.5 rounded-lg text-xs font-semibold border-slate-200 dark:border-slate-700"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleEdit} 
                disabled={isSavingEdit}
                className="h-8 sm:h-9 px-4 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-sm"
              >
                {isSavingEdit ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* MODAL 2: PROMOTE TO STATE MANAGER (Rule 7 compliant) */}
        {/* ========================================================================= */}
        <Dialog open={isPromoteOpen} onOpenChange={setIsPromoteOpen}>
          <DialogContent className="max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-900">
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-amber-500/10 dark:bg-amber-900/10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30 text-amber-600 dark:text-amber-500 shrink-0">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    Promote to State Manager
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">
                    Grant master referral tracking, custom release delay, and commission portal access.
                  </DialogDescription>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-5 space-y-4">
              {/* Target franchise display */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Target Franchise</p>
                  <p className="font-semibold text-xs text-slate-900 dark:text-white mt-0.5">
                    {normalFranchises.find(f => f.id === promoteForm.workspaceId)?.name || "Selected Franchise"}
                  </p>
                </div>
                <Building2 className="h-4 w-4 text-slate-400" />
              </div>

              {/* Referral ID */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Referral ID (Unique 5-Digit Code)
                </label>
                <div className="relative flex items-center">
                  <Input 
                    className="h-8 sm:h-9 text-xs font-mono font-bold tracking-widest uppercase bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-lg pl-3 pr-16 text-slate-900 dark:text-white" 
                    placeholder="e.g. 12345" 
                    value={promoteForm.referralId} 
                    onChange={(e) => setPromoteForm({ ...promoteForm, referralId: e.target.value })} 
                  />
                  <div className="absolute right-1 flex items-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      disabled={isGeneratingPromoteId}
                      onClick={handleRegeneratePromoteReferralId}
                      className="h-7 w-7 text-slate-400 hover:text-amber-500 rounded-md"
                    >
                      <RefreshCw className={cn("h-3.5 w-3.5", isGeneratingPromoteId && "animate-spin text-amber-500")} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={() => copyToClipboard(promoteForm.referralId, "Referral ID")}
                      className="h-7 w-7 text-slate-400 hover:text-slate-700 rounded-md"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Release delay */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Commission Release Delay (Hours)
                </label>
                <Input 
                  type="number"
                  min="0"
                  max="720"
                  className="h-8 sm:h-9 text-xs font-bold bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-lg px-3" 
                  value={promoteForm.commissionReleaseHours} 
                  onChange={(e) => setPromoteForm({ ...promoteForm, commissionReleaseHours: parseInt(e.target.value || "0") })} 
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[0, 12, 24, 48].map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setPromoteForm({ ...promoteForm, commissionReleaseHours: h })}
                      className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-semibold border",
                        promoteForm.commissionReleaseHours === h
                          ? "bg-amber-500 text-white border-amber-600"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                      )}
                    >
                      {h === 0 ? "Immediate" : `${h}h`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 bg-slate-50/50 dark:bg-slate-800/20">
              <Button variant="outline" onClick={() => setIsPromoteOpen(false)} className="h-8 sm:h-9 px-3.5 rounded-lg text-xs font-semibold">
                Cancel
              </Button>
              <Button onClick={handlePromote} className="h-8 sm:h-9 px-4 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-sm">
                Confirm Promotion
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* MODAL 3: ASSIGN REFERRAL ID TO FRANCHISE (Rule 7 compliant) */}
        {/* ========================================================================= */}
        <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
          <DialogContent className="max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-900">
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-500 shrink-0">
                  <LinkIcon className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    Link Branch Under State Manager
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500 font-medium mt-0.5">
                    Assign this franchise under a State Manager hierarchy and configure revenue commission rules.
                  </DialogDescription>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-5 space-y-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Branch Franchise</p>
                  <p className="font-semibold text-xs text-slate-900 dark:text-white mt-0.5">
                    {normalFranchises.find(f => f.id === assignForm.workspaceId)?.name || "Target Franchise"}
                  </p>
                </div>
                <Building2 className="h-4 w-4 text-slate-400" />
              </div>

              {/* State Manager Selector or Manual Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Select Active State Manager
                </label>
                <Select 
                  value={assignForm.appliedReferralId || ""} 
                  onValueChange={(val: any) => setAssignForm({ ...assignForm, appliedReferralId: String(val || "") })}
                >
                  <SelectTrigger className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
                    <SelectValue placeholder="Choose a State Manager from list..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border border-slate-200 dark:border-slate-700">
                    {managers.filter(m => m.ownReferralId).map(m => (
                      <SelectItem key={m.id} value={m.ownReferralId as string} className="text-xs font-medium">
                        {m.name} ({m.ownReferralId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] text-slate-400">or type code manually:</span>
                  <Input 
                    placeholder="e.g. 98068"
                    value={assignForm.appliedReferralId}
                    onChange={(e) => setAssignForm({ ...assignForm, appliedReferralId: e.target.value.trim() })}
                    className="h-7 w-28 text-xs font-mono font-bold uppercase rounded-md bg-slate-50 dark:bg-slate-800/50"
                  />
                </div>
              </div>

              {assignForm.appliedReferralId && (
                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div>
                      <label className="text-xs font-semibold text-slate-900 dark:text-white">Enable Commission</label>
                      <p className="text-[10px] text-slate-500">Allow State Manager to earn on wallet recharges from this branch.</p>
                    </div>
                    <Switch 
                      checked={assignForm.isReferralCommissionEnabled}
                      onCheckedChange={(c) => setAssignForm({ ...assignForm, isReferralCommissionEnabled: c })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Commission Rate (%)</label>
                      <Input 
                        type="number"
                        placeholder="10"
                        value={assignForm.referralCommissionRate}
                        onChange={(e) => setAssignForm({ ...assignForm, referralCommissionRate: e.target.value })}
                        className="h-8 sm:h-9 text-xs bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-lg"
                      />
                      <div className="flex gap-1 pt-1">
                        {["5", "10", "15", "20"].map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setAssignForm({ ...assignForm, referralCommissionRate: r })}
                            className={cn(
                              "px-1.5 py-0.5 rounded text-[9px] font-bold border",
                              assignForm.referralCommissionRate === r 
                                ? "bg-primary text-white border-primary" 
                                : "bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700"
                            )}
                          >
                            {r}%
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Expiry Date</label>
                      <Input 
                        type="date"
                        value={assignForm.referralCommissionExpiry}
                        onChange={(e) => setAssignForm({ ...assignForm, referralCommissionExpiry: e.target.value })}
                        className="h-8 sm:h-9 text-xs bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-lg"
                      />
                      <div className="flex gap-1 pt-1">
                        <button
                          type="button"
                          onClick={() => setAssignForm({ ...assignForm, referralCommissionExpiry: "" })}
                          className={cn(
                            "px-1.5 py-0.5 rounded text-[9px] font-bold border",
                            !assignForm.referralCommissionExpiry
                              ? "bg-primary text-white border-primary"
                              : "bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700"
                          )}
                        >
                          Lifetime
                        </button>
                        <button
                          type="button"
                          onClick={() => setAssignForm({ ...assignForm, referralCommissionExpiry: defaultExpiryDate })}
                          className={cn(
                            "px-1.5 py-0.5 rounded text-[9px] font-bold border",
                            assignForm.referralCommissionExpiry === defaultExpiryDate
                              ? "bg-primary text-white border-primary"
                              : "bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700"
                          )}
                        >
                          1 Year
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3.5 sm:p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 bg-slate-50/50 dark:bg-slate-800/20">
              <Button variant="outline" onClick={() => setIsAssignOpen(false)} className="h-8 sm:h-9 px-3.5 rounded-lg text-xs font-semibold">
                Cancel
              </Button>
              <Button onClick={handleAssign} className="h-8 sm:h-9 px-4 rounded-lg text-xs font-semibold bg-primary text-primary-foreground shadow-sm">
                Confirm Link
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* MODAL 4: OVERRIDE COMMISSION SETTINGS (Rule 7 compliant) */}
        {/* ========================================================================= */}
        <Dialog open={isOverrideOpen} onOpenChange={setIsOverrideOpen}>
          <DialogContent className="max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-900">
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-500/10 flex items-center justify-center border border-slate-500/20 text-slate-500 shrink-0">
                  <Settings className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    Commission Rules & Validity
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500 font-medium mt-0.5">
                    Customize referral commission rates and expiry limits for this branch link.
                  </DialogDescription>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                <div>
                  <label className="text-xs font-semibold text-slate-900 dark:text-white">Enable Commission</label>
                  <p className="text-[10px] text-slate-500">Toggle whether the State Manager earns from wallet top-ups.</p>
                </div>
                <Switch 
                  checked={overrideForm.isReferralCommissionEnabled}
                  onCheckedChange={(c) => setOverrideForm({ ...overrideForm, isReferralCommissionEnabled: c })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Commission Rate (%)</label>
                  <Input 
                    type="number"
                    placeholder="10"
                    value={overrideForm.referralCommissionRate}
                    onChange={(e) => setOverrideForm({ ...overrideForm, referralCommissionRate: e.target.value })}
                    className="h-8 sm:h-9 text-xs bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                  <div className="flex gap-1 pt-1">
                    {["5", "10", "15", "20"].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setOverrideForm({ ...overrideForm, referralCommissionRate: r })}
                        className={cn(
                          "px-1.5 py-0.5 rounded text-[9px] font-bold border",
                          overrideForm.referralCommissionRate === r 
                            ? "bg-primary text-white border-primary" 
                            : "bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700"
                        )}
                      >
                        {r}%
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Expiry Date</label>
                  <Input 
                    type="date"
                    value={overrideForm.referralCommissionExpiry}
                    onChange={(e) => setOverrideForm({ ...overrideForm, referralCommissionExpiry: e.target.value })}
                    className="h-8 sm:h-9 text-xs bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                  <div className="flex gap-1 pt-1">
                    <button
                      type="button"
                      onClick={() => setOverrideForm({ ...overrideForm, referralCommissionExpiry: "" })}
                      className={cn(
                        "px-1.5 py-0.5 rounded text-[9px] font-bold border",
                        !overrideForm.referralCommissionExpiry
                          ? "bg-primary text-white border-primary"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700"
                      )}
                    >
                      Lifetime
                    </button>
                    <button
                      type="button"
                      onClick={() => setOverrideForm({ ...overrideForm, referralCommissionExpiry: defaultExpiryDate })}
                      className={cn(
                        "px-1.5 py-0.5 rounded text-[9px] font-bold border",
                        overrideForm.referralCommissionExpiry === defaultExpiryDate
                          ? "bg-primary text-white border-primary"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700"
                      )}
                    >
                      1 Year
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 bg-slate-50/50 dark:bg-slate-800/20">
              <Button variant="outline" onClick={() => setIsOverrideOpen(false)} className="h-8 sm:h-9 px-3.5 rounded-lg text-xs font-semibold">
                Cancel
              </Button>
              <Button onClick={handleOverride} className="h-8 sm:h-9 px-4 rounded-lg text-xs font-semibold bg-primary text-primary-foreground shadow-sm">
                Save Settings
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* MODAL 5: REJECT WITHDRAWAL DIALOG */}
        {/* ========================================================================= */}
        <Dialog open={rejectModal.open} onOpenChange={(open) => !open && setRejectModal({ open: false, transactionId: "", reason: "" })}>
          <DialogContent className="max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-900">
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-rose-50/50 dark:bg-rose-950/20">
              <DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
                Reject Commission Withdrawal
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 font-medium mt-0.5">
                The requested amount will be immediately refunded back to the State Manager's commission balance.
              </DialogDescription>
            </div>

            <div className="p-4 sm:p-5 space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Reason for Rejection <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="e.g., Invalid bank account details or pending invoice required..."
                value={rejectModal.reason}
                onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
                className="h-9 text-xs bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-lg"
              />
            </div>

            <div className="p-3.5 sm:p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 bg-slate-50/50 dark:bg-slate-800/20">
              <Button 
                variant="outline" 
                onClick={() => setRejectModal({ open: false, transactionId: "", reason: "" })}
                className="h-8 px-3 rounded-lg text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={submitRejectWithdrawal}
                className="h-8 px-3 rounded-lg text-xs font-semibold"
              >
                Reject & Refund
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Confirmation Dialogs */}
        <ConfirmDialog 
          open={!!managerToClear} 
          onOpenChange={(open) => !open && setManagerToClear(null)}
          title="Clear & Release Pending Commissions"
          description="Are you sure you want to manually unlock and credit all pending commissions for this State Manager right now, bypassing the release delay?"
          onConfirm={confirmClearNow}
          confirmText="Clear & Release"
          destructive={false}
        />

        <ConfirmDialog 
          open={!!managerToRevoke} 
          onOpenChange={(open) => !open && setManagerToRevoke(null)}
          title="Revoke State Manager Privileges"
          description="Are you sure you want to completely revoke State Manager access? They will lose their referral ID, all linked franchises will become independent, and the State Manager dashboard will be hidden."
          onConfirm={confirmRevoke}
          confirmText="Revoke Access"
          destructive={true}
        />

        <ConfirmDialog 
          open={!!franchiseToUnlink} 
          onOpenChange={(open) => !open && setFranchiseToUnlink(null)}
          title="Unlink Branch Franchise"
          description="Are you sure you want to remove the referral link from this franchise? They will become an independent franchise and their parent State Manager will no longer earn commissions from their recharges."
          onConfirm={async () => {
            if (!franchiseToUnlink) return;
            const res = await assignReferralToFranchise(franchiseToUnlink, null);
            if (res.success) {
              toast.success("Franchise successfully unlinked.");
              window.location.reload();
            } else {
              toast.error(res.error || "Failed to unlink franchise.");
            }
            setFranchiseToUnlink(null);
          }}
          confirmText="Unlink Branch"
          destructive={true}
        />
      </div>
    </TooltipProvider>
  );
}
