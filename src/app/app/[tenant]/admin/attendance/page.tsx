import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import AttendanceClient from "./AttendanceClient";
import { getBatches, getAttendanceList } from "@/app/actions/attendance";

export default async function AttendancePage({
  params
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  const normalizedTenant = tenant?.toLowerCase();

  const workspace = await db.workspace.findUnique({
    where: { subdomain: normalizedTenant },
    select: { id: true }
  });

  if (!workspace) notFound();

  const batchesResult = await getBatches(workspace.id);
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
    />
  );
}
