"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Activity, 
  Search, 
  Trash2, 
  RefreshCcw, 
  ShieldAlert, 
  Terminal, 
  Clock, 
  AlertTriangle, 
  Info,
  ChevronLeft,
  ChevronRight,
  Shield,
  Filter
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { AdminPageHeader } from "@/components/layout/AdminPageHeader";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getLogs, clearLogs, getDeveloperEmail } from "@/app/actions/logs";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const SEVERITY_TABS = [
  { id: "ALL", label: "All Logs" },
  { id: "INFO", label: "Info" },
  { id: "WARNING", label: "Warnings" },
  { id: "ERROR", label: "Errors" },
  { id: "CRITICAL", label: "Critical" },
];

export default function LogsPage() {
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const devEmail = await getDeveloperEmail();
      if (!session?.user?.email) return;
      
      if (session.user.email !== devEmail || !devEmail) {
        setIsAuthorized(false);
        router.push("/super-admin");
      } else {
        setIsAuthorized(true);
      }
    };
    if (session) {
      checkAuth();
    }
  }, [session, router]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const data = await getLogs(filter);
      setLogs(data || []);
    } catch (e) {
      toast.error("Failed to fetch logs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchLogs();
    }
  }, [filter, isAuthorized]);

  const handleClearLogs = async (timeframe: 'WEEKLY' | 'MONTHLY' | 'ALL') => {
    const confirmMessage = timeframe === 'ALL' 
      ? "Are you sure you want to clear ALL logs? This cannot be undone." 
      : `Are you sure you want to clear logs older than 1 ${timeframe === 'WEEKLY' ? 'week' : 'month'}?`;
      
    if (!confirm(confirmMessage)) return;

    toast.loading("Clearing logs...", { id: "clear-logs" });
    const result = await clearLogs(timeframe);
    if (result.success) {
      toast.success(`Successfully cleared ${result.count} logs`, { id: "clear-logs" });
      fetchLogs();
    } else {
      toast.error("Failed to clear logs", { id: "clear-logs" });
    }
  };

  // Filtered and Paginated Logs
  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return logs;
    const q = searchQuery.toLowerCase();
    return logs.filter((log) => 
      log.message?.toLowerCase().includes(q) ||
      log.module?.toLowerCase().includes(q) ||
      log.id?.toLowerCase().includes(q) ||
      log.user?.toLowerCase().includes(q) ||
      log.level?.toLowerCase().includes(q)
    );
  }, [logs, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / itemsPerPage));
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(start, start + itemsPerPage);
  }, [filteredLogs, currentPage, itemsPerPage]);

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  };

  if (!mounted || isAuthorized === null) return null;
  
  if (isAuthorized === false) {
    return <div className="p-6 text-center text-rose-500 font-semibold text-sm">Unauthorized Access. You do not have developer privileges to view this page.</div>;
  }

  const logMetrics = [
    { title: "Total Events", value: logs.length.toString(), icon: Terminal, color: "text-slate-500", bg: "bg-slate-500/10" },
    { title: "Security Alerts", value: logs.filter(l => l.level === 'CRITICAL' || l.level === 'ERROR').length.toString(), icon: ShieldAlert, color: "text-rose-500", bg: "bg-rose-500/10" },
    { title: "System Warnings", value: logs.filter(l => l.level === 'WARNING').length.toString(), icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10" },
    { title: "Recent (24h)", value: logs.filter(l => new Date(l.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000).length.toString(), icon: Activity, color: "text-blue-500", bg: "bg-blue-500/10" },
  ];

  return (
    <TooltipProvider>
      <div className="space-y-4 sm:space-y-5 pb-8 w-full mx-auto">
        <AdminPageHeader 
          title="System Logs" 
          description="Centralized global audit trail and real-time system performance monitoring."
        >
          <div className="flex items-center gap-2">
            <Button 
              onClick={fetchLogs} 
              disabled={isLoading}
              className="h-8 sm:h-9 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold gap-1.5 shadow-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
            >
              <RefreshCcw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
              {isLoading ? "Refreshing..." : "Live Stream"}
            </Button>
          </div>
        </AdminPageHeader>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {logMetrics.map((metric) => (
            <Card key={metric.title} className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
              <CardContent className="p-3.5">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">{metric.title}</p>
                    <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{metric.value}</p>
                  </div>
                  <div className={cn("p-2.5 rounded-lg shrink-0", metric.bg)}>
                    <metric.icon className={cn("h-5 w-5", metric.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Severity Filter Tabs */}
        <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-1.5 p-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-full">
          {SEVERITY_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setFilter(tab.id);
                setCurrentPage(1);
              }}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium shrink-0 whitespace-nowrap transition-all",
                filter === tab.id
                  ? "bg-slate-100 dark:bg-slate-800 text-primary dark:text-white font-semibold shadow-inner"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Content Card & Toolbar */}
        <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden bg-white dark:bg-slate-900">
          <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="relative w-full md:max-w-[300px] group">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                <Input 
                  placeholder="Search logs..." 
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-8 sm:h-9 pl-8 pr-3 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 rounded-lg font-normal text-[11px] sm:text-xs placeholder:text-[11px] sm:placeholder:text-xs placeholder:text-slate-400"
                />
              </div>

              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap text-xs h-8 sm:h-9 px-3 rounded-lg gap-1.5 font-semibold border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all focus:outline-none">
                    <Trash2 className="h-3.5 w-3.5" />
                    Clear Logs
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 rounded-xl p-1 shadow-lg border-slate-200 dark:border-slate-800">
                    <DropdownMenuItem onClick={() => handleClearLogs('WEEKLY')} className="cursor-pointer text-xs py-2 px-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                      Older Than 1 Week
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleClearLogs('MONTHLY')} className="cursor-pointer text-xs py-2 px-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                      Older Than 1 Month
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleClearLogs('ALL')} className="cursor-pointer text-xs py-2 px-2.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-semibold">
                      Clear All Logs
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
                <TableRow className="border-b border-slate-100 dark:border-slate-800 hover:bg-transparent">
                  <TableHead className="w-[110px] px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Log ID</TableHead>
                  <TableHead className="w-[90px] px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Severity</TableHead>
                  <TableHead className="w-[120px] px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Module</TableHead>
                  <TableHead className="px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Event Description</TableHead>
                  <TableHead className="w-[120px] px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">User</TableHead>
                  <TableHead className="text-right px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 w-[160px]">Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-xs text-slate-500 font-medium">
                      Loading audit logs...
                    </TableCell>
                  </TableRow>
                ) : paginatedLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-xs text-slate-500 font-medium">
                      No system logs found matching criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedLogs.map((log) => (
                    <TableRow 
                      key={log.id} 
                      className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors border-b border-slate-100 dark:border-slate-800/60 last:border-none"
                    >
                      <TableCell className="px-3.5 py-2.5">
                        <span className="font-mono text-xs font-semibold text-slate-500">#{log.id.slice(-6).toUpperCase()}</span>
                      </TableCell>
                      <TableCell className="px-3.5 py-2.5">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border-none",
                            log.level === "INFO" ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" :
                            log.level === "WARNING" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                            log.level === "ERROR" ? "bg-rose-500/10 text-rose-600 dark:text-rose-400" :
                            "bg-purple-500/10 text-purple-600 dark:text-purple-400 animate-pulse"
                          )}
                        >
                          {log.level === "CRITICAL" && <AlertTriangle className="h-2.5 w-2.5 mr-1" />}
                          {log.level === "INFO" && <Info className="h-2.5 w-2.5 mr-1" />}
                          {log.level}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-3.5 py-2.5">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{log.module}</span>
                      </TableCell>
                      <TableCell className="px-3.5 py-2.5 max-w-[340px]">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <p className="text-xs text-slate-800 dark:text-slate-200 truncate cursor-default">
                              {log.message}
                            </p>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-md text-xs">
                            {log.message}
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="px-3.5 py-2.5">
                        <span className="text-xs font-medium text-slate-500">{log.user || "System"}</span>
                      </TableCell>
                      <TableCell className="text-right px-3.5 py-2.5">
                        <div className="flex items-center justify-end gap-1 text-slate-400">
                          <Clock className="h-3 w-3 shrink-0" />
                          <span className="text-[10px] font-medium whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Standardized Pagination Bar */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20">
                <div className="text-xs font-medium text-slate-500">
                  Showing {Math.min(filteredLogs.length, (currentPage - 1) * itemsPerPage + 1)} to {Math.min(filteredLogs.length, currentPage * itemsPerPage)} of {filteredLogs.length}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </Button>
                  {getPageNumbers().map((page, index) => {
                    if (page === "...") {
                      return <span key={`ellipsis-${index}`} className="px-1 text-slate-400 text-xs select-none">...</span>;
                    }
                    const isCurrent = page === currentPage;
                    return (
                      <Button
                        key={`page-${page}`}
                        variant={isCurrent ? "default" : "ghost"}
                        size="sm"
                        className={cn(
                          "h-7 w-7 rounded-md font-semibold text-xs",
                          isCurrent && "shadow-xs"
                        )}
                        onClick={() => setCurrentPage(page as number)}
                      >
                        {page}
                      </Button>
                    );
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
