"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, PhoneCall, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingFooter() {
  return (
    <footer className="w-full bg-zinc-950 text-zinc-300 pt-16 pb-8 font-sans">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Brand Column */}
        <div className="flex flex-col gap-6">
          <Link href="/" className="flex items-center gap-3 shrink-0 group w-fit">
            <div className="relative w-10 h-10 flex items-center justify-center shrink-0 bg-white/10 rounded-lg overflow-hidden">
              <Image
                src="/logo.png"
                alt="ABCD Edu Hub Logo"
                fill
                className="object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.parentElement?.querySelector('.logo-fallback');
                  if (fallback) fallback.classList.remove('hidden');
                }}
              />
              <div className="logo-fallback hidden w-full h-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                AE
              </div>
            </div>
            <span className="text-2xl font-extrabold tracking-tight font-heading text-white flex items-center gap-1">
              ABCD Edu Hub
            </span>
          </Link>

          <p className="text-sm leading-relaxed text-zinc-400">
            A comprehensive Multi-Tenant AI-powered Educational platform automating workflows and connecting students effortlessly.
          </p>
          <div className="flex gap-4 items-center">
            <Link href="#" aria-label="Youtube" className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-primary text-white transition-colors flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
            </Link>
            <Link href="#" aria-label="Facebook" className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-primary text-white transition-colors flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </Link>
            <Link href="#" aria-label="Instagram" className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-primary text-white transition-colors flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </Link>
            <Link href="#" aria-label="Twitter" className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-primary text-white transition-colors flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.73 11.73"></path><path d="M4 20l6.76-6.76"></path><path d="M20 20l-6.76-6.76"></path><path d="M20 4l-11.73 11.73"></path></svg>
            </Link>
            <Link href="#" aria-label="LinkedIn" className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-primary text-white transition-colors flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col gap-3">
          <div className="relative w-fit">
            <h4 className="text-white font-bold text-lg mb-1">Quick Links</h4>
            <div className="h-1 w-10 bg-white rounded-full mb-4"></div>
          </div>
          <Link href="/about" className="text-sm hover:text-white transition-colors flex items-center gap-1"><ArrowRight className="w-3 h-3 text-white/40" /> About Us</Link>
          <Link href="/services" className="text-sm hover:text-white transition-colors flex items-center gap-1"><ArrowRight className="w-3 h-3 text-white/40" /> Courses offered</Link>
          <Link href="/support" className="text-sm hover:text-white transition-colors flex items-center gap-1"><ArrowRight className="w-3 h-3 text-white/40" /> Student Zone</Link>
          <Link href="/guide" className="text-sm hover:text-white transition-colors flex items-center gap-1"><ArrowRight className="w-3 h-3 text-white/40" /> Get a Franchise</Link>
          <Link href="#" className="text-sm hover:text-white transition-colors flex items-center gap-1"><ArrowRight className="w-3 h-3 text-white/40" /> Photo Gallery</Link>
        </div>

        {/* Menus Column (Synced with Navbar) */}
        <div className="flex flex-col gap-3">
          <div className="relative w-fit">
            <h4 className="text-white font-bold text-lg mb-1">Menus</h4>
            <div className="h-1 w-10 bg-white rounded-full mb-4"></div>
          </div>
          <Link href="/" className="text-sm hover:text-white transition-colors flex items-center gap-2">
            <ArrowRight className="w-3 h-3 text-white/40" /> Home
          </Link>
          <Link href="/about" className="text-sm hover:text-white transition-colors flex items-center gap-2">
            <ArrowRight className="w-3 h-3 text-white/40" /> About
          </Link>
          <Link href="/services" className="text-sm hover:text-white transition-colors flex items-center gap-2">
            <ArrowRight className="w-3 h-3 text-white/40" /> Services
          </Link>
          <Link href="/guide" className="text-sm hover:text-white transition-colors flex items-center gap-2">
            <ArrowRight className="w-3 h-3 text-white/40" /> Guide
          </Link>
          <Link href="/pricing" className="text-sm hover:text-white transition-colors flex items-center gap-2">
            <ArrowRight className="w-3 h-3 text-white/40" /> Pricing
          </Link>
          <Link href="/support" className="text-sm hover:text-white transition-colors flex items-center gap-2">
            <ArrowRight className="w-3 h-3 text-white/40" /> Support
          </Link>
        </div>

        {/* Contact Info (Moved to Right) */}
        <div className="flex flex-col gap-3">
          <div className="relative w-fit">
            <h4 className="text-white font-bold text-lg mb-1">Contact Info</h4>
            <div className="h-1 w-10 bg-white rounded-full mb-4"></div>
          </div>
          <div className="flex items-start gap-3 mt-1 text-sm">
            <MapPin className="w-4 h-4 text-white shrink-0 mt-0.5" />
            <span>Kolkata, West Bengal<br />India - 700001</span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-sm">
            <PhoneCall className="w-4 h-4 text-white" />
            <span>8944899747</span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-sm">
            <Mail className="w-4 h-4 text-white" />
            <span>sb.abcd321@gmail.com</span>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="max-w-7xl mx-auto px-6 mt-16 pt-6 border-t border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
        <p>© {new Date().getFullYear()} ABCD Edu Hub. All rights reserved.</p>
        <div className="flex gap-6">
          <Link href="#" className="hover:text-zinc-300">Privacy Policy</Link>
          <Link href="#" className="hover:text-zinc-300">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
