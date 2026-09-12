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
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300">
      {/* Date Filters & Actions */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-3 p-3.5 sm:p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Left side: Date Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-2.5 w-full xl:w-auto">
          <div className="flex flex-col gap-1 w-full sm:w-auto">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">From Date</label>
            <Input 
              type="date" 
              value={fromDate} 
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full sm:w-[135px] h-9 rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 px-2.5"
            />
          </div>
          <div className="flex flex-col gap-1 w-full sm:w-auto">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">To Date</label>
            <Input 
              type="date" 
              value={toDate} 
              onChange={(e) => setToDate(e.target.value)}
              className="w-full sm:w-[135px] h-9 rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 px-2.5"
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
            className="h-9 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-xs font-semibold px-3 hidden md:inline-flex w-full sm:w-auto"
          >
            Last 30 Days
          </Button>
        </div>

        {/* Right side: Search & Download */}
        <div className="flex flex-col sm:flex-row gap-2.5 w-full xl:w-auto">
          <div className="relative w-full sm:w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input 
              placeholder="Search reference..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-xs placeholder:text-xs font-normal placeholder:font-normal text-slate-700 dark:text-slate-300 w-full"
            />
          </div>
          <Button 
            onClick={handleDownloadCSV}
            className="h-9 px-3.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 shadow-sm text-xs sm:text-sm font-bold w-full sm:w-auto"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Download CSV
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl shadow-sm overflow-hidden relative">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Total Recharges</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">₹</span>
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                    {metrics.totalRecharges.toFixed(2)}
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-400">Selected period approved recharges</p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl shadow-sm overflow-hidden relative">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Total Deductions</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400">₹</span>
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                    {metrics.totalDeductions.toFixed(2)}
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-400">From student registrations & fees</p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Section */}
      <Card className="border-2 border-slate-100 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <CardHeader className="p-3.5 sm:p-4 border-b border-slate-50 dark:border-slate-800">
          <CardTitle className="text-sm sm:text-base font-bold">Transaction Trends</CardTitle>
          <CardDescription className="text-xs">Recharges vs Deductions over selected period.</CardDescription>
        </CardHeader>
        <CardContent className="p-3.5 sm:p-4">
          <div className="h-[280px] sm:h-[320px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 15, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                    dy={5}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                    tickFormatter={(value) => `₹${value}`}
                    dx={-5}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
                    contentStyle={{ 
                      borderRadius: '8px', 
                      border: '1px solid rgba(148, 163, 184, 0.2)', 
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      color: '#f8fafc',
                      fontSize: '12px',
                      padding: '8px 12px'
                    }}
                    itemStyle={{ color: '#e2e8f0', fontWeight: 500 }}
                    labelStyle={{ color: '#94a3b8', marginBottom: '4px', fontWeight: 600 }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                  <Bar dataKey="recharges" name="Recharges" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={32} />
                  <Bar dataKey="deductions" name="Deductions" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center text-slate-400">
                <BarChart className="w-10 h-10 text-slate-200 mb-2" />
                <p className="font-semibold text-xs text-slate-500">No transaction data for this period</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
