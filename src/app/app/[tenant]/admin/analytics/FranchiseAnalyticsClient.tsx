"use client";

import React, { useState, useMemo, useTransition } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Users,
  Globe,
  TrendingUp,
  PhoneCall,
  MessageSquare,
  Download,
  ExternalLink,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  ArrowUpRight,
  Filter,
  Search,
  RefreshCw,
  Clock,
  Compass,
  Laptop,
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
import {
  getFranchiseAnalytics,
  exportAnalyticsToExcel,
  updateLeadStatus,
} from "@/app/actions/analytics";
import { toast } from "sonner";

interface LeadItem {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  source: string;
  intent: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
}

interface PageItem {
  path: string;
  views: number;
}

interface DeviceItem {
  device: string;
  count: number;
}

interface ChartItem {
  date: string;
  views: number;
}

interface FranchiseAnalyticsProps {
  workspace: {
    id: string;
    name: string;
    subdomain: string;
    centerCode: string | null;
  };
  initialData: {
    totalViews: number;
    uniqueVisitors: number;
    newVisitors: number;
    returningVisitors?: number;
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
    topPages: PageItem[];
    devices: DeviceItem[];
    browsers?: { browser: string; count: number }[];
    os?: { os: string; count: number }[];
    leads: LeadItem[];
    chartData: ChartItem[];
  };
}

