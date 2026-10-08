import { findWorkspaceByTenant } from "@/lib/workspace";
import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { WorkspaceNavbar } from "@/components/layout/WorkspaceNavbar";
import { WorkspaceFooter } from "@/components/layout/WorkspaceFooter";
import { WorkspacePageHeader } from "@/components/layout/WorkspacePageHeader";
import { CustomThemeStyle } from "@/components/providers/CustomThemeStyle";
import { auth } from "@/auth";
import { DEFAULT_WORKSPACE_NOTICES } from "@/lib/workspace-defaults";
import { findNoticeBySlug, getNoticeSlug, normalizeNotices, WorkspaceNotice } from "@/lib/notice-utils";
import { getServerTenantLink } from "@/lib/routing-server";
import {
  Bell,
  Calendar,
  ArrowLeft,
  ExternalLink,
  Tag,
  ShieldCheck,
  ChevronRight,
  Share2,
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function WorkspaceNoticeDetailPage({
  params
}: {
  params: Promise<{ tenant: string; noticeId: string }>;
}) {
  const { tenant, noticeId } = await params;

  // AGENTS.md Rule 0: Always use findWorkspaceByTenant
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

  const session = await auth();

  const aboutSection = workspaceSettings.sections.find((s) => s.type === "about");
  const rawNotices = (aboutSection?.content as any)?.notices || [];
  const baseNotices =
    rawNotices && rawNotices.length > 0 ? rawNotices : DEFAULT_WORKSPACE_NOTICES;
  const notices: WorkspaceNotice[] = normalizeNotices(baseNotices);

  const match = findNoticeBySlug(notices, noticeId);

  if (!match) {
    // If not found, render a friendly state with proper WorkspacePageHeader
    const backNoticeLink = await getServerTenantLink("/notice", tenant);
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
            title="Notice Circular"
            description="Official circulars, announcements, and notices from our institute."
            bgImage={(workspaceSettings as any).pageHeaderBanner || undefined}
            breadcrumbs={[
              { name: "Notice Board", href: "/notice" },
              { name: "Notice Details", href: "#" }
            ]}
          />

          <section className="py-16 sm:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
              <Bell className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Notice Not Found
              </h1>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                The notice circular you are looking for may have been archived, updated, or removed.
              </p>
            </div>
            <div>
              <Link href={backNoticeLink}>
                <Button className="rounded-xl px-6 h-10 gap-2 font-bold text-xs">
                  <ArrowLeft className="w-4 h-4" /> Return to Notice Board
                </Button>
              </Link>
            </div>
          </section>
        </main>
        
        <WorkspaceFooter settings={workspaceSettings} tenant={tenant} user={session?.user} />
      </div>
    );
  }

  const { notice, index } = match;

  // Multi-tenant safe links (AGENTS.md Rule 1)
  const noticeListLink = await getServerTenantLink("/notice", tenant);
  const contactLink = await getServerTenantLink("/contact", tenant);
  const enquiryLink = await getServerTenantLink("/enquiry", tenant);

  // Prepare other notices for sidebar - Keep only 3 latest notices
  const otherNotices = notices.filter((_, i) => i !== index).slice(0, 3);
  const otherNoticesWithLinks = await Promise.all(
    otherNotices.map(async (item) => {
      const itemOriginalIndex = notices.findIndex((n) => n === item);
      const slug = getNoticeSlug(item, itemOriginalIndex);
      const href = await getServerTenantLink(`/notice/${slug}`, tenant);
      return {
        ...item,
        href
      };
    })
  );


  const paragraphs = notice.description
    ? notice.description.split("\n").filter((p) => p.trim().length > 0)
    : [
        `This is an official communication regarding "${notice.title}". All concerned students, faculty members, and staff are requested to take note of this announcement.`,
        `Please ensure adherence to the guidelines and schedules stipulated by the institute administration. For any additional clarification, reach out to the campus administrative helpdesk.`
      ];

  const hasExternalDocument =
    notice.link &&
    notice.link.trim() !== "" &&
    notice.link.trim() !== "#" &&
    !notice.link.startsWith("/notice");

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
          title={notice.title}
          description={`${notice.category || "Official Circular"} • Published on ${notice.date || "Recent"}`}
          bgImage={(workspaceSettings as any).pageHeaderBanner || undefined}
          breadcrumbs={[
            { name: "Notice Board", href: "/notice" },
            { name: notice.title, href: "#" }
          ]}
        />

        <section className="py-10 sm:py-14 lg:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* Main Content Area (8 Cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Back to Notice Board Button */}
              <div>
                <Link
                  href={noticeListLink}
                  className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-primary transition-colors py-1 group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <span>Back to All Circulars</span>
                </Link>
              </div>

              {/* Main Notice Document Card */}
              <Card className="border border-slate-200/80 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
                <CardContent className="p-6 sm:p-8 md:p-10 space-y-6">
                  {/* Meta Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                        <Tag className="w-3 h-3" />
                        {notice.category || "General"}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {notice.date || "Recent"}
                      </span>
                    </div>

                    <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200/60 dark:border-emerald-800/40">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Official Circular
                    </div>
                  </div>

                  {/* Notice Title */}
                  <div className="space-y-2">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white leading-snug tracking-tight">
                      {notice.title}
                    </h1>
                  </div>

                  {/* Body Paragraphs */}
                  <div className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed space-y-4">
                    {paragraphs.map((para, i) => (
                      <p key={i} className="whitespace-pre-line">
                        {para}
                      </p>
                    ))}
                  </div>

                  {/* External Document / Circular Attachment (if available) */}
                  {hasExternalDocument && (
                    <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-primary/5 border border-primary/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                            Official Attachment / Reference
                          </h4>
                          <p className="text-[11px] text-slate-500 font-medium">
                            Access additional circular files or destination portal
                          </p>
                        </div>
                      </div>
                      <a
                        href={notice.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto"
                      >
                        <Button className="w-full sm:w-auto rounded-xl h-9 px-4 text-xs font-bold gap-2">
                          <span>View Reference</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      </a>
                    </div>
                  )}

                  {/* Administrative Verification Footer */}
                  <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>
                        Issued by: <strong>{workspace.name}</strong>
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Center Code:{" "}
                      <span className="font-mono font-bold text-slate-600 dark:text-slate-300">
                        {workspace.centerCode || workspace.subdomain}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bottom Quick Navigation */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <Link href={noticeListLink}>
                  <Button variant="outline" className="rounded-xl h-10 px-4 text-xs font-bold gap-2">
                    <ArrowLeft className="w-4 h-4" /> All Notices
                  </Button>
                </Link>
                <div className="flex items-center gap-2">
                  <Link href={enquiryLink}>
                    <Button variant="outline" className="rounded-xl h-10 px-4 text-xs font-bold">
                      Submit Enquiry
                    </Button>
                  </Link>
                  <Link href={contactLink}>
                    <Button className="rounded-xl h-10 px-4 text-xs font-bold">
                      Contact Center
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Sidebar (4 Cols) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Other Circulars Card */}
              {otherNoticesWithLinks.length > 0 && (
                <Card className="border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
                  <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-primary" />
                      <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                        Other Announcements
                      </h3>
                    </div>
                    <Link
                      href={noticeListLink}
                      className="text-[11px] font-bold text-primary hover:underline"
                    >
                      View All
                    </Link>
                  </div>
                  <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800/60">
                    {otherNoticesWithLinks.map((other, idx) => (
                      <Link
                        key={`${other.id || 'other'}-${idx}`}
                        href={other.href}
                        className="p-4 block hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            {other.category || "General"}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {other.date}
                          </span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors line-clamp-2">
                          {other.title}
                        </h4>
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Center Information / Help Desk */}
              <Card className="border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm bg-slate-50/60 dark:bg-slate-900/60 p-5 space-y-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                    Need Clarification?
                  </h3>
                  <p className="text-xs text-slate-500">
                    If you have questions regarding this notice or need official verification, our
                    administrative desk is here to help.
                  </p>
                </div>

                <div className="space-y-2.5 pt-2 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-200/60 dark:border-slate-800">
                  {workspaceSettings.contactPhone && (
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>{workspaceSettings.contactPhone}</span>
                    </div>
                  )}
                  {workspaceSettings.contactEmail && (
                    <div className="flex items-center gap-2.5">
                      <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="truncate">{workspaceSettings.contactEmail}</span>
                    </div>
                  )}
                  {workspaceSettings.address && (
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{workspaceSettings.address}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <Link href={contactLink} className="w-full block">
                    <Button
                      variant="outline"
                      className="w-full rounded-xl h-9 text-xs font-bold border-slate-200 dark:border-slate-700"
                    >
                      Contact Information
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <WorkspaceFooter settings={workspaceSettings} tenant={tenant} user={session?.user} />
    </div>
  );
}
