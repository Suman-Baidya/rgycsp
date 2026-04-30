import { db } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/PageHeader";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { MainFooter } from "@/components/layout/MainFooter";

export default async function CookiePage() {
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
          title="Cookie Policy"
          subtitle="Understanding how we use cookies"
          bgImage="https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=2070"
          breadcrumb="Cookie Policy"
        />

        <div className="max-w-4xl mx-auto px-6 py-24">
          <div className="bg-card border border-border/50 rounded-[2.5rem] p-8 md:p-16 shadow-2xl shadow-black/5">
            <div className="text-[10px] uppercase font-black tracking-widest text-primary mb-8 border-b border-primary/10 pb-4">
              Last Updated: {new Date().toLocaleDateString()}
            </div>
            
            <div className="prose prose-zinc dark:prose-invert max-w-none 
                prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-12 prose-h2:mb-6
                prose-p:text-zinc-600 dark:prose-p:text-zinc-400 prose-p:leading-relaxed prose-p:text-lg">
              
              <h2>1. What Are Cookies?</h2>
              <p>
                Cookies are small text files that are used to store small pieces of information. They are stored on your device when the website is loaded on your browser. These cookies help us make the website function properly, make it more secure, and provide better user experience.
              </p>

              <h2>2. How We Use Cookies?</h2>
              <p>
                As most of the online services, our website uses first-party and third-party cookies for several purposes. First-party cookies are mostly necessary for the website to function the right way, and they do not collect any of your personally identifiable data.
              </p>

              <h2>3. Types of Cookies We Use</h2>
              <p>
                <strong>Essential:</strong> Some cookies are essential for you to be able to experience the full functionality of our site. They allow us to maintain user sessions and prevent any security threats.
              </p>
              <p>
                <strong>Statistics:</strong> These cookies store information like the number of visitors to the website, the number of unique visitors, which pages of the website have been visited, the source of the visit, etc.
              </p>

              <h2>4. Control Cookie Preferences</h2>
              <p>
                Should you decide to change your preferences later through your browsing session, you can click on the "Privacy & Cookie Policy" tab on your screen. This will display the consent notice again enabling you to change your preferences or withdraw your consent entirely.
              </p>
            </div>
          </div>
        </div>
      </main>

      <MainFooter settings={settings} />
    </div>
  );
}
