"use client";

import { useState } from "react";
import { Check, Zap, BookOpenCheck, ShieldCheck, Rocket } from "lucide-react";

export function PricingSection({ data }: { data?: any }) {
  const [isYearly, setIsYearly] = useState(true);

  const content = data?.content || {};
  const title = data?.title || "Choose the Right Plan for You";
  const showDemoBanner = content.showDemoBanner !== false;

  const plans = content.plans || [
    {
      name: "Coaching Plan",
      monthlyPrice: "1,299",
      yearlyPrice: "999",
      description: "Ideal for individual coaches and small batches.",
      features: ["Complete Separate Workspace", "AI-Powered Assessments", "Role-Based Dashboards", "Custom Sub-domain Branding", "Financial & Fee Management"]
    },
    {
      name: "Institute Plan",
      monthlyPrice: "2,499",
      yearlyPrice: "1,999",
      description: "Standard choice for schools and coaching centers.",
      features: ["Complete Separate Workspace", "AI-Powered Assessments", "Role-Based Dashboards", "Custom Sub-domain Branding", "Financial & Fee Management", "Attendance & Schedule Tracking", "Parental Access Portal", "24/7 Priority Support"]
    },
    {
      name: "Enterprise",
      monthlyPrice: "Custom",
      yearlyPrice: "Custom",
      description: "Unlimited features for large franchises.",
      features: ["Complete Separate Workspace", "AI-Powered Assessments", "Role-Based Dashboards", "Custom Sub-domain Branding", "Financial & Fee Management", "Attendance & Schedule Tracking", "Parental Access Portal", "24/7 Priority Support", "White-label & Domain Support"]
    }
  ];

  const planIcons = [BookOpenCheck, Zap, ShieldCheck];

  const titleWords = title.split(" ");
  const lastWord = titleWords.length > 1 ? titleWords.pop() : "";
  const firstPart = titleWords.join(" ");

  return (
    <div id="pricing" className="bg-transparent">
      {/* 1. Free Demo Section - High Impact Banner */}
      {showDemoBanner && (
        <section className="py-16 sm:py-20 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="relative group p-6 sm:p-10 md:p-12 rounded-[2.5rem] bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-primary/30 flex flex-col md:flex-row items-center gap-8 md:gap-10 overflow-hidden shadow-xl shadow-primary/5">
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2.5 text-primary text-xs font-bold uppercase tracking-[0.22em] mb-3">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
                  <span>Limited Time Offer</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-3 tracking-tight text-slate-900 dark:text-white">
                  Try Our <span className="text-primary">Free Demo Version</span>
                </h2>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-normal leading-relaxed">
                  Experience the complete ABCD Edu Hub ecosystem for 30 days. No credit card required. No hidden strings.
                </p>
              </div>

              <div className="flex flex-col items-center gap-4 min-w-[220px] w-full md:w-auto">
                <div className="text-center">
                  <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">₹0</span>
                  <span className="text-muted-foreground text-xs sm:text-sm font-bold ml-1">/30 Days</span>
                </div>
                <a href="/contact" className="w-full">
                  <button className="w-full h-12 sm:h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-2xl transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 text-sm sm:text-base">
                    Get Instant Access
                  </button>
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. Main Pricing Table */}
      <section className="py-20 sm:py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-14 sm:mb-16">
            <div className="inline-flex items-center gap-2.5 text-primary font-bold text-xs tracking-[0.22em] uppercase mb-3">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
              <span>Subscription Plans</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15] mb-4 text-slate-900 dark:text-white">
              {firstPart && <>{firstPart} </>}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                {lastWord || title}
              </span>
            </h2>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 sm:gap-6 mt-8">
              <span className={`text-sm font-bold transition-all duration-300 ${!isYearly ? "text-primary scale-105" : "text-muted-foreground opacity-60"}`}>
                Monthly
              </span>
              <button
                type="button"
                onClick={() => setIsYearly(!isYearly)}
                className="relative w-16 sm:w-20 h-9 sm:h-10 bg-slate-200 dark:bg-zinc-800 rounded-full p-1 transition-all duration-300 active:scale-95 shadow-inner focus:outline-none"
                aria-label="Toggle billing frequency"
              >
                <div className={`h-full aspect-square bg-primary rounded-full shadow-md transition-all duration-300 ease-in-out transform ${isYearly ? "translate-x-7 sm:translate-x-10" : "translate-x-0"}`} />
              </button>
              <div className="flex items-center gap-2.5">
                <span className={`text-sm font-bold transition-all duration-300 ${isYearly ? "text-primary scale-105" : "text-muted-foreground opacity-60"}`}>
                  Yearly
                </span>
                <span className="py-1 px-2.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/20">
                  Save 20%
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
            {plans.map((plan: any, idx: number) => {
              const Icon = planIcons[idx] || Rocket;
              const isMain = idx === 1; // Institute plan is main
              const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;

              return (
                <div
                  key={idx}
                  className={`group relative p-8 sm:p-10 rounded-[2.5rem] transition-all duration-300 hover:-translate-y-2 flex flex-col ${
                    isMain
                      ? "bg-slate-950 dark:bg-zinc-900 text-white border-2 border-primary/50 shadow-2xl scale-[1.02] z-10"
                      : "bg-white/80 dark:bg-zinc-900/70 backdrop-blur-md border border-slate-200/80 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:border-primary/40"
                  }`}
                >
                  {isMain && (
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[60px] -mr-10 -mt-10 pointer-events-none" />
                  )}

                  <div className="relative z-10 mb-6">
                    {isMain && (
                      <div className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest mb-5 shadow-sm">
                        Recommended
                      </div>
                    )}
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${isMain ? "bg-white/10 text-primary" : "bg-primary/10 text-primary"}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className={`text-xl sm:text-2xl font-extrabold mb-2 ${isMain ? "text-white" : "text-slate-900 dark:text-white"}`}>
                      {plan.name}
                    </h3>
                    <p className={`text-xs sm:text-sm font-normal ${isMain ? "text-zinc-300" : "text-slate-600 dark:text-slate-400"}`}>
                      {plan.description}
                    </p>
                  </div>

                  <div className="relative z-10 mb-8">
                    <div className="flex items-baseline gap-1">
                      <span className={`text-3xl sm:text-4xl font-black ${isMain ? "text-white" : "text-slate-900 dark:text-white"}`}>
                        {price !== "Custom" ? `₹${price}` : price}
                      </span>
                      {price !== "Custom" && (
                        <span className={`${isMain ? "text-zinc-400" : "text-slate-500"} text-xs sm:text-sm font-bold`}>
                          /month
                        </span>
                      )}
                    </div>
                    {isYearly && price !== "Custom" && (
                      <p className={`${isMain ? "text-primary-foreground/80" : "text-primary"} text-[10px] font-bold mt-1.5 uppercase tracking-widest`}>
                        Billed Annually
                      </p>
                    )}
                  </div>

                  <a href="/contact" className="relative z-10 w-full mb-8">
                    <button className={`w-full h-12 sm:h-14 font-bold rounded-2xl active:scale-95 transition-all text-sm sm:text-base ${
                      isMain
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90"
                        : "bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white hover:bg-primary hover:text-primary-foreground"
                    }`}>
                      {price === "Custom" ? "Contact for Custom Plan" : `Choose ${plan.name}`}
                    </button>
                  </a>

                  <ul className="relative z-10 space-y-3.5 flex-1 border-t border-slate-100 dark:border-zinc-800/80 pt-6">
                    {plan.features?.map((f: string, i: number) => (
                      <li key={i} className={`flex items-center gap-3 text-xs sm:text-sm font-medium ${isMain ? "text-zinc-200" : "text-slate-700 dark:text-slate-300"}`}>
                        <Check className="w-4 h-4 text-primary shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
