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
    <div className="space-y-10">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] shadow-sm overflow-hidden hover:shadow-md transition-shadow bg-blue-50/30 dark:bg-blue-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Available Balance</CardTitle>
            <div className="p-2 bg-blue-500/10 rounded-xl">
              <Wallet className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-black text-blue-600 dark:text-blue-400 flex items-center">
              <IndianRupee className="h-6 w-6 mr-1" />
              {config.commissionBalance.toFixed(2)}
            </div>
            <div className="flex gap-2 mt-4">
              <Button size="sm" onClick={() => setIsWithdrawOpen(true)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-bold h-8">
                Withdraw
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsTransferOpen(true)} className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 rounded-xl text-[10px] font-bold h-8">
                To Wallet
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] shadow-sm overflow-hidden hover:shadow-md transition-shadow bg-emerald-50/30 dark:bg-emerald-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Total Earned</CardTitle>
            <div className="p-2 bg-emerald-500/10 rounded-xl">
              <IndianRupee className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 flex items-center">
              <IndianRupee className="h-6 w-6 mr-1" />
              {stats.totalEarned.toFixed(2)}
            </div>
            <p className="text-[10px] font-bold text-slate-500 mt-2">Lifetime earnings</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] shadow-sm overflow-hidden hover:shadow-md transition-shadow bg-amber-50/30 dark:bg-amber-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Pending Release</CardTitle>
            <div className="p-2 bg-amber-500/10 rounded-xl">
              <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-black text-amber-600 dark:text-amber-400 flex items-center">
              <IndianRupee className="h-6 w-6 mr-1" />
              {stats.totalPending.toFixed(2)}
            </div>
            <p className="text-[10px] font-bold text-slate-500 mt-2">Processing</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] shadow-sm overflow-hidden hover:shadow-md transition-shadow bg-slate-50/50 dark:bg-slate-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Referral Info</CardTitle>
            <div className="p-2 bg-indigo-500/10 rounded-xl">
              <Building2 className="h-4 w-4 text-indigo-500" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-2xl font-black font-mono tracking-widest text-slate-900 dark:text-white truncate">
                {config.referralId || "Not Set"}
              </div>
              <Button size="icon" variant="ghost" onClick={copyReferralId} className="h-8 w-8 text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 mt-2">
              <Badge variant="outline" className="text-[10px] font-bold text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20">
                <Percent className="w-3 h-3 mr-1" /> {config.commission}% Rate
              </Badge>
              <span>Total Referrals: {referredWorkspaces.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-2 p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-full">
        {[
          { id: "referred", label: "Referred Franchises", icon: Users },
          { id: "commissions", label: "Commission History", icon: Receipt },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap shrink-0",
              activeTab === tab.id
                ? "bg-slate-100 dark:bg-slate-800 text-primary shadow-inner"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {activeTab === "referred" && (
          <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-6 md:p-8 border-b border-slate-50 dark:border-slate-800/50">
              <CardTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Referred Franchises ({referredWorkspaces.length})
              </CardTitle>
              <CardDescription className="text-xs font-medium text-slate-500">Institutes registered using your Referral ID.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {referredWorkspaces.length === 0 ? (
                <div className="text-center py-16 font-bold text-slate-500">
                  No franchises have used your referral ID yet.
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                    <TableRow className="border-slate-100 dark:border-slate-800">
                      <TableHead className="px-8 font-bold text-slate-500 w-20">SL No</TableHead>
                      <TableHead className="font-bold text-slate-500">Institute Name</TableHead>
                      <TableHead className="font-bold text-slate-500">Total Earned</TableHead>
                      <TableHead className="font-bold text-slate-500">Opening Date</TableHead>
                      <TableHead className="text-right px-8 font-bold text-slate-500">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginate(referredWorkspaces, currentPageReferred, itemsPerPageReferred).map((rw: any, idx: number) => (
                      <TableRow key={rw.id} className="border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        <TableCell className="px-8 py-4 font-bold text-sm text-slate-500 dark:text-slate-400">
                          #{(currentPageReferred - 1) * itemsPerPageReferred + idx + 1}
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="font-black text-sm text-slate-900 dark:text-white">{rw.name}</div>
                          <div className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-1">
                            <Users className="w-3 h-3" /> {rw.ownerName}
                          </div>
                        </TableCell>
                        <TableCell className="font-black text-emerald-600 dark:text-emerald-400">
                          <div className="flex items-center gap-0.5">
                            <IndianRupee className="w-4 h-4" />{(rw.totalEarned || 0).toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-slate-500">
                          {formatDate(rw.createdAt)}
                        </TableCell>
                        <TableCell className="text-right px-8">
                          <Button variant="outline" size="sm" onClick={() => handleViewRecharges(rw.id)} className="h-8 rounded-lg text-xs font-bold border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20 shadow-sm">
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
          <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-6 md:p-8 border-b border-slate-50 dark:border-slate-800/50">
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-primary" />
                    Transaction History
                  </CardTitle>
                  <CardDescription className="text-xs font-medium text-slate-500 mt-1">
                    All commissions, withdrawals, and transfers.
                  </CardDescription>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      placeholder="Search transactions..." 
                      value={txSearchQuery}
                      onChange={(e) => { setTxSearchQuery(e.target.value); setCurrentPageCommissions(1); }}
                      className="pl-9 h-10 w-full sm:w-[220px] rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 font-medium text-sm"
                    />
                  </div>
                  
                  <Select value={txTypeFilter} onValueChange={(v) => { setTxTypeFilter(v as string); setCurrentPageCommissions(1); }}>
                    <SelectTrigger className="h-10 w-full sm:w-[150px] rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 font-bold text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-2"><Filter className="w-3.5 h-3.5 text-slate-400"/> <SelectValue /></div>
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="ALL" className="font-medium">All Types</SelectItem>
                      <SelectItem value="EARNINGS" className="font-medium text-emerald-600">Earnings</SelectItem>
                      <SelectItem value="WITHDRAWALS" className="font-medium text-red-600">Withdrawals</SelectItem>
                      <SelectItem value="TRANSFERS" className="font-medium text-blue-600">Transfers</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={txSortOrder} onValueChange={(v) => { setTxSortOrder(v as string); setCurrentPageCommissions(1); }}>
                    <SelectTrigger className="h-10 w-full sm:w-[150px] rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 font-bold text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-2"><CalendarIcon className="w-3.5 h-3.5 text-slate-400"/> <SelectValue /></div>
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="NEWEST" className="font-medium">Newest First</SelectItem>
                      <SelectItem value="OLDEST" className="font-medium">Oldest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {filteredCommissions.length === 0 ? (
                <div className="text-center py-16 font-bold text-slate-500">
                  No commission transactions found.
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                    <TableRow className="border-slate-100 dark:border-slate-800">
                      <TableHead className="px-8 font-bold text-slate-500 w-20">SL No</TableHead>
                      <TableHead className="font-bold text-slate-500">Description</TableHead>
                      <TableHead className="font-bold text-slate-500">Date</TableHead>
                      <TableHead className="font-bold text-slate-500">Status</TableHead>
                      <TableHead className="text-right px-8 font-bold text-slate-500">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginate(filteredCommissions, currentPageCommissions, itemsPerPageCommissions).map((comm: any, idx: number) => (
                      <TableRow key={comm.id} className="border-slate-50 dark:border-slate-800">
                        <TableCell className="px-8 py-4 font-bold text-sm text-slate-500 dark:text-slate-400">
                          #{(currentPageCommissions - 1) * itemsPerPageCommissions + idx + 1}
                        </TableCell>
                        <TableCell className="py-4 font-bold text-sm text-slate-900 dark:text-white">
                          <span className="flex items-center gap-2">
                            {comm.type === 'DEBIT' && comm.isCommissionWithdrawal && <ArrowDownToLine className="w-4 h-4 text-blue-500" />}
                            {comm.type === 'DEBIT' && comm.isCommissionTransfer && <ArrowRightLeft className="w-4 h-4 text-purple-500" />}
                            {comm.type === 'CREDIT' && <Wallet className="w-4 h-4 text-emerald-500" />}
                            {comm.description}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium text-slate-500 whitespace-nowrap">
                          {formatDate(comm.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("font-bold border-0 shadow-none px-2.5 py-0.5", comm.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400')}>
                            {comm.status}
                          </Badge>
                        </TableCell>
                        <TableCell className={`text-right px-8 font-black flex justify-end items-center mt-2.5 ${comm.type === 'DEBIT' ? 'text-slate-900 dark:text-white' : 'text-emerald-600 dark:text-emerald-400'}`}>
                          {comm.type === 'DEBIT' ? '-' : '+'}<IndianRupee className="w-4 h-4" />{comm.amount.toFixed(2)}
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

      {/* Withdraw Dialog */}
      <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
        <DialogContent className="rounded-[2rem] p-8 max-w-md border-none shadow-2xl">
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowDownToLine className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Request Withdrawal</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Available balance: ₹{config.commissionBalance.toFixed(2)}</p>
            </div>
            
            <div className="space-y-3 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block text-center">Amount to Withdraw</label>
              <div className="relative flex items-center justify-center">
                <IndianRupee className="absolute left-4 w-6 h-6 text-slate-400" />
                <Input 
                  type="number" 
                  value={withdrawAmount} 
                  onChange={(e) => setWithdrawAmount(e.target.value)} 
                  placeholder="0.00" 
                  className="h-16 pl-12 pr-4 font-black text-3xl rounded-2xl text-center border-slate-200 dark:border-slate-700 shadow-sm focus-visible:ring-blue-500" 
                />
              </div>
              <div className="flex justify-center gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setWithdrawAmount((config.commissionBalance * 0.25).toFixed(0))} className="h-7 text-[10px] rounded-lg">25%</Button>
                <Button variant="outline" size="sm" onClick={() => setWithdrawAmount((config.commissionBalance * 0.50).toFixed(0))} className="h-7 text-[10px] rounded-lg">50%</Button>
                <Button variant="outline" size="sm" onClick={() => setWithdrawAmount(config.commissionBalance.toFixed(0))} className="h-7 text-[10px] rounded-lg border-blue-200 text-blue-600 dark:border-blue-800 dark:text-blue-400">Max</Button>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-4 rounded-xl text-xs font-medium flex items-start gap-3">
              <Clock className="w-5 h-5 shrink-0 mt-0.5 opacity-70" />
              <p>Withdrawal requests are processed offline by the Super Admin. You will receive the funds in your designated bank account.</p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setIsWithdrawOpen(false)} className="flex-1 rounded-2xl h-12 font-bold border-slate-200 dark:border-slate-700">Cancel</Button>
              <Button onClick={handleWithdraw} className="flex-1 rounded-2xl h-12 font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25">Submit Request</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
        <DialogContent className="rounded-[2rem] p-8 max-w-md border-none shadow-2xl">
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowRightLeft className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Transfer to Wallet</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Available balance: ₹{config.commissionBalance.toFixed(2)}</p>
            </div>
            
            <div className="space-y-3 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block text-center">Amount to Transfer</label>
              <div className="relative flex items-center justify-center">
                <IndianRupee className="absolute left-4 w-6 h-6 text-slate-400" />
                <Input 
                  type="number" 
                  value={transferAmount} 
                  onChange={(e) => setTransferAmount(e.target.value)} 
                  placeholder="0.00" 
                  className="h-16 pl-12 pr-4 font-black text-3xl rounded-2xl text-center border-slate-200 dark:border-slate-700 shadow-sm focus-visible:ring-purple-500" 
                />
              </div>
              <div className="flex justify-center gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setTransferAmount((config.commissionBalance * 0.25).toFixed(0))} className="h-7 text-[10px] rounded-lg">25%</Button>
                <Button variant="outline" size="sm" onClick={() => setTransferAmount((config.commissionBalance * 0.50).toFixed(0))} className="h-7 text-[10px] rounded-lg">50%</Button>
                <Button variant="outline" size="sm" onClick={() => setTransferAmount(config.commissionBalance.toFixed(0))} className="h-7 text-[10px] rounded-lg border-purple-200 text-purple-600 dark:border-purple-800 dark:text-purple-400">Max</Button>
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 p-4 rounded-xl text-xs font-medium flex items-start gap-3">
              <Wallet className="w-5 h-5 shrink-0 mt-0.5 opacity-70" />
              <p>Transferred funds will be instantly added to your main franchise wallet, which can be used to purchase tokens, exams, and courses.</p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setIsTransferOpen(false)} className="flex-1 rounded-2xl h-12 font-bold border-slate-200 dark:border-slate-700">Cancel</Button>
              <Button onClick={handleTransfer} className="flex-1 rounded-2xl h-12 font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/25">Transfer Now</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Recharge History Dialog */}
      <Dialog open={isRechargeModalOpen} onOpenChange={(open) => {
        setIsRechargeModalOpen(open);
        if (!open) setTimeout(() => setSelectedFranchiseRecharges(null), 300);
      }}>
        <DialogContent className="rounded-[2rem] p-8 max-w-2xl border-none shadow-2xl bg-white dark:bg-slate-900 overflow-hidden flex flex-col max-h-[85vh]">
          <div className="text-center mb-6 shrink-0">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Recharge History</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">
              {isLoadingRecharges ? "Loading..." : selectedFranchiseRecharges ? `For ${selectedFranchiseRecharges.franchiseName}` : ""}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 no-scrollbar">
            {isLoadingRecharges ? (
              <div className="text-center py-12 text-slate-500 font-bold animate-pulse">Fetching transactions...</div>
            ) : selectedFranchiseRecharges ? (
              selectedFranchiseRecharges.recharges.length === 0 ? (
                <div className="text-center py-12 text-slate-500 font-bold bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                  No recharges found for this franchise during your referral period.
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedFranchiseRecharges.recharges.map((tx: any) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors">
                      <div>
                        <div className="font-bold text-sm text-slate-900 dark:text-white">{tx.description || "Wallet Recharge"}</div>
                        <div className="text-xs font-medium text-slate-500 mt-1">{formatDate(tx.createdAt)}</div>
                      </div>
                      <div className="text-emerald-600 dark:text-emerald-400 font-black flex items-center gap-1">
                        +<IndianRupee className="w-4 h-4" />{tx.amount.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : null}
          </div>

          <div className="pt-6 shrink-0 mt-auto">
            <Button variant="outline" onClick={() => setIsRechargeModalOpen(false)} className="w-full rounded-2xl h-12 font-bold border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
