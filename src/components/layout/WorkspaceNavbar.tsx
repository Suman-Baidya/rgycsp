"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  BookOpen,
  Menu,
  X,
  LayoutDashboard,
  Sun,
  Moon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function WorkspaceNavbar({ settings, user }: { settings: any, user?: any }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const socialLinks = settings.socialLinks || {};
  const defaultItems = [
    { name: "Home", href: "/", id: "home" },
    { name: "About", href: "/about", id: "about" },
    { name: "Courses", href: "/courses", id: "courses" },
    { name: "Students", href: "/students", id: "students" },
    { name: "Enquiry", href: "/enquiry", id: "enquiry" },
    { name: "Gallery", href: "/gallery", id: "gallery" },
    { name: "Events", href: "/events", id: "events" },
    { name: "Guidance", href: "/guidance", id: "guidance" },
    { name: "Notice", href: "/notice", id: "notice" },
    { name: "Franchise", href: "/franchise", id: "franchise" },
    { name: "Contact", href: "/contact", id: "contact" },
  ];

  // Merge logic: Use settings.navigation but inject Notice/Franchise if missing
  let navItems = settings.navigation ? [...settings.navigation] : defaultItems;
  
  if (settings.navigation) {
    const hasNotice = navItems.some((item: any) => item.id === "notice" || item.name === "Notice");
    if (!hasNotice) {
      const contactIdx = navItems.findIndex((item: any) => item.id === "contact");
      if (contactIdx !== -1) navItems.splice(contactIdx, 0, { name: "Notice", href: "/notice", id: "notice", isActive: true });
      else navItems.push({ name: "Notice", href: "/notice", id: "notice", isActive: true });
    }
    
    const hasFranchise = navItems.some((item: any) => item.id === "franchise" || item.name === "Franchise");
    if (!hasFranchise) {
      const contactIdx = navItems.findIndex((item: any) => item.id === "contact");
      if (contactIdx !== -1) navItems.splice(contactIdx, 0, { name: "Franchise", href: "/franchise", id: "franchise", isActive: true });
      else navItems.push({ name: "Franchise", href: "/franchise", id: "franchise", isActive: true });
    }
  }

  // Final filter for visibility
  const visibleNavItems = navItems.filter((item: any) => item.isActive !== false);

  return (
    <div className="absolute top-0 left-0 w-full z-[100] flex flex-col">
      {/* Tier 1: Top Bar */}
      <AnimatePresence>
        {!isScrolled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="hidden lg:flex w-full bg-black/10 backdrop-blur-md border-b border-white/5 py-2 items-center text-[11px] font-semibold tracking-widest text-zinc-400 overflow-hidden"
          >
            <div className="container mx-auto px-6 flex items-center justify-between">
              {/* Left Side: Social Media Icons */}
              <div className="flex items-center gap-4">
                {socialLinks.facebook && <Link href={socialLinks.facebook} className="hover:text-white transition-colors"><Facebook className="h-3 w-3" /></Link>}
                {socialLinks.twitter && <Link href={socialLinks.twitter} className="hover:text-white transition-colors"><Twitter className="h-3 w-3" /></Link>}
                {socialLinks.instagram && <Link href={socialLinks.instagram} className="hover:text-white transition-colors"><Instagram className="h-3 w-3" /></Link>}
                {socialLinks.linkedin && <Link href={socialLinks.linkedin} className="hover:text-white transition-colors"><Linkedin className="h-3 w-3" /></Link>}
                {socialLinks.youtube && <Link href={socialLinks.youtube} className="hover:text-white transition-colors"><Youtube className="h-3 w-3" /></Link>}
              </div>

              {/* Right Side: Catalog, Mobile No, Theme */}
              <div className="flex items-center gap-6">
                <Link href="/catalog" className="flex items-center gap-2 hover:text-white transition-colors">
                  <BookOpen className="h-3 w-3" />
                  Course Catalog
                </Link>
                <div className="flex items-center gap-2">
                  <Phone className="h-3 w-3" />
                  {settings.contactPhone || "89448 97472"}
                </div>
                {mounted && (
                  <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="hover:text-white transition-colors pl-4 border-l border-white/10">
                    {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tier 2: Branding Bar */}
      <AnimatePresence>
        {!isScrolled && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full bg-white/5 backdrop-blur-xl border-b border-white/5 py-4 overflow-hidden"
          >
            <div className="container mx-auto px-6 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/20">
                  <span className="text-primary-foreground font-black text-2xl tracking-tighter">A</span>
                </div>
                <div className="flex flex-col">
                  <h1 className="text-2xl font-black text-white leading-none uppercase">{settings.siteName || "WORKSPACE"}</h1>
                  <p className="text-[10px] text-primary font-bold tracking-widest mt-1">Computer Education Institute</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                {settings.secondaryLogo && (
                  <img src={settings.secondaryLogo} alt="Logo" className="hidden lg:block h-10 w-auto opacity-40 hover:opacity-100 transition-opacity" />
                )}
                <div className="flex items-center gap-3 pl-6 border-l border-white/10">
                  {user ? (
                    <div className="flex items-center gap-4">
                      <Link href="/admin">
                        <Button variant="ghost" className="text-xs font-bold tracking-widest text-white hover:bg-white/10">
                          DASHBOARD
                        </Button>
                      </Link>
                      <Avatar className="h-9 w-9 ring-2 ring-primary/20">
                        <AvatarImage src={user.image} />
                        <AvatarFallback className="bg-primary text-primary-foreground font-bold">{user.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </div>
                  ) : (
                    <Link href="/login">
                      <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-black px-8 h-11 rounded-lg text-xs tracking-widest shadow-xl shadow-primary/20">LOGIN</Button>
                    </Link>
                  )}
                  <Button variant="ghost" size="icon" className="lg:hidden text-white" onClick={() => setIsMobileMenuOpen(true)}>
                    <Menu className="h-6 w-6" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tier 3: Navigation Bar (Now with Sticky Branding & Actions) */}
      <div className={cn(
        "hidden lg:flex w-full transition-all duration-500 z-[90] py-4",
        isScrolled
          ? "fixed top-0 bg-zinc-950/90 backdrop-blur-2xl border-b border-white/5 py-3 shadow-2xl"
          : "bg-transparent"
      )}>
        <div className={cn(
          "container mx-auto px-6 flex items-center",
          isScrolled ? "justify-between" : "justify-center"
        )}>
          {/* Sticky Left: Branding (Only visible when scrolled) */}
          {isScrolled && (
            <Link href="/" className="flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                <span className="text-primary-foreground font-black text-xl tracking-tighter">A</span>
              </div>
            </Link>
          )}

          {/* Middle: Links */}
          <div className="flex items-center gap-8">
            {visibleNavItems.map((item: any) => (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "text-[14px] font-bold transition-all relative group uppercase",
                  pathname === item.href ? "text-primary" : "text-zinc-400 hover:text-white"
                )}
              >
                {item.name}
                <span className={cn(
                  "absolute -bottom-1.5 left-0 h-0.5 bg-primary transition-all duration-500",
                  pathname === item.href ? "w-full" : "w-0 group-hover:w-full"
                )} />
              </Link>
            ))}
          </div>

          {/* Sticky Right: Actions (Only visible when scrolled) */}
          {isScrolled && (
            <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-4 duration-500">
              {user ? (
                <div className="flex items-center gap-3">
                  <Link href="/admin">
                    <Button variant="ghost" size="sm" className="text-[10px] font-bold tracking-widest text-white hover:bg-white/10 h-8">
                      DASHBOARD
                    </Button>
                  </Link>
                  <Avatar className="h-8 w-8 ring-1 ring-white/10">
                    <AvatarImage src={user.image} />
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xs">{user.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
              ) : (
                <Link href="/login">
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-black px-6 h-9 rounded-lg text-[10px] tracking-widest shadow-lg">
                    LOGIN
                  </Button>
                </Link>
              )}
            </div>
          )}
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
              {visibleNavItems.map((item: any) => (
                <Link key={item.id} href={item.href} onClick={() => setIsMobileMenuOpen(false)} className="text-3xl font-black text-zinc-500 hover:text-primary transition-colors uppercase tracking-tighter">
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
