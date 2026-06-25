import { getAllPlatformStudents } from "@/app/actions/students";
import { getWorkspaces } from "@/app/actions/workspaces";
import StudentsClient from "./StudentsClient";

export default async function SuperAdminStudentsPage() {
  // Fetch all students
  const studentsRes = await getAllPlatformStudents();
  const initialStudents = studentsRes.data ?? [];

  // Fetch active workspaces (franchise centers)
  const wsRes = await getWorkspaces();
  const initialWorkspaces = wsRes.data ?? [];

  return (
    <div className="w-full">
      <StudentsClient 
        initialStudents={initialStudents} 
        initialWorkspaces={initialWorkspaces}
      />
    </div>
  );
}
