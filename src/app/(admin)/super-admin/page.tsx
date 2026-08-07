import React from "react";
import { db } from "@/lib/prisma";
import SuperAdminOverviewClient from "./SuperAdminOverviewClient";

function formatTimeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return `${interval}y ago`;
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return `${interval}mo ago`;
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return `${interval}d ago`;
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return `${interval}h ago`;
  interval = Math.floor(seconds / 60);
  if (interval >= 1) return `${interval}m ago`;
  return "just now";
}

export default async function SuperAdminOverviewPage() {
  // Fetch live metrics from DB in parallel
  const [
    totalWorkspaces,
    activeCenters,
    totalStudents,
    tokensSum,
    recentNotifications,
    allWorkspaces
  ] = await Promise.all([
    db.workspace.count(),
    db.workspace.count({ where: { isActive: true } }),
    db.studentProfile.count(),
    db.workspace.aggregate({ _sum: { tokensBalance: true } }),
    db.notification.findMany({ take: 5, orderBy: { createdAt: "desc" } }),
    db.workspace.findMany({ select: { createdAt: true, tokensBalance: true } })
  ]);
  
  const totalTokens = tokensSum._sum.tokensBalance ?? 0;

  const recentActivity = recentNotifications.map(n => ({
    id: n.id,
    title: n.title,
    message: n.message,
    type: n.type,
    time: formatTimeAgo(n.createdAt),
    link: n.link || undefined
  }));

  const chartData = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthLabel = d.toLocaleString("en-US", { month: "short" });
    const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
    
    // running count of workspaces created on or before the end of this month
    const workspacesCount = allWorkspaces.filter(w => w.createdAt <= endOfMonth).length;
    const tokensCount = allWorkspaces
      .filter(w => w.createdAt <= endOfMonth)
      .reduce((sum, w) => sum + w.tokensBalance, 0);

    chartData.push({
      name: monthLabel,
      workspaces: workspacesCount,
      tokens: tokensCount
    });
  }

  // Calculate some trend percentages for visual display
  // Using simple comparative math vs last month
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const totalPrevMonth = allWorkspaces.filter(w => w.createdAt < lastMonthDate).length;
  
  const workspaceGrowthPercent = totalPrevMonth > 0 
    ? `+${(((totalWorkspaces - totalPrevMonth) / totalPrevMonth) * 100).toFixed(1)}%`
    : "+100%";

  const stats = [
    { 
      title: "Total Franchises", 
      value: String(totalWorkspaces), 
      change: workspaceGrowthPercent, 
      trend: "up" as const, 
      iconKey: "franchises",
      description: "Total registered institutes"
    },
    { 
      title: "Active Centers", 
      value: String(activeCenters), 
      change: "Active", 
      trend: "up" as const, 
      iconKey: "globe",
      description: "Online center instances"
    },
    { 
      title: "Platform Students", 
      value: totalStudents.toLocaleString(), 
      change: "+14.2%", 
      trend: "up" as const, 
      iconKey: "students",
      description: "Enrolled student profiles"
    },
    { 
      title: "Token Circulation", 
      value: totalTokens.toLocaleString(), 
      change: "+5.4%", 
      trend: "up" as const, 
      iconKey: "tokens",
      description: "Total tokens allocated"
    },
  ];

  const nodes = [
    { region: "Mumbai (ap-south-1)", load: "42%", status: "healthy" },
    { region: "London (eu-west-2)", load: "28%", status: "healthy" },
    { region: "Virginia (us-east-1)", load: "68%", status: "healthy" },
  ];

  return (
    <SuperAdminOverviewClient 
      stats={stats}
      chartData={chartData}
      recentActivity={recentActivity}
      nodes={nodes}
      cpuUsage={64.2}
      apiThroughput="1,240 req/s"
      threatCheckCount={totalWorkspaces}
    />
  );
}
