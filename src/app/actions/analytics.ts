"use server";

import { db } from "@/lib/prisma";
import { auth } from "@/auth";

function getDateRanges(range: string = "30d") {
  const now = new Date();
  let durationMs = 30 * 24 * 60 * 60 * 1000;
  let startDate: Date;

  switch (range) {
    case "today": {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      durationMs = Math.max(1000 * 60 * 60, now.getTime() - startDate.getTime());
      break;
    }
    case "7d": {
      durationMs = 7 * 24 * 60 * 60 * 1000;
      startDate = new Date(now.getTime() - durationMs);
      break;
    }
    case "30d": {
      durationMs = 30 * 24 * 60 * 60 * 1000;
      startDate = new Date(now.getTime() - durationMs);
      break;
    }
    case "90d": {
      durationMs = 90 * 24 * 60 * 60 * 1000;
      startDate = new Date(now.getTime() - durationMs);
      break;
    }
    case "1y": {
      durationMs = 365 * 24 * 60 * 60 * 1000;
      startDate = new Date(now.getTime() - durationMs);
      break;
    }
    case "all": {
      startDate = new Date(0);
      durationMs = now.getTime();
      break;
    }
    default: {
      durationMs = 30 * 24 * 60 * 60 * 1000;
      startDate = new Date(now.getTime() - durationMs);
    }
  }

  const prevStartDate = new Date(startDate.getTime() - durationMs);
  const prevEndDate = startDate;

  return { startDate, prevStartDate, prevEndDate, now };
}

function calculateMetricTrend(current: number, previous: number): { change: string; trend: "up" | "down" } {
  if (previous === 0) {
    return {
      change: current > 0 ? "+100%" : "0%",
      trend: current > 0 ? "up" : "up",
    };
  }
  const diff = ((current - previous) / previous) * 100;
  const rounded = Math.round(diff * 10) / 10;
  return {
    change: `${diff >= 0 ? "+" : ""}${rounded}%`,
    trend: diff >= 0 ? "up" : "down",
  };
}

function classifyReferrer(ref?: string | null): string {
  if (!ref || ref.trim() === "") return "Direct / Organic";
  const r = ref.toLowerCase();
  if (r.includes("whatsapp") || r.includes("wa.me")) return "WhatsApp";
  if (r.includes("google")) return "Google Search";
  if (r.includes("facebook") || r.includes("fb.me")) return "Facebook";
  if (r.includes("instagram")) return "Instagram";
  if (r.includes("youtube")) return "YouTube";
  if (r.includes("linkedin")) return "LinkedIn";
  if (r.includes("twitter") || r.includes("x.com")) return "Twitter / X";
  try {
    const url = new URL(ref);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return "Other External";
  }
}

/**
 * Super Admin Analytics Overview
 */
