"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronDown, MessageCircleQuestion } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const DEFAULT_FAQS = [
  {
    question: "Do I need technical knowledge to manage?",
    answer: "Absolutely not! We designed the interface to be as intuitive as a smartphone. You handle your educational management, and we handle the complex serverless edge networking and database syncing."
  },
  {
    question: "How does the AI Token Economy work?",
    answer: "Instead of paying high per-seat cloud SaaS fees, your institute purchases an internal Token Balance. Generating an exam via Gemini AI might cost 3 tokens. You only pay for exactly what your staff consumes."
  },
  {
    question: "Are custom subdomains fully secured via SSL?",
    answer: "Yes. Every single institute deployed gets a completely isolated, 256-bit encrypted SSL protected subdomain automatically verified by Vercel edge networks."
  },
  {
    question: "Can parents log in and track attendance?",
    answer: "Yes, the portal includes an expansive Student Zone allowing both admitted students and their parents to view pending invoices, dynamic marksheets, and immediate attendance statuses."
  },
  {
    question: "Can teachers generate AI-powered lesson plans?",
    answer: "Yes. Educators can instantly create structured lesson outlines, quizzes, and assignments using Gemini AI, saving hours of preparation while ensuring adaptive, student-focused content."
  }
];

export function FaqSection({ data }: { data?: any }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const content = data?.content || {};
  const title = data?.title || "Frequently Asked Questions";
  const subtitle = data?.subtitle || "FAQ & Support";
  const image = content.image || "https://cdn.pixabay.com/photo/2019/06/02/15/45/call-centre-4246688_1280.jpg";
  const description = content.description || "Everything you need to know about navigating and mastering the platform.";
  const items = content.items && content.items.length > 0 ? content.items : DEFAULT_FAQS;

  // Split title to apply gradient accent to the last word for visual consistency
  const titleWords = title.split(" ");
  const lastWord = titleWords.length > 1 ? titleWords.pop() : "";
  const firstPart = titleWords.join(" ");

  const toggleAccordion = (index: number) => {
    setOpenIndex(prev => (prev === index ? null : index));
  };

  return (
    <section className="py-20 sm:py-24 px-4 sm:px-6 relative overflow-hidden bg-transparent" id="faq">
      {/* Background Decor Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[800px] h-[400px] bg-primary/5 rounded-[100%] blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          {/* Left Column: Image Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative h-[380px] sm:h-[460px] lg:h-[580px] w-full rounded-[2rem] overflow-hidden shadow-2xl border border-slate-200/80 dark:border-zinc-800 group">
              <Image 
                src={image}
                alt={content.imageTitle || "24/7 Dedicated Support"}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/85 via-zinc-950/30 to-transparent flex items-end p-6 sm:p-8">
                <div className="text-white space-y-1.5">
                  <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary mb-1">
                    <MessageCircleQuestion className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Help & Assistance</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                    {content.imageTitle || "24/7 Dedicated Support"}
                  </h3>
                  <p className="text-zinc-300 text-xs sm:text-sm font-medium leading-relaxed max-w-sm">
                    {content.imageDesc || "Our specialized team is always ready to guide students and franchise directors."}
                  </p>
                </div>
              </div>
            </div>

            {/* Subtle glow behind image */}
            <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />
          </div>

          {/* Right Column: FAQ Accordion with Smooth Animation */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            
            {/* Tagline */}
            <div className="mb-3">
              <div className="inline-flex items-center gap-2.5 text-primary font-bold text-xs tracking-[0.22em] uppercase">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
                <span>{subtitle}</span>
              </div>
            </div>

            {/* Section Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15] mb-4 text-slate-900 dark:text-white">
              {firstPart && <>{firstPart} </>}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                {lastWord || title}
              </span>
            </h2>

            {/* Section Description */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-8 max-w-2xl">
              {description}
            </p>

            {/* Accordion Container */}
            <div className="space-y-3">
              {items.map((faq: any, i: number) => {
                const isOpen = openIndex === i;
                return (
                  <div 
                    key={i} 
                    className={cn(
                      "rounded-2xl border transition-all duration-300 overflow-hidden",
                      isOpen 
                        ? "bg-white dark:bg-zinc-900/90 border-primary/40 dark:border-primary/30 shadow-md shadow-primary/5" 
                        : "bg-white/70 dark:bg-zinc-900/40 border-slate-200/80 dark:border-zinc-800/80 hover:border-slate-300 dark:hover:border-zinc-700"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => toggleAccordion(i)}
                      className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-4 focus:outline-none transition-colors"
                      aria-expanded={isOpen}
                    >
                      <span className={cn(
                        "text-sm sm:text-base font-bold transition-colors leading-snug",
                        isOpen ? "text-primary" : "text-slate-900 dark:text-white"
                      )}>
                        {faq.question}
                      </span>
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300",
                        isOpen 
                          ? "bg-primary text-primary-foreground rotate-180 shadow-sm" 
                          : "bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-slate-400"
                      )}>
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="content"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-zinc-800/60 mt-1">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
