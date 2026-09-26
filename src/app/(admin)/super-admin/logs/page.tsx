"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  Download,
  Sliders,
  Sparkles,
  Flame,
  Bot,
  Database,
  Calendar,
  AlertOctagon,
  Zap,
  CheckCircle2,
  HardDrive
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";
import { AdminPageHeader } from "@/components/layout/AdminPageHeader";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  getLogs, 
  clearLogs, 
  getDeveloperEmail, 
  getLogStatistics,
  recordSecurityAlert,
  type LogClearTimeframe 
} from "@/app/actions/logs";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useDebounce } from "@/hooks/useDebounce";
import { DeveloperSiteConfigModal } from "./DeveloperSiteConfigModal";
import { isDeveloperEmail } from "@/lib/developer";

type ActiveTabType = "ALL" | "SECURITY" | "SUSPICIOUS" | "ERRORS" | "MAINTENANCE";

export default function LogsPage() {
  const [mounted, setMounted] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTabType>("ALL");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 250);
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<{
    totalLogs: number;
    criticalCount: number;
    errorCount: number;
    warningCount: number;
    securityAlertsCount: number;
    suspiciousCount: number;
    olderThanWeek: number;
    olderThanMonth: number;
    olderThanQuarter: number;
    olderThanYear: number;
    oldestDate: string | null;
  }>({
    totalLogs: 0,
    criticalCount: 0,
    errorCount: 0,
    warningCount: 0,
    securityAlertsCount: 0,
    suspiciousCount: 0,
    olderThanWeek: 0,
    olderThanMonth: 0,
    olderThanQuarter: 0,
    olderThanYear: 0,
    oldestDate: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isPruning, setIsPruning] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isDeveloperUser, setIsDeveloperUser] = useState<boolean>(false);
  const [developerEmail, setDeveloperEmail] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Custom Alert Box Confirmation State
  const [confirmPrune, setConfirmPrune] = useState<{
    isOpen: boolean;
    timeframe: LogClearTimeframe | null;
    title: string;
    description: string;
    confirmText: string;
  }>({
    isOpen: false,
    timeframe: null,
    title: "",
    description: "",
    confirmText: "Prune Logs",
  });

  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      if (!session?.user) return;
      
      const isDev = Boolean(isDeveloperEmail(session.user.email) || (session.user as any)?.isDeveloper);
      setIsDeveloperUser(isDev);

      // Exclusively for verified developer admin
      if (!isDev) {
        setIsAuthorized(false);
        router.push("/super-admin");
      } else {
        const devEmail = await getDeveloperEmail();
        setDeveloperEmail(devEmail);
        setIsAuthorized(true);
      }
    };
    if (session) {
      checkAuth();
    }
  }, [session, router]);

  const fetchLogsAndStats = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [logsData, statsData] = await Promise.all([
        getLogs(severityFilter, activeTab),
        getLogStatistics()
      ]);
      setLogs(logsData || []);
      setStats(statsData);
    } catch (e) {
      console.error(e);
      toast.error("Failed to sync system telemetry", {
        description: "Could not retrieve live logs from the database."
      });
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [severityFilter, activeTab]);

  useEffect(() => {
    if (isAuthorized) {
      fetchLogsAndStats();
    }
  }, [fetchLogsAndStats, isAuthorized]);

  // Trigger Custom Confirmation Alert Box
  const promptClearLogs = (timeframe: LogClearTimeframe) => {
    if (timeframe === "MONTHLY") {
      setConfirmPrune({
        isOpen: true,
        timeframe: "MONTHLY",
        title: "Prune Monthly Telemetry Logs",
        description: `This will permanently delete all system audit logs older than 30 days (${stats.olderThanMonth} records eligible). Active logs will be retained.`,
        confirmText: `Prune ${stats.olderThanMonth} Records`
      });
    } else if (timeframe === "QUARTERLY") {
      setConfirmPrune({
        isOpen: true,
        timeframe: "QUARTERLY",
        title: "Prune Quarterly Telemetry Logs",
        description: `This will permanently delete all records older than 90 days (${stats.olderThanQuarter} records eligible) to optimize database capacity.`,
        confirmText: `Prune ${stats.olderThanQuarter} Records`
      });
    } else if (timeframe === "YEARLY") {
      setConfirmPrune({
        isOpen: true,
        timeframe: "YEARLY",
        title: "Prune Yearly Telemetry Logs",
        description: `This will permanently remove system event history older than 365 days (${stats.olderThanYear} records eligible).`,
        confirmText: `Prune ${stats.olderThanYear} Records`
      });
    } else if (timeframe === "WEEKLY") {
      setConfirmPrune({
        isOpen: true,
        timeframe: "WEEKLY",
        title: "Prune 7-Day Staging Logs",
        description: `This will permanently delete all logs older than 7 days (${stats.olderThanWeek} records eligible).`,
        confirmText: `Prune ${stats.olderThanWeek} Records`
      });
    } else if (timeframe === "ALL") {
      setConfirmPrune({
        isOpen: true,
        timeframe: "ALL",
        title: "⚠️ Emergency Database Purge: Delete All Logs",
        description: `CRITICAL ACTION: This will irreversibly purge ALL ${stats.totalLogs} system audit logs across the entire database. Are you completely sure you want to proceed?`,
        confirmText: `Permanently Delete All ${stats.totalLogs} Logs`
      });
    }
  };

  // Execute Pruning after confirmation via Custom Alert Box
  const handleExecutePrune = async () => {
    if (!confirmPrune.timeframe) return;
    const timeframe = confirmPrune.timeframe;
    setConfirmPrune(prev => ({ ...prev, isOpen: false }));

    setIsPruning(true);
    toast.loading("Applying retention policy...", { id: "prune-toast" });
    try {
      const result = await clearLogs(timeframe);
      if (result.success) {
        toast.success("Retention Cleanup Completed", {
          id: "prune-toast",
          description: `Successfully pruned ${result.count} logs from the database.`
        });
        await fetchLogsAndStats();
      } else {
        toast.error("Cleanup Operation Failed", {
          id: "prune-toast",
          description: result.error || "Failed to purge logs."
        });
      }
    } catch (err: any) {
      toast.error("An error occurred during pruning", {
        id: "prune-toast",
        description: err.message || "Database connection error."
      });
    } finally {
      setIsPruning(false);
    }
  };

  // Developer Threat Simulation Sandbox
  const handleSimulateAlert = async (type: 'BOT_DETECT' | 'FORM_COMPROMISE' | 'SUSPICIOUS' | 'RATE_LIMIT') => {
    toast.loading("Simulating security event...", { id: "sim-alert" });
    
    let message = "";
    if (type === "BOT_DETECT") {
      message = "Automated bot scraper detected probing /api/upload with rapid non-human signature.";
    } else if (type === "FORM_COMPROMISE") {
      message = "Contact/Enquiry honeypot triggered: Hidden anti-bot token tampered on admission lead capture.";
    } else if (type === "SUSPICIOUS") {
      message = "Suspicious unauthorized tenant route bypass attempt detected on /app/restricted-workspace.";
    } else {
      message = "Rate limit threshold breached: 120 requests/min from unrecognized IP origin.";
    }

    const res = await recordSecurityAlert(type, message, "DEV_SIMULATION_AGENT");
    if (res.success) {
      toast.success("Security Event Ingested", {
        id: "sim-alert",
        description: "New telemetry entry logged and available in live stream."
      });
      await fetchLogsAndStats(true);
    } else {
      toast.error("Simulation Failed", {
        id: "sim-alert",
        description: "Could not create simulation record in database."
      });
    }
  };

  // Filtered and Paginated Logs
  const filteredLogs = useMemo(() => {
    if (!debouncedSearch.trim()) return logs;
    const q = debouncedSearch.toLowerCase();
    return logs.filter((log) => 
      log.message?.toLowerCase().includes(q) ||
      log.module?.toLowerCase().includes(q) ||
      log.id?.toLowerCase().includes(q) ||
      log.user?.toLowerCase().includes(q) ||
      log.level?.toLowerCase().includes(q)
    );
  }, [logs, debouncedSearch]);

  const handleExportCSV = () => {
    if (filteredLogs.length === 0) {
      toast.info("No logs to export", {
        description: "There are no records matching your current filter criteria."
      });
      return;
    }
    const headers = ["ID", "Level", "Module", "Message", "User", "Timestamp"];
    const rows = filteredLogs.map(l => [
      l.id,
      l.level,
      l.module,
      `"${(l.message || "").replace(/"/g, '""')}"`,
      l.user || "SYSTEM",
      new Date(l.createdAt).toISOString()
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `developer_audit_logs_${activeTab.toLowerCase()}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV Export Generated", {
      description: `Successfully exported ${filteredLogs.length} audit records.`
    });
  };

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
    return <div className="p-6 text-center text-rose-500 font-semibold text-sm">Unauthorized Access. You do not have verified developer privileges to view this page.</div>;
  }

  // Navigation Tabs with Icons and Dynamic Counters
  const NAVIGATION_TABS: { id: ActiveTabType; label: string; icon: React.ElementType; badge?: number | string; badgeColor?: string }[] = [
    { 
      id: "ALL", 
      label: "All System Logs", 
      icon: Terminal, 
      badge: stats.totalLogs > 0 ? stats.totalLogs : undefined,
      badgeColor: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
    },
    { 
      id: "SECURITY", 
      label: "Bot & Threat Alerts", 
      icon: ShieldAlert, 
      badge: stats.securityAlertsCount > 0 ? stats.securityAlertsCount : undefined,
      badgeColor: "bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold"
    },
    { 
      id: "SUSPICIOUS", 
      label: "Suspicious Activity", 
      icon: Flame,
      badge: stats.suspiciousCount > 0 ? stats.suspiciousCount : undefined,
      badgeColor: "bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold"
    },
    { 
      id: "ERRORS", 
      label: "Critical & Errors", 
      icon: AlertTriangle, 
      badge: (stats.criticalCount + stats.errorCount) > 0 ? stats.criticalCount + stats.errorCount : undefined,
      badgeColor: "bg-purple-500/15 text-purple-600 dark:text-purple-400 font-bold"
    },
    { 
      id: "MAINTENANCE", 
      label: "Auto-Clean & Retention", 
      icon: Sparkles,
      badge: stats.olderThanMonth > 0 ? `${stats.olderThanMonth} cleanable` : "Optimal",
      badgeColor: stats.olderThanMonth > 0 ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 font-bold" : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold"
    }
  ];

  const logMetrics = [
    { title: "Total Event Stream", value: stats.totalLogs.toLocaleString(), icon: Terminal, color: "text-slate-500", bg: "bg-slate-500/10" },
    { title: "Threats & Bot Detect", value: stats.securityAlertsCount.toLocaleString(), icon: ShieldAlert, color: "text-rose-500", bg: "bg-rose-500/10" },
    { title: "Critical Exceptions", value: stats.criticalCount.toLocaleString(), icon: AlertOctagon, color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "Eligible for Pruning", value: stats.olderThanMonth.toLocaleString(), icon: Sparkles, color: "text-blue-500", bg: "bg-blue-500/10" },
  ];

  return (
    <TooltipProvider>
      <div className="space-y-4 sm:space-y-5 pb-8 w-full mx-auto">
        {/* Top Header */}
        <AdminPageHeader 
          title="Developer Console & System Telemetry" 
          description="Centralized infrastructure telemetry, automated bot threat detection, form protection, and log retention."
        >
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => setIsConfigOpen(true)}
              variant="outline"
              className="h-8 sm:h-9 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold gap-1.5 shadow-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-all"
            >
              <Sliders className="h-3.5 w-3.5 text-primary" />
              <span>Site Config</span>
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-none text-[8px] font-bold px-1 py-0 ml-0.5">
                DEV
              </Badge>
            </Button>

            <Button 
              onClick={() => {
                toast.loading("Connecting to live stream...", { id: "refresh-toast" });
                fetchLogsAndStats().then(() => {
                  toast.success("Telemetry Synced", {
                    id: "refresh-toast",
                    description: "Logs and telemetry metrics refreshed from database."
                  });
                });
              }} 
              disabled={isLoading}
              className="h-8 sm:h-9 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold gap-1.5 shadow-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
            >
              <RefreshCcw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
              {isLoading ? "Refreshing..." : "Live Stream"}
            </Button>
          </div>
        </AdminPageHeader>

        {/* Developer Site Configuration Modal */}
        <DeveloperSiteConfigModal 
          isOpen={isConfigOpen}
          onClose={setIsConfigOpen}
          developerEmail={developerEmail}
          isDeveloper={isDeveloperUser}
        />

        {/* Custom Confirmation Alert Dialog */}
        <ConfirmDialog
          open={confirmPrune.isOpen}
          onOpenChange={(open) => setConfirmPrune(prev => ({ ...prev, isOpen: open }))}
          title={confirmPrune.title}
          description={confirmPrune.description}
          onConfirm={handleExecutePrune}
          confirmText={confirmPrune.confirmText}
          destructive={true}
        />

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

        {/* Standardized Horizontal Navigation Tabs with Icons and Dynamic Badges */}
        <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-1.5 p-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-full">
          {NAVIGATION_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setCurrentPage(1);
                }}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium shrink-0 whitespace-nowrap transition-all",
                  isActive
                    ? "bg-slate-100 dark:bg-slate-800 text-primary dark:text-white font-semibold shadow-inner"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50"
                )}
              >
                <Icon className={cn("w-3.5 h-3.5 shrink-0", isActive ? "text-primary dark:text-white" : "text-slate-400")} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={cn(
                    "text-[10px] font-bold px-1.5 py-0.2 rounded-full leading-none ml-0.5",
                    tab.badgeColor || "bg-slate-200 text-slate-700"
                  )}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: AUTO-CLEAN & RETENTION PANEL */}
        {activeTab === "MAINTENANCE" ? (
          <div className="space-y-4">
            {/* Dynamic Retention Policies Card */}
            <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden bg-white dark:bg-slate-900">
              <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-emerald-500" />
                      Dynamic Log Retention & Pruning Policies
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500 mt-0.5">
                      Automatically or manually clean telemetry logs on monthly, quarterly, or yearly schedules.
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-none text-[10px] font-bold px-2 py-0.5 max-w-fit">
                    DATABASE SYNC ACTIVE
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Monthly Prune */}
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-blue-500" />
                          Monthly Cleaning
                        </span>
                        <Badge className="text-[9px] font-bold px-1.5 py-0.2 bg-blue-500/10 text-blue-600 border-none">
                          Keep 30 Days
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        Purges records older than 30 days. Recommended for high-velocity staging and production.
                      </p>
                      <div className="text-[10px] font-mono text-slate-400 pt-1">
                        Eligible logs: <strong className="text-slate-700 dark:text-slate-300">{stats.olderThanMonth}</strong>
                      </div>
                    </div>
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => promptClearLogs('MONTHLY')}
                      disabled={isPruning || stats.olderThanMonth === 0}
                      className="h-7 text-xs font-semibold w-full border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                    >
                      Prune Monthly Logs
                    </Button>
                  </div>

                  {/* Quarterly Prune */}
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-emerald-500" />
                          Quarterly Cleaning
                        </span>
                        <Badge className="text-[9px] font-bold px-1.5 py-0.2 bg-emerald-500/10 text-emerald-600 border-none">
                          Keep 90 Days
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        Retains one full fiscal quarter (90 days). Optimal balance between audit history and Neon storage.
                      </p>
                      <div className="text-[10px] font-mono text-slate-400 pt-1">
                        Eligible logs: <strong className="text-slate-700 dark:text-slate-300">{stats.olderThanQuarter}</strong>
                      </div>
                    </div>
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => promptClearLogs('QUARTERLY')}
                      disabled={isPruning || stats.olderThanQuarter === 0}
                      className="h-7 text-xs font-semibold w-full border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                    >
                      Prune Quarterly Logs
                    </Button>
                  </div>

                  {/* Yearly Prune */}
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-purple-500" />
                          Yearly Cleaning
                        </span>
                        <Badge className="text-[9px] font-bold px-1.5 py-0.2 bg-purple-500/10 text-purple-600 border-none">
                          Keep 365 Days
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        Retains one entire calendar year. Retains all regulatory records while dropping archaic history.
                      </p>
                      <div className="text-[10px] font-mono text-slate-400 pt-1">
                        Eligible logs: <strong className="text-slate-700 dark:text-slate-300">{stats.olderThanYear}</strong>
                      </div>
                    </div>
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => promptClearLogs('YEARLY')}
                      disabled={isPruning || stats.olderThanYear === 0}
                      className="h-7 text-xs font-semibold w-full border-purple-200 dark:border-purple-900 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40"
                    >
                      Prune Yearly Logs
                    </Button>
                  </div>
                </div>

                {/* Storage Health & Developer Emergency Flush */}
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-slate-500" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Storage Footprint & Database Health</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Oldest recorded event: <strong className="text-slate-800 dark:text-slate-200">{stats.oldestDate ? new Date(stats.oldestDate).toLocaleDateString() : "None"}</strong> • Total stored: <strong className="text-slate-800 dark:text-slate-200">{stats.totalLogs.toLocaleString()} records</strong>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => promptClearLogs('WEEKLY')}
                      disabled={isPruning || stats.olderThanWeek === 0}
                      className="h-7 text-xs font-semibold"
                    >
                      Clear 7-Day Logs
                    </Button>
                    <Button 
                      size="sm"
                      variant="destructive"
                      onClick={() => promptClearLogs('ALL')}
                      disabled={isPruning || stats.totalLogs === 0}
                      className="h-7 text-xs font-semibold gap-1.5"
                    >
                      <Trash2 className="h-3 w-3" />
                      Emergency Flush
                    </Button>
                  </div>
                </div>

                {/* Developer Alert Simulation Sandbox */}
                <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-600" />
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-300">
                      Developer Threat Simulation Sandbox
                    </span>
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-none text-[8px] font-bold px-1.5 py-0.2">
                      TESTING
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Verify bot detection, contact/enquiry honeypot triggers, and suspicious activity monitors in real-time:
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleSimulateAlert('BOT_DETECT')} 
                      className="h-7 text-xs font-semibold gap-1.5 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <Bot className="h-3 w-3 text-rose-500" />
                      Simulate Bot Scraper Alert
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleSimulateAlert('FORM_COMPROMISE')} 
                      className="h-7 text-xs font-semibold gap-1.5 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <ShieldAlert className="h-3 w-3 text-amber-500" />
                      Simulate Form Compromise Alert
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleSimulateAlert('SUSPICIOUS')} 
                      className="h-7 text-xs font-semibold gap-1.5 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <AlertOctagon className="h-3 w-3 text-purple-500" />
                      Simulate Suspicious Tenant Access
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* TAB 2, 3, 4: LOG STREAM & MONITORING TABLE */
          <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden bg-white dark:bg-slate-900">
            <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                {/* Search Bar */}
                <div className="relative w-full md:max-w-[300px] group">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  <Input 
                    placeholder="Search logs, modules, IP, or users..." 
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="h-8 sm:h-9 pl-8 pr-3 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 rounded-lg font-normal text-[11px] sm:text-xs placeholder:text-[11px] sm:placeholder:text-xs placeholder:text-slate-400"
                  />
                </div>

                {/* Sub-Filters: Severity Levels */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {["ALL", "INFO", "WARNING", "ERROR", "CRITICAL"].map((sev) => (
                    <button
                      key={sev}
                      onClick={() => {
                        setSeverityFilter(sev);
                        setCurrentPage(1);
                      }}
                      className={cn(
                        "h-7 px-2.5 rounded-md text-[11px] font-semibold transition-all shrink-0",
                        severityFilter === sev
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      )}
                    >
                      {sev === "ALL" ? "All Levels" : sev}
                    </button>
                  ))}
                </div>

                {/* Actions: Export & Prune */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    onClick={handleExportCSV}
                    variant="outline"
                    size="sm"
                    className="h-8 sm:h-9 px-3 rounded-lg text-xs font-semibold gap-1.5 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Export CSV</span>
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap text-xs h-8 sm:h-9 px-3 rounded-lg gap-1.5 font-semibold border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all focus:outline-none">
                      <Trash2 className="h-3.5 w-3.5" />
                      Prune
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-xl p-1 shadow-lg border-slate-200 dark:border-slate-800">
                      <DropdownMenuItem onClick={() => promptClearLogs('MONTHLY')} className="cursor-pointer text-xs py-2 px-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                        Monthly (Older Than 30 Days)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => promptClearLogs('QUARTERLY')} className="cursor-pointer text-xs py-2 px-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                        Quarterly (Older Than 90 Days)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => promptClearLogs('YEARLY')} className="cursor-pointer text-xs py-2 px-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                        Yearly (Older Than 365 Days)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => promptClearLogs('WEEKLY')} className="cursor-pointer text-xs py-2 px-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                        Weekly (Older Than 7 Days)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => promptClearLogs('ALL')} className="cursor-pointer text-xs py-2 px-2.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-semibold">
                        Emergency Flush (All Logs)
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
                    <TableHead className="w-[130px] px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Module / Type</TableHead>
                    <TableHead className="px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Telemetry & Event Description</TableHead>
                    <TableHead className="w-[130px] px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Origin / Actor</TableHead>
                    <TableHead className="text-right px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 w-[160px]">Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-xs text-slate-500 font-medium">
                        Loading developer telemetry logs...
                      </TableCell>
                    </TableRow>
                  ) : paginatedLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-xs text-slate-500 font-medium">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <CheckCircle2 className="h-8 w-8 text-emerald-500/70" />
                          <p className="font-semibold text-slate-700 dark:text-slate-300">No anomalous events recorded</p>
                          <p className="text-[11px] text-slate-400">
                            {activeTab === "SECURITY" 
                              ? "No bot attacks or form compromises detected. System health is optimal."
                              : "No logs found matching your selected filters."}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedLogs.map((log) => (
                      <TableRow 
                        key={log.id} 
                        className={cn(
                          "group hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors border-b border-slate-100 dark:border-slate-800/60 last:border-none",
                          log.level === "CRITICAL" && "bg-rose-500/[0.02]"
                        )}
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
                              "bg-purple-500/10 text-purple-600 dark:text-purple-400 animate-pulse font-extrabold"
                            )}
                          >
                            {log.level === "CRITICAL" && <AlertTriangle className="h-2.5 w-2.5 mr-1" />}
                            {log.level === "INFO" && <Info className="h-2.5 w-2.5 mr-1" />}
                            {log.level}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-3.5 py-2.5">
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            {(log.module?.includes("BOT") || log.module?.includes("SECURITY") || log.module?.includes("COMPROMISE")) && (
                              <ShieldAlert className="h-3 w-3 text-rose-500 shrink-0" />
                            )}
                            {log.module}
                          </span>
                        </TableCell>
                        <TableCell className="px-3.5 py-2.5 max-w-[360px]">
                          <Tooltip>
                            <TooltipTrigger className="text-xs text-slate-800 dark:text-slate-200 truncate cursor-default block text-left w-full outline-none font-medium">
                              {log.message}
                            </TooltipTrigger>
                            <TooltipContent className="max-w-md text-xs">
                              {log.message}
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell className="px-3.5 py-2.5">
                          <span className="text-xs font-medium text-slate-500 truncate block max-w-[130px]">
                            {log.user || "SYSTEM"}
                          </span>
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
        )}
      </div>
    </TooltipProvider>
  );
}
