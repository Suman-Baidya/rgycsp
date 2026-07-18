import { db } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getServerTenantLink } from "@/lib/routing-server";
import { auth } from "@/auth";
import StudentFeesClient from "./StudentFeesClient";
import { getStudentInvoices, getFranchisePaymentConfig } from "@/app/actions/payments";

export default async function StudentFeesPage({
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

  const session = await auth();
  if (!session || !session.user) {
    redirect(await getServerTenantLink("/login", normalizedTenant));
  }

  const studentProfile = await db.studentProfile.findUnique({
    where: { userId: session.user.id },
    include: { course: true, batch: true }
  });

  if (!studentProfile) {
    notFound();
  }

  const invoicesRes = await getStudentInvoices(studentProfile.id);
  const configRes = await getFranchisePaymentConfig(workspace.id);

  return (
    <StudentFeesClient 
      workspaceId={workspace.id}
      student={studentProfile}
      invoices={invoicesRes.data || []}
      paymentConfig={configRes.data || null}
    />
  );
}
