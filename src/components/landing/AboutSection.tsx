import { AnimatedCounter } from "./AnimatedCounter";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function AboutSection({ data }: { data?: any }) {
  const content = data?.content || {};
  const title = data?.title || "Pioneering the Digital Era of Education";
  const subtitle = data?.subtitle || "About Us";
  const description = content.description || "ABCD Edu Hub was established with a singular vision: to empower educational institutions with the ultimate toolkit. From AI-driven assessment generation to a robust internal token economy, we bring Silicon Valley technology directly to your classroom.";
  const image = content.image || "https://cdn.pixabay.com/photo/2019/12/12/00/11/digitization-4689528_1280.jpg";
  const metricValue = content.metricValue || "500+";

  const defaultFeatures = [
    "Next-generation multi-tenant cloud capability.",
    "Seamless attendance and fee accounting integrations.",
    "Uncapped staff, manager, and teacher assignment depth."
  ];

  const features = content.features || defaultFeatures;

  return (
    <section id="about" className="py-24 px-6 bg-zinc-50 dark:bg-black/20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        {/* Left Side: Image with Overlay */}
        <div className="relative">
          <div className="rounded-[2.5rem] overflow-hidden border-4 border-white dark:border-zinc-800 shadow-2xl relative z-10 w-full h-[500px]">
            <img 
              src={image} 
              alt={title} 
              className="w-full h-full object-cover"
            />
          </div>
          {/* Decorative Blur Background */}
          <div className="absolute -inset-4 bg-gradient-to-r from-primary to-blue-600 opacity-20 blur-2xl z-0 rounded-full"></div>
          
          {/* Floating Metric Card */}
          <div className="absolute -bottom-8 -right-8 bg-background border border-border/40 shadow-2xl p-6 rounded-[2rem] z-20 flex items-center gap-4 hidden sm:flex">
             <div className="w-14 h-14 bg-primary text-white flex items-center justify-center rounded-2xl shadow-lg shadow-primary/30">
                <CheckCircle2 className="w-8 h-8" />
             </div>
             <div>
               <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Global Reach</p>
               <p className="text-3xl font-black text-foreground">
                  {metricValue} <span className="text-xs text-muted-foreground font-bold tracking-normal">Inst.</span>
               </p>
             </div>
          </div>
        </div>

        {/* Right Side: Content & Counters */}
        <div>
          <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-primary/5 border border-primary/20 text-primary font-bold text-[10px] tracking-[0.2em] uppercase mb-4 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            {subtitle}
          </div>
          <h2 className="text-4xl lg:text-5xl font-extrabold mt-3 tracking-tight leading-tight">
            {title}
          </h2>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            {description}
          </p>
          
          <ul className="mt-8 space-y-4">
            {features.map((feature: string, i: number) => (
              <li key={i} className="flex items-start gap-3 group">
                 <div className="mt-1 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                    <CheckCircle2 className="w-3 h-3" />
                 </div>
                 <span className="font-bold text-foreground/80 group-hover:text-foreground transition-colors">{feature}</span>
              </li>
            ))}
          </ul>

          {/* Statistical Counters */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 gap-8 pt-8 border-t border-border/40">
             {(content.stats || [
               { label: "Total Students", value: 125000, suffix: "+", color: "text-blue-600 dark:text-blue-400" },
               { label: "Institutes Active", value: 540, suffix: "", color: "text-primary" },
               { label: "Faculty & Staff", value: 4200, suffix: "+", color: "text-pink-600 dark:text-pink-400" }
             ]).map((stat: any, idx: number) => (
               <div key={idx} className="space-y-1">
                  <p className={cn("text-4xl font-black tracking-tighter", stat.color || "text-primary")}>
                    <AnimatedCounter to={Number(stat.value) || 0} duration={2.5} />
                    {stat.suffix}
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</p>
               </div>
             ))}
          </div>
        </div>
      </div>
    </section>
  );
}
