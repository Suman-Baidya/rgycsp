"use client";

import React, { useState, useMemo, useTransition } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Users,
  Globe,
  TrendingUp,
  TrendingDown,
  PhoneCall,
  MessageSquare,
  Download,
  Building2,
  Trash2,
  AlertTriangle,
  HardDrive,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Smartphone,
  Layers,
  Search,
  Filter,
  RefreshCw,
  Clock,
  Laptop,
  Compass,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/dashboard/StatCard";
import { AdminPageHeader } from "@/components/layout/AdminPageHeader";
import { InstituteSearchPicker } from "@/components/analytics/InstituteSearchPicker";
import {
  getSuperAdminAnalytics,
  exportAnalyticsToExcel,
  updateLeadStatus,
  purgeOldAnalyticsLogs,
} from "@/app/actions/analytics";
import { toast } from "sonner";
import Link from "next/link";

interface LeadItem {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  source: string;
  intent: string | null;
  status: string;
  notes: string | null;
  workspaceName: string;
  workspaceSubdomain: string | null;
  createdAt: string;
}

interface TopFranchise {
  workspaceId: string | null;
  name: string;
  subdomain: string;
  centerCode: string;
  state: string;
  views: number;
}

interface WorkspaceOption {
  id: string;
  name: string;
  subdomain: string;
  centerCode: string | null;
  state: string | null;
}

interface SuperAdminAnalyticsProps {
  initialData: {
    totalViews: number;
    uniqueVisitors: number;
    newVisitors: number;
    returningVisitors: number;
    totalLeads: number;
    bounceRate?: number;
    conversionRate?: number;
    avgPagesPerSession?: number;
    trends?: {
      views: { change: string; trend: "up" | "down" };
      visitors: { change: string; trend: "up" | "down" };
      returning: { change: string; trend: "up" | "down" };
      leads: { change: string; trend: "up" | "down" };
    };
    trafficSources?: { source: string; count: number }[];
    hourlyActivity?: { hour: string; rawHour: number; views: number }[];
    allWorkspaces?: WorkspaceOption[];
    recentLeads: LeadItem[];
    topPages: { path: string; views: number }[];
    devices: { device: string; count: number }[];
    browsers?: { browser: string; count: number }[];
    os?: { os: string; count: number }[];
    cities: { city: string; state: string; count: number }[];
    topFranchises: TopFranchise[];
    chartData: { date: string; views: number }[];
    storageStats: {
      totalVisitsCount: number;
      totalSessionsCount: number;
      totalLeadsCount: number;
      estimatedSizeKB: number;
    };
  };
}