export function FranchiseAnalyticsClient({ workspace, initialData }: FranchiseAnalyticsProps) {
  const [dateRange, setDateRange] = useState("30d");
  const [data, setData] = useState(initialData);
  const [leads, setLeads] = useState<LeadItem[]>(initialData.leads);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 250);
  const [leadStatusFilter, setLeadStatusFilter] = useState("ALL");
  const [isPending, startTransition] = useTransition();
  const [isExporting, startExport] = useTransition();

  // Dynamic Date Range switching
  const handleDateRangeChange = (range: string) => {
    setDateRange(range);
    startTransition(async () => {
      try {
        const freshData = await getFranchiseAnalytics(workspace.subdomain || workspace.id, {
          dateRange: range,
        });
        setData(freshData);
        setLeads(freshData.leads);
        toast.success(`Updated analytics for ${range === "today" ? "Today" : range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : range === "90d" ? "3 Months" : "1 Year"}`);
      } catch (e: any) {
        toast.error(e?.message || "Failed to fetch analytics for selected range");
      }
    });
  };

  // Live Refresh
  const handleRefresh = () => {
    startTransition(async () => {
      try {
        const freshData = await getFranchiseAnalytics(workspace.subdomain || workspace.id, {
          dateRange,
        });
        setData(freshData);
        setLeads(freshData.leads);
        toast.success("Live visitor data refreshed");
      } catch (e: any) {
        toast.error("Failed to refresh analytics");
      }
    });
  };

  // Dynamic Excel Export
  const handleExport = () => {
    startExport(async () => {
      try {
        const res = await exportAnalyticsToExcel({ workspaceId: workspace.id, dateRange });
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
          toast.success("Analytics Excel report downloaded successfully!");
        } else {
          toast.error("Failed to generate Excel report");
        }
      } catch (e: any) {
        toast.error(e?.message || "Error exporting analytics");
      }
    });
  };

  // Live Lead Status update
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

  // Filtered Leads (debounced + memoized)
  const filteredLeads = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return leads.filter((lead) => {
      if (leadStatusFilter !== "ALL" && lead.status !== leadStatusFilter) return false;
      if (!q) return true;
      return (
        lead.name.toLowerCase().includes(q) ||
        (lead.phone && lead.phone.includes(q)) ||
        (lead.intent && lead.intent.toLowerCase().includes(q))
      );
    });
  }, [leads, debouncedSearch, leadStatusFilter]);

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
        title="Visitor Analytics"
        description="Live traffic, peak hours, and prospective student inquiries."
      >
        <div className="flex items-center justify-between sm:justify-start gap-1.5 sm:gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar py-0.5 shrink-0">
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

          <div className="flex items-center gap-1.5 shrink-0">
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

      {/* Metric / Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="TOTAL LANDING VIEWS"
          value={data.totalViews.toLocaleString()}
          change={data.trends?.views?.change || "+0%"}
          trend={data.trends?.views?.trend || "up"}
          description="Visits vs previous period"
          icon={Globe}
        />
        <StatCard
          title="UNIQUE VISITORS"
          value={data.uniqueVisitors.toLocaleString()}
          change={data.trends?.visitors?.change || "+0%"}
          trend={data.trends?.visitors?.trend || "up"}
          description="Prospective student sessions"
          icon={Users}
        />
        <StatCard
          title="CAPTURED LEADS"
          value={data.totalLeads.toLocaleString()}
          change={data.trends?.leads?.change || "+0%"}
          trend={data.trends?.leads?.trend || "up"}
          description="WhatsApp & phone inquiries"
          icon={Sparkles}
        />
        <StatCard
          title="RETURNING VISITORS"
          value={data.returningVisitors !== undefined ? data.returningVisitors.toLocaleString() : (data.uniqueVisitors - data.newVisitors).toLocaleString()}
          change={data.trends?.returning?.change || "+0%"}
          trend={data.trends?.returning?.trend || "up"}
          description="Repeat student inquiries"
          icon={TrendingUp}
        />
      </div>

      {/* Advanced Performance & User Behavior Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 shrink-0">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Lead Conversion</span>
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
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Avg Pages / Visit</span>
            <span className="font-bold text-sm text-slate-900 dark:text-white">
              {data.avgPagesPerSession !== undefined ? data.avgPagesPerSession : 1.0}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 shrink-0">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Peak Traffic</span>
            <span className="font-bold text-sm text-slate-900 dark:text-white">
              {peakHourItem && peakHourItem.views > 0 ? peakHourItem.hour : "Everyday"}
            </span>
          </div>
        </div>
      </div>

      {/* Visual Charts Grid: Daily Visits Trend & Hourly Peak Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {/* Visitor Traffic Trend */}
        <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden bg-white dark:bg-slate-900">
          <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Daily Visitor Traffic
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Visitor volume on your franchise landing pages
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200">
              {workspace.name}
            </Badge>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-[230px] sm:h-[250px] w-full">
              {data.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="trafficGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
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
                      stroke="#6366f1" 
                      strokeWidth={2.5} 
                      fill="url(#trafficGrad)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                  <Globe className="h-8 w-8 text-slate-300 mb-1" />
                  Traffic trend will appear as prospective students visit your page.
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
                Peak Student Activity Hours
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                When students actively browse your institute page (IST)
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
                        fontSize: 12 
                      }}
                      formatter={(val: any) => [`${val} visits`, "Visits"]}
                    />
                    <Bar dataKey="views" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                  <Clock className="h-8 w-8 text-slate-300 mb-1" />
                  Hourly activity will graph here as visitors browse your pages.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Acquisition & Technology Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {/* Traffic Sources & Referrers */}
        <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden bg-white dark:bg-slate-900">
          <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Compass className="h-4 w-4 text-indigo-600" />
              Traffic Acquisition Channels
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              How students discover your franchise portal
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
                Traffic channels will show where student visits originate.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Device & Platform Breakdown */}
        <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden bg-white dark:bg-slate-900">
          <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Laptop className="h-4 w-4 text-indigo-600" />
              Visitor Devices & Browsers
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Hardware and environments used by prospective students
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-3.5 space-y-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Device Types
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

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Browsers & OS
              </span>
              <div className="flex flex-wrap gap-1">
                {data.browsers && data.browsers.length > 0 ? (
                  data.browsers.slice(0, 3).map((b) => (
                    <Badge key={b.browser} variant="outline" className="text-[10px] font-semibold py-0.5 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                      {b.browser}: {b.count}
                    </Badge>
                  ))
                ) : null}
                {data.os && data.os.length > 0 ? (
                  data.os.slice(0, 3).map((o) => (
                    <Badge key={o.os} variant="outline" className="text-[10px] font-semibold py-0.5 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                      {o.os}: {o.count}
                    </Badge>
                  ))
                ) : null}
                {(!data.browsers || data.browsers.length === 0) && (!data.os || data.os.length === 0) && (
                  <span className="text-[10px] text-slate-400">No client environment logs yet</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Pages / Course Hotspots */}
      <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden bg-white dark:bg-slate-900">
        <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="h-4 w-4 text-indigo-600" />
            Most Viewed Pages & Course Hotspots
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Pages and course catalogs receiving the highest student attention
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {data.topPages.length > 0 ? (
              data.topPages.slice(0, 6).map((page, idx) => (
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
                Course and page views will appear here.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Captured Prospective Student Leads Table */}
      <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden bg-white dark:bg-slate-900">
        <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              Captured Prospective Student Leads ({filteredLeads.length})
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Students inquiring via WhatsApp, Phone Call, or Course Interest buttons
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter Tabs */}
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
            <div className="relative w-full sm:w-52">
              <Search className="absolute inset-y-0 left-2.5 my-auto h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Search name, phone, course..."
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
                          {lead.intent || "Course inquiry"}
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
                          href={`https://wa.me/91${cleanPhone}?text=Hello!%20Thank%20you%20for%20contacting%20${encodeURIComponent(workspace.name)}.%20How%20can%20we%20assist%20you%20with%20your%20course%20enrollment?`}
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
                No captured student leads found. When students click your center's WhatsApp or inquiry buttons, they will appear here in real-time.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
