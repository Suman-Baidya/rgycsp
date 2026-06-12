import { getGlobalCourses } from "@/app/actions/globalCourse";
import { getGlobalCourseGroups } from "@/app/actions/globalCourseGroup";
import CoursesPageClient from "./CoursesPageClient";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { MainFooter } from "@/components/layout/MainFooter";
import { db } from "@/lib/prisma";
import { auth } from "@/auth";
import { CustomThemeStyle } from "@/components/providers/CustomThemeStyle";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata = {
  title: "Explore Courses | ABCD Edu Hub",
  description: "Browse our comprehensive list of professional courses and programs.",
};

export default async function CoursesPage() {
  const session = await auth();
  const settings = await db.siteSettings.findFirst({
    where: { workspaceId: null },
  });

  // Fetch initial page of courses
  const initialData = await getGlobalCourses("", "all", 1, 12, true);
  const groupsRes = await getGlobalCourseGroups();
  const initialGroups = groupsRes.success ? groupsRes.groups : [];

  return (
    <div className="flex flex-col min-h-screen font-sans bg-slate-50 dark:bg-zinc-950 selection:bg-primary/30">
      {settings && <CustomThemeStyle primaryColor={settings.primaryColor || undefined} accentColor={settings.accentColor || undefined} />}
      <LandingNavbar settings={settings} user={session?.user} />
      
      <main className="flex-1 w-full pb-24 relative z-10">
        <PageHeader
          title="Explore Our Courses"
          subtitle="Find the perfect course to advance your career. Use our smart filters to narrow down your choices based on your interests and goals."
          bgImage="https://cdn.pixabay.com/photo/2015/07/17/22/43/student-849825_1280.jpg"
          breadcrumb="Courses"
        />
        <div className="pt-16">
          <CoursesPageClient initialData={initialData} initialGroups={initialGroups} />
        </div>
      </main>

      <MainFooter settings={settings} />
    </div>
  );
}
