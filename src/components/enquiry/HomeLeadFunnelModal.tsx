"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { SocialMediaLeadFunnel } from "@/components/enquiry/SocialMediaLeadFunnel";
import { Sparkles } from "lucide-react";
import { type FunnelConfig } from "@/types/funnel";

interface HomeLeadFunnelModalProps {
  initialConfig?: FunnelConfig;
}

export function HomeLeadFunnelModal({ initialConfig }: HomeLeadFunnelModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Auto-open if ?lead=open or ?enquiry=lead in URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const leadParam = params.get("lead") || params.get("enquiry");
      if (leadParam === "open" || leadParam === "lead" || leadParam === "true") {
        setIsOpen(true);
      }
    }
  }, []);

  // If super admin explicitly disabled popup, we don't render floating trigger
  const isEnabled = initialConfig?.popupEnabled ?? true;

  return (
    <>
      {/* Floating Trigger Badge */}
      {isEnabled && (
        <aside aria-label="Quick Admission Check" className="fixed bottom-6 left-4 sm:left-6 z-40">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-xs shadow-2xl backdrop-blur-lg border border-white/20 dark:border-slate-800 hover:scale-105 active:scale-95 transition-all group ring-4 ring-primary/20 hover:ring-primary/35"
          >
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground group-hover:rotate-12 transition-transform shadow-xs">
              <Sparkles className="h-3 w-3" />
            </span>
            <span className="tracking-wide">Instant Eligibility Check</span>
          </button>
        </aside>
      )}

      {/* Popup Dialog with 3-Step Funnel */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent 
          className="max-w-lg w-[calc(100%-2rem)] p-0 border-none bg-transparent shadow-none outline-none focus-visible:outline-none overflow-visible z-[102]"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">Instant Eligibility & Admission Funnel</DialogTitle>
          <DialogDescription className="sr-only">
            Complete contact details and fast eligibility questions to match with the nearest study center or apply for franchise
          </DialogDescription>
          <div className="w-full">
            <SocialMediaLeadFunnel 
              isModal={true} 
              onClose={() => setIsOpen(false)} 
              config={initialConfig}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
