"use client"

import { Target, CheckCircle2 } from "lucide-react";

export function MissionSection() {
  return (
    <section className="py-24 px-6 bg-zinc-50 dark:bg-black/20 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        {/* Image Side */}
        <div className="flex-1 relative group">
          <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl z-10 border-4 border-white dark:border-zinc-800">
            <img
              src="https://cdn.pixabay.com/photo/2017/05/02/03/41/action-2277292_1280.jpg"
              alt="Our Mission"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 to-transparent mix-blend-overlay"></div>
          </div>
          {/* Decorative Elements */}
          <div className="absolute -top-6 -left-6 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px]"></div>
        </div>

        {/* Content Side */}
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-primary/5 border border-primary/20 text-primary font-bold text-[10px] tracking-[0.2em] uppercase mb-6">
            <Target className="w-4 h-4" />
            Our Mission
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-8">
            Empowering Every Learner with Technology
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-10">
            Our mission is to democratize high-end educational technology. We believe every institution, regardless of its size or location, deserves access to the tools that drive excellence, efficiency, and engagement in the digital age.
          </p>

          <div className="space-y-6">
            {[
              "Accessibility for all educational tiers.",
              "Seamless automation of administrative workflows.",
              "Building a secure, global educational ecosystem."
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="mt-1 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </div>
                <p className="font-semibold text-foreground/90">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
