"use client";

import { motion } from "framer-motion";

export default function GlobalLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full p-8 font-sans">
      <div className="relative flex items-center justify-center w-24 h-24">
        {/* Outer Background Track */}
        <div className="absolute inset-0 rounded-full border-4 border-slate-100 dark:border-zinc-800/50" />
        {/* Outer Rotating Gradient Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-primary/30"
        />
        
        {/* Inner Background Track */}
        <div className="absolute inset-3 rounded-full border-4 border-slate-100 dark:border-zinc-800/50" />
        {/* Inner Reverse Rotating Ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="absolute inset-3 rounded-full border-4 border-transparent border-b-emerald-500 border-l-emerald-500/30"
        />

        {/* Center Pulsing Core */}
        <motion.div
          animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-4 h-4 rounded-full bg-primary shadow-lg shadow-primary/50"
        />
      </div>

      {/* Text and Dots Container */}
      <motion.div 
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 flex flex-col items-center gap-3"
      >
        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          Loading
        </p>
        <div className="flex items-center gap-1.5">
          <motion.div 
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }} 
            transition={{ duration: 1.4, repeat: Infinity, delay: 0 }} 
            className="w-1.5 h-1.5 rounded-full bg-primary/80" 
          />
          <motion.div 
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }} 
            transition={{ duration: 1.4, repeat: Infinity, delay: 0.2 }} 
            className="w-1.5 h-1.5 rounded-full bg-primary/80" 
          />
          <motion.div 
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }} 
            transition={{ duration: 1.4, repeat: Infinity, delay: 0.4 }} 
            className="w-1.5 h-1.5 rounded-full bg-primary/80" 
          />
        </div>
      </motion.div>
    </div>
  );
}
