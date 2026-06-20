import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { WorkspaceNavbar } from "@/components/layout/WorkspaceNavbar";
import { WorkspaceFooter } from "@/components/layout/WorkspaceFooter";
import { WorkspacePageHeader } from "@/components/layout/WorkspacePageHeader";
import { CustomThemeStyle } from "@/components/providers/CustomThemeStyle";
import { auth } from "@/auth";
import { Send, Phone, Mail, MapPin } from "lucide-react";

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
          description="Have questions? Send us an enquiry and our team will get back to you within 24 hours."
          bgImage={workspace.siteSettings.pageHeaderBanner || "https://images.unsplash.com/photo-1534536281715-e28d76689b4d?q=80&w=2070"}
          statusTitle="ONLINE"
          statusSub="Admission Desk"
          breadcrumbs={[
            { name: "Enquiry", href: "/enquiry" }
          ]}
        />

        <div className="max-w-7xl mx-auto px-6 py-32 grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div className="space-y-12">
            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-3 text-primary font-black tracking-[0.2em] text-[10px] uppercase">
                <div className="h-0.5 w-10 bg-primary" />
                Contact Us
              </div>
              <h2 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                Quick Enquiry & Support
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                We're here to help you navigate your academic journey. Fill out the form or reach us through our direct channels.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div className="p-8 rounded-[2rem] bg-slate-50 dark:bg-zinc-900 border border-border/40 space-y-4">
                  <Phone className="w-6 h-6 text-primary" />
                  <h4 className="font-black text-sm uppercase tracking-widest">Call Us</h4>
                  <p className="text-xl font-bold text-slate-700 dark:text-slate-300">{workspace.siteSettings.contactPhone || "89448 97472"}</p>
               </div>
               <div className="p-8 rounded-[2rem] bg-slate-50 dark:bg-zinc-900 border border-border/40 space-y-4">
                  <Mail className="w-6 h-6 text-primary" />
                  <h4 className="font-black text-sm uppercase tracking-widest">Email Us</h4>
                  <p className="text-xl font-bold text-slate-700 dark:text-slate-300 break-words">{workspace.siteSettings.contactEmail || "info@rgycsp.com"}</p>
               </div>
            </div>
          </div>

          <div className="p-12 rounded-[3.5rem] bg-white dark:bg-zinc-900 border border-border/40 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10 space-y-10 text-center py-20">
               <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto animate-pulse">
                  <Send className="w-10 h-10" />
               </div>
               <div className="space-y-4">
                  <h3 className="text-3xl font-black">Enquiry Form</h3>
                  <p className="text-muted-foreground font-medium uppercase tracking-widest text-[10px]">Portal Under Maintenance</p>
               </div>
               <p className="text-slate-500 max-w-sm mx-auto font-medium">
                  The online enquiry system is being upgraded. Please contact us via phone or email for immediate assistance.
               </p>
            </div>
          </div>
        </div>
      </main>

      <WorkspaceFooter settings={workspace.siteSettings} />
    </div>
  );
}
