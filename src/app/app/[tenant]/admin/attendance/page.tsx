import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import AttendanceClient from "./AttendanceClient";
import { getBatches, getAttendanceList } from "@/app/actions/attendance";
import { getWorkspaceExtraClassBookings } from "@/app/actions/extra-classes";

export default async function AttendancePage({
  params
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  const normalizedTenant = tenant?.toLowerCase()?.trim();

  const workspace = await db.workspace.findFirst({
    where: {
      OR: [
        { subdomain: normalizedTenant },
        { centerCode: { equals: normalizedTenant, mode: 'insensitive' } },
        { id: tenant }
      ]
    },
    select: { id: true }
  });

  if (!workspace) notFound();

  const [batchesResult, extraBookingsResult, allStudents] = await Promise.all([
    getBatches(workspace.id),
    getWorkspaceExtraClassBookings(workspace.id),
    db.studentProfile.findMany({
      where: { workspaceId: workspace.id, isActive: true },
      select: { id: true, fullName: true, enrollmentNo: true, phone: true },
      orderBy: { fullName: 'asc' }
    })
  ]);

  const batches = batchesResult.success ? (batchesResult.data ?? []) : [];

  let initialStudents: any[] = [];
  if (batches.length > 0) {
    const studentsResult = await getAttendanceList(batches[0].id, new Date());
    if (studentsResult.success) {
      initialStudents = studentsResult.data ?? [];
    }
  }

  return (
    <AttendanceClient 
      workspaceId={workspace.id}
      batches={batches} 
      initialStudents={initialStudents}
      allStudents={allStudents}
      initialExtraBookings={extraBookingsResult.bookings ?? []}
    />
  );
}