export async function getSuperAdminAnalytics(filters: { dateRange?: string; workspaceId?: string } = {}) {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN" && session?.user?.role !== "SUPER_ADMIN_MANAGER") {
    throw new Error("Unauthorized: Super Admin access required");
  }

  const { startDate, prevStartDate, prevEndDate } = getDateRanges(filters.dateRange || "30d");
  const workspaceWhere = filters.workspaceId ? { workspaceId: filters.workspaceId } : {};

  const [
    // Current period
    totalViews,
    uniqueSessions,
    newSessions,
    returningSessions,
    totalLeads,
    recentLeads,
    topPagesRaw,
    devicesRaw,
    browsersRaw,
    osRaw,
    citiesRaw,
    franchisesRaw,
    allSessionsCount,
    allVisitsCount,
    allLeadsCount,
    // Previous period (for genuine dynamic trends)
    prevTotalViews,
    prevUniqueSessions,
    prevReturningSessions,
    prevTotalLeads,
    // Referrers for traffic attribution
    referrersRaw,
    // Visits for timeline and hourly heatmap
    visitsForTimeline,
    // All workspaces list for the filter dropdown
    allWorkspaces
  ] = await Promise.all([
    // Total Page Views in range
    db.pageVisit.count({
      where: {
        createdAt: { gte: startDate },
        ...workspaceWhere,
      },
    }),
    // Unique Visitors in range
    db.visitorSession.count({
      where: {
        createdAt: { gte: startDate },
        ...workspaceWhere,
      },
    }),
    // New Visitors (totalVisits == 1)
    db.visitorSession.count({
      where: {
        createdAt: { gte: startDate },
        totalVisits: 1,
        ...workspaceWhere,
      },
    }),
    // Returning Visitors (totalVisits > 1)
    db.visitorSession.count({
      where: {
        createdAt: { gte: startDate },
        totalVisits: { gt: 1 },
        ...workspaceWhere,
      },
    }),
    // Total Leads captured in range
    db.visitorLead.count({
      where: {
        createdAt: { gte: startDate },
        ...workspaceWhere,
      },
    }),
    // Recent Leads
    db.visitorLead.findMany({
      where: {
        createdAt: { gte: startDate },
        ...workspaceWhere,
      },
      include: {
        workspace: {
          select: { id: true, name: true, subdomain: true, centerCode: true }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 40,
    }),
    // Top visited pages
    db.pageVisit.groupBy({
      by: ["path"],
      _count: { id: true },
      where: {
        createdAt: { gte: startDate },
        ...workspaceWhere,
      },
      orderBy: {
        _count: { id: "desc" },
      },
      take: 10,
    }),
    // Device breakdown
    db.visitorSession.groupBy({
      by: ["device"],
      _count: { id: true },
      where: {
        createdAt: { gte: startDate },
        ...workspaceWhere,
      },
    }),
    // Browser breakdown
    db.visitorSession.groupBy({
      by: ["browser"],
      _count: { id: true },
      where: {
        createdAt: { gte: startDate },
        ...workspaceWhere,
      },
    }),
    // OS breakdown
    db.visitorSession.groupBy({
      by: ["os"],
      _count: { id: true },
      where: {
        createdAt: { gte: startDate },
        ...workspaceWhere,
      },
    }),
    // City breakdown
    db.visitorSession.groupBy({
      by: ["city", "state"],
      _count: { id: true },
      where: {
        createdAt: { gte: startDate },
        city: { not: null },
        ...workspaceWhere,
      },
      orderBy: {
        _count: { id: "desc" },
      },
      take: 8,
    }),
    // Top Franchises by Traffic
    db.pageVisit.groupBy({
      by: ["workspaceId"],
      _count: { id: true },
      where: {
        createdAt: { gte: startDate },
        workspaceId: { not: null },
      },
      orderBy: {
        _count: { id: "desc" },
      },
      take: 10,
    }),
    // Total All-Time Counts for Storage / Clearance
    db.visitorSession.count(),
    db.pageVisit.count(),
    db.visitorLead.count(),

    // Previous period counts
    db.pageVisit.count({
      where: {
        createdAt: { gte: prevStartDate, lt: prevEndDate },
        ...workspaceWhere,
      },
    }),
    db.visitorSession.count({
      where: {
        createdAt: { gte: prevStartDate, lt: prevEndDate },
        ...workspaceWhere,
      },
    }),
    db.visitorSession.count({
      where: {
        createdAt: { gte: prevStartDate, lt: prevEndDate },
        totalVisits: { gt: 1 },
        ...workspaceWhere,
      },
    }),
    db.visitorLead.count({
      where: {
        createdAt: { gte: prevStartDate, lt: prevEndDate },
        ...workspaceWhere,
      },
    }),

    // Referrers
    db.visitorSession.findMany({
      where: {
        createdAt: { gte: startDate },
        ...workspaceWhere,
      },
      select: { referrer: true },
      take: 1000,
    }),

    // Visits for timeline and hourly heatmap
    db.pageVisit.findMany({
      where: {
        createdAt: { gte: startDate },
        ...workspaceWhere,
      },
      select: { createdAt: true },
      take: 15000,
    }),

    // All active franchises
    db.workspace.findMany({
      select: { id: true, name: true, subdomain: true, centerCode: true, state: true },
      orderBy: { name: "asc" },
    }),
  ]);

  // Fetch franchise details for the top franchises
  const topWorkspaceIds = franchisesRaw.map((f) => f.workspaceId).filter(Boolean) as string[];
  const workspacesMap = new Map();
  if (topWorkspaceIds.length > 0) {
    const wsList = await db.workspace.findMany({
      where: { id: { in: topWorkspaceIds } },
      select: { id: true, name: true, subdomain: true, centerCode: true, state: true, district: true },
    });
    wsList.forEach((w) => workspacesMap.set(w.id, w));
  }

  const topFranchises = franchisesRaw.map((item) => {
    const ws = item.workspaceId ? workspacesMap.get(item.workspaceId) : null;
    return {
      workspaceId: item.workspaceId,
      name: ws?.name || "Main Portal",
      subdomain: ws?.subdomain || "root",
      centerCode: ws?.centerCode || "CENTRAL",
      state: ws?.state || "National",
      views: item._count.id,
    };
  });

  // Calculate day-by-day chart data & hourly distribution
  const dailyMap: Record<string, { date: string; views: number }> = {};
  const hoursCount = new Array(24).fill(0);

  visitsForTimeline.forEach((v) => {
    const d = v.createdAt.toISOString().split("T")[0];
    if (!dailyMap[d]) {
      dailyMap[d] = { date: d, views: 0 };
    }
    dailyMap[d].views += 1;

    // Convert to local IST hour (UTC + 5:30)
    const utcHours = v.createdAt.getUTCHours();
    const utcMinutes = v.createdAt.getUTCMinutes();
    const istHour = Math.floor((utcHours * 60 + utcMinutes + 330) / 60) % 24;
    hoursCount[istHour] += 1;
  });

  const chartData = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

  const hourlyActivity = hoursCount.map((views, hour) => {
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return {
      hour: `${displayHour} ${period}`,
      rawHour: hour,
      views,
    };
  });

  // Calculate Referrer distribution
  const referrerCounts: Record<string, number> = {};
  referrersRaw.forEach((r) => {
    const category = classifyReferrer(r.referrer);
    referrerCounts[category] = (referrerCounts[category] || 0) + 1;
  });
  const trafficSources = Object.entries(referrerCounts)
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count);

  // Calculate genuine trends compared to prior period
  const viewsTrend = calculateMetricTrend(totalViews, prevTotalViews);
  const visitorsTrend = calculateMetricTrend(uniqueSessions, prevUniqueSessions);
  const returningTrend = calculateMetricTrend(returningSessions, prevReturningSessions);
  const leadsTrend = calculateMetricTrend(totalLeads, prevTotalLeads);

  const bounceRate = uniqueSessions > 0 ? Math.round((newSessions / uniqueSessions) * 100) : 0;
  const conversionRate = uniqueSessions > 0 ? Number(((totalLeads / uniqueSessions) * 100).toFixed(1)) : 0;
  const avgPagesPerSession = uniqueSessions > 0 ? Number((totalViews / uniqueSessions).toFixed(1)) : 0;

  return {
    totalViews,
    uniqueVisitors: uniqueSessions,
    newVisitors: newSessions,
    returningVisitors: returningSessions,
    totalLeads,
    bounceRate,
    conversionRate,
    avgPagesPerSession,
    trends: {
      views: viewsTrend,
      visitors: visitorsTrend,
      returning: returningTrend,
      leads: leadsTrend,
    },
    trafficSources,
    hourlyActivity,
    allWorkspaces,
    recentLeads: recentLeads.map((lead) => ({
      id: lead.id,
      name: lead.name || "Anonymous Visitor",
      phone: lead.phone || null,
      email: lead.email || null,
      source: lead.source,
      intent: lead.intent,
      status: lead.status,
      notes: lead.notes,
      workspaceName: lead.workspace?.name || "Central Portal",
      workspaceSubdomain: lead.workspace?.subdomain || null,
      createdAt: lead.createdAt.toISOString(),
    })),
    topPages: topPagesRaw.map((p) => ({
      path: p.path,
      views: p._count.id,
    })),
    devices: devicesRaw.map((d) => ({
      device: d.device || "Desktop",
      count: d._count.id,
    })),
    browsers: browsersRaw.map((b) => ({
      browser: b.browser || "Chrome",
      count: b._count.id,
    })),
    os: osRaw.map((o) => ({
      os: o.os || "Windows",
      count: o._count.id,
    })),
    cities: citiesRaw.map((c) => ({
      city: c.city || "Unknown",
      state: c.state || "",
      count: c._count.id,
    })),
    topFranchises,
    chartData,
    storageStats: {
      totalVisitsCount: allVisitsCount,
      totalSessionsCount: allSessionsCount,
      totalLeadsCount: allLeadsCount,
      estimatedSizeKB: Math.round((allVisitsCount * 0.3 + allSessionsCount * 0.4 + allLeadsCount * 0.5)),
    }
  };
}

