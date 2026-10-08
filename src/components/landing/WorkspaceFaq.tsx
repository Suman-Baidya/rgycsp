"use client"

import { useState } from "react";
import { Plus, Minus, HelpCircle, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function WorkspaceFaq({ data }: { data?: any }) {
  const content = data?.content || {};
  const title = data?.title || "Frequently Asked Questions";
  const subtitle = data?.subtitle || "Got Questions?";
  
  const faqs = (content.faqs && content.faqs.length > 0) ? content.faqs : [
    {
      question: "What are the eligibility criteria for admission?",
      answer: "Eligibility varies by course. Generally, for undergraduate courses, a minimum of 50% in 10+2 is required. Please check the specific course page for detailed requirements."
    },
    {
      question: "Does the institute provide hostel facilities?",
      answer: "Yes, we have separate modern hostels for boys and girls within the campus premises, equipped with 24/7 security and Wi-Fi."
    },
    {
      question: "Are there any scholarship programs available?",
      answer: "We offer various merit-based and need-based scholarships. Learners with exceptional academic records or sports achievements are encouraged to apply."
    },
    {
      question: "What is the placement record of the institute?",
      answer: "We have an excellent placement record with 90%+ learners placed in reputed organizations every year. Our average package has consistently increased year-on-year."
    }
  ];

  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-12 sm:py-16 md:py-20 relative overflow-hidden bg-transparent">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[90px] -mr-60 -mt-60 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-blue-500/5 rounded-full blur-[70px] -ml-40 -mb-40 pointer-events-none" />
      
      {/* Watermark Icon */}
      <div className="absolute top-16 left-6 opacity-[0.02] dark:opacity-[0.04] -rotate-12 pointer-events-none hidden sm:block">
        <HelpCircle className="w-[300px] h-[300px] text-slate-900 dark:text-white" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="text-center mb-7 sm:mb-10 space-y-2 sm:space-y-2.5">
          <div className="inline-flex items-center justify-center gap-2.5 text-primary font-bold tracking-[0.2em] text-[10px] sm:text-xs uppercase w-full">
            <div className="h-0.5 w-6 sm:w-8 bg-primary/60" />
            {subtitle}
            <div className="h-0.5 w-6 sm:w-8 bg-primary/60" />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto font-normal">
            {content.description || "Everything you need to know about our admission process, campus life, and more."}
          </p>
        </div>

        <div className="space-y-2 sm:space-y-2.5">
          {faqs.map((faq: any, i: number) => {
            const isOpen = activeIndex === i;
            return (
              <div 
                key={i} 
                className={cn(
                  "group rounded-xl sm:rounded-2xl border transition-all duration-200 overflow-hidden",
                  isOpen 
                    ? "bg-white dark:bg-slate-900 border-primary/30 shadow-xs shadow-primary/5" 
                    : "bg-white/70 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800 hover:border-primary/20 hover:bg-white dark:hover:bg-slate-900/60"
                )}
              >
                <button 
                  onClick={() => setActiveIndex(isOpen ? null : i)}
                  suppressHydrationWarning
                  className="w-full px-3.5 py-3 sm:px-4.5 sm:py-3.5 flex items-center justify-between text-left focus:outline-none gap-2.5 cursor-pointer"
                >
                  <span className={cn(
                    "text-xs sm:text-sm md:text-[15px] font-bold leading-snug flex-1 transition-colors",
                    isOpen ? "text-primary dark:text-primary" : "text-slate-900 dark:text-white"
                  )}>
                    {faq.question}
                  </span>
                  <div className={cn(
                    "w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-all shrink-0",
                    isOpen 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-primary group-hover:text-primary-foreground"
                  )}>
                    {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  </div>
                </button>
                
                <div className={cn(
                  "transition-all duration-300 ease-in-out px-3.5 sm:px-4.5 overflow-hidden",
                  isOpen ? "max-h-[500px] pb-3 sm:pb-3.5 opacity-100" : "max-h-0 opacity-0"
                )}>
                  <div className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-2 sm:pt-2.5 font-normal">
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 sm:mt-10 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-slate-950 text-white flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 relative overflow-hidden group border border-slate-800 shadow-sm">
           <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full -mr-24 -mt-24 blur-2xl group-hover:bg-primary/20 transition-colors pointer-events-none" />
           <div className="relative z-10 flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <div className="w-9 h-9 sm:w-11 sm:h-11 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                 <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div className="space-y-0.5">
                 <h4 className="text-xs sm:text-sm md:text-base font-bold text-white">
                   {content.ctaTitle || "Still have questions?"}
                 </h4>
                 <p className="text-[11px] sm:text-xs text-slate-400 font-normal">
                   {content.ctaDesc || "We're here to help you every step of the way."}
                 </p>
              </div>
           </div>
           {content.ctaButtonLink ? (
             <a href={content.ctaButtonLink} className="w-full sm:w-auto shrink-0">
                <Button className="relative z-10 h-8 sm:h-9 px-4 sm:px-5 rounded-lg font-bold text-xs bg-primary text-primary-foreground hover:bg-primary/90 transition-transform shadow-sm shadow-primary/20 border-none w-full sm:w-auto">
                   {content.ctaButtonText || "Chat with Admissions"}
                </Button>
             </a>
           ) : (
              <Button className="relative z-10 h-8 sm:h-9 px-4 sm:px-5 rounded-lg font-bold text-xs bg-primary text-primary-foreground hover:bg-primary/90 transition-transform shadow-sm shadow-primary/20 border-none w-full sm:w-auto shrink-0">
                 {content.ctaButtonText || "Chat with Admissions"}
              </Button>
           )}
        </div>
      </div>
    </section>
  );
}
