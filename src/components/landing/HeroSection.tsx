"use client"

import * as React from "react"
import Autoplay from "embla-carousel-autoplay"
import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { ArrowRight } from "lucide-react"

const HERO_SLIDES = [
  {
    src: "https://cdn.pixabay.com/photo/2022/07/21/02/53/business-idea-7335270_1280.jpg",
    title: "Innovative AI Automation",
    subtitle: "Streamline workflows, boost efficiency, reduce effort, empower intelligent decisions."
  },
  {
    src: "https://cdn.pixabay.com/photo/2018/03/10/12/00/teamwork-3213924_1280.jpg",
    title: "Empower Your Educational Team",
    subtitle: "Foster collaboration, provide tools, encourage growth, cultivate supportive culture."
  },
  {
    src: "https://cdn.pixabay.com/photo/2024/11/19/03/43/handshake-9208017_1280.jpg",
    title: "Forge Powerful Partnerships",
    subtitle: "Forge powerful partnerships by cultivating trust, aligning shared goals, and driving innovation together"
  }
];

import { motion, Variants } from "framer-motion"

// ... existing code ...
// Inside the file, we replace the imports and the carousel item content

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.3 }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 50, damping: 15 }
  }
}

export function HeroSection() {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [api, setApi] = React.useState<any>();

  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: false })
  )

  React.useEffect(() => {
    if (!api) return;

    setCurrentIndex(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrentIndex(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <section id="home" className="w-full relative bg-zinc-950">
      <Carousel
        setApi={setApi}
        plugins={[plugin.current]}
        className="w-full overflow-hidden"
        opts={{ loop: true, align: "start" }}
      >
        <CarouselContent className="-ml-0">
          {HERO_SLIDES.map((slide, index) => (
            <CarouselItem key={index} className="pl-0 overflow-hidden relative h-screen min-h-[600px] w-full basis-full">
              {/* Background Image with advanced darkening gradient overlay */}
              <motion.div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${slide.src})` }}
                initial={{ scale: 1.1 }}
                animate={{ scale: currentIndex === index ? 1 : 1.1 }}
                transition={{ duration: 6, ease: "easeOut" }}
              >
                {/* Cinematic dark overlays to ensure text pops perfectly */}
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/95 via-zinc-950/70 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/50 via-transparent to-zinc-950/30"></div>
              </motion.div>

              {/* Foreground Content */}
              <div className="absolute inset-0 flex items-center">
                <div className="max-w-7xl mx-auto px-6 w-full pb-2 pt-12 z-10">
                  {currentIndex === index && (
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="max-w-3xl"
                    >
                      <motion.div variants={itemVariants}>
                        <div className="inline-flex items-center gap-2 py-2 px-6 rounded-full bg-white/5 backdrop-blur-md border border-white/20 text-white font-bold text-xs tracking-[0.25em] uppercase mb-8 shadow-[0_0_20px_rgba(255,255,255,0.1)] relative overflow-hidden group">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
                          <span className="relative z-10 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                            Welcome to ABCD Edu Hub
                          </span>
                        </div>
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-100 to-zinc-400 tracking-tight leading-[1.05] font-heading drop-shadow-[0_0_30px_rgba(255,255,255,0.1)] text-balance">
                          {slide.title}
                        </h1>
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <p className="mt-8 text-md md:text-lg text-zinc-300 leading-relaxed font-sans max-w-2xl font-medium text-balance drop-shadow-md">
                          {slide.subtitle}
                        </p>
                      </motion.div>

                      <motion.div variants={itemVariants} className="mt-12 flex flex-col sm:flex-row gap-5 items-start">
                        <Button size="lg" className="h-14 w-full sm:w-[220px] text-lg bg-white text-zinc-950 hover:bg-zinc-200 border-none shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:-translate-y-1 transition-all duration-300 group rounded-xl font-extrabold">
                          Get Started
                        </Button>
                        <Button size="lg" variant="outline" className="h-14 w-full sm:w-[220px] text-lg bg-white/5 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 hover:border-white/40 transition-all duration-300 rounded-xl font-bold shadow-lg hover:-translate-y-1">
                          Book a Demo
                        </Button>
                      </motion.div>
                    </motion.div>
                  )}
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {/* Navigation Buttons */}
        <div className="absolute bottom-12 right-12 flex gap-2 z-10 hidden md:flex">
          <CarouselPrevious className="relative inset-0 translate-y-0 h-12 w-12 bg-background/50 backdrop-blur-md border-border/50 hover:bg-primary hover:text-white" />
          <CarouselNext className="relative inset-0 translate-y-0 h-12 w-12 bg-background/50 backdrop-blur-md border-border/50 hover:bg-primary hover:text-white" />
        </div>
      </Carousel>
    </section>
  );
}
