"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  History, 
  Download, 
  Calendar as CalendarIcon, 
  IndianRupee, 
  Loader2, 
  Search, 
  Filter, 
  User, 
  CreditCard, 
  Receipt, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getPaymentsReport, getStudentInvoices } from "@/app/actions/payments";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 12;

export default function PaymentReportsTab({ 
  workspaceId, 
  workspaceInfo 
}: { 
  workspaceId: string; 
  workspaceInfo?: any; 
}) {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<"ALL" | "TODAY" | "WEEK" | "MONTH">("ALL");
  const [methodFilter, setMethodFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchReports();
  }, [filterMode]);

  const fetchReports = async () => {
    setIsLoading(true);
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    const now = new Date();
    if (filterMode === "TODAY") {
      startDate = new Date(now.setHours(0, 0, 0, 0));
      endDate = new Date(now.setHours(23, 59, 59, 999));
    } else if (filterMode === "WEEK") {
      startDate = new Date(now.setDate(now.getDate() - 7));
      endDate = new Date();
    } else if (filterMode === "MONTH") {
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      endDate = new Date();
    }

    const res = await getPaymentsReport(workspaceId, startDate, endDate);
    setIsLoading(false);
    
    if (res.success) {
      setInvoices(res.data || []);
      setCurrentPage(1);
    } else {
      toast.error(res.error || "Failed to load reports");
    }
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      // Search filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchStudent = inv.student?.fullName?.toLowerCase().includes(q) ||
          inv.student?.enrollmentNo?.toLowerCase().includes(q) ||
          inv.notes?.toLowerCase().includes(q) ||
          inv.feeType?.toLowerCase().includes(q);
        if (!matchStudent) return false;
      }

      // Method filter
      if (methodFilter !== "ALL") {
        if (inv.paymentMethod?.toUpperCase() !== methodFilter.toUpperCase()) {
          return false;
        }
      }

      return true;
    });
  }, [invoices, searchTerm, methodFilter]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE));
  const currentInvoices = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredInvoices.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredInvoices, currentPage]);

  const handleExport = () => {
    if (filteredInvoices.length === 0) {
      toast.error("No data to export");
      return;
    }

    const exportData = filteredInvoices.map(inv => ({
      "Payment Date": new Date(inv.paidDate).toLocaleDateString('en-GB'),
      "Student Name": inv.student?.fullName || "N/A",
      "Enrollment No": inv.student?.enrollmentNo || "N/A",
      "Amount": inv.amount,
      "Fee Type": inv.feeType,
      "Payment Method": inv.paymentMethod || "N/A",
      "Notes": inv.notes || ""
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");
    
    XLSX.writeFile(workbook, `Payment_Report_${filterMode}_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success("Excel report exported successfully");
  };

  const downloadReceipt = async (invoice: any) => {
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF(); // Default A4: 210 x 297 mm
      
      // Parse theme color
      const hexColor = workspaceInfo?.primaryColor || "#0ea5e9";
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : { r: 14, g: 165, b: 233 };
      };
      const rgb = hexToRgb(hexColor);

      // Header Left Banner
      doc.setFillColor(rgb.r, rgb.g, rgb.b);
      doc.rect(10, 10, 130, 22, 'F');

      // Logo Representation
      doc.setFillColor(255, 255, 255);
      doc.circle(20, 21, 6, 'F');
      doc.setFillColor(200, 200, 200);
      doc.triangle(18, 17, 18, 25, 24, 21, 'F');

      // Franchise Name
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text(workspaceInfo?.name || "FRANCHISE NAME", 30, 23);

      // Header Right
      doc.setTextColor(rgb.r, rgb.g, rgb.b);
      doc.setFontSize(18);
      doc.text("TAX INVOICE", 200, 20, { align: "right" });
      
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`Center Code: ${workspaceInfo?.centerCode || "N/A"}`, 200, 26, { align: "right" });

      // Top Left - Address
      doc.setTextColor(rgb.r, rgb.g, rgb.b);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(workspaceInfo?.name || "FRANCHISE NAME", 10, 45);
      
      doc.setTextColor(80, 80, 80);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const addressLines = doc.splitTextToSize(workspaceInfo?.address || "Address not provided", 80);
      doc.text(addressLines, 10, 50);

      // Top Right - Invoice Details
      doc.setTextColor(rgb.r, rgb.g, rgb.b);
      doc.setFont("helvetica", "bold");
      doc.text("Invoice Number", 130, 45);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      const invoiceNum = invoice.id ? invoice.id.substring(0, 8).toUpperCase() : "1000";
      doc.text(invoiceNum, 200, 45, { align: "right" });

      doc.setTextColor(80, 80, 80);
      doc.text("Date", 130, 55);
      doc.setTextColor(0, 0, 0);
      const paidDate = new Date(invoice.paidDate).toLocaleDateString('en-GB');
      doc.text(paidDate, 200, 55, { align: "right" });

      doc.setTextColor(rgb.r, rgb.g, rgb.b);
      doc.setFont("helvetica", "bold");
      doc.text("Total Paid", 130, 68);
      doc.setTextColor(0, 0, 0);
      doc.text(`Rs. ${invoice.amount.toFixed(2)}`, 200, 68, { align: "right" });
      
      doc.setDrawColor(200, 200, 200);
      doc.line(130, 71, 200, 71);

      // Recipient
      doc.setTextColor(80, 80, 80);
      doc.setFont("helvetica", "normal");
      doc.text("Recipient", 10, 75);
      const student = invoice.student || {};
      doc.setTextColor(0, 0, 0);
      doc.text(student.fullName || "N/A", 10, 80);
      doc.text(`Enrollment No: ${student.enrollmentNo || "N/A"}`, 10, 85);
      doc.text(`Course: ${student.course?.title || "N/A"}`, 10, 90);
      doc.text(`Payment Mode: ${invoice.paymentMethod || "Offline"}`, 10, 95);

      // Services Title
      doc.setFontSize(11);
      doc.setTextColor(rgb.r, rgb.g, rgb.b);
      doc.setFont("helvetica", "bold");
      doc.text(`For educational services related to : ${student.course?.title || "Course"}`, 10, 105);
      doc.line(10, 108, 200, 108);

      // Table
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.text("Fees as per our agreement", 10, 118);
      
      doc.setFont("helvetica", "normal");
      doc.text(`• ${invoice.feeType || "Fee Payment"}`, 15, 125);
      if (invoice.notes) {
        const notesLines = doc.splitTextToSize(`• ${invoice.notes}`, 140);
        doc.text(notesLines, 15, 130);
      }
      
      doc.text(`Rs. ${invoice.amount.toFixed(2)}`, 200, 125, { align: "right" });

      doc.line(170, 140, 200, 140);
      doc.text(invoice.amount.toFixed(2), 200, 145, { align: "right" });

      // Footer Totals
      doc.setTextColor(rgb.r, rgb.g, rgb.b);
      doc.setFont("helvetica", "bold");
      doc.text("Invoice Total", 160, 220, { align: "right" });
      doc.setTextColor(0, 0, 0);
      doc.text(`Rs. ${invoice.amount.toFixed(2)}`, 200, 220, { align: "right" });

      // Highlighted Total Box
      doc.setFillColor(235, 235, 235);
      doc.rect(130, 230, 70, 10, 'F');
      doc.setTextColor(rgb.r, rgb.g, rgb.b);
      doc.text("Total Amount Paid", 160, 237, { align: "right" });
      doc.setTextColor(16, 185, 129); // Emerald green for paid amount
      doc.text(`Rs. ${invoice.amount.toFixed(2)}`, 200, 237, { align: "right" });

      // Bottom Note
      doc.setTextColor(120, 120, 120);
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.text("Computer generated invoice, no signature required.", 200, 245, { align: "right" });

      doc.save(`Receipt_${student.enrollmentNo || "Unknown"}_${invoice.feeType || "Fee"}.pdf`);
      toast.success("Receipt downloaded successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF receipt");
    }
  };

  const totalIncome = filteredInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const avgIncome = filteredInvoices.length > 0 ? Math.round(totalIncome / filteredInvoices.length) : 0;
  const upiCount = filteredInvoices.filter(i => i.paymentMethod === "UPI").length;
  const cashCount = filteredInvoices.filter(i => i.paymentMethod === "CASH").length;

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
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300">
      {/* Stat Cards Grid (Rule 7.2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900 p-3.5">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-bold text-[10px] uppercase tracking-[0.12em] text-slate-400">
              Total Collected ({filterMode === "ALL" ? "All Time" : filterMode === "TODAY" ? "Today" : filterMode === "WEEK" ? "7 Days" : "30 Days"})
            </span>
            <div className="p-1 rounded-lg text-emerald-600 bg-emerald-500/10">
              <IndianRupee className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center">
            <IndianRupee className="w-5 h-5 mr-0.5 text-slate-400" /> {totalIncome.toLocaleString()}
          </div>
        </div>

        <div className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900 p-3.5">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-bold text-[10px] uppercase tracking-[0.12em] text-slate-400">Transactions</span>
            <div className="p-1 rounded-lg text-primary bg-primary/10">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {filteredInvoices.length}
          </div>
        </div>

        <div className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900 p-3.5">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-bold text-[10px] uppercase tracking-[0.12em] text-slate-400">Avg / Receipt</span>
            <div className="p-1 rounded-lg text-amber-600 bg-amber-500/10">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center">
            <IndianRupee className="w-5 h-5 mr-0.5 text-slate-400" /> {avgIncome.toLocaleString()}
          </div>
        </div>

        <div className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900 p-3.5">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-bold text-[10px] uppercase tracking-[0.12em] text-slate-400">Payment Modes</span>
            <div className="p-1 rounded-lg text-slate-600 bg-slate-100 dark:bg-slate-800">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 mt-1">
            <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 rounded text-[10px] font-bold">UPI: {upiCount}</span>
            <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-600 rounded text-[10px] font-bold">Cash: {cashCount}</span>
          </div>
        </div>
      </div>

      {/* Main Content Card & Filter Toolbar (Rule 7.4) */}
      <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden bg-white dark:bg-slate-900">
        <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <History className="w-4 h-4 text-primary" /> Payment Transactions
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Audit log of all received student fee collections and offline settlements.
              </p>
            </div>

            {/* Filter Toolbar Controls */}
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              {/* Search */}
              <div className="relative w-full sm:w-56 group">
                <Search className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none h-3.5 w-3.5 text-slate-400 my-auto" />
                <Input 
                  value={searchTerm}
                  onChange={e => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search student or note..."
                  className="h-8 sm:h-9 pl-8 pr-3 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 rounded-lg font-normal text-xs placeholder:text-slate-400"
                />
              </div>

              {/* Date Filter */}
              <select 
                value={filterMode} 
                onChange={e => setFilterMode(e.target.value as any)}
                className="h-8 sm:h-9 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 font-medium text-xs text-slate-700 dark:text-slate-300 outline-none"
              >
                <option value="ALL">All Time</option>
                <option value="TODAY">Today</option>
                <option value="WEEK">Last 7 Days</option>
                <option value="MONTH">Last 30 Days</option>
              </select>

              {/* Mode Filter */}
              <select 
                value={methodFilter} 
                onChange={e => {
                  setMethodFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-8 sm:h-9 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 font-medium text-xs text-slate-700 dark:text-slate-300 outline-none"
              >
                <option value="ALL">All Modes</option>
                <option value="UPI">UPI</option>
                <option value="CASH">Cash</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
              </select>

              {/* Export Button */}
              <Button 
                onClick={handleExport} 
                variant="outline" 
                size="sm"
                className="h-8 sm:h-9 px-3 rounded-lg text-xs font-semibold gap-1.5 ml-auto sm:ml-0"
              >
                <Download className="w-3.5 h-3.5" /> Export Excel
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <p className="text-xs text-slate-400">Loading payment records...</p>
            </div>
          ) : currentInvoices.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <p className="text-xs text-slate-500 font-medium">No payments found for the selected filters.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {currentInvoices.map((inv) => (
                <div 
                  key={inv.id} 
                  className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-3 sm:p-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all gap-3 sm:gap-4 group border-l-[3px] border-emerald-500"
                >
                  {/* Student Avatar + Details */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">
                      {inv.student?.fullName ? inv.student.fullName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                          {inv.student?.fullName || "N/A"}
                        </span>
                        <Badge variant="outline" className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border-none bg-emerald-500/10 text-emerald-600">
                          {inv.paymentMethod || "OFFLINE"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                        <span>{inv.student?.enrollmentNo || "N/A"}</span>
                        <span>•</span>
                        <span className="font-sans text-slate-600 dark:text-slate-400 font-medium">
                          {inv.notes || inv.feeType || "Fee Payment"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Metadata and Actions */}
                  <div className="flex flex-wrap lg:flex-nowrap items-center gap-3 sm:gap-4 w-full lg:w-auto justify-between lg:justify-end text-xs">
                    {/* Payment Date & Time */}
                    <div className="text-left lg:text-right shrink-0">
                      <span className="flex items-center lg:justify-end gap-1 font-medium text-slate-700 dark:text-slate-300 text-xs">
                        <CalendarIcon className="w-3 h-3 text-slate-400" />
                        {new Date(inv.paidDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                        {new Date(inv.paidDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </p>
                    </div>

                    {/* Paid Amount */}
                    <div className="text-left lg:text-right shrink-0 min-w-[85px]">
                      <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400 flex items-center lg:justify-end">
                        +₹{inv.amount}
                      </span>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                        {inv.feeType || "Paid"}
                      </p>
                    </div>

                    {/* Download Invoice Button */}
                    <div className="shrink-0 ml-auto lg:ml-0">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => downloadReceipt(inv)}
                        className="h-7 sm:h-8 px-2.5 rounded-lg text-xs font-semibold gap-1 text-primary hover:bg-primary/5 border-slate-200 dark:border-slate-700"
                        title="Download Receipt"
                      >
                        <Download className="w-3.5 h-3.5" /> Receipt
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>

        {/* Standardized Pagination Bar (Rule 7.6) */}
        {!isLoading && filteredInvoices.length > 0 && (
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20">
            <span className="text-xs font-medium text-slate-500">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredInvoices.length)} of {filteredInvoices.length}
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
    </div>
  );
}
