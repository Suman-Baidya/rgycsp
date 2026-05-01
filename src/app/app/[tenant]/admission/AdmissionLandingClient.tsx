"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Search, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import AdmissionFormClient from "./AdmissionFormClient";
import { AdmissionStatusClient } from "./status/AdmissionStatusClient";
import { motion, AnimatePresence } from "framer-motion";

export default function AdmissionLandingClient({ workspaceId, workspaceName, config, courses, logoUrl }: any) {
  const [view, setView] = useState<"choice" | "form" | "status">("choice");

  if (view === "form") {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => setView("choice")} className="font-bold text-slate-500 hover:text-primary">
          ← Back to Options
        </Button>
        <AdmissionFormClient 
          workspaceId={workspaceId} 
          workspaceName={workspaceName} 
          config={config} 
          courses={courses} 
        />
      </div>
    );
  }

  if (view === "status") {
    return (
      <div className="space-y-6 flex flex-col items-center">
        <Button variant="ghost" onClick={() => setView("choice")} className="self-start font-bold text-slate-500 hover:text-primary">
          ← Back to Options
        </Button>
        <AdmissionStatusClient 
          workspaceId={workspaceId} 
          workspaceName={workspaceName} 
          logoUrl={logoUrl} 
        />
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto"
      >
        {/* NEW ADMISSION CARD */}
        <Card 
          className="group relative overflow-hidden rounded-[2.5rem] border-none shadow-2xl bg-white cursor-pointer transition-all hover:scale-[1.02] active:scale-95"
          onClick={() => setView("form")}
        >
          <div className="absolute top-0 right-0 p-8 text-primary/10 group-hover:text-primary/20 transition-colors">
            <UserPlus className="w-32 h-32 rotate-12" />
          </div>
          <CardContent className="p-10 relative z-10 space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
              <UserPlus className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tight text-slate-900">New Admission</h2>
              <p className="text-slate-500 font-medium leading-relaxed">Start your journey with us. Fill out the application form to apply for our upcoming sessions.</p>
            </div>
            <div className="flex items-center gap-4 pt-4">
              <Button className="rounded-2xl h-14 px-8 bg-slate-900 text-white font-black uppercase tracking-widest text-xs group-hover:bg-primary transition-colors">
                Apply Now <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <Sparkles className="w-3 h-3" /> Takes ~5 mins
              </div>
            </div>
          </CardContent>
          <div className="h-2 bg-primary w-0 group-hover:w-full transition-all duration-500" />
        </Card>

        {/* STATUS CHECK CARD */}
        <Card 
          className="group relative overflow-hidden rounded-[2.5rem] border-none shadow-2xl bg-white cursor-pointer transition-all hover:scale-[1.02] active:scale-95"
          onClick={() => setView("status")}
        >
          <div className="absolute top-0 right-0 p-8 text-blue-500/10 group-hover:text-blue-500/20 transition-colors">
            <Search className="w-32 h-32 -rotate-12" />
          </div>
          <CardContent className="p-10 relative z-10 space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
              <Search className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tight text-slate-900">Track Application</h2>
              <p className="text-slate-500 font-medium leading-relaxed">Already applied? Check your application status, download receipts, or complete your enrollment.</p>
            </div>
            <div className="flex items-center gap-4 pt-4">
              <Button variant="outline" className="rounded-2xl h-14 px-8 border-2 border-slate-200 text-slate-900 font-black uppercase tracking-widest text-xs hover:bg-blue-50 hover:border-blue-200 transition-colors">
                Check Status <ArrowRight className="w-4 h-4 ml-2 text-blue-500" />
              </Button>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <ShieldCheck className="w-3 h-3" /> Secure Login
              </div>
            </div>
          </CardContent>
          <div className="h-2 bg-blue-500 w-0 group-hover:w-full transition-all duration-500" />
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
