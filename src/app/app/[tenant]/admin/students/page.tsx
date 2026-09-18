import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getStudents } from "@/app/actions/students";
import { getBatches } from "@/app/actions/batches";
import { getCourses } from "@/app/actions/courses";
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

  if (!workspace) {
    notFound();
  }

  const [studentsResult, batchesResult, coursesResult, paymentConfig] = await Promise.all([
    getStudents(workspace!.id),
    getBatches(workspace!.id),
    getCourses(workspace!.id),
    db.franchisePaymentConfig.findUnique({
      where: { workspaceId: workspace!.id }
    })
  ]);

  const courses = (coursesResult.data ?? [])
    .filter((c: any) => c.isActive)
    .map((c: any) => ({ id: c.id, title: c.title }));

  return (
    <StudentsManagementClient 
      workspaceId={workspace!.id}
      initialStudents={studentsResult.data ?? []}
      batches={batchesResult.data ?? []}
      courses={courses}
      paymentConfig={paymentConfig}
      hasDocumentAuthority={workspace!.hasDocumentAuthority}
    />
  );
}

