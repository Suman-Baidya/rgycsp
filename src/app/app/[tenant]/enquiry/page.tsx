import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { WorkspaceNavbar } from "@/components/layout/WorkspaceNavbar";
import { WorkspaceFooter } from "@/components/layout/WorkspaceFooter";
import { WorkspacePageHeader } from "@/components/layout/WorkspacePageHeader";
import { CustomThemeStyle } from "@/components/providers/CustomThemeStyle";
import { auth } from "@/auth";
import { Phone, Mail, MapPin, Clock, MessageSquareText } from "lucide-react";
import { FranchiseEnquiryForm } from "@/components/enquiry/FranchiseEnquiryForm";

export const dynamic = "force-dynamic";

export default async function WorkspaceEnquiryPage({
  params
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;

  const workspace = await db.workspace.findUnique({
    where: { subdomain: tenant?.toLowerCase() },
    include: {
      siteSettings: true
    }
  });

  if (!workspace || !workspace.siteSettings) notFound();

  const session = await auth();

  return (
    <div className="flex flex-col min-h-screen font-sans bg-background">
      <CustomThemeStyle 
        primaryColor={workspace.siteSettings.primaryColor || undefined} 
        accentColor={workspace.siteSettings.accentColor || undefined} 
        fontFamily={workspace.siteSettings.fontFamily || undefined} 
      />
      
      <WorkspaceNavbar settings={workspace.siteSettings} user={session?.user} tenant={tenant} />

      <main className="flex-1 w-full">
        <WorkspacePageHeader 
          title="Online Enquiry"
          description="Have questions regarding courses, admissions, or fees? Send us an inquiry and our team will get back to you promptly."
          bgImage={workspace.siteSettings.pageHeaderBanner || "https://images.unsplash.com/photo-1534536281715-e28d76689b4d?q=80&w=2070"}
          statusTitle="ONLINE"
          statusSub="Admission Desk"
          breadcrumbs={[
            { name: "Enquiry", href: "/enquiry" }
          ]}
        />

        <div className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Info Side */}
          <div className="space-y-10">
            <div className="space-y-4 text-center lg:text-left">
              <div className="inline-flex items-center gap-3 text-primary font-black tracking-[0.2em] text-[10px] uppercase">
                <div className="h-0.5 w-10 bg-primary" />
                Admission Desk
              </div>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                Quick Enquiry & Counseling
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
                We are dedicated to guiding you through your career training. Submit your query or reach us directly via phone or email.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <Phone className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Direct Helpline</h4>
                <p className="text-base font-bold text-slate-900 dark:text-white">{workspace.siteSettings.contactPhone || "89448 97472"}</p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <Mail className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Email Desk</h4>
                <p className="text-base font-bold text-slate-900 dark:text-white break-words">{workspace.siteSettings.contactEmail || "info@rgycsp.com"}</p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <MapPin className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Campus Center</h4>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">{workspace.siteSettings.address || "Authorized Study Center Campus"}</p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <Clock className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Working Hours</h4>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Mon - Sat: 9:00 AM - 6:00 PM</p>
              </div>
            </div>
          </div>

          {/* Real Interactive Form Side */}
          <div className="p-8 sm:p-10 rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <MessageSquareText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Submit Online Enquiry</h3>
                <p className="text-xs text-slate-500">Fill out this quick form and our admissions team will respond.</p>
              </div>
            </div>

            <FranchiseEnquiryForm workspaceId={workspace.id} />
          </div>
        </div>
      </main>

      <WorkspaceFooter settings={workspace.siteSettings} tenant={tenant} />
    </div>
  );
}
