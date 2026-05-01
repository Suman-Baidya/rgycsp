"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  BookOpen,
  Menu,
  X,
  LayoutDashboard,
  Sun,
  Moon,
  LogOut,
  User as UserIcon,
  Settings,
  GraduationCap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";
import { getWorkspaceRole } from "@/app/actions/student";

export function WorkspaceNavbar({ settings, user, tenant: propTenant }: { settings: any, user?: any, tenant?: string }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [workspaceRole, setWorkspaceRole] = useState<string | null>(null);
  const pathname = usePathname();
  const params = useParams();
  const { theme, setTheme } = useTheme();

  // Robust tenant detection
  const getTenant = () => {
    if (propTenant) return propTenant;
    if (params?.tenant) return params.tenant as string;

    // Check hostname first (Subdomain Mode)
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const parts = hostname.split('.');
      if (parts.length >= 2 && !hostname.startsWith('localhost')) {
        return parts[0];
      }
      if (hostname.endsWith('.localhost')) {
        return hostname.replace('.localhost', '');
      }
    }

    // Fallback to pathname (Subdirectory Mode)
    if (pathname.startsWith('/app/')) return pathname.split('/')[2];

    return "";
  };

  const tenant = getTenant();
  const isSubdirectoryMode = pathname.startsWith('/app/');
  const workspaceBase = (isSubdirectoryMode && tenant) ? `/app/${tenant}` : '';
  const adminBase = (isSubdirectoryMode && tenant) ? `${workspaceBase}/admin` : "/admin";
  const studentBase = (isSubdirectoryMode && tenant) ? `${workspaceBase}/student/dashboard` : "/student/dashboard";
  const rootHref = isSubdirectoryMode ? `${workspaceBase}/` : "/";

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);

    // Fetch workspace role if user is logged in and tenant is detected
    const fetchRole = async () => {
      if (user?.id && settings.workspaceId) {
        const role = await getWorkspaceRole(settings.workspaceId, user.id);
        setWorkspaceRole(role);
      }
    };
    fetchRole();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [user, settings.workspaceId]);

  const dashboardHref = workspaceRole === "STUDENT" ? studentBase : adminBase;
  const dashboardLabel = workspaceRole === "STUDENT" ? "DASHBOARD" : "ADMIN";

  const socialLinks = settings.socialLinks || {};
  const defaultItems = [
    { name: "Home", href: "/", id: "home", isActive: true },
    { name: "About", href: "/about", id: "about", isActive: true },
    { name: "Courses", href: "/courses", id: "courses", isActive: true },
    { name: "Students", href: "/students", id: "students", isActive: true },
    { name: "Admission", href: "/admission", id: "admission", isActive: true },
    { name: "Gallery", href: "/gallery", id: "gallery", isActive: true },
    { name: "Events", href: "/events", id: "events", isActive: true },
    { name: "Guidance", href: "/guidance", id: "guidance", isActive: true },
    { name: "Notice", href: "/notice", id: "notice", isActive: true },
    { name: "Contact", href: "/contact", id: "contact", isActive: true },
  ];

  // Logic: Use settings.navigation if provided, otherwise use defaultItems
  let navItems = settings.navigation && settings.navigation.length > 0
    ? [...settings.navigation]
    : [...defaultItems];

  if (settings.navigation) {
    navItems = navItems.filter((item: any) =>
      !["franchise", "enquery", "enquiry"].includes(item.id?.toLowerCase()) &&
      !["franchise", "enquery", "enquiry"].includes(item.name?.toLowerCase())
    );

    const requiredIds = ["home", "about", "courses", "students", "admission", "gallery", "events", "guidance", "notice", "contact"];
    requiredIds.forEach(id => {
      const exists = navItems.some((item: any) => item.id === id);
      if (!exists) {
        const def = defaultItems.find(d => d.id === id);
        if (def) navItems.push(def);
      }
    });
  }

  const visibleNavItems = navItems.filter((item: any) => item.isActive !== false);

  const UserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger render={
        <button className="flex items-center gap-3 cursor-pointer group outline-none border-none bg-transparent p-0">
          <Avatar className="h-10 w-10 ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all shadow-xl">
            <AvatarImage src={user.image} />
            <AvatarFallback className="bg-primary text-primary-foreground font-black text-sm">{user.name?.charAt(0)}</AvatarFallback>
          </Avatar>
        </button>
      } />
      <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 border-slate-100 dark:border-slate-800 shadow-2xl mt-2 animate-in fade-in zoom-in-95 duration-200">
        <DropdownMenuLabel className="px-3 py-2">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">My Account</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-50 dark:bg-slate-800" />
        <DropdownMenuItem className="rounded-xl h-10 gap-3 font-bold text-xs uppercase tracking-widest cursor-pointer focus:bg-primary focus:text-white">
          <UserIcon className="h-4 w-4" /> Profile
        </DropdownMenuItem>
        <DropdownMenuItem className="rounded-xl h-10 gap-3 font-bold text-xs uppercase tracking-widest cursor-pointer focus:bg-primary focus:text-white">
          <Settings className="h-4 w-4" /> Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-slate-50 dark:bg-slate-800" />
        <DropdownMenuItem
          onClick={async () => {
            const origin = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}` : '';
            const target = `${origin}${workspaceBase || '/'}`;
            await signOut({ redirect: false });
            window.location.href = target;
          }}
          className="rounded-xl h-10 gap-3 font-bold text-xs uppercase tracking-widest cursor-pointer text-red-500 focus:bg-red-500 focus:text-white"
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="absolute top-0 left-0 w-full z-[100] flex flex-col">
      {/* Tier 1: Top Bar */}
      <AnimatePresence>
        {!isScrolled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="hidden lg:flex w-full bg-slate-950/40 backdrop-blur-md border-b border-white/5 py-3 items-center text-[10px] font-bold tracking-[0.2em] text-zinc-400 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
              {/* Part 1: Social Media - Left Side */}
              <div className="flex items-center gap-5">
                {socialLinks.facebook && <Link href={socialLinks.facebook} className="hover:text-white transition-all hover:scale-110"><Facebook className="h-3.5 w-3.5" /></Link>}
                {socialLinks.twitter && <Link href={socialLinks.twitter} className="hover:text-white transition-all hover:scale-110"><Twitter className="h-3.5 w-3.5" /></Link>}
                {socialLinks.instagram && <Link href={socialLinks.instagram} className="hover:text-white transition-all hover:scale-110"><Instagram className="h-3.5 w-3.5" /></Link>}
                {socialLinks.linkedin && <Link href={socialLinks.linkedin} className="hover:text-white transition-all hover:scale-110"><Linkedin className="h-3.5 w-3.5" /></Link>}
                {socialLinks.youtube && <Link href={socialLinks.youtube} className="hover:text-white transition-all hover:scale-110"><Youtube className="h-3.5 w-3.5" /></Link>}
                {!Object.values(socialLinks).some(v => v) && <span className="text-[9px] opacity-50 uppercase tracking-[0.3em]">Stay Connected</span>}
              </div>

              {/* Part 2: Catalog, Mobile No, Theme - Right Side */}
              <div className="flex items-center gap-8">
                <Link href={`${workspaceBase}/catalog`} className="flex items-center gap-2 hover:text-white transition-colors group">
                  <BookOpen className="h-3 w-3 text-primary group-hover:scale-110 transition-transform" />
                  <span>Course Catalog</span>
                </Link>
                <div className="flex items-center gap-2 border-l border-white/10 pl-8">
                  <Phone className="h-3 w-3 text-primary" />
                  <span className="font-black text-white/90">{settings.contactPhone || "89448 97472"}</span>
                </div>
                {mounted && (
                  <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="hover:text-white transition-colors pl-8 border-l border-white/10 flex items-center gap-2 group">
                    {theme === "dark" ? (
                      <Sun className="h-3.5 w-3.5 text-yellow-500 group-hover:rotate-45 transition-transform" />
                    ) : (
                      <Moon className="h-3.5 w-3.5 text-blue-400 group-hover:-rotate-12 transition-transform" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tier 2: Branding Bar */}
      <div className={cn(
        "w-full bg-white/5 backdrop-blur-xl border-b border-white/5 py-4 overflow-hidden transition-all duration-500",
        isScrolled ? "lg:hidden fixed top-0 bg-zinc-950/90 border-b border-white/10 py-3 shadow-2xl z-[150]" : "relative"
      )}>
        {(!isScrolled || typeof window !== 'undefined' && window.innerWidth < 1024) && (
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
            <Link href={rootHref} className="flex items-center gap-5 group">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/20 group-hover:scale-105 transition-transform">
                <span className="text-primary-foreground font-black text-2xl tracking-tighter">A</span>
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-black text-white leading-none uppercase group-hover:text-primary transition-colors">{settings.siteName || "WORKSPACE"}</h1>
                <p className="text-[10px] text-primary font-bold tracking-widest mt-1">Computer Education Institute</p>
              </div>
            </Link>

            <div className="flex items-center gap-6">
              {settings.secondaryLogo && settings.secondaryLogo !== "" && (
                <img src={settings.secondaryLogo} alt="Logo" className="hidden lg:block h-10 w-auto opacity-40 hover:opacity-100 transition-opacity" />
              )}
              <div className="flex items-center gap-3 pl-6 border-l border-white/10">
                {user ? (
                  <div className="flex items-center gap-5">
                    <Link href={dashboardHref}>
                      <Button variant="ghost" className="text-[10px] font-black tracking-widest text-white hover:bg-white/10 h-10 px-6 border border-white/5 rounded-xl flex items-center gap-2 group/dash">
                        <LayoutDashboard className="w-3.5 h-3.5 text-primary group-hover/dash:scale-110 transition-transform" />
                        {dashboardLabel}
                      </Button>
                    </Link>
                    <UserMenu />
                  </div>
                ) : (
                  <Link href={`${workspaceBase}/login`}>
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-black px-8 h-11 rounded-lg text-xs tracking-widest shadow-xl shadow-primary/20 uppercase">LOGIN</Button>
                  </Link>
                )}
                <Button variant="ghost" size="icon" className="lg:hidden text-white" onClick={() => setIsMobileMenuOpen(true)}>
                  <Menu className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tier 3: Navigation Bar */}
      <div className={cn(
        "hidden lg:flex w-full transition-all duration-500 z-[90] py-4",
        isScrolled
          ? "fixed top-0 bg-zinc-950/90 backdrop-blur-2xl border-b border-white/5 py-3 shadow-2xl"
          : "bg-transparent"
      )}>
        <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
          {/* Part 1: Logo - Left Side */}
          <div className="w-[200px] flex justify-start">
            {isScrolled && (
              <Link href={rootHref} className="flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-500">
                {settings.logoUrl ? (
                  <img src={settings.logoUrl} alt="Logo" className="h-9 w-auto object-contain" />
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                    <span className="text-primary-foreground font-black text-xl tracking-tighter">A</span>
                  </div>
                )}
              </Link>
            )}
          </div>

          {/* Part 2: Menus - Middle */}
          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-8">
              {visibleNavItems.map((item: any) => {
                const href = item.href === '/' ? rootHref : `${workspaceBase}${item.href.startsWith('/') ? item.href : `/${item.href}`}`;
                const isActive = pathname === href || (item.href === '/' && (pathname === workspaceBase || pathname === `${workspaceBase}/`));
                
                return (
                  <Link
                    key={item.id}
                    href={href}
                    className={cn(
                      "text-[14px] font-bold transition-all relative group uppercase",
                      isActive ? "text-primary" : "text-zinc-400 hover:text-white"
                    )}
                  >
                    {item.name}
                    <span className={cn(
                      "absolute -bottom-1.5 left-0 h-0.5 bg-primary transition-all duration-500",
                      isActive ? "w-full" : "w-0 group-hover:w-full"
                    )} />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Part 3: Auth - Right Side */}
          <div className="w-[200px] flex justify-end">
            {isScrolled && (
              <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-4 duration-500">
                {user ? (
                  <div className="flex items-center gap-4">
                    <Link href={dashboardHref}>
                      <Button variant="ghost" size="sm" className="text-[10px] font-black tracking-widest text-white hover:bg-white/10 h-8 px-4 flex items-center gap-2 group/dash">
                        <LayoutDashboard className="w-3 h-3 text-primary group-hover/dash:scale-110 transition-transform" />
                        {dashboardLabel}
                      </Button>
                    </Link>
                    <UserMenu />
                  </div>
                ) : (
                  <Link href={`${workspaceBase}/login`}>
                    <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-black px-6 h-9 rounded-lg text-[10px] tracking-widest shadow-lg uppercase">
                      LOGIN
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="fixed inset-0 z-[200] bg-zinc-950 flex flex-col p-8"
          >
            <div className="flex items-center justify-between mb-12">
              <span className="font-black text-2xl tracking-tighter text-white uppercase">{settings.siteName}</span>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} className="text-white">
                <X className="h-8 w-8" />
              </Button>
            </div>
            <div className="flex flex-col gap-6">
              {visibleNavItems.map((item: any) => {
                const href = item.href === '/' ? rootHref : `${workspaceBase}${item.href.startsWith('/') ? item.href : `/${item.href}`}`;
                return (
                  <Link
                    key={item.id}
                    href={href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-3xl font-black text-zinc-500 hover:text-primary transition-colors uppercase tracking-tighter"
                  >
                    {item.name}
                  </Link>
                );
              })}
              {user ? (
                <Button
                  onClick={async () => {
                    const origin = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}` : '';
                    const target = `${origin}${workspaceBase || '/'}`;
                    await signOut({ redirect: false });
                    window.location.href = target;
                  }}
                  variant="ghost"
                  className="mt-8 text-red-500 font-black h-14 rounded-2xl text-lg tracking-widest uppercase w-full border-2 border-red-500/20"
                >
                  SIGN OUT
                </Button>
              ) : (
                <Link href={`${workspaceBase}/login`} onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="mt-8 bg-primary hover:bg-primary/90 text-primary-foreground font-black h-14 rounded-2xl text-lg tracking-widest uppercase w-full">LOGIN</Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const Facebook = ({ className }: any) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
);
const Twitter = ({ className }: any) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.73 11.73"></path><path d="M4 20l6.76-6.76"></path><path d="M20 20l-6.76-6.76"></path><path d="M20 4l-11.73 11.73"></path></svg>
);
const Instagram = ({ className }: any) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);
const Linkedin = ({ className }: any) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
);
const Youtube = ({ className }: any) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
);
