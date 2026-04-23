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
  ShieldCheck
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
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

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
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Global Overview</h1>
          <p className="text-muted-foreground mt-1">Real-time performance metrics across the entire ecosystem.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-10 gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button className="h-10 gap-2 shadow-lg shadow-primary/20 bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            Add Workspace
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden border-border/50 bg-card/50 hover:bg-card transition-colors group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <stat.icon className="h-12 w-12 text-primary" />
              </div>
              <CardHeader className="pb-2">
                <CardDescription className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                  {stat.title}
                </CardDescription>
                <CardTitle className="text-3xl font-bold">{stat.value}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1",
                    stat.trend === "up" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                  )}>
                    {stat.trend === "up" ? <TrendingUp className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {stat.change}
                  </span>
                  <span className="text-xs text-muted-foreground">{stat.description}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="flex flex-row items-center justify-between pb-8">
              <div>
                <CardTitle className="text-xl">Workspace Growth</CardTitle>
                <CardDescription>Monthly onboarding trend for the last 7 months</CardDescription>
              </div>
              <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorWorkspaces" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-workspaces)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--color-workspaces)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tickMargin={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area 
                    type="monotone" 
                    dataKey="workspaces" 
                    stroke="var(--color-workspaces)" 
                    strokeWidth={3}
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
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="flex flex-row items-center justify-between pb-8">
              <div>
                <CardTitle className="text-xl">Token Economy</CardTitle>
                <CardDescription>Distribution of tokens across key regions</CardDescription>
              </div>
              <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tickMargin={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
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

      {/* Recent Activity Section */}
      <Card className="border-border/50 bg-card/50 overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle>System Activity</CardTitle>
            <CardDescription>Latest logs and actions from global admins.</CardDescription>
          </div>
          <div className="relative w-full max-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search logs..." className="pl-9 bg-background/50 h-9" />
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="divide-y divide-border/40">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-4 p-4 sm:p-6 hover:bg-white/5 transition-colors group cursor-default">
                <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-sm truncate">New Workspace Created: <span className="text-primary font-bold">Zenith Academy</span></p>
                    <span className="text-[10px] text-muted-foreground font-mono shrink-0">2h ago</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 sm:line-clamp-none">
                    A new educational workspace has been initialized on the Mumbai edge node. Configuration verified.
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="hidden sm:flex opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-border/40 sm:border-none">
            <Button variant="ghost" className="w-full text-xs font-medium uppercase tracking-widest hover:bg-primary/5 hover:text-primary transition-all">
              View All Activity
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
