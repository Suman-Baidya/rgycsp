"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Mail, PhoneCall, MapPin,
  ShieldCheck, Globe, ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function MainFooter({ settings }: { settings?: any }) {
  const siteName = settings?.siteName || "ABCD Edu Hub";
  const footerBrandName = settings?.navbarConfig?.footerBrandName || siteName;
  const logoUrl = settings?.logoUrl || "/logo.png";
  const footerTagline = settings?.navbarConfig?.footerTagline || "Global Education Platform";
  const contactEmail = settings?.contactEmail || "sb.abcd321@gmail.com";
  const contactPhone = settings?.contactPhone || "8944899747";
  const address = settings?.address || "Kolkata, West Bengal, India - 700001";
  const brandDescription = settings?.brandDescription || "The ultimate platform for modern educational management. Empowering institutes worldwide with cutting-edge technology and seamless digital transformation.";
  const socialLinks = settings?.socialLinks || {};

  // Dynamic Navigation from settings
  const navLinks = settings?.navigation?.length > 0
    ? settings.navigation
    : [
      { name: "Home", href: "/" },
      { name: "About Us", href: "/about" },
      { name: "Services", href: "/services" },
      { name: "Pricing", href: "/pricing" },
      { name: "Support", href: "/support" }
    ];

  // Dynamic Legal Links from sections (SiteSettings -> sections -> type starting with 'legal-')
  const dynamicLegalLinks = settings?.sections
    ?.filter((s: any) => s.type.startsWith("legal-") && s.isActive)
    .map((s: any) => ({
      name: s.title || s.type.replace("legal-", "").replace("-", " ").toUpperCase(),
      href: `/legal/${s.type.replace("legal-", "")}`
    }));

  const legalLinks = dynamicLegalLinks?.length > 0
    ? dynamicLegalLinks
    : [
      { name: "Privacy Policy", href: "/legal/privacy" },
      { name: "Terms of Service", href: "/legal/terms" },
      { name: "Cookie Policy", href: "/legal/cookie" },
      { name: "Security", href: "/legal/security" }
    ];

  const solutions = [
    { name: "LMS for Schools", href: "#" },
    { name: "Online Coaching", href: "#" },
    { name: "Skill Training", href: "#" },
    { name: "Corporate Education", href: "#" }
  ];

  return (
    <footer className="w-full bg-black text-white border-t border-white/20 transition-colors">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 lg:gap-12">
          {/* Brand Info */}
          <div className="lg:col-span-4 space-y-10">
            <Link href="/" className="flex items-center gap-1 w-fit group">
              <div className="relative w-20 h-20 flex items-center justify-center rounded overflow-hidden p-2 shadow-2xl shadow-white/10 group-hover:scale-105 transition-all duration-500">
                <Image
                  src={logoUrl}
                  alt={siteName}
                  fill
                  className="object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.parentElement?.querySelector('.logo-fallback');
                    if (fallback) fallback.classList.remove('hidden');
                  }}
                />
                <div className="logo-fallback hidden w-full h-full bg-white text-black flex items-center justify-center font-black text-xl uppercase">
                  {siteName.charAt(0)}
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-4xl font-black text-white leading-none">
                  {footerBrandName}
                </span>
                <span className="text-[10px] font-bold text-white tracking-tight mt-2 opacity-60">
                  {footerTagline}
                </span>
              </div>
            </Link>

            <p className="text-zinc-300 text-base leading-relaxed max-w-sm font-medium opacity-90">
              {brandDescription}
            </p>

            <div className="flex gap-5">
              {[
                { Icon: Facebook, link: socialLinks.facebook },
                { Icon: Twitter, link: socialLinks.twitter },
                { Icon: Instagram, link: socialLinks.instagram },
                { Icon: Linkedin, link: socialLinks.linkedin },
                { Icon: Youtube, link: socialLinks.youtube },
              ].map((item, i) => item.link && (
                <Link
                  key={i}
                  href={item.link}
                  target="_blank"
                  className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center text-white hover:text-black hover:bg-white hover:border-white transition-all duration-500 hover:-translate-y-1"
                >
                  <item.Icon className="w-5 h-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Links Grid */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-12">
            <div className="space-y-8">
              <h4 className="text-[11px] font-black text-white uppercase tracking-[0.25em] border-l-2 border-white pl-4">Menus</h4>
              <ul className="space-y-2">
                {navLinks.map((link: any) => (
                  <li key={link.name || link.label}>
                    <Link href={link.href} className="text-zinc-300 hover:text-white transition-all text-base font-bold flex items-center gap-3 group hover:underline decoration-white underline-offset-8 decoration-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/30 group-hover:bg-white transition-colors" />
                      {link.name || link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-8">
              <h4 className="text-[11px] font-black text-white uppercase tracking-[0.25em] border-l-2 border-white pl-4">Solutions</h4>
              <ul className="space-y-5">
                {solutions.map((link: any) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-zinc-300 hover:text-white transition-all text-base font-bold flex items-center gap-3 group hover:underline decoration-white underline-offset-8 decoration-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/30 group-hover:bg-white transition-colors" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-8">
              <h4 className="text-[11px] font-black text-white uppercase tracking-[0.25em] border-l-2 border-white pl-4">Legal</h4>
              <ul className="space-y-5">
                {legalLinks.map((link: any) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-zinc-300 hover:text-white transition-all text-base font-bold flex items-center gap-3 group hover:underline decoration-white underline-offset-8 decoration-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/30 group-hover:bg-white transition-colors" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Contact Info Bar */}
        <div className="mt-24 pt-12 border-t border-white/20 grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="flex items-center gap-5 group">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/20 group-hover:bg-white group-hover:border-white transition-all duration-500 shadow-xl">
              <MapPin className="w-5 h-5 text-white group-hover:text-black" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-white uppercase tracking-widest mb-1 opacity-50">Our Location</span>
              <span className="text-sm font-bold text-white transition-colors">{address}</span>
            </div>
          </div>
          <div className="flex items-center gap-5 group">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/20 group-hover:bg-white group-hover:border-white transition-all duration-500 shadow-xl">
              <PhoneCall className="w-5 h-5 text-white group-hover:text-black" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-white uppercase tracking-widest mb-1 opacity-50">Call Support</span>
              <span className="text-sm font-bold text-white transition-colors">{contactPhone}</span>
            </div>
          </div>
          <div className="flex items-center gap-5 group">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/20 group-hover:bg-white group-hover:border-white transition-all duration-500 shadow-xl">
              <Mail className="w-5 h-5 text-white group-hover:text-black" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-white uppercase tracking-widest mb-1 opacity-50">Email Us</span>
              <span className="text-sm font-bold text-white transition-colors">{contactEmail}</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-10 border-t border-white/20 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-4 text-[12px] font-bold text-white uppercase opacity-40">
            <p>© {new Date().getFullYear()} {siteName}. All rights reserved.</p>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 text-[11px] font-bold text-white uppercase opacity-40">
              <Globe className="w-4 h-4" />
              <span>Global Presence</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-bold text-white uppercase opacity-40">
              <ShieldCheck className="w-4 h-4" />
              <span>A Secure Platform</span>
            </div>
          </div>
        </div>
      </div>
    </footer>


  );
}

// Inline SVGs for social icons to ensure reliability across all environments
const Facebook = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
const Twitter = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
const Instagram = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
const Linkedin = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
const Youtube = ({ className }: any) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
