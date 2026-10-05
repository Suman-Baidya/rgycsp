"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { BookOpen, Sparkles, Video } from "lucide-react";
import { usePathname } from "next/navigation";
import { getPublishedUserGuides } from "@/app/actions/user-guides";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

interface ContextualGuideHeaderButtonProps {
  portal: "super-admin" | "admin";
  workspaceId?: string;
  className?: string;
}

export function ContextualGuideHeaderButton({ portal, workspaceId, className }: ContextualGuideHeaderButtonProps) {
  const pathname = usePathname();
  const [guides, setGuides] = useState<any[]>([]);
  const [isEnabled, setIsEnabled] = useState(false);
  const [matchingCount, setMatchingCount] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [hasNewContextPulse, setHasNewContextPulse] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load published guides
  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const targetRole = portal === "super-admin" ? "SUPER_ADMIN" : "FRANCHISE_ADMIN";
        const res = await getPublishedUserGuides(targetRole, workspaceId);
        if (isMounted) {
          if (res.enabled && res.guides) {
            setGuides(res.guides);
            setIsEnabled(true);
          } else {
            setIsEnabled(false);
          }
        }
      } catch {
        if (isMounted) setIsEnabled(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [portal, workspaceId]);

  // Contextual matching count based on current route
  const { currentSectionName, matchingCountComputed, videoCount, guideCount } = useMemo(() => {
    if (!guides.length) {
      return { currentSectionName: "Dashboard", matchingCountComputed: 0, videoCount: 0, guideCount: 0 };
    }

    const segments = pathname.toLowerCase().split("/").filter(Boolean);
    const keywords = segments.filter(s => !["app", "super-admin", "admin"].includes(s));
    const last = keywords[keywords.length - 1] || "dashboard";

    let name = last.charAt(0).toUpperCase() + last.slice(1).replace(/-/g, " ");
    if (last === "enquiries") name = "Enquiries & Campaigns";
    if (last === "wallet") name = "Wallet Economy";
    if (last === "courses") name = "Courses & Curriculum";
    if (last === "admissions" || last === "students") name = "Students & Admissions";
    if (last === "logs") name = "System Maintenance & Logs";

    if (keywords.length === 0) {
      const vCount = guides.filter(g => g.contentType === "YOUTUBE").length;
      return { 
        currentSectionName: "Dashboard", 
        matchingCountComputed: guides.length,
        videoCount: vCount,
        guideCount: guides.length - vCount
      };
    }

    const matching = guides.filter(guide => {
      const title = (guide.title || "").toLowerCase();
      const desc = (guide.description || "").toLowerCase();
      const cat = (guide.category || "").toLowerCase();

      return keywords.some(k => 
        title.includes(k) || 
        desc.includes(k) || 
        cat.includes(k) ||
        (k === "enquiries" && (title.includes("campaign") || cat.includes("admission"))) ||
        (k === "students" && cat.includes("admission")) ||
        (k === "admissions" && cat.includes("admission")) ||
        (k === "wallet" && (title.includes("balance") || cat.includes("billing")))
      );
    });

    const vCount = matching.filter(g => g.contentType === "YOUTUBE").length;

    return { 
      currentSectionName: name, 
      matchingCountComputed: matching.length,
      videoCount: vCount,
      guideCount: matching.length - vCount
    };
  }, [pathname, guides]);

  useEffect(() => {
    setMatchingCount(matchingCountComputed);
    if (matchingCountComputed > 0) {
      setHasNewContextPulse(true);
      const timer = setTimeout(() => setHasNewContextPulse(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [matchingCountComputed, pathname]);

  // Global keyboard shortcut ('?' or 'Shift + /') to trigger the guide drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "?" && 
        !["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)
      ) {
        e.preventDefault();
        handleOpen();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!isEnabled) {
    return null;
  }

  const handleOpen = () => {
    setIsHovered(false);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-user-guide-drawer"));
    }
  };

  const handleMouseEnter = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(true);
    }, 150);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsHovered(false);
  };

  const hasRelevant = matchingCount > 0;

  return (
    <div 
      className="relative inline-flex items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        onClick={handleOpen}
        className={cn(
          "relative h-8 w-8 sm:h-9 sm:w-9 rounded-xl flex items-center justify-center transition-all cursor-pointer group focus:outline-hidden",
          hasRelevant
            ? "bg-indigo-50/90 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/70 dark:border-indigo-800/50 shadow-xs"
            : "hover:bg-slate-100 dark:hover:bg-slate-800 text-muted-foreground hover:text-foreground border border-border/50",
          hasNewContextPulse && "ring-2 ring-indigo-400/50 dark:ring-indigo-500/50 scale-105",
          className
        )}
        aria-label="Interactive Guides and Tutorials"
      >
        <BookOpen className="w-4 h-4 transition-transform group-hover:scale-110" />

        {/* Smart Contextual Pill Badge (Icon Only - Zero Text) */}
        {hasRelevant && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full text-[9px] font-black bg-indigo-600 text-white shadow-xs select-none">
            {matchingCount > 9 ? "9+" : matchingCount}
          </span>
        )}

        {/* Subtle Smart Pulse Ring */}
        {hasRelevant && hasNewContextPulse && (
          <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2 pointer-events-none">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600" />
          </span>
        )}
      </button>

      {/* Smart Contextual Floating Tooltip Card */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-full mt-2 w-64 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl z-50 pointer-events-none text-left"
          >
            <div className="flex items-start gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Smart Guide
                  </span>
                  <span className="text-[9px] font-mono text-slate-400 px-1 py-0.2 bg-slate-100 dark:bg-slate-800 rounded">
                    ?
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate mt-0.5">
                  {currentSectionName}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                  {hasRelevant 
                    ? `${matchingCount} tutorial${matchingCount > 1 ? "s" : ""} available for this page.` 
                    : "Access official video tutorials and documentation."}
                </p>
                {hasRelevant && (
                  <div className="flex items-center gap-2 mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/80 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                    {videoCount > 0 && (
                      <span className="flex items-center gap-1 text-red-500">
                        <Video className="w-3 h-3" /> {videoCount} Video{videoCount > 1 ? "s" : ""}
                      </span>
                    )}
                    {guideCount > 0 && (
                      <span className="flex items-center gap-1 text-emerald-500">
                        <BookOpen className="w-3 h-3" /> {guideCount} Guide{guideCount > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
