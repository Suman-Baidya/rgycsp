import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { MainFooter } from "@/components/layout/MainFooter";
import { PageHeader } from "@/components/layout/PageHeader";
import { db } from "@/lib/prisma";
import { auth } from "@/auth";

export default async function CoursesPage() {
  const session = await auth();
  const settings = await db.siteSettings.findFirst({
    where: { workspaceId: null },
    include: {
      sections: {
        orderBy: { order: "asc" }
      }
    }
  });

  if (!settings) {
    return <div>Site configuration missing. Please check the dashboard.</div>;
  }

  const isSectionActive = (type: string) => {
    return settings.sections.find(s => s.type === type)?.isActive ?? true;
  };

  const getSectionData = (type: string) => {
    return settings.sections.find(s => s.type === type);
  };

  // Fetch some courses across workspaces to display globally
  const globalCourses = await db.course.findMany({
    where: { isActive: true },
    take: 9,
    include: {
      workspace: { select: { name: true, subdomain: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <LandingNavbar settings={settings} user={session?.user} />

      <main className="flex-1">
        {isSectionActive("page-header-courses") && (
          <PageHeader
            data={getSectionData("page-header-courses")}
            title="Explore Our Courses"
            subtitle="Discover a wide range of industry-aligned courses designed for your success."
            bgImage="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070"
            breadcrumb="Courses"
          />
        )}

        <section className="py-20 bg-background relative overflow-hidden">
           <div className="max-w-7xl mx-auto px-6 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {globalCourses.map((course) => (
                  <div key={course.id} className="bg-card border border-border/50 rounded-[2rem] overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 group">
                    <div className="h-48 bg-muted relative overflow-hidden">
                       {course.image ? (
                         <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                       ) : (
                         <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold">No Image</div>
                       )}
                       <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                         {course.category || "General"}
                       </div>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                         <span className="text-xs font-bold text-primary uppercase tracking-wider">{course.duration || "Self-Paced"}</span>
                         <span className="text-sm font-black text-foreground">₹{course.feeAmount}</span>
                      </div>
                      <h3 className="text-xl font-bold line-clamp-2">{course.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-3">{course.description || "No description provided."}</p>
                      <div className="pt-4 border-t border-border/50 flex items-center justify-between text-xs font-semibold text-muted-foreground">
                        <span>Offered by:</span>
                        <span className="text-foreground">{course.workspace.name}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {globalCourses.length === 0 && (
                <div className="text-center py-20 text-muted-foreground font-medium">
                  No courses available at the moment.
                </div>
              )}
           </div>
        </section>

      </main>

      <MainFooter settings={settings} />
    </div>
  );
}
