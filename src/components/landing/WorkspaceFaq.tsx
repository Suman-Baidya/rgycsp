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
      answer: "We offer various merit-based and need-based scholarships. Students with exceptional academic records or sports achievements are encouraged to apply."
    },
    {
      question: "What is the placement record of the institute?",
      answer: "We have an excellent placement record with 90%+ students placed in reputed organizations every year. Our average package has consistently increased year-on-year."
    }
  ];

  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 px-6 bg-slate-50 dark:bg-slate-900/10 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] -mr-64 -mt-64" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[80px] -ml-48 -mb-48" />
      
      {/* Watermark Icon */}
      <div className="absolute top-20 left-10 opacity-[0.03] dark:opacity-[0.05] -rotate-12 pointer-events-none">
        <HelpCircle className="w-[400px] h-[400px] text-slate-900 dark:text-white" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center justify-center gap-3 text-primary font-black tracking-[0.2em] text-[10px] uppercase w-full">
            <div className="h-0.5 w-10 bg-primary" />
            {subtitle}
            <div className="h-0.5 w-10 bg-primary" />
          </div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
            {title}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            {content.description || "Everything you need to know about our admission process, campus life, and more."}
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq: any, i: number) => (
            <div 
              key={i} 
              className={cn(
                "group rounded-[2rem] border transition-all duration-300 overflow-hidden",
                activeIndex === i ? "bg-white dark:bg-zinc-900 border-primary/20 shadow-md shadow-primary/5" : "bg-transparent border-border/60 hover:border-primary/20"
              )}
            >
              <button 
                onClick={() => setActiveIndex(activeIndex === i ? null : i)}
                className="w-full p-8 flex items-center justify-between text-left focus:outline-none"
              >
                <span className="text-xl font-bold pr-8">{faq.question}</span>
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                  activeIndex === i ? "bg-primary text-white rotate-180" : "bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-white"
                )}>
                  {activeIndex === i ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
              </button>
              
              <div className={cn(
                "transition-all duration-500 ease-in-out px-8 overflow-hidden",
                activeIndex === i ? "max-h-[500px] pb-8 opacity-100" : "max-h-0 opacity-0"
              )}>
                <div className="text-lg text-muted-foreground leading-relaxed border-t border-border/40 pt-6">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 p-10 rounded-[3rem] bg-zinc-950 text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/20 transition-colors" />
           <div className="relative z-10 flex items-center gap-6">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
                 <MessageCircle className="w-8 h-8 text-primary" />
              </div>
              <div>
                 <h4 className="text-2xl font-black">{content.ctaTitle || "Still have questions?"}</h4>
                 <p className="text-zinc-400 font-medium">{content.ctaDesc || "We're here to help you every step of the way."}</p>
              </div>
           </div>
           {content.ctaButtonLink ? (
             <a href={content.ctaButtonLink}>
                <Button className="relative z-10 h-14 px-10 rounded-2xl font-black text-lg bg-primary hover:scale-105 transition-transform shadow-lg shadow-primary/20 border-none">
                   {content.ctaButtonText || "Chat with Admissions"}
                </Button>
             </a>
           ) : (
              <Button className="relative z-10 h-14 px-10 rounded-2xl font-black text-lg bg-primary hover:scale-105 transition-transform shadow-lg shadow-primary/20 border-none">
                 {content.ctaButtonText || "Chat with Admissions"}
              </Button>
           )}
        </div>
      </div>
    </section>
  );
}
