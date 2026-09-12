import { getStudentProfile } from "@/app/actions/student";
import { getWorkspaceByTenant } from "@/lib/workspace";
import { redirect } from "next/navigation";
import { getServerTenantLink } from "@/lib/routing-server";
import { db } from "@/lib/prisma";
import StudentFeesClient from "@/components/student/StudentFeesClient";
import { getFranchisePaymentConfig } from "@/app/actions/payments";

export default async function StudentFeesPage({
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
  const studentProfile = student.studentProfile;
  const studentProfileId = studentProfile?.id;

  const invoices = studentProfileId
    ? await db.invoice.findMany({
        where: { studentProfileId, workspaceId: workspace.id },
        orderBy: { createdAt: "desc" }
      })
    : [];

  const configRes = await getFranchisePaymentConfig(workspace.id);
  const paymentConfig = configRes.success ? configRes.data : null;

  const totalPaid = invoices
    .filter((i: any) => i.status === "PAID")
    .reduce((sum: number, i: any) => sum + i.amount, 0);
  
  const pendingAmount = invoices
    .filter((i: any) => i.status === "PENDING" || i.status === "OVERDUE")
    .reduce((sum: number, i: any) => sum + i.amount, 0);

  const lastInvoice = invoices.find((i: any) => i.status === "PAID");
  
  const stats = {
    totalPaid,
    pendingAmount,
    totalInvoices: invoices.length,
    paidCount: invoices.filter((i: any) => i.status === "PAID").length,
    pendingCount: invoices.filter((i: any) => i.status === "PENDING" || i.status === "OVERDUE").length,
    lastPayment: lastInvoice?.amount || 0,
    lastDate: lastInvoice ? new Date(lastInvoice.paidDate || lastInvoice.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : null
  };

  const settings = workspace.siteSettings as any;

  return (
    <StudentFeesClient 
      invoices={invoices}
      stats={stats}
      settings={settings}
      tenant={tenant}
      workspace={workspace}
      studentProfile={studentProfile}
      paymentConfig={paymentConfig}
    />
  );
}

