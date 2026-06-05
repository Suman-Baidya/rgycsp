"use client";

import Link from "next/link";
import Image from "next/image";
import { 
  Mail, PhoneCall, MapPin, ArrowRight, 
  Send, Globe, ShieldCheck 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LandingFooter({ settings }: { settings?: any }) {
  const siteName = settings?.siteName || "ABCD Edu Hub";
  const footerBrandName = settings?.navbarConfig?.footerBrandName || siteName;
  const logoUrl = settings?.logoUrl || "/logo.png";
  const contactEmail = settings?.contactEmail || "sb.abcd321@gmail.com";
  const contactPhone = settings?.contactPhone || "8944899747";
  const address = settings?.address || "Kolkata, West Bengal, India - 700001";
  const socialLinks = settings?.socialLinks || {};
  const whatsapp = settings?.whatsapp;
  
  const brandDescription = settings?.brandDescription || "Empowering the next generation of learners through innovative technology and expert-led educational programs. Your success is our ultimate mission.";
  const footerTagline = settings?.navbarConfig?.footerTagline || settings?.navbarConfig?.secondarySiteName || "Empowering Education Worldwide";
  
  const navLinks = settings?.navigation || [
    { name: "Home", href: "/", id: "home" },
    { name: "About", href: "/about", id: "about" },
    { name: "Courses", href: "/courses", id: "courses" },
    { name: "Contact", href: "/contact", id: "contact" }
  ];

  return (
    <footer className="w-full bg-zinc-950 text-zinc-300 pt-24 pb-12 font-sans relative overflow-hidden border-t border-white/5">
      {/* Decorative Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2" />
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Top Newsletter Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pb-20 border-b border-white/5 mb-20">
          <div className="space-y-4">
             <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight">
               Stay ahead with our <span className="text-primary">educational</span> insights
             </h3>
             <p className="text-zinc-400 font-medium text-lg">Join 5,000+ students receiving weekly updates and career tips.</p>
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
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-4 shrink-0 group w-fit">
              <div className="relative w-14 h-14 flex items-center justify-center shrink-0 bg-white rounded-xl overflow-hidden shadow-lg p-2 group-hover:shadow-primary/20 group-hover:scale-105 transition-all duration-300">
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
                <div className="logo-fallback hidden w-full h-full bg-primary text-primary-foreground flex items-center justify-center font-black text-2xl">
                  {siteName.charAt(0)}
                </div>
              </div>
              <div className="flex flex-col border-l-2 border-white/10 pl-4">
                <span className="text-2xl font-black tracking-tight text-white group-hover:text-primary transition-colors leading-tight">
                  {footerBrandName}
                </span>
                <span className="text-[10px] sm:text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">
                  {footerTagline}
                </span>
              </div>
            </Link>

            <p className="text-[14px] leading-relaxed text-zinc-400 font-medium pt-2">
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
              <h4 className="text-white font-bold text-xs tracking-[0.2em]">Our Institute</h4>
              <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-primary rounded-full"></div>
            </div>
            <div className="flex flex-col gap-4">
              {navLinks.map((link: any) => (
                <Link key={link.id} href={link.href} className="text-zinc-400 hover:text-primary font-bold text-[15px] transition-all flex items-center gap-2 group">
                  <ArrowRight className="w-3 h-3 text-primary/40 group-hover:text-primary group-hover:translate-x-1 transition-all" /> 
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Support Links */}
          <div className="space-y-8">
            <div className="relative w-fit">
              <h4 className="text-white font-bold text-xs tracking-[0.2em]">Support</h4>
              <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-primary rounded-full"></div>
            </div>
            <div className="flex flex-col gap-4">
              {[
                { name: 'Help Center', href: '/help' },
                { name: 'Privacy Policy', href: '/legal/privacy' },
                { name: 'Terms of Service', href: '/legal/terms' },
                { name: 'Cookie Policy', href: '/legal/cookie' }
              ].map((item) => (
                <Link key={item.name} href={item.href} className="text-zinc-400 hover:text-primary font-bold text-[15px] transition-all flex items-center gap-2 group">
                   <ArrowRight className="w-3 h-3 text-primary/40 group-hover:text-primary group-hover:translate-x-1 transition-all" /> 
                   {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact Column */}
          <div className="space-y-8">
            <div className="relative w-fit">
              <h4 className="text-white font-bold text-xs tracking-[0.2em]">Contact Us</h4>
              <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-primary rounded-full"></div>
            </div>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <p className="text-zinc-400 font-bold text-sm leading-relaxed">{address}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                  <PhoneCall className="w-4 h-4 text-primary" />
                </div>
                <Link href={`tel:${contactPhone}`} className="text-white font-bold text-sm hover:text-primary transition-colors">{contactPhone}</Link>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <Link href={`mailto:${contactEmail}`} className="text-white font-bold text-sm hover:text-primary transition-colors">{contactEmail}</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-24 pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6 text-[11px] font-bold tracking-widest text-zinc-500">
            <p>© {new Date().getFullYear()} {siteName}. All Rights Reserved.</p>
            <div className="hidden md:flex items-center gap-2 text-primary">
               <ShieldCheck className="w-4 h-4" />
               <span>Verified Secure Institute</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2 text-[11px] font-bold tracking-widest text-zinc-500">
                <Globe className="w-4 h-4 text-primary" />
                <span>Global Presence</span>
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
