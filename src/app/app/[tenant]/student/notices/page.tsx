import { getWorkspaceByTenant } from "@/lib/workspace";
import { redirect } from "next/navigation";
import { getServerTenantLink } from "@/lib/routing-server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

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
  const notices = (aboutSection?.content as any)?.notices || [];

  return (
    <StudentNoticesClient 
      notices={notices}
      settings={workspaceSettings}
      tenant={tenant}
    />
  );
}
