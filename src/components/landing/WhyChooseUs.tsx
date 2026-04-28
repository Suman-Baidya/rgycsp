import { Zap, ShieldCheck, Cpu, Globe, Rocket, Brain, GraduationCap, Users, Layout } from "lucide-react";
import Image from "next/image";

const FEATURES = [
  {
    icon: <Cpu className="w-6 h-6" />,
    title: "AI Ecosystem",
    description: "Generate certificates, schedules, and custom examinations dynamically using our powerful AI credits."
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: "Dedicated Franchise Domains",
    description: "Your institute receives an entirely independent subdomain ensuring premium branding to your students."
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: "Enterprise Grade Security",
    description: "PostgreSQL databases deployed via Neon serverless architecture isolating data comprehensively."
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Blazing Fast Edge Tech",
    description: "Built on Next.js 15, ensuring immediate load times globally on any mobile device or tablet."
  }
];

export function WhyChooseUs({ data }: { data?: any }) {
  const content = data?.content || {};
  const title = data?.title || "The Key to Unlocking Your Institute's Potential";
  const subtitle = data?.subtitle || "Why Choose ABCD";
  const description = content.description || "We bypass archaic software configurations. We offer you an exclusive Token Economy system directly cutting transaction fees while automating the heavy lifting of institute administration.";

  const features = content.features || [
    { icon: "Cpu", title: "AI Ecosystem", description: "Generate certificates, schedules, and custom examinations dynamically using our powerful AI credits." },
    { icon: "Globe", title: "Dedicated Franchise Domains", description: "Your institute receives an entirely independent subdomain ensuring premium branding to your students." },
    { icon: "ShieldCheck", title: "Enterprise Grade Security", description: "PostgreSQL databases deployed via Neon serverless architecture isolating data comprehensively." },
    { icon: "Zap", title: "Blazing Fast Edge Tech", description: "Built on Next.js 15, ensuring immediate load times globally on any mobile device or tablet." }
  ];

  const image = content.image || "https://cdn.pixabay.com/photo/2015/09/22/14/37/key-951783_1280.jpg";

  const iconMap: any = { Zap, ShieldCheck, Cpu, Globe, Rocket, Brain, GraduationCap, Users, Layout };

  return (
    <section id="services" className="py-24 px-6 bg-background">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
        {/* Features Grid */}
        <div className="flex-1 order-2 lg:order-1">
          <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-primary/5 border border-primary/20 text-primary font-bold text-[10px] tracking-[0.2em] mb-4 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-black dark:bg-white animate-pulse"></span>
            {subtitle}
          </div>
          <h2 className="text-4xl lg:text-5xl font-extrabold mt-3 tracking-tight leading-tight">
            {title}
          </h2>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed mb-10">
            {description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((feat: any, i: number) => {
              const Icon = iconMap[feat.icon] || Cpu;
              return (
                <div key={i} className="p-6 border rounded-2xl bg-zinc-50 dark:bg-zinc-900 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{feat.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feat.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feature Image */}
        <div className="flex-1 order-1 lg:order-2 w-full">
          <div className="relative rounded-2xl overflow-hidden aspect-[4/5] shadow-2xl">
            <Image
              src={image || ""}
              alt={title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
