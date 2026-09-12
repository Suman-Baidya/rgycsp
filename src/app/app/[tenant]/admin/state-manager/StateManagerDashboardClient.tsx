"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Wallet, Users, Clock, IndianRupee, Copy, ArrowRightLeft, ArrowDownToLine, Receipt, ChevronLeft, ChevronRight, Percent, Search, Filter, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { requestCommissionWithdrawal, transferCommissionToWallet, getReferredFranchiseRecharges } from "@/app/actions/state-manager";

export function StateManagerDashboardClient({ 
  workspaceId, 
  config, 
  referredWorkspaces, 
  commissions, 
  stats 
}: any) {
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [activeTab, setActiveTab] = useState<"referred" | "commissions">("referred");

  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  const [selectedFranchiseRecharges, setSelectedFranchiseRecharges] = useState<any>(null);
  const [isLoadingRecharges, setIsLoadingRecharges] = useState(false);

  const [itemsPerPageReferred] = useState(10);
  const [itemsPerPageCommissions] = useState(20);

  const [currentPageReferred, setCurrentPageReferred] = useState(1);
  const [currentPageCommissions, setCurrentPageCommissions] = useState(1);

  const [txSearchQuery, setTxSearchQuery] = useState("");
  const [txTypeFilter, setTxTypeFilter] = useState("ALL");
  const [txSortOrder, setTxSortOrder] = useState("NEWEST");

  const paginate = (items: any[], currentPage: number, itemsPerPageCount: number) => {
    const start = (currentPage - 1) * itemsPerPageCount;
    return items.slice(start, start + itemsPerPageCount);
  };

  const renderPagination = (currentPage: number, totalItems: number, itemsPerPageCount: number, setPage: (p: number) => void) => {
    const totalPages = Math.ceil(totalItems / itemsPerPageCount);
    if (totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20">
        <div className="text-xs font-medium text-slate-500">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" onClick={() => setPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="h-7 px-2 rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm text-xs">
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="h-7 px-2 rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm text-xs">
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    );
  };

  const formatDate = (dateInput: string | Date) => {
    const d = new Date(dateInput);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}/${d.getFullYear()}`;
  };

  const handleViewRecharges = async (franchiseId: string) => {
    setIsLoadingRecharges(true);
    setIsRechargeModalOpen(true);
    const res = await getReferredFranchiseRecharges(workspaceId, franchiseId);
    if (res.success) {
      setSelectedFranchiseRecharges(res.data);
    } else {
      toast.error(res.error || "Failed to load recharges");
      setIsRechargeModalOpen(false);
    }
    setIsLoadingRecharges(false);
  };

  const filteredCommissions = commissions.filter((c: any) => {
    let match = true;
    if (txSearchQuery) {
      const q = txSearchQuery.toLowerCase();
      const dateStr = formatDate(c.createdAt).toLowerCase();
      match = match && (c.description?.toLowerCase().includes(q) || dateStr.includes(q));
    }
    if (txTypeFilter !== "ALL") {
      if (txTypeFilter === "EARNINGS") match = match && c.isCommission && c.type === 'CREDIT';
      if (txTypeFilter === "WITHDRAWALS") match = match && c.isCommissionWithdrawal;
      if (txTypeFilter === "TRANSFERS") match = match && c.isCommissionTransfer;
    }
    return match;
  });

  filteredCommissions.sort((a: any, b: any) => {
    const dA = new Date(a.createdAt).getTime();
    const dB = new Date(b.createdAt).getTime();
    return txSortOrder === "NEWEST" ? dB - dA : dA - dB;
  });

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) return toast.error("Enter a valid amount");
    if (amount > config.commissionBalance) return toast.error("Insufficient commission balance");

    const res = await requestCommissionWithdrawal(workspaceId, amount);
    if (res.success) {
      toast.success("Withdrawal request submitted successfully");
      setIsWithdrawOpen(false);
      setWithdrawAmount("");
    } else {
      toast.error(res.error || "Failed to submit request");
    }
  };

  const handleTransfer = async () => {
    const amount = parseFloat(transferAmount);
    if (!amount || amount <= 0) return toast.error("Enter a valid amount");
    if (amount > config.commissionBalance) return toast.error("Insufficient commission balance");

    const res = await transferCommissionToWallet(workspaceId, amount);
    if (res.success) {
      toast.success("Transferred to Wallet successfully");
      setIsTransferOpen(false);
      setTransferAmount("");
    } else {
      toast.error(res.error || "Failed to transfer");
    }
  };

  const copyReferralId = () => {
    if (config.referralId) {
      navigator.clipboard.writeText(config.referralId);
      toast.success("Referral ID copied to clipboard!");
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 w-full mx-auto">
      {/* Metric / Stat Cards Grid (Rule 7.2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-3.5 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Available Balance</p>
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Wallet className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center mb-2">
                <IndianRupee className="h-4 w-4 mr-0.5 text-slate-400" />
                {config.commissionBalance.toFixed(2)}
              </div>
            </div>
            <div className="flex gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
              <Button size="sm" onClick={() => setIsWithdrawOpen(true)} className="flex-1 rounded-lg text-xs font-semibold h-7">
                Withdraw
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsTransferOpen(true)} className="flex-1 rounded-lg text-xs font-semibold h-7">
                To Wallet
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-3.5 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Total Earned</p>
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <IndianRupee className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center mb-1">
                <IndianRupee className="h-4 w-4 mr-0.5 text-slate-400" />
                {stats.totalEarned.toFixed(2)}
              </div>
            </div>
            <p className="text-[10px] font-medium text-slate-400 pt-1">Lifetime earnings</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-3.5 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Pending Release</p>
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Clock className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center mb-1">
                <IndianRupee className="h-4 w-4 mr-0.5 text-slate-400" />
                {stats.totalPending.toFixed(2)}
              </div>
            </div>
            <p className="text-[10px] font-medium text-slate-400 pt-1">Processing release</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-3.5 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Referral Info</p>
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Building2 className="h-4 w-4" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 mb-1">
                <div className="text-base sm:text-lg font-bold font-mono tracking-wider text-slate-900 dark:text-white truncate">
                  {config.referralId || "Not Set"}
                </div>
                <Button size="icon" variant="ghost" onClick={copyReferralId} className="h-6 w-6 text-slate-400 hover:text-slate-900 dark:hover:text-white shrink-0">
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400 pt-1">
              <Badge variant="outline" className="text-[9px] font-bold text-purple-600 dark:text-purple-400 border-none bg-purple-500/10 px-1 py-0">
                <Percent className="w-2.5 h-2.5 mr-0.5" /> {config.commission}%
              </Badge>
              <span>{referredWorkspaces.length} Referrals</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Pill Container (Rule 7.3) */}
      <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-1.5 p-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-full">
        {[
          { id: "referred", label: "Referred Franchises", icon: Users },
          { id: "commissions", label: "Commission History", icon: Receipt },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium shrink-0 whitespace-nowrap transition-all",
              activeTab === tab.id
                ? "bg-slate-100 dark:bg-slate-800 text-primary dark:text-white font-semibold shadow-inner"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50"
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {activeTab === "referred" && (
          <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden bg-white dark:bg-slate-900">
            <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                <Users className="w-4 h-4 text-primary" />
                Referred Franchises ({referredWorkspaces.length})
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">Institutes registered using your Referral ID.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {referredWorkspaces.length === 0 ? (
                <div className="text-center py-12 text-xs font-medium text-slate-500">
                  No franchises have used your referral ID yet.
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-slate-50/70 dark:bg-slate-800/50">
                    <TableRow className="border-slate-100 dark:border-slate-800 h-9">
                      <TableHead className="px-3.5 py-2 text-xs font-semibold text-slate-500 w-16">SL No</TableHead>
                      <TableHead className="px-3.5 py-2 text-xs font-semibold text-slate-500">Institute Name</TableHead>
                      <TableHead className="px-3.5 py-2 text-xs font-semibold text-slate-500">Total Earned</TableHead>
                      <TableHead className="px-3.5 py-2 text-xs font-semibold text-slate-500">Opening Date</TableHead>
                      <TableHead className="text-right px-3.5 py-2 text-xs font-semibold text-slate-500">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {paginate(referredWorkspaces, currentPageReferred, itemsPerPageReferred).map((rw: any, idx: number) => (
                      <TableRow key={rw.id} className="border-slate-100 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <TableCell className="px-3.5 py-2.5 font-medium text-xs text-slate-500">
                          #{(currentPageReferred - 1) * itemsPerPageReferred + idx + 1}
                        </TableCell>
                        <TableCell className="px-3.5 py-2.5">
                          <div className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">{rw.name}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Users className="w-3 h-3" /> {rw.ownerName}
                          </div>
                        </TableCell>
                        <TableCell className="px-3.5 py-2.5 font-bold text-xs text-emerald-600 dark:text-emerald-400">
                          <div className="flex items-center gap-0.5">
                            <IndianRupee className="w-3.5 h-3.5" />{(rw.totalEarned || 0).toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell className="px-3.5 py-2.5 text-xs text-slate-500">
                          {formatDate(rw.createdAt)}
                        </TableCell>
                        <TableCell className="text-right px-3.5 py-2.5">
                          <Button variant="outline" size="sm" onClick={() => handleViewRecharges(rw.id)} className="h-7 px-2.5 rounded-lg text-xs font-semibold">
                            <Receipt className="w-3 h-3 mr-1" /> View Recharges
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              {renderPagination(currentPageReferred, referredWorkspaces.length, itemsPerPageReferred, setCurrentPageReferred)}
            </CardContent>
          </Card>
        )}

        {activeTab === "commissions" && (
          <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden bg-white dark:bg-slate-900">
            <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-primary" />
                    Transaction History
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    All commissions, withdrawals, and transfers.
                  </CardDescription>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative w-full sm:w-[180px] group">
                    <Search className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none h-3.5 w-3.5 text-slate-400" />
                    <Input 
                      placeholder="Search..." 
                      value={txSearchQuery}
                      onChange={(e) => { setTxSearchQuery(e.target.value); setCurrentPageCommissions(1); }}
                      className="h-8 sm:h-9 pl-8 pr-3 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 rounded-lg text-xs placeholder:text-xs placeholder:text-slate-400"
                    />
                  </div>
                  
                  <Select value={txTypeFilter} onValueChange={(v) => { setTxTypeFilter(v as string); setCurrentPageCommissions(1); }}>
                    <SelectTrigger className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 w-[120px]">
                      <div className="flex items-center gap-1.5 truncate"><Filter className="w-3 h-3 text-slate-400 shrink-0"/> <SelectValue /></div>
                    </SelectTrigger>
                    <SelectContent className="rounded-xl text-xs">
                      <SelectItem value="ALL">All Types</SelectItem>
                      <SelectItem value="EARNINGS" className="text-emerald-600">Earnings</SelectItem>
                      <SelectItem value="WITHDRAWALS" className="text-red-600">Withdrawals</SelectItem>
                      <SelectItem value="TRANSFERS" className="text-blue-600">Transfers</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={txSortOrder} onValueChange={(v) => { setTxSortOrder(v as string); setCurrentPageCommissions(1); }}>
                    <SelectTrigger className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 w-[120px]">
                      <div className="flex items-center gap-1.5 truncate"><CalendarIcon className="w-3 h-3 text-slate-400 shrink-0"/> <SelectValue /></div>
                    </SelectTrigger>
                    <SelectContent className="rounded-xl text-xs">
                      <SelectItem value="NEWEST">Newest</SelectItem>
                      <SelectItem value="OLDEST">Oldest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {filteredCommissions.length === 0 ? (
                <div className="text-center py-12 text-xs font-medium text-slate-500">
                  No commission transactions found.
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-slate-50/70 dark:bg-slate-800/50">
                    <TableRow className="border-slate-100 dark:border-slate-800 h-9">
                      <TableHead className="px-3.5 py-2 text-xs font-semibold text-slate-500 w-16">SL No</TableHead>
                      <TableHead className="px-3.5 py-2 text-xs font-semibold text-slate-500">Description</TableHead>
                      <TableHead className="px-3.5 py-2 text-xs font-semibold text-slate-500">Date</TableHead>
                      <TableHead className="px-3.5 py-2 text-xs font-semibold text-slate-500">Status</TableHead>
                      <TableHead className="text-right px-3.5 py-2 text-xs font-semibold text-slate-500">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {paginate(filteredCommissions, currentPageCommissions, itemsPerPageCommissions).map((comm: any, idx: number) => (
                      <TableRow key={comm.id} className="border-slate-100 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <TableCell className="px-3.5 py-2.5 font-medium text-xs text-slate-500">
                          #{(currentPageCommissions - 1) * itemsPerPageCommissions + idx + 1}
                        </TableCell>
                        <TableCell className="px-3.5 py-2.5 font-medium text-xs text-slate-900 dark:text-white">
                          <span className="flex items-center gap-1.5">
                            {comm.type === 'DEBIT' && comm.isCommissionWithdrawal && <ArrowDownToLine className="w-3.5 h-3.5 text-blue-500" />}
                            {comm.type === 'DEBIT' && comm.isCommissionTransfer && <ArrowRightLeft className="w-3.5 h-3.5 text-purple-500" />}
                            {comm.type === 'CREDIT' && <Wallet className="w-3.5 h-3.5 text-emerald-500" />}
                            {comm.description}
                          </span>
                        </TableCell>
                        <TableCell className="px-3.5 py-2.5 text-xs text-slate-500 whitespace-nowrap">
                          {formatDate(comm.createdAt)}
                        </TableCell>
                        <TableCell className="px-3.5 py-2.5">
                          <Badge variant="outline" className={cn("text-[9px] font-bold uppercase tracking-wider border-none px-1.5 py-0.5", comm.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600')}>
                            {comm.status}
                          </Badge>
                        </TableCell>
                        <TableCell className={`text-right px-3.5 py-2.5 font-bold text-xs ${comm.type === 'DEBIT' ? 'text-slate-900 dark:text-white' : 'text-emerald-600 dark:text-emerald-400'}`}>
                          {comm.type === 'DEBIT' ? '-' : '+'}<span className="inline-flex items-center"><IndianRupee className="w-3 h-3 mr-0.5" />{comm.amount.toFixed(2)}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              {renderPagination(currentPageCommissions, filteredCommissions.length, itemsPerPageCommissions, setCurrentPageCommissions)}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Withdraw Dialog (Rule 7.7) */}
      <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="space-y-4">
            <div className="text-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mx-auto mb-2">
                <ArrowDownToLine className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Request Withdrawal</h2>
              <p className="text-xs text-slate-500 mt-0.5">Available balance: ₹{config.commissionBalance.toFixed(2)}</p>
            </div>
            
            <div className="space-y-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center">Amount to Withdraw</label>
              <div className="relative flex items-center justify-center">
                <IndianRupee className="absolute left-3 w-4 h-4 text-slate-400" />
                <Input 
                  type="number" 
                  value={withdrawAmount} 
                  onChange={(e) => setWithdrawAmount(e.target.value)} 
                  placeholder="0.00" 
                  className="h-9 pl-9 pr-3 font-bold text-base rounded-lg text-center bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700" 
                />
              </div>
              <div className="flex justify-center gap-1.5 pt-1">
                <Button variant="outline" size="sm" onClick={() => setWithdrawAmount((config.commissionBalance * 0.25).toFixed(0))} className="h-6 text-[10px] px-2 rounded">25%</Button>
                <Button variant="outline" size="sm" onClick={() => setWithdrawAmount((config.commissionBalance * 0.50).toFixed(0))} className="h-6 text-[10px] px-2 rounded">50%</Button>
                <Button variant="outline" size="sm" onClick={() => setWithdrawAmount(config.commissionBalance.toFixed(0))} className="h-6 text-[10px] px-2 rounded">Max</Button>
              </div>
            </div>

            <div className="bg-blue-500/10 text-blue-700 dark:text-blue-300 p-2.5 rounded-lg text-[11px] font-medium flex items-start gap-2">
              <Clock className="w-4 h-4 shrink-0 mt-0.5" />
              <p>Withdrawal requests are processed offline by the Super Admin into your designated bank account.</p>
            </div>

            <div className="flex gap-2 pt-1">
              <Button variant="outline" onClick={() => setIsWithdrawOpen(false)} className="flex-1 rounded-lg h-8 sm:h-9 text-xs">Cancel</Button>
              <Button onClick={handleWithdraw} className="flex-1 rounded-lg h-8 sm:h-9 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white">Submit Request</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transfer Dialog (Rule 7.7) */}
      <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="space-y-4">
            <div className="text-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center mx-auto mb-2">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Transfer to Wallet</h2>
              <p className="text-xs text-slate-500 mt-0.5">Available balance: ₹{config.commissionBalance.toFixed(2)}</p>
            </div>
            
            <div className="space-y-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center">Amount to Transfer</label>
              <div className="relative flex items-center justify-center">
                <IndianRupee className="absolute left-3 w-4 h-4 text-slate-400" />
                <Input 
                  type="number" 
                  value={transferAmount} 
                  onChange={(e) => setTransferAmount(e.target.value)} 
                  placeholder="0.00" 
                  className="h-9 pl-9 pr-3 font-bold text-base rounded-lg text-center bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700" 
                />
              </div>
              <div className="flex justify-center gap-1.5 pt-1">
                <Button variant="outline" size="sm" onClick={() => setTransferAmount((config.commissionBalance * 0.25).toFixed(0))} className="h-6 text-[10px] px-2 rounded">25%</Button>
                <Button variant="outline" size="sm" onClick={() => setTransferAmount((config.commissionBalance * 0.50).toFixed(0))} className="h-6 text-[10px] px-2 rounded">50%</Button>
                <Button variant="outline" size="sm" onClick={() => setTransferAmount(config.commissionBalance.toFixed(0))} className="h-6 text-[10px] px-2 rounded">Max</Button>
              </div>
            </div>

            <div className="bg-purple-500/10 text-purple-700 dark:text-purple-300 p-2.5 rounded-lg text-[11px] font-medium flex items-start gap-2">
              <Wallet className="w-4 h-4 shrink-0 mt-0.5" />
              <p>Transferred funds will be instantly added to your main franchise wallet to purchase tokens and student items.</p>
            </div>

            <div className="flex gap-2 pt-1">
              <Button variant="outline" onClick={() => setIsTransferOpen(false)} className="flex-1 rounded-lg h-8 sm:h-9 text-xs">Cancel</Button>
              <Button onClick={handleTransfer} className="flex-1 rounded-lg h-8 sm:h-9 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white">Transfer Now</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Recharge History Dialog (Rule 7.7) */}
      <Dialog open={isRechargeModalOpen} onOpenChange={(open) => {
        setIsRechargeModalOpen(open);
        if (!open) setTimeout(() => setSelectedFranchiseRecharges(null), 300);
      }}>
        <DialogContent className="sm:max-w-xl rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
          <div className="text-center mb-3 shrink-0 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Receipt className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Recharge History</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isLoadingRecharges ? "Loading..." : selectedFranchiseRecharges ? `For ${selectedFranchiseRecharges.franchiseName}` : ""}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 no-scrollbar space-y-2">
            {isLoadingRecharges ? (
              <div className="text-center py-8 text-xs text-slate-500 font-medium animate-pulse">Fetching transactions...</div>
            ) : selectedFranchiseRecharges ? (
              selectedFranchiseRecharges.recharges.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500 font-medium">
                  No recharges found for this franchise during your referral period.
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedFranchiseRecharges.recharges.map((tx: any) => (
                    <div key={tx.id} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700/60">
                      <div>
                        <div className="font-semibold text-xs text-slate-900 dark:text-white">{tx.description || "Wallet Recharge"}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{formatDate(tx.createdAt)}</div>
                      </div>
                      <div className="text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center">
                        +<IndianRupee className="w-3.5 h-3.5 mr-0.5" />{tx.amount.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : null}
          </div>

          <div className="pt-3 shrink-0 mt-auto border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setIsRechargeModalOpen(false)} className="w-full rounded-lg h-8 sm:h-9 text-xs font-semibold">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
