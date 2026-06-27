"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Globe, Zap, Navigation } from "lucide-react";

export default function GlobalNotFound() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden font-sans">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] -translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] translate-x-1/3 pointer-events-none" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-4xl space-y-12">
        {/* Animated 404 Display */}
        <div className="relative flex items-center justify-center">
          <div className="text-[14rem] md:text-[20rem] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-slate-200 to-slate-50 dark:from-zinc-800 dark:to-zinc-950 drop-shadow-2xl select-none">
            404
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl rounded-[2rem] flex items-center justify-center mb-6 transform -translate-y-4 animate-bounce">
              <Navigation className="w-10 h-10 md:w-12 md:h-12 text-primary" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white bg-clip-text">
              Lost in <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-600">Space?</span>
            </h1>
          </div>
        </div>

        <div className="space-y-4 max-w-2xl mx-auto pt-4">
          <p className="text-[24px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
            The global page you're searching for seems to have vanished into the void. Let's get you back to familiar territory.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-8">
          <Link href="/" className="w-full sm:w-60 group">
            <Button className="relative w-full h-16 rounded-[2rem] font-bold bg-gradient-to-r from-primary to-primary/90 text-white text-[18px] shadow-[0_8px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-1 border border-white/20 overflow-hidden">
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Home className="w-5 h-5 mr-3 relative z-10" /> 
              <span className="relative z-10">Homepage</span>
            </Button>
          </Link>
          <Button 
            variant="outline" 
            onClick={() => window.history.back()} 
            className="w-full sm:w-60 h-16 rounded-[2rem] font-bold border-2 border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl hover:bg-slate-50 dark:hover:bg-zinc-800 text-[18px] transition-all duration-300 hover:-translate-y-1 shadow-lg shadow-black/5"
          >
             <ArrowLeft className="w-5 h-5 mr-3" /> 
             Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
