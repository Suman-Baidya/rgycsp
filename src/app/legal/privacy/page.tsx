import { db } from "@/lib/prisma";
import { auth } from "@/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { MainFooter } from "@/components/layout/MainFooter";

export default async function PrivacyPage() {
  const session = await auth();
  const settings = await db.siteSettings.findFirst({
    where: { workspaceId: null }
  });

  if (!settings) {
    return <div>Site configuration missing.</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <LandingNavbar settings={settings} user={session?.user} />

      <main className="flex-1">
        <PageHeader 
          title="Privacy Policy"
          subtitle="How we protect and manage your data"
          bgImage="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070"
          breadcrumb="Privacy Policy"
        />

        <div className="max-w-4xl mx-auto px-6 py-24">
          <div className="bg-card border border-border/50 rounded-[2.5rem] p-8 md:p-16 shadow-2xl shadow-black/5">
            <div className="text-[10px] uppercase font-black tracking-widest text-primary mb-8 border-b border-primary/10 pb-4">
              Effective Date: {new Date().toLocaleDateString()}
            </div>
            
            <div className="prose prose-zinc dark:prose-invert max-w-none 
                prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-12 prose-h2:mb-6
                prose-p:text-zinc-600 dark:prose-p:text-zinc-400 prose-p:leading-relaxed prose-p:text-lg">
              
              <h2>1. Introduction</h2>
              <p>
                Welcome to ABCD Edu Hub. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us.
              </p>

              <h2>2. Information We Collect</h2>
              <p>
                We collect personal information that you voluntarily provide to us when registering at the Website, expressing an interest in obtaining information about us or our products and services, when participating in activities on the Website or otherwise contacting us.
              </p>

              <h2>3. How We Use Your Information</h2>
              <p>
                We use personal information collected via our Website for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
              </p>

              <h2>4. Sharing Your Information</h2>
              <p>
                We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.
              </p>

              <h2>5. Data Security</h2>
              <p>
                We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.
              </p>
            </div>
          </div>
        </div>
      </main>

      <MainFooter settings={settings} />
    </div>
  );
}
