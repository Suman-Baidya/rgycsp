import { getAllPlatformStudents } from "@/app/actions/students";
import { getWorkspaces } from "@/app/actions/workspaces";
import { getRegistrationConfig } from "@/app/actions/registration-config";
import StudentsClient from "./StudentsClient";

export const dynamic = "force-dynamic";

export default async function SuperAdminStudentsPage() {
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
