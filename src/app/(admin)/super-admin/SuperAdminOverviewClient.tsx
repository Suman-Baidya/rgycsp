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
  Cpu,
  Building2,
  Coins
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
import Link from "next/link";

const COLORS = [
  "#8b5cf6", // Violet
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#f59e0b"  // Amber
];

const iconMap: Record<string, any> = {
  franchises: Building2,
  students: Users,
  tokens: Coins,
  activity: Activity,
  globe: Globe
};

interface StatItem {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  iconKey: string;
  description: string;
}

interface ChartDataItem {
  name: string;
  workspaces: number;
  tokens: number;
}

interface ActivityItem {
  id: string;
  title: string;
  message: string;
  type: string;
  time: string;
  link?: string;
}

interface NodeItem {
  region: string;
  load: string;
  status: string;
}

interface SuperAdminOverviewClientProps {
  stats: StatItem[];
  chartData: ChartDataItem[];
  recentActivity: ActivityItem[];
  nodes: NodeItem[];
  cpuUsage: number;
  apiThroughput: string;
  threatCheckCount: number;
}

const chartConfig = {
  workspaces: {
    label: "Franchises",
    color: "#8b5cf6",
  },
  tokens: {
    label: "Tokens",
    color: "#3b82f6",
  },
} satisfies ChartConfig;

export default function SuperAdminOverviewClient({
  stats,
  chartData,
  recentActivity,
  nodes,
  cpuUsage,
  apiThroughput,
  threatCheckCount
}: SuperAdminOverviewClientProps) {
  const [mounted, setMounted] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Activity className="h-8 w-8 animate-spin text-primary/20" />
      </div>
    );
  }

  const filteredActivity = recentActivity.filter(act => 
    act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    act.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-10 pb-12 w-full mx-auto">
      <AdminPageHeader 
        title="Global Overview" 
        description="Real-time performance metrics and franchise system statistics."
      >
        <div className="flex items-center gap-3">
          <Link href="/super-admin/franchises">
            <Button className="h-11 px-6 rounded-xl gap-2 shadow-lg shadow-primary/20 bg-primary font-bold text-primary-foreground hover:scale-[1.02] active:scale-95 transition-all">
              <Building2 className="h-4 w-4" />
              Manage Franchises
            </Button>
          </Link>
        </div>
      </AdminPageHeader>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = iconMap[stat.iconKey] || Globe;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="relative overflow-hidden border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[2rem] hover:border-primary/30 transition-all group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <IconComponent className="h-12 w-12 text-primary" />
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
          );
        })}
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
                <CardTitle className="text-xl font-bold tracking-tight">Franchise Growth</CardTitle>
                <CardDescription className="text-xs font-medium text-slate-500">Monthly registration trend (workspaces online)</CardDescription>
              </div>
              <Button variant="ghost" size="icon" className="rounded-xl"><MoreHorizontal className="h-4 w-4" /></Button>
            </CardHeader>
            <CardContent className="p-8">
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <AreaChart data={chartData}>
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
                <CardTitle className="text-xl font-bold tracking-tight">Token Allocation</CardTitle>
                <CardDescription className="text-xs font-medium text-slate-500">Regional distribution and seeds held by franchises</CardDescription>
              </div>
              <Button variant="ghost" size="icon" className="rounded-xl"><MoreHorizontal className="h-4 w-4" /></Button>
            </CardHeader>
            <CardContent className="p-8">
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <BarChart data={chartData}>
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
                    {chartData.map((entry, index) => (
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
            {nodes.map((node) => (
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
                  <span className="text-sm font-black text-slate-900 dark:text-white">{cpuUsage}%</span>
               </div>
               <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${cpuUsage}%` }} className="h-full bg-primary rounded-full" />
               </div>
            </div>
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">API Throughput</span>
                  </div>
                  <span className="text-sm font-black text-slate-900 dark:text-white">{apiThroughput}</span>
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
                    <span className="text-xs text-indigo-600/70 font-medium">Scanning {threatCheckCount} workspaces in real-time</span>
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
            <CardDescription className="text-xs font-medium text-slate-500">Latest global notifications and center activation logs.</CardDescription>
          </div>
          <div className="relative w-full max-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search logs..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-50 dark:border-slate-800 rounded-2xl h-11 font-medium" 
            />
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-4">
          <div className="divide-y divide-slate-50 dark:divide-slate-800">
            {filteredActivity.length > 0 ? (
              filteredActivity.map((act) => (
                <div key={act.id} className="flex items-start gap-5 p-6 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all group cursor-default rounded-[1.5rem]">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {act.title}
                      </p>
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest shrink-0">{act.time}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 sm:line-clamp-none font-medium">
                      {act.message}
                    </p>
                  </div>
                  {act.link && (
                    <Link href={act.link} className="hidden sm:flex opacity-0 group-hover:opacity-100 transition-all rounded-xl">
                      <Button variant="ghost" size="icon">
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-slate-400 font-bold text-sm">
                No recent activity records.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
