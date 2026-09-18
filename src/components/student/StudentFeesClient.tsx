"use client";

import React, { useState, useMemo } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Wallet,
  Receipt,
  CreditCard,
  Download,
  ArrowUpRight,
  History,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ChevronRight,
  ShieldCheck,
  FileText,
  Search,
  Filter,
  Copy,
  Check,
  Printer,
  X,
  ExternalLink,
  QrCode,
  Building,
  Phone,
  MessageSquare
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import { getTenantLink } from "@/lib/routing";
import { updateInvoiceProof } from "@/app/actions/payments";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface StudentFeesClientProps {
  invoices: any[];
  stats: any;
  settings?: any;
  tenant: string;
  workspace?: any;
  studentProfile?: any;
  paymentConfig?: any;
}

export default function StudentFeesClient({
  invoices = [],
  stats,
  settings,
  tenant,
  workspace,
  studentProfile,
  paymentConfig
}: StudentFeesClientProps) {
  const pathname = usePathname();
  const primaryColor = settings?.primaryColor || "#0284c7";

  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 250);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);

  // Modals state
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [proofModalInvoice, setProofModalInvoice] = useState<any>(null);
  const [proofUrl, setProofUrl] = useState("");
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    const q = debouncedSearchQuery.trim().toLowerCase();
    const qUpper = debouncedSearchQuery.trim().toUpperCase();

    return invoices.filter((inv) => {
      const matchesStatus = filterStatus === "ALL" || inv.status === filterStatus;
      if (!matchesStatus) return false;
      if (!q) return true;

      const refId = inv.id?.slice(-8).toUpperCase() || "";
      const feeType = inv.feeType?.toLowerCase() || "";
      const notes = inv.notes?.toLowerCase() || "";

      return (
        refId.includes(qUpper) ||
        feeType.includes(q) ||
        notes.includes(q)
      );
    });
  }, [invoices, filterStatus, debouncedSearchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / pageSize));
  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredInvoices.slice(start, start + pageSize);
  }, [filteredInvoices, currentPage, pageSize]);

  // Copy helper
  const handleCopy = (text: string, type: "upi" | "bank") => {
    navigator.clipboard.writeText(text);
    if (type === "upi") {
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    } else {
      setCopiedBank(true);
      setTimeout(() => setCopiedBank(false), 2000);
    }
    toast.success("Copied to clipboard");
  };

  // Submit payment proof
  const handleUploadProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofModalInvoice || !proofUrl.trim()) return;

    setIsSubmittingProof(true);
    try {
      const res = await updateInvoiceProof(proofModalInvoice.id, proofUrl.trim());
      if (res.success) {
        toast.success("Payment reference submitted for verification!");
        setProofModalInvoice(null);
        setProofUrl("");
      } else {
        toast.error(res.error || "Failed to submit reference");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setIsSubmittingProof(false);
    }
  };

  const centerName = workspace?.name || settings?.siteName || "Academic Training Center";
  const centerCode = workspace?.centerCode || settings?.centerCode || tenant?.toUpperCase();

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 w-full mx-auto">
      {/* 1. Page Header (Rule 7.1) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Fees & Financial Ledger
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
            Manage your course tuition installments, view transactions, and download receipts.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={() => setPayModalOpen(true)}
            className="h-8 sm:h-9 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold gap-1.5 bg-primary hover:bg-primary/90 text-white shadow-xs"
          >
            <CreditCard className="w-3.5 h-3.5" />
            Make Payment
          </Button>
          <Link href={getTenantLink("/student/courses", tenant, pathname)}>
            <Button variant="outline" className="h-8 sm:h-9 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold gap-1.5 border-slate-200 dark:border-slate-700">
              <BookOpen className="w-3.5 h-3.5" />
              Course Details
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Metric / Stat Cards Grid (Rule 7.2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Pending Balance */}
        <Card className="border border-slate-100 dark:border-white/5 shadow-xs rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">Pending Balance</p>
                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  ₹{stats.pendingAmount.toLocaleString("en-IN")}
                </p>
                <p className={cn("text-[10px] font-semibold mt-0.5", stats.pendingAmount > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400")}>
                  {stats.pendingAmount > 0 ? "Immediate clearance due" : "All payments cleared"}
                </p>
              </div>
              <div className={cn("p-2.5 rounded-lg shrink-0", stats.pendingAmount > 0 ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400")}>
                <Wallet className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metric 2: Total Paid */}
        <Card className="border border-slate-100 dark:border-white/5 shadow-xs rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">Total Paid to Date</p>
                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  ₹{stats.totalPaid.toLocaleString("en-IN")}
                </p>
                <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {stats.paidCount} Successful transaction{stats.paidCount === 1 ? "" : "s"}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metric 3: Total Invoices */}
        <Card className="border border-slate-100 dark:border-white/5 shadow-xs rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">Total Invoices</p>
                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {stats.totalInvoices} <span className="text-sm font-semibold text-slate-500">Records</span>
                </p>
                <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                  {stats.pendingCount} Pending clearance
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                <Receipt className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metric 4: Fee Plan */}
        <Card className="border border-slate-100 dark:border-white/5 shadow-xs rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">Payment Plan</p>
                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white truncate">
                  {studentProfile?.paymentType === "EMI" ? "Installment Plan" : "One-Time Payment"}
                </p>
                <p className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 mt-0.5 truncate">
                  {stats.lastDate ? `Last payment: ${stats.lastDate}` : "Course fee schedule"}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
                <CreditCard className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Main 2-Column Content Split (8 cols / 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
        {/* Left Column (8 cols): Invoices Ledger */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden bg-white dark:bg-slate-900">
            <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                  Invoices & Transactions History
                </CardTitle>
                <CardDescription className="text-[11px] sm:text-xs text-slate-500">
                  Showing {filteredInvoices.length} billing item{filteredInvoices.length === 1 ? "" : "s"}
                </CardDescription>
              </div>

              {/* Filter Toolbar (Rule 7.4) */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-full sm:w-44">
                  <Search className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none h-3.5 w-3.5 text-slate-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    placeholder="Search reference..."
                    className="h-8 pl-8 pr-3 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 rounded-lg text-xs placeholder:text-slate-400"
                  />
                </div>

                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 h-8">
                  {["ALL", "PAID", "PENDING", "OVERDUE"].map((st) => (
                    <button
                      key={st}
                      onClick={() => { setFilterStatus(st); setCurrentPage(1); }}
                      className={cn(
                        "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase transition-all",
                        filterStatus === st
                          ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                          : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
                      )}
                    >
                      {st === "ALL" ? "All" : st === "PAID" ? "Paid" : st === "PENDING" ? "Pending" : "Overdue"}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {paginatedInvoices.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {paginatedInvoices.map((invoice: any, idx: number) => {
                    const isPaid = invoice.status === "PAID";
                    const isOverdue = invoice.status === "OVERDUE";
                    const isPending = invoice.status === "PENDING";
                    const refCode = invoice.id ? `#INV-${invoice.id.slice(-6).toUpperCase()}` : `#${idx + 1}`;

                    const statusBorder = isPaid
                      ? "border-emerald-500"
                      : isOverdue
                        ? "border-rose-500"
                        : "border-amber-500";

                    return (
                      <div
                        key={invoice.id || idx}
                        className={cn(
                          "flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors gap-3 group border-l-[3px]",
                          statusBorder
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={cn(
                              "w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border",
                              isPaid
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800/40"
                                : isOverdue
                                  ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800/40"
                                  : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800/40"
                            )}
                          >
                            <Receipt className="w-4 h-4" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">
                                {refCode}
                              </h4>
                              <Badge variant="outline" className="text-[9px] font-bold px-1.5 py-0.2 rounded uppercase border-slate-200 dark:border-slate-700 text-slate-500">
                                {invoice.feeType || (invoice.notes ? invoice.notes.split("-")[0] : "TUITION")}
                              </Badge>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                              {invoice.notes || "Official course fee transaction"} • Due: {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Immediate"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end shrink-0">
                          <div className="text-right">
                            <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                              ₹{Number(invoice.amount || 0).toLocaleString("en-IN")}
                            </p>
                            <span
                              className={cn(
                                "text-[9px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider",
                                isPaid
                                  ? "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40"
                                  : isOverdue
                                    ? "text-rose-700 bg-rose-50 dark:bg-rose-950/40"
                                    : "text-amber-700 bg-amber-50 dark:bg-amber-950/40"
                              )}
                            >
                              {isPaid ? "Paid" : isOverdue ? "Overdue" : "Pending"}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {isPaid ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedReceipt(invoice)}
                                className="h-7 sm:h-8 px-2.5 rounded-lg text-xs font-semibold gap-1 border-slate-200 dark:border-slate-700"
                              >
                                <Printer className="w-3 h-3" />
                                Receipt
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => setProofModalInvoice(invoice)}
                                className="h-7 sm:h-8 px-2.5 rounded-lg text-xs font-semibold gap-1 bg-primary text-white"
                              >
                                Clear Dues
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No Invoices Found</p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    No billing transactions match the selected filter.
                  </p>
                </div>
              )}
            </CardContent>

            {/* Standard Pagination (Rule 7.6) */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20">
                <span className="text-xs font-medium text-slate-500">
                  Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredInvoices.length)} of {filteredInvoices.length}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="h-7 px-2 rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xs text-xs font-semibold"
                  >
                    Prev
                  </Button>
                  <span className="px-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="h-7 px-2 rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xs text-xs font-semibold"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column (4 cols): Payment Channels & Accounts Help */}
        <div className="lg:col-span-4 space-y-4">
          {/* Center Payment Details Card */}
          <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden bg-white dark:bg-slate-900">
            <CardHeader className="p-3.5 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-primary" />
                Center Payment Information
              </CardTitle>
              <CardDescription className="text-[11px] text-slate-500">
                Official franchise collection accounts
              </CardDescription>
            </CardHeader>

            <CardContent className="p-3.5 space-y-3">
              {/* UPI ID */}
              {paymentConfig?.upiId ? (
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Official UPI ID</span>
                    <button
                      onClick={() => handleCopy(paymentConfig.upiId, "upi")}
                      className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline"
                    >
                      {copiedUpi ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedUpi ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <p className="font-bold text-xs text-slate-900 dark:text-white font-mono truncate">{paymentConfig.upiId}</p>
                </div>
              ) : null}

              {/* Bank Account */}
              {paymentConfig?.accountNumber ? (
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Direct Bank Transfer</span>
                    <button
                      onClick={() => handleCopy(paymentConfig.accountNumber, "bank")}
                      className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline"
                    >
                      {copiedBank ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedBank ? "Copied" : "Copy A/C"}
                    </button>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[11px] font-medium text-slate-500">Bank: <strong className="text-slate-800 dark:text-slate-200">{paymentConfig.bankName || "Nationalized Bank"}</strong></p>
                    <p className="text-[11px] font-medium text-slate-500">A/C Holder: <strong className="text-slate-800 dark:text-slate-200">{paymentConfig.accountHolderName || centerName}</strong></p>
                    <p className="text-[11px] font-medium text-slate-500">A/C No: <strong className="text-slate-800 dark:text-slate-200 font-mono">{paymentConfig.accountNumber}</strong></p>
                    <p className="text-[11px] font-medium text-slate-500">IFSC: <strong className="text-slate-800 dark:text-slate-200 font-mono">{paymentConfig.ifscCode || "N/A"}</strong></p>
                  </div>
                </div>
              ) : null}

              {/* Instructions or Guidelines */}
              <div className="text-[11px] text-slate-500 space-y-1 leading-relaxed">
                <p>• After transfer, upload your transaction reference or receipt screenshot to reconcile your balance.</p>
                <p>• Official receipts with QR verification become available immediately upon center confirmation.</p>
              </div>

              <div className="pt-1">
                <Button
                  onClick={() => setPayModalOpen(true)}
                  variant="outline"
                  className="w-full h-8 rounded-lg text-xs font-semibold gap-1.5 border-slate-200 dark:border-slate-700"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  View Payment Methods Modal
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Accounts Support Desk */}
          <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden bg-white dark:bg-slate-900">
            <CardHeader className="p-3.5 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                Accounts & Billing Desk
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3.5 space-y-2 text-xs">
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Have questions regarding fees breakdown, installment dates, or cash receipts? Reach out to center accounts.
              </p>
              {settings?.phone && (
                <a
                  href={`https://wa.me/${settings.phone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full pt-1"
                >
                  <Button
                    variant="outline"
                    className="w-full h-8 rounded-lg text-xs font-semibold gap-1.5 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100/60 border-emerald-200 dark:border-emerald-800"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Contact Accounts on WhatsApp
                  </Button>
                </a>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 4. MODAL 1: Payment Methods & Transfer Details */}
      <Dialog open={payModalOpen} onOpenChange={setPayModalOpen}>
        <DialogContent className="max-w-md rounded-2xl p-4 sm:p-6 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
          <DialogHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <DialogTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" />
              Transfer & Settle Dues
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Official payment options for {centerName} ({centerCode})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-3">
            {paymentConfig?.qrCodeUrl && (
              <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className="relative w-40 h-40 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-white">
                  <Image src={paymentConfig.qrCodeUrl} alt="Center QR Code" fill className="object-contain p-2" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2">Scan to Pay using any UPI app</span>
              </div>
            )}

            {paymentConfig?.upiId && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">UPI ID</span>
                  <span className="font-bold text-xs text-slate-900 dark:text-white font-mono">{paymentConfig.upiId}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(paymentConfig.upiId, "upi")}
                  className="h-7 px-2.5 text-xs font-semibold gap-1"
                >
                  {copiedUpi ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedUpi ? "Copied" : "Copy"}
                </Button>
              </div>
            )}

            {paymentConfig?.accountNumber && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1 text-xs">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">NEFT / IMPS Bank Transfer</span>
                <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400">Bank: <strong className="text-slate-900 dark:text-white">{paymentConfig.bankName}</strong></p>
                <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400">A/C Name: <strong className="text-slate-900 dark:text-white">{paymentConfig.accountHolderName || centerName}</strong></p>
                <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400">A/C Number: <strong className="text-slate-900 dark:text-white font-mono">{paymentConfig.accountNumber}</strong></p>
                <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400">IFSC Code: <strong className="text-slate-900 dark:text-white font-mono">{paymentConfig.ifscCode}</strong></p>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPayModalOpen(false)}
                className="h-8 px-4 rounded-lg text-xs font-semibold"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 5. MODAL 2: Submit Payment Proof / UTR */}
      <Dialog open={!!proofModalInvoice} onOpenChange={(open) => !open && setProofModalInvoice(null)}>
        <DialogContent className="max-w-md rounded-2xl p-4 sm:p-6 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
          <DialogHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
              Submit Payment Reference
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Clear invoice #{proofModalInvoice?.id?.slice(-6).toUpperCase()} (₹{Number(proofModalInvoice?.amount || 0).toLocaleString("en-IN")})
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUploadProof} className="space-y-4 pt-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Transaction UTR / Reference ID or Screenshot URL
              </label>
              <Input
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
                placeholder="e.g. UPI Ref 329048291048 or image link"
                required
                className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
              />
              <p className="text-[10px] text-slate-400 leading-snug">
                Your franchise accounts manager will verify the transaction ID and mark your invoice as paid.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setProofModalInvoice(null)}
                className="h-8 px-3 rounded-lg text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmittingProof}
                className="h-8 px-4 rounded-lg text-xs font-semibold bg-primary text-white"
              >
                {isSubmittingProof ? "Submitting..." : "Submit for Verification"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* 6. MODAL 3: Printable Official Fee Receipt */}
      <Dialog open={!!selectedReceipt} onOpenChange={(open) => !open && setSelectedReceipt(null)}>
        <DialogContent className="max-w-xl rounded-2xl p-4 sm:p-6 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
          <DialogHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
                Official Tuition Fee Receipt
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                System verified payment receipt voucher
              </DialogDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.print()}
              className="h-7 px-2.5 rounded-lg text-xs font-semibold gap-1"
            >
              <Printer className="w-3 h-3" /> Print
            </Button>
          </DialogHeader>

          {selectedReceipt && (
            <div className="space-y-4 pt-3 text-xs">
              {/* Receipt Header */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">{centerName}</h3>
                  <p className="text-[10px] text-slate-500">Center Code: {centerCode} • Session 2026</p>
                </div>
                <Badge className="bg-emerald-600 text-white font-bold px-2 py-0.5 text-[9px] uppercase tracking-wider">
                  Payment Paid
                </Badge>
              </div>

              {/* Receipt Details Grid */}
              <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <div>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Receipt / Inv No</span>
                  <span className="font-bold text-xs text-slate-900 dark:text-white font-mono mt-0.5 block">
                    #{selectedReceipt.id?.slice(-8).toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Payment Date</span>
                  <span className="font-semibold text-xs text-slate-900 dark:text-white mt-0.5 block">
                    {selectedReceipt.paidDate ? new Date(selectedReceipt.paidDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : new Date(selectedReceipt.createdAt).toLocaleDateString("en-IN")}
                  </span>
                </div>
                <div>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Student Name</span>
                  <span className="font-semibold text-xs text-slate-900 dark:text-white mt-0.5 block">
                    {studentProfile?.fullName || "Student Learner"}
                  </span>
                </div>
                <div>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Enrollment No</span>
                  <span className="font-semibold text-xs text-slate-900 dark:text-white mt-0.5 block">
                    {studentProfile?.enrollmentNo || "Registered"}
                  </span>
                </div>
                <div>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Description / Note</span>
                  <span className="font-semibold text-xs text-slate-900 dark:text-white mt-0.5 block">
                    {selectedReceipt.notes || selectedReceipt.feeType || "Course Tuition Installment"}
                  </span>
                </div>
                <div>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Amount Paid</span>
                  <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                    ₹{Number(selectedReceipt.amount || 0).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/30 text-[10px] text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                <span>This electronic receipt voucher is valid without physical seal for center verification.</span>
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedReceipt(null)}
              className="h-8 px-4 rounded-lg text-xs font-semibold"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BookOpen({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}
