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
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";

export function LandingNavbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState("light");
  const [isScrolled, setIsScrolled] = useState(false);

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
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add('dark');
      setTheme("dark");
    } else {
      root.classList.remove('dark');
      setTheme("light");
    }
  };

  const navLinks = [
    { name: "Home", href: "/", id: "home", path: "/" },
    { name: "About", href: "/about", id: "about", path: "/about" },
    { name: "Services", href: "/services", id: "services", path: "/services" },
    { name: "Guide", href: "/guide", id: "guide", path: "/guide" },
    { name: "Pricing", href: "/pricing", id: "pricing", path: "/pricing" },
    { name: "Support", href: "/support", id: "support", path: "/support" }
  ];

  // Simply match the current path
  const highlighted = pathname;

  return (
    <>
      {/* TIER 1: Top Bar (Icons, Theme) - Absolute (Scrolls away) */}
      <div className="absolute top-0 left-0 w-full z-50 hidden lg:flex bg-primary/90 backdrop-blur-sm py-2 px-6 justify-between items-center text-xs text-primary-foreground transition-colors duration-300">
        {/* Top Left: Social Logos only */}
        <div className="flex items-center gap-4">
          <Link href="#" aria-label="Youtube" className="hover:text-muted transition-colors"><Youtube className="w-4 h-4" /></Link>
          <Link href="#" aria-label="Facebook" className="hover:text-muted transition-colors"><Facebook className="w-4 h-4" /></Link>
          <Link href="#" aria-label="Instagram" className="hover:text-muted transition-colors"><Instagram className="w-4 h-4" /></Link>
          <Link href="#" aria-label="X (Twitter)" className="hover:text-muted transition-colors"><Twitter className="w-4 h-4" /></Link>
          <Link href="#" aria-label="LinkedIn" className="hover:text-muted transition-colors"><Linkedin className="w-4 h-4" /></Link>
        </div>

        {/* Top Right: Catalog, Theme */}
        <div className="flex items-center gap-4">
          <Link href="#" className="flex items-center gap-1.5 hover:text-muted transition-colors font-medium">
            Download Catalog
          </Link>
          <button
            onClick={toggleTheme}
            className="hover:text-accent p-1.5 rounded-full transition-colors"
            aria-label="Toggle Theme"
          >
            {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* TIER 2: Main Navigation - Fixed (Sticky) */}
      <div className={`fixed left-0 w-full z-50 transition-all duration-300 bg-background/95 backdrop-blur-md shadow-sm border-b/50 ${isScrolled ? 'top-0' : 'top-0 lg:top-[42px]'}`}>
        <div className="w-full px-6 py-4 flex justify-between items-center max-w-7xl mx-auto">

          {/* Left: Branding */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="relative w-10 h-10 flex items-center justify-center shrink-0 bg-primary/10 rounded-lg overflow-hidden">
              {/* Logo Image */}
              <Image
                src="/logo.png"
                alt="ABCD Edu Hub Logo"
                fill
                className="object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  if (e.currentTarget.nextElementSibling) {
                    e.currentTarget.nextElementSibling.classList.remove('hidden');
                  }
                }}
              />
              {/* Fallback Initials if Logo missing */}
              <div className="hidden w-full h-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                AE
              </div>
            </div>
            <span className="text-lg sm:text-2xl font-extrabold tracking-tight whitespace-nowrap font-heading text-foreground group-hover:text-primary transition-colors">
              ABCD <span className="text-primary">Edu Hub</span>
            </span>
          </Link>

          {/* Middle: Desktop Menus */}
          <nav className="hidden lg:flex items-center gap-6 text-[15px] font-bold text-foreground/80">
            {navLinks.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className={`transition-all duration-300 relative py-1 px-1 group ${highlighted === link.path ? 'text-primary' : 'hover:text-primary'}`}
              >
                {link.name}
                <span className={`absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300 ${highlighted === link.path ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
              </Link>
            ))}
          </nav>

          {/* Right: CTAs */}
          <div className="hidden lg:flex items-center gap-4 shrink-0">
            <Link href="/login">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-bold px-6 border-2">
                Login
              </Button>
            </Link>
            <Link href="tel:+918944899747">
              <Button className="font-bold shadow-md bg-primary text-primary-foreground hover:bg-primary/90 transition-opacity px-6">
                Call Now
              </Button>
            </Link>
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
            {navLinks.map((link) => (
              <Link 
                key={link.id} 
                href={link.href} 
                onClick={() => setIsOpen(false)}
                className={`transition-colors ${highlighted === link.path ? 'text-primary' : 'hover:text-primary'}`}
              >
                {link.name}
              </Link>
            ))}

            {/* Mobile Action Buttons */}
            <div className="flex flex-col gap-3 border-t border-border pt-6 mt-2">
              <Link href="/login" onClick={() => setIsOpen(false)} className="w-full">
                <Button variant="outline" className="w-full h-12 text-lg border-2 border-primary/50">Login</Button>
              </Link>
              <Link href="tel:+918944899747" onClick={() => setIsOpen(false)} className="w-full">
                <Button className="w-full bg-primary h-12 text-lg">Call Now</Button>
              </Link>
            </div>

            {/* Mobile Footer Tools */}
            <div className="flex items-center justify-between border-t border-border pt-6 mt-2 text-muted-foreground">
              <div className="flex items-center gap-6">
                <Phone className="w-5 h-5 cursor-pointer hover:text-primary" />
                <Mail className="w-5 h-5 cursor-pointer hover:text-primary" />
              </div>
              <button onClick={toggleTheme} className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-full text-foreground flex items-center gap-2 text-sm font-bold shadow-sm">
                {theme === "light" ? <><Moon className="w-4 h-4" /> Dark</> : <><Sun className="w-4 h-4" /> Light</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>

  );
}
