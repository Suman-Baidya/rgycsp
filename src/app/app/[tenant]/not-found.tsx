"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search, ShieldAlert } from "lucide-react";

export default function WorkspaceNotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="relative z-10 max-w-2xl space-y-10">
        {/* Animated Icon */}
        <div className="relative w-40 h-40 mx-auto">
           <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping opacity-20" />
           <div className="relative bg-white dark:bg-zinc-900 w-full h-full rounded-full border border-border shadow-2xl flex items-center justify-center">
              <span className="text-7xl font-black text-primary tracking-tighter">404</span>
           </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            Lost in the <span className="text-primary">Ecosystem?</span>
          </h1>
          <p className="text-xl text-zinc-500 dark:text-zinc-400 font-medium">
            The page you're looking for has moved to another orbit or doesn't exist anymore. Let's get you back on track.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Link href="./">
            <Button className="h-16 px-10 rounded-2xl font-black bg-primary text-white text-lg shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
               <Home className="w-5 h-5 mr-2" /> Back to Home
            </Button>
          </Link>
          <Button variant="outline" onClick={() => window.history.back()} className="h-16 px-10 rounded-2xl font-black border-border hover:bg-zinc-100 dark:hover:bg-zinc-900 text-lg">
             <ArrowLeft className="w-5 h-5 mr-2" /> Go Back
          </Button>
        </div>

        <div className="pt-16 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
           <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 border border-border rounded-3xl group hover:border-primary/30 transition-colors">
              <Search className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-bold text-lg mb-1">Search Our Catalog</h3>
              <p className="text-sm text-zinc-500">Explore all available courses and programs.</p>
           </div>
           <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 border border-border rounded-3xl group hover:border-primary/30 transition-colors">
              <ShieldAlert className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-bold text-lg mb-1">Need Support?</h3>
              <p className="text-sm text-zinc-500">Contact our team if you think this is an error.</p>
           </div>
        </div>
      </div>

      {/* Watermark */}
      <div className="absolute bottom-10 opacity-[0.05] text-[10vw] font-black pointer-events-none select-none tracking-tighter">
        NOT FOUND
      </div>
    </div>
  );
}
