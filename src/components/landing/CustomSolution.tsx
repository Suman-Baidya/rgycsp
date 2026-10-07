import React from "react";
import { Phone, Mail, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

export function CustomSolution({ data }: { data?: any }) {
  const content = data?.content || {};

  const defaults = {
    bgImage: "https://cdn.pixabay.com/photo/2017/09/09/09/17/problem-2731501_1280.jpg",
    badge: "Tailored Excellence",
    title: "Need a Custom Solution?",
    description: "For large franchises, government projects, or unique institutional requirements, we offer fully tailored enterprise packages with dedicated managers.",
    contact: {
      phone: "+91 89448 99747",
      email: "sb.abcd321@gmail.com",
      whatsapp: "+91 81676 85731"
    },
    primaryBtn: { label: "Talk to Our Experts", link: "/contact" },
    secondaryBtn: { label: "View All Features", link: "/services" }
  };

  const final = { ...defaults, ...content };
  const contact = { ...defaults.contact, ...content.contact };
  const primaryBtn = { ...defaults.primaryBtn, ...content.primaryBtn };
  const secondaryBtn = { ...defaults.secondaryBtn, ...content.secondaryBtn };

  const titleWords = (final.title || "").split(" ");
  const lastWord = titleWords.length > 1 ? titleWords.pop() : "";
  const firstPart = titleWords.join(" ");

  return (
    <section className="relative py-20 sm:py-28 px-4 sm:px-6 overflow-hidden flex items-center justify-center text-center">
      {/* Parallax Background */}
      <div
        className="absolute inset-0 z-0 bg-fixed bg-cover bg-center"
        style={{ backgroundImage: `url('${final.bgImage}')` }}
      >
        <div className="absolute inset-0 bg-zinc-950/85 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 via-transparent to-primary/10 pointer-events-none" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10 text-white w-full flex flex-col items-center">
        {/* Tagline Badge */}
        <div className="inline-flex items-center gap-2.5 text-emerald-400 font-bold text-xs sm:text-sm tracking-[0.25em] uppercase mb-4 drop-shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] animate-pulse shrink-0" />
          <span>{final.badge}</span>
        </div>

        {/* Heading */}
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold mb-5 tracking-tight leading-[1.15] text-balance">
          {firstPart && <>{firstPart} </>}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-100 to-primary/80">
            {lastWord || final.title}
          </span>
        </h2>

        {/* Description */}
        <p className="text-sm sm:text-base md:text-lg text-zinc-300 font-normal mb-10 max-w-2xl mx-auto leading-relaxed text-balance">
          {final.description}
        </p>

        {/* Contact Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 mb-12 w-full max-w-4xl">
          <a 
            href={`tel:${contact.phone.replace(/\s+/g, '')}`} 
            className="group p-6 rounded-[2rem] bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Phone className="w-6 h-6" />
            </div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Call Support</p>
            <p className="text-base sm:text-lg font-bold text-white">{contact.phone}</p>
          </a>

          <a 
            href={`mailto:${contact.email}`} 
            className="group p-6 rounded-[2rem] bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-2xl bg-pink-500/20 text-pink-400 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Mail className="w-6 h-6" />
            </div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Email Inquiries</p>
            <p className="text-base sm:text-lg font-bold text-white truncate px-2">{contact.email}</p>
          </a>

          <a 
            href={`https://wa.me/${contact.whatsapp.replace(/\D/g, '')}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="group p-6 rounded-[2rem] bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-2xl bg-green-500/20 text-green-400 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <div className="relative">
                <Phone className="w-6 h-6" />
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-zinc-950 animate-pulse" />
              </div>
            </div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">WhatsApp Chat</p>
            <p className="text-base sm:text-lg font-bold text-white">{contact.whatsapp}</p>
          </a>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center w-full sm:w-auto">
          <Link 
            href={primaryBtn.link} 
            className="inline-flex items-center justify-center h-13 sm:h-14 px-8 sm:px-10 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-2xl transition-all shadow-lg shadow-primary/25 active:scale-95 text-sm sm:text-base"
          >
            {primaryBtn.label}
          </Link>
          <Link 
            href={secondaryBtn.link} 
            className="inline-flex items-center justify-center h-13 sm:h-14 px-8 sm:px-10 border border-white/20 text-white font-bold rounded-2xl hover:bg-white/10 transition-all backdrop-blur-sm active:scale-95 text-sm sm:text-base"
          >
            {secondaryBtn.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
