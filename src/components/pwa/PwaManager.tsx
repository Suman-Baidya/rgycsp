"use client";

import React, { useState, useEffect } from "react";
import { Download, X, Smartphone, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PwaManagerProps {
  enablePwa: boolean;
  enableInstallPrompt: boolean;
  appName?: string;
  logoUrl?: string;
}

export function PwaManager({
  enablePwa,
  enableInstallPrompt,
  appName = "ABCD Edu Hub",
  logoUrl
}: PwaManagerProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  // 1. If PWA is disabled, aggressively clean up any lingering service workers & caches
  useEffect(() => {
    if (!enablePwa && typeof window !== "undefined") {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister();
          }
        });
      }
    }
  }, [enablePwa]);

  // 2. Listen for beforeinstallprompt if PWA and Install Prompt are enabled
  useEffect(() => {
    if (!enablePwa || !enableInstallPrompt || typeof window === "undefined") {
      return;
    }

    // Check if dismissed in last 3 days
    const dismissedUntil = localStorage.getItem("pwa_prompt_dismissed_until");
    if (dismissedUntil && Date.now() < Number(dismissedUntil)) {
      setIsDismissed(true);
    }

    // Check if already in standalone display mode (installed)
    if (window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      localStorage.removeItem("pwa_prompt_dismissed_until");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [enablePwa, enableInstallPrompt]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    // Dismiss for 3 days
    localStorage.setItem("pwa_prompt_dismissed_until", (Date.now() + 3 * 24 * 60 * 60 * 1000).toString());
  };

  // If conditions are not met, don't render anything
  if (!enablePwa || !enableInstallPrompt || !isInstallable || isDismissed || isInstalled) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur-md">
        {/* App Icon */}
        <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 overflow-hidden">
          {logoUrl ? (
            <img src={logoUrl} alt={appName} className="w-full h-full object-contain p-1" />
          ) : (
            <Smartphone className="w-5 h-5 text-primary" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5">
            <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
              Install {appName}
            </h4>
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 uppercase tracking-wider shrink-0">
              App
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
            Install on your device for fast access and offline capability.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            size="sm"
            onClick={handleInstallClick}
            className="h-8 px-3 rounded-lg text-xs font-bold gap-1.5 shadow-sm bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Install</span>
          </Button>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss install banner"
            className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
