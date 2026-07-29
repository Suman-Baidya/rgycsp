import { getStudentProfile } from "@/app/actions/student";
import { getWorkspaceByTenant } from "@/lib/workspace";
import { redirect } from "next/navigation";
import { getServerTenantLink } from "@/lib/routing-server";
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
  if (!workspace) redirect(await getServerTenantLink("/", tenant));

  const result = await getStudentProfile(workspace.id);
  if (!result.success) redirect(await getServerTenantLink("/student/dashboard", tenant));

  const student = result.data as any;
  if (!student) redirect(await getServerTenantLink("/student/dashboard", tenant));
  const attendances = student.studentProfile?.attendances || [];

  const theoryAttendances = attendances.filter((a: any) => a.type === "THEORY").sort((a: any, b: any) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const practicalAttendances = attendances.filter((a: any) => a.type === "PRACTICAL").sort((a: any, b: any) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const calculateStats = (records: any[]) => {
    return {
      present: records.filter(a => a.status === "PRESENT").length,
      absent: records.filter(a => a.status === "ABSENT").length,
      late: records.filter(a => a.status === "LATE").length,
      total: records.length,
      percentage: records.length > 0 
        ? Math.round((records.filter(a => a.status === "PRESENT" || a.status === "LATE").length / records.length) * 100) 
        : 0
    };
  };

  const theoryStats = calculateStats(theoryAttendances);
  const practicalStats = calculateStats(practicalAttendances);

  const settings = workspace.siteSettings as any;

  const theorySchedule = {
    batchName: student.studentProfile?.batch?.name || "Pending Assignment",
    schedule: student.studentProfile?.batch?.schedule || "No schedule set."
  };

  const practicalSchedule = student.studentProfile?.practicalSchedules || [];

  return (
    <StudentAttendanceClient 
      theoryAttendances={theoryAttendances}
      practicalAttendances={practicalAttendances}
      theoryStats={theoryStats}
      practicalStats={practicalStats}
      theorySchedule={theorySchedule}
      practicalSchedule={practicalSchedule}
      settings={settings}
      tenant={tenant}
    />
  );
}

import { cn } from "@/lib/utils";
