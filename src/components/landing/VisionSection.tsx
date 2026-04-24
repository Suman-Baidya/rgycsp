import { Eye, Rocket, Sparkles, Globe, Target, Zap } from "lucide-react";

const ICON_MAP: any = {
  rocket: Rocket,
  sparkles: Sparkles,
  globe: Globe,
  eye: Eye,
  target: Target,
  zap: Zap
};

export function VisionSection({ data }: { data?: any }) {
  const content = data?.content || {};

  const defaults = {
    title: "Redefining the Future of Global Education",
    subtitle: "Our Vision",
    image: "https://cdn.pixabay.com/photo/2016/04/20/08/21/entrepreneur-1340649_1280.jpg",
    description: "We envision a world where technology and education blend seamlessly to unlock human potential. Our goal is to set the gold standard for multi-tenant educational platforms, bridging the gap between traditional teaching and the future of digitalized learning.",
    items: [
      { icon: "rocket", title: "Global Scale", text: "Reaching millions of students across continents with localized solutions." },
      { icon: "sparkles", title: "AI First", text: "Pioneering AI as a core partner in the teaching and assessment journey." }
    ]
  };

  const final = { ...defaults, ...content };
  const title = final.title;
  const subtitle = final.subtitle;
  const image = final.image;
  const description = final.description;
  const items = final.items;

  return (
    <section className="py-24 px-6 bg-white dark:bg-zinc-950 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        
        {/* Content Side */}
        <div className="flex-1 order-2 lg:order-1">
          <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-primary/5 border border-primary/20 text-primary font-bold text-[10px] tracking-[0.2em] uppercase mb-6">
            <Eye className="w-4 h-4" />
            {subtitle}
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-8">
            {title}
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-10">
            {description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {items.map((item: any, i: number) => {
              const Icon = ICON_MAP[item.icon] || Sparkles;
              return (
                <div key={i} className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-border group hover:border-primary/30 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-lg mb-2">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Image Side */}
        <div className="flex-1 order-1 lg:order-2 relative group">
          <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl z-10 border-4 border-white dark:border-zinc-800">
            <img 
              src={image} 
              alt={title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-bl from-primary/30 to-transparent mix-blend-overlay"></div>
          </div>
          {/* Decorative Elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 rounded-full blur-[120px] -z-10"></div>
        </div>
      </div>
    </section>
  );
}
