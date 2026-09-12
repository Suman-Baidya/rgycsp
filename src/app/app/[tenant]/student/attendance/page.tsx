import { getStudentProfile } from "@/app/actions/student";
import { getWorkspaceByTenant } from "@/lib/workspace";
import { redirect } from "next/navigation";
import { getServerTenantLink } from "@/lib/routing-server";
import { db } from "@/lib/prisma";
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
  const studentProfileId = student.studentProfile?.id;

  const attendances = studentProfileId
    ? await db.attendance.findMany({
        where: { studentProfileId, workspaceId: workspace.id },
        orderBy: { date: 'desc' },
        take: 250
      })
    : [];

  const theoryAttendances = attendances.filter((a: any) => a.type === "THEORY");
  const practicalAttendances = attendances.filter((a: any) => a.type === "PRACTICAL");

  const calculateStats = (records: any[]) => {
    const present = records.filter(a => a.status === "PRESENT").length;
    const absent = records.filter(a => a.status === "ABSENT").length;
    const late = records.filter(a => a.status === "LATE").length;
    const halfDay = records.filter(a => a.status === "HALF_DAY").length;
    const total = records.length;
    const percentage = total > 0 
      ? Math.round(((present + late + (halfDay * 0.5)) / total) * 100) 
      : 100;

    return {
      present,
      absent,
      late,
      halfDay,
      total,
      percentage
    };
  };

  const theoryStats = calculateStats(theoryAttendances);
  const practicalStats = calculateStats(practicalAttendances);
  const overallStats = calculateStats(attendances);

  const settings = workspace.siteSettings as any;

  const theorySchedule = {
    batchName: student.studentProfile?.batch?.name || "Regular Batch",
    schedule: student.studentProfile?.batch?.schedule || (
      student.studentProfile?.batch?.startTime && student.studentProfile?.batch?.endTime
        ? `${student.studentProfile.batch.startTime} - ${student.studentProfile.batch.endTime}`
        : "Standard Academic Timetable"
    )
  };

  const practicalSchedule = student.studentProfile?.practicalSchedules || [];

  return (
    <StudentAttendanceClient 
      attendances={attendances}
      theoryAttendances={theoryAttendances}
      practicalAttendances={practicalAttendances}
      theoryStats={theoryStats}
      practicalStats={practicalStats}
      overallStats={overallStats}
      theorySchedule={theorySchedule}
      practicalSchedule={practicalSchedule}
      settings={settings}
      tenant={tenant}
      workspace={workspace}
    />
  );
}
