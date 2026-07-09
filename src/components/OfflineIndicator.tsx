"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, Wifi, RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [isReloading, setIsReloading] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    setIsOffline(!navigator.onLine);

    const handleOnline = () => {
      setIsOffline(false);
      toast.success("Connection Restored!", {
        icon: <Wifi className="w-4 h-4 text-emerald-500" />,
        description: "You are back online and synced with the server."
      });
    };
    
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!hasMounted) return null;

  const handleReload = () => {
    setIsReloading(true);
    window.location.reload();
  };

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-6 right-6 z-[9999] pointer-events-auto"
        >
          <div className="w-[calc(100vw-3rem)] sm:w-[380px] bg-white/80 dark:bg-zinc-950/80 backdrop-blur-2xl border border-red-500/20 dark:border-red-500/10 rounded-3xl shadow-[0_20px_40px_-15px_rgba(220,38,38,0.15)] overflow-hidden">
            {/* Header with gradient */}
            <div className="relative bg-gradient-to-b from-red-500/10 to-transparent p-5 flex items-center gap-4">
              <div className="relative w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 border border-red-100 dark:border-red-900/30 flex items-center justify-center shrink-0 shadow-sm">
                <WifiOff className="w-5 h-5 text-red-500 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <h3 className="font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  Connection Lost
                </h3>
                <p className="text-xs font-semibold text-red-500 dark:text-red-400 mt-0.5 uppercase tracking-wider">
                  Offline Mode Active
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="px-5 pb-5">
              <div className="flex items-start gap-3 bg-slate-50/50 dark:bg-zinc-900/50 p-3.5 rounded-2xl border border-slate-200/50 dark:border-zinc-800/50 mb-4">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Troubleshooting Steps:
                  </span>
                  <ul className="text-[11px] text-slate-500 dark:text-slate-400 list-disc list-inside space-y-1">
                    <li>Check your Wi-Fi or router connection</li>
                    <li>Ensure cellular data is turned on</li>
                    <li>Verify airplane mode is disabled</li>
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleReload}
                disabled={isReloading}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 py-3 px-4 rounded-xl font-bold text-xs transition-all shadow-md active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
              >
                <RefreshCw className={`w-4 h-4 ${isReloading ? "animate-spin" : ""}`} />
                {isReloading ? "RECONNECTING..." : "RELOAD PAGE"}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
