"use client"

import { Phone, Mail, ShieldCheck } from "lucide-react";

export function CustomSolution() {
  return (
    <section className="relative py-20 px-6 overflow-hidden flex items-center justify-center text-center">
      {/* Sticky Parallax Background */}
      <div
        className="absolute inset-0 z-0 bg-fixed bg-cover bg-center"
        style={{ backgroundImage: `url('https://cdn.pixabay.com/photo/2017/09/09/09/17/problem-2731501_1280.jpg')` }}
      >
        <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-[2px]"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 via-transparent to-primary/10"></div>
      </div>

      <div className="max-w-5xl mx-auto relative z-10 text-white">
        <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white/10 border border-white/20 text-white font-bold text-[10px] uppercase tracking-widest mb-8">
          <ShieldCheck className="w-4 h-4" />
          Tailored Excellence
        </div>
        <h2 className="text-4xl md:text-6xl font-black mb-8 leading-none">
          Need a Custom Solution?
        </h2>
        <p className="text-lg md:text-md text-zinc-300 font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
          For large franchises, government projects, or unique institutional requirements, we offer fully tailored enterprise packages with dedicated managers.
        </p>

        {/* Contact Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <a href="tel:+918944899747" className="group p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Phone className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Call Support</p>
            <p className="text-lg font-black text-white">+91 89448 99747</p>
          </a>

          <a href="mailto:sb.abcd321@gmail.com" className="group p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/20 text-pink-400 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Mail className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Email Inquiries</p>
            <p className="text-lg font-black text-white">sb.abcd321@gmail.com</p>
          </a>

          <a href="https://wa.me/918944899747" target="_blank" rel="noopener noreferrer" className="group p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-green-500/20 text-green-400 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <div className="relative">
                <Phone className="w-6 h-6" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-950 animate-pulse"></div>
              </div>
            </div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">WhatsApp Chat</p>
            <p className="text-lg font-black text-white">+91 89448 99747</p>
          </a>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <button className="h-16 px-12 bg-primary shadow-white/40 shadow-sm text-primary-foreground font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_rgba(var(--primary),0.3)]">
            Talk to Our Experts
          </button>
          <button className="h-16 px-12 border-2 border-white/20 text-white font-bold rounded-2xl hover:bg-white hover:text-zinc-950 transition-all">
            View All Features
          </button>
        </div>
      </div>
    </section>
  );
}
