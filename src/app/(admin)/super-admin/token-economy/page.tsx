"use client";

import React from "react";
import { 
  Coins, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  RefreshCcw, 
  History,
  Info,
  ChevronRight,
  Download
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { AdminPageHeader } from "@/components/layout/AdminPageHeader";

const distributionData = [
  { name: "Active Circulation", value: 65, color: "#8b5cf6" },
  { name: "Reserved", value: 20, color: "#3b82f6" },
  { name: "Staked", value: 10, color: "#10b981" },
  { name: "Locked", value: 5, color: "#f59e0b" },
];

const transactionData = [
  { id: "1", workspace: "Zenith Academy", type: "purchase", amount: "+5,000", status: "completed", date: "2h ago" },
  { id: "2", workspace: "Elite Coding", type: "usage", amount: "-120", status: "completed", date: "4h ago" },
  { id: "3", workspace: "Modern Arts", type: "purchase", amount: "+1,000", status: "completed", date: "1d ago" },
  { id: "4", workspace: "Future Tech", type: "bonus", amount: "+250", status: "completed", date: "2d ago" },
  { id: "5", workspace: "Zenith Academy", type: "usage", amount: "-450", status: "completed", date: "3d ago" },
];

const chartConfig = {
  active: { label: "Active Circulation", color: "#8b5cf6" },
  reserved: { label: "Reserved", color: "#3b82f6" },
  staked: { label: "Staked", color: "#10b981" },
  locked: { label: "Locked", color: "#f59e0b" },
} satisfies ChartConfig;


export default function TokenEconomy() {
  return (
    <div className="space-y-10 pb-12 max-w-7xl mx-auto">
      <AdminPageHeader 
        title="Token Economy" 
        description="Monitor global token flow, minting, and workspace consumption."
      >
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-11 rounded-xl gap-2 font-bold border-2 border-slate-100 dark:border-slate-800">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
          <Button className="h-11 px-6 rounded-xl gap-2 shadow-lg shadow-primary/20 bg-primary font-bold text-primary-foreground hover:scale-[1.02] active:scale-95 transition-all">
            <RefreshCcw className="h-4 w-4" />
            Global Sync
          </Button>
        </div>
      </AdminPageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm overflow-hidden group hover:border-primary/30 transition-all">
          <CardHeader className="pb-4 p-8 bg-slate-50/50 dark:bg-slate-800/50">
            <CardDescription className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Supply</CardDescription>
            <CardTitle className="text-4xl font-black flex items-center gap-3 text-slate-900 dark:text-white tracking-tight">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                 <Coins className="h-7 w-7 text-amber-500" />
              </div>
              1.5M
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 border-t border-slate-50 dark:border-slate-800">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-xs font-bold uppercase tracking-wide">
              <ArrowUpRight className="h-4 w-4" />
              +50k minted this week
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm overflow-hidden group hover:border-primary/30 transition-all">
          <CardHeader className="pb-4 p-8 bg-slate-50/50 dark:bg-slate-800/50">
            <CardDescription className="text-[10px] font-black uppercase tracking-widest text-slate-400">Avg. Consumption</CardDescription>
            <CardTitle className="text-4xl font-black flex items-center gap-3 text-slate-900 dark:text-white tracking-tight">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                 <TrendingUp className="h-7 w-7 text-indigo-500" />
              </div>
              12.4K
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 border-t border-slate-50 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wide">
              <Info className="h-4 w-4" />
              Daily AI AI Generation Consumption
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm overflow-hidden group hover:border-primary/30 transition-all">
          <CardHeader className="pb-4 p-8 bg-slate-50/50 dark:bg-slate-800/50">
            <CardDescription className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vault Balance</CardDescription>
            <CardTitle className="text-4xl font-black flex items-center gap-3 text-slate-900 dark:text-white tracking-tight">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                 <Wallet className="h-7 w-7 text-green-500" />
              </div>
              $42.5K
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 border-t border-slate-50 dark:border-slate-800">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-xs font-bold uppercase tracking-wide">
              Equivalent USD value held
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <Card className="lg:col-span-2 border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm overflow-hidden">
          <CardHeader className="p-8 border-b border-slate-50 dark:border-slate-800">
            <CardTitle className="text-xl font-bold tracking-tight">Token Distribution</CardTitle>
            <CardDescription className="text-xs font-medium text-slate-500">How tokens are allocated across the ecosystem.</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <ChartContainer config={chartConfig} className="h-[350px] w-full">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={100}
                  outerRadius={140}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
            <div className="flex flex-wrap justify-center gap-8 mt-6">
                {distributionData.map((item) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-lg shadow-sm" style={{ backgroundColor: item.color }} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{item.name} <span className="text-slate-900 dark:text-white ml-1">({item.value}%)</span></span>
                  </div>
                ))}
              </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col">
          <CardHeader className="p-8 border-b border-slate-50 dark:border-slate-800">
            <CardTitle className="text-xl font-bold tracking-tight">Recent Activity</CardTitle>
            <CardDescription className="text-xs font-medium text-slate-500">Latest credit/debit actions.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <div className="divide-y divide-slate-50 dark:divide-slate-800">
              {transactionData.map((tx) => (
                <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all cursor-default group">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{tx.workspace}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{tx.type}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={cn(
                      "text-sm font-black tracking-tighter px-2 py-0.5 rounded-lg",
                      tx.amount.startsWith("+") ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-red-500/10 text-red-600 dark:text-red-400"
                    )}>
                      {tx.amount}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">{tx.date}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 mt-auto">
               <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-[0.2em] py-6 rounded-2xl hover:bg-primary/5 hover:text-primary transition-all">
                  Full Ledger History <History className="h-3 w-3 ml-2" />
               </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
