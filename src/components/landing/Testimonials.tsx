import { Star, Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Dr. Arvind Sharma",
    role: "Director, Apex Academy",
    quote: "Integrating ABCD Edu Hub totally transformed our attendance tracking and exam scheduling. The customized subdomain gave our students an incredibly professional hub they trust."
  },
  {
    name: "Meera Iyer",
    role: "Founder, Insight Coaching",
    quote: "The internal Token Economy allowed us to manage AI usage effectively. Generating dynamic marksheets natively without paying ridiculous SAAS fees elsewhere changed our budget entirely."
  },
  {
    name: "James Anderson",
    role: "Operations Manager",
    quote: "The onboarding was effortless. Moving 500+ records and setting up staff privileges took under an hour. The UX is undoubtedly the most breathtaking aspect of ABCD Edu Hub."
  }
];

export function Testimonials({ data }: { data?: any }) {
  const title = data?.title || "Hear from our Visionaries";
  const subtitle = data?.subtitle || "Testimonials";

  return (
    <section id="pricing" className="py-24 px-6 bg-zinc-50 dark:bg-zinc-950 relative overflow-hidden">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto w-full relative z-10">
         <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-primary/5 border border-primary/20 text-primary font-bold text-[10px] tracking-[0.2em] uppercase mb-4 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              {subtitle}
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold mt-3 tracking-tight leading-tight font-heading">
              {title}
            </h2>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
               <div key={i} className="p-10 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl relative group hover:-translate-y-2 transition-all duration-300 hover:shadow-primary/20 hover:border-primary/30">
                  <Quote className="absolute top-8 right-8 w-12 h-12 text-zinc-100 dark:text-zinc-800 -z-10 group-hover:text-primary/10 transition-colors duration-300" />
                  
                  <div className="flex gap-1 mb-8 text-yellow-400">
                     {[...Array(5)].map((_, idx) => <Star key={idx} className="w-5 h-5 fill-current drop-shadow-sm" />)}
                  </div>
                  
                  <p className="text-lg text-foreground/80 font-medium leading-relaxed mb-10 italic">
                     "{t.quote}"
                  </p>
                  
                  <div className="flex items-center gap-4 mt-auto border-t border-zinc-100 dark:border-zinc-800 pt-6">
                     <div className="w-14 h-14 rounded-full overflow-hidden bg-primary text-primary-foreground flex items-center justify-center font-bold text-2xl shrink-0 shadow-md">
                        {t.name.charAt(0)}
                     </div>
                     <div>
                        <h4 className="font-bold text-foreground text-lg">{t.name}</h4>
                        <p className="text-sm text-primary font-semibold">{t.role}</p>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </div>
    </section>
  );
}
