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
  Filter,
  Download,
  BarChart
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
import { Dialog, DialogContent } from "@/components/ui/dialog";
import FranchiseWalletAnalyticsTab from "./FranchiseWalletAnalyticsTab";

interface WalletDashboardClientProps {
  workspaceId: string;
  tenant: string;
  balance: number;
  transactions: any[];
  paymentConfig: any;
  workspace?: any;
  globalSettings?: any;
}

export default function WalletDashboardClient({
  workspaceId,
  tenant,
  balance,
  transactions,
  paymentConfig,
  workspace,
  globalSettings
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

  // Receipt Modal State
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedReceiptTx, setSelectedReceiptTx] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const downloadPdf = async (content: string | HTMLElement, filename: string) => {
    toast.loading("Generating Receipt...", { id: "receipt-gen" });
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const opt = {
        margin: 10,
        filename: filename,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, width: 794, windowWidth: 794 },
        jsPDF: { unit: 'mm' as const, format: 'a4', orientation: 'portrait' as const }
      };

      await html2pdf().set(opt).from(content).save();
      toast.success("Downloaded successfully!", { id: "receipt-gen" });
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate PDF.", { id: "receipt-gen" });
    }
  };

  const handleDownloadReceipt = () => {
    const element = document.getElementById("receipt-content");
    if (!element) return;

    // Clone to manipulate styles safely without affecting screen view
    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.width = '794px';
    clone.style.maxWidth = '794px';
    clone.style.margin = '0 auto';
    clone.style.backgroundColor = 'white';

    // Passing HTML string ensures html2pdf handles the hidden iframe lifecycle properly.
    // We exactly match the 794px width to prevent the hidden iframe's default 8px body margin
    // from causing a 16px right-side crop.
    const html = `
      <div style="width: 794px; background: white; margin: 0; padding: 0; overflow: hidden;">
        ${clone.outerHTML}
      </div>
    `;

    downloadPdf(html, `Payment_Receipt_${selectedReceiptTx?.referenceId || selectedReceiptTx?.id}.pdf`);
  };

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
    { id: "analytics", label: "Analytics & Report", icon: BarChart },
  ];

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 w-full mx-auto">
      <AdminPageHeader
        title="Wallet Dashboard"
        description="Manage your franchise wallet balance and recharge."
      />

      {/* Balance Card */}
      <Card className="border border-slate-200/80 dark:border-slate-800 bg-gradient-to-br from-indigo-600 to-violet-800 text-white rounded-xl shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <CreditCard className="h-24 w-24" />
        </div>
        <CardContent className="p-3.5 sm:p-4 relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-indigo-200 mb-0.5">Available Balance</p>
            <div className="flex items-baseline gap-1.5">
              <IndianRupee className="h-5 w-5 text-indigo-100" />
              <span className="text-2xl font-bold tracking-tight">{balance.toFixed(2)}</span>
            </div>
            <p className="text-xs font-medium text-indigo-200/90 mt-1 max-w-md">
              This balance is used for student registrations. Make sure to maintain sufficient balance.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setActiveTab("recharge")}
            className="h-8 sm:h-9 px-3 sm:px-4 rounded-lg text-xs font-semibold bg-white text-indigo-950 hover:bg-white/90 shadow-sm shrink-0 self-start sm:self-center gap-1.5"
          >
            <PlusCircle className="h-3.5 w-3.5" /> Recharge Now
          </Button>
        </CardContent>
      </Card>

      <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-1.5 p-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-full">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium shrink-0 whitespace-nowrap transition-all duration-150",
              activeTab === tab.id
                ? "bg-slate-100 dark:bg-slate-800 text-primary dark:text-white font-semibold shadow-inner"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50"
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="transition-all duration-300">
        {activeTab === "transactions" && (
          <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden bg-white dark:bg-slate-900 flex flex-col min-h-[400px]">
            <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white">Recent Transactions</CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                <Select value={filterStatus} onValueChange={(val) => setFilterStatus(val as string)}>
                  <SelectTrigger className="w-[130px] h-8 sm:h-9 text-xs font-medium rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
                    <Filter className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
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
                  <SelectTrigger className="w-[130px] h-8 sm:h-9 text-xs font-medium rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60">
                    <Filter className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
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
              <div className="divide-y divide-slate-50 dark:divide-slate-800/50 flex-1">
                {paginatedTransactions.map(tx => {
                  const isRejected = tx.status === 'REJECTED';
                  const isCredit = tx.type === 'CREDIT';

                  return (
                    <div key={tx.id} className={cn(
                      "flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-3.5 transition-all gap-3 sm:gap-4 group border-l-[3px]",
                      isRejected 
                        ? "border-rose-500 bg-rose-50/20 dark:bg-rose-950/10 hover:bg-rose-50/40" 
                        : isCredit 
                          ? "border-emerald-500 bg-white dark:bg-slate-900 hover:bg-slate-50/80 dark:hover:bg-slate-800/40" 
                          : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                    )}>
                      {/* Left: Icon & Title */}
                      <div className="flex items-center gap-3 shrink-0 sm:w-1/3">
                        <div className={cn(
                          "h-9 w-9 rounded-lg flex items-center justify-center shrink-0 shadow-sm",
                          isRejected ? "bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400"
                            : isCredit ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        )}>
                          {isRejected ? <XCircle className="h-4 w-4" /> : isCredit ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                            <span className="truncate">{tx.description || (isCredit ? 'Wallet Recharge' : 'Student Registration')}</span>
                            {tx.status === 'PENDING' && <Badge className="bg-amber-500/10 text-amber-600 border-none text-[9px] px-1.5 py-0">PENDING</Badge>}
                          </p>
                          <p className="text-[10px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                            <Clock className="h-3 w-3" /> {mounted ? new Date(tx.createdAt).toLocaleDateString() : new Date(tx.createdAt).toISOString().split('T')[0]}
                          </p>
                        </div>
                      </div>

                      {/* Middle: Rejection Reason / Context */}
                      <div className="flex-1 flex items-center justify-start sm:justify-center">
                        {isRejected ? (
                          <div className="flex flex-col items-start sm:items-center text-left sm:text-center max-w-sm">
                            <Badge className="bg-rose-500 text-white hover:bg-rose-600 border-none text-[9px] px-1.5 py-0 mb-0.5">REJECTED</Badge>
                            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                              {tx.rejectionReason || "No specific reason provided"}
                            </span>
                          </div>
                        ) : (
                          <div className="text-slate-400 text-xs font-mono hidden sm:block">
                            {tx.referenceId ? `Ref: ${tx.referenceId}` : ''}
                          </div>
                        )}
                      </div>

                      {/* Right: Amount */}
                      <div className="flex items-center gap-3 justify-between sm:justify-end shrink-0 sm:w-1/4">
                        {tx.status === 'APPROVED' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 sm:h-8 px-2.5 rounded-lg text-xs font-semibold"
                            onClick={() => {
                              setSelectedReceiptTx(tx);
                              setReceiptModalOpen(true);
                            }}
                          >
                            <FileText className="h-3.5 w-3.5 mr-1" />
                            Receipt
                          </Button>
                        )}
                        <div className={cn(
                          "text-right font-bold text-xs sm:text-sm flex items-center gap-0.5",
                          isRejected ? "text-rose-600 dark:text-rose-400 line-through opacity-70"
                            : isCredit ? "text-emerald-600 dark:text-emerald-400"
                              : "text-slate-900 dark:text-white"
                        )}>
                          {isCredit ? '+' : '-'} <IndianRupee className="h-3.5 w-3.5" /> {tx.amount.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {paginatedTransactions.length === 0 && (
                  <div className="p-12 flex flex-col items-center justify-center text-slate-400">
                    <List className="h-10 w-10 mb-3 opacity-20" />
                    <p className="font-semibold text-sm">No transactions found</p>
                    <p className="text-xs font-medium opacity-70">Try adjusting your filters.</p>
                  </div>
                )}
              </div>

              {/* Standardized Pagination System (Rule 7.6) */}
              {filteredTransactions.length > 0 && (
                <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20">
                  <p className="text-xs font-medium text-slate-500">
                    Showing <span className="text-slate-900 dark:text-white font-semibold">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="text-slate-900 dark:text-white font-semibold">{Math.min(currentPage * ITEMS_PER_PAGE, filteredTransactions.length)}</span> of <span className="text-slate-900 dark:text-white font-semibold">{filteredTransactions.length}</span>
                  </p>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="h-7 px-2 rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>
                    <div className="text-xs font-semibold px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md shadow-sm">
                      {currentPage} / {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="h-7 px-2 rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "recharge" && (
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-4 relative">

            {/* Left Sidebar - Vertical Stepper */}
            <div className="lg:col-span-4 sticky top-6 self-start">
              <div className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Recharge Steps</h3>
                <div className="space-y-4 relative">
                  <div className="absolute left-[1.1rem] top-4 bottom-4 w-0.5 bg-slate-100 dark:bg-slate-800 rounded-full z-0 translate-x-[-50%]"></div>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${((step - 1) / 3) * 100}%` }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    className="absolute left-[1.1rem] top-4 w-0.5 bg-primary rounded-full z-0 translate-x-[-50%]"
                  />

                  {[
                    { s: 1, title: "Terms & Conditions", desc: "Review and accept terms", icon: FileText },
                    { s: 2, title: "Recharge Amount", desc: "Enter amount to add", icon: IndianRupee },
                    { s: 3, title: "Make Payment", desc: "Scan QR & Transfer", icon: QrCode },
                    { s: 4, title: "Verify Payment", desc: "Upload receipt", icon: ShieldCheck }
                  ].map((item) => (
                    <div key={item.s} className={cn("relative z-10 flex gap-3 items-start transition-all duration-300", step === item.s ? "opacity-100" : (step > item.s ? "opacity-100" : "opacity-40"))}>
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border font-bold text-xs transition-all duration-300", step > item.s ? "border-primary bg-primary text-white" : step === item.s ? "border-primary bg-white dark:bg-slate-950 text-primary" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-400")}>
                        {step > item.s ? <Check className="h-4 w-4 stroke-[3]" /> : <item.icon className="h-4 w-4" />}
                      </div>
                      <div className="pt-0.5 min-w-0">
                        <h4 className={cn("font-semibold text-xs leading-tight mb-0.5 transition-colors duration-300", step === item.s ? "text-primary dark:text-white" : "text-slate-900 dark:text-white")}>{item.title}</h4>
                        <p className="text-[10px] text-slate-500 truncate">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side - Form Content */}
            <div className="lg:col-span-8">
              <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden bg-white dark:bg-slate-900 h-full">

                {/* Step 1: Instructions & Agreement */}
                {step === 1 && (
                  <div className="animate-in slide-in-from-right-4 duration-300 flex flex-col h-full min-h-[350px]">
                    <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                      <CardTitle className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white">Step 1: Terms & Conditions</CardTitle>
                      <CardDescription className="text-xs font-medium text-slate-500">Please read the terms carefully before proceeding.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-5 flex-1 flex flex-col">
                      <div className="flex-1 overflow-y-auto pr-2 mb-4 custom-scrollbar text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
                        {paymentConfig?.agreementTerms ? (
                          <>
                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Terms of Payment</h4>
                            <p className="whitespace-pre-wrap">
                              {paymentConfig.agreementTerms}
                            </p>
                          </>
                        ) : (
                          <div className="text-center text-slate-500 text-xs font-medium h-full flex flex-col items-center justify-center p-8">
                            <FileText className="h-8 w-8 text-slate-300 mb-2" />
                            No specific terms provided.
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 mt-auto">
                      <div
                        className="flex items-center space-x-2.5 cursor-pointer group"
                        onClick={() => setAgreed(!agreed)}
                      >
                        <Checkbox
                          id="terms"
                          checked={agreed}
                          onCheckedChange={(c) => setAgreed(c as boolean)}
                          className="h-4 w-4 rounded border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <label htmlFor="terms" className="text-xs font-medium cursor-pointer group-hover:text-primary transition-colors pointer-events-none">
                          I have read and agree to the payment terms.
                        </label>
                      </div>
                      <Button onClick={() => setStep(2)} disabled={!agreed} className="h-8 sm:h-9 px-4 rounded-lg text-xs font-semibold shadow-sm gap-1.5 shrink-0 w-full sm:w-auto">
                        Continue <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </CardFooter>
                  </div>
                )}

                {/* Step 2: Enter Amount */}
                {step === 2 && (
                  <div className="animate-in slide-in-from-right-4 duration-300 flex flex-col h-full min-h-[350px]">
                    <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                      <CardTitle className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white">Step 2: Recharge Amount</CardTitle>
                      <CardDescription className="text-xs font-medium text-slate-500">How much would you like to recharge into your wallet?</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 flex-1 flex flex-col justify-center">
                      <div className="space-y-4 max-w-xs mx-auto text-center w-full">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Amount to Recharge (₹)</label>
                        <div className="relative group mx-auto w-full">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 flex justify-center">
                            <IndianRupee className="h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                          </div>
                          <Input
                            type="number"
                            value={rechargeAmount}
                            onChange={e => setRechargeAmount(e.target.value)}
                            placeholder="0.00"
                            className="rounded-lg text-xl font-bold h-11 pl-9 pr-4 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-center shadow-sm"
                          />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-3.5 sm:p-4 flex justify-between border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 mt-auto">
                      <Button variant="ghost" onClick={() => setStep(1)} className="h-8 sm:h-9 px-3 rounded-lg text-xs font-semibold gap-1.5">
                        <ArrowLeft className="h-3.5 w-3.5" /> Back
                      </Button>
                      <Button onClick={() => setStep(3)} disabled={!rechargeAmount || Number(rechargeAmount) <= 0} className="h-8 sm:h-9 px-4 rounded-lg text-xs font-semibold shadow-sm gap-1.5">
                        Payment Details <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </CardFooter>
                  </div>
                )}

                {/* Step 3: Scan & Pay */}
                {step === 3 && (
                  <div className="animate-in slide-in-from-right-4 duration-300 flex flex-col h-full min-h-[350px]">
                    <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                      <CardTitle className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white">Step 3: Make Payment</CardTitle>
                      <CardDescription className="text-xs font-medium text-slate-500">Please pay exactly ₹{rechargeAmount} using the details below.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-5 flex-1">

                      {/* QR Section */}
                      {paymentConfig?.qrCodeUrl && (
                        <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl h-full">
                          <div className="bg-white p-2.5 rounded-lg shadow-sm border border-slate-100">
                            <Image src={paymentConfig.qrCodeUrl} alt="QR Code" width={160} height={160} className="object-contain" />
                          </div>
                          <p className="text-[10px] font-bold text-slate-500 mt-3 tracking-wider uppercase">Scan via any UPI App</p>
                        </div>
                      )}

                      {/* Bank Details Section */}
                      <div className="space-y-3 flex flex-col justify-center text-xs">
                        {paymentConfig?.upiId && (
                          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <div>
                              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Direct UPI ID</p>
                              <p className="font-bold text-slate-900 dark:text-white text-xs font-mono">{paymentConfig.upiId}</p>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(paymentConfig.upiId)} className="h-7 px-2.5 rounded-md text-xs font-semibold">Copy</Button>
                          </div>
                        )}

                        {(paymentConfig?.bankName || paymentConfig?.accountNumber) && (
                          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 border-b border-slate-200 dark:border-slate-800 pb-1.5">Manual Bank Transfer</p>

                            {paymentConfig.bankName && (
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500 font-medium">Bank Name</span>
                                <span className="font-semibold text-slate-900 dark:text-white">{paymentConfig.bankName}</span>
                              </div>
                            )}
                            {paymentConfig.accountHolderName && (
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500 font-medium">Account Name</span>
                                <span className="font-semibold text-slate-900 dark:text-white">{paymentConfig.accountHolderName}</span>
                              </div>
                            )}
                            {paymentConfig.accountNumber && (
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500 font-medium">Account No.</span>
                                <span className="font-bold text-slate-900 dark:text-white font-mono">{paymentConfig.accountNumber}</span>
                              </div>
                            )}
                            {paymentConfig.ifscCode && (
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500 font-medium">IFSC Code</span>
                                <span className="font-semibold text-slate-900 dark:text-white font-mono">{paymentConfig.ifscCode}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                    </CardContent>
                    <CardFooter className="p-3.5 sm:p-4 flex justify-between border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 mt-auto">
                      <Button variant="ghost" onClick={() => setStep(2)} className="h-8 sm:h-9 px-3 rounded-lg text-xs font-semibold gap-1.5">
                        <ArrowLeft className="h-3.5 w-3.5" /> Back
                      </Button>
                      <Button onClick={() => setStep(4)} className="h-8 sm:h-9 px-4 rounded-lg text-xs font-semibold shadow-sm gap-1.5">
                        Upload Receipt <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </CardFooter>
                  </div>
                )}

                {/* Step 4: Upload Receipt */}
                {step === 4 && (
                  <div className="animate-in slide-in-from-right-4 duration-300 flex flex-col h-full min-h-[350px]">
                    <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                      <CardTitle className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white">Step 4: Verify Payment</CardTitle>
                      <CardDescription className="text-xs font-medium text-slate-500">Upload your successful transaction screenshot and reference number.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-5 space-y-4 flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Payment Screenshot</label>
                        <ImageUpload
                          value={receiptUrl}
                          onChange={(url) => setReceiptUrl(url)}
                          folder="receipts"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Transaction Reference ID (UTR / UPI Ref)</label>
                        <Input
                          required
                          value={referenceId}
                          onChange={e => setReferenceId(e.target.value)}
                          placeholder="e.g. 312345678901"
                          className="rounded-lg font-mono bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 h-9 text-xs pl-3"
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="p-3.5 sm:p-4 flex justify-between border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 mt-auto">
                      <Button variant="ghost" onClick={() => setStep(3)} className="h-8 sm:h-9 px-3 rounded-lg text-xs font-semibold gap-1.5">
                        <ArrowLeft className="h-3.5 w-3.5" /> Back
                      </Button>
                      <Button onClick={handleSubmitRecharge} disabled={isSubmitting || !receiptUrl || !referenceId} className="h-8 sm:h-9 px-4 rounded-lg text-xs font-semibold shadow-sm gap-1.5">
                        {isSubmitting ? "Submitting..." : "Submit Request"} <CheckCircle2 className="h-3.5 w-3.5" />
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
            <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden bg-white dark:bg-slate-900">
              <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white">
                  {paymentConfig?.guideTitle || "Wallet Recharge Guide"}
                </CardTitle>
                <CardDescription className="text-xs font-medium text-slate-500">
                  Follow this guide to easily recharge your wallet.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 space-y-4">

                {paymentConfig?.guideYoutubeLink && (
                  <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 max-w-2xl mx-auto">
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
                        } catch (e) {
                          return null;
                        }
                      })()}
                    </div>
                  </div>
                )}

                {paymentConfig?.guideDescription ? (
                  <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                    <p className="whitespace-pre-wrap">
                      {paymentConfig.guideDescription}
                    </p>
                  </div>
                ) : (
                  <div className="text-center p-8 text-slate-400 font-medium border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-xs">
                    No specific guide provided yet. Please navigate to the "Recharge Wallet" tab to proceed.
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <Button onClick={() => setActiveTab("recharge")} className="h-8 sm:h-9 px-4 rounded-lg text-xs font-semibold gap-1.5 shadow-sm">
                    Go to Recharge <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>

              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "analytics" && (
          <FranchiseWalletAnalyticsTab transactions={transactions} />
        )}
      </div>

      <Dialog open={receiptModalOpen} onOpenChange={setReceiptModalOpen}>
        <DialogContent className="max-w-2xl w-[90vw] max-h-[85vh] overflow-hidden bg-white rounded-2xl flex flex-col my-auto shadow-2xl p-0">
          {/* Header / Actions */}
          <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-slate-100 shrink-0 bg-slate-50">
            <h2 className="text-sm sm:text-base font-bold text-slate-800">Payment Receipt</h2>
            <Button onClick={handleDownloadReceipt} size="sm" className="h-8 px-3 rounded-lg text-xs font-semibold shadow-sm gap-1.5" id="download-btn">
              <Download className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Download PDF</span>
            </Button>
          </div>

          {/* Scrollable Receipt Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-200 flex flex-col items-center">
            {selectedReceiptTx && (
              <div className="w-full max-w-[794px] bg-white shadow-xl border border-slate-200">
                <div
                  id="receipt-content"
                  className="w-full p-6 md:p-10 relative shrink-0 font-sans mx-auto"
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#0f172a',
                    lineHeight: '1.5'
                  }}
                >
                  {/* Receipt Watermark */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                    <ShieldCheck className="w-1/2 h-1/2" style={{ color: '#0f172a' }} />
                  </div>

                  {/* Header Section (Company Info) */}
                  <div className="flex flex-col items-start mb-12">
                    {globalSettings?.logoUrl ? (
                      <img src={globalSettings.logoUrl} alt="Logo" className="h-20 md:h-24 w-auto object-contain mb-4" />
                    ) : (
                      <div className="h-20 w-20 md:h-24 md:w-24 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#0f2940' }}>
                        <ShieldCheck className="h-10 w-10 md:h-12 md:w-12 text-white" />
                      </div>
                    )}
                    <h1 className="text-xl md:text-2xl font-black tracking-tight mb-2 whitespace-normal break-words" style={{ color: '#0f2940', maxWidth: '100%' }}>
                      {globalSettings?.siteName || "RGYCSP Hub"}
                    </h1>
                    <div className="text-sm font-medium" style={{ color: '#475569' }}>
                      <p>Registered Franchise Office</p>
                      <p>{globalSettings?.contactPhone || "+91 00000 00000"} | {globalSettings?.contactEmail || "info@example.com"}</p>
                    </div>
                  </div>

                  {/* Recipient & Meta Block */}
                  <div className="flex flex-col mb-12 gap-6">
                    {/* Top Left: Recipient */}
                    <div className="w-full">
                      <h3 className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#0f2940' }}>Recipient:</h3>
                      <p className="text-2xl font-bold mb-1 break-words whitespace-normal" style={{ color: '#0f2940' }}>{workspace?.name || "Franchise Partner"}</p>
                      {workspace?.centerCode && (
                        <p className="text-sm font-semibold mb-1" style={{ color: '#475569' }}>Center Code: {workspace.centerCode}</p>
                      )}
                      <p className="text-sm font-medium" style={{ color: '#475569' }}>{workspace?.address || "Registered Address"}</p>
                      <p className="text-sm font-medium" style={{ color: '#475569' }}>{workspace?.phone || ""}</p>
                    </div>

                    {/* Bottom Right: Receipt Meta (Outline Style) */}
                    <div className="w-full md:w-80 flex flex-col self-end border-2 rounded-xl overflow-hidden" style={{ borderColor: '#e2e8f0' }}>
                      <div className="p-4 border-b-2" style={{ borderColor: '#e2e8f0', backgroundColor: '#ffffff' }}>
                        <h2 className="text-xl font-bold" style={{ color: '#0f2940' }}>Receipt for #{selectedReceiptTx.id.slice(-8).toUpperCase()}</h2>
                      </div>
                      <div className="p-4" style={{ backgroundColor: '#f8fafc' }}>
                        <p className="text-sm font-medium" style={{ color: '#475569' }}>
                          Transaction Date: {new Date(selectedReceiptTx.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Details Table */}
                  <div className="mb-16">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr>
                          <th className="py-3 px-4 text-xs font-black uppercase tracking-wider" style={{ backgroundColor: '#4f46e5', color: '#ffffff' }}>Description</th>
                          <th className="py-3 px-4 text-xs font-black uppercase tracking-wider" style={{ backgroundColor: '#4f46e5', color: '#ffffff' }}>Ref Id</th>
                          <th className="py-3 px-4 text-xs font-black uppercase tracking-wider text-right" style={{ backgroundColor: '#4f46e5', color: '#ffffff' }}>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b" style={{ borderColor: '#e2e8f0' }}>
                          <td className="py-5 px-4">
                            <p className="font-bold text-base" style={{ color: '#0f2940' }}>{selectedReceiptTx.description || "Wallet Recharge"}</p>
                            <p className="text-sm mt-1" style={{ color: '#64748b' }}>Status: APPROVED</p>
                          </td>
                          <td className="py-5 px-4 align-top">
                            <p className="font-medium text-sm" style={{ color: '#475569' }}>{selectedReceiptTx.referenceId || "N/A"}</p>
                          </td>
                          <td className="py-5 px-4 text-right align-top">
                            <p className="font-medium text-base" style={{ color: '#0f2940' }}>₹{selectedReceiptTx.amount.toFixed(2)}</p>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Footer (Totals & Thanks) */}
                  <div className="flex flex-col-reverse md:flex-row justify-between items-start gap-8">
                    {/* Left: Thanks */}
                    <div className="pt-2">
                      <p className="text-sm font-medium" style={{ color: '#475569' }}>Grateful for your partnership in learning.</p>
                      <p className="text-xs font-medium mt-1" style={{ color: '#94a3b8' }}>Payment Method: Digital / Bank Transfer</p>
                    </div>

                    {/* Right: Totals */}
                    <div className="w-full md:w-80">
                      <h3 className="text-xl md:text-2xl font-bold mb-4" style={{ color: '#475569' }}>Receipt for Payment</h3>

                      <div className="flex justify-between items-center py-3 border-b" style={{ borderColor: '#f1f5f9' }}>
                        <span className="text-sm font-medium" style={{ color: '#475569' }}>Subtotal</span>
                        <span className="text-sm font-medium" style={{ color: '#475569' }}>₹{selectedReceiptTx.amount.toFixed(2)}</span>
                      </div>

                      <div className="flex justify-between items-center py-4">
                        <span className="text-base font-bold" style={{ color: '#0f2940' }}>Total</span>
                        <span className="text-lg font-bold" style={{ color: '#0f2940' }}>₹{selectedReceiptTx.amount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
