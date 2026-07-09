"use client";

import { useEffect, useState } from "react";

export function GlobalPremiumBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[-10] overflow-hidden pointer-events-none bg-slate-50 dark:bg-[#030712] transition-colors duration-700">
      
      {/* 1. Deep Smoky Nebulas (Static & Highly Performant) */}
      <div className="absolute inset-0">
        <div
          className="absolute -top-[10%] -left-[10%] w-[60vw] h-[60vw] rounded-full bg-blue-500/10 dark:bg-blue-600/10 blur-[100px] mix-blend-multiply dark:mix-blend-screen opacity-40"
        />
        <div
          className="absolute top-[20%] right-[5%] w-[70vw] h-[70vw] rounded-full bg-indigo-400/10 dark:bg-indigo-900/20 blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-30"
        />
        <div
          className="absolute top-[30%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-cyan-300/10 dark:bg-cyan-500/5 blur-[100px] mix-blend-multiply dark:mix-blend-screen opacity-30"
        />
      </div>

      {/* 2. Futuristic Hexagon Overlay (Base Background) */}
      <div 
        className="absolute inset-0 opacity-[0.25] dark:opacity-[0.1] mix-blend-overlay dark:mix-blend-screen"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='104' viewBox='0 0 60 104' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 17.32l-15-8.66v-17.32l15-8.66 15 8.66v17.32l-15 8.66zM0 69.28l-15-8.66v-17.32l15-8.66 15 8.66v17.32l-15 8.66z' stroke='rgba(100,180,255,0.4)' stroke-width='1.5' fill='none' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: "60px 104px",
          maskImage: "radial-gradient(ellipse at center, black 10%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 10%, transparent 80%)"
        }}
      />

      {/* 3. Very subtle noise overlay for a cinematic finish */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }}
      />
    </div>
  );
}
