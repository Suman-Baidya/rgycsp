import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getStudents } from "@/app/actions/students";
import { getAdmissionConfig } from "@/app/actions/admission-config";
import StudentsDashboardClient from "./StudentsDashboardClient";

export default async function StudentsPage({
  params
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  const normalizedTenant = tenant?.toLowerCase();

  const workspace = await db.workspace.findUnique({
    where: { subdomain: normalizedTenant },
    include: {
      admissionApps: {
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!workspace) notFound();

  const studentsResult = await getStudents(workspace.id);
  const batches = await db.batch.findMany({
    where: { workspaceId: workspace.id },
    select: { id: true, name: true }
  });

  const configResult = await getAdmissionConfig(workspace.id);
  const config = configResult.success ? configResult.data : {};

  const pendingCount = await db.admissionApplication.count({
    where: { 
      workspaceId: workspace.id,
      status: "PENDING"
    }
  });

  return (
    <StudentsDashboardClient 
      workspaceId={workspace.id}
      initialStudents={studentsResult.data ?? []}
      batches={batches}
      applications={workspace.admissionApps || []}
      config={configResult.data ?? {}}
      pendingCount={pendingCount}
    />
  );
}

