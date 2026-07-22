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
  Cell,
  Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, IndianRupee, TrendingUp, TrendingDown, Clock, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FranchiseWalletAnalyticsTabProps {
  transactions: any[];
}

export default function FranchiseWalletAnalyticsTab({ transactions }: FranchiseWalletAnalyticsTabProps) {
  const [mounted, setMounted] = useState(false);
  
  // Default to the last 30 days
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
          (tx.description && tx.description.toLowerCase().includes(search)) ||
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
      if (tx.status === 'APPROVED' || tx.status === 'COMPLETED') { // Accepting both possible successful statuses
        if (tx.type === 'CREDIT') totalRecharges += tx.amount;
        if (tx.type === 'DEBIT') totalDeductions += tx.amount;
      }
    });

    return { totalRecharges, totalDeductions };
  }, [filteredTransactions]);

  // Chart data aggregation
  const chartData = useMemo(() => {
    const dataByDate: Record<string, { date: string; recharges: number; deductions: number; timestamp: number }> = {};
    
    // Only approved/completed for charts
    filteredTransactions.filter(tx => tx.status === 'APPROVED' || tx.status === 'COMPLETED').forEach(tx => {
      const txDate = new Date(tx.createdAt);
      const dateStr = txDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      if (!dataByDate[dateStr]) {
        dataByDate[dateStr] = { 
          date: dateStr, 
          recharges: 0, 
          deductions: 0,
          timestamp: txDate.getTime() 
        };
      }
      if (tx.type === 'CREDIT') dataByDate[dateStr].recharges += tx.amount;
      if (tx.type === 'DEBIT') dataByDate[dateStr].deductions += tx.amount;
    });

    // Convert to array and sort chronologically
    return Object.values(dataByDate).sort((a, b) => a.timestamp - b.timestamp);
  }, [filteredTransactions]);

  const handleDownloadCSV = () => {
    const headers = ["Date", "Description", "Type", "Amount", "Status", "Reference ID"];
    const rows = filteredTransactions.map(tx => [
      new Date(tx.createdAt).toLocaleString(),
      tx.description || "N/A",
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
    link.setAttribute("download", `my_wallet_report_${fromDate}_to_${toDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!mounted) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Date Filters & Actions */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 p-6 md:p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        {/* Left side: Date Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 w-full xl:w-auto">
          <div className="flex flex-col gap-1 w-full sm:w-auto">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">From Date</label>
            <Input 
              type="date" 
              value={fromDate} 
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full sm:w-[140px] h-11 rounded-xl border-2 border-slate-100 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 px-3"
            />
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
          <Button 
            onClick={() => {
              const d = new Date();
              d.setDate(d.getDate() - 30);
              setFromDate(d.toISOString().split('T')[0]);
              setToDate(new Date().toISOString().split('T')[0]);
            }}
            variant="ghost"
            className="h-11 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hidden md:inline-flex w-full sm:w-auto mt-2 sm:mt-0"
          >
            Last 30 Days
          </Button>
        </div>

        {/* Right side: Search & Download */}
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          <div className="relative w-full sm:w-[260px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search reference..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 rounded-xl border-2 border-slate-100 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-sm font-semibold placeholder:font-normal w-full"
            />
          </div>
          <Button 
            onClick={handleDownloadCSV}
            className="h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98] w-full sm:w-auto"
          >
            <Download className="w-4 h-4 mr-2" />
            Download CSV
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-2 border-emerald-100 dark:border-emerald-900/30 rounded-[2.5rem] bg-emerald-50/50 dark:bg-emerald-950/20 shadow-sm overflow-hidden relative">
          <div className="absolute right-0 top-0 p-8 opacity-10">
            <TrendingUp className="w-32 h-32 text-emerald-600" />
          </div>
          <CardContent className="p-8 relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 flex items-center justify-center">
                <IndianRupee className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-600/80 uppercase tracking-widest">Total Recharges</p>
                <p className="text-sm font-medium text-emerald-700/60">Selected Period</p>
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-emerald-500 font-bold text-2xl">₹</span>
              <span className="text-5xl font-black text-emerald-700 dark:text-emerald-400 tracking-tight">
                {metrics.totalRecharges.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-rose-100 dark:border-rose-900/30 rounded-[2.5rem] bg-rose-50/50 dark:bg-rose-950/20 shadow-sm overflow-hidden relative">
          <div className="absolute right-0 top-0 p-8 opacity-10">
            <TrendingDown className="w-32 h-32 text-rose-600" />
          </div>
          <CardContent className="p-8 relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 flex items-center justify-center">
                <IndianRupee className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-rose-600/80 uppercase tracking-widest">Total Deductions</p>
                <p className="text-sm font-medium text-rose-700/60">Selected Period</p>
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-rose-500 font-bold text-2xl">₹</span>
              <span className="text-5xl font-black text-rose-700 dark:text-rose-400 tracking-tight">
                {metrics.totalDeductions.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Section */}
      <Card className="border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-sm overflow-hidden">
        <CardHeader className="p-6 md:p-8 border-b border-slate-50 dark:border-slate-800">
          <CardTitle className="text-xl font-bold">Transaction Trends</CardTitle>
          <CardDescription>Daily recharges and deductions over the selected period</CardDescription>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <div className="h-[400px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                    tickFormatter={(value) => `₹${value}`}
                    dx={-10}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
                    contentStyle={{ 
                      borderRadius: '16px', 
                      border: '1px solid rgba(148, 163, 184, 0.2)', 
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      color: '#f8fafc',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.2)',
                      padding: '16px'
                    }}
                    itemStyle={{ color: '#e2e8f0', fontWeight: 500 }}
                    labelStyle={{ color: '#94a3b8', marginBottom: '8px', fontWeight: 600 }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="recharges" name="Recharges" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="deductions" name="Deductions" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center text-slate-400">
                <BarChart className="w-16 h-16 text-slate-200 mb-4" />
                <p className="font-medium text-slate-500">No transaction data for this period</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
