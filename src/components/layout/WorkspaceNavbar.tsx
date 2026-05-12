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
import { getTenantLink, getWorkspaceBase, detectTenant } from "@/lib/routing";
import { CustomThemeStyle } from "../providers/CustomThemeStyle";

export function WorkspaceNavbar({ settings, user, tenant: propTenant }: { settings: any, user?: any, tenant?: string }) {
  const pathname = usePathname();
  const params = useParams();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [workspaceRole, setWorkspaceRole] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();

  // Tenant Detection
  const tenant = propTenant || detectTenant(pathname, typeof window !== 'undefined' ? window.location.hostname : undefined);
  const workspaceBase = getWorkspaceBase(tenant, pathname);
  const adminBase = getTenantLink("/admin", tenant, pathname);
  const studentBase = getTenantLink("/student/dashboard", tenant, pathname);
  const rootHref = getTenantLink("/", tenant, pathname);

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
  const dashboardLabel = "Dashboard";

  const socialLinks = settings.socialLinks || {};
  const defaultItems = [
    { name: "Home", href: "/", id: "home", isActive: true },
    { name: "About", href: "/about", id: "about", isActive: true },
    { name: "Learner", href: "/learners", id: "learners-public", isActive: true },
    { name: "Courses", href: "/courses", id: "courses", isActive: true },
    { name: "Gallery", href: "/gallery", id: "gallery", isActive: true },
    { name: "Contact", href: "/contact", id: "contact", isActive: true },
  ];

  let navItems = settings.navigation && settings.navigation.length > 0
    ? [...settings.navigation]
    : [...defaultItems];

  // Force include 'Learner' if missing (for existing workspaces)
  const hasLearner = navItems.some((item: any) =>
    item.href === '/learners' || item.name.toLowerCase() === 'learner' || item.id === 'learners-public'
  );

  if (!hasLearner && settings.navigation && settings.navigation.length > 0) {
    // Add it after About if possible, else at the end
    const aboutIndex = navItems.findIndex((item: any) => item.name.toLowerCase() === 'about');
    if (aboutIndex !== -1) {
      navItems.splice(aboutIndex + 1, 0, { name: "Learner", href: "/learners", id: "learners-public", isActive: true });
    } else {
      navItems.push({ name: "Learner", href: "/learners", id: "learners-public", isActive: true });
    }
  }

  // Explicitly remove any 'Students' menu item
  navItems = navItems.filter((item: any) =>
    item.name.toLowerCase() !== 'students' && item.href !== '/students'
  );

  const visibleNavItems = navItems.filter((item: any) => item.isActive !== false);

  const Logo = ({ size = "w-10 h-10 lg:w-12 lg:h-12", iconSize = "text-xl lg:text-2xl", showName = true }: { size?: string, iconSize?: string, showName?: boolean }) => (
    <div className="flex items-center gap-3 lg:gap-5 group min-w-0">
      <div className={cn(size, "rounded-xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/20 group-hover:scale-105 transition-transform overflow-hidden shrink-0")}>
        {settings.logoUrl ? (
          <img src={settings.logoUrl} alt={settings.siteName} className="w-full h-full object-contain p-1" />
        ) : (
          <span className={cn("text-primary-foreground font-black tracking-tighter uppercase", iconSize)}>
            {settings.siteName?.charAt(0) || "W"}
          </span>
        )}
      </div>
      {showName && (
        <div className="flex flex-col min-w-0">
          <h1 className="text-lg lg:text-2xl font-black text-white leading-tight uppercase group-hover:text-primary transition-colors line-clamp-2 break-words">
            {settings.siteName || "WORKSPACE"}
          </h1>
          <p className="text-[8px] lg:text-[10px] text-primary font-bold tracking-widest mt-1 line-clamp-2">
            Computer Education Institute
          </p>
        </div>
      )}
    </div>
  );

  const getLink = (path: string) => getTenantLink(path, tenant, pathname);

  const UserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-3 cursor-pointer group outline-none border-none bg-transparent p-0">
        <Avatar className="h-10 w-10 ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all shadow-xl">
          <AvatarImage src={user.image} />
          <AvatarFallback className="bg-primary text-primary-foreground font-black text-sm">{user.name?.charAt(0)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 border-slate-100 dark:border-slate-800 shadow-2xl mt-2 animate-in fade-in zoom-in-95 duration-200">
        <DropdownMenuLabel className="px-3 py-2">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">My Account</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-50 dark:bg-slate-800" />
        <DropdownMenuItem 
          onClick={() => window.location.href = dashboardHref}
          className="lg:hidden rounded-xl h-10 gap-3 font-bold text-xs uppercase tracking-widest cursor-pointer focus:bg-primary focus:text-white"
        >
          <LayoutDashboard className="h-4 w-4" /> {dashboardLabel}
        </DropdownMenuItem>
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

  if (!mounted) return null;

  return (
    <div className="absolute top-0 left-0 w-full z-[100] flex flex-col">
      <CustomThemeStyle primaryColor={settings?.primaryColor} accentColor={settings?.accentColor} />

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
              <div className="flex items-center gap-5">
                {socialLinks.facebook && <Link href={socialLinks.facebook} className="hover:text-white transition-all hover:scale-110"><Facebook className="h-3.5 w-3.5" /></Link>}
                {socialLinks.twitter && <Link href={socialLinks.twitter} className="hover:text-white transition-all hover:scale-110"><Twitter className="h-3.5 w-3.5" /></Link>}
                {socialLinks.instagram && <Link href={socialLinks.instagram} className="hover:text-white transition-all hover:scale-110"><Instagram className="h-3.5 w-3.5" /></Link>}
                {socialLinks.linkedin && <Link href={socialLinks.linkedin} className="hover:text-white transition-all hover:scale-110"><Linkedin className="h-3.5 w-3.5" /></Link>}
                {socialLinks.youtube && <Link href={socialLinks.youtube} className="hover:text-white transition-all hover:scale-110"><Youtube className="h-3.5 w-3.5" /></Link>}
              </div>

              <div className="flex items-center gap-8">
                <Link href={getLink("/catalog")} className="flex items-center gap-2 hover:text-white transition-colors group">
                  <BookOpen className="h-3 w-3 text-primary group-hover:scale-110 transition-transform" />
                  <span>Course Catalog</span>
                </Link>
                <div className="flex items-center gap-2 border-l border-white/10 pl-8">
                  <Phone className="h-3 w-3 text-primary" />
                  <span className="font-black text-white/90">{settings.contactPhone || "89448 97472"}</span>
                </div>
                <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="hover:text-white transition-colors pl-8 border-l border-white/10 flex items-center gap-2 group">
                  {theme === "dark" ? <Sun className="h-3.5 w-3.5 text-yellow-500" /> : <Moon className="h-3.5 w-3.5 text-blue-400" />}
                </button>
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
        <div className="max-w-7xl mx-auto px-4 lg:px-6 flex items-center justify-between gap-2 lg:gap-4">
          <Link href={rootHref} className="min-w-0 flex-1">
            <Logo />
          </Link>

          <div className="flex items-center gap-2 lg:gap-6 shrink-0">
            <div className="flex items-center gap-2 lg:gap-3 pl-3 lg:pl-6 border-l border-white/10">
              {user ? (
                <div className="flex items-center gap-3 lg:gap-5">
                  <Link href={dashboardHref} className="hidden lg:block">
                    <Button className="hidden lg:flex text-[12px] font-bold uppercase tracking-wide bg-primary hover:bg-primary/90 text-primary-foreground h-10 px-6 rounded-xl items-center gap-2 group/dash shadow-lg shadow-primary/20 border-none transition-all">
                      <LayoutDashboard className="w-3.5 h-3.5 group-hover/dash:rotate-12 transition-transform" />
                      {dashboardLabel}
                    </Button>
                  </Link>
                  <UserMenu />
                </div>
              ) : (
                <Link href={getLink(settings.navbarConfig?.ctaPrimary?.link || "/login")}>
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-black px-4 h-9 lg:px-8 lg:h-11 rounded-lg text-[10px] lg:text-xs tracking-widest shadow-xl shadow-primary/20 uppercase">
                    {settings.navbarConfig?.ctaPrimary?.text || "LOGIN"}
                  </Button>
                </Link>
              )}
              <Button variant="ghost" size="icon" className="lg:hidden text-white shrink-0 -mr-2" onClick={() => setIsMobileMenuOpen(true)}>
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tier 3: Navigation Bar (Sticky when scrolled) */}
      <nav className={cn(
        "hidden lg:flex w-full transition-all duration-500 z-[90] py-4",
        isScrolled
          ? "fixed top-0 bg-zinc-950/90 backdrop-blur-2xl border-b border-white/5 py-3 shadow-2xl"
          : "bg-transparent"
      )}>
        <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-3 items-center">
          {/* Left: Logo (Only when scrolled) */}
          <div className="flex justify-start">
            {isScrolled && (
              <Link href={rootHref}>
                <Logo size="w-10 h-10" iconSize="text-xl" showName={false} />
              </Link>
            )}
          </div>

          {/* Center: Nav Items */}
          <div className="flex justify-center">
            <div className="flex items-center gap-8">
              {visibleNavItems.map((item: any) => {
                const href = getLink(item.href);
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

          {/* Right: Auth / Dashboard */}
          <div className="flex justify-end">
            {isScrolled && (
              <div className="flex items-center gap-4">
                {user ? (
                  <div className="flex items-center gap-4">
                    <Link href={dashboardHref}>
                      <Button size="icon" className="w-9 h-9 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg shadow-primary/20 border-none transition-all group/dash-scroll">
                        <LayoutDashboard className="w-4 h-4 group-hover/dash-scroll:rotate-12 transition-transform" />
                      </Button>
                    </Link>
                    <UserMenu />
                  </div>
                ) : (
                  <Link href={getLink(settings.navbarConfig?.ctaPrimary?.link || "/login")}>
                    <Button size="sm" className="bg-primary text-primary-foreground font-black h-8 text-[10px] px-6">
                      {settings.navbarConfig?.ctaPrimary?.text || "LOGIN"}
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="fixed inset-0 z-[200] bg-zinc-950 flex flex-col p-8"
          >
            <div className="flex items-start justify-between mb-8 gap-4">
              <span className="font-black text-xl leading-tight tracking-tighter text-white uppercase break-words line-clamp-3">
                {settings.siteName}
              </span>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} className="text-white shrink-0 mt-[-4px] -mr-2">
                <X className="h-8 w-8" />
              </Button>
            </div>
            <div className="flex flex-col gap-6">
              {visibleNavItems.map((item: any) => (
                <Link
                  key={item.id}
                  href={getLink(item.href)}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-3xl font-black text-zinc-500 hover:text-primary transition-colors uppercase tracking-tighter"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const Facebook = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>;
const Twitter = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>;
const Instagram = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>;
const Linkedin = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>;
const Youtube = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>;
