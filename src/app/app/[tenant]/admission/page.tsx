import { db } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { WorkspaceNavbar } from "@/components/layout/WorkspaceNavbar";
import { WorkspaceFooter } from "@/components/layout/WorkspaceFooter";
import { CustomThemeStyle } from "@/components/providers/CustomThemeStyle";
import { WorkspacePageHeader } from "@/components/layout/WorkspacePageHeader";
import { auth } from "@/auth";
import AdmissionLandingClient from "./AdmissionLandingClient";

export default async function AdmissionPage({
  params,
  searchParams
}: {
  params: Promise<{ tenant: string }>;
  searchParams: Promise<{ courseId?: string, fromGlobal?: string }>;
}) {
  const { tenant } = await params;
  const { courseId, fromGlobal } = await searchParams;

  const workspace = await db.workspace.findUnique({
    where: { subdomain: tenant?.toLowerCase() },
    include: {
      siteSettings: true,
      admissionConfig: true,
      courses: {
        where: { isActive: true },
        select: { id: true, title: true }
      }
    }
  });

  if (!workspace || !workspace.siteSettings) notFound();

  // If admission is explicitly disabled
  if (workspace.admissionConfig && !workspace.admissionConfig.isActive) {
    return (
      <div className="flex flex-col min-h-screen font-sans bg-background">
        <CustomThemeStyle 
          primaryColor={workspace.siteSettings.primaryColor || undefined} 
          accentColor={workspace.siteSettings.accentColor || undefined} 
          fontFamily={workspace.siteSettings.fontFamily || undefined} 
        />
        <WorkspaceNavbar settings={workspace.siteSettings} user={(await auth())?.user} tenant={tenant} />
        <main className="flex-1 flex items-center justify-center p-6 text-center">
          <div className="space-y-4 max-w-md bg-white dark:bg-zinc-950 p-10 rounded-3xl shadow-xl border">
            <h1 className="text-4xl font-black tracking-tight">Admissions Closed</h1>
            <p className="text-muted-foreground leading-relaxed">The admission portal is currently closed for {workspace.name}. Please contact the administration for more details.</p>
          </div>
        </main>
        <WorkspaceFooter settings={workspace.siteSettings} tenant={tenant} />
      </div>
    );
  }

  const session = await auth();

  return (
    <div className="flex flex-col min-h-screen font-sans bg-background">
      <CustomThemeStyle 
        primaryColor={workspace.siteSettings.primaryColor || undefined} 
        accentColor={workspace.siteSettings.accentColor || undefined} 
        fontFamily={workspace.siteSettings.fontFamily || undefined} 
      />
      
      <WorkspaceNavbar settings={workspace.siteSettings} user={session?.user} tenant={tenant} />

      <WorkspacePageHeader 
        title="Admission Portal" 
        description={`Welcome to ${workspace.name} Admission Hub. Choose an option below to proceed.`}
        breadcrumbs={[
          { name: "Admission", href: `/app/${tenant}/admission` }
        ]}
        bgImage={workspace.siteSettings.pageHeaderBanner || undefined}
        statusTitle="ENROLL"
        statusSub="Active"
      />

      <main className="flex-1 w-full bg-slate-50 dark:bg-zinc-950 py-16">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <AdmissionLandingClient 
            workspaceId={workspace.id} 
            workspaceName={workspace.name}
            config={workspace.admissionConfig || {}} 
            courses={workspace.courses} 
            logoUrl={workspace.siteSettings.logoUrl}
            initialCourseId={courseId}
            fromGlobal={fromGlobal}
          />
        </div>
      </main>

      <WorkspaceFooter settings={workspace.siteSettings} tenant={tenant} />
    </div>
  );
}
