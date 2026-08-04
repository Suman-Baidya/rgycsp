"use client";

import React, { useState, useEffect } from "react";
import { History, Download, Calendar as CalendarIcon, IndianRupee, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPaymentsReport, getStudentInvoices } from "@/app/actions/payments";
import { toast } from "sonner";
import * as XLSX from "xlsx";

export default function PaymentReportsTab({ workspaceId, workspaceInfo }: { workspaceId: string, workspaceInfo?: any }) {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<"ALL" | "TODAY" | "WEEK" | "MONTH">("ALL");

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
    } else {
      toast.error(res.error || "Failed to load reports");
    }
  };

  const handleExport = () => {
    if (invoices.length === 0) {
      toast.error("No data to export");
      return;
    }

    const exportData = invoices.map(inv => ({
      "Payment Date": new Date(inv.paidDate).toLocaleDateString(),
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
    
    XLSX.writeFile(workbook, `Payment_Report_${filterMode}.xlsx`);
  };

  const downloadReceipt = async (invoice: any) => {
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
    doc.rect(10, 10, 130, 22, 'F'); // x, y, width, height

    // Logo Placeholder (Circle + Play icon representation)
    doc.setFillColor(255, 255, 255);
    doc.circle(20, 21, 6, 'F');
    doc.setFillColor(200, 200, 200);
    doc.triangle(18, 17, 18, 25, 24, 21, 'F');

    // Franchise Name in Banner
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

    // Top Left - Franchise Address
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
    doc.text("Total Due", 130, 68);
    doc.setTextColor(0, 0, 0);
    doc.text(`Rs. ${invoice.amount.toFixed(2)}`, 200, 68, { align: "right" });
    
    doc.setDrawColor(200, 200, 200);
    doc.line(130, 71, 200, 71);

    // Fetch student's full invoices for balance calculation
    let studentInvoices: any[] = [];
    if (invoice.studentProfileId) {
      const res = await getStudentInvoices(invoice.studentProfileId);
      if (res.success) {
        studentInvoices = res.data;
      }
    }

    // Middle Left - Recipient Details
    doc.setTextColor(80, 80, 80);
    doc.setFont("helvetica", "normal");
    doc.text("Recipient", 10, 75);
    const student = invoice.student || {};
    doc.setTextColor(0, 0, 0);
    doc.text(student.fullName || "N/A", 10, 80);
    doc.text(`Enrollment No: ${student.enrollmentNo || "N/A"}`, 10, 85);
    doc.text(`Course: ${student.course?.title || "N/A"}`, 10, 90);
    doc.text(`Payment Plan: ${student.paymentType === "EMI" ? "EMI" : "One-Time"}`, 10, 95);

    // Calculate balances
    const totalPaidAmount = studentInvoices.filter((i: any) => i.status === "PAID").reduce((sum: number, i: any) => sum + i.amount, 0);
    const courseFee = student.course?.feeAmount || 0;
    const remainingBalance = Math.max(0, courseFee - totalPaidAmount);

    // Add Course Fee Summary Box
    doc.setFillColor(245, 245, 245);
    doc.rect(130, 75, 70, 22, 'F');
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(10);
    doc.text("Total Course Fee:", 135, 82);
    doc.text(`Rs. ${courseFee.toFixed(2)}`, 195, 82, { align: "right" });
    
    doc.text("Total Paid:", 135, 88);
    doc.text(`Rs. ${totalPaidAmount.toFixed(2)}`, 195, 88, { align: "right" });

    doc.setTextColor(rgb.r, rgb.g, rgb.b);
    doc.setFont("helvetica", "bold");
    doc.text("Remaining Balance:", 135, 94);
    doc.text(`Rs. ${remainingBalance.toFixed(2)}`, 195, 94, { align: "right" });
    
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
    doc.text("Total Amount Due", 160, 237, { align: "right" });
    doc.setTextColor(220, 38, 38); // Red color for final amount
    doc.text(`Rs. ${invoice.amount.toFixed(2)}`, 200, 237, { align: "right" });

    // Bottom Note
    doc.setTextColor(120, 120, 120);
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text("Computer generated invoice, no signature required.", 200, 245, { align: "right" });

    doc.save(`Receipt_${student.enrollmentNo || "Unknown"}_${invoice.feeType || "Fee"}.pdf`);
  };

  const totalIncome = invoices.reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 mb-1">
            <History className="w-5 h-5 text-primary" /> Payments Report
          </h3>
          <p className="text-sm text-muted-foreground">Track your offline and online collections.</p>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={filterMode} 
            onChange={e => setFilterMode(e.target.value as any)}
            className="h-11 px-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border-none font-bold text-sm focus:ring-2 focus:ring-primary/20"
          >
            <option value="ALL">All Time</option>
            <option value="TODAY">Today</option>
            <option value="WEEK">Last 7 Days</option>
            <option value="MONTH">Last 30 Days</option>
          </select>
          <Button onClick={handleExport} variant="outline" className="h-11 rounded-xl">
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
        </div>
      </div>

      <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-6 rounded-3xl max-w-sm">
        <p className="text-xs font-black uppercase tracking-widest text-primary mb-1">Total Collected ({filterMode})</p>
        <p className="text-4xl font-black text-slate-900 dark:text-white flex items-center">
          <IndianRupee className="w-8 h-8 mr-1 text-slate-400" /> {totalIncome}
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : invoices.length === 0 ? (
        <div className="py-20 text-center bg-slate-50 dark:bg-zinc-900/50 rounded-3xl border border-dashed border-border/50">
          <p className="text-muted-foreground font-medium">No payments found for this period.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-950 border border-border rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-zinc-900/50 border-b border-border/50">
                <th className="px-6 py-4 text-left font-bold text-slate-500">Date</th>
                <th className="px-6 py-4 text-left font-bold text-slate-500">Student</th>
                <th className="px-6 py-4 text-left font-bold text-slate-500">Payment Details</th>
                <th className="px-6 py-4 text-right font-bold text-slate-500">Amount</th>
                <th className="px-6 py-4 text-right font-bold text-slate-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {new Date(inv.paidDate).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900 dark:text-white">{inv.student?.fullName}</p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">{inv.student?.enrollmentNo}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-800 dark:text-slate-200">{inv.notes || inv.feeType}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">{inv.paymentMethod}</p>
                  </td>
                  <td className="px-6 py-4 text-right font-black font-mono text-emerald-600 dark:text-emerald-400">
                    +₹{inv.amount}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => downloadReceipt(inv)}
                      className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors rounded-full"
                      title="Download Invoice"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
