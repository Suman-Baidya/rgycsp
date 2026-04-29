import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { WorkspaceNavbar } from "@/components/layout/WorkspaceNavbar";
import { LandingFooter } from "@/components/layout/LandingFooter";
import { CustomThemeStyle } from "@/components/providers/CustomThemeStyle";
import { auth } from "@/auth";
import { Bell, Calendar, ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WorkspacePageHeader } from "@/components/layout/WorkspacePageHeader";

export default async function WorkspaceNoticePage({
  params
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;

  const workspace = await db.workspace.findUnique({
    where: { subdomain: tenant }
  });

  if (!workspace) notFound();

  const workspaceSettings = await db.siteSettings.findFirst({
    where: { workspaceId: workspace.id },
    include: {
      sections: {
        orderBy: { order: "asc" }
      }
    }
  });

  if (!workspaceSettings) notFound();

  const getSectionData = (type: string) => {
    return workspaceSettings.sections.find(s => s.type === type);
  };

  const aboutSection = getSectionData("about");
  const notices = (aboutSection?.content as any)?.notices || [];
  const session = await auth();

  return (
    <div className="flex flex-col min-h-screen font-sans bg-background selection:bg-primary/30">
      <CustomThemeStyle 
        primaryColor={workspaceSettings.primaryColor || undefined} 
        accentColor={workspaceSettings.accentColor || undefined} 
        fontFamily={workspaceSettings.fontFamily || undefined} 
      />
      <WorkspaceNavbar settings={workspaceSettings} user={session?.user} />

      <main className="flex-1 w-full flex flex-col">
        <WorkspacePageHeader 
          title="Notice Board"
          description="Stay updated with the latest news, events, and announcements from our institute."
          bgImage={(workspaceSettings as any).pageHeaderBanner || undefined}
          breadcrumbs={[
            { name: "Notice", href: "/notice" }
          ]}
        />

        <section className="py-24 px-6 container mx-auto">
          {notices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {notices.map((notice: any, idx: number) => (
                <Card key={idx} className="group overflow-hidden border-primary/10 hover:border-primary/30 transition-all hover:shadow-2xl hover:shadow-primary/5 rounded-[2rem] bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Bell className="w-6 h-6" />
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground bg-muted px-4 py-2 rounded-full">
                        <Calendar className="w-3.5 h-3.5" />
                        {notice.date}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                        {notice.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                        Latest update from the management regarding {notice.title.toLowerCase()}. Please check the details for more information.
                      </p>
                    </div>

                    <div className="pt-4 border-t border-border/40 flex items-center justify-between">
                      <Link href={notice.link || "#"} target="_blank">
                        <Button variant="ghost" className="p-0 h-auto font-bold text-primary gap-2 hover:bg-transparent group/btn">
                          View Details 
                          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <ExternalLink className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 space-y-6">
              <div className="w-24 h-24 rounded-[2rem] bg-muted flex items-center justify-center mx-auto">
                 <Bell className="w-12 h-12 text-muted-foreground/30" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">No active notices</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  We don't have any announcements at the moment. Please check back later for updates.
                </p>
              </div>
              <Link href="/">
                <Button className="rounded-full px-8 h-12 font-bold gap-2">
                  Return Home
                </Button>
              </Link>
            </div>
          )}
        </section>
      </main>

      <LandingFooter settings={workspaceSettings} />
    </div>
  );
}
