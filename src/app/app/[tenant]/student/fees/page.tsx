import { getStudentProfile } from "@/app/actions/student";
import { getWorkspaceByTenant } from "@/lib/workspace";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, Receipt, CreditCard, Download, ArrowUpRight, History } from "lucide-react";
import { Button } from "@/components/ui/button";

import StudentFeesClient from "@/components/student/StudentFeesClient";

export default async function StudentFeesPage({
  params
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  const workspace = await getWorkspaceByTenant(tenant);
  if (!workspace) redirect("/");

  const result = await getStudentProfile(workspace.id);
  if (!result.success) redirect(`/app/${tenant}/student/dashboard`);

  const student = result.data as any;
  if (!student) redirect(`/app/${tenant}/student/dashboard`);
  const invoices = student.studentProfile?.invoices || [];

  const totalPaid = invoices
    .filter((i: any) => i.status === "PAID")
    .reduce((sum: number, i: any) => sum + i.amount, 0);
  
  const pendingAmount = invoices
    .filter((i: any) => i.status !== "PAID" && i.status !== "CANCELLED")
    .reduce((sum: number, i: any) => sum + i.amount, 0);

  const lastInvoice = invoices.find((i: any) => i.status === "PAID");
  
  const stats = {
    totalPaid,
    pendingAmount,
    lastPayment: lastInvoice?.amount || 0,
    lastDate: lastInvoice ? new Date(lastInvoice.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit' }) : null
  };

  const settings = workspace.siteSettings as any;

  return (
    <StudentFeesClient 
      invoices={invoices}
      stats={stats}
      settings={settings}
      tenant={tenant}
    />
  );
}

import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
