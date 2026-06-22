"use client";

import React, { useState, useMemo } from "react";
import { updateFranchiseCommissionSettings, promoteToStateManager, updateStateManagerConfig, assignReferralToFranchise, generateUniqueReferralId, clearPendingCommissions, revokeStateManager } from "@/app/actions/state-manager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";
import { Settings, Building2, Link as LinkIcon, Edit2, ShieldCheck, Shield, Network, Search, Download, ChevronLeft, ChevronRight, CheckCircle2, Copy, Unlink } from "lucide-react";
import { AdminPageHeader } from "@/components/layout/AdminPageHeader";
import { cn } from "@/lib/utils";

export function StateManagerClient({ initialManagers, franchises, allWithdrawals = [] }: { initialManagers: any[], franchises: any[], allWithdrawals?: any[] }) {
  const [managers, setManagers] = useState(initialManagers);
  const [activeTab, setActiveTab] = useState<"managers" | "hierarchy" | "withdrawals">("managers");
  
  // Ensure state syncs if props change during client navigation
  React.useEffect(() => {
    setManagers(initialManagers);
  }, [initialManagers]);
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
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
  const [promoteForm, setPromoteForm] = useState({ workspaceId: "", referralId: "" });
  
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<any>({});

  // Default 1 year expiry
  const defaultExpiryDate = new Date();
  defaultExpiryDate.setFullYear(defaultExpiryDate.getFullYear() + 1);
  const formattedDefaultExpiry = defaultExpiryDate.toISOString().split('T')[0];

  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({ workspaceId: "", appliedReferralId: "", referralCommissionRate: "10", referralCommissionExpiry: formattedDefaultExpiry, isReferralCommissionEnabled: true });

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

  const filteredHistoryWithdrawals = useMemo(() => {
    if (!historySearchQuery) return historyWithdrawals;
    const q = historySearchQuery.toLowerCase();
    return historyWithdrawals.filter(w => {
      const nameMatch = w.workspace?.name?.toLowerCase().includes(q) || false;
      const refMatch = w.workspace?.ownReferralId?.toLowerCase().includes(q) || false;
      const dateMatch = new Date(w.createdAt).toLocaleString().toLowerCase().includes(q) || false;
      return nameMatch || refMatch || dateMatch;
    });
  }, [historyWithdrawals, historySearchQuery]);

  const handlePromote = async () => {
    if (!promoteForm.workspaceId || !promoteForm.referralId) return toast.error("Please fill required fields");
    
    const res = await promoteToStateManager(promoteForm.workspaceId, promoteForm.referralId);
    
    if (res.success) {
      toast.success("Promoted to State Manager successfully");
      setIsPromoteOpen(false);
      window.location.reload();
    } else {
      toast.error(res.error || "Failed to promote");
    }
  };

  const handleEdit = async () => {
    const res = await updateStateManagerConfig(editForm.id, {
      commissionReleaseHours: parseInt(editForm.commissionReleaseHours || "24"),
      referralId: editForm.ownReferralId
    });

    if (res.success) {
      toast.success("Configuration updated");
      setIsEditOpen(false);
      window.location.reload();
    } else {
      toast.error(res.error || "Failed to update");
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
      toast.success("Referral assigned successfully");
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

  const handleClearNow = async (id: string) => {
    if(!confirm("Are you sure you want to clear and release all pending commissions for this State Manager?")) return;
    const res = await clearPendingCommissions(id);
    if(res.success) {
      toast.success(res.message || `Cleared ${formatCurrency(res.amountCleared || 0)} successfully.`);
      window.location.reload();
    } else {
      toast.error(res.error || "Failed to clear commissions.");
    }
  };

  const handleRevoke = async (id: string) => {
    if(!confirm("Are you sure you want to completely revoke State Manager access? They will lose all referral capabilities and the menu will be hidden from their dashboard.")) return;
    const res = await revokeStateManager(id);
    if(res.success) {
      toast.success("State Manager access revoked.");
      setIsEditOpen(false);
      window.location.reload();
    } else {
      toast.error(res.error || "Failed to revoke access.");
    }
  };

  const handleApproveWithdrawal = async (transactionId: string) => {
    const { approveCommissionWithdrawal } = await import("@/app/actions/state-manager");
    const res = await approveCommissionWithdrawal(transactionId);
    if(res.success) {
      toast.success("Withdrawal approved successfully.");
      window.location.reload();
    } else {
      toast.error(res.error || "Failed to approve withdrawal.");
    }
  };

  const handleRejectWithdrawal = async (transactionId: string) => {
    const reason = prompt("Enter a reason for rejection:");
    if (reason === null) return;
    const { rejectCommissionWithdrawal } = await import("@/app/actions/state-manager");
    const res = await rejectCommissionWithdrawal(transactionId, reason);
    if(res.success) {
      toast.success("Withdrawal rejected and refunded.");
      window.location.reload();
    } else {
      toast.error(res.error || "Failed to reject withdrawal.");
    }
  };

  const normalFranchises = franchises.filter(f => !f.isStateManager);
  const linkedFranchisesCount = normalFranchises.filter(f => f.referredBy).length;
  const independentFranchisesCount = normalFranchises.length - linkedFranchisesCount;
  
  // Memoized Lists & Pagination logic
  const filteredManagers = useMemo(() => {
    return managers.filter(m => 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (m.ownReferralId && m.ownReferralId.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [managers, searchQuery]);

  const totalPagesManagers = Math.ceil(filteredManagers.length / itemsPerPage);
  const paginatedManagers = useMemo(() => {
    const start = (currentPageManagers - 1) * itemsPerPage;
    return filteredManagers.slice(start, start + itemsPerPage);
  }, [filteredManagers, currentPageManagers, itemsPerPage]);

  const filteredHierarchy = useMemo(() => {
    return normalFranchises.filter(f => {
      const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.subdomain.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLink = showOnlyLinked ? f.referredBy !== null : true;
      return matchesSearch && matchesLink;
    });
  }, [normalFranchises, searchQuery, showOnlyLinked]);

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

  React.useEffect(() => { setCurrentPageManagers(1); }, [searchQuery, itemsPerPage]);
  React.useEffect(() => { setCurrentPageHierarchy(1); }, [searchQuery, showOnlyLinked, itemsPerPage]);
  React.useEffect(() => { setCurrentPageHistory(1); }, [historySearchQuery]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
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
          <Button variant="outline" size="sm" onClick={() => setPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="h-9 px-3 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-10 pb-12 w-full mx-auto">
      <AdminPageHeader 
        title="State Managers" 
        description="Manage franchise referrals, set commission hierarchies, and monitor network growth."
      >
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="h-11 px-6 rounded-xl gap-2 font-bold shadow-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            onClick={() => toast.info("Report downloading will be available soon!")}
          >
            <Download className="h-4 w-4" /> Download Report
          </Button>
        </div>
      </AdminPageHeader>

      {/* Sync platform statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total State Managers", value: managers.length, icon: Shield, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Independent Franchises", value: independentFranchisesCount, icon: Building2, color: "text-purple-500", bg: "bg-purple-500/10" },
          { label: "Referred Franchises", value: linkedFranchisesCount, icon: Network, color: "text-emerald-500", bg: "bg-emerald-500/10" },
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
      <div className="flex items-center justify-between mt-2 flex-wrap gap-4">
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/50 w-fit">
          <button
            onClick={() => setActiveTab("managers")}
            className={cn(
              "px-5 py-2 rounded-lg text-sm font-bold transition-all",
              activeTab === "managers"
                ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            State Managers
          </button>
          <button
            onClick={() => setActiveTab("hierarchy")}
            className={cn(
              "px-5 py-2 rounded-lg text-sm font-bold transition-all",
              activeTab === "hierarchy"
                ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            Franchise Hierarchy
          </button>
          <button
            onClick={() => setActiveTab("withdrawals")}
            className={cn(
              "px-5 py-2 rounded-lg text-sm font-bold transition-all relative",
              activeTab === "withdrawals"
                ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            Pending Withdrawals
            {pendingWithdrawals.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                {pendingWithdrawals.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === "managers" && (
        <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden transition-all duration-500">
          <CardHeader className="p-6 md:p-8 border-b border-slate-50 dark:border-slate-800/50">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:max-w-[450px] group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <Input 
                  placeholder="Search state managers by name or ID..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 pr-4 bg-slate-50 dark:bg-slate-800/40 border-none rounded-2xl h-14 font-bold text-sm transition-all focus-visible:ring-2 focus-visible:ring-primary/20 placeholder:text-slate-400 placeholder:font-medium" 
                />
              </div>
              <div className="flex items-center gap-3 self-end md:self-auto w-full md:w-auto">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden md:inline">Show</span>
                <Select value={itemsPerPage.toString()} onValueChange={(v) => setItemsPerPage(Number(v))}>
                  <SelectTrigger className="w-24 h-14 bg-slate-50 dark:bg-slate-800/40 border-none rounded-2xl font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl">
                    <SelectItem value="10" className="rounded-lg font-bold">10</SelectItem>
                    <SelectItem value="20" className="rounded-lg font-bold">20</SelectItem>
                    <SelectItem value="50" className="rounded-lg font-bold">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {paginatedManagers.length === 0 ? (
              <div className="text-center py-20">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 mb-4">
                  <ShieldCheck className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">No State Managers</h3>
                <p className="text-sm font-medium text-slate-500 mt-1">There are no state managers matching your search.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {paginatedManagers.map((m) => {
                  // Determine badge based on whether they have ANY referred workspaces
                  const hasReferrals = m._count.referredWorkspaces > 0;
                  return (
                    <div key={m.id} className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-6 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/30 border-l-4 border-amber-500 transition-all gap-6 group">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0">
                          <ShieldCheck className="h-6 w-6 text-amber-500" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-sm text-slate-900 dark:text-white">{m.name}</p>
                            {!hasReferrals ? (
                              <Badge className="bg-slate-500/10 text-slate-600 border-0 shadow-none font-bold text-[10px] uppercase tracking-widest px-2 py-0">No Referrals</Badge>
                            ) : (
                              <Badge className="bg-amber-500/10 text-amber-600 border-0 shadow-none font-bold text-[10px] uppercase tracking-widest px-2 py-0">Active</Badge>
                            )}
                          </div>
                          <p className="text-xs font-medium text-slate-500 mt-0.5">{m._count.referredWorkspaces} referrals attached</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 w-full lg:w-auto">
                        <div className="flex flex-wrap md:flex-nowrap gap-4 md:gap-8 w-full md:w-auto bg-slate-50 dark:bg-slate-800/40 lg:bg-transparent p-4 lg:p-0 rounded-xl">
                          <div className="text-left md:text-right w-1/2 md:w-auto">
                            <div className="flex items-center md:justify-end gap-1.5">
                              <p className="font-bold font-mono text-sm text-slate-900 dark:text-white">{m.ownReferralId}</p>
                              <button 
                                onClick={() => { navigator.clipboard.writeText(m.ownReferralId); toast.success("Referral ID copied!"); }}
                                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                                title="Copy Referral ID"
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Referral ID</p>
                          </div>
                          <div className="text-left md:text-right w-1/2 md:w-auto">
                            <p className="font-black text-sm text-slate-900 dark:text-white">{m.displayRate}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Commission</p>
                          </div>
                          <div className="text-left md:text-right w-1/2 md:w-auto">
                            <p className="font-bold text-sm text-emerald-600 dark:text-emerald-400">{formatCurrency(m.totalEarned || 0)}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total Earned</p>
                          </div>
                          <div className="text-left md:text-right w-1/2 md:w-auto">
                            <div className="flex items-center md:justify-end gap-2">
                              <p className="font-bold text-sm text-amber-500">{formatCurrency(m.totalPending || 0)}</p>
                              {m.totalPending > 0 && (
                                <button onClick={() => handleClearNow(m.id)} className="text-[10px] bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 px-2 py-0.5 rounded-md font-bold transition-colors">Clear Now</button>
                              )}
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Pending</p>
                          </div>
                          <div className="text-left md:text-right w-1/2 md:w-auto md:w-24">
                            <p className="font-medium text-sm text-slate-900 dark:text-white">
                              {m.displayValidity}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Validity</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full lg:w-auto mt-2 lg:mt-0">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => { setEditForm(m); setIsEditOpen(true); }} 
                            className="h-10 px-4 rounded-xl font-bold bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 flex-1 lg:flex-none shadow-sm hover:bg-slate-50"
                          >
                            <Edit2 className="w-4 h-4 mr-2" /> Edit
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

      {activeTab === "hierarchy" && (
        <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden transition-all duration-500">
          <CardHeader className="p-6 md:p-8 border-b border-slate-50 dark:border-slate-800/50">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:max-w-[650px]">
                <div className="relative w-full group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400" />
                  </div>
                  <Input 
                    placeholder="Search normal franchises..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-11 pr-4 bg-slate-50 dark:bg-slate-800/40 border-none rounded-2xl h-14 font-bold text-sm transition-all focus-visible:ring-2 focus-visible:ring-primary/20 placeholder:text-slate-400 placeholder:font-medium" 
                  />
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-2xl h-14">
                  <Switch id="linked-toggle" checked={showOnlyLinked} onCheckedChange={setShowOnlyLinked} />
                  <label htmlFor="linked-toggle" className="text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer pr-2">Linked Only</label>
                </div>
              </div>
              <div className="flex items-center gap-3 self-end lg:self-auto w-full sm:w-auto">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden sm:inline">Show</span>
                <Select value={itemsPerPage.toString()} onValueChange={(v) => setItemsPerPage(Number(v))}>
                  <SelectTrigger className="w-full sm:w-24 h-14 bg-slate-50 dark:bg-slate-800/40 border-none rounded-2xl font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl">
                    <SelectItem value="10" className="rounded-lg font-bold">10</SelectItem>
                    <SelectItem value="20" className="rounded-lg font-bold">20</SelectItem>
                    <SelectItem value="50" className="rounded-lg font-bold">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {paginatedHierarchy.length === 0 ? (
              <div className="text-center py-20">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 mb-4">
                  <Building2 className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Franchises</h3>
                <p className="text-sm font-medium text-slate-500 mt-1">There are no normal franchises matching your criteria.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {paginatedHierarchy.map((f) => {
                  const isLinked = f.referredBy !== null;
                  return (
                    <div 
                      key={f.id} 
                      className={cn(
                        "flex flex-col xl:flex-row items-start xl:items-center justify-between p-6 transition-all gap-6 group border-l-4",
                        isLinked 
                          ? "bg-emerald-50/30 dark:bg-emerald-900/10 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border-emerald-400" 
                          : "bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/30 border-transparent"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0",
                          isLinked ? "bg-emerald-500/10" : "bg-indigo-500/10"
                        )}>
                          <Building2 className={cn("h-6 w-6", isLinked ? "text-emerald-600" : "text-indigo-600")} />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-900 dark:text-white">{f.name}</p>
                          <p className="text-xs font-medium text-slate-500 mt-0.5">Domain: {f.subdomain}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 w-full xl:w-auto">
                        <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0 order-2 md:order-1">
                          {!isLinked ? (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={async () => { 
                                  const uniqueId = await generateUniqueReferralId();
                                  setPromoteForm({ ...promoteForm, workspaceId: f.id, referralId: uniqueId }); 
                                  setIsPromoteOpen(true); 
                                }} 
                                className="h-10 px-4 rounded-xl font-bold bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 flex-1 md:flex-none text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-500/10 shadow-sm transition-all"
                              >
                                <ShieldCheck className="w-4 h-4 mr-2" /> Make State Manager
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => { setAssignForm({ ...assignForm, workspaceId: f.id, appliedReferralId: "", referralCommissionRate: "10", referralCommissionExpiry: formattedDefaultExpiry }); setIsAssignOpen(true); }} 
                                className="h-10 px-4 rounded-xl font-bold bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 flex-1 md:flex-none text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all"
                              >
                                <LinkIcon className="w-4 h-4 mr-2" /> Link Referral
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={async () => {
                                  if (confirm("Are you sure you want to unlink this franchise?")) {
                                    const res = await assignReferralToFranchise(f.id, null);
                                    if (res.success) {
                                      toast.success("Franchise unlinked.");
                                      window.location.reload();
                                    } else {
                                      toast.error(res.error || "Failed to unlink.");
                                    }
                                  }
                                }} 
                                className="h-10 px-4 rounded-xl font-bold bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 flex-1 md:flex-none text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10 shadow-sm transition-all"
                              >
                                <Unlink className="w-4 h-4 mr-2" /> Unlink
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => { 
                                  setOverrideForm({ 
                                    workspaceId: f.id,
                                    isReferralCommissionEnabled: f.isReferralCommissionEnabled ?? true,
                                    referralCommissionRate: f.referralCommissionRate?.toString() || "0",
                                    referralCommissionExpiry: f.referralCommissionExpiry ? new Date(f.referralCommissionExpiry).toISOString().split('T')[0] : ""
                                  }); 
                                  setIsOverrideOpen(true); 
                                }} 
                                className="h-10 px-4 rounded-xl font-bold bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 flex-1 md:flex-none text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all"
                              >
                                <Settings className="w-4 h-4 mr-2" /> Settings
                              </Button>
                            </>
                          )}
                        </div>

                        <div className="text-left md:text-right w-full md:w-auto bg-slate-50 dark:bg-slate-800/40 xl:bg-transparent p-4 xl:p-0 rounded-xl order-1 md:order-2">
                          {f.referredBy ? (
                            <div className="flex flex-col md:items-start xl:items-end">
                              <div className="flex items-center gap-2">
                                <Badge className="bg-emerald-500/10 text-emerald-700 border-0 shadow-none font-bold font-mono tracking-widest text-[10px]">
                                  {f.appliedReferralId}
                                </Badge>
                                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                              </div>
                              <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">{f.referredBy.name}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Linked State Manager</p>
                            </div>
                          ) : (
                            <div className="flex flex-col md:items-start xl:items-end">
                              <span className="text-sm font-bold text-slate-400 italic">No Referral</span>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Status</p>
                            </div>
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

      {activeTab === "withdrawals" && (
        <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden transition-all duration-500">
          <CardHeader className="p-6 md:p-8 border-b border-slate-50 dark:border-slate-800/50 flex flex-row items-center justify-between">
            <h2 className="text-xl font-bold">Withdrawal Requests</h2>
            <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg">
              <button
                onClick={() => setWithdrawalTab("pending")}
                className={cn("px-4 py-1.5 rounded-md text-sm font-bold transition-all", withdrawalTab === "pending" ? "bg-white dark:bg-slate-700 shadow-sm text-primary" : "text-slate-500")}
              >
                Pending
              </button>
              <button
                onClick={() => setWithdrawalTab("history")}
                className={cn("px-4 py-1.5 rounded-md text-sm font-bold transition-all", withdrawalTab === "history" ? "bg-white dark:bg-slate-700 shadow-sm text-primary" : "text-slate-500")}
              >
                History
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {withdrawalTab === "pending" ? (
              pendingWithdrawals.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-sm font-medium text-slate-500">No pending withdrawal requests.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                  {paginatedPending.map((req) => (
                    <div key={req.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-800/30 gap-6">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{req.workspace.name} ({req.workspace.ownReferralId})</p>
                        <p className="text-xs text-slate-500 mt-1">Requested: {new Date(req.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right mr-4">
                          <p className="font-black text-emerald-600">{formatCurrency(req.amount)}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Amount</p>
                        </div>
                        <Button size="sm" onClick={() => handleApproveWithdrawal(req.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9">
                          Approve
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleRejectWithdrawal(req.id)} className="font-bold h-9">
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                  {renderPagination(currentPagePending, totalPagesPending, setCurrentPagePending)}
                </div>
              )
            ) : (
              historyWithdrawals.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-sm font-medium text-slate-500">No withdrawal history found.</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  <div className="p-4 border-b border-slate-50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20">
                    <div className="relative max-w-md">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input 
                        placeholder="Search by workspace, referral ID, or date..." 
                        value={historySearchQuery}
                        onChange={(e) => setHistorySearchQuery(e.target.value)}
                        className="pl-9 h-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl"
                      />
                    </div>
                  </div>
                  
                  {filteredHistoryWithdrawals.length === 0 ? (
                    <div className="text-center py-16">
                      <p className="text-sm font-medium text-slate-500">No matches found for "{historySearchQuery}".</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                      {paginatedHistory.map((req) => (
                        <div key={req.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-800/30 gap-6">
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{req.workspace.name} ({req.workspace.ownReferralId})</p>
                            <p className="text-xs text-slate-500 mt-1">Date: {new Date(req.createdAt).toLocaleString()}</p>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <p className={cn("font-black", req.status === "APPROVED" ? "text-emerald-600" : "text-red-600")}>
                                {formatCurrency(req.amount)}
                              </p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Amount</p>
                            </div>
                            <Badge variant="outline" className={cn("font-bold border-0 shadow-none px-3 py-1", req.status === "APPROVED" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400")}>
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

      {/* Assign Dialog */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent className="max-w-xl rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
          <div className="p-8 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-slate-500/10 flex items-center justify-center border border-slate-500/20">
                <LinkIcon className="h-7 w-7 text-slate-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Assign Referral ID</h2>
                <p className="text-slate-500 font-medium text-sm">Manually map a normal franchise under an active State Manager.</p>
              </div>
            </div>
          </div>
          <div className="p-8 space-y-6 bg-white dark:bg-slate-900">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Target Franchise</p>
                <p className="font-bold text-slate-900 dark:text-white">{normalFranchises.find(f => f.id === assignForm.workspaceId)?.name || "Unknown"}</p>
              </div>
              <Building2 className="h-5 w-5 text-slate-400" />
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 ml-1">Referral ID to Apply</label>
                <Input 
                  className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 px-4 font-bold uppercase tracking-widest text-slate-900 dark:text-white placeholder:text-slate-400 placeholder:normal-case placeholder:tracking-normal" 
                  placeholder="Enter Referral ID" 
                  value={assignForm.appliedReferralId || ''} 
                  onChange={(e) => setAssignForm({ ...assignForm, appliedReferralId: e.target.value })} 
                />
              </div>

              {assignForm.appliedReferralId && (
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div>
                      <label className="text-sm font-bold text-slate-900 dark:text-white">Enable Commission</label>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">Toggle whether the State Manager earns from this franchise.</p>
                    </div>
                    <Switch 
                      checked={assignForm.isReferralCommissionEnabled}
                      onCheckedChange={(c) => setAssignForm({ ...assignForm, isReferralCommissionEnabled: c })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Commission Rate (%)</label>
                      <div className="relative">
                        <Input 
                          type="number"
                          placeholder="e.g., 10"
                          value={assignForm.referralCommissionRate}
                          onChange={(e) => setAssignForm({ ...assignForm, referralCommissionRate: e.target.value })}
                          className="h-12 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 rounded-xl"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Expiry Date</label>
                      <Input 
                        type="date"
                        value={assignForm.referralCommissionExpiry}
                        onChange={(e) => setAssignForm({ ...assignForm, referralCommissionExpiry: e.target.value })}
                        className="h-12 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="p-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-end gap-3 bg-slate-50/30 dark:bg-slate-800/20">
            <Button variant="ghost" onClick={() => setIsAssignOpen(false)} className="h-12 px-6 rounded-xl font-bold">Cancel</Button>
            <Button onClick={handleAssign} className="h-12 px-8 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white text-white shadow-lg font-bold">Assign Referral</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Promote Dialog */}
      <Dialog open={isPromoteOpen} onOpenChange={setIsPromoteOpen}>
        <DialogContent className="max-w-2xl rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
          <div className="p-8 border-b border-slate-50 dark:border-slate-800 bg-amber-500/10 dark:bg-amber-900/10">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                <ShieldCheck className="h-7 w-7 text-amber-600 dark:text-amber-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Promote to State Manager</h2>
                <p className="text-slate-600 dark:text-slate-400 font-medium text-sm">Elevate a franchise to unlock custom referral tracking and commissions.</p>
              </div>
            </div>
          </div>
          <div className="p-8 space-y-6 bg-white dark:bg-slate-900">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Target Franchise</p>
                <p className="font-bold text-slate-900 dark:text-white">{normalFranchises.find(f => f.id === promoteForm.workspaceId)?.name || "Unknown"}</p>
              </div>
              <Building2 className="h-5 w-5 text-slate-400" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 ml-1">Referral ID (Unique)</label>
              <div className="relative">
                <Input className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 px-4 pr-12 font-bold font-mono tracking-widest text-slate-900 dark:text-white" placeholder="e.g. 12345" value={promoteForm.referralId} onChange={(e) => setPromoteForm({ ...promoteForm, referralId: e.target.value })} />
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={() => { navigator.clipboard.writeText(promoteForm.referralId); toast.success("Referral ID copied!"); }}
                  className="absolute right-1 top-1 h-10 w-10 text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="p-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-end gap-3 bg-slate-50/30 dark:bg-slate-800/20">
            <Button variant="ghost" onClick={() => setIsPromoteOpen(false)} className="h-12 px-6 rounded-xl font-bold">Cancel</Button>
            <Button onClick={handlePromote} className="h-12 px-8 rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 font-bold">Confirm Promotion</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
          <div className="p-8 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <Edit2 className="h-7 w-7 text-amber-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Edit State Manager</h2>
                <p className="text-slate-500 font-medium text-sm">Update settings for {editForm.name}.</p>
              </div>
            </div>
          </div>
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 ml-1">Referral ID</label>
              <Input className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 px-4 font-bold uppercase tracking-widest text-slate-900 dark:text-white" value={editForm.ownReferralId || ''} onChange={(e) => setEditForm({ ...editForm, ownReferralId: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 ml-1">Release Delay (Hours)</label>
              <Input type="number" className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 px-4 font-bold text-slate-900 dark:text-white" value={editForm.commissionReleaseHours ?? 24} onChange={(e) => setEditForm({ ...editForm, commissionReleaseHours: e.target.value })} />
            </div>
          </div>
          <div className="p-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-slate-800/20">
             <Button variant="destructive" onClick={() => handleRevoke(editForm.id)} className="h-12 px-6 rounded-xl font-bold shadow-lg">Revoke Power</Button>
             <div className="flex gap-3">
               <Button variant="ghost" onClick={() => setIsEditOpen(false)} className="h-12 px-6 rounded-xl font-bold">Cancel</Button>
               <Button onClick={handleEdit} className="h-12 px-8 rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 font-bold">Save Changes</Button>
             </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Override Dialog */}
      <Dialog open={isOverrideOpen} onOpenChange={setIsOverrideOpen}>
        <DialogContent className="max-w-xl rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
          <div className="p-8 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-slate-500/10 flex items-center justify-center border border-slate-500/20">
                <Settings className="h-7 w-7 text-slate-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Commission Settings</h2>
                <p className="text-slate-500 font-medium text-sm">Manage referral commission rules for this specific franchise link.</p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-6 bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div>
                <label className="text-sm font-bold text-slate-900 dark:text-white">Enable Commission</label>
                <p className="text-xs font-medium text-slate-500 mt-0.5">Toggle whether the State Manager earns from this franchise.</p>
              </div>
              <Switch 
                checked={overrideForm.isReferralCommissionEnabled}
                onCheckedChange={(c) => setOverrideForm({ ...overrideForm, isReferralCommissionEnabled: c })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Commission Rate (%)</label>
                <div className="relative">
                  <Input 
                    type="number"
                    placeholder="e.g., 10"
                    value={overrideForm.referralCommissionRate}
                    onChange={(e) => setOverrideForm({ ...overrideForm, referralCommissionRate: e.target.value })}
                    className="h-12 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 rounded-xl"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Expiry Date</label>
                <Input 
                  type="date"
                  value={overrideForm.referralCommissionExpiry}
                  onChange={(e) => setOverrideForm({ ...overrideForm, referralCommissionExpiry: e.target.value })}
                  className="h-12 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 font-medium"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={() => setIsOverrideOpen(false)} variant="outline" className="flex-1 h-12 rounded-xl font-bold bg-white dark:bg-slate-900">Cancel</Button>
              <Button onClick={handleOverride} className="flex-1 h-12 rounded-xl font-bold bg-primary text-primary-foreground">Save Settings</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
