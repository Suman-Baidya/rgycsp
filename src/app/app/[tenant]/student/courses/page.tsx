import { getStudentProfile } from "@/app/actions/student";
import { getWorkspaceByTenant } from "@/lib/workspace";
import { redirect } from "next/navigation";
import { getServerTenantLink } from "@/lib/routing-server";
import { db } from "@/lib/prisma";
import StudentCoursesClient from "@/components/student/StudentCoursesClient";

export default async function StudentCoursesPage({
  params
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  const workspace = await getWorkspaceByTenant(tenant);
  if (!workspace) redirect(await getServerTenantLink("/", tenant));

  const result = await getStudentProfile(workspace.id);
  if (!result.success) redirect(await getServerTenantLink("/student/dashboard", tenant));

  const student = result.data as any;
  if (!student) redirect(await getServerTenantLink("/student/dashboard", tenant));
  const profile = student.studentProfile;
  const currentCourse = profile?.course || profile?.batch?.course;

  const allProfiles = student.studentProfiles || [];
  const completedProfiles = allProfiles.filter((p: any) => p.status === "PASS_OUT");
  const activeProfiles = allProfiles.filter((p: any) => p.status !== "PASS_OUT");

  const enrolledCourseIds = allProfiles.map((p: any) => p.courseId).filter(Boolean);

  // Fetch available courses in the center for re-admission / enrollment
  const otherCourses = await db.course.findMany({
    where: { 
      workspaceId: workspace.id,
      isActive: true,
      ...(enrolledCourseIds.length > 0 ? { id: { notIn: enrolledCourseIds } } : {})
    },
    orderBy: {
      title: 'asc'
    }
  });

  const settings = workspace.siteSettings as any;

  return (
    <StudentCoursesClient 
      currentCourse={currentCourse}
      otherCourses={otherCourses}
      profile={profile}
      activeProfiles={activeProfiles}
      completedProfiles={completedProfiles}
      student={student}
      settings={settings}
      tenant={tenant}
      workspace={workspace}
    />
  );
}
