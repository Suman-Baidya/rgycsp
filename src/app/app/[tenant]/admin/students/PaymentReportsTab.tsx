"use client";

import React, { useState, useEffect } from "react";
import { History, Download, Calendar as CalendarIcon, IndianRupee, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPaymentsReport } from "@/app/actions/payments";
import { toast } from "sonner";
import * as XLSX from "xlsx";

export default function PaymentReportsTab({ workspaceId }: { workspaceId: string }) {
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
      setInvoices(res.data);
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
