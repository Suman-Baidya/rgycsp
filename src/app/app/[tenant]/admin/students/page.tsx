import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getStudents } from "@/app/actions/students";
import StudentsManagementClient from "./StudentsManagementClient";

export default async function StudentsPage({
  params
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  const normalizedTenant = tenant?.toLowerCase();

  const workspace = await db.workspace.findUnique({
    where: { subdomain: normalizedTenant }
  });

  if (!workspace) notFound();

  const studentsResult = await getStudents(workspace.id);
  
  const batches = await db.batch.findMany({
    where: { workspaceId: workspace.id },
    include: {
      course: { select: { title: true } },
      _count: { select: { students: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  const courses = await db.course.findMany({
    where: { workspaceId: workspace.id, isActive: true },
    select: { id: true, title: true }
  });

  const paymentConfig = await db.franchisePaymentConfig.findUnique({
    where: { workspaceId: workspace.id }
  });

  return (
    <StudentsManagementClient 
      workspaceId={workspace.id}
      initialStudents={studentsResult.data ?? []}
      batches={batches}
      courses={courses}
      paymentConfig={paymentConfig}
      hasDocumentAuthority={workspace.hasDocumentAuthority}
    />
  );
}

