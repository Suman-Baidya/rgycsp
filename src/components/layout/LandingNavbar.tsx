"use client"

import Link from "next/link";
import { Mail, Phone, Moon, Sun, Menu, X as CloseIcon } from "lucide-react";
// Inline SVGs for brand icons removed from Lucide
const Youtube = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
);
const Facebook = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
);
const Instagram = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);
const Twitter = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.73 11.73"></path><path d="M4 20l6.76-6.76"></path><path d="M20 20l-6.76-6.76"></path><path d="M20 4l-11.73 11.73"></path></svg>
);
const Linkedin = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
);
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { CustomThemeStyle } from "@/components/providers/CustomThemeStyle";
import { cn } from "@/lib/utils";

import { signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LayoutDashboard, LogOut, Settings, User as UserIcon, LogIn } from "lucide-react";

export function LandingNavbar({ settings, user, isHome }: { settings?: any, user?: any, isHome?: boolean }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle scroll for sticky behavior
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 32);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const siteName = settings?.siteName || "ABCD Edu Hub";
  const contactPhone = settings?.contactPhone || "8944899747";
  const logoUrl = settings?.logoUrl || "/logo.png";

  const dashboardHref = user?.role === "SUPER_ADMIN" ? "/super-admin" : "/workspaces";
  const dashboardLabel = user?.role === "SUPER_ADMIN" ? "Global Admin" : "My Workspaces";

  // Navbar Logic Config with deep fallbacks
  const config = {
    showNavbar: settings?.navbarConfig?.showNavbar ?? true,
    showTopBar: settings?.navbarConfig?.showTopBar ?? true,
    showMenus: settings?.navbarConfig?.showMenus ?? true,
    ctaPrimary: {
      text: settings?.navbarConfig?.ctaPrimary?.text || "Login",
      link: settings?.navbarConfig?.ctaPrimary?.link || "/login"
    },
    ctaSecondary: {
      text: settings?.navbarConfig?.ctaSecondary?.text || "Call Now",
      link: settings?.navbarConfig?.ctaSecondary?.link || `tel:${contactPhone}`
    },
    secondarySiteName: settings?.navbarConfig?.secondarySiteName,
    secondaryLogoUrl: settings?.navbarConfig?.secondaryLogoUrl
  };

  // Filter Active Navigation Links
  const navLinks = (settings?.navigation || [
    { name: "Home", href: "/", id: "home", isActive: true },
    { name: "About", href: "/about", id: "about", isActive: true },
    { name: "Services", href: "/services", id: "services", isActive: true },
    { name: "Students", href: "/students", id: "students", isActive: true },
    { name: "Courses", href: "/courses", id: "courses", isActive: true },
    { name: "Franchises", href: "/franchises", id: "franchises", isActive: true },
    { name: "Events", href: "/events", id: "events", isActive: true },
    { name: "Placement", href: "/placement", id: "placement", isActive: true },
    { name: "Pricing", href: "/pricing", id: "pricing", isActive: true },
    { name: "Support", href: "/support", id: "support", isActive: true }
  ]).filter((link: any) => link.isActive !== false);

  const Logo = ({ size = "w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20", showName = true }: { size?: string, showName?: boolean }) => (
    <div className="flex items-center gap-2 shrink-0 group">
      <div className={cn("relative flex items-center justify-center shrink-0 rounded-lg transition-transform group-hover:scale-105", size)}>
        <Image
          src={logoUrl}
          alt={`${siteName} Logo`}
          fill
          className="object-contain"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const fallback = e.currentTarget.parentElement?.querySelector('.logo-fallback');
            if (fallback) fallback.classList.remove('hidden');
          }}
        />
        <div className="logo-fallback hidden w-full h-full bg-primary text-primary-foreground flex items-center justify-center font-black text-lg">
          {siteName.charAt(0)}
        </div>
      </div>
      {showName && (
        <>
          {/* Mobile Text (Hidden on Desktop) */}
          <div className="flex lg:hidden flex-col border-l-2 border-foreground/20 dark:border-foreground/30 pl-2 overflow-hidden min-w-0 max-w-[160px] sm:max-w-[200px]">
            <span className="text-lg sm:text-xl font-bold tracking-tight whitespace-nowrap font-heading text-foreground group-hover:text-primary transition-colors leading-tight">
              R.G.Y.C.S.P
            </span>
            <div className="overflow-hidden w-full relative h-[14px] mt-0.5">
              <div className="absolute whitespace-nowrap flex animate-marquee text-[10px] sm:text-xs text-foreground/70 font-bold tracking-widest uppercase leading-none group-hover:text-foreground/90 transition-colors">
                <span className="mr-8">Rajeev Gandhi Youth Computer Shiksha Parishad</span>
                <span className="mr-8">Rajeev Gandhi Youth Computer Shiksha Parishad</span>
              </div>
            </div>
          </div>
          {/* Desktop Text (Hidden on Mobile) */}
          <div className="hidden lg:flex flex-col border-l-2 border-foreground/20 dark:border-foreground/30 pl-2">
            <span className="text-lg sm:text-2xl font-bold tracking-tight whitespace-nowrap font-heading text-foreground group-hover:text-primary transition-colors leading-tight">
              {siteName}
            </span>
            {config?.secondarySiteName && (
              <span className="text-[10px] sm:text-xs text-foreground/70 font-bold tracking-widest uppercase whitespace-nowrap leading-none mt-1 group-hover:text-foreground/90 transition-colors">
                {config.secondarySiteName}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );

  const UserMenu = () => {
    return (
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger className="outline-none">
            <div className="flex items-center gap-3 cursor-pointer group">
              <Avatar className="h-11 w-11 ring-2 ring-primary/10 group-hover:ring-primary transition-all duration-300 shadow-lg">
                <AvatarImage src={user.image} />
                <AvatarFallback className="bg-primary text-primary-foreground font-bold">{user.name?.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 rounded-[1.5rem] p-3 border-slate-100 dark:border-zinc-800 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 px-2 py-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.image} />
                <AvatarFallback className="bg-primary text-primary-foreground font-bold">{user.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <p className="text-sm font-bold text-foreground leading-none mb-1">{user.name}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{user.role?.replace('_', ' ')}</p>
              </div>
            </div>
            <DropdownMenuSeparator className="my-2 bg-slate-50 dark:bg-zinc-900" />
            <DropdownMenuLabel className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Management</DropdownMenuLabel>
            <Link href={dashboardHref}>
              <DropdownMenuItem className="rounded-xl h-11 gap-3 font-bold text-xs uppercase tracking-widest cursor-pointer mt-1">
                <LayoutDashboard className="h-4 w-4" /> {dashboardLabel}
              </DropdownMenuItem>
            </Link>
            <Link href={user?.role === "SUPER_ADMIN" ? "/super-admin/profile" : "/profile"}>
              <DropdownMenuItem className="rounded-xl h-11 gap-3 font-bold text-xs uppercase tracking-widest cursor-pointer">
                <UserIcon className="h-4 w-4" /> My Profile
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator className="my-2 bg-slate-50 dark:bg-zinc-900" />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/" })}
              className="rounded-xl h-11 gap-3 font-bold text-xs uppercase tracking-widest cursor-pointer text-red-500 focus:bg-red-500 focus:text-white"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  if (config.showNavbar === false) return null;

  return (
    <div className="absolute top-0 left-0 w-full z-[100] flex flex-col">
      <CustomThemeStyle primaryColor={settings?.primaryColor} accentColor={settings?.accentColor} />

      {/* TIER 1: Top Bar (Icons, Theme) - Absolute (Scrolls away) */}
      {config.showTopBar !== false && (
        <div className="hidden lg:flex w-full bg-primary/95 dark:bg-zinc-950/90 dark:border-b dark:border-white/5 backdrop-blur-md py-1 px-6 justify-between items-center text-xs text-primary-foreground dark:text-zinc-400 transition-all duration-300">
          {/* Top Left: Social Logos only */}
          <div className="flex items-center gap-4">
            {settings?.socialLinks?.youtube && <Link href={settings.socialLinks.youtube} target="_blank" aria-label="Youtube" className="hover:text-muted transition-colors"><Youtube className="w-4 h-4" /></Link>}
            {settings?.socialLinks?.facebook && <Link href={settings.socialLinks.facebook} target="_blank" aria-label="Facebook" className="hover:text-muted transition-colors"><Facebook className="w-4 h-4" /></Link>}
            {settings?.socialLinks?.instagram && <Link href={settings.socialLinks.instagram} target="_blank" aria-label="Instagram" className="hover:text-muted transition-colors"><Instagram className="w-4 h-4" /></Link>}
            {settings?.socialLinks?.twitter && <Link href={settings.socialLinks.twitter} target="_blank" aria-label="X (Twitter)" className="hover:text-muted transition-colors"><Twitter className="w-4 h-4" /></Link>}
            {settings?.socialLinks?.linkedin && <Link href={settings.socialLinks.linkedin} target="_blank" aria-label="LinkedIn" className="hover:text-muted transition-colors"><Linkedin className="w-4 h-4" /></Link>}
            {settings?.whatsapp && <Link href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`} target="_blank" aria-label="WhatsApp" className="hover:text-muted transition-colors"><Phone className="w-4 h-4" /></Link>}
          </div>

          {/* Top Right: Catalog, Theme */}
          <div className="flex items-center gap-4">
            <Link href="/catalog" className="flex items-center gap-2 border-r border-white/20 dark:border-zinc-800 pr-4 mr-2 hover:text-muted dark:hover:text-white transition-colors">
              <span className="font-black">Catalog</span>
            </Link>
            <div className="flex items-center gap-4 border-r border-white/20 dark:border-zinc-800 pr-4 mr-2">
              <span className="opacity-70">Support:</span>
              <Link href={`tel:${contactPhone}`} className="font-black hover:underline">{contactPhone}</Link>
            </div>
            <button
              onClick={toggleTheme}
              className="hover:text-muted dark:hover:text-white p-1.5 rounded-full transition-colors"
              aria-label="Toggle Theme"
              suppressHydrationWarning
            >
              {mounted ? (theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />) : <div className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* TIER 2: Branding Bar */}
      <div className={cn(
        "w-full bg-background/95 backdrop-blur-xl border-b border-border/50 py-1 overflow-hidden transition-all duration-500 mb-2",
        isScrolled ? "lg:hidden fixed left-0 top-0 shadow-md z-[150]" : "relative"
      )}>
        <div className="max-w-7xl mx-auto px-4 lg:px-6 flex items-center justify-between gap-2 lg:gap-4">
          <Link href="/" className="min-w-0 flex-1">
            <Logo />
          </Link>

          <div className="flex items-center gap-2 lg:gap-4 shrink-0">
            {config?.secondaryLogoUrl && (
              <div className="hidden lg:flex items-center border-r-2 border-foreground/20 dark:border-foreground/30 pr-3 mr-1">
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 shrink-0">
                  <Image src={config.secondaryLogoUrl} alt="Secondary Logo" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-contain" />
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 lg:gap-3">
              {user ? (
                <div className="flex items-center gap-3 lg:gap-5">
                  <Link href={dashboardHref} className="hidden lg:block">
                    <Button className="hidden lg:flex text-[12px] font-bold uppercase tracking-wide bg-primary hover:bg-primary/90 text-primary-foreground h-10 px-6 rounded-xl items-center gap-2 group/dash shadow-lg shadow-primary/20 border-none transition-all">
                      <LayoutDashboard className="w-3.5 h-3.5 group-hover/dash:rotate-12 transition-transform" />
                      Dashboard
                    </Button>
                  </Link>
                  <UserMenu />
                </div>
              ) : (
                <div className="hidden lg:flex items-center gap-3">
                  <Link href={config.ctaSecondary.link}>
                    <Button variant="outline" className="border-primary/20 text-foreground hover:bg-primary/5 hover:border-primary/40 font-bold px-4 lg:px-5 h-10 rounded-xl transition-all text-xs lg:text-sm flex items-center gap-2">
                      <Phone className="h-4 w-4 shrink-0" />
                      {config.ctaSecondary.text}
                    </Button>
                  </Link>
                  <Link href={config.ctaPrimary.link}>
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-4 lg:px-5 h-10 rounded-xl text-xs lg:text-sm shadow-xl shadow-primary/20 flex items-center gap-2">
                      <LogIn className="h-4 w-4 shrink-0" />
                      {config.ctaPrimary.text}
                    </Button>
                  </Link>
                </div>
              )}
              {!user && (
                <Link href={config.ctaPrimary.link} className="lg:hidden">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-black px-4 h-9 rounded-lg text-[10px] tracking-widest shadow-xl shadow-primary/20 uppercase">
                    {config.ctaPrimary.text}
                  </Button>
                </Link>
              )}
              <Button variant="ghost" size="icon" className="lg:hidden text-foreground shrink-0 -mr-2" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <CloseIcon className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* TIER 3: Navigation Bar (Sticky when scrolled) */}
      {config.showMenus !== false && (
        <nav className={cn(
          "hidden lg:flex w-full transition-all duration-500 z-[90] py-1",
          isScrolled
            ? "fixed top-0 left-0 bg-background/95 backdrop-blur-2xl border-b border-border shadow-md"
            : "bg-transparent"
        )}>
          <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-3 items-center">
            {/* Left: Logo (Only when scrolled) */}
            <div className="flex justify-start">
              {isScrolled && (
                <Link href="/">
                  <Logo size="w-16 h-16" showName={false} />
                </Link>
              )}
            </div>

            {/* Center: Nav Items */}
            <div className="flex justify-center">
              <div className="flex items-center gap-8">
                {navLinks.map((link: any) => {
                  const currentPath = pathname || "/";
                  const isActive = currentPath === link.href || (link.href !== "/" && currentPath.startsWith(link.href));
                  return (
                    <Link
                      key={link.id}
                      href={link.href}
                      className={cn(
                        "text-[14px] font-bold transition-all relative group uppercase",
                        isActive
                          ? "text-primary"
                          : (isScrolled ? "text-foreground/70 hover:text-foreground" : "text-white/80 hover:text-white")
                      )}
                    >
                      {link.name}
                      <span className={cn(
                        "absolute -bottom-2 left-1/2 -translate-x-1/2 h-1.5 bg-primary rounded-full transition-all duration-300",
                        isActive ? "w-6 opacity-100" : "w-0 opacity-0 group-hover:w-4 group-hover:opacity-50"
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
                    <Link href={config.ctaPrimary.link}>
                      <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-4 lg:px-5 h-10 rounded-xl text-xs lg:text-sm shadow-xl shadow-primary/20 flex items-center gap-2">
                        <LogIn className="h-4 w-4 shrink-0" />
                        {config.ctaPrimary.text}
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </nav>
      )}

      {/* Mobile Menu Dropdown & Overlay */}
      <div className={`lg:hidden fixed inset-0 z-40 transition-all duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>

        {/* Menu Content */}
        <div className={`absolute top-[72px] left-0 w-full bg-background border-t p-6 shadow-2xl transition-transform duration-300 transform ${isOpen ? 'translate-y-0' : '-translate-y-full'}`}>
          <div className="flex flex-col gap-6 font-semibold text-lg text-foreground">
            {config.showMenus !== false && navLinks.map((link: any) => {
              const currentPath = pathname || "/";
              const isActive = currentPath === link.href ||
                (link.href !== "/" && currentPath.startsWith(link.href));

              return (
                <Link
                  key={link.id}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`transition-colors py-2 ${isActive ? 'text-primary font-black' : 'text-foreground/70 hover:text-primary'}`}
                >
                  {link.name}
                </Link>
              );
            })}

            {/* Mobile Action Buttons */}
            <div className="flex flex-col gap-3 border-t border-border pt-6 mt-2">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 px-2 py-4 rounded-2xl bg-slate-50 dark:bg-zinc-900 mb-2">
                    <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                      <AvatarImage src={user.image} />
                      <AvatarFallback className="bg-primary text-primary-foreground font-bold">{user.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="text-base font-bold text-foreground leading-tight">{user.name}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{user.role}</p>
                    </div>
                  </div>

                  <Link href={dashboardHref} onClick={() => setIsOpen(false)}>
                    <Button className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-bold gap-3 shadow-xl shadow-primary/20 dark:text-white">
                      <LayoutDashboard className="h-5 w-5" />
                      Go to Dashboard
                    </Button>
                  </Link>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <Link href={user?.role === "SUPER_ADMIN" ? "/super-admin/profile" : "/profile"} onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full h-12 rounded-xl font-bold gap-2">
                        <UserIcon className="h-4 w-4" />
                        Profile
                      </Button>
                    </Link>
                    <button onClick={() => signOut({ callbackUrl: "/" })} className="w-full h-12 rounded-xl bg-red-500/5 text-red-500 border border-red-500/20 font-bold flex items-center justify-center gap-2 transition-all active:scale-95">
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <Link href={`tel:${contactPhone}`} onClick={() => setIsOpen(false)} className="w-full">
                    <Button variant="outline" className="w-full h-14 text-lg border-2 border-primary/20 rounded-2xl font-bold gap-3 text-foreground">
                      <Phone className="h-5 w-5 text-primary dark:text-white" />
                      Call Support
                    </Button>
                  </Link>
                  <Link href="/login" onClick={() => setIsOpen(false)} className="w-full">
                    <Button className="w-full bg-primary text-primary-foreground h-14 text-lg rounded-2xl font-bold shadow-xl shadow-primary/20 dark:text-white">Login to Account</Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Footer Tools */}
            <div className="flex items-center justify-between border-t border-border pt-6 mt-2 text-muted-foreground">
              <div className="flex items-center gap-6">
                <Link href={`tel:${contactPhone}`}><Phone className="w-5 h-5 cursor-pointer hover:text-primary" /></Link>
                <Link href={`mailto:${settings?.contactEmail || "sb.abcd321@gmail.com"}`}><Mail className="w-5 h-5 cursor-pointer hover:text-primary" /></Link>
              </div>
              <button suppressHydrationWarning onClick={toggleTheme} className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-full text-foreground flex items-center gap-2 text-sm font-bold shadow-sm">
                {mounted ? (theme === "light" ? <><Moon className="w-4 h-4" /> Dark</> : <><Sun className="w-4 h-4" /> Light</>) : <div className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
