import { getStudentProfile } from "@/app/actions/student";
import { getWorkspaceByTenant } from "@/lib/workspace";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calendar, Clock, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/prisma";

import StudentCoursesClient from "@/components/student/StudentCoursesClient";

export default async function StudentCoursesPage({
  params
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  const workspace = await getWorkspaceByTenant(tenant);
  if (!workspace) redirect("/");

  const result = await getStudentProfile(workspace.id);
  if (!result.success) redirect(`/app/${tenant}/student/dashboard`);

  const student = result.data as any;
  if (!student) redirect(`/app/${tenant}/student/dashboard`);
  const profile = student.studentProfile;
  const currentCourse = profile?.batch?.course;

  // Fetch other courses for discovery
  const otherCourses = await db.course.findMany({
    where: { 
      workspaceId: workspace.id,
      id: { not: currentCourse?.id || "" }
    },
    take: 3
  });

  const settings = workspace.siteSettings as any;

  return (
    <StudentCoursesClient 
      currentCourse={currentCourse}
      otherCourses={otherCourses}
      profile={profile}
      settings={settings}
      tenant={tenant}
    />
  );
}
