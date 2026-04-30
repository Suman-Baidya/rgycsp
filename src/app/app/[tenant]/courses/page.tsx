import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { WorkspaceNavbar } from "@/components/layout/WorkspaceNavbar";
import { WorkspaceFooter } from "@/components/layout/WorkspaceFooter";
import { WorkspacePageHeader } from "@/components/layout/WorkspacePageHeader";
import { CustomThemeStyle } from "@/components/providers/CustomThemeStyle";
import { auth } from "@/auth";
import { CoursesList } from "./CoursesList";

export default async function WorkspaceCoursesPage({
  params
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;

  const workspace = await db.workspace.findUnique({
    where: { subdomain: tenant },
    include: {
      siteSettings: {
        include: {
          sections: true
        }
      }
    }
  });

  if (!workspace || !workspace.siteSettings) notFound();

  const session = await auth();
  
  // Find the courses section in landing sections
  const coursesSection = workspace.siteSettings.sections.find(s => s.type === "courses");

  // Fetch all courses from the LMS Course model
  const allDbCourses = await db.course.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: 'desc' }
  });

  const dbCourses = allDbCourses.filter(c => (c as any).isActive !== false);

  // Map db courses to the format expected by CoursesList
  const initialCourses = dbCourses.map((c: any) => ({
    ...c,
    category: c.category || "General",
    duration: c.duration || "Self-paced",
    image: c.image || null,
    fee: `₹${c.feeAmount}`,
    description: c.description || "",
    lessons: (c as any).topics ? ((c as any).topics as any[]).reduce((acc: number, t: any) => acc + (t.items?.length || 0), 0).toString() : "12"
  }));

  return (
    <div className="flex flex-col min-h-screen font-sans bg-background selection:bg-primary/30">
      <CustomThemeStyle 
        primaryColor={workspace.siteSettings.primaryColor || undefined} 
        accentColor={workspace.siteSettings.accentColor || undefined} 
        fontFamily={workspace.siteSettings.fontFamily || undefined} 
      />
      
      <WorkspaceNavbar settings={workspace.siteSettings} user={session?.user} />

      <main className="flex-1 w-full">
        <WorkspacePageHeader 
          title="Our Courses"
          description={coursesSection?.subtitle || "Explore our wide range of professional and academic programs designed for your success."}
          bgImage={workspace.siteSettings.pageHeaderBanner || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070"}
          statusTitle="ONLINE"
          statusSub="Catalog 2026"
          breadcrumbs={[
            { name: "Courses", href: "/courses" }
          ]}
        />

        <div className="max-w-7xl mx-auto px-6 py-24">
          <CoursesList initialCourses={initialCourses} />
        </div>
      </main>

      <WorkspaceFooter settings={workspace.siteSettings} />
    </div>
  );
}
