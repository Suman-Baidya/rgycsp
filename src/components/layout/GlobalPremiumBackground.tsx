"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useState, useMemo, useRef } from "react";
import { Cpu, Network, Hexagon, Binary, Fingerprint, Activity, Database, Sparkles } from "lucide-react";

export function GlobalPremiumBackground() {
  const [mounted, setMounted] = useState(false);
  const spotlightRef = useRef<HTMLDivElement>(null);

  // 1. Ultra-high performance motion values (Zero React re-renders)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // 2. Smooth spring physics for the parallax movement
  const smoothX = useSpring(mouseX, { damping: 50, stiffness: 400 });
  const smoothY = useSpring(mouseY, { damping: 50, stiffness: 400 });

  // 3. Transform screen coordinates to subtle parallax offsets (-10px to +10px)
  const parallaxX = useTransform(smoothX, [0, typeof window !== 'undefined' ? window.innerWidth : 1000], [15, -15]);
  const parallaxY = useTransform(smoothY, [0, typeof window !== 'undefined' ? window.innerHeight : 1000], [15, -15]);

  useEffect(() => {
    setMounted(true);
    
    if (typeof window !== "undefined") {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      // Initialize center positions
      mouseX.set(centerX);
      mouseY.set(centerY);

      if (spotlightRef.current) {
        spotlightRef.current.style.setProperty("--mouse-x", `${centerX}px`);
        spotlightRef.current.style.setProperty("--mouse-y", `${centerY}px`);
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      // Update motion values directly (extremely fast, bypasses React render cycle)
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      // Direct DOM mutation for Spotlight mask
      if (spotlightRef.current) {
        spotlightRef.current.style.setProperty("--mouse-x", `${e.clientX}px`);
        spotlightRef.current.style.setProperty("--mouse-y", `${e.clientY}px`);
      }
    };

    // Use passive listener for butter-smooth performance without blocking main thread
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  // Generate random particles, AI/Tech Icons, and Code Symbols
  const elements = useMemo(() => {
    const TechIcons = [Cpu, Network, Hexagon, Binary, Fingerprint, Activity, Database, Sparkles];
    const CodeSymbols = ["</>", "{ }", "[ ]", "const", "=>", "0101"];
    
    // Reduce particle count slightly (35 instead of 45) for better mobile GPU performance
    return Array.from({ length: 35 }).map((_, i) => {
      const rand = Math.random();
      let type = "star";
      if (rand > 0.7) type = "icon";
      else if (rand > 0.4) type = "text";

      return {
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 25 + 15,
        delay: Math.random() * 10,
        type,
        IconComponent: TechIcons[Math.floor(Math.random() * TechIcons.length)],
        textSymbol: CodeSymbols[Math.floor(Math.random() * CodeSymbols.length)],
      };
    });
  }, []);

  if (!mounted) return null;

  return (
    <div 
      ref={spotlightRef}
      className="fixed inset-0 z-[-10] overflow-hidden pointer-events-none bg-slate-50 dark:bg-[#030712] transition-colors duration-700"
    >
      
      {/* 1. Deep Smoky Nebulas (The AI Brain Core) */}
      <motion.div
        style={{ x: parallaxX, y: parallaxY }}
        className="absolute inset-0"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 45, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[10%] -left-[10%] w-[60vw] h-[60vw] rounded-full bg-blue-500/20 dark:bg-blue-600/20 blur-[100px] mix-blend-multiply dark:mix-blend-screen opacity-50"
          style={{ transformOrigin: "center center" }}
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], rotate: [0, -30, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[20%] right-[5%] w-[70vw] h-[70vw] rounded-full bg-indigo-400/20 dark:bg-indigo-900/30 blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-40"
          style={{ transformOrigin: "center left" }}
        />
        <motion.div
          animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[30%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-cyan-300/20 dark:bg-cyan-500/10 blur-[100px] mix-blend-multiply dark:mix-blend-screen opacity-50"
        />
      </motion.div>

      {/* 2. Futuristic Hexagon Overlay (Base Background) */}
      <div 
        className="absolute inset-0 opacity-[0.25] dark:opacity-[0.1] mix-blend-overlay dark:mix-blend-screen"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='104' viewBox='0 0 60 104' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 17.32l-15-8.66v-17.32l15-8.66 15 8.66v17.32l-15 8.66zM0 69.28l-15-8.66v-17.32l15-8.66 15 8.66v17.32l-15 8.66z' stroke='rgba(100,180,255,0.4)' stroke-width='1.5' fill='none' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: "60px 104px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)"
        }}
      />

      {/* 3. INTERACTIVE SPOTLIGHT HOVER EFFECT */}
      {/* This grid layer is only visible right under the user's mouse cursor */}
      <div 
        className="absolute inset-0 opacity-60 dark:opacity-40 mix-blend-screen"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='104' viewBox='0 0 60 104' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 17.32l-15-8.66v-17.32l15-8.66 15 8.66v17.32l-15 8.66zM0 69.28l-15-8.66v-17.32l15-8.66 15 8.66v17.32l-15 8.66z' stroke='rgba(100,200,255,0.8)' stroke-width='2' fill='none' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: "60px 104px",
          maskImage: "radial-gradient(200px circle at var(--mouse-x) var(--mouse-y), black, transparent)",
          WebkitMaskImage: "radial-gradient(200px circle at var(--mouse-x) var(--mouse-y), black, transparent)"
        }}
      />
      {/* Soft color glow that follows the mouse */}
      <div 
        className="absolute inset-0 mix-blend-screen pointer-events-none"
        style={{
          background: "radial-gradient(250px circle at var(--mouse-x) var(--mouse-y), rgba(100, 200, 255, 0.08), transparent 80%)"
        }}
      />

      {/* 4. Large Rotating AI HUD Rings */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full border border-blue-500/10 dark:border-blue-400/5 border-dashed"
        animate={{ rotate: 360 }}
        transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[45vw] h-[45vw] max-w-[600px] max-h-[600px] rounded-full border-t border-b border-cyan-400/20 dark:border-cyan-400/10"
        animate={{ rotate: -360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      />

      {/* 5. Glowing Magical Particles, Tech Icons & Code Symbols */}
      <div className="absolute inset-0">
        {elements.map((el) => (
          <motion.div
            key={el.id}
            className="absolute flex items-center justify-center text-blue-400/70 dark:text-blue-300/60 font-mono font-bold text-xs"
            style={{
              left: `${el.x}%`,
              top: `${el.y}%`,
            }}
            animate={{
              y: [0, -100, -300],
              opacity: [0, 1, 1, 0],
              scale: el.type !== "star" ? [0.6, 1, 0.6] : [0.5, 1.5, 0.5],
              rotate: el.type === "icon" ? [0, 180, 360] : 0,
            }}
            transition={{
              duration: el.duration,
              repeat: Infinity,
              ease: "linear",
              delay: el.delay,
            }}
          >
            {el.type === "icon" ? (
              <div style={{ filter: "drop-shadow(0 0 8px rgba(100,180,255,0.6))" }}>
                <el.IconComponent className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.5} />
              </div>
            ) : el.type === "text" ? (
              <span style={{ textShadow: "0 0 10px rgba(100,180,255,0.8)" }}>
                {el.textSymbol}
              </span>
            ) : (
              <div 
                className="rounded-full bg-white dark:bg-cyan-200"
                style={{
                  width: el.size,
                  height: el.size,
                  boxShadow: `0 0 ${el.size * 5}px ${el.size * 2}px rgba(100, 200, 255, 0.8)`,
                }}
              />
            )}
          </motion.div>
        ))}
      </div>

      {/* 6. Sci-Fi Scanner Line Effect */}
      <motion.div
        className="absolute left-0 w-full h-[1px] bg-cyan-400/40 opacity-40"
        style={{ boxShadow: "0 0 30px 3px rgba(34,211,238,0.3)" }}
        animate={{ top: ["-10%", "110%"] }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      />

      {/* 7. Very subtle noise overlay for a cinematic finish */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }}
      />
    </div>
  );
}
