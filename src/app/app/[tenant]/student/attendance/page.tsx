import { getStudentProfile } from "@/app/actions/student";
import { getWorkspaceByTenant } from "@/lib/workspace";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, Calendar as CalendarIcon, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

import StudentAttendanceClient from "@/components/student/StudentAttendanceClient";

export default async function StudentAttendancePage({
  params
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  const workspace = await getWorkspaceByTenant(tenant);
  if (!workspace) redirect("/");

  const result = await getStudentProfile(workspace.id);
  if (!result.success) redirect(`/app/${tenant}/student/dashboard`);

  const student = result.data as any;
  if (!student) redirect(`/app/${tenant}/student/dashboard`);
  const attendances = student.studentProfile?.attendances || [];

  const sortedAttendances = [...attendances].sort((a: any, b: any) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const stats = {
    present: attendances.filter((a: any) => a.status === "PRESENT").length,
    absent: attendances.filter((a: any) => a.status === "ABSENT").length,
    late: attendances.filter((a: any) => a.status === "LATE").length,
    total: attendances.length,
    percentage: attendances.length > 0 
      ? Math.round((attendances.filter((a: any) => a.status === "PRESENT" || a.status === "LATE").length / attendances.length) * 100) 
      : 0
  };

  const settings = workspace.siteSettings as any;

  return (
    <StudentAttendanceClient 
      attendances={sortedAttendances}
      stats={stats}
      settings={settings}
      tenant={tenant}
    />
  );
}

import { cn } from "@/lib/utils";