export function SuperAdminAnalyticsClient({ initialData }: SuperAdminAnalyticsProps) {
  const [dateRange, setDateRange] = useState("30d");
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>("all");
  const [data, setData] = useState(initialData);
  const [leads, setLeads] = useState<LeadItem[]>(initialData.recentLeads);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 250);
  const [leadStatusFilter, setLeadStatusFilter] = useState("ALL");
  const [isPending, startTransition] = useTransition();
  const [isExporting, startExport] = useTransition();
  const [isPurging, startPurge] = useTransition();
  const [retentionDays, setRetentionDays] = useState(365);
  const [showPurgeModal, setShowPurgeModal] = useState(false);

  // Dynamic Date Range switching
  const handleDateRangeChange = (range: string) => {
    setDateRange(range);
    startTransition(async () => {
      try {
        const freshData = await getSuperAdminAnalytics({
          dateRange: range,
          workspaceId: selectedWorkspaceId === "all" ? undefined : selectedWorkspaceId,
        });
        setData(freshData);
        setLeads(freshData.recentLeads);
        toast.success(`Loaded analytics for ${range === "today" ? "Today" : range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : range === "90d" ? "3 Months" : "1 Year"}`);
      } catch (e: any) {
        toast.error(e?.message || "Failed to update date range");
      }
    });
  };

  // Dynamic Franchise Filter switching
  const handleWorkspaceFilterChange = (wsId: string) => {
    setSelectedWorkspaceId(wsId);
    startTransition(async () => {
      try {
        const freshData = await getSuperAdminAnalytics({
          dateRange,
          workspaceId: wsId === "all" ? undefined : wsId,
        });
        setData(freshData);
        setLeads(freshData.recentLeads);
        toast.success(wsId === "all" ? "Switched to Global Network view" : "Filtered by selected franchise");
      } catch (e: any) {
        toast.error(e?.message || "Failed to filter franchise");
      }
    });
  };

  // Live Refresh button
  const handleRefresh = () => {
    startTransition(async () => {
      try {
        const freshData = await getSuperAdminAnalytics({
          dateRange,
          workspaceId: selectedWorkspaceId === "all" ? undefined : selectedWorkspaceId,
        });
        setData(freshData);
        setLeads(freshData.recentLeads);
        toast.success("Live analytics data refreshed successfully");
      } catch (e: any) {
        toast.error(e?.message || "Failed to refresh data");
      }
    });
  };

  // Dynamic Excel Export
  const handleExport = () => {
    startExport(async () => {
      try {
        const res = await exportAnalyticsToExcel({
          dateRange,
          workspaceId: selectedWorkspaceId === "all" ? undefined : selectedWorkspaceId,
        });
        if (res.success && res.base64) {
          const byteCharacters = atob(res.base64);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = res.filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          toast.success("Global Analytics Excel report downloaded!");
        } else {
          toast.error("Failed to generate Excel report");
        }
      } catch (e: any) {
        toast.error(e?.message || "Error exporting analytics");
      }
    });
  };

  // Live Lead Status advancement
  const handleStatusChange = async (leadId: string, currentStatus: string) => {
    const nextStatus =
      currentStatus === "NEW" ? "CONTACTED" : currentStatus === "CONTACTED" ? "CONVERTED" : "NEW";
    try {
      await updateLeadStatus(leadId, nextStatus);
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status: nextStatus } : l))
      );
      toast.success(`Lead status updated to ${nextStatus}`);
    } catch (e) {
      toast.error("Failed to update status");
    }
  };

  // Retention Purge
  const handlePurge = () => {
    startPurge(async () => {
      try {
        const res = await purgeOldAnalyticsLogs(retentionDays);
        if (res.success) {
          toast.success(res.message);
          setShowPurgeModal(false);
          setData((prev) => ({
            ...prev,
            storageStats: {
              ...prev.storageStats,
              totalVisitsCount: Math.max(0, prev.storageStats.totalVisitsCount - res.deletedVisitsCount),
              totalSessionsCount: Math.max(0, prev.storageStats.totalSessionsCount - res.deletedSessionsCount),
              estimatedSizeKB: Math.max(
                50,
                prev.storageStats.estimatedSizeKB - Math.round(res.deletedVisitsCount * 0.3)
              ),
            },
          }));
        }
      } catch (e: any) {
        toast.error(e?.message || "Error pruning analytics logs");
      }
    });
  };

  // Filtered Leads (debounced + memoized)
  const filteredLeads = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return leads.filter((lead) => {
      if (leadStatusFilter !== "ALL" && lead.status !== leadStatusFilter) return false;
      if (!q) return true;
      return (
        lead.name.toLowerCase().includes(q) ||
        (lead.phone && lead.phone.includes(q)) ||
        lead.workspaceName.toLowerCase().includes(q) ||
        (lead.intent && lead.intent.toLowerCase().includes(q))
      );
    });
  }, [leads, debouncedSearch, leadStatusFilter]);

  const storageDisplayMB = (data.storageStats.estimatedSizeKB / 1024).toFixed(2);

  // Peak activity calculation (memoized)
  const hourlyData = data.hourlyActivity || [];
  const peakHourItem = useMemo(
    () => (hourlyData.length > 0 ? [...hourlyData].sort((a, b) => b.views - a.views)[0] : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data.hourlyActivity]
  );

  return (
    <div className={`space-y-4 sm:space-y-5 pb-8 w-full mx-auto transition-opacity duration-200 ${isPending ? "opacity-75 pointer-events-none" : "opacity-100"}`}>
      <AdminPageHeader
        title="Network Analytics"
        description="Global traffic, center hotspots, and student leads."
      >
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto shrink-0">
          {/* Searchable Institute Picker (Handles 500-1000 centers) */}
          {data.allWorkspaces && data.allWorkspaces.length > 0 && (
            <InstituteSearchPicker
              workspaces={data.allWorkspaces}
              selectedId={selectedWorkspaceId}
              onSelect={handleWorkspaceFilterChange}
              disabled={isPending}
            />
          )}

          <div className="flex items-center justify-between sm:justify-start gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {/* Time range pill selector */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs shrink-0">
              {[
                { id: "today", label: "Today" },
                { id: "7d", label: "7D" },
                { id: "30d", label: "30D" },
                { id: "90d", label: "90D" },
                { id: "1y", label: "1Y" },
              ].map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleDateRangeChange(r.id)}
                  className={`px-2 sm:px-2.5 py-1 rounded-md font-semibold transition-all ${
                    dateRange === r.id
                      ? "bg-white dark:bg-slate-900 text-primary shadow-xs"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Refresh Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isPending}
              title="Refresh analytics data"
              className="h-8 sm:h-9 w-8 sm:w-9 p-0 rounded-lg border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 shrink-0"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isPending ? "animate-spin text-primary" : "text-slate-500"}`} />
            </Button>

            {/* Excel Export Button */}
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="h-8 sm:h-9 px-3 rounded-lg text-xs font-semibold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs shrink-0"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Excel</span> Export
            </Button>
          </div>
        </div>
      </AdminPageHeader>

      {/* Primary KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="TOTAL NETWORK VIEWS"
          value={data.totalViews.toLocaleString()}
          change={data.trends?.views?.change || "+0%"}
          trend={data.trends?.views?.trend || "up"}
          description="Visits vs previous period"
          icon={Globe}
        />
        <StatCard
          title="UNIQUE PROSPECTIVE VISITORS"
          value={data.uniqueVisitors.toLocaleString()}
          change={data.trends?.visitors?.change || "+0%"}
          trend={data.trends?.visitors?.trend || "up"}
          description="Distinct visitor sessions"
          icon={Users}
        />
        <StatCard
          title="CAPTURED LEADS & INQUIRIES"
          value={data.totalLeads.toLocaleString()}
          change={data.trends?.leads?.change || "+0%"}
          trend={data.trends?.leads?.trend || "up"}
          description="WhatsApp & form inquiries"
          icon={Sparkles}
        />
        <StatCard
          title="DATABASE LOG FOOTPRINT"
          value={`${storageDisplayMB} MB`}
          change={`${(data.storageStats.totalVisitsCount + data.storageStats.totalSessionsCount).toLocaleString()} rows`}
          trend="up"
          description="Raw clickstream stored"
          icon={HardDrive}
        />
      </div>

      {/* Advanced Performance & User Behavior Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 shrink-0">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Conversion Rate</span>
            <span className="font-bold text-sm text-slate-900 dark:text-white">
              {data.conversionRate !== undefined ? `${data.conversionRate}%` : "0%"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 shrink-0">
            <Compass className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Bounce Rate</span>
            <span className="font-bold text-sm text-slate-900 dark:text-white">
              {data.bounceRate !== undefined ? `${data.bounceRate}%` : "0%"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 shrink-0">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Avg Pages / Session</span>
            <span className="font-bold text-sm text-slate-900 dark:text-white">
              {data.avgPagesPerSession !== undefined ? data.avgPagesPerSession : 1.0}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 shrink-0">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Returning Visitors</span>
            <span className="font-bold text-sm text-slate-900 dark:text-white">
              {data.returningVisitors.toLocaleString()} ({data.trends?.returning?.change || "+0%"})
            </span>
          </div>
        </div>
      </div>

      {/* Visual Charts Grid: Daily Traffic Trend & 24h Peak Activity Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {/* Network Browsing Traffic Volume */}
        <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden bg-white dark:bg-slate-900">
          <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Network Browsing Traffic
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Daily visitor views across the platform
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 dark:bg-blue-950/30 border-blue-200">
              {selectedWorkspaceId === "all" ? "Global Network" : "Single Center"}
            </Badge>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-[230px] sm:h-[250px] w-full">
              {data.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="globalTraffic" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tickMargin={6}
                      tick={{ fontSize: 9, fill: "#94a3b8" }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      allowDecimals={false}
                      tick={{ fontSize: 9, fill: "#94a3b8" }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "#0f172a", 
                        borderColor: "#334155", 
                        borderRadius: 8, 
                        color: "#fff", 
                        fontSize: 12 
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="views" 
                      stroke="#4f46e5" 
                      strokeWidth={2.5} 
                      fill="url(#globalTraffic)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                  <Globe className="h-8 w-8 text-slate-300 mb-1" />
                  No traffic recorded in this time range.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 24-Hour Peak Activity Distribution */}
        <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden bg-white dark:bg-slate-900">
          <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-amber-500" />
                Hourly Peak User Activity
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Visitor distribution by hour of day (IST)
              </CardDescription>
            </div>
            {peakHourItem && peakHourItem.views > 0 && (
              <Badge className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 border border-amber-200">
                Peak: {peakHourItem.hour}
              </Badge>
            )}
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-[230px] sm:h-[250px] w-full">
              {hourlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                    <XAxis 
                      dataKey="hour" 
                      axisLine={false} 
                      tickLine={false} 
                      tickMargin={6}
                      interval={2}
                      tick={{ fontSize: 8.5, fill: "#94a3b8" }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      allowDecimals={false}
                      tick={{ fontSize: 9, fill: "#94a3b8" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#334155",
                        borderRadius: 8,
                        color: "#fff",
                        fontSize: 12,
                      }}
                      formatter={(val: any) => [`${val} visits`, "Traffic"]}
                    />
                    <Bar dataKey="views" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                  <Clock className="h-8 w-8 text-slate-300 mb-1" />
                  Hourly activity will graph here as visits are logged.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Acquisition, Hotspots & Technology Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Traffic Acquisition & Referrers */}
        <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden bg-white dark:bg-slate-900">
          <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Compass className="h-4 w-4 text-indigo-600" />
              Traffic Acquisition Channels
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Where prospective students arrive from
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-3.5 space-y-2">
            {data.trafficSources && data.trafficSources.length > 0 ? (
              data.trafficSources.map((source, idx) => {
                const total = data.trafficSources!.reduce((sum, s) => sum + s.count, 0);
                const pct = total > 0 ? Math.round((source.count / total) * 100) : 0;
                return (
                  <div key={source.source + idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {source.source}
                      </span>
                      <span className="font-bold text-slate-500">
                        {source.count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 text-xs text-slate-400">
                Acquisition channels will appear as visits are recorded.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Visited Franchise Landing Pages */}
        <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden bg-white dark:bg-slate-900">
          <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="h-4 w-4 text-indigo-600" />
                Top Visited Franchise Portals
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Franchises capturing the highest visitor interest
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-3.5 space-y-2">
            {data.topFranchises.length > 0 ? (
              data.topFranchises.slice(0, 5).map((franchise, idx) => (
                <div
                  key={franchise.name + idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {franchise.name}
                      </span>
                      <Badge variant="outline" className="text-[9px] font-bold text-indigo-600 border-indigo-200">
                        {franchise.centerCode}
                      </Badge>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {franchise.state} • subdomain: {franchise.subdomain}
                    </span>
                  </div>
                  <Badge className="bg-indigo-600/10 text-indigo-700 dark:text-indigo-300 font-bold text-xs px-2 py-0.5 border-none shrink-0">
                    {franchise.views} visits
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-xs text-slate-400">
                Franchise landing page visits will rank here.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Technology & Browsing Environment Matrix */}
        <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden bg-white dark:bg-slate-900">
          <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Laptop className="h-4 w-4 text-indigo-600" />
              Technology & Platform Breakdown
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Devices, operating systems, and browsers
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-3.5 space-y-3">
            {/* Devices */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Device Distribution
              </span>
              <div className="grid grid-cols-3 gap-1.5 text-center">
                {["Mobile", "Desktop", "Tablet"].map((dev) => {
                  const match = data.devices.find((d) => d.device.toLowerCase() === dev.toLowerCase());
                  const count = match ? match.count : 0;
                  const total = data.devices.reduce((acc, curr) => acc + curr.count, 0);
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={dev} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-[10px] font-semibold text-slate-500 block">{dev}</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Browsers & OS pills */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Top Browsers
              </span>
              <div className="flex flex-wrap gap-1">
                {data.browsers && data.browsers.length > 0 ? (
                  data.browsers.slice(0, 4).map((b) => (
                    <Badge key={b.browser} variant="outline" className="text-[10px] font-semibold py-0.5 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                      {b.browser}: {b.count}
                    </Badge>
                  ))
                ) : (
                  <span className="text-[10px] text-slate-400">No browser logs yet</span>
                )}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Operating Systems
              </span>
              <div className="flex flex-wrap gap-1">
                {data.os && data.os.length > 0 ? (
                  data.os.slice(0, 4).map((o) => (
                    <Badge key={o.os} variant="outline" className="text-[10px] font-semibold py-0.5 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                      {o.os}: {o.count}
                    </Badge>
                  ))
                ) : (
                  <span className="text-[10px] text-slate-400">No OS logs yet</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Pages / Course Hotspots */}
      <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden bg-white dark:bg-slate-900">
        <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-600" />
              Most Visited URLs & Course Hotspots
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              The specific pages and courses prospective students are viewing
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {data.topPages.length > 0 ? (
              data.topPages.slice(0, 9).map((page, idx) => (
                <div
                  key={page.path + idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs"
                >
                  <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 truncate max-w-[200px]" title={page.path}>
                    {page.path}
                  </span>
                  <Badge className="bg-slate-200/80 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-[10px] font-bold border-none shrink-0">
                    {page.views} views
                  </Badge>
                </div>
              ))
            ) : (
              <div className="col-span-full py-6 text-center text-xs text-slate-400">
                Page clickstreams will populate here as users navigate.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Captured Prospective Leads CRM Table */}
      <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden bg-white dark:bg-slate-900">
        <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              Real-Time Prospective Student Leads ({filteredLeads.length})
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Inquiries captured via WhatsApp, Call, and Course Interest actions
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Tabs */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px]">
              {["ALL", "NEW", "CONTACTED", "CONVERTED"].map((st) => (
                <button
                  key={st}
                  onClick={() => setLeadStatusFilter(st)}
                  className={`px-2 py-1 rounded-md font-semibold transition-all ${
                    leadStatusFilter === st
                      ? "bg-white dark:bg-slate-900 text-primary shadow-xs"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-56">
              <Search className="absolute inset-y-0 left-2.5 my-auto h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Search name, phone, center..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredLeads.length > 0 ? (
              filteredLeads.map((lead) => {
                const statusColor =
                  lead.status === "CONVERTED"
                    ? "border-emerald-500 bg-emerald-50/20"
                    : lead.status === "CONTACTED"
                    ? "border-blue-500 bg-blue-50/20"
                    : "border-amber-500 bg-amber-50/20";

                const cleanPhone = lead.phone ? lead.phone.replace(/[^0-9]/g, "") : "";

                return (
                  <div
                    key={lead.id}
                    className={`flex flex-col lg:flex-row items-start lg:items-center justify-between p-3 sm:p-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all gap-3 sm:gap-4 border-l-[3px] ${statusColor}`}
                  >
                    {/* Lead info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                        {lead.name ? lead.name.charAt(0).toUpperCase() : "S"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">
                            {lead.name || "Prospective Student"}
                          </h4>
                          <Badge
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded border-none ${
                              lead.status === "CONVERTED"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                                : lead.status === "CONTACTED"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                            }`}
                          >
                            {lead.status}
                          </Badge>
                        </div>
                        <p className="text-[10px] font-medium text-slate-500 mt-0.5">
                          {lead.intent || "Website inquiry"} • Center:{" "}
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {lead.workspaceName}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Metadata & Actions */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto justify-between lg:justify-end">
                      <div className="text-left text-xs">
                        <span className="text-[10px] text-slate-400 block">
                          {new Date(lead.createdAt).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                          Via {lead.source.replace("_", " ")}
                        </span>
                      </div>

                      {/* WhatsApp Button */}
                      {cleanPhone && (
                        <a
                          href={`https://wa.me/91${cleanPhone}?text=Hello!%20Thank%20you%20for%20contacting%20RGYCSP%20Edu%20Hub.%20How%20can%20we%20assist%20you%20with%20your%20course%20enrollment?`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Button
                            size="sm"
                            className="h-7 sm:h-8 px-2.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            WhatsApp
                          </Button>
                        </a>
                      )}

                      {/* Phone Call */}
                      {lead.phone && (
                        <a href={`tel:${lead.phone}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 sm:h-8 px-2.5 rounded-lg text-xs font-semibold border-slate-300 dark:border-slate-700 gap-1"
                          >
                            <PhoneCall className="h-3.5 w-3.5 text-blue-600" />
                            Call
                          </Button>
                        </a>
                      )}

                      {/* Status advancement button */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStatusChange(lead.id, lead.status)}
                        className="h-7 sm:h-8 px-2 rounded-lg text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
                        title="Click to advance status"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        Next Status
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">
                No captured student leads found for this filter. Leads appear automatically when prospective students click WhatsApp or submit inquiry forms.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Yearly Data Clearance & Storage Maintenance Card */}
      <Card className="border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden bg-slate-50/50 dark:bg-slate-900/50">
        <CardHeader className="p-3.5 sm:p-4 border-b border-slate-200/60 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <HardDrive className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Yearly Data Clearance & Retention Engine
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Maintain optimal PostgreSQL database performance by pruning old browsing clickstreams while preserving captured leads
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="h-8 text-xs font-semibold gap-1 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
            >
              <Download className="h-3.5 w-3.5" />
              Download Backup
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowPurgeModal(true)}
              className="h-8 text-xs font-semibold gap-1 bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear Old Logs
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
            <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">All-Time Page Visits</span>
            <span className="text-base font-bold text-slate-900 dark:text-white mt-0.5 block">
              {data.storageStats.totalVisitsCount.toLocaleString()} records
            </span>
          </div>
          <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
            <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">All-Time Visitor Sessions</span>
            <span className="text-base font-bold text-slate-900 dark:text-white mt-0.5 block">
              {data.storageStats.totalSessionsCount.toLocaleString()} records
            </span>
          </div>
          <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
            <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Estimated Table Footprint</span>
            <span className="text-base font-bold text-emerald-600 mt-0.5 block">
              ~{storageDisplayMB} MB (Ultra Light)
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Modal for Pruning */}
      {showPurgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="h-10 w-10 rounded-xl bg-red-100 dark:bg-red-950/50 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Confirm Data Clearance</h3>
                <p className="text-xs text-slate-500">Permanently delete raw page visit logs older than threshold</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
              <p>
                • <strong>Preserved Data:</strong> All captured student contact leads, phone numbers, and inquiry forms are <strong>NOT</strong> deleted.
              </p>
              <p>
                • <strong>Deleted Data:</strong> Raw page visit clickstreams older than the chosen cutoff date.
              </p>
              <div className="pt-2">
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Retention Window:
                </label>
                <select
                  value={retentionDays}
                  onChange={(e) => setRetentionDays(Number(e.target.value))}
                  className="w-full h-8 px-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                >
                  <option value={365}>Older than 1 Year (365 Days) - Recommended</option>
                  <option value={180}>Older than 6 Months (180 Days)</option>
                  <option value={90}>Older than 3 Months (90 Days)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPurgeModal(false)}
                className="h-8 text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={isPurging}
                onClick={handlePurge}
                className="h-8 text-xs font-semibold bg-red-600 hover:bg-red-700"
              >
                {isPurging ? "Pruning..." : "Proceed with Clearance"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
