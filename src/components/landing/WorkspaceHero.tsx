"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function WorkspaceHero({ data }: { data: any }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = (data?.content?.slides && data.content.slides.length > 0) ? data.content.slides : [
    {
      banner: "https://cdn.pixabay.com/photo/2018/05/06/10/16/update-3378261_1280.jpg",
      tagline: "Empowering Future Innovators",
      title: "Empowering Smart Learning with Tech",
      description: "Experience a next-generation learning environment equipped with state-of-the-art facilities and expert-led mentorship.",
      offerImage: "https://cdn.pixabay.com/photo/2016/06/06/06/14/limited-time-offer-1438906_1280.png",
      btn1Text: "Admission",
      btn1Link: "/admission",
      btn2Text: "Learn More",
      btn2Link: "/about"
    },
    {
      banner: "https://cdn.pixabay.com/photo/2016/05/05/11/22/computer-1373684_1280.jpg",
      tagline: "World-Class Curriculum",
      title: "Master the Skills of Tomorrow, Today",
      description: "Our comprehensive programs are designed to bridge the gap between academia and industry requirements.",
      offerImage: "https://cdn.pixabay.com/photo/2016/06/06/06/14/limited-time-offer-1438906_1280.png",
      btn1Text: "Enroll Now",
      btn1Link: "/courses",
      btn2Text: "Our Story",
      btn2Link: "/about"
    }
  ];

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const slide = slides[currentSlide];

  return (
    <section className="relative w-full h-screen min-h-[700px] overflow-hidden bg-zinc-950 flex items-center">
      {/* Background Slider */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0"
          >
            <div
              className="absolute inset-0 bg-cover bg-center animate-slow-zoom brightness-50"
              style={{ backgroundImage: `url(${slide.banner || slide.src})` }}
            />
            {/* Professional Gradients */}
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/40 to-transparent" />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-8 grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] items-center gap-12">
        {/* Left Content */}
        <motion.div
          key={`content-${currentSlide}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20 backdrop-blur-xl">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[11px] font-bold text-primary tracking-[0.2em] uppercase">{slide.tagline || slide.subtitle}</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-[76px] font-black text-white leading-[0.9] tracking-tight max-w-[15ch]">
            {slide.title.split(' ').map((word: string, i: number) => (
              <span key={i} className={cn(i % 2 === 1 ? "text-primary" : "")}>
                {word}{" "}
              </span>
            ))}
          </h1>

          <p className="text-zinc-400 text-lg md:text-xl max-w-lg leading-relaxed font-medium">
            {slide.description}
          </p>

          <div className="flex flex-wrap items-center gap-6 pt-4">
            {slide.btn1Text && (
               <Link href={slide.btn1Link || "/login"}>
                <Button size="lg" className="w-full sm:w-[220px] bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-16 text-lg font-bold shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 group">
                  {slide.btn1Text}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            )}
            {slide.btn2Text && (
              <Link href={slide.btn2Link || "/about"}>
                <Button size="lg" variant="outline" className="w-full sm:w-[220px] border-white/10 text-primary hover:text-primary hover:bg-primary/5 rounded-xl h-16 text-lg font-bold backdrop-blur-xl transition-all hover:scale-[1.02] active:scale-95">
                  {slide.btn2Text}
                </Button>
              </Link>
            )}
          </div>
        </motion.div>

        {/* Right Floating Content */}
        {slide.offerImage && (
          <motion.div
            key={`image-${currentSlide}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4, type: "spring" }}
            className="hidden lg:flex justify-center relative"
          >
            <div className="absolute inset-0 bg-primary/20 blur-[150px] rounded-full animate-pulse" />
            <img
              src={slide.offerImage}
              alt="Promotion"
              className="relative z-10 h-[450px] w-auto object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.6)] animate-float"
            />
          </motion.div>
        )}
      </div>

      {/* Modern Minimal Controls */}
      {slides.length > 1 && (
        <div className="absolute bottom-12 right-12 z-20 flex items-center gap-10">
          <div className="flex gap-3">
            {slides.map((_: any, i: number) => (
              <button
                key={i}
                suppressHydrationWarning
                onClick={() => setCurrentSlide(i)}
                className={cn(
                  "h-1 rounded-full transition-all duration-1000",
                  currentSlide === i ? "w-12 bg-primary" : "w-4 bg-white/10"
                )}
              />
            ))}
          </div>
          <div className="flex gap-4">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-white/10 bg-white/5 text-white hover:bg-primary hover:border-primary h-14 w-14"
              onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-white/10 bg-white/5 text-white hover:bg-primary hover:border-primary h-14 w-14"
              onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
