import { getWorkspaceByTenant } from "@/lib/workspace";
import { redirect } from "next/navigation";
import { getServerTenantLink } from "@/lib/routing-server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

import { db } from "@/lib/prisma";
import StudentNoticesClient from "@/components/student/StudentNoticesClient";

export default async function StudentNoticesPage({
  params
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  const workspace = await getWorkspaceByTenant(tenant);
  if (!workspace) redirect(await getServerTenantLink("/", tenant));

  const workspaceSettings = workspace.siteSettings as any;
  const aboutSection = workspaceSettings?.sections?.find((s: any) => s.type === "about");
  const centerRawNotices: any[] = (aboutSection?.content as any)?.notices || [];

  // Fetch broadcast circulars / notices from Super Admin or Center targeted to students
  const now = new Date();
  const broadcastNotifications = await db.notification.findMany({
    where: {
      type: { in: ["CIRCULAR", "NOTICE", "EVENT", "WARNING"] },
      status: "PUBLISHED",
      AND: [
        {
          OR: [
            { workspaceId: null },
            { workspaceId: workspace.id },
          ],
        },
        {
          targetAudience: { in: ["STUDENTS", "ALL", "PUBLIC"] },
        },
        {
          OR: [
            { scheduledFor: null },
            { scheduledFor: { lte: now } },
          ],
        },
      ],
      NOT: {
        targetAudience: { in: ["ALL_FRANCHISES", "SPECIFIC_FRANCHISE", "STAFF"] },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  const broadcastMapped = broadcastNotifications.map((n) => ({
    id: n.id,
    title: n.title,
    description: n.message,
    message: n.message,
    date: n.createdAt.toISOString().split("T")[0],
    category: n.category || (n.type === "CIRCULAR" ? "Academic" : "General"),
    priority: n.priority?.toLowerCase() || (n.type === "WARNING" ? "urgent" : "normal"),
    department: n.workspaceId ? "Center Administration" : "Central Head Office",
    link: n.link || "",
    refNo: n.refNo || null,
    isTemplate: false,
    templateId: n.templateId || null,
    isHeadOffice: !n.workspaceId,
    publishedBy: !n.workspaceId ? "Head Office" : "Center Administration",
  }));

  // Combine and deduplicate by refNo or title
  const seenKeys = new Set<string>();
  const combinedNotices: any[] = [];

  for (const n of centerRawNotices) {
    // Strictly exclude internal staff notices from student portal
    if (n.audience === "STAFF") {
      continue;
    }
    // Only show published notices (exclude scheduled for future)
    if (n.status === "SCHEDULED" || (n.scheduledFor && new Date(n.scheduledFor) > now)) {
      continue;
    }
    const key = n.refNo ? `ref:${n.refNo.trim().toUpperCase()}` : (n.id || n.title);
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      combinedNotices.push({
        ...n,
        description: n.message || n.description,
      });
    }
  }

  for (const n of broadcastMapped) {
    const key = n.refNo ? `ref:${n.refNo.trim().toUpperCase()}` : (n.id || n.title);
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      combinedNotices.push(n);
    }
  }

  // Fetch active NOTICE_PAD template designed by Super Admin
  let noticepadTemplate = await db.documentTemplate.findFirst({
    where: {
      type: "NOTICE_PAD",
      isActive: true,
      OR: [
        { workspaceId: workspace.id },
        { workspaceId: null },
      ]
    },
    orderBy: {
      workspaceId: "desc"
    }
  });

  if (!noticepadTemplate) {
    // Fallback to any NOTICE_PAD template in the platform
    noticepadTemplate = await db.documentTemplate.findFirst({
      where: {
        type: "NOTICE_PAD",
      },
      orderBy: {
        updatedAt: "desc"
      }
    });
  }

  return (
    <StudentNoticesClient 
      notices={combinedNotices}
      settings={workspaceSettings}
      tenant={tenant}
      workspace={workspace}
      noticepadTemplate={noticepadTemplate}
      superAdminSignature={null}
    />
  );
}
