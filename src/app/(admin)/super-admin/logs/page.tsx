"use client";

import React, { useState, useEffect } from "react";
import { 
  Activity, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  RefreshCcw,
  ShieldCheck,
  ShieldAlert,
  Server,
  Zap,
  Terminal,
  Clock,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  Info
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { AdminPageHeader } from "@/components/layout/AdminPageHeader";
import { motion } from "framer-motion";

const mockLogs = [
  { 
    id: "LOG-001", 
    level: "INFO", 
    module: "AUTH", 
    message: "Super admin login successful from IP 192.168.1.1", 
    timestamp: "2 mins ago",
    user: "Suman Kumar"
  },
  { 
    id: "LOG-002", 
    level: "WARNING", 
    module: "API", 
    message: "Rate limit reached for workspace 'Zenith Academy'", 
    timestamp: "15 mins ago",
    user: "System"
  },
  { 
    id: "LOG-003", 
    level: "ERROR", 
    module: "DATABASE", 
    message: "Connection timeout on Mumbai edge node (ap-south-1)", 
    timestamp: "45 mins ago",
    user: "Prisma Runner"
  },
  { 
    id: "LOG-004", 
    level: "CRITICAL", 
    module: "SECURITY", 
    message: "Brute force attack detected on subdomain 'elite-coding'", 
    timestamp: "1 hour ago",
    user: "Firewall"
  },
  { 
    id: "LOG-005", 
    level: "INFO", 
    module: "BILLING", 
    message: "Subscription auto-renewal processed for 12 workspaces", 
    timestamp: "2 hours ago",
    user: "Stripe Webhook"
  },
  { 
    id: "LOG-006", 
    level: "INFO", 
    module: "WORKSPACE", 
    message: "New workspace 'Global Tech' initialized successfully", 
    timestamp: "3 hours ago",
    user: "System"
  },
];

export default function LogsPage() {
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const logMetrics = [
    { title: "Total Events", value: "24,850", icon: Terminal, color: "text-slate-500", bg: "bg-slate-500/10" },
    { title: "Security Alerts", value: "12", icon: ShieldAlert, color: "text-red-500", bg: "bg-red-500/10" },
    { title: "System Uptime", value: "99.98%", icon: Activity, color: "text-green-500", bg: "bg-green-500/10" },
    { title: "Avg. Latency", value: "124ms", icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="space-y-10 pb-12 max-w-7xl mx-auto">
      <AdminPageHeader 
        title="System Logs" 
        description="Centralized global audit trail and real-time system performance monitoring."
      >
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-11 rounded-xl gap-2 font-bold border-2 border-slate-100 dark:border-slate-800">
            <Download className="h-4 w-4" />
            Export Audit
          </Button>
          <Button className="h-11 px-6 rounded-xl gap-2 shadow-lg shadow-primary/20 bg-primary font-bold text-primary-foreground hover:scale-[1.02] active:scale-95 transition-all">
            <RefreshCcw className="h-4 w-4" />
            Live Stream
          </Button>
        </div>
      </AdminPageHeader>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {logMetrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[2rem] hover:border-primary/30 transition-all group overflow-hidden">
               <CardHeader className="pb-2 p-6 flex flex-row items-center justify-between">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", metric.bg)}>
                    <metric.icon className={cn("h-6 w-6", metric.color)} />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{metric.title}</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{metric.value}</p>
                  </div>
               </CardHeader>
               <CardContent className="px-6 pb-6 pt-2">
                 <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full", metric.bg.replace('/10', ''))} style={{ width: '70%' }} />
                 </div>
               </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm overflow-hidden">
        <CardHeader className="p-8 border-b border-slate-50 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="relative w-full max-w-[400px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search by module, message or ID..." 
                className="pl-11 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-50 dark:border-slate-800 rounded-2xl h-11 font-medium" 
              />
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="h-11 rounded-xl gap-2 font-bold border-2 border-slate-100 dark:border-slate-800">
                <Filter className="h-4 w-4" />
                Severity
              </Button>
              <Button variant="outline" className="h-11 rounded-xl gap-2 font-bold border-2 border-red-50 text-red-600 hover:bg-red-50 hover:text-red-700 transition-all">
                <Trash2 className="h-4 w-4" />
                Clear Logs
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
              <TableRow className="border-b border-slate-100 dark:border-slate-800">
                <TableHead className="w-[120px] px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Log ID</TableHead>
                <TableHead className="w-[100px] py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Severity</TableHead>
                <TableHead className="w-[120px] py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Module</TableHead>
                <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Event Description</TableHead>
                <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Responsible</TableHead>
                <TableHead className="text-right py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 px-8">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockLogs.map((log) => (
                <TableRow key={log.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all border-b border-slate-50 dark:border-slate-800 last:border-none">
                  <TableCell className="px-8 py-5">
                    <span className="font-mono text-xs font-bold text-slate-500">{log.id}</span>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "capitalize px-3 py-0.5 rounded-lg font-bold border-2 text-[9px] tracking-tight",
                        log.level === "INFO" ? "border-blue-500/10 bg-blue-500/5 text-blue-600 dark:text-blue-400" :
                        log.level === "WARNING" ? "border-amber-500/10 bg-amber-500/5 text-amber-600 dark:text-amber-400" :
                        log.level === "ERROR" ? "border-red-500/10 bg-red-500/5 text-red-600 dark:text-red-400" :
                        "border-purple-600 bg-purple-50 text-purple-700 animate-pulse"
                      )}
                    >
                      {log.level === "CRITICAL" && <AlertTriangle className="h-2 w-2 mr-1" />}
                      {log.level === "INFO" && <Info className="h-2 w-2 mr-1" />}
                      {log.level}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">{log.module}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[350px]">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed truncate group-hover:text-clip group-hover:whitespace-normal">
                      {log.message}
                    </p>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-bold text-slate-500">{log.user}</span>
                  </TableCell>
                  <TableCell className="text-right px-8">
                    <div className="flex items-center justify-end gap-2 text-slate-400">
                      <Clock className="h-3 w-3" />
                      <span className="text-[10px] font-bold">{log.timestamp}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <div className="p-6 border-t border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/10">
           <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-[0.2em] py-6 rounded-2xl hover:bg-primary/5 hover:text-primary transition-all">
              Load Previous 50 Audit Events
           </Button>
        </div>
      </Card>
    </div>
  );
}
