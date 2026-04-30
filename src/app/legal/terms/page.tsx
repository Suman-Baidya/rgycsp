import { db } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/PageHeader";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { MainFooter } from "@/components/layout/MainFooter";

export default async function TermsPage() {
  const settings = await db.siteSettings.findFirst({
    where: { workspaceId: null }
  });

  if (!settings) {
    return <div>Site configuration missing.</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <LandingNavbar settings={settings} />

      <main className="flex-1">
        <PageHeader 
          title="Terms of Service"
          subtitle="The rules and guidelines for using our platform"
          bgImage="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2070"
          breadcrumb="Terms of Service"
        />

        <div className="max-w-4xl mx-auto px-6 py-24">
          <div className="bg-card border border-border/50 rounded-[2.5rem] p-8 md:p-16 shadow-2xl shadow-black/5">
            <div className="text-[10px] uppercase font-black tracking-widest text-primary mb-8 border-b border-primary/10 pb-4">
              Last Updated: {new Date().toLocaleDateString()}
            </div>
            
            <div className="prose prose-zinc dark:prose-invert max-w-none 
                prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-12 prose-h2:mb-6
                prose-p:text-zinc-600 dark:prose-p:text-zinc-400 prose-p:leading-relaxed prose-p:text-lg">
              
              <h2>1. Agreement to Terms</h2>
              <p>
                By accessing our Website, you agree to be bound by these Terms of Service and to comply with all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
              </p>

              <h2>2. Use License</h2>
              <p>
                Permission is granted to temporarily download one copy of the materials (information or software) on ABCD Edu Hub's website for personal, non-commercial transitory viewing only.
              </p>

              <h2>3. Disclaimer</h2>
              <p>
                The materials on ABCD Edu Hub's website are provided on an 'as is' basis. ABCD Edu Hub makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>

              <h2>4. Limitations</h2>
              <p>
                In no event shall ABCD Edu Hub or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on ABCD Edu Hub's website.
              </p>

              <h2>5. Governing Law</h2>
              <p>
                These terms and conditions are governed by and construed in accordance with the laws of India and you irrevocably submit to the exclusive jurisdiction of the courts in West Bengal.
              </p>
            </div>
          </div>
        </div>
      </main>

      <MainFooter settings={settings} />
    </div>
  );
}
