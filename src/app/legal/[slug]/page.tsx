import { db } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/PageHeader";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { MainFooter } from "@/components/layout/MainFooter";
import { notFound } from "next/navigation";

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sectionType = `legal-${slug}`;

  const settings = await db.siteSettings.findFirst({
    where: { workspaceId: null },
    include: {
      sections: true
    }
  });

  if (!settings) {
    return <div>Site configuration missing.</div>;
  }

  const section = settings.sections.find(s => s.type === sectionType);

  if (section && !section.isActive) {
    notFound();
  }

  if (!section) {
    return (
      <div className="flex flex-col min-h-screen bg-background items-center justify-center p-6 text-center space-y-6">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-4xl">🛠️</div>
        <h1 className="text-3xl font-black">Page Not Initialized</h1>
        <p className="text-muted-foreground max-w-md">The <strong>{slug.replace("-", " ")}</strong> has not been synchronized with your database yet.</p>
        <div className="bg-muted p-6 rounded-2xl border border-border text-sm font-medium text-left">
           <p className="mb-2 font-black uppercase text-[10px] tracking-widest text-primary">Instructions for Admin:</p>
           <ol className="list-decimal list-inside space-y-1">
             <li>Go to your <strong>Super Admin Dashboard</strong>.</li>
             <li>Navigate to <strong>Site Settings</strong> &gt; <strong>Legal Pages</strong>.</li>
             <li>Click the <strong>Sync Missing Sections</strong> button.</li>
             <li>Come back here and refresh!</li>
           </ol>
        </div>
      </div>
    );
  }

  const content = section.content as any;
  const htmlContent = content?.html || "";
  const lastUpdated = content?.lastUpdated || "";

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <LandingNavbar settings={settings} />

      <main className="flex-1">
        <PageHeader 
          title={section.title || slug.replace("-", " ")}
          subtitle={section.subtitle || "Legal Information & Guidelines"}
          bgImage={content.bgImage || "https://cdn.pixabay.com/photo/2016/11/29/01/16/abacus-1866497_1280.jpg"}
          breadcrumb={content.breadcrumb || section.title || "Legal"}
        />

        <div className="max-w-4xl mx-auto px-6 py-24">
          <div className="bg-card border border-border/50 rounded-[2.5rem] p-8 md:p-16 shadow-2xl shadow-black/5">
            {lastUpdated && (
              <div className="text-[10px] uppercase font-black tracking-widest text-primary mb-8 border-b border-primary/10 pb-4">
                Last Updated: {lastUpdated}
              </div>
            )}
            
            <div 
              className="prose prose-zinc dark:prose-invert max-w-none 
                prose-h1:text-3xl prose-h1:font-black prose-h1:tracking-tight
                prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-12 prose-h2:mb-6
                prose-p:text-zinc-600 dark:prose-p:text-zinc-400 prose-p:leading-relaxed prose-p:text-lg
                prose-li:text-zinc-600 dark:prose-li:text-zinc-400 prose-li:text-lg
                prose-strong:text-foreground prose-strong:font-black"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />

            {!htmlContent && (
               <div className="py-20 text-center space-y-4">
                  <div className="text-4xl">📄</div>
                  <h3 className="text-xl font-bold">Content Coming Soon</h3>
                  <p className="text-muted-foreground">We are currently updating our {section.title || slug.replace("-", " ")}. Please check back later.</p>
               </div>
            )}
          </div>
        </div>
      </main>

      <MainFooter settings={settings} />
    </div>
  );
}
