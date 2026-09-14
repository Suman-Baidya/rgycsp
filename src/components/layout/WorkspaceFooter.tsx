"use client";

import Link from "next/link";
import Image from "next/image";
import { 
  Mail, PhoneCall, MapPin, ArrowRight, 
  Send, Globe, ShieldCheck 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getTenantLink, detectTenant } from "@/lib/routing";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

import { useState, useEffect } from "react";
import { getWorkspaceRole } from "@/app/actions/student";

export function WorkspaceFooter({ settings, tenant: propTenant, user }: { settings?: any; tenant?: string; user?: any }) {
  const pathname = usePathname();
  const [workspaceRole, setWorkspaceRole] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchRole = async () => {
      if (user?.id && settings?.workspaceId) {
        const role = await getWorkspaceRole(settings.workspaceId, user.id);
        setWorkspaceRole(role);
      }
    };
    fetchRole();
  }, [user, settings?.workspaceId]);
  
  // Robust tenant detection using unified utility
  const tenant = propTenant || detectTenant(pathname, typeof window !== 'undefined' ? window.location.hostname : undefined);
  
  const adminBase = getTenantLink("/admin", tenant, pathname);
  const rootHref = getTenantLink("/", tenant, pathname);

  const siteName = settings?.siteName || "Institute Portal";
  const footerBrandName = settings?.navbarConfig?.footerBrandName || siteName;
  const logoUrl = settings?.logoUrl || "/logo.png";
  const footerTagline = settings?.navbarConfig?.footerTagline || settings?.navbarConfig?.subtitle?.trim() || "An Authorized Study & Training Center";
  const contactEmail = settings?.contactEmail || "";
  const contactPhone = settings?.contactPhone || "";
  const address = settings?.address || "";
  const socialLinks = settings?.socialLinks || {};
  const whatsapp = settings?.whatsapp;
  
  const brandDescription = settings?.brandDescription || settings?.navbarConfig?.footerDescription || "Providing quality education and digital resources to learners. Your success is our mission.";
  
  // Link helper
  const getLink = (path: string) => getTenantLink(path, tenant, pathname);

  const defaultItems = [
    { name: "Home", href: "/", id: "home", isActive: true },
    { name: "About", href: "/about", id: "about", isActive: true },
    { name: "Admission", href: "/admission", id: "admission", isActive: false },
    { name: "Learners", href: "/learners", id: "learners", isActive: false },
    { name: "Courses", href: "/courses", id: "courses", isActive: true },
    { name: "Guidance", href: "/guidance", id: "guidance", isActive: true },
    { name: "Notice", href: "/notice", id: "notice", isActive: true },
    { name: "Events", href: "/events", id: "events", isActive: true },
    { name: "Gallery", href: "/gallery", id: "gallery", isActive: true },
    { name: "Enquiry", href: "/enquiry", id: "enquiry", isActive: false },
    { name: "Contact", href: "/contact", id: "contact", isActive: true },
  ];

  // Use the navigation array directly from settings to preserve the user's custom order and labels
  const rawNav = (settings?.navigation && Array.isArray(settings.navigation) && settings.navigation.length > 0)
    ? settings.navigation
    : defaultItems;

  // Filter active items and remove unwanted legacy duplicates - perfectly synced with WorkspaceNavbar
  const visibleNavItems = rawNav.filter((item: any) => 
    item.isActive !== false &&
    item.id !== 'franchise' && item.name?.toLowerCase() !== 'franchise' &&
    item.name?.toLowerCase() !== 'students' &&
    item.name?.toLowerCase() !== 'learner' &&
    item.href !== '/students'
  );

  // Select key essential menus for footer (capped at 5-6 items in single column)
  const priorityKeys = ["home", "about", "courses", "admission", "notice", "contact", "gallery", "guidance"];
  const prioritized = visibleNavItems.filter((item: any) => {
    const key = (item.id || item.name || "").toLowerCase();
    const href = (item.href || "").toLowerCase();
    return priorityKeys.some((p) => key.includes(p) || href === `/${p}` || (p === "home" && (href === "/" || href === "")));
  });
  const footerNavItems = prioritized.length >= 4 ? prioritized.slice(0, 6) : visibleNavItems.slice(0, 6);

  if (!mounted) return null;

  return (
    <footer className="dark dark-context w-full bg-zinc-950 text-zinc-300 pt-24 pb-12 font-sans relative overflow-hidden border-t border-white/5">
      {/* Decorative Glows - Maintained for Workspace modern look */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2" />
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Top Newsletter Section - Now exclusive to Workspace institutes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pb-20 border-b border-white/5 mb-20">
          <div className="space-y-4">
             <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight">
               Stay ahead with our <span className="text-primary">educational</span> insights
             </h3>
             <p className="text-zinc-400 font-medium text-lg">Join 5,000+ learners receiving weekly updates and career tips.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
             <div className="relative flex-1 group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500 group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder="Enter your email" 
                  className="h-14 pl-12 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus:ring-primary/20 focus:border-primary/40 transition-all"
                />
             </div>
             <Button className="h-14 px-8 rounded-2xl font-bold bg-primary text-primary-foreground shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all border-none">
               Subscribe <Send className="w-4 h-4 ml-2" />
             </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
          {/* Brand Column */}
          <div className="space-y-8">
            <Link href={rootHref} className="flex items-center gap-3 shrink-0 group w-fit">
              <div className={cn(
                "relative w-12 h-12 flex items-center justify-center shrink-0 transition-all",
                settings?.logoUrl
                  ? "bg-transparent border-0"
                  : "bg-white/5 rounded-2xl border border-white/10 group-hover:border-primary/50 overflow-hidden"
              )}>
                {settings?.logoUrl ? (
                  <Image
                    src={settings.logoUrl}
                    alt={`${siteName} Logo`}
                    fill
                    className="object-contain"
                  />
                ) : (
                  <div className="w-full h-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl rounded-2xl">
                    {siteName.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex flex-col ml-1">
                <span className="text-2xl font-bold tracking-tighter text-white group-hover:text-primary transition-colors leading-none">
                  {footerBrandName}
                </span>
                <span className="text-[10px] font-bold text-zinc-500 tracking-[0.2em] uppercase mt-1">
                  {footerTagline}
                </span>
              </div>
            </Link>
            {mounted && tenant && (
              <Link href={workspaceRole === "STUDENT" ? getLink("/student/dashboard") : adminBase}>
                <Button variant="ghost" size="sm" className="text-[10px] font-bold tracking-widest text-white hover:bg-white/10 h-8">
                  {workspaceRole === "STUDENT" ? "LEARNER PORTAL" : "DASHBOARD"}
                </Button>
              </Link>
            )}

            <p className="text-[15px] leading-relaxed text-zinc-400 font-medium">
              {brandDescription}
            </p>
            
            <div className="flex gap-4 items-center">
              {[
                { icon: Facebook, link: socialLinks.facebook, color: 'hover:bg-blue-600' },
                { icon: Twitter, link: socialLinks.twitter, color: 'hover:bg-sky-500' },
                { icon: Instagram, link: socialLinks.instagram, color: 'hover:bg-pink-600' },
                { icon: Linkedin, link: socialLinks.linkedin, color: 'hover:bg-blue-700' },
                { icon: Youtube, link: socialLinks.youtube, color: 'hover:bg-red-600' },
              ].map((social, i) => social.link && (
                <Link 
                  key={i} 
                  href={social.link} 
                  target="_blank" 
                  className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 hover:text-white transition-all duration-300 ${social.color}`}
                >
                  <social.icon className="w-4 h-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-8">
            <div className="relative w-fit">
              <h4 className="text-white font-bold text-xs tracking-[0.2em]">Quick Links</h4>
              <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-primary rounded-full"></div>
            </div>
            <div className="flex flex-col gap-3.5">
              {footerNavItems.map((link: any) => {
                const href = getLink(link.href);
                return (
                  <Link key={link.id || link.name || link.href} href={href} className="text-zinc-400 hover:text-white font-semibold text-sm transition-all flex items-center gap-2 group hover:translate-x-1">
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" /> 
                    <span className="truncate">{link.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Support Links */}
          <div className="space-y-8">
            <div className="relative w-fit">
              <h4 className="text-white font-bold text-xs tracking-[0.2em]">Support</h4>
              <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-primary rounded-full"></div>
            </div>
            <div className="flex flex-col gap-3.5">
              {[
                { name: 'Help Center', href: '/help' },
                { name: 'Privacy Policy', href: '/legal/privacy' },
                { name: 'Terms of Service', href: '/legal/terms' },
                { name: 'Cookie Policy', href: '/legal/cookie' }
              ].map((item) => {
                const href = getLink(item.href);
                return (
                  <Link key={item.name} href={href} className="text-zinc-400 hover:text-white font-semibold text-sm transition-all flex items-center gap-2 group hover:translate-x-1">
                     <ArrowRight className="w-3 h-3 text-zinc-600 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" /> 
                     <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Contact Column */}
          <div className="space-y-8">
            <div className="relative w-fit">
              <h4 className="text-white font-bold text-xs tracking-[0.2em]">Contact Us</h4>
              <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-primary rounded-full"></div>
            </div>
            <div className="space-y-6">
              {address && (
                <div className="flex items-start gap-4 group/item">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 group-hover/item:border-primary/50 transition-colors">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-zinc-300 font-bold text-sm leading-relaxed">{address}</p>
                </div>
              )}
              {contactPhone && (
                <div className="flex items-center gap-4 group/item">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 group-hover/item:border-primary/50 transition-colors">
                    <PhoneCall className="w-4 h-4 text-primary" />
                  </div>
                  <Link href={`tel:${contactPhone}`} className="text-white font-bold text-sm hover:text-primary transition-colors">{contactPhone}</Link>
                </div>
              )}
              {contactEmail && (
                <div className="flex items-center gap-4 group/item">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 group-hover/item:border-primary/50 transition-colors">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <Link href={`mailto:${contactEmail}`} className="text-white font-bold text-sm hover:text-primary transition-colors">{contactEmail}</Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-24 pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6 text-[11px] font-bold tracking-widest text-zinc-500">
            <p>© {new Date().getFullYear()} {siteName}. All Rights Reserved.</p>
            <div className="hidden md:flex items-center gap-2 text-primary">
               <ShieldCheck className="w-4 h-4" />
               <span>Official Institute Portal</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2 text-[11px] font-bold tracking-widest text-zinc-500">
                <Globe className="w-4 h-4 text-primary" />
                <span>Authorized Center</span>
             </div>
             {whatsapp && (
                <Link 
                  href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`} 
                  target="_blank"
                  className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-500 rounded-full text-[10px] font-bold tracking-widest hover:bg-green-500 hover:text-white transition-all border border-green-500/20"
                >
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Live Support
                </Link>
             )}
          </div>
        </div>
      </div>
    </footer>
  );
}

// Inline SVGs for social icons to ensure reliability
const Facebook = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
const Twitter = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
const Instagram = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
const Linkedin = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
const Youtube = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
