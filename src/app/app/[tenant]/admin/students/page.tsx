import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getStudents } from "@/app/actions/students";
import StudentList from "./StudentList";

export default async function StudentsPage({
  params
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;

  const workspace = await db.workspace.findUnique({
    where: { subdomain: tenant }
  });

  if (!workspace) notFound();

  const studentsResult = await getStudents(workspace.id);
  const batches = await db.batch.findMany({
    where: { workspaceId: workspace.id },
    select: { id: true, name: true }
  });

  return (
    <div className="p-4 lg:p-10">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Students Management</h1>
          <p className="text-muted-foreground mt-1">Manage enrollments, batches, and student records.</p>
        </div>
      </div>
      
      <StudentList 
        workspaceId={workspace.id} 
        initialStudents={studentsResult.success ? studentsResult.data : []} 
        batches={batches}
      />
    </div>
  );
}
