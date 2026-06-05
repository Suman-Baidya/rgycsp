import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { WorkspaceNavbar } from "@/components/layout/WorkspaceNavbar";
import { WorkspaceFooter } from "@/components/layout/WorkspaceFooter";
import { WorkspaceHero } from "@/components/landing/WorkspaceHero";
import { QuickLinksSection } from "@/components/landing/QuickLinksSection";
import { AboutNoticeSection } from "@/components/landing/AboutNoticeSection";
import { DynamicCounters } from "@/components/landing/DynamicCounters";
import { WorkspaceCourses } from "@/components/landing/WorkspaceCourses";
import { WorkspaceWhyChooseUs } from "@/components/landing/WorkspaceWhyChooseUs";
import { WorkspaceAchievements } from "@/components/landing/WorkspaceAchievements";
import { WorkspacePartners } from "@/components/landing/WorkspacePartners";
import { WorkspaceTestimonials } from "@/components/landing/WorkspaceTestimonials";
import { WorkspaceFaq } from "@/components/landing/WorkspaceFaq";
import { WorkspaceContact } from "@/components/landing/WorkspaceContact";
import { WorkspaceEvents } from "@/components/landing/WorkspaceEvents";
import { CustomThemeStyle } from "@/components/providers/CustomThemeStyle";
import { auth } from "@/auth";

export default async function InstituteLandingPage({
  params
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;

  const workspace = await db.workspace.findUnique({
    where: { subdomain: tenant }
  });

  if (!workspace) notFound();

  const globalSettings = await db.siteSettings.findFirst({
    where: { workspaceId: null },
    include: {
      sections: {
        orderBy: { order: "asc" }
      }
    }
  });

  let workspaceSettings = await db.siteSettings.findFirst({
    where: { workspaceId: workspace.id },
    include: {
      workspace: true,
      sections: {
        orderBy: { order: "asc" }
      }
    }
  });

  if (!globalSettings) {
    return <div>Global site configuration missing. Super Admin must initialize settings first.</div>;
  }

  if (!workspaceSettings) {
    workspaceSettings = await db.siteSettings.create({
      data: {
        workspaceId: workspace.id,
        siteName: workspace.name,
        primaryColor: "#f97316",
        accentColor: "#ea580c",
        navigation: [
          { name: "Home", href: "/", id: "home", isActive: true },
          { name: "About", href: "/about", id: "about", isActive: true },
          { name: "Learner", href: "/learners", id: "learner-public", isActive: true },
          { name: "Courses", href: "/courses", id: "courses", isActive: true },
          { name: "Gallery", href: "/gallery", id: "gallery", isActive: true },
          { name: "Contact", href: "/contact", id: "contact", isActive: true },
        ],
        navbarConfig: {
          showNavbar: true,
          showTopBar: true,
          showMenus: true,
          ctaPrimary: { text: "Login", link: "/login" },
        }
      },
      include: {
        workspace: true,
        sections: {
          orderBy: { order: "asc" }
        }
      }
    });

    const { syncAllSections } = await import("@/app/actions/site-settings");
    const types = ['hero', 'about', 'counters', 'courses', 'why-choose-us', 'achievements', 'partners', 'events', 'testimonials', 'faq', 'contact'];
    await syncAllSections(workspaceSettings.id, types, true);

    workspaceSettings = await db.siteSettings.findFirst({
      where: { workspaceId: workspace.id },
      include: {
        workspace: true,
        sections: {
          orderBy: { order: "asc" }
        }
      }
    });
  }

  // At this point both globalSettings and workspaceSettings are guaranteed to exist
  if (!workspaceSettings) {
    return <div>Failed to initialize workspace settings.</div>;
  }

  // Merge logic: Workspace settings override global settings, but global layout configs apply if not editable.
  // We use workspaceSettings for content, and globalSettings for structural toggles like navbarConfig.
  const mergedSettings = {
    ...workspaceSettings,
    navbarConfig: globalSettings.navbarConfig, // Force global navbar toggles
  };

  const isSectionActive = (type: string) => {
    // Workspace admin can toggle it off locally, but Super Admin can toggle it off globally.
    // If Super Admin toggles it off, it's OFF for everyone.
    // If Super Admin toggles it on, Workspace Admin can still toggle it off locally.
    const globalSection = globalSettings.sections.find(s => s.type === type);
    const workspaceSection = workspaceSettings.sections.find(s => s.type === type);
    
    if (globalSection && !globalSection.isActive) return false;
    return workspaceSection?.isActive ?? true;
  };

  const getSectionData = (type: string) => {
    return workspaceSettings.sections.find(s => s.type === type);
  };

  const session = await auth();
  
  // Fetch courses and events from the LMS model
  // We filter isActive in JS to avoid Prisma synchronization issues with the new schema fields
  const allCourses = await db.course.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: 'desc' }
  });
  const top3Courses = (allCourses as any[]).filter(c => c.isActive !== false).slice(0, 3);

  const allEvents = await db.event.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { date: 'asc' }
  });
  const top3Events = allEvents.filter(e => (e as any).isActive !== false).slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen font-sans bg-background selection:bg-primary/30">
      <CustomThemeStyle 
        primaryColor={mergedSettings.primaryColor || undefined} 
        accentColor={mergedSettings.accentColor || undefined} 
        fontFamily={mergedSettings.fontFamily || undefined} 
      />
      <WorkspaceNavbar settings={mergedSettings} user={session?.user} tenant={tenant} />

      <main className="flex-1 w-full flex flex-col relative overflow-hidden bg-white dark:bg-zinc-950">
        {/* Advanced Background Layer */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          {/* Animated Mesh Orbs */}
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-pulse delay-700" />
          
          {/* Geometric Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
          
          {/* Noise Texture */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>

        <div className="relative z-10 flex flex-col w-full">
        {isSectionActive("hero") && <WorkspaceHero data={getSectionData("hero")} />}
        
        {isSectionActive("quick-links") && <QuickLinksSection data={getSectionData("quick-links")} tenant={tenant} />}
        
        {isSectionActive("about") && <AboutNoticeSection data={getSectionData("about")} />}

        {isSectionActive("counters") && <DynamicCounters data={getSectionData("counters")} />}

        {isSectionActive("courses") && (
          <WorkspaceCourses 
            data={getSectionData("courses")} 
            dbCourses={top3Courses} 
          />
        )}

        {isSectionActive("why-choose-us") && <WorkspaceWhyChooseUs data={getSectionData("why-choose-us")} />}
        
        {isSectionActive("achievements") && <WorkspaceAchievements data={getSectionData("achievements")} />}

        {isSectionActive("partners") && <WorkspacePartners data={getSectionData("partners")} />}

        {isSectionActive("events") && <WorkspaceEvents data={{ ...getSectionData("events"), events: top3Events }} />}

        {isSectionActive("testimonials") && <div id="testimonials"><WorkspaceTestimonials data={getSectionData("testimonials")} /></div>}

        {isSectionActive("faq") && <div id="faq"><WorkspaceFaq data={getSectionData("faq")} /></div>}
        
        {isSectionActive("contact") && <WorkspaceContact data={getSectionData("contact")} settings={mergedSettings} />}
        </div>
      </main>


      <WorkspaceFooter settings={mergedSettings} tenant={tenant} user={session?.user} />
    </div>
  );
}
