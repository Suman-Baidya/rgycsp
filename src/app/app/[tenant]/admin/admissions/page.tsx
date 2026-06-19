import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getAdmissionConfig } from "@/app/actions/admission-config";
import AdmissionsDashboardClient from "./AdmissionsDashboardClient";

export default async function AdmissionsPage({
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
      },
      courses: {
        where: { isActive: true },
        select: { id: true, title: true, feeAmount: true }
      },
      batches: {
        select: { id: true, name: true, courseId: true }
      }
    }
  });

  if (!workspace) notFound();

  const configResult = await getAdmissionConfig(workspace.id);
  const pendingCount = await db.admissionApplication.count({
    where: { 
      workspaceId: workspace.id,
      status: "PENDING"
    }
  });

  return (
    <AdmissionsDashboardClient 
      workspaceId={workspace.id}
      applications={workspace.admissionApps || []}
      config={configResult.data ?? {}}
      pendingCount={pendingCount}
      courses={workspace.courses || []}
      batches={workspace.batches || []}
    />
  );
}
