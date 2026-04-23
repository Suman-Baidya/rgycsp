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
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Token Economy</h1>
          <p className="text-muted-foreground mt-1">Monitor global token flow, minting, and workspace consumption.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-11 gap-2 border-border/50">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
          <Button className="h-11 gap-2 shadow-lg shadow-primary/20 bg-primary text-primary-foreground">
            <RefreshCcw className="h-4 w-4" />
            Global Sync
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-semibold">Total Supply</CardDescription>
            <CardTitle className="text-4xl font-bold flex items-center gap-2">
              <Coins className="h-8 w-8 text-yellow-500" />
              1.5M
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-green-500 text-sm font-medium">
              <ArrowUpRight className="h-4 w-4" />
              +50,000 minted this week
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-semibold">Avg. Consumption</CardDescription>
            <CardTitle className="text-4xl font-bold flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-primary" />
              12.4K
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Info className="h-4 w-4" />
              Tokens consumed daily by AI
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-semibold">Vault Balance</CardDescription>
            <CardTitle className="text-4xl font-bold flex items-center gap-2">
              <Wallet className="h-8 w-8 text-green-500" />
              $42.5K
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-green-500 text-sm font-medium">
              Equivalent USD value held
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle>Token Distribution</CardTitle>
            <CardDescription>How tokens are allocated across the ecosystem.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[350px] w-full">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
            <div className="flex flex-wrap justify-center gap-6 mt-4">
                {distributionData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs font-medium">{item.name} ({item.value}%)</span>
                  </div>
                ))}
              </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest credit/debit actions.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              {transactionData.map((tx) => (
                <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-black transition-colors cursor-default border-l-2 border-transparent hover:border-primary">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">{tx.workspace}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{tx.type}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={cn(
                      "text-sm font-bold",
                      tx.amount.startsWith("+") ? "text-green-500" : "text-red-500"
                    )}>
                      {tx.amount}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{tx.date}</span>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-2 text-xs font-medium uppercase tracking-widest py-4 border-t border-border/50">
              View History <History className="h-3 w-3 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
