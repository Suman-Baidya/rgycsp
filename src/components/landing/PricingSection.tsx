"use client"

import { useState } from "react";
import { Check, Zap, BookOpenCheck, ShieldCheck, Rocket } from "lucide-react";


const FEATURES = [
  "Complete Separate Workspace",
  "AI-Powered Assessments",
  "Role-Based Dashboards",
  "Custom Sub-domain Branding",
  "Financial & Fee Management",
  "Attendance & Schedule Tracking",
  "Parental Access Portal",
  "24/7 Priority Support"
];

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(true);

  return (
    <div id="pricing" className="bg-zinc-50 dark:bg-black/20">
      {/* 1. Free Demo Section - High Impact Banner */}
      <section className="py-20 px-6 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-5xl mx-auto">
          <div className="relative group p-8 md:p-12 rounded-[3rem] bg-white dark:bg-zinc-900 border-2 border-dashed border-primary/30 flex flex-col md:flex-row items-center gap-10 overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -z-10"></div>

            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-6">
                Limited Time Offer
              </div>
              <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">
                Try Our <span className="text-primary">Free Demo Version</span>
              </h2>
              <p className="text-lg text-muted-foreground font-medium mb-0">
                Experience the complete ABCD Edu Hub ecosystem for 30 days. No credit card required. No hidden strings.
              </p>
            </div>

            <div className="flex flex-col items-center gap-4 min-w-[240px]">
              <div className="text-center mb-2">
                <span className="text-5xl font-black">₹0</span>
                <span className="text-muted-foreground text-sm font-bold">/30 Days</span>
              </div>
              <button className="w-full h-14 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-black rounded-2xl hover:scale-105 transition-all shadow-xl">
                Get Instant Access
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Pricing Table */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-primary/5 border border-primary/20 text-primary font-bold text-[10px] tracking-[0.2em] uppercase mb-4">
              <Zap className="w-4 h-4" />
              Subscription Plans
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-6">
              Choose the <span className="text-primary">Right Plan</span> for You
            </h2>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <span className={`text-sm font-bold ${!isYearly ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className="relative w-14 h-7 bg-zinc-200 dark:bg-zinc-800 rounded-full p-1 transition-colors"
              >
                <div className={`w-5 h-5 bg-primary rounded-full transition-transform ${isYearly ? "translate-x-7" : "translate-x-0"}`}></div>
              </button>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${isYearly ? "text-foreground" : "text-muted-foreground"}`}>Yearly</span>
                <span className="py-1 px-2 rounded-lg bg-green-500/10 text-green-600 text-[10px] font-black uppercase tracking-widest">Save 20%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">

            {/* 1. Coaching Plan */}
            <div className="group relative p-10 rounded-[3rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="mb-8">
                <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-6 text-zinc-600 dark:text-zinc-400">
                  <BookOpenCheck className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black mb-2 text-foreground">Coaching Plan</h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm font-medium">Ideal for individual coaches and small batches.</p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-foreground">₹{isYearly ? "999" : "1,299"}</span>
                  <span className="text-zinc-500 text-sm font-bold">/month</span>
                </div>
                {isYearly && <p className="text-primary text-[10px] font-black mt-2 uppercase tracking-widest">Billed Annually</p>}
              </div>

              <button className="w-full h-14 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-black rounded-2xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors mb-10">
                Choose Coaching Plan
              </button>

              <ul className="space-y-4">
                {FEATURES.slice(0, 5).map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-bold text-zinc-700 dark:text-zinc-300">
                    <Check className="w-4 h-4 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* 2. Institute Plan */}
            <div className="group relative p-10 rounded-[3rem] bg-zinc-950 dark:bg-zinc-900 text-white border-4 border-primary/30 shadow-2xl transition-all duration-500 hover:-translate-y-4 overflow-hidden scale-105 z-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[60px] -mr-10 -mt-10"></div>

              <div className="relative z-10 mb-8">
                <div className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-white text-primary text-[10px] font-black uppercase tracking-widest mb-6">
                  Recommended
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-6 text-white">
                  <Zap className="w-6 h-6 fill-current" />
                </div>
                <h3 className="text-2xl font-black mb-2 text-white">Institute Plan</h3>
                <p className="text-zinc-300 text-sm font-medium">Standard choice for schools and coaching centers.</p>
              </div>

              <div className="relative z-10 mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black text-white">₹{isYearly ? "1,999" : "2,499"}</span>
                  <span className="text-zinc-400 text-sm font-bold">/month</span>
                </div>
                {isYearly && <p className="text-white text-[10px] font-black mt-2 uppercase tracking-widest">Billed Annually</p>}
              </div>

              <button className="relative z-10 w-full h-14 bg-white text-black font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_15px_30px_rgba(var(--primary),0.3)] mb-10">
                Choose Institute Plan
              </button>

              <ul className="relative z-10 space-y-4">
                {FEATURES.map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-bold text-zinc-100">
                    <Check className="w-4 h-4 text-white" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* 3. Enterprise Plan */}
            <div className="group relative p-10 rounded-[3rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="mb-8">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black mb-2 text-foreground">Enterprise</h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm font-medium">Unlimited features for large franchises.</p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-foreground">Custom</span>
                </div>
              </div>

              <button className="w-full h-14 border-2 border-zinc-200 dark:border-zinc-800 text-foreground font-black rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors mb-10">
                Contact for Custom Plan
              </button>

              <ul className="space-y-4">
                {FEATURES.map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-bold text-zinc-700 dark:text-zinc-300">
                    <Check className="w-4 h-4 text-primary" />
                    {f}
                  </li>
                ))}
                <li className="flex items-center gap-3 text-sm font-black text-primary">
                  <Rocket className="w-4 h-4" />
                  White-label & Domain Support
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>


    </div>
  );
}




