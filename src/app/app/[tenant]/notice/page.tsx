import { findWorkspaceByTenant } from "@/lib/workspace";
import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { WorkspaceNavbar } from "@/components/layout/WorkspaceNavbar";
import { WorkspaceFooter } from "@/components/layout/WorkspaceFooter";
import { CustomThemeStyle } from "@/components/providers/CustomThemeStyle";
import { auth } from "@/auth";
import { Bell, Calendar, ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WorkspacePageHeader } from "@/components/layout/WorkspacePageHeader";
import { DEFAULT_WORKSPACE_NOTICES } from "@/lib/workspace-defaults";
import { getNoticeSlug } from "@/lib/notice-utils";
import { Tag } from "lucide-react";

import { getServerTenantLink } from "@/lib/routing-server";

export default async function WorkspaceNoticePage({
  params
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;

  const workspace = await findWorkspaceByTenant(tenant);

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
  const rawNotices = (aboutSection?.content as any)?.notices || [];
  const notices = (rawNotices && rawNotices.length > 0)
    ? rawNotices
    : DEFAULT_WORKSPACE_NOTICES;

  const session = await auth();

  const noticesWithLinks = await Promise.all(
    notices.map(async (n: any, idx: number) => {
      const slug = getNoticeSlug(n, idx);
      const detailHref = await getServerTenantLink(`/notice/${slug}`, tenant);
      return {
        ...n,
        slug,
        detailHref
      };
    })
  );

  return (
    <div className="flex flex-col min-h-screen font-sans bg-background selection:bg-primary/30">
      <CustomThemeStyle 
        primaryColor={workspaceSettings.primaryColor || undefined} 
        accentColor={workspaceSettings.accentColor || undefined} 
        fontFamily={workspaceSettings.fontFamily || undefined} 
      />
      <WorkspaceNavbar settings={workspaceSettings} user={session?.user} tenant={tenant} />

      <main className="flex-1 w-full flex flex-col">
        <WorkspacePageHeader 
          title="Notice Board"
          description="Stay updated with the latest news, official circulars, and announcements from our institute."
          bgImage={(workspaceSettings as any).pageHeaderBanner || undefined}
          breadcrumbs={[
            { name: "Notice", href: "/notice" }
          ]}
        />

        <section className="py-12 sm:py-16 lg:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 lg:gap-8">
            {noticesWithLinks.map((notice: any, idx: number) => (
              <Card 
                key={`${notice.id || 'notice'}-${idx}`} 
                className="group overflow-hidden border border-slate-200/80 dark:border-slate-800 hover:border-primary/40 transition-all hover:shadow-xl hover:shadow-primary/5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between"
              >
                <CardContent className="p-5 sm:p-6 space-y-4 sm:space-y-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                          <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        {notice.category && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                            {notice.category}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full shrink-0">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{notice.date || "Recent"}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Link href={notice.detailHref} className="block">
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors leading-snug line-clamp-2">
                          {notice.title}
                        </h3>
                      </Link>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                        {notice.description ||
                          `Latest official communication regarding ${notice.title.toLowerCase()}. Please check the official portal notice details for comprehensive instructions.`}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-auto">
                    <Link href={notice.detailHref} className="inline-flex items-center">
                      <Button variant="ghost" className="p-0 h-auto font-bold text-xs sm:text-sm text-primary gap-1.5 hover:bg-transparent hover:text-primary/80 group/btn">
                        View Details 
                        <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                    <Link href={notice.detailHref}>
                      <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center opacity-60 group-hover:opacity-100 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </div>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <WorkspaceFooter settings={workspaceSettings} tenant={tenant} user={session?.user} />
    </div>
  );
}
