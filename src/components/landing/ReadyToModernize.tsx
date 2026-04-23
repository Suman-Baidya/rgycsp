"use client"

import { Button } from "@/components/ui/button";

export function ReadyToModernize() {
  return (
    <section className="relative py-20 px-6 overflow-hidden flex items-center justify-center text-center">
      {/* Background with Parallax effect */}
      <div
        className="absolute inset-0 z-0 bg-fixed bg-cover bg-center"
        style={{ backgroundImage: `url('https://cdn.pixabay.com/photo/2016/09/28/04/35/classroom-1699745_1280.jpg')` }}
      >
        <div className="absolute inset-0 bg-zinc-950/50 backdrop-blur-[2px]"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-primary/10"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white border border-primary/30 text-black font-bold text-[10px] tracking-[0.2em] uppercase mb-8 animate-bounce">
          Get Started Today
        </div>
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-8 tracking-tighter leading-none">
          Ready to modernize <br />
          <span className="text-transparent [-webkit-text-stroke:2px_white] tracking-wide">Your Institute?</span>
        </h2>
        <p className="text-xl md:text-xl text-zinc-300 mb-12 max-w-2xl mx-auto leading-relaxed">
          Join the elite league of institutes already scaling with ABCD Edu Hub's AI-driven ecosystem.
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <button className="group relative h-16 px-12 bg-primary text-primary-foreground font-black text-lg rounded-2xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_20px_40px_rgba(var(--primary),0.3)]">
            <span className="relative z-10">Get Started</span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          </button>
          <button className="h-16 px-12 border-2 border-white/20 text-white font-bold text-lg rounded-2xl hover:bg-white hover:text-zinc-950 transition-all hover:scale-105 active:scale-95 backdrop-blur-sm">
            Book a Demo
          </button>
        </div>

        {/* Trust Badges */}
        <p className="mt-12 text-md text-white font-bold uppercase tracking-widest">
          Trusted by 100+ Institutes Worldwide
        </p>
      </div>
    </section>
  );
}
