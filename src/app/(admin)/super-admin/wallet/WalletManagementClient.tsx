"use client";

import React, { useState, useEffect } from "react";
import { 
  Building2, 
  Coins, 
  CreditCard, 
  Settings, 
  CheckCircle2, 
  XCircle, 
  Search,
  IndianRupee,
  Wallet,
  FileText,
  Settings as SettingsIcon,
  BarChart,
  Video,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  History,
  Clock
} from "lucide-react";
import { AdminPageHeader } from "@/components/layout/AdminPageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { approveRechargeRequest, rejectRechargeRequest, updateRegistrationFeeConfig, updateWalletPaymentConfig, deleteRejectedTransaction, directRecharge } from "@/app/actions/wallet";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";
import WalletAnalyticsTab from "./WalletAnalyticsTab";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

interface WalletManagementClientProps {
  wallets: any[];
  requests: any[];
  feeConfig: any[];
  paymentConfig: any;
  allTransactions: any[];
}

export default function WalletManagementClient({
  wallets,
  requests,
  feeConfig,
  paymentConfig,
  allTransactions
}: WalletManagementClientProps) {
  const [activeTab, setActiveTab] = useState("analytics");
  const [searchQuery, setSearchQuery] = useState("");
  const [isUpdatingFees, setIsUpdatingFees] = useState(false);
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [localRequests, setLocalRequests] = useState(requests);

  // New states for Wallet Overview
  const [walletPage, setWalletPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const [rechargeModalOpen, setRechargeModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<any>(null);
  const [rechargeAmount, setRechargeAmount] = useState("");
  const [rechargeReason, setRechargeReason] = useState("");
  const [isPromotional, setIsPromotional] = useState(false);
  const [isRecharging, setIsRecharging] = useState(false);
  const WALLETS_PER_PAGE = 10;
  const HISTORY_PER_PAGE = 10;

  useEffect(() => {
    setLocalRequests(requests);
  }, [requests]);
  
  const [fees, setFees] = useState(
    feeConfig.length > 0 
      ? feeConfig 
      : [
          { duration: "6 Months", amount: 200 },
          { duration: "12 Months", amount: 300 },
          { duration: "18 Months", amount: 350 }
        ]
  );

  const [paymentDetails, setPaymentDetails] = useState({
    upiId: paymentConfig?.upiId || "",
    qrCodeUrl: paymentConfig?.qrCodeUrl || "",
    bankName: paymentConfig?.bankName || "",
    accountHolderName: paymentConfig?.accountHolderName || "",
    accountNumber: paymentConfig?.accountNumber || "",
    ifscCode: paymentConfig?.ifscCode || "",
    instructions: paymentConfig?.instructions || "",
    agreementTerms: paymentConfig?.agreementTerms || "",
    guideTitle: paymentConfig?.guideTitle || "",
    guideDescription: paymentConfig?.guideDescription || "",
    guideYoutubeLink: paymentConfig?.guideYoutubeLink || ""
  });

  const filteredWallets = wallets.filter(w => 
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.subdomain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalWalletPages = Math.max(1, Math.ceil(filteredWallets.length / WALLETS_PER_PAGE));
  const paginatedWallets = filteredWallets.slice(
    (walletPage - 1) * WALLETS_PER_PAGE,
    walletPage * WALLETS_PER_PAGE
  );

  useEffect(() => {
    setWalletPage(1);
  }, [searchQuery]);

  const handleDirectRecharge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkspace || !rechargeAmount || !rechargeReason) return;
    
    const amountNum = parseFloat(rechargeAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid positive amount");
      return;
    }

    setIsRecharging(true);
    try {
      const res = await directRecharge(selectedWorkspace.id, amountNum, rechargeReason, isPromotional);
      if (res.success) {
        toast.success(`Successfully added ₹${amountNum} to ${selectedWorkspace.name}`);
        setRechargeModalOpen(false);
        setRechargeAmount("");
        setRechargeReason("");
        setIsPromotional(false);
        setSelectedWorkspace(null);
      } else {
        toast.error("Failed to add funds: " + res.error);
      }
    } finally {
      setIsRecharging(false);
    }
  };

  const handleSaveFees = async () => {
    setIsUpdatingFees(true);
    try {
      const res = await updateRegistrationFeeConfig(fees);
      if (res.success) {
        toast.success("Fee structure updated successfully");
      } else {
        toast.error("Failed to update fees: " + res.error);
      }
    } finally {
      setIsUpdatingFees(false);
    }
  };

  const handleSavePayment = async () => {
    setIsUpdatingPayment(true);
    try {
      const res = await updateWalletPaymentConfig(paymentConfig?.id || "temp", paymentDetails);
      if (res.success) {
        toast.success("Payment details updated successfully");
      } else {
        toast.error("Failed to update payment details: " + res.error);
      }
    } finally {
      setIsUpdatingPayment(false);
    }
  };

  const handleApprove = async (id: string) => {
    const res = await approveRechargeRequest(id);
    if (res.success) {
      toast.success("Recharge request approved.");
      setLocalRequests(prev => prev.filter(r => r.id !== id));
    } else {
      toast.error(res.error);
    }
  };

  const openRejectModal = (id: string) => {
    setRejectingId(id);
    setRejectReason("");
    setRejectModalOpen(true);
  };

  const handleReject = async () => {
    if (!rejectingId) return;
    try {
      const res = await rejectRechargeRequest(rejectingId, rejectReason);
      if (res.success) {
        toast.success("Request rejected");
        setLocalRequests(prev => prev.map(r => r.id === rejectingId ? { ...r, status: 'REJECTED', rejectionReason: rejectReason } : r));
      } else {
        toast.error("Failed to reject: " + res.error);
      }
    } finally {
      setRejectModalOpen(false);
      setRejectingId(null);
      setRejectReason("");
    }
  };

  const handleClearRejected = async (id: string) => {
    const res = await deleteRejectedTransaction(id);
    if (res.success) {
      toast.success("Rejected request cleared");
      setLocalRequests(prev => prev.filter(r => r.id !== id));
    } else {
      toast.error("Failed to clear: " + res.error);
    }
  };

  const tabs = [
    { id: "analytics", label: "Analytics & Reports", icon: BarChart },
    { id: "overview", label: "Wallets", icon: Wallet },
    { id: "requests", label: "Requests", icon: FileText, count: localRequests.filter(r => r.status === 'PENDING').length },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ];

  return (
    <div className="space-y-10 pb-12 w-full mx-auto">
      <AdminPageHeader 
        title="Wallet Economy" 
        description="Manage franchise wallets, set fee structures, and approve manual recharges."
      />

      <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-2 p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-full">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap shrink-0",
              activeTab === tab.id
                ? "bg-slate-100 dark:bg-slate-800 text-primary shadow-inner"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="flex items-center justify-center min-w-[1.4rem] h-5 px-1.5 bg-primary text-white rounded-lg text-[10px] font-bold shadow-sm">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="transition-all duration-300">
        {activeTab === "overview" && (
          <Card className="border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-sm overflow-hidden">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-8 border-b border-slate-50 dark:border-slate-800 gap-4">
              <div className="space-y-1">
                <CardTitle className="text-xl font-bold tracking-tight">Franchise Wallets</CardTitle>
                <CardDescription className="text-xs font-medium text-slate-500">Current balance of all registered franchises.</CardDescription>
              </div>
              <div className="relative w-full max-w-[300px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search franchise..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-50 dark:border-slate-800 rounded-2xl h-11 font-medium" 
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-50 dark:divide-slate-800">
                {paginatedWallets.map((wallet) => (
                  <div key={wallet.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                        <Building2 className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-900 dark:text-white">{wallet.name}</p>
                        <p className="text-xs text-slate-500 font-medium">Domain: {wallet.subdomain}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6 w-full md:w-auto">
                      <div className="text-left md:text-right">
                        <p className="font-black text-lg text-slate-900 dark:text-white flex items-center md:justify-end gap-1">
                          <IndianRupee className="h-4 w-4" />
                          {wallet.walletBalance.toFixed(2)}
                        </p>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Current Balance</p>
                      </div>
                      <div className="flex items-center gap-2 w-full md:w-auto">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-9 rounded-xl flex-1 md:flex-none border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                          onClick={() => {
                            setSelectedWorkspace(wallet);
                            setHistoryPage(1);
                            setHistoryModalOpen(true);
                          }}
                        >
                          <History className="h-4 w-4 mr-2" />
                          History
                        </Button>
                        <Button 
                          size="sm" 
                          className="h-9 rounded-xl flex-1 md:flex-none bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20"
                          onClick={() => {
                            setSelectedWorkspace(wallet);
                            setRechargeAmount("");
                            setRechargeReason("");
                            setIsPromotional(false);
                            setRechargeModalOpen(true);
                          }}
                        >
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Add Funds
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {paginatedWallets.length === 0 && (
                  <div className="p-12 text-center text-slate-400 font-bold">No franchises found.</div>
                )}
              </div>
              
              {/* Pagination Controls */}
              {filteredWallets.length > 0 && (
                <div className="p-4 border-t border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-500">
                    Showing <span className="text-slate-900 dark:text-white">{(walletPage - 1) * WALLETS_PER_PAGE + 1}</span> to <span className="text-slate-900 dark:text-white">{Math.min(walletPage * WALLETS_PER_PAGE, filteredWallets.length)}</span> of <span className="text-slate-900 dark:text-white">{filteredWallets.length}</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setWalletPage(p => Math.max(1, p - 1))}
                      disabled={walletPage === 1}
                      className="rounded-xl h-8 px-2 border-slate-200 dark:border-slate-700"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-sm font-bold px-3 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
                      {walletPage} / {totalWalletPages}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setWalletPage(p => Math.min(totalWalletPages, p + 1))}
                      disabled={walletPage === totalWalletPages}
                      className="rounded-xl h-8 px-2 border-slate-200 dark:border-slate-700"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "analytics" && (
          <WalletAnalyticsTab transactions={allTransactions} />
        )}

        {activeTab === "requests" && (
          <Card className="border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-sm overflow-hidden">
            <CardHeader className="p-8 border-b border-slate-50 dark:border-slate-800">
              <CardTitle className="text-xl font-bold tracking-tight">Pending Recharge Requests</CardTitle>
              <CardDescription className="text-xs font-medium text-slate-500">Review and approve manual payment submissions.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {localRequests.length === 0 ? (
                <div className="p-12 text-center text-slate-400 font-bold">No pending requests.</div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {localRequests.map(req => (
                    <div key={req.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 border-2 border-slate-100 dark:border-slate-800 rounded-3xl gap-6">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className={cn("border-none font-bold text-[10px]", req.status === 'REJECTED' ? "bg-red-500/10 text-red-600" : "bg-amber-500/10 text-amber-600")}>
                            {req.status || "PENDING"}
                          </Badge>
                          <span className="text-sm font-bold">{req.workspace.name}</span>
                        </div>
                        <p className="text-xs text-slate-500">Ref ID: <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">{req.referenceId || "N/A"}</span></p>
                        {req.rejectionReason && <p className="text-[10px] text-red-500 mt-1 max-w-[150px] truncate" title={req.rejectionReason}>Reason: {req.rejectionReason}</p>}
                        <p className="font-black text-2xl text-slate-900 dark:text-white flex items-center gap-1 mt-2">
                          <IndianRupee className="h-5 w-5" />
                          {req.amount}
                        </p>
                      </div>
                      
                      {req.receiptUrl && (
                        <div className="shrink-0 w-32 h-32 relative rounded-2xl overflow-hidden border-2 border-slate-200">
                          <a href={req.receiptUrl} target="_blank" rel="noopener noreferrer">
                            <Image src={req.receiptUrl} alt="Receipt" fill className="object-cover hover:scale-105 transition-transform" />
                          </a>
                        </div>
                      )}

                      <div className="flex flex-col gap-2 w-full md:w-auto shrink-0">
                        {req.status === 'REJECTED' ? (
                          <Button variant="ghost" size="sm" onClick={() => handleClearRejected(req.id)} className="h-8 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50">Clear</Button>
                        ) : (
                          <>
                            <Button 
                              onClick={() => handleApprove(req.id)}
                              className="rounded-xl gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20"
                            >
                              <CheckCircle2 className="h-4 w-4" /> Approve
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => openRejectModal(req.id)} className="h-8 rounded-lg border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
                              <XCircle className="h-4 w-4 mr-2" /> Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "settings" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <Accordion defaultValue={["fees"]} className="space-y-4">
              
              <AccordionItem value="fees" className="border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] bg-white dark:bg-slate-950 px-6 py-2 shadow-sm overflow-hidden data-[state=open]:shadow-md transition-all">
                <AccordionTrigger className="hover:no-underline py-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <IndianRupee className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold tracking-tight">Registration Fee Structure</h3>
                      <p className="text-xs font-medium text-slate-500">Configure fees based on course duration</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-8 border-t border-slate-50 dark:border-slate-800">
                  <div className="space-y-6">
                    <div className="bg-slate-50/50 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                      <div className="hidden sm:flex items-center px-6 py-3 bg-slate-100/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex-1 text-[10px] font-black text-slate-500 uppercase tracking-widest">Duration Tier</div>
                        <div className="flex-1 text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Deduction Amount</div>
                        <div className="w-10"></div>
                      </div>
                      
                      <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {fees.map((fee, idx) => (
                          <div key={idx} className="flex flex-col sm:flex-row items-center gap-4 px-6 py-4 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900/80 transition-colors group">
                            <div className="flex-1 w-full relative">
                              <span className="sm:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Duration</span>
                              <Input 
                                value={fee.duration} 
                                onChange={(e) => {
                                  const newFees = [...fees];
                                  newFees[idx].duration = e.target.value;
                                  setFees(newFees);
                                }}
                                placeholder="e.g. 6 Months"
                                className="h-12 border-slate-200 dark:border-slate-700 shadow-none font-bold bg-transparent focus-visible:ring-primary focus-visible:bg-white"
                              />
                            </div>
                            <div className="flex-1 w-full relative">
                              <span className="sm:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Amount</span>
                              <div className="relative">
                                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input 
                                  type="number"
                                  value={fee.amount} 
                                  onChange={(e) => {
                                    const newFees = [...fees];
                                    newFees[idx].amount = Number(e.target.value);
                                    setFees(newFees);
                                  }}
                                  placeholder="0"
                                  className="h-12 pl-10 border-slate-200 dark:border-slate-700 shadow-none font-bold bg-transparent focus-visible:ring-primary focus-visible:bg-white"
                                />
                              </div>
                            </div>
                            <div className="w-full sm:w-10 flex justify-end sm:justify-center">
                              <Button 
                                variant="ghost" 
                                onClick={() => setFees(fees.filter((_, i) => i !== idx))}
                                className="h-10 w-10 p-0 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                title="Remove Tier"
                              >
                                <XCircle className="h-5 w-5" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setFees([...fees, { duration: "", amount: 0 }])}
                      className="w-full rounded-2xl border-dashed border-2 h-14 font-bold text-slate-500 hover:text-slate-900 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100"
                    >
                      + Add New Duration Tier
                    </Button>
                    <Button 
                      onClick={handleSaveFees}
                      disabled={isUpdatingFees}
                      className="w-full rounded-2xl shadow-xl shadow-primary/20 h-14 text-lg font-bold"
                    >
                      {isUpdatingFees ? "Saving Changes..." : "Save Fee Structure"}
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="payment" className="border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] bg-white dark:bg-slate-950 px-6 py-2 shadow-sm overflow-hidden data-[state=open]:shadow-md transition-all">
                <AccordionTrigger className="hover:no-underline py-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold tracking-tight">Payment Details</h3>
                      <p className="text-xs font-medium text-slate-500">Set UPI & Bank details for franchises to pay into</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-8 border-t border-slate-50 dark:border-slate-800">
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6 p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl border-2 border-slate-100 dark:border-slate-800">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 ml-1">UPI ID</label>
                          <Input 
                            value={paymentDetails.upiId} 
                            onChange={(e) => setPaymentDetails({...paymentDetails, upiId: e.target.value})}
                            placeholder="e.g. superadmin@upi"
                            className="rounded-xl font-medium bg-white dark:bg-slate-950 border-2 h-12"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 ml-1">QR Code Image</label>
                          <ImageUpload 
                            value={paymentDetails.qrCodeUrl || ""} 
                            onChange={(url) => setPaymentDetails({...paymentDetails, qrCodeUrl: url})}
                            folder="qrcodes"
                          />
                        </div>
                      </div>
                      <div className="space-y-6 p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl border-2 border-slate-100 dark:border-slate-800">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 ml-1">Bank Name</label>
                          <Input 
                            value={paymentDetails.bankName} 
                            onChange={(e) => setPaymentDetails({...paymentDetails, bankName: e.target.value})}
                            placeholder="e.g. State Bank of India"
                            className="rounded-xl font-medium bg-white dark:bg-slate-950 border-2 h-12"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 ml-1">Account Holder Name</label>
                          <Input 
                            value={paymentDetails.accountHolderName} 
                            onChange={(e) => setPaymentDetails({...paymentDetails, accountHolderName: e.target.value})}
                            placeholder="e.g. ABCD Hub Ltd"
                            className="rounded-xl font-medium bg-white dark:bg-slate-950 border-2 h-12"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 ml-1">Account Number</label>
                          <Input 
                            value={paymentDetails.accountNumber} 
                            onChange={(e) => setPaymentDetails({...paymentDetails, accountNumber: e.target.value})}
                            placeholder="e.g. 1234567890"
                            className="rounded-xl font-medium bg-white dark:bg-slate-950 border-2 h-12"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 ml-1">IFSC Code</label>
                          <Input 
                            value={paymentDetails.ifscCode} 
                            onChange={(e) => setPaymentDetails({...paymentDetails, ifscCode: e.target.value})}
                            placeholder="e.g. SBIN0001234"
                            className="rounded-xl font-medium bg-white dark:bg-slate-950 border-2 h-12"
                          />
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={handleSavePayment}
                      disabled={isUpdatingPayment}
                      className="w-full rounded-2xl shadow-xl shadow-primary/20 h-14 text-lg font-bold"
                    >
                      {isUpdatingPayment ? "Saving Details..." : "Save Payment Details"}
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="terms" className="border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] bg-white dark:bg-slate-950 px-6 py-2 shadow-sm overflow-hidden data-[state=open]:shadow-md transition-all">
                <AccordionTrigger className="hover:no-underline py-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold tracking-tight">Terms of Payment</h3>
                      <p className="text-xs font-medium text-slate-500">Set legal agreements for franchises</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-8 border-t border-slate-50 dark:border-slate-800">
                  <div className="space-y-8 p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl border-2 border-slate-100 dark:border-slate-800">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 ml-1">Agreement Terms (Checkbox Confirmation)</label>
                      <textarea 
                        value={paymentDetails.agreementTerms} 
                        onChange={(e) => setPaymentDetails({...paymentDetails, agreementTerms: e.target.value})}
                        placeholder="By proceeding, you agree that all payments are final and non-refundable..."
                        className="w-full rounded-xl font-medium bg-white dark:bg-slate-950 border-2 p-4 text-sm min-h-[150px] resize-none"
                      />
                      <p className="text-[10px] text-slate-400 font-medium ml-1">Franchises must agree to these terms before submitting a recharge request.</p>
                    </div>
                    <Button 
                      onClick={handleSavePayment}
                      disabled={isUpdatingPayment}
                      className="w-full rounded-2xl shadow-xl shadow-primary/20 h-14 text-lg font-bold"
                    >
                      {isUpdatingPayment ? "Saving Terms..." : "Save Terms of Payment"}
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="guide" className="border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] bg-white dark:bg-slate-950 px-6 py-2 shadow-sm overflow-hidden data-[state=open]:shadow-md transition-all">
                <AccordionTrigger className="hover:no-underline py-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-red-500/10 rounded-xl flex items-center justify-center">
                      <Video className="h-5 w-5 text-red-500" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold tracking-tight">Recharge Guide & Video</h3>
                      <p className="text-xs font-medium text-slate-500">Configure the dedicated guide tab for franchises</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-8 border-t border-slate-50 dark:border-slate-800">
                  <div className="space-y-8 p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl border-2 border-slate-100 dark:border-slate-800">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 ml-1">Guide Title</label>
                      <Input 
                        value={paymentDetails.guideTitle} 
                        onChange={(e) => setPaymentDetails({...paymentDetails, guideTitle: e.target.value})}
                        placeholder="e.g. How to Recharge your Wallet easily"
                        className="rounded-xl font-medium bg-white dark:bg-slate-950 border-2 h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 ml-1">Guide Description</label>
                      <textarea 
                        value={paymentDetails.guideDescription} 
                        onChange={(e) => setPaymentDetails({...paymentDetails, guideDescription: e.target.value})}
                        placeholder="Welcome to the comprehensive guide..."
                        className="w-full rounded-xl font-medium bg-white dark:bg-slate-950 border-2 p-4 text-sm min-h-[150px] resize-none"
                      />
                    </div>
                    <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 ml-1">YouTube Video Link</label>
                        <Input 
                          value={paymentDetails.guideYoutubeLink} 
                          onChange={(e) => setPaymentDetails({...paymentDetails, guideYoutubeLink: e.target.value})}
                          placeholder="e.g. https://www.youtube.com/watch?v=..."
                          className="rounded-xl font-medium bg-white dark:bg-slate-950 border-2 h-12 text-blue-600 dark:text-blue-400"
                        />
                      </div>
                      {paymentDetails.guideYoutubeLink && (
                        <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Video Preview</p>
                          <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900">
                            {(() => {
                              try {
                                const url = new URL(paymentDetails.guideYoutubeLink);
                                const videoId = url.searchParams.get("v") || url.pathname.split("/").pop();
                                if (videoId && videoId.length > 5) {
                                  return (
                                    <iframe 
                                      width="100%" 
                                      height="100%" 
                                      src={`https://www.youtube.com/embed/${videoId}`} 
                                      title="YouTube video player" 
                                      frameBorder="0" 
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                      allowFullScreen
                                    ></iframe>
                                  );
                                }
                                return <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm font-medium">Invalid YouTube URL format</div>;
                              } catch(e) {
                                return <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm font-medium">Invalid URL</div>;
                              }
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                    <Button 
                      onClick={handleSavePayment}
                      disabled={isUpdatingPayment}
                      className="w-full rounded-2xl shadow-xl shadow-primary/20 h-14 text-lg font-bold mt-4"
                    >
                      {isUpdatingPayment ? "Saving Guide..." : "Save Recharge Guide"}
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}
      </div>

      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-8 border-2 border-slate-100 dark:border-slate-800 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Reject Request</DialogTitle>
            <DialogDescription className="text-sm font-medium text-slate-500 mt-2">
              Provide a reason for rejection so the franchise can correct the issue (e.g. "Invalid screenshot").
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection..."
              className="w-full rounded-2xl border-2 border-slate-200 dark:border-slate-800 p-4 text-sm font-medium bg-slate-50 dark:bg-slate-900 min-h-[120px] focus:ring-red-500 focus:border-red-500 transition-colors"
            />
          </div>
          <DialogFooter className="sm:justify-between gap-3">
            <Button variant="ghost" onClick={() => setRejectModalOpen(false)} className="rounded-xl px-6">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectReason.trim()} className="rounded-xl px-8 shadow-lg shadow-red-500/20 font-bold">
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Direct Recharge Modal */}
      <Dialog open={rechargeModalOpen} onOpenChange={setRechargeModalOpen}>
        <DialogContent className="sm:max-w-xl rounded-3xl p-8 border-2 border-slate-100 dark:border-slate-800 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black flex items-center gap-2">
              <PlusCircle className="h-6 w-6 text-primary" />
              Direct Recharge
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-slate-500 mt-2">
              Manually add funds to {selectedWorkspace?.name}&apos;s wallet. This bypasses the approval flow and credits them immediately.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleDirectRecharge} className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Amount (₹)</label>
              <div className="relative">
                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-12 h-14 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-bold text-xl"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Reason / Note</label>
              <textarea
                required
                value={rechargeReason}
                onChange={(e) => setRechargeReason(e.target.value)}
                placeholder="e.g. Promotional credit, correction..."
                className="w-full rounded-2xl border-2 border-slate-200 dark:border-slate-800 p-4 text-sm font-medium bg-slate-50 dark:bg-slate-900 min-h-[100px] focus:ring-primary focus:border-primary transition-colors resize-none"
              />
            </div>
            
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Recharge Type</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className={cn(
                  "relative flex cursor-pointer rounded-2xl border-2 p-4 transition-all hover:bg-slate-50 dark:hover:bg-slate-900/50",
                  !isPromotional ? "border-primary bg-primary/5" : "border-slate-200 dark:border-slate-800"
                )}>
                  <input type="radio" name="rechargeType" className="sr-only" checked={!isPromotional} onChange={() => setIsPromotional(false)} />
                  <div className="flex w-full flex-col">
                    <span className="font-bold text-slate-900 dark:text-white">Standard Recharge</span>
                    <span className="text-xs font-medium text-slate-500 mt-1">Generates State Manager Commission</span>
                  </div>
                </label>

                <label className={cn(
                  "relative flex cursor-pointer rounded-2xl border-2 p-4 transition-all hover:bg-slate-50 dark:hover:bg-slate-900/50",
                  isPromotional ? "border-amber-500 bg-amber-500/5" : "border-slate-200 dark:border-slate-800"
                )}>
                  <input type="radio" name="rechargeType" className="sr-only" checked={isPromotional} onChange={() => setIsPromotional(true)} />
                  <div className="flex w-full flex-col">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                      Promotional Offer <Badge className="bg-amber-500 hover:bg-amber-600 text-[9px] px-1.5 py-0">NEW</Badge>
                    </span>
                    <span className="text-xs font-medium text-slate-500 mt-1">NO Commission to State Manager</span>
                  </div>
                </label>
              </div>
            </div>

            <DialogFooter className="pt-6 sm:justify-between gap-3">
              <Button type="button" variant="ghost" onClick={() => setRechargeModalOpen(false)} className="rounded-xl px-6">
                Cancel
              </Button>
              <Button type="submit" disabled={isRecharging} className="rounded-xl px-8 shadow-lg shadow-primary/20 font-bold">
                {isRecharging ? "Adding Funds..." : "Add Funds Now"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Franchise Transaction History Modal */}
      <Dialog open={historyModalOpen} onOpenChange={setHistoryModalOpen}>
        <DialogContent className="sm:max-w-2xl rounded-3xl p-8 border-2 border-slate-100 dark:border-slate-800 shadow-2xl h-[85vh] flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle className="text-2xl font-black flex items-center gap-2">
              <History className="h-6 w-6 text-slate-500" />
              Transaction History
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-slate-500 mt-2">
              Viewing all recorded transactions for <span className="font-bold text-slate-900 dark:text-white">{selectedWorkspace?.name}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto mt-4 pr-2 -mr-2 space-y-4">
            {(() => {
              const franchiseTx = allTransactions.filter(tx => tx.workspaceId === selectedWorkspace?.id);
              if (franchiseTx.length === 0) {
                return (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2 opacity-60">
                    <FileText className="h-12 w-12" />
                    <p className="font-bold">No transactions found</p>
                  </div>
                );
              }
              
              const totalHistoryPages = Math.max(1, Math.ceil(franchiseTx.length / HISTORY_PER_PAGE));
              const paginatedHistory = franchiseTx.slice((historyPage - 1) * HISTORY_PER_PAGE, historyPage * HISTORY_PER_PAGE);

              return (
                <>
                  <div className="space-y-4">
                    {paginatedHistory.map(tx => {
                      const isRejected = tx.status === 'REJECTED';
                      const isDirect = tx.referenceId?.startsWith('DIRECT-');
                      
                      return (
                        <div key={tx.id} className={cn(
                          "flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border gap-4",
                          isRejected ? "border-red-200 dark:border-red-900/50" : "border-slate-100 dark:border-slate-800"
                        )}>
                          <div className="flex items-start gap-4">
                            <div className={cn(
                              "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 mt-1 sm:mt-0",
                              isRejected ? "bg-red-500/10 text-red-600" :
                              tx.type === 'CREDIT' ? "bg-green-500/10 text-green-600" : "bg-orange-500/10 text-orange-600"
                            )}>
                              {isRejected ? <XCircle className="h-5 w-5" /> : 
                               tx.type === 'CREDIT' ? <PlusCircle className="h-5 w-5" /> : <SettingsIcon className="h-5 w-5" />}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-slate-900 dark:text-white flex items-center flex-wrap gap-2">
                                <span className={cn(isRejected && "line-through text-red-500 opacity-80")}>
                                  {tx.description || (tx.type === 'CREDIT' ? 'Wallet Recharge' : 'Deduction')}
                                </span>
                                
                                {isDirect && (
                                  <Badge className="border-none text-[9px] px-1.5 py-0 rounded-md bg-purple-500/10 text-purple-600">
                                    DIRECT FUNDS
                                  </Badge>
                                )}
                                {!isDirect && tx.type === 'CREDIT' && (
                                  <Badge className="border-none text-[9px] px-1.5 py-0 rounded-md bg-blue-500/10 text-blue-600">
                                    REQUEST
                                  </Badge>
                                )}
                                
                                <Badge className={cn(
                                  "border-none text-[9px] px-1.5 py-0 rounded-md",
                                  tx.status === 'APPROVED' ? "bg-green-500/10 text-green-600" :
                                  isRejected ? "bg-red-500 text-white" :
                                  "bg-amber-500/10 text-amber-600"
                                )}>
                                  {tx.status}
                                </Badge>
                              </p>
                              <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-1">
                                <Clock className="h-3 w-3" /> 
                                {new Date(tx.createdAt).toLocaleString()}
                                {tx.referenceId && <span className="ml-2 font-mono text-slate-400 bg-slate-200/50 dark:bg-slate-800 px-1 rounded">Ref: {tx.referenceId}</span>}
                              </p>
                              {isRejected && tx.rejectionReason && (
                                <p className="text-xs text-red-600 font-bold mt-1 bg-red-50 p-1.5 rounded-lg inline-block">
                                  Reason: {tx.rejectionReason}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="sm:text-right shrink-0">
                            <p className={cn(
                              "font-black text-lg flex items-center sm:justify-end gap-1",
                              isRejected ? "text-red-500 line-through" :
                              tx.type === 'CREDIT' ? "text-green-600" : "text-slate-900 dark:text-white"
                            )}>
                              {tx.type === 'CREDIT' ? '+' : '-'} <IndianRupee className="h-4 w-4" /> {tx.amount.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {franchiseTx.length > HISTORY_PER_PAGE && (
                    <div className="mt-6 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                      <p className="text-xs font-semibold text-slate-500">
                        Showing {(historyPage - 1) * HISTORY_PER_PAGE + 1} to {Math.min(historyPage * HISTORY_PER_PAGE, franchiseTx.length)} of {franchiseTx.length}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                          disabled={historyPage === 1}
                          className="rounded-xl h-8 px-2 border-slate-200 dark:border-slate-700"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="text-sm font-bold px-3 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
                          {historyPage} / {totalHistoryPages}
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setHistoryPage(p => Math.min(totalHistoryPages, p + 1))}
                          disabled={historyPage === totalHistoryPages}
                          className="rounded-xl h-8 px-2 border-slate-200 dark:border-slate-700"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
          <DialogFooter className="shrink-0 pt-4 border-t border-slate-100 dark:border-slate-800 mt-2">
            <Button variant="outline" onClick={() => setHistoryModalOpen(false)} className="w-full sm:w-auto rounded-xl">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
