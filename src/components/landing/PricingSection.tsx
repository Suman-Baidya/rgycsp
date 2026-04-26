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

  return (
    <div id="pricing" className="bg-zinc-50 dark:bg-black/20">
      {/* 1. Free Demo Section - High Impact Banner */}
      {showDemoBanner && (
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
      )}

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
              {title}
            </h2>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-6 mt-10">
              <span className={`text-sm font-bold transition-all duration-300 ${!isYearly ? "text-primary scale-110" : "text-muted-foreground opacity-50"}`}>Monthly</span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className="relative w-20 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-full p-1.5 transition-all duration-500 hover:scale-105 active:scale-95 shadow-inner group"
              >
                <div className={`h-full aspect-square bg-primary rounded-full shadow-lg transition-all duration-500 ease-in-out transform ${isYearly ? "translate-x-10" : "translate-x-0"}`}>
                  <div className="absolute inset-0 bg-zinc-950 dark:bg-white rounded-full group-hover:opacity-100 transition-opacity"></div>
                </div>
              </button>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-bold transition-all duration-300 ${isYearly ? "text-primary scale-110" : "text-muted-foreground opacity-50"}`}>Yearly</span>
                <span className="py-1.5 px-3 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.1em] border border-primary/20 animate-pulse">Save 20%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {plans.map((plan: any, idx: number) => {
              const Icon = planIcons[idx] || Rocket;
              const isMain = idx === 1; // Institute plan is main
              const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;

              return (
                <div
                  key={idx}
                  className={`group relative p-10 rounded-[3rem] transition-all duration-500 hover:-translate-y-2 flex flex-col ${isMain
                    ? "bg-zinc-950 dark:bg-zinc-900 text-white border-4 border-primary/30 shadow-2xl scale-105 z-10"
                    : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-2xl"
                    }`}
                >
                  {isMain && <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[60px] -mr-10 -mt-10"></div>}

                  <div className="relative z-10 mb-8">
                    {isMain && (
                      <div className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-white text-black text-[10px] font-black uppercase tracking-widest mb-6">
                        Recommended
                      </div>
                    )}
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${isMain ? "bg-white/20 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className={`text-2xl font-black mb-2 ${isMain ? "text-white" : "text-foreground"}`}>{plan.name}</h3>
                    <p className={`text-sm font-medium ${isMain ? "text-zinc-300" : "text-zinc-600 dark:text-zinc-400"}`}>{plan.description}</p>
                  </div>

                  <div className="relative z-10 mb-8">
                    <div className="flex items-baseline gap-1">
                      <span className={`text-4xl font-black ${isMain ? "text-white" : "text-foreground"}`}>
                        {price !== "Custom" ? `₹${price}` : price}
                      </span>
                      {price !== "Custom" && <span className={`${isMain ? "text-zinc-400" : "text-zinc-500"} text-sm font-bold`}>/month</span>}
                    </div>
                    {isYearly && price !== "Custom" && (
                      <p className={`${isMain ? "text-white" : "text-primary"} text-[10px] font-black mt-2 uppercase tracking-widest`}>
                        Billed Annually
                      </p>
                    )}
                  </div>

                  <button className={`relative z-10 w-full h-14 font-black rounded-2xl hover:scale-105 active:scale-95 transition-all mb-10 ${isMain
                    ? "bg-white text-black shadow-[0_15px_30px_rgba(var(--primary),0.3)]"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    }`}>
                    {price === "Custom" ? "Contact for Custom Plan" : `Choose ${plan.name}`}
                  </button>

                  <ul className="relative z-10 space-y-4 flex-1">
                    {plan.features?.map((f: string, i: number) => (
                      <li key={i} className={`flex items-center gap-3 text-sm font-bold ${isMain ? "text-zinc-100" : "text-zinc-700 dark:text-zinc-300"}`}>
                        <Check className={`w-4 h-4 ${isMain ? "text-white" : "text-primary"}`} />
                        {f}
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




