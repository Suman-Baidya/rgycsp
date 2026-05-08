"use client";

import React from "react";
import { 
  TrendingUp, 
  Users, 
  Globe, 
  Zap, 
  ArrowUpRight, 
  ArrowDownRight, 
  MoreHorizontal,
  Plus,
  Search,
  Filter,
  Activity,
  ShieldCheck,
  Server,
  Terminal,
  Cpu
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  Cell
} from "recharts";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { AdminPageHeader } from "@/components/layout/AdminPageHeader";

const data = [
  { name: "Jan", workspaces: 4, tokens: 2400 },
  { name: "Feb", workspaces: 7, tokens: 1398 },
  { name: "Mar", workspaces: 12, tokens: 9800 },
  { name: "Apr", workspaces: 18, tokens: 3908 },
  { name: "May", workspaces: 25, tokens: 4800 },
  { name: "Jun", workspaces: 32, tokens: 3800 },
  { name: "Jul", workspaces: 45, tokens: 4300 },
];

const COLORS = [
  "#8b5cf6", // Violet
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#f59e0b"  // Amber
];

const stats = [
  { 
    title: "Total Workspaces", 
    value: "142", 
    change: "+12.5%", 
    trend: "up", 
    icon: Globe,
    description: "Active institutes using platform"
  },
  { 
    title: "Active Students", 
    value: "12,450", 
    change: "+18.2%", 
    trend: "up", 
    icon: Users,
    description: "Verified student profiles"
  },
  { 
    title: "Token Circulation", 
    value: "1.2M", 
    change: "-2.4%", 
    trend: "down", 
    icon: Zap,
    description: "Total tokens held by workspaces"
  },
  { 
    title: "System Health", 
    value: "99.9%", 
    change: "Stable", 
    trend: "up", 
    icon: Activity,
    description: "Global uptime last 30 days"
  },
];

const chartConfig = {
  workspaces: {
    label: "Workspaces",
    color: "#8b5cf6",
  },
  tokens: {
    label: "Tokens",
    color: "#3b82f6",
  },
} satisfies ChartConfig;


