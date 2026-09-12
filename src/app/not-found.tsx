"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Navigation, HelpCircle } from "lucide-react";

export default function GlobalNotFound() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden font-sans">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] -translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] translate-x-1/3 pointer-events-none" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-4xl space-y-8 sm:space-y-10">
        {/* Animated 404 Display (Preserved exactly as requested) */}
        <div className="relative flex items-center justify-center">
          <div className="text-[12rem] sm:text-[14rem] md:text-[20rem] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-slate-200 to-slate-50 dark:from-zinc-800 dark:to-zinc-950 drop-shadow-2xl select-none">
            404
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xl rounded-2xl flex items-center justify-center mb-4 transform -translate-y-2 animate-bounce">
              <Navigation className="w-8 h-8 md:w-10 md:h-10 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white bg-clip-text">
              Lost in <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-600">Space?</span>
            </h1>
          </div>
        </div>

        {/* Redesigned Description */}
        <div className="max-w-sm mx-auto">
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            This page doesn't exist or has moved.<br className="hidden sm:inline" />
            Please check the link or return home.
          </p>
        </div>

        {/* Redesigned Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 pt-2">
          <Link href="/">
            <Button className="h-9 sm:h-10 px-4 sm:px-5 rounded-xl text-xs sm:text-sm font-semibold bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 transition-all flex items-center gap-2">
              <Home className="w-4 h-4" /> 
              <span>Return to Home</span>
            </Button>
          </Link>
          <Button 
            variant="outline" 
            onClick={() => window.history.back()} 
            className="h-9 sm:h-10 px-4 sm:px-5 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-xs transition-all flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> 
            <span>Go Back</span>
          </Button>
          <Link href="/support">
            <Button 
              variant="ghost" 
              className="h-9 sm:h-10 px-3.5 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all flex items-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              <span>Help Center</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
