import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getCourses } from "@/app/actions/courses";
import CourseList from "./CourseList";

// Trigger refresh to resolve HMR stale cache issue
export default async function CoursesPage({
  params
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;

  const workspace = await db.workspace.findUnique({
    where: { subdomain: tenant }
  });

  if (!workspace) notFound();

  const coursesResult = await getCourses(workspace.id);

  return (
    <div className="p-4 lg:p-10">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Courses & Batches</h1>
          <p className="text-muted-foreground mt-1">Design your curriculum, manage batches, and set pricing.</p>
        </div>
      </div>
      
      <CourseList 
        workspaceId={workspace.id} 
        initialCourses={coursesResult.success ? coursesResult.data : []} 
      />
    </div>
  );
}
