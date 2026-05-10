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
import { LayoutDashboard, LogOut, Settings, User as UserIcon } from "lucide-react";

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
    }
  };

  // Filter Active Navigation Links
  const navLinks = (settings?.navigation || [
    { name: "Home", href: "/", id: "home", isActive: true },
    { name: "About", href: "/about", id: "about", isActive: true },
    { name: "Services", href: "/services", id: "services", isActive: true },
    { name: "Guide", href: "/guide", id: "guide", isActive: true },
    { name: "Pricing", href: "/pricing", id: "pricing", isActive: true },
    { name: "Support", href: "/support", id: "support", isActive: true }
  ]).filter((link: any) => link.isActive !== false);

  const UserMenu = () => {
    return (
      <div className="flex items-center gap-4">
        <Link href={dashboardHref}>
          <Button className="font-bold shadow-lg shadow-primary/20 bg-primary text-primary-foreground hover:scale-[1.02] active:scale-95 transition-all px-8 rounded-xl h-11 gap-2 dark:text-white">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Button>
        </Link>

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
    <>
      <CustomThemeStyle primaryColor={settings?.primaryColor} accentColor={settings?.accentColor} />

      {/* TIER 1: Top Bar (Icons, Theme) - Absolute (Scrolls away) */}
      {config.showTopBar !== false && (
        <div className="absolute top-0 left-0 w-full z-50 hidden lg:flex bg-primary/95 dark:bg-zinc-950/90 dark:border-b dark:border-white/5 backdrop-blur-md py-2 px-6 justify-between items-center text-xs text-primary-foreground dark:text-zinc-400 transition-all duration-300">
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

      {/* TIER 2: Main Navigation - Fixed (Sticky) */}
      <div className={`fixed left-0 w-full z-50 transition-all duration-300 bg-background/95 backdrop-blur-md shadow-sm border-b/50 ${isScrolled ? 'top-0 shadow-md' : (config.showTopBar !== false ? 'top-0 lg:top-[42px]' : 'top-0')}`}>
        <div className="w-full px-6 py-4 flex justify-between items-center max-w-7xl mx-auto">

          {/* Left: Branding */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="relative w-10 h-10 flex items-center justify-center shrink-0 bg-primary/10 rounded-lg overflow-hidden border border-primary/20">
              <Image
                src={logoUrl}
                alt={`${siteName} Logo`}
                fill
                className="object-contain p-1"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.parentElement?.querySelector('.logo-fallback');
                  if (fallback) fallback.classList.remove('hidden');
                }}
              />
              <div className="logo-fallback hidden w-full h-full bg-primary text-black dark:text-white flex items-center justify-center font-black text-lg">
                {siteName.charAt(0)}
              </div>
            </div>
            <span className="text-lg sm:text-2xl font-bold tracking-tight whitespace-nowrap font-heading text-foreground group-hover:text-primary transition-colors">
              {siteName}
            </span>
          </Link>

          {/* Middle: Desktop Menus */}
          {config.showMenus !== false && (
            <nav className="hidden lg:flex items-center gap-6 text-[15px] font-bold text-foreground/70">
              {navLinks.map((link: any) => {
                const currentPath = pathname || "/";
                // Robust matching: exact match or sub-path match (excluding root)
                const isActive = currentPath === link.href ||
                  (link.href !== "/" && currentPath.startsWith(link.href));

                return (
                  <Link
                    key={link.id}
                    href={link.href}
                    className={`transition-all duration-300 pt-2 pb-0.5 px-1 font-bold border-b-2 ${isActive
                      ? 'text-primary dark:text-white font-bold border-primary dark:border-white'
                      : 'text-foreground/70 border-transparent hover:border-primary/50'
                      }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right: CTAs */}
          <div className="hidden lg:flex items-center gap-4 shrink-0">
            {user ? (
              <UserMenu />
            ) : (
              <>
                <Link href={`tel:${contactPhone}`}>
                  <Button variant="outline" className="border-primary/20 text-foreground hover:bg-primary/5 hover:border-primary/40 font-bold px-6 rounded-xl transition-all h-11 gap-2">
                    <Phone className="h-4 w-4 text-primary dark:text-white" />
                    Call Now
                  </Button>
                </Link>
                <Link href="/login">
                  <Button className="font-bold shadow-lg shadow-primary/20 bg-primary text-primary-foreground hover:scale-[1.02] active:scale-95 transition-all px-8 rounded-xl h-11">
                    Login
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            className="lg:hidden p-2 text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors relative z-50"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Menu"
          >
            {isOpen ? <CloseIcon className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>
      </div>

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
              <button onClick={toggleTheme} className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-full text-foreground flex items-center gap-2 text-sm font-bold shadow-sm">
                {mounted ? (theme === "light" ? <><Moon className="w-4 h-4" /> Dark</> : <><Sun className="w-4 h-4" /> Light</>) : <div className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