/**
 * Franchise Admin Analytics
 */
export async function getFranchiseAnalytics(tenantOrWorkspaceId: string, filters: { dateRange?: string } = {}) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Find workspace
  const workspace = await db.workspace.findFirst({
    where: {
      OR: [
        { id: tenantOrWorkspaceId },
        { subdomain: tenantOrWorkspaceId.toLowerCase() },
      ],
    },
    select: { id: true, name: true, subdomain: true, centerCode: true },
  });

  if (!workspace) {
    throw new Error("Franchise workspace not found");
  }

  // Verify access: Super Admin OR role in this workspace
  const isSuperAdmin = session.user.role === "SUPER_ADMIN" || session.user.role === "SUPER_ADMIN_MANAGER";
  if (!isSuperAdmin) {
    const roleRecord = await db.workspaceRole.findFirst({
      where: { userId: session.user.id, workspaceId: workspace.id },
    });
    if (!roleRecord) {
      throw new Error("Unauthorized access to this franchise analytics");
    }
  }

  const { startDate, prevStartDate, prevEndDate } = getDateRanges(filters.dateRange || "30d");

  const [
    totalViews,
    uniqueVisitors,
    newVisitors,
    returningVisitors,
    totalLeads,
    recentLeads,
    topPagesRaw,
    devicesRaw,
    browsersRaw,
    osRaw,
    visitsForTimeline,
    referrersRaw,
    // Previous period counts
    prevTotalViews,
    prevUniqueVisitors,
    prevReturningVisitors,
    prevTotalLeads,
  ] = await Promise.all([
    db.pageVisit.count({
      where: {
        workspaceId: workspace.id,
        createdAt: { gte: startDate },
      },
    }),
    db.visitorSession.count({
      where: {
        workspaceId: workspace.id,
        createdAt: { gte: startDate },
      },
    }),
    db.visitorSession.count({
      where: {
        workspaceId: workspace.id,
        createdAt: { gte: startDate },
        totalVisits: 1,
      },
    }),
    db.visitorSession.count({
      where: {
        workspaceId: workspace.id,
        createdAt: { gte: startDate },
        totalVisits: { gt: 1 },
      },
    }),
    db.visitorLead.count({
      where: {
        workspaceId: workspace.id,
        createdAt: { gte: startDate },
      },
    }),
    db.visitorLead.findMany({
      where: {
        workspaceId: workspace.id,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: "desc" },
      take: 40,
    }),
    db.pageVisit.groupBy({
      by: ["path"],
      _count: { id: true },
      where: {
        workspaceId: workspace.id,
        createdAt: { gte: startDate },
      },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }),
    db.visitorSession.groupBy({
      by: ["device"],
      _count: { id: true },
      where: {
        workspaceId: workspace.id,
        createdAt: { gte: startDate },
      },
    }),
    db.visitorSession.groupBy({
      by: ["browser"],
      _count: { id: true },
      where: {
        workspaceId: workspace.id,
        createdAt: { gte: startDate },
      },
    }),
    db.visitorSession.groupBy({
      by: ["os"],
      _count: { id: true },
      where: {
        workspaceId: workspace.id,
        createdAt: { gte: startDate },
      },
    }),
    db.pageVisit.findMany({
      where: {
        workspaceId: workspace.id,
        createdAt: { gte: startDate },
      },
      select: { createdAt: true },
      take: 10000,
    }),
    db.visitorSession.findMany({
      where: {
        workspaceId: workspace.id,
        createdAt: { gte: startDate },
      },
      select: { referrer: true },
      take: 1000,
    }),
    // Prior period
    db.pageVisit.count({
      where: {
        workspaceId: workspace.id,
        createdAt: { gte: prevStartDate, lt: prevEndDate },
      },
    }),
    db.visitorSession.count({
      where: {
        workspaceId: workspace.id,
        createdAt: { gte: prevStartDate, lt: prevEndDate },
      },
    }),
    db.visitorSession.count({
      where: {
        workspaceId: workspace.id,
        createdAt: { gte: prevStartDate, lt: prevEndDate },
        totalVisits: { gt: 1 },
      },
    }),
    db.visitorLead.count({
      where: {
        workspaceId: workspace.id,
        createdAt: { gte: prevStartDate, lt: prevEndDate },
      },
    }),
  ]);

  // Calculate day-by-day chart data & hourly distribution
  const dailyMap: Record<string, { date: string; views: number }> = {};
  const hoursCount = new Array(24).fill(0);

  visitsForTimeline.forEach((v) => {
    const d = v.createdAt.toISOString().split("T")[0];
    if (!dailyMap[d]) {
      dailyMap[d] = { date: d, views: 0 };
    }
    dailyMap[d].views += 1;

    // Convert to IST hour
    const utcHours = v.createdAt.getUTCHours();
    const utcMinutes = v.createdAt.getUTCMinutes();
    const istHour = Math.floor((utcHours * 60 + utcMinutes + 330) / 60) % 24;
    hoursCount[istHour] += 1;
  });

  const chartData = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

  const hourlyActivity = hoursCount.map((views, hour) => {
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return {
      hour: `${displayHour} ${period}`,
      rawHour: hour,
      views,
    };
  });

  // Calculate Referrer distribution
  const referrerCounts: Record<string, number> = {};
  referrersRaw.forEach((r) => {
    const category = classifyReferrer(r.referrer);
    referrerCounts[category] = (referrerCounts[category] || 0) + 1;
  });
  const trafficSources = Object.entries(referrerCounts)
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count);

  // Dynamic trends
  const viewsTrend = calculateMetricTrend(totalViews, prevTotalViews);
  const visitorsTrend = calculateMetricTrend(uniqueVisitors, prevUniqueVisitors);
  const returningTrend = calculateMetricTrend(returningVisitors, prevReturningVisitors);
  const leadsTrend = calculateMetricTrend(totalLeads, prevTotalLeads);

  const bounceRate = uniqueVisitors > 0 ? Math.round((newVisitors / uniqueVisitors) * 100) : 0;
  const conversionRate = uniqueVisitors > 0 ? Number(((totalLeads / uniqueVisitors) * 100).toFixed(1)) : 0;
  const avgPagesPerSession = uniqueVisitors > 0 ? Number((totalViews / uniqueVisitors).toFixed(1)) : 0;

  return {
    workspace,
    totalViews,
    uniqueVisitors,
    newVisitors,
    returningVisitors,
    totalLeads,
    bounceRate,
    conversionRate,
    avgPagesPerSession,
    trends: {
      views: viewsTrend,
      visitors: visitorsTrend,
      returning: returningTrend,
      leads: leadsTrend,
    },
    trafficSources,
    hourlyActivity,
    topPages: topPagesRaw.map((p) => ({
      path: p.path,
      views: p._count.id,
    })),
    devices: devicesRaw.map((d) => ({
      device: d.device || "Desktop",
      count: d._count.id,
    })),
    browsers: browsersRaw.map((b) => ({
      browser: b.browser || "Chrome",
      count: b._count.id,
    })),
    os: osRaw.map((o) => ({
      os: o.os || "Windows",
      count: o._count.id,
    })),
    leads: recentLeads.map((l) => ({
      id: l.id,
      name: l.name || "Prospective Student",
      phone: l.phone || null,
      email: l.email || null,
      source: l.source,
      intent: l.intent,
      status: l.status,
      notes: l.notes,
      createdAt: l.createdAt.toISOString(),
    })),
    chartData,
  };
}

