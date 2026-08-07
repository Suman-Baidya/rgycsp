"use client";

import { motion } from "framer-motion";

export default function DashboardLoading() {
  return (
    <div className="flex-1 h-full min-h-[70vh] flex flex-col items-center justify-center p-8">
      <div className="relative flex items-center justify-center w-20 h-20">
        {/* Outer Background Track */}
        <div className="absolute inset-0 rounded-full border-4 border-slate-100 dark:border-slate-800" />
        {/* Outer Rotating Gradient Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-primary/50"
        />
        
        {/* Center Pulsing Core */}
        <motion.div
          animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-4 h-4 rounded-full bg-primary shadow-lg shadow-primary/50"
        />
      </div>

      {/* Text Container */}
      <motion.div 
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 flex flex-col items-center gap-2"
      >
        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
          Loading Data...
        </p>
      </motion.div>
    </div>
  );
}
