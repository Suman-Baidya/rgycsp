import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MessageCircleQuestion } from "lucide-react";

const FAQS = [
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
  const content = data?.content || {};
  const title = data?.title || "Common Questions";
  const subtitle = data?.subtitle || "FAQ & Support";
  const image = content.image || "https://cdn.pixabay.com/photo/2019/06/02/15/45/call-centre-4246688_1280.jpg";
  const description = content.description || "Everything you need to know.";
  const items = content.items || [
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

  return (
    <section className="py-24 px-6 bg-zinc-50 dark:bg-zinc-950 relative border-t border-border overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 rounded-[100%] blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left Column: Image */}
          <div className="relative h-[500px] lg:h-[700px] w-full rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800">
            <img
              src={image}
              alt="Call Centre Support"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
              <div className="text-white">
                <p className="text-xl font-bold mb-2">{content.imageTitle || "24/7 Dedicated Support"}</p>
                <p className="text-white/80 font-medium">{content.imageDesc || "Our enterprise team is always ready to assist you."}</p>
              </div>
            </div>
          </div>

          {/* Right Column: FAQ Content */}
          <div className="flex flex-col">
            <div className="mb-10">
              {/* Tagline Box with Blinking Point */}
              <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-primary/5 border border-primary/20 text-primary font-bold text-[10px] tracking-[0.2em] uppercase mb-6 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                {subtitle}
              </div>

              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1] font-heading text-foreground mb-4">
                {title}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>

            <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl">
              <Accordion className="w-full">
                {items.map((faq: any, i: number) => (
                  <AccordionItem key={i} value={`item-${i}`} className="border-b border-border/60 py-4 last:border-0 group">
                    <AccordionTrigger className="text-left text-lg md:text-xl font-bold hover:text-primary transition-colors text-foreground [&[data-state=open]]:text-primary py-2">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed text-base md:text-lg pt-4 pb-2">
                      <div className="group-data-[state=open]:animate-in group-data-[state=open]:fade-in group-data-[state=open]:slide-in-from-top-2 duration-300">
                        {faq.answer}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
