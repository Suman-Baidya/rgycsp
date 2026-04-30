import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { WorkspaceNavbar } from "@/components/layout/WorkspaceNavbar";
import { WorkspaceFooter } from "@/components/layout/WorkspaceFooter";
import { WorkspacePageHeader } from "@/components/layout/WorkspacePageHeader";
import { CustomThemeStyle } from "@/components/providers/CustomThemeStyle";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Image as ImageIcon, MapPin, Clock } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function WorkspaceAboutPage({
  params
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;

  const workspace = await db.workspace.findUnique({
    where: { subdomain: tenant },
    include: {
      siteSettings: {
        include: {
          sections: true
        }
      },
      events: {
        where: { isActive: true },
        orderBy: { date: 'asc' },
        take: 3
      },
      galleryItems: {
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        take: 6
      }
    }
  });

  if (!workspace || !workspace.siteSettings) notFound();

  const session = await auth();
  const aboutSection = workspace.siteSettings.sections.find(s => s.type === "about");
  const aboutContent = (aboutSection?.content as any) || {};

  return (
    <div className="flex flex-col min-h-screen font-sans bg-background">
      <CustomThemeStyle 
        primaryColor={workspace.siteSettings.primaryColor || undefined} 
        accentColor={workspace.siteSettings.accentColor || undefined} 
        fontFamily={workspace.siteSettings.fontFamily || undefined} 
      />
      
      <WorkspaceNavbar settings={workspace.siteSettings} user={session?.user} />

      <main className="flex-1 w-full">
        <WorkspacePageHeader 
          title="About Us"
          description={workspace.siteSettings.brandDescription || "Learn more about our mission, vision, and dedication to excellence."}
          bgImage={workspace.siteSettings.pageHeaderBanner || "https://images.unsplash.com/photo-1523050338192-067352869d2f?q=80&w=2070"}
          statusTitle="ONLINE"
          statusSub="24/7 Support"
          breadcrumbs={[
            { name: "About", href: "/about" }
          ]}
        />

        {/* Story Section */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-3 text-primary font-black tracking-[0.2em] text-[10px] uppercase">
                  <div className="h-0.5 w-10 bg-primary" />
                  Our Story
                </div>
                <h2 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                  {aboutSection?.title || "Dedicated to Empowering Future Leaders"}
                </h2>
                <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 text-lg leading-relaxed space-y-6">
                  {aboutContent.description ? (
                    <div className="whitespace-pre-line">{aboutContent.description}</div>
                  ) : (
                    <>
                      <p>Since our establishment, we have been committed to providing top-notch education that blends traditional values with modern innovation.</p>
                      <p>Our curriculum is designed by industry experts to ensure that every student is equipped with the skills and knowledge required to excel in their chosen career path.</p>
                    </>
                  )}
                </div>
                
                <div className="pt-4 flex flex-wrap gap-4">
                  <Link href="/courses">
                    <Button size="lg" className="rounded-full gap-3 px-10 h-14 font-black shadow-xl shadow-primary/20 hover:scale-105 transition-all group">
                      Explore Courses
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button size="lg" variant="outline" className="rounded-full gap-3 px-10 h-14 font-black hover:bg-primary/5 border-primary/20 transition-all">
                      Contact Us
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="relative">
                <div className="aspect-square rounded-[3rem] overflow-hidden shadow-2xl rotate-3 scale-95 transition-transform hover:rotate-0 hover:scale-100 duration-700">
                  <img 
                    src={workspace.galleryItems[0]?.image || "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070"} 
                    alt="Institute Life" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-10 -left-10 aspect-video w-2/3 rounded-[2rem] overflow-hidden shadow-2xl -rotate-6 border-8 border-white dark:border-slate-900 hidden md:block">
                   <img 
                    src={workspace.galleryItems[1]?.image || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071"} 
                    alt="Student Collaboration" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary rounded-full flex items-center justify-center text-white shadow-2xl animate-bounce duration-[3s]">
                  <span className="font-black text-center leading-none text-xs tracking-tighter">ESTD<br/><span className="text-2xl">2010</span></span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery Preview */}
        <section className="py-24 bg-slate-50 dark:bg-slate-950/50">
          <div className="max-w-7xl mx-auto px-6 space-y-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-3 text-primary font-black tracking-[0.2em] text-[10px] uppercase">
                  <div className="h-0.5 w-10 bg-primary" />
                  Visual Memories
                </div>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight">Our Campus Life</h2>
              </div>
              <Link href="/gallery">
                <Button variant="ghost" className="rounded-2xl h-12 font-black gap-2 hover:bg-primary/5 hover:text-primary transition-all">
                  View Full Gallery <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {workspace.galleryItems.map((item, i) => (
                <div 
                  key={item.id} 
                  className={cn(
                    "group relative overflow-hidden rounded-[1.5rem] bg-muted border border-border/40 transition-all duration-700 hover:-translate-y-2",
                    i === 0 ? "md:col-span-2 md:row-span-2 aspect-square" : "aspect-square"
                  )}
                >
                  <img 
                    src={item.image} 
                    alt={item.title || "Gallery"} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-4">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{item.category || "Moment"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Events Preview */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto space-y-16">
             <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 text-center md:text-left">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-3 text-primary font-black tracking-[0.2em] text-[10px] uppercase">
                  <div className="h-0.5 w-10 bg-primary" />
                  Upcoming
                </div>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight">Recent Events</h2>
              </div>
              <Link href="/events">
                <Button variant="ghost" className="rounded-2xl h-12 font-black gap-2 hover:bg-primary/5 hover:text-primary transition-all">
                  All Events <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {workspace.events.map((event) => (
                <Link key={event.id} href={`/events/${event.id}`}>
                  <div className="group bg-white dark:bg-zinc-900 border border-border/40 rounded-[2.5rem] overflow-hidden hover:shadow-2xl transition-all duration-500 h-full flex flex-col">
                    <div className="relative aspect-video overflow-hidden">
                      <img 
                        src={event.image || "https://images.unsplash.com/photo-1514525253361-bee8718a74a2?q=80&w=2070"} 
                        alt={event.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      />
                      <div className="absolute top-4 left-4 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md px-3 py-2 rounded-2xl text-center shadow-lg border border-white/20">
                        <div className="text-[8px] font-black text-primary uppercase tracking-tighter">
                          {new Date(event.date).toLocaleDateString('en-GB', { month: 'short' })}
                        </div>
                        <div className="text-xl font-black text-slate-900 dark:text-white leading-none">
                          {new Date(event.date).getDate()}
                        </div>
                      </div>
                    </div>
                    <div className="p-8 flex-1 flex flex-col space-y-4">
                      <h3 className="text-xl font-black tracking-tight group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                        {event.title}
                      </h3>
                      <div className="space-y-2 pt-2">
                        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                          <MapPin className="h-3 w-3 text-primary" />
                          {event.location || "On Campus"}
                        </div>
                        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                          <Clock className="h-3 w-3 text-primary" />
                          {event.time || "All Day"}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <WorkspaceFooter settings={workspace.siteSettings} tenant={tenant} />
    </div>
  );
}
