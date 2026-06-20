"use client";

import React, { useState, useEffect } from "react";
import { 
  IndianRupee, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle2, 
  XCircle,
  UploadCloud,
  CreditCard,
  List,
  PlusCircle,
  ArrowRight,
  ArrowLeft,
  Video,
  FileText,
  Check,
  QrCode,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Filter
} from "lucide-react";
import { motion } from "framer-motion";
import { AdminPageHeader } from "@/components/layout/AdminPageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { submitRechargeRequest } from "@/app/actions/wallet";
import { toast } from "sonner";
import Image from "next/image";
import { ImageUpload } from "@/components/ui/ImageUpload";

interface WalletDashboardClientProps {
  workspaceId: string;
  tenant: string;
  balance: number;
  transactions: any[];
  paymentConfig: any;
}

export default function WalletDashboardClient({
  workspaceId,
  tenant,
  balance,
  transactions,
  paymentConfig
}: WalletDashboardClientProps) {
  const [activeTab, setActiveTab] = useState("recharge");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState("");
  const [referenceId, setReferenceId] = useState("");
  const [receiptUrl, setReceiptUrl] = useState("");
  
  // Stepper state
  const [step, setStep] = useState(1);
  const [agreed, setAgreed] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Transaction Filters & Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [dateRange, setDateRange] = useState("ALL");
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmitRecharge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rechargeAmount || !referenceId || !receiptUrl) {
      toast.error("Please fill all fields and provide a receipt URL/screenshot.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitRechargeRequest(
        workspaceId, 
        Number(rechargeAmount), 
        referenceId, 
        receiptUrl,
        tenant
      );
      if (res.success) {
        toast.success("Recharge request submitted successfully. Waiting for approval.");
        setRechargeAmount("");
        setReferenceId("");
        setReceiptUrl("");
        setStep(1);
        setAgreed(false);
      } else {
        toast.error("Failed to submit: " + res.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    // Status filter
    if (filterStatus !== "ALL" && tx.status !== filterStatus) return false;
    // Date filter
    if (dateRange !== "ALL") {
      const txDate = new Date(tx.createdAt);
      const now = new Date();
      
      if (dateRange.startsWith("YEAR_")) {
        const year = parseInt(dateRange.replace("YEAR_", ""));
        if (txDate.getFullYear() !== year) return false;
      } else {
        const diffTime = Math.abs(now.getTime() - txDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (dateRange === "7DAYS" && diffDays > 7) return false;
        if (dateRange === "30DAYS" && diffDays > 30) return false;
        if (dateRange === "THIS_MONTH") {
          if (txDate.getMonth() !== now.getMonth() || txDate.getFullYear() !== now.getFullYear()) return false;
        }
      }
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE));
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, dateRange]);
  
  // Dynamically determine available years from transactions to improve UX
  const currentYear = new Date().getFullYear();
  const oldestYear = transactions.reduce((oldest, tx) => {
    const txYear = new Date(tx.createdAt).getFullYear();
    return Math.min(oldest, txYear);
  }, currentYear);
  
  const filterYears = [];
  for (let y = currentYear; y >= oldestYear; y--) {
    filterYears.push(y);
  }

  const tabs = [
    { id: "recharge", label: "Recharge Wallet", icon: PlusCircle },
    { id: "guide", label: "Recharge Guide", icon: Video },
    { id: "transactions", label: "Transaction History", icon: List },
  ];

  return (
    <div className="p-4 lg:p-10 max-w-7xl mx-auto space-y-8">
      <AdminPageHeader 
        title="Wallet Dashboard" 
        description="Manage your franchise wallet balance and recharge."
      />

      {/* Balance Card */}
      <Card className="border-2 border-slate-100 dark:border-slate-800 bg-gradient-to-br from-indigo-600 to-violet-800 text-white rounded-[2.5rem] shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <CreditCard className="h-32 w-32" />
        </div>
        <CardContent className="p-10 relative z-10">
          <p className="text-sm font-black uppercase tracking-widest text-indigo-200 mb-2">Available Balance</p>
          <div className="flex items-baseline gap-2">
            <IndianRupee className="h-8 w-8 text-indigo-100" />
            <span className="text-6xl font-black tracking-tight">{balance.toFixed(2)}</span>
          </div>
          <p className="text-sm font-medium text-indigo-200 mt-4 max-w-md">
            This balance is used for student registrations. Make sure to maintain sufficient balance.
          </p>
        </CardContent>
      </Card>

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
          </button>
        ))}
      </div>

      <div className="transition-all duration-300">
        {activeTab === "transactions" && (
          <Card className="border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col min-h-[500px]">
            <CardHeader className="p-6 md:p-8 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle className="text-xl font-bold tracking-tight">Recent Transactions</CardTitle>
              <div className="flex flex-wrap items-center gap-3">
                <Select value={filterStatus} onValueChange={(val) => setFilterStatus(val as string)}>
                  <SelectTrigger className="w-[140px] rounded-xl h-10 bg-slate-50 border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                    <Filter className="w-3.5 h-3.5 mr-2 text-slate-400" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={dateRange} onValueChange={(val) => setDateRange(val as string)}>
                  <SelectTrigger className="w-[140px] rounded-xl h-10 bg-slate-50 border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                    <Filter className="w-3.5 h-3.5 mr-2 text-slate-400" />
                    <SelectValue placeholder="Date" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl max-h-[300px]">
                    <SelectItem value="ALL">All Time</SelectItem>
                    <SelectItem value="7DAYS">Last 7 Days</SelectItem>
                    <SelectItem value="30DAYS">Last 30 Days</SelectItem>
                    <SelectItem value="THIS_MONTH">This Month</SelectItem>
                    {filterYears.map(year => (
                      <SelectItem key={year} value={`YEAR_${year}`}>
                        Year {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col">
              <div className="divide-y divide-slate-50 dark:divide-slate-800 flex-1">
                {paginatedTransactions.map(tx => {
                  const isRejected = tx.status === 'REJECTED';
                  const isCredit = tx.type === 'CREDIT';
                  
                  return (
                    <div key={tx.id} className={cn(
                      "flex flex-col md:flex-row md:items-center justify-between p-6 transition-all gap-4 md:gap-8",
                      isRejected ? "bg-red-50/50 dark:bg-red-900/10 hover:bg-red-50 dark:hover:bg-red-900/20" : "hover:bg-slate-50 dark:hover:bg-slate-800/30"
                    )}>
                      {/* Left: Icon & Title */}
                      <div className="flex items-center gap-4 shrink-0 md:w-1/3">
                        <div className={cn(
                          "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                          isRejected ? "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400" 
                                     : isCredit ? "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400" 
                                                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        )}>
                          {isRejected ? <XCircle className="h-6 w-6" /> : isCredit ? <ArrowDownLeft className="h-6 w-6" /> : <ArrowUpRight className="h-6 w-6" />}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            {tx.description || (isCredit ? 'Wallet Recharge' : 'Student Registration')}
                            {tx.status === 'PENDING' && <Badge className="bg-amber-500/10 text-amber-600 border-none text-[9px] px-1.5 py-0">PENDING</Badge>}
                          </p>
                          <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" /> {mounted ? new Date(tx.createdAt).toLocaleDateString() : new Date(tx.createdAt).toISOString().split('T')[0]}
                          </p>
                        </div>
                      </div>

                      {/* Middle: Rejection Reason / Context */}
                      <div className="flex-1 flex items-center justify-start md:justify-center">
                        {isRejected ? (
                          <div className="flex flex-col items-start md:items-center text-left md:text-center max-w-sm">
                            <Badge className="bg-red-500 text-white hover:bg-red-600 border-none text-[10px] mb-1">REJECTED</Badge>
                            <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                              {tx.rejectionReason || "No specific reason provided"}
                            </span>
                          </div>
                        ) : (
                          <div className="text-slate-400 text-sm hidden md:block">
                            {tx.referenceId ? `Ref: ${tx.referenceId}` : ''}
                          </div>
                        )}
                      </div>

                      {/* Right: Amount */}
                      <div className={cn(
                        "text-right font-black text-lg flex items-center justify-end gap-1 shrink-0 md:w-1/4",
                        isRejected ? "text-red-600 dark:text-red-400 line-through opacity-70" 
                                   : isCredit ? "text-green-600 dark:text-green-400" 
                                              : "text-slate-900 dark:text-white"
                      )}>
                        {isCredit ? '+' : '-'} <IndianRupee className="h-4 w-4" /> {tx.amount.toFixed(2)}
                      </div>
                    </div>
                  );
                })}
                {paginatedTransactions.length === 0 && (
                  <div className="p-16 flex flex-col items-center justify-center text-slate-400">
                    <List className="h-12 w-12 mb-4 opacity-20" />
                    <p className="font-bold text-lg">No transactions found</p>
                    <p className="text-sm font-medium opacity-70">Try adjusting your filters.</p>
                  </div>
                )}
              </div>
              
              {/* Pagination Controls */}
              {filteredTransactions.length > 0 && (
                <div className="p-4 border-t border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-500">
                    Showing <span className="text-slate-900 dark:text-white">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="text-slate-900 dark:text-white">{Math.min(currentPage * ITEMS_PER_PAGE, filteredTransactions.length)}</span> of <span className="text-slate-900 dark:text-white">{filteredTransactions.length}</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="rounded-xl h-8 px-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-sm font-bold px-3 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
                      {currentPage} / {totalPages}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="rounded-xl h-8 px-2"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "recharge" && (
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
            
            {/* Left Sidebar - Vertical Stepper */}
            <div className="lg:col-span-4 sticky top-6 self-start">
              <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl rounded-[2.5rem] p-8 border border-white/40 dark:border-white/10 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.5)]">
                <h3 className="text-xl font-bold tracking-tight mb-8 bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">Recharge Process</h3>
                <div className="space-y-8 relative">
                   <div className="absolute left-[1.35rem] top-6 bottom-6 w-1 bg-slate-100 dark:bg-slate-800 rounded-full z-0 translate-x-[-50%]"></div>
                   <motion.div 
                     initial={{ height: 0 }}
                     animate={{ height: `${((step - 1) / 3) * 100}%` }}
                     transition={{ type: "spring", stiffness: 100, damping: 20 }}
                     className="absolute left-[1.35rem] top-6 w-1 bg-primary rounded-full z-0 translate-x-[-50%] shadow-[0_0_15px_rgba(var(--primary),0.5)]" 
                   />
                   
                   {[
                     { s: 1, title: "Terms & Conditions", desc: "Review and accept terms", icon: FileText },
                     { s: 2, title: "Recharge Amount", desc: "Enter amount to add", icon: IndianRupee },
                     { s: 3, title: "Make Payment", desc: "Scan QR & Transfer", icon: QrCode },
                     { s: 4, title: "Verify Payment", desc: "Upload receipt", icon: ShieldCheck }
                   ].map((item) => (
                     <div key={item.s} className={cn("relative z-10 flex gap-5 items-start transition-all duration-500", step === item.s ? "opacity-100 scale-105 origin-left" : (step > item.s ? "opacity-100" : "opacity-40"))}>
                       <div className={cn("w-[2.7rem] h-[2.7rem] rounded-2xl flex items-center justify-center shrink-0 border-2 font-bold transition-all duration-500", step > item.s ? "border-primary bg-primary text-white shadow-[0_0_20px_-5px_rgba(var(--primary),0.5)]" : step === item.s ? "border-primary bg-white dark:bg-slate-950 text-primary shadow-[0_0_25px_-5px_rgba(var(--primary),0.5)]" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-400")}>
                         {step > item.s ? <Check className="h-5 w-5 stroke-[3]" /> : <item.icon className="h-5 w-5" />}
                       </div>
                       <div className="pt-1.5">
                         <h4 className={cn("font-bold text-base leading-none mb-1.5 transition-colors duration-500", step === item.s ? "text-primary" : "text-slate-900 dark:text-white")}>{item.title}</h4>
                         <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{item.desc}</p>
                       </div>
                     </div>
                   ))}
                </div>
              </div>
            </div>

            {/* Right Side - Form Content */}
            <div className="lg:col-span-8">
              <Card className="border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-sm overflow-hidden h-full">
                
                {/* Step 1: Instructions & Agreement */}
                {step === 1 && (
                  <div className="animate-in slide-in-from-right-4 duration-500 flex flex-col h-full min-h-[400px]">
                    <CardHeader className="p-8 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                      <CardTitle className="text-xl font-bold tracking-tight">Step 1: Terms & Conditions</CardTitle>
                      <CardDescription className="text-xs font-medium text-slate-500">Please read the terms carefully before proceeding.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 flex-1 flex flex-col">
                      <div className="flex-1 overflow-y-auto pr-4 mb-6 custom-scrollbar text-slate-700 dark:text-slate-300">
                        {paymentConfig?.agreementTerms ? (
                          <>
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Terms of Payment</h4>
                            <p className="text-sm font-medium whitespace-pre-wrap leading-relaxed">
                              {paymentConfig.agreementTerms}
                            </p>
                          </>
                        ) : (
                          <div className="text-center text-slate-500 text-sm font-medium h-full flex flex-col items-center justify-center">
                            <FileText className="h-10 w-10 text-slate-300 mb-4" />
                            No specific terms provided.
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="p-6 px-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 mt-auto">
                      <div 
                        className="flex items-center space-x-3 cursor-pointer group" 
                        onClick={() => setAgreed(!agreed)}
                      >
                        <Checkbox 
                          id="terms" 
                          checked={agreed} 
                          onCheckedChange={(c) => setAgreed(c as boolean)} 
                          className="h-6 w-6 rounded-md border-2 transition-colors data-[state=checked]:bg-primary data-[state=checked]:border-primary" 
                        />
                        <label htmlFor="terms" className="text-sm font-bold cursor-pointer group-hover:text-primary transition-colors pointer-events-none">
                          I have read and agree to the payment terms.
                        </label>
                      </div>
                      <Button onClick={() => setStep(2)} disabled={!agreed} className="rounded-xl px-8 h-12 text-base font-bold shadow-md shadow-primary/10 gap-2 outline-none focus:outline-none focus-visible:ring-0 shrink-0 w-full md:w-auto">
                        Continue to Amount <ArrowRight className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </div>
                )}

                {/* Step 2: Enter Amount */}
                {step === 2 && (
                  <div className="animate-in slide-in-from-right-4 duration-500 flex flex-col h-full min-h-[400px]">
                    <CardHeader className="p-8 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                      <CardTitle className="text-xl font-bold tracking-tight">Step 2: Recharge Amount</CardTitle>
                      <CardDescription className="text-xs font-medium text-slate-500">How much would you like to recharge into your wallet?</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 flex-1 flex flex-col justify-center">
                      <div className="space-y-6 max-w-sm mx-auto text-center w-full">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Amount to Recharge (₹)</label>
                        <div className="relative group mx-auto w-full max-w-[280px]">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 flex justify-center">
                            <IndianRupee className="h-6 w-6 text-slate-400 group-focus-within:text-primary transition-colors" />
                          </div>
                          <Input 
                            type="number"
                            value={rechargeAmount}
                            onChange={e => setRechargeAmount(e.target.value)}
                            placeholder="0.00"
                            className="rounded-2xl text-2xl md:text-3xl font-black h-16 pl-14 pr-6 bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 focus-visible:ring-4 focus-visible:ring-primary/10 focus-visible:border-primary transition-all text-center shadow-sm hover:border-slate-300 dark:hover:border-slate-700"
                          />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-6 px-8 flex justify-between border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 mt-auto">
                      <Button variant="ghost" onClick={() => setStep(1)} className="rounded-xl px-6 h-12 font-bold gap-2 hover:bg-slate-100 outline-none focus:outline-none focus-visible:ring-0">
                        <ArrowLeft className="h-4 w-4" /> Back to Terms
                      </Button>
                      <Button onClick={() => setStep(3)} disabled={!rechargeAmount || Number(rechargeAmount) <= 0} className="rounded-xl px-8 h-12 text-base font-bold shadow-md shadow-primary/10 gap-2 outline-none focus:outline-none focus-visible:ring-0">
                        View Payment Details <ArrowRight className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </div>
                )}

                {/* Step 3: Scan & Pay */}
                {step === 3 && (
                  <div className="animate-in slide-in-from-right-4 duration-500 flex flex-col h-full min-h-[400px]">
                    <CardHeader className="p-8 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                      <CardTitle className="text-xl font-bold tracking-tight">Step 3: Make Payment</CardTitle>
                      <CardDescription className="text-xs font-medium text-slate-500">Please pay exactly ₹{rechargeAmount} using the details below.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10 flex-1">
                      
                      {/* QR Section */}
                      {paymentConfig?.qrCodeUrl && (
                        <div className="flex flex-col items-center justify-center p-10 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-3xl h-full shadow-inner">
                          <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
                            <Image src={paymentConfig.qrCodeUrl} alt="QR Code" width={220} height={220} className="object-contain" />
                          </div>
                          <p className="text-xs font-black text-slate-500 mt-8 tracking-widest uppercase">Scan via any UPI App</p>
                        </div>
                      )}

                      {/* Bank Details Section */}
                      <div className="space-y-6 flex flex-col justify-center">
                        {paymentConfig?.upiId && (
                          <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl border-2 border-slate-100 dark:border-slate-800 flex items-center justify-between shadow-inner">
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Direct UPI ID</p>
                              <p className="font-bold text-slate-900 dark:text-white text-lg font-mono">{paymentConfig.upiId}</p>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(paymentConfig.upiId)} className="rounded-xl h-10 px-6 font-bold">Copy</Button>
                          </div>
                        )}

                        {(paymentConfig?.bankName || paymentConfig?.accountNumber) && (
                          <div className="p-8 bg-slate-50 dark:bg-slate-900 rounded-3xl border-2 border-slate-100 dark:border-slate-800 space-y-4 shadow-inner">
                            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-200 dark:border-slate-800 pb-4">Manual Bank Transfer</p>
                            
                            {paymentConfig.bankName && (
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-500 font-bold uppercase tracking-wide">Bank Name</span>
                                <span className="text-sm font-bold text-slate-900 dark:text-white">{paymentConfig.bankName}</span>
                              </div>
                            )}
                            {paymentConfig.accountHolderName && (
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-500 font-bold uppercase tracking-wide">Account Name</span>
                                <span className="text-sm font-bold text-slate-900 dark:text-white">{paymentConfig.accountHolderName}</span>
                              </div>
                            )}
                            {paymentConfig.accountNumber && (
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-500 font-bold uppercase tracking-wide">Account No.</span>
                                <span className="text-base font-black text-slate-900 dark:text-white font-mono">{paymentConfig.accountNumber}</span>
                              </div>
                            )}
                            {paymentConfig.ifscCode && (
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-500 font-bold uppercase tracking-wide">IFSC Code</span>
                                <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">{paymentConfig.ifscCode}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                    </CardContent>
                    <CardFooter className="p-6 px-8 flex justify-between border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 mt-auto">
                      <Button variant="ghost" onClick={() => setStep(2)} className="rounded-xl px-6 h-12 font-bold gap-2 hover:bg-slate-100 outline-none focus:outline-none focus-visible:ring-0">
                        <ArrowLeft className="h-4 w-4" /> Back to Amount
                      </Button>
                      <Button onClick={() => setStep(4)} className="rounded-xl px-8 h-12 text-base font-bold shadow-md shadow-primary/10 gap-2 outline-none focus:outline-none focus-visible:ring-0">
                        Upload Payment Receipt <ArrowRight className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </div>
                )}

                {/* Step 4: Upload Receipt */}
                {step === 4 && (
                  <div className="animate-in slide-in-from-right-4 duration-500 flex flex-col h-full min-h-[400px]">
                    <CardHeader className="p-8 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                      <CardTitle className="text-xl font-bold tracking-tight">Step 4: Verify Payment</CardTitle>
                      <CardDescription className="text-xs font-medium text-slate-500">Upload your successful transaction screenshot and reference number.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8 flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full">
                      <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500">Payment Screenshot</label>
                        <ImageUpload 
                          value={receiptUrl}
                          onChange={(url) => setReceiptUrl(url)}
                          folder="receipts"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500">Transaction Reference ID (UTR / UPI Ref)</label>
                        <Input 
                          required
                          value={referenceId}
                          onChange={e => setReferenceId(e.target.value)}
                          placeholder="e.g. 312345678901"
                          className="rounded-2xl font-medium bg-slate-50 dark:bg-slate-900 border-2 h-16 text-xl pl-6"
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="p-6 px-8 flex justify-between border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 mt-auto">
                      <Button variant="ghost" onClick={() => setStep(3)} className="rounded-xl px-6 h-12 font-bold gap-2 hover:bg-slate-100 outline-none focus:outline-none focus-visible:ring-0">
                        <ArrowLeft className="h-4 w-4" /> Back to Payment
                      </Button>
                      <Button onClick={handleSubmitRecharge} disabled={isSubmitting || !receiptUrl || !referenceId} className="rounded-xl px-8 h-12 text-base font-bold shadow-md shadow-primary/10 gap-2 outline-none focus:outline-none focus-visible:ring-0">
                        {isSubmitting ? "Submitting..." : "Submit Recharge Request"} <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </div>
                )}

              </Card>
            </div>
          </div>
        )}

        {activeTab === "guide" && (
          <div className="w-full">
            <Card className="border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-sm overflow-hidden">
              <CardHeader className="p-8 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                <CardTitle className="text-xl font-bold tracking-tight">
                  {paymentConfig?.guideTitle || "Wallet Recharge Guide"}
                </CardTitle>
                <CardDescription className="text-xs font-medium text-slate-500">
                  Follow this guide to easily recharge your wallet.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                
                {paymentConfig?.guideYoutubeLink && (
                  <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-3xl overflow-hidden border-4 border-slate-50 dark:border-slate-800">
                    <div className="aspect-video w-full">
                      {(() => {
                        try {
                          const url = new URL(paymentConfig.guideYoutubeLink);
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
                          return null;
                        } catch(e) {
                          return null;
                        }
                      })()}
                    </div>
                  </div>
                )}

                {paymentConfig?.guideDescription ? (
                  <div className="prose prose-slate dark:prose-invert max-w-none">
                    <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
                      <p className="whitespace-pre-wrap leading-loose text-slate-700 dark:text-slate-300">
                        {paymentConfig.guideDescription}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-12 text-slate-400 font-medium border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
                    No specific guide provided yet. Please navigate to the "Recharge Wallet" tab to proceed.
                  </div>
                )}

                <div className="flex justify-end pt-4">
                  <Button onClick={() => setActiveTab("recharge")} className="rounded-xl px-8 h-12 gap-2 shadow-lg shadow-primary/20">
                    Go to Recharge <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>

              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
