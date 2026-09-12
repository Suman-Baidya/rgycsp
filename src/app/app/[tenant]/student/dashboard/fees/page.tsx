import { redirect } from "next/navigation";
import { getServerTenantLink } from "@/lib/routing-server";

export default async function StudentDashboardFeesPage({
  params
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  redirect(await getServerTenantLink("/student/fees", tenant));
}
