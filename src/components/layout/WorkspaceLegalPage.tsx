import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { WorkspaceNavbar } from "@/components/layout/WorkspaceNavbar";
import { WorkspaceFooter } from "@/components/layout/WorkspaceFooter";
import { WorkspacePageHeader } from "@/components/layout/WorkspacePageHeader";
import { CustomThemeStyle } from "@/components/providers/CustomThemeStyle";
import { auth } from "@/auth";
import { ShieldCheck, Scale, FileText, Clock, AlertCircle } from "lucide-react";
import ReactMarkdown from 'react-markdown';

interface LegalPageProps {
  tenant: string;
  type: 'legal-privacy' | 'legal-terms' | 'legal-cookie';
  title: string;
  defaultContent: string;
}

export async function WorkspaceLegalPage({ tenant, type, title, defaultContent }: LegalPageProps) {
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
  
  // Find legal data from sections
  const legalData = workspace.siteSettings.sections.find(s => s.type === type);
  const content = (legalData?.content as any)?.text || defaultContent;

  const iconMap: any = {
    'legal-privacy': ShieldCheck,
    'legal-terms': Scale,
    'legal-cookie': FileText
  };
  const Icon = iconMap[type] || FileText;

  return (
    <div className="flex flex-col min-h-screen font-sans bg-background selection:bg-primary/30">
      <CustomThemeStyle 
        primaryColor={workspace.siteSettings.primaryColor || undefined} 
        accentColor={workspace.siteSettings.accentColor || undefined} 
        fontFamily={workspace.siteSettings.fontFamily || undefined} 
      />
      
      <WorkspaceNavbar settings={workspace.siteSettings} user={session?.user} />

      <main className="flex-1 w-full relative overflow-hidden">
        {/* Advanced Background Orbs */}
        <div className="absolute top-0 left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-[-10%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

        <WorkspacePageHeader 
          title={legalData?.title || title}
          description={legalData?.subtitle || `Last updated: ${new Date(legalData?.updatedAt || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
          bgImage={workspace.siteSettings.pageHeaderBanner || "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2070"}
          statusTitle="OFFICIAL"
          statusSub="Legal Documentation"
          breadcrumbs={[
            { name: "Legal", href: "#" },
            { name: title, href: "" }
          ]}
        />

        <div className="max-w-4xl mx-auto px-6 py-24 relative z-10">
          <div className="bg-white dark:bg-zinc-900 rounded-[3rem] p-10 lg:p-20 shadow-2xl shadow-black/5 border border-border/40 relative overflow-hidden group">
             {/* Decorative Icon */}
             <div className="absolute -top-10 -right-10 opacity-[0.03] dark:opacity-[0.05] group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                <Icon className="w-80 h-80 text-primary" />
             </div>

             <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tight prose-p:text-zinc-600 dark:prose-p:text-zinc-400 prose-p:leading-relaxed prose-strong:text-zinc-900 dark:prose-strong:text-white">
                {legalData?.content && (legalData.content as any).html ? (
                  <div dangerouslySetInnerHTML={{ __html: (legalData.content as any).html }} />
                ) : (
                  <ReactMarkdown>{content}</ReactMarkdown>
                )}
             </div>

             {/* Disclaimer Footer */}
             <div className="mt-20 pt-10 border-t border-border/40 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0 border border-orange-500/20">
                   <AlertCircle className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                   <h5 className="font-black text-sm uppercase tracking-widest text-primary mb-2">Notice</h5>
                   <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">This document is provided for informational purposes only and does not constitute legal advice. By using our services, you agree to the terms outlined in this document.</p>
                </div>
             </div>
          </div>
        </div>
      </main>

      <WorkspaceFooter settings={workspace.siteSettings} tenant={tenant} />
    </div>
  );
}
