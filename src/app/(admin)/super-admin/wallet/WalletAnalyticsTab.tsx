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
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Date Filters & Actions */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 p-6 md:p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        {/* Left side: Date Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 w-full xl:w-auto">
          <div className="flex flex-col gap-1 w-full sm:w-auto">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">From Date</label>
            <div className="relative">
              <Input 
                type="date" 
                value={fromDate} 
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full sm:w-[140px] h-11 rounded-xl border-2 border-slate-100 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 px-3"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1 w-full sm:w-auto">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">To Date</label>
            <Input 
              type="date" 
              value={toDate} 
              onChange={(e) => setToDate(e.target.value)}
              className="w-full sm:w-[140px] h-11 rounded-xl border-2 border-slate-100 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 px-3"
            />
          </div>
        </div>

        {/* Right side: Search and Download */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
          <div className="relative w-full sm:w-[320px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search franchise or reference..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-11 rounded-xl border-2 border-slate-100 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300"
            />
          </div>
          <Button 
            onClick={handleDownloadCSV} 
            className="w-full sm:w-auto h-11 rounded-xl px-6 font-bold shadow-md shadow-primary/20 gap-2 shrink-0 hover:scale-[1.02] transition-transform"
          >
            <Download className="h-4 w-4" />
            Download CSV
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-2 border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
          <CardContent className="p-8 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Recharges</p>
              <div className="flex items-center gap-2 mt-2">
                <IndianRupee className="h-8 w-8 text-green-500" />
                <span className="text-4xl font-black text-slate-900 dark:text-white">{metrics.totalRecharges.toFixed(2)}</span>
              </div>
            </div>
            <div className="h-16 w-16 bg-green-500/10 rounded-2xl flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
          <CardContent className="p-8 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Deductions</p>
              <div className="flex items-center gap-2 mt-2">
                <IndianRupee className="h-8 w-8 text-red-500" />
                <span className="text-4xl font-black text-slate-900 dark:text-white">{metrics.totalDeductions.toFixed(2)}</span>
              </div>
              <p className="text-xs font-medium text-slate-400 mt-1">From student registrations</p>
            </div>
            <div className="h-16 w-16 bg-red-500/10 rounded-2xl flex items-center justify-center">
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Row */}
      <Card className="border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-sm overflow-hidden">
        <CardHeader className="p-8 border-b border-slate-50 dark:border-slate-800">
          <CardTitle className="text-xl font-bold tracking-tight">Transaction Trends</CardTitle>
          <CardDescription className="text-xs font-medium text-slate-500">Recharges vs Deductions over selected period.</CardDescription>
        </CardHeader>
        <CardContent className="p-8 h-[400px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="recharges" name="Recharges (₹)" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="deductions" name="Deductions (₹)" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 font-bold">
              No approved transactions in this period.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Table Row */}
      <Card className="border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-sm overflow-hidden">
        <CardHeader className="p-8 border-b border-slate-50 dark:border-slate-800">
          <CardTitle className="text-xl font-bold tracking-tight">Detailed Report</CardTitle>
          <CardDescription className="text-xs font-medium text-slate-500">Showing {filteredTransactions.length} transactions.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-50 dark:divide-slate-800">
            {paginatedTransactions.map(tx => (
              <div key={tx.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all gap-4">
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    tx.type === 'CREDIT' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'
                  }`}>
                    {tx.type === 'CREDIT' ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-slate-400" />
                      {tx.workspace?.name}
                    </p>
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" /> {mounted ? new Date(tx.createdAt).toLocaleString() : new Date(tx.createdAt).toISOString().split('T')[0]}
                      {tx.referenceId && <span className="ml-2 font-mono text-slate-400">Ref: {tx.referenceId}</span>}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:items-end gap-1 shrink-0">
                  <div className={`text-left sm:text-right font-black text-lg flex items-center sm:justify-end gap-1 ${
                    tx.type === 'CREDIT' ? 'text-green-600' : 'text-slate-900 dark:text-white'
                  }`}>
                    {tx.type === 'CREDIT' ? '+' : '-'} <IndianRupee className="h-4 w-4" /> {tx.amount.toFixed(2)}
                  </div>
                  <Badge className={
                    tx.status === 'APPROVED' ? 'bg-green-500/10 text-green-600 border-none hover:bg-green-500/20 w-fit' :
                    tx.status === 'REJECTED' ? 'bg-red-500/10 text-red-600 border-none hover:bg-red-500/20 w-fit' :
                    'bg-amber-500/10 text-amber-600 border-none hover:bg-amber-500/20 w-fit'
                  }>
                    {tx.status}
                  </Badge>
                </div>
              </div>
            ))}
            {paginatedTransactions.length === 0 && (
              <div className="p-12 text-center text-slate-400 font-bold">No transactions match your filters.</div>
            )}
          </div>
          
          {/* Pagination Controls */}
          {filteredTransactions.length > 0 && (
            <div className="p-4 border-t border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-500">
                Showing <span className="text-slate-900 dark:text-white">{(page - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="text-slate-900 dark:text-white">{Math.min(page * ITEMS_PER_PAGE, filteredTransactions.length)}</span> of <span className="text-slate-900 dark:text-white">{filteredTransactions.length}</span>
              </p>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-xl h-8 px-2 border-slate-200 dark:border-slate-700"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm font-bold px-3 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
                  {page} / {totalPages}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-xl h-8 px-2 border-slate-200 dark:border-slate-700"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
