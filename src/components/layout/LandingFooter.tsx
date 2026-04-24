"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, PhoneCall, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingFooter({ settings }: { settings?: any }) {
  const siteName = settings?.siteName || "ABCD Edu Hub";
  const logoUrl = settings?.logoUrl || "/logo.png";
  const contactEmail = settings?.contactEmail || "sb.abcd321@gmail.com";
  const contactPhone = settings?.contactPhone || "8944899747";
  const address = settings?.address || "Kolkata, West Bengal, India - 700001";
  const brandDescription = settings?.brandDescription || "A comprehensive Multi-Tenant AI-powered Educational platform automating workflows and connecting students effortlessly.";
  
  const navLinks = settings?.navigation || [
    { name: "Home", href: "/", id: "home", path: "/" },
    { name: "About", href: "/about", id: "about", path: "/about" },
    { name: "Services", href: "/services", id: "services", path: "/services" },
    { name: "Guide", href: "/guide", id: "guide", path: "/guide" },
    { name: "Pricing", href: "/pricing", id: "pricing", path: "/pricing" },
    { name: "Support", href: "/support", id: "support", path: "/support" }
  ];

  return (
    <footer className="w-full bg-zinc-950 text-zinc-300 pt-20 pb-10 font-sans border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
        {/* Brand Column */}
        <div className="flex flex-col gap-8">
          <Link href="/" className="flex items-center gap-3 shrink-0 group w-fit">
            <div className="relative w-12 h-12 flex items-center justify-center shrink-0 bg-white/5 rounded-2xl overflow-hidden border border-white/10 p-1">
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
              <div className="logo-fallback hidden w-full h-full bg-primary text-primary-foreground flex items-center justify-center font-black text-xl uppercase">
                {siteName.charAt(0)}
              </div>
            </div>
            <span className="text-2xl font-black tracking-tighter font-heading text-white flex items-center gap-1 group-hover:text-primary transition-colors">
              {siteName}
            </span>
          </Link>

          <p className="text-[15px] leading-relaxed text-zinc-400 font-medium italic opacity-80 border-l-2 border-primary/30 pl-4">
            {brandDescription}
          </p>
          
          <div className="flex gap-4 items-center">
            {settings?.socialLinks?.facebook && <Link href={settings.socialLinks.facebook} target="_blank" className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all"><Facebook className="w-4 h-4" /></Link>}
            {settings?.socialLinks?.twitter && <Link href={settings.socialLinks.twitter} target="_blank" className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all"><Twitter className="w-4 h-4" /></Link>}
            {settings?.socialLinks?.instagram && <Link href={settings.socialLinks.instagram} target="_blank" className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all"><Instagram className="w-4 h-4" /></Link>}
            {settings?.socialLinks?.linkedin && <Link href={settings.socialLinks.linkedin} target="_blank" className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all"><Linkedin className="w-4 h-4" /></Link>}
            {settings?.whatsapp && <Link href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`} target="_blank" className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center hover:bg-green-500 hover:text-white transition-all"><PhoneCall className="w-4 h-4" /></Link>}
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col gap-6">
          <div className="relative w-fit">
            <h4 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-2">Platform</h4>
            <div className="h-1 w-8 bg-primary rounded-full"></div>
          </div>
          <div className="flex flex-col gap-4">
            <Link href="/about" className="text-sm font-bold hover:text-primary transition-colors flex items-center gap-2 group"><ArrowRight className="w-3 h-3 text-primary group-hover:translate-x-1 transition-transform" /> Our Journey</Link>
            <Link href="/services" className="text-sm font-bold hover:text-primary transition-colors flex items-center gap-2 group"><ArrowRight className="w-3 h-3 text-primary group-hover:translate-x-1 transition-transform" /> Ecosystem</Link>
            <Link href="/support" className="text-sm font-bold hover:text-primary transition-colors flex items-center gap-2 group"><ArrowRight className="w-3 h-3 text-primary group-hover:translate-x-1 transition-transform" /> Help Center</Link>
            <Link href="/guide" className="text-sm font-bold hover:text-primary transition-colors flex items-center gap-2 group"><ArrowRight className="w-3 h-3 text-primary group-hover:translate-x-1 transition-transform" /> Partner Program</Link>
          </div>
        </div>

        {/* Menus Column (Synced with Navbar) */}
        <div className="flex flex-col gap-6">
          <div className="relative w-fit">
            <h4 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-2">Navigation</h4>
            <div className="h-1 w-8 bg-primary rounded-full"></div>
          </div>
          <div className="flex flex-col gap-4">
            {navLinks.map((link: any) => (
              <Link key={link.id} href={link.href} className="text-sm font-bold hover:text-primary transition-colors flex items-center gap-2 group">
                <ArrowRight className="w-3 h-3 text-primary group-hover:translate-x-1 transition-transform" /> {link.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Contact Info (Moved to Right) */}
        <div className="flex flex-col gap-6">
          <div className="relative w-fit">
            <h4 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-2">Connect</h4>
            <div className="h-1 w-8 bg-primary rounded-full"></div>
          </div>
          <div className="space-y-6">
            <div className="flex items-start gap-4 text-sm">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 group-hover:bg-primary transition-colors">
                 <MapPin className="w-4 h-4 text-primary" />
              </div>
              <span className="font-bold leading-relaxed">{address}</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                 <PhoneCall className="w-4 h-4 text-primary" />
              </div>
              <Link href={`tel:${contactPhone}`} className="font-black hover:text-primary transition-colors">{contactPhone}</Link>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                 <Mail className="w-4 h-4 text-primary" />
              </div>
              <Link href={`mailto:${contactEmail}`} className="font-black hover:text-primary transition-colors">{contactEmail}</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] uppercase font-black tracking-widest text-zinc-500">
        <p>© {new Date().getFullYear()} {siteName}. Engineered for Excellence.</p>
        <div className="flex gap-8">
          <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
          <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
          <Link href="#" className="hover:text-primary transition-colors">Sitemap</Link>
        </div>
      </div>
    </footer>
  );
}

// Inline SVGs for social icons
const Facebook = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
const Twitter = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
const Instagram = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
const Linkedin = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