/**
 * Update status of captured lead (e.g. Contacted, Converted)
 */
export async function updateLeadStatus(leadId: string, status: string, notes?: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const lead = await db.visitorLead.update({
    where: { id: leadId },
    data: {
      status,
      notes: notes !== undefined ? notes : undefined,
    },
  });

  return { success: true, lead };
}

/**
 * Export Analytics to formatted Excel (.xlsx) file buffer
 */
export async function exportAnalyticsToExcel(filters: { workspaceId?: string; dateRange?: string } = {}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const { startDate } = getDateRanges(filters.dateRange || "1y");
  const whereClause: any = { createdAt: { gte: startDate } };
  if (filters.workspaceId) {
    whereClause.workspaceId = filters.workspaceId;
  }

  // Fetch data
  const [visits, sessions, leads] = await Promise.all([
    db.pageVisit.findMany({
      where: whereClause,
      include: {
        workspace: { select: { name: true, centerCode: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10000,
    }),
    db.visitorSession.findMany({
      where: whereClause,
      include: {
        workspace: { select: { name: true, centerCode: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10000,
    }),
    db.visitorLead.findMany({
      where: whereClause,
      include: {
        workspace: { select: { name: true, centerCode: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5000,
    }),
  ]);

  // Build workbook
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();

  // Sheet 1: Summary
  const summaryData = [
    ["RGYCSP / ABCD Edu Hub - Analytics Report"],
    ["Generated On", new Date().toLocaleString("en-IN")],
    ["Time Window", filters.dateRange?.toUpperCase() || "PAST YEAR"],
    [],
    ["Metric", "Value"],
    ["Total Page Visits Recorded", visits.length],
    ["Unique Visitor Sessions", sessions.length],
    ["Total Inquiries & Leads Captured", leads.length],
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summarySheet, "Overview Summary");

  // Sheet 2: Leads & Contact Info
  const leadsData = leads.map((l) => ({
    "Date & Time": l.createdAt.toLocaleString("en-IN"),
    "Lead Name": l.name || "Anonymous Visitor",
    "Contact Phone": l.phone || "N/A",
    "Contact Email": l.email || "N/A",
    "Inquiry Source": l.source,
    "Lead Intent / Course": l.intent || "Website Inquiry",
    "Lead Status": l.status,
    "Franchise Center": l.workspace?.name || "Central Portal",
    "Center Code": l.workspace?.centerCode || "N/A",
    "Notes": l.notes || "",
  }));
  const leadsSheet = XLSX.utils.json_to_sheet(leadsData);
  XLSX.utils.book_append_sheet(wb, leadsSheet, "Captured Leads");

  // Sheet 3: Top Page Visits
  const visitsData = visits.map((v) => ({
    "Date & Time": v.createdAt.toLocaleString("en-IN"),
    "URL Path": v.path,
    "Page Title": v.title || "N/A",
    "Franchise Center": v.workspace?.name || "Central Portal",
    "Center Code": v.workspace?.centerCode || "N/A",
    "Time Spent (sec)": v.durationSeconds,
  }));
  const visitsSheet = XLSX.utils.json_to_sheet(visitsData);
  XLSX.utils.book_append_sheet(wb, visitsSheet, "Page Visits Log");

  // Sheet 4: Visitor Sessions (Geo & Device)
  const sessionsData = sessions.map((s) => ({
    "First Seen": s.firstSeen.toLocaleString("en-IN"),
    "Last Seen": s.lastSeen.toLocaleString("en-IN"),
    "Total Visits": s.totalVisits,
    "Device": s.device || "Desktop",
    "Browser": s.browser || "Unknown",
    "OS": s.os || "Unknown",
    "City": s.city || "Unknown",
    "State": s.state || "Unknown",
    "Referrer": s.referrer || "Direct",
    "Franchise Center": s.workspace?.name || "Central Portal",
  }));
  const sessionsSheet = XLSX.utils.json_to_sheet(sessionsData);
  XLSX.utils.book_append_sheet(wb, sessionsSheet, "Visitor Geo & Tech");

  const buffer = XLSX.write(wb, { type: "base64", bookType: "xlsx" });
  const filename = `Analytics_Export_${filters.workspaceId ? "Franchise" : "Global"}_${new Date().toISOString().split("T")[0]}.xlsx`;

  return { success: true, base64: buffer, filename };
}

/**
 * Yearly Data Clearance / Pruning Engine (Super Admin only)
 */
export async function purgeOldAnalyticsLogs(retentionDays: number = 365) {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized: Only Super Admin can purge analytics data");
  }

  if (retentionDays < 30) {
    throw new Error("Minimum retention period allowed is 30 days");
  }

  const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

  // Delete older page visits first
  const deletedVisits = await db.pageVisit.deleteMany({
    where: { createdAt: { lt: cutoffDate } },
  });

  // Delete older visitor sessions
  const deletedSessions = await db.visitorSession.deleteMany({
    where: { createdAt: { lt: cutoffDate } },
  });

  return {
    success: true,
    cutoffDate: cutoffDate.toISOString(),
    deletedVisitsCount: deletedVisits.count,
    deletedSessionsCount: deletedSessions.count,
    message: `Successfully cleared ${deletedVisits.count} page visits and ${deletedSessions.count} visitor sessions older than ${retentionDays} days.`,
  };
}
