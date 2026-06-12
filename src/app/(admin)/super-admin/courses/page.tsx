import { getGlobalCourses } from "@/app/actions/globalCourse";
import { getGlobalCourseGroups } from "@/app/actions/globalCourseGroup";
import CoursesClient from "./CoursesClient";

export default async function SuperAdminCoursesPage() {
  // Fetch initial courses (page 1, default limits)
  const initialData = await getGlobalCourses("", "all", 1, 10);
  const groupsRes = await getGlobalCourseGroups();
  const initialGroups = groupsRes.success ? groupsRes.groups : [];

  return (
    <div className="w-full">
      <CoursesClient initialData={initialData} initialGroups={initialGroups} />
    </div>
  );
}
