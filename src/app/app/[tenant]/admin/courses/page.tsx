import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getGlobalCoursesForFranchise } from "@/app/actions/courses";
import CourseList from "./CourseList";

import { AdminPageHeader } from "@/components/layout/AdminPageHeader";

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

  const coursesResult = await getGlobalCoursesForFranchise(workspace.id);

  return (
    <div className="p-4 lg:px-10 lg:py-10 max-w-7xl mx-auto space-y-10">
      <AdminPageHeader 
        title="Courses Catalog" 
        description="Browse available courses and enable them for your franchise."
      />
      
      <CourseList 
        workspaceId={workspace.id} 
        initialCourses={coursesResult.data ?? []} 
        tenant={tenant}
      />
    </div>
  );
}
