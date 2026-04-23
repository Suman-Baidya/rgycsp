import { AnimatedCounter } from "./AnimatedCounter";
import { CheckCircle2 } from "lucide-react";

export function AboutSection() {
  return (
    <section id="about" className="py-24 px-6 bg-zinc-50 dark:bg-black/20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        {/* Left Side: Image with Overlay */}
        <div className="relative">
          <div className="rounded-2xl overflow-hidden border-4 border-white dark:border-zinc-800 shadow-2xl relative z-10 w-full h-[500px]">
            <img 
              src="https://cdn.pixabay.com/photo/2019/12/12/00/11/digitization-4689528_1280.jpg" 
              alt="Digital Education and Technology" 
              className="w-full h-full object-cover"
            />
          </div>
          {/* Decorative Blur Background */}
          <div className="absolute -inset-4 bg-gradient-to-r from-primary to-blue-600 opacity-20 blur-2xl z-0 rounded-full"></div>
          
          {/* Floating Metric Card */}
          <div className="absolute -bottom-8 -right-8 bg-background border  shadow-xl p-6 rounded-xl z-20 flex items-center gap-4 hidden sm:flex">
             <div className="w-12 h-12 bg-primary/10 flex items-center justify-center rounded-full text-primary">
                🏆
             </div>
             <div>
               <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wider">Trusted by</p>
               <p className="text-2xl font-bold text-foreground">
                  <AnimatedCounter from={0} to={500} duration={3} /> Inst.
               </p>
             </div>
          </div>
        </div>

        {/* Right Side: Content & Counters */}
        <div>
          <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-primary/5 border border-primary/20 text-primary font-bold text-[10px] tracking-[0.2em] uppercase mb-4 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            About Us
          </div>
          <h2 className="text-4xl lg:text-5xl font-extrabold mt-3 tracking-tight leading-tight">
            Pioneering the Digital Era of Education
          </h2>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            ABCD Edu Hub was established with a singular vision: to empower educational institutions with the ultimate toolkit. 
            From AI-driven assessment generation to a robust internal token economy, we bring Silicon Valley technology directly to your classroom.
          </p>
          
          <ul className="mt-8 space-y-4">
            {["Next-generation multi-tenant cloud capability.", "Seamless attendance and fee accounting integrations.", "Uncapped staff, manager, and teacher assignment depth."].map((feature, i) => (
              <li key={i} className="flex items-start gap-3">
                 <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                 <span className="font-medium text-foreground">{feature}</span>
              </li>
            ))}
          </ul>

          {/* Statistical Counters */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 gap-6 pt-8 border-t border-border">
             <div>
                <p className="text-4xl font-extrabold text-foreground tracking-tighter text-blue-600 dark:text-blue-400">
                  <AnimatedCounter to={125000} duration={2.5} />
                </p>
                <p className="text-sm text-muted-foreground font-medium mt-1">Total Students</p>
             </div>
             <div>
                <p className="text-4xl font-extrabold text-foreground tracking-tighter text-primary">
                  <AnimatedCounter to={540} duration={3.2} />
                </p>
                <p className="text-sm text-muted-foreground font-medium mt-1">Institutes Active</p>
             </div>
             <div>
                <p className="text-4xl font-extrabold text-foreground tracking-tighter text-pink-600 dark:text-pink-400">
                  <AnimatedCounter to={4200} duration={2.8} />
                </p>
                <p className="text-sm text-muted-foreground font-medium mt-1">Faculty & Staff</p>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
