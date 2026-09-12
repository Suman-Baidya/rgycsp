"use client";

import React, { useState, useMemo } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, IndianRupee, TrendingUp, TrendingDown, Clock, Building2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface WalletAnalyticsTabProps {
  transactions: any[];
}

export default function WalletAnalyticsTab({ transactions }: WalletAnalyticsTabProps) {
  const [mounted, setMounted] = useState(false);
  
  // We want to default to the last 30 days
  const defaultFrom = new Date();
  defaultFrom.setDate(defaultFrom.getDate() - 30);
  
  const [fromDate, setFromDate] = useState(defaultFrom.toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // Date filter
      const txDate = new Date(tx.createdAt);
      const start = new Date(fromDate);
      start.setHours(0,0,0,0);
      const end = new Date(toDate);
      end.setHours(23,59,59,999);
      
      if (txDate < start || txDate > end) return false;

      // Search filter
      const search = searchQuery.toLowerCase();
      if (search) {
        return (
          tx.workspace?.name.toLowerCase().includes(search) ||
          (tx.referenceId && tx.referenceId.toLowerCase().includes(search))
        );
      }
      return true;
    });
  }, [transactions, fromDate, toDate, searchQuery]);

  React.useEffect(() => {
    setPage(1);
  }, [fromDate, toDate, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE));
  const paginatedTransactions = filteredTransactions.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // Compute metrics for approved only
  const metrics = useMemo(() => {
    let totalRecharges = 0;
    let totalDeductions = 0;

    filteredTransactions.forEach(tx => {
      if (tx.status === 'APPROVED') {
        if (tx.type === 'CREDIT') totalRecharges += tx.amount;
        if (tx.type === 'DEBIT') totalDeductions += tx.amount;
      }
    });

    return { totalRecharges, totalDeductions };
  }, [filteredTransactions]);

  // Chart data aggregation
  const chartData = useMemo(() => {
    const dataByDate: Record<string, { date: string; recharges: number; deductions: number }> = {};
    
    // Only approved for charts
    filteredTransactions.filter(tx => tx.status === 'APPROVED').forEach(tx => {
      const dateStr = new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!dataByDate[dateStr]) {
        dataByDate[dateStr] = { date: dateStr, recharges: 0, deductions: 0 };
      }
      if (tx.type === 'CREDIT') dataByDate[dateStr].recharges += tx.amount;
      if (tx.type === 'DEBIT') dataByDate[dateStr].deductions += tx.amount;
    });

    // Convert to array and sort by date 
    // Since keys are formatted, it's easier to sort by actual Date if we stored it, but keeping it simple
    return Object.values(dataByDate);
  }, [filteredTransactions]);

  const handleDownloadCSV = () => {
    const headers = ["Date", "Franchise", "Type", "Amount", "Status", "Reference ID"];
    const rows = filteredTransactions.map(tx => [
      new Date(tx.createdAt).toLocaleString(),
      tx.workspace?.name || "Unknown",
      tx.type,
      tx.amount,
      tx.status,
      tx.referenceId || "N/A"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `wallet_report_${fromDate}_to_${toDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300">
      {/* Date Filters & Actions */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-4 bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-100 dark:border-slate-800 shadow-sm">
        {/* Left side: Date Filters */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">From</span>
            <Input 
              type="date" 
              value={fromDate} 
              onChange={(e) => setFromDate(e.target.value)}
              className="w-[135px] h-9 rounded-lg border-2 border-slate-100 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 px-2.5"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">To</span>
            <Input 
              type="date" 
              value={toDate} 
              onChange={(e) => setToDate(e.target.value)}
              className="w-[135px] h-9 rounded-lg border-2 border-slate-100 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 px-2.5"
            />
          </div>
        </div>

        {/* Right side: Search and Download */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full xl:w-auto">
          <div className="relative w-full sm:w-[280px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input 
              placeholder="Search franchise or reference..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-8 rounded-lg border-2 border-slate-100 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-xs placeholder:text-xs font-normal placeholder:font-normal text-slate-700 dark:text-slate-300"
            />
          </div>
          <Button 
            onClick={handleDownloadCSV} 
            className="w-full sm:w-auto h-9 rounded-lg px-4 text-xs font-bold shadow-md shadow-primary/20 gap-1.5 shrink-0 hover:scale-[1.02] transition-transform"
          >
            <Download className="h-3.5 w-3.5" />
            Download CSV
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="relative overflow-hidden border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl hover:border-primary/30 transition-all group p-3.5 sm:p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Total Recharges</p>
              <div className="p-1.5 bg-green-500/10 rounded-lg text-green-600 dark:text-green-400">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-1 mb-2 flex items-center">
              <IndianRupee className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400 mr-0.5" />
              {metrics.totalRecharges.toFixed(2)}
            </div>
          </div>
          <p className="text-[10px] font-medium text-slate-400">Approved wallet credits</p>
        </div>

        <div className="relative overflow-hidden border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl hover:border-primary/30 transition-all group p-3.5 sm:p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Total Deductions</p>
              <div className="p-1.5 bg-red-500/10 rounded-lg text-red-600 dark:text-red-400">
                <TrendingDown className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-1 mb-2 flex items-center">
              <IndianRupee className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 dark:text-red-400 mr-0.5" />
              {metrics.totalDeductions.toFixed(2)}
            </div>
          </div>
          <p className="text-[10px] font-medium text-slate-400">From student registrations</p>
        </div>
      </div>

      {/* Chart Row */}
      <Card className="border-2 border-slate-100 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <CardHeader className="p-3.5 sm:p-4 border-b border-slate-50 dark:border-slate-800">
          <CardTitle className="text-sm sm:text-base font-bold tracking-tight">Transaction Trends</CardTitle>
          <CardDescription className="text-xs font-medium text-slate-500">Recharges vs Deductions over selected period.</CardDescription>
        </CardHeader>
        <CardContent className="p-3.5 sm:p-4 h-[280px] sm:h-[320px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dx={-8} />
                <Tooltip 
                    cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)',
                      fontWeight: 600,
                      fontSize: '12px'
                    }}
                />
                <Bar dataKey="recharges" name="Recharges (₹)" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={36} />
                <Bar dataKey="deductions" name="Deductions (₹)" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 font-bold text-sm">
              No approved transactions in this period.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Table Row */}
      <Card className="border-2 border-slate-100 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <CardHeader className="p-3.5 sm:p-4 border-b border-slate-50 dark:border-slate-800">
          <CardTitle className="text-sm sm:text-base font-bold tracking-tight">Detailed Report</CardTitle>
          <CardDescription className="text-xs font-medium text-slate-500">Showing {filteredTransactions.length} transactions.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-50 dark:divide-slate-800">
            {paginatedTransactions.map(tx => (
              <div key={tx.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all gap-3">
                <div className="flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                    tx.type === 'CREDIT' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'
                  }`}>
                    {tx.type === 'CREDIT' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-slate-400" />
                      {tx.workspace?.name}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" /> {mounted ? new Date(tx.createdAt).toLocaleString() : new Date(tx.createdAt).toISOString().split('T')[0]}
                      {tx.referenceId && <span className="ml-1.5 font-mono text-slate-400">Ref: {tx.referenceId}</span>}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:items-end gap-1 shrink-0">
                  <div className={`text-left sm:text-right font-black text-sm sm:text-base flex items-center sm:justify-end gap-0.5 ${
                    tx.type === 'CREDIT' ? 'text-green-600' : 'text-slate-900 dark:text-white'
                  }`}>
                    {tx.type === 'CREDIT' ? '+' : '-'} <IndianRupee className="h-3.5 w-3.5" /> {tx.amount.toFixed(2)}
                  </div>
                  <Badge className={
                    tx.status === 'APPROVED' ? 'bg-green-500/10 text-green-600 border-none hover:bg-green-500/20 text-[9px] font-bold px-1.5 py-0' :
                    tx.status === 'REJECTED' ? 'bg-red-500/10 text-red-600 border-none hover:bg-red-500/20 text-[9px] font-bold px-1.5 py-0' :
                    'bg-amber-500/10 text-amber-600 border-none hover:bg-amber-500/20 text-[9px] font-bold px-1.5 py-0'
                  }>
                    {tx.status}
                  </Badge>
                </div>
              </div>
            ))}
            {paginatedTransactions.length === 0 && (
              <div className="p-8 text-center text-slate-400 font-bold text-sm">No transactions match your filters.</div>
            )}
          </div>
          
          {/* Pagination Controls */}
          {filteredTransactions.length > 0 && (
            <div className="p-3 sm:p-3.5 border-t border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-500">
                Showing <span className="text-slate-900 dark:text-white">{(page - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="text-slate-900 dark:text-white">{Math.min(page * ITEMS_PER_PAGE, filteredTransactions.length)}</span> of <span className="text-slate-900 dark:text-white">{filteredTransactions.length}</span>
              </p>
              <div className="flex items-center gap-1.5">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg h-7 w-7 p-0 border-slate-200 dark:border-slate-700"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <div className="text-xs font-bold px-2.5 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md shadow-sm">
                  {page} / {totalPages}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-lg h-7 w-7 p-0 border-slate-200 dark:border-slate-700"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
