import { getWorkspaceByTenant } from "@/lib/workspace";
import { redirect } from "next/navigation";
import { getServerTenantLink } from "@/lib/routing-server";
import StudentExamsClient from "@/components/student/StudentExamsClient";
import { getStudentProfile } from "@/app/actions/student";
import { getStudentExams } from "@/app/actions/student-exam";

export default async function StudentExamsPage({
  params
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  const workspace = await getWorkspaceByTenant(tenant);
  if (!workspace) redirect(await getServerTenantLink("/", tenant));

  const workspaceSettings = workspace.siteSettings as any;

  const profileResult = await getStudentProfile(workspace.id);
  const courseId = profileResult.success ? profileResult.data?.studentProfile?.courseId : null;

  const examsResult = await getStudentExams(workspace.id, courseId || null);
  const exams = examsResult.success ? examsResult.data : [];

  return (
    <StudentExamsClient 
      settings={workspaceSettings}
      tenant={tenant}
      exams={exams}
    />
  );
}
