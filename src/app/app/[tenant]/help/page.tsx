import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { WorkspaceNavbar } from "@/components/layout/WorkspaceNavbar";
import { WorkspaceFooter } from "@/components/layout/WorkspaceFooter";
import { WorkspacePageHeader } from "@/components/layout/WorkspacePageHeader";
import { CustomThemeStyle } from "@/components/providers/CustomThemeStyle";
import { auth } from "@/auth";
import { HelpCircle, Search, Mail, MessageSquare, BookOpen, FileText, MapPin, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function HelpCenterPage({
  params
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;

  const workspace = await db.workspace.findUnique({
    where: { subdomain: tenant?.toLowerCase() },
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

  // Find help center data from sections
  const helpData = workspace.siteSettings.sections.find(s => s.type === "help-center");
  const content = (helpData?.content as any) || {};

  const categories = content.categories || [
    { icon: "BookOpen", title: "Getting Started", desc: "Basic guides and onboarding materials for new students.", link: "#" },
    { icon: "FileText", title: "Course Content", desc: "Questions regarding syllabus, lectures, and materials.", link: "#" },
    { icon: "Mail", title: "Admissions", desc: "Information about the enrollment process and eligibility.", link: "#" },
    { icon: "MessageSquare", title: "Technical Support", desc: "Troubleshooting portal access and account issues.", link: "#" }
  ];

  const cta = content.cta || {
    ticketText: "Open a Ticket",
    ticketLink: "#",
    emailText: "Email Support",
    emailLink: `mailto:${workspace.siteSettings.contactEmail || 'support@abcd.com'}`
  };

  const iconMap: any = { HelpCircle, Search, Mail, MessageSquare, BookOpen, FileText, MapPin, PhoneCall };

  return (
    <div className="flex flex-col min-h-screen font-sans bg-background selection:bg-primary/30">
      <CustomThemeStyle
        primaryColor={workspace.siteSettings.primaryColor || undefined}
        accentColor={workspace.siteSettings.accentColor || undefined}
        fontFamily={workspace.siteSettings.fontFamily || undefined}
      />

      <WorkspaceNavbar settings={workspace.siteSettings} user={session?.user} tenant={tenant} />

      <main className="flex-1 w-full relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] -ml-48 -mb-48 pointer-events-none" />

        <WorkspacePageHeader
          title={helpData?.title || "Help Center"}
          description={helpData?.subtitle || "Find answers, explore guides, and connect with our support team."}
          bgImage={workspace.siteSettings.pageHeaderBanner || "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2084"}
          statusTitle="24/7 SUPPORT"
          statusSub="We're here to help"
          breadcrumbs={[
            { name: "Help Center", href: "/help" }
          ]}
        />

        <div className="max-w-7xl mx-auto px-6 py-24 relative z-10">
          {/* Search Bar Section */}
          <div className="max-w-3xl mx-auto mb-20">
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-zinc-400 group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search for topics or questions..."
                className="h-20 pl-16 rounded-[2rem] bg-white dark:bg-zinc-900 border-border/60 shadow-xl shadow-black/5 text-xl placeholder:text-zinc-400"
              />
              <Button className="absolute right-4 top-1/2 -translate-y-1/2 h-12 rounded-xl bg-primary text-white font-black px-8">
                Search
              </Button>
            </div>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((cat: any, i: number) => {
              const Icon = iconMap[cat.icon] || HelpCircle;
              return (
                <Link key={i} href={cat.link || "#"} className="group p-10 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-border/50 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 block">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black mb-4 tracking-tight">{cat.title}</h3>
                  <p className="text-muted-foreground leading-relaxed font-medium">{cat.desc}</p>
                  <div className="mt-8 flex items-center gap-2 text-primary font-black text-sm group/btn">
                    Explore Articles <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform" />
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Direct Contact & Support CTA */}
          <div className="mt-24 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Cards */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { icon: MapPin, title: "Our Office", value: workspace.siteSettings.address || "Kolkata, India", sub: "Visit us for in-person support" },
                { icon: PhoneCall, title: "Call Us", value: workspace.siteSettings.contactPhone || "8944899747", sub: "Available Mon-Sat, 10am-6pm", href: `tel:${workspace.siteSettings.contactPhone}` },
                { icon: Mail, title: "Email Support", value: workspace.siteSettings.contactEmail || "support@abcd.com", sub: "We'll respond within 24 hours", href: `mailto:${workspace.siteSettings.contactEmail}` },
                { icon: MessageSquare, title: "WhatsApp Support", value: workspace.siteSettings.whatsapp || "Connect Now", sub: "Quickest way to get help", href: workspace.siteSettings.whatsapp ? `https://wa.me/${workspace.siteSettings.whatsapp.replace(/\D/g, '')}` : undefined }
              ].map((contact, i) => (
                <div key={i} className="p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-border/50 shadow-sm flex items-start gap-5">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                    <contact.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm uppercase tracking-widest text-primary mb-1">{contact.title}</h4>
                    {contact.href ? (
                      <a href={contact.href} className="text-lg font-black hover:text-primary transition-colors block">{contact.value}</a>
                    ) : (
                      <p className="text-lg font-black">{contact.value}</p>
                    )}
                    <p className="text-xs text-muted-foreground font-medium mt-1">{contact.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Support CTA Card */}
            <div className="p-12 bg-zinc-950 rounded-[3rem] text-white overflow-hidden relative group flex flex-col justify-center">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -mr-32 -mt-32 group-hover:bg-primary/30 transition-colors" />
              <div className="relative z-10 space-y-6">
                <h2 className="text-3xl font-black tracking-tight leading-tight">
                  Still need <span className="text-primary">help?</span>
                </h2>
                <p className="text-zinc-400 font-medium text-sm">Open a support ticket and our team will get back to you shortly.</p>
                <div className="space-y-3">
                  <Link href={cta.ticketLink || "#"} className="block">
                    <Button className="w-full h-14 rounded-2xl font-black bg-primary text-white border-none shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                      {cta.ticketText}
                    </Button>
                  </Link>
                  <Link href={cta.emailLink || "#"} className="block">
                    <Button variant="outline" className="w-full h-14 rounded-2xl font-black border-white/20 text-primary hover:text-white hover:bg-white/10 transition-all">
                      {cta.emailText}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <WorkspaceFooter settings={workspace.siteSettings} />
    </div>
  );
}

const ArrowRight = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
