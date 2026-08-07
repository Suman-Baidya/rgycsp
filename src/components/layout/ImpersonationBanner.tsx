"use client";

import React from "react";
import { LogOut, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clearImpersonation } from "@/app/actions/impersonate";

export function ImpersonationBanner({ impersonatedName }: { impersonatedName?: string }) {
  if (!impersonatedName) {
    return null;
  }

  const handleStopImpersonating = async () => {
    await clearImpersonation();
    window.location.href = "/";
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-500">
      <div className="bg-slate-900/90 backdrop-blur-md border border-white/10 p-2 pr-2.5 rounded-full shadow-2xl flex items-center gap-3">
        <div className="bg-amber-500/20 text-amber-500 rounded-full p-2">
          <Eye className="w-4 h-4 animate-pulse" />
        </div>
        <div className="flex flex-col pr-2">
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest leading-tight">
            Impersonating
          </span>
          <span className="text-sm font-semibold text-white leading-tight">
            {impersonatedName}
          </span>
        </div>
        <div className="w-px h-8 bg-white/10 mx-1" />
        <Button 
          onClick={handleStopImpersonating} 
          variant="ghost" 
          size="sm" 
          className="text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-full h-9 px-4 text-xs font-bold transition-all gap-2"
        >
          <LogOut className="w-3.5 h-3.5" />
          Stop
        </Button>
      </div>
    </div>
  );
}
