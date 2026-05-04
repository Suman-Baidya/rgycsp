import { getWorkspaceByTenant } from "@/lib/workspace";
import { redirect } from "next/navigation";
import StudentExamsClient from "@/components/student/StudentExamsClient";

export default async function StudentExamsPage({
  params
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  const workspace = await getWorkspaceByTenant(tenant);
  if (!workspace) redirect("/");

  const workspaceSettings = workspace.siteSettings as any;

  return (
    <StudentExamsClient 
      settings={workspaceSettings}
      tenant={tenant}
    />
  );
}
