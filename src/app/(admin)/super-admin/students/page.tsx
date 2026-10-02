import { getAllPlatformStudents } from "@/app/actions/students";
import { getWorkspaces } from "@/app/actions/workspaces";
import { getRegistrationConfig } from "@/app/actions/registration-config";
import { processPendingAutoCertificateIssues } from "@/app/actions/student-documents";
import StudentsClient from "./StudentsClient";

export const dynamic = "force-dynamic";

export default async function SuperAdminStudentsPage() {
  // Proactively process any timer-expired certificate requests
  await processPendingAutoCertificateIssues();

  const [studentsRes, wsRes, initialConfig] = await Promise.all([
    getAllPlatformStudents(),
    getWorkspaces(),
    getRegistrationConfig()
  ]);

  const initialStudents = studentsRes.data ?? [];
  const initialWorkspaces = wsRes.data ?? [];

  return (
    <div className="w-full">
      <StudentsClient 
        initialStudents={initialStudents} 
        initialWorkspaces={initialWorkspaces}
        initialConfig={initialConfig}
      />
    </div>
  );
}