export default function SuperAdminOverview() {
  return (
    <div className="space-y-10 pb-12 w-full mx-auto">
      <AdminPageHeader 
        title="Global Overview" 
        description="Real-time performance metrics across the entire ecosystem."
      >
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-11 rounded-xl gap-2 font-bold border-2 border-slate-100 dark:border-slate-800">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button className="h-11 px-6 rounded-xl gap-2 shadow-lg shadow-primary/20 bg-primary font-bold text-primary-foreground hover:scale-[1.02] active:scale-95 transition-all">
            <Plus className="h-4 w-4" />
            Add Workspace
          </Button>
        </div>
      </AdminPageHeader>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[2rem] hover:border-primary/30 transition-all group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <stat.icon className="h-12 w-12 text-primary" />
              </div>
              <CardHeader className="pb-2">
                <CardDescription className="text-[10px] uppercase tracking-widest font-black text-slate-400">
                   {stat.title}
                </CardDescription>
                <CardTitle className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-xs font-bold px-2 py-0.5 rounded-lg flex items-center gap-1",
                    stat.trend === "up" ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-red-500/10 text-red-600 dark:text-red-400"
                  )}>
                    {stat.trend === "up" ? <TrendingUp className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {stat.change}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">{stat.description}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between p-8 border-b border-slate-50 dark:border-slate-800">
              <div className="space-y-1">
                <CardTitle className="text-xl font-bold tracking-tight">Workspace Growth</CardTitle>
                <CardDescription className="text-xs font-medium text-slate-500">Monthly onboarding trend for the last 7 months</CardDescription>
              </div>
              <Button variant="ghost" size="icon" className="rounded-xl"><MoreHorizontal className="h-4 w-4" /></Button>
            </CardHeader>
            <CardContent className="p-8">
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorWorkspaces" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-workspaces)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--color-workspaces)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tickMargin={10}
                    className="text-[10px] font-bold text-slate-400"
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    className="text-[10px] font-bold text-slate-400"
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area 
                    type="monotone" 
                    dataKey="workspaces" 
                    stroke="var(--color-workspaces)" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorWorkspaces)" 
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between p-8 border-b border-slate-50 dark:border-slate-800">
              <div className="space-y-1">
                <CardTitle className="text-xl font-bold tracking-tight">Token Economy</CardTitle>
                <CardDescription className="text-xs font-medium text-slate-500">Distribution of tokens across key regions</CardDescription>
              </div>
              <Button variant="ghost" size="icon" className="rounded-xl"><MoreHorizontal className="h-4 w-4" /></Button>
            </CardHeader>
            <CardContent className="p-8">
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tickMargin={10}
                    className="text-[10px] font-bold text-slate-400"
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    className="text-[10px] font-bold text-slate-400"
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="tokens" radius={[6, 6, 0, 0]}>
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* System Integrity & Nodes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <Card className="lg:col-span-1 border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col">
          <CardHeader className="p-8 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold tracking-tight">Active Nodes</CardTitle>
              <Badge className="bg-green-500/10 text-green-600 border-none font-black text-[9px]">LIVE</Badge>
            </div>
            <CardDescription className="text-xs font-medium text-slate-500">Global edge node health status</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-5 flex-1">
            {[
              { region: "Mumbai (ap-south-1)", load: "42%", status: "healthy" },
              { region: "London (eu-west-2)", load: "28%", status: "healthy" },
              { region: "Virginia (us-east-1)", load: "89%", status: "high-load" },
            ].map((node) => (
              <div key={node.region} className="flex items-center justify-between p-4 rounded-2xl border-2 border-slate-50 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <Server className="h-4 w-4 text-slate-400" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{node.region}</span>
                    <span className="text-[10px] text-slate-400 font-medium">Load: {node.load}</span>
                  </div>
                </div>
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  node.status === "healthy" ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-amber-500 animate-pulse"
                )} />
              </div>
            ))}
          </CardContent>
          <div className="p-4 bg-slate-50/50 dark:bg-slate-800/10 border-t border-slate-50 dark:border-slate-800">
             <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest text-primary gap-2">
                <Terminal className="h-3 w-3" /> System Diagnostics
             </Button>
          </div>
        </Card>

        <Card className="lg:col-span-2 border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col">
          <CardHeader className="p-8 border-b border-slate-50 dark:border-slate-800">
             <CardTitle className="text-xl font-bold tracking-tight">System Performance</CardTitle>
             <CardDescription className="text-xs font-medium text-slate-500">Real-time resource allocation across all workspaces.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total CPU Usage</span>
                  </div>
                  <span className="text-sm font-black text-slate-900 dark:text-white">64.2%</span>
               </div>
               <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: "64.2%" }} className="h-full bg-primary rounded-full" />
               </div>
            </div>
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">API Throughput</span>
                  </div>
                  <span className="text-sm font-black text-slate-900 dark:text-white">1,240 req/s</span>
               </div>
               <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: "85%" }} className="h-full bg-amber-500 rounded-full" />
               </div>
            </div>
            <div className="sm:col-span-2 p-6 rounded-[2rem] bg-indigo-500/5 border-2 border-indigo-500/10 flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-indigo-900 dark:text-indigo-100">AI Threat Detection Active</span>
                    <span className="text-xs text-indigo-600/70 font-medium">Scanning 142 workspaces in real-time</span>
                  </div>
               </div>
               <Button size="sm" className="bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl font-bold">Audit</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <Card className="border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-8 border-b border-slate-50 dark:border-slate-800 gap-4">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold tracking-tight">System Activity</CardTitle>
            <CardDescription className="text-xs font-medium text-slate-500">Latest logs and actions from global admins.</CardDescription>
          </div>
          <div className="relative w-full max-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search logs..." 
              className="pl-11 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-50 dark:border-slate-800 rounded-2xl h-11 font-medium" 
            />
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-4">
          <div className="divide-y divide-slate-50 dark:divide-slate-800">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-5 p-6 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all group cursor-default rounded-[1.5rem]">
                <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      New Workspace Created: <span className="text-primary font-black">Zenith Academy</span>
                    </p>
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest shrink-0">2h ago</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 sm:line-clamp-none font-medium">
                    A new educational workspace has been initialized on the Mumbai edge node. Configuration verified and system tokens allocated.
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="hidden sm:flex opacity-0 group-hover:opacity-100 transition-all rounded-xl">
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-slate-50 dark:border-slate-800 mt-2">
            <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary/5 hover:text-primary transition-all py-6 rounded-2xl">
              View All Global Activity
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
