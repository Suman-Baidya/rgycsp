"use client";

import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Megaphone, AlertTriangle, ShieldCheck, ExternalLink, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface NoticeToastProps {
  id: string | number;
  title: string;
  message?: string;
  priority?: "NORMAL" | "HIGH" | "URGENT";
  link?: string;
  source?: string;
  durationSeconds?: number;
  onView?: () => void;
  onDismiss?: () => void;
}

export function NoticeBroadcastToastContent({
  id,
  title,
  message,
  priority = "NORMAL",
  link,
  source = "Head Office Directive",
  durationSeconds = 10,
  onView,
  onDismiss,
}: NoticeToastProps) {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPaused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          toast.dismiss(id);
          if (onDismiss) onDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [id, isPaused, onDismiss]);

  const progressPercent = Math.max(0, Math.min(100, (timeLeft / durationSeconds) * 100));

  const isUrgent = priority === "URGENT";
  const isHigh = priority === "HIGH";

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={cn(
        "relative w-full max-w-sm sm:max-w-md rounded-2xl shadow-2xl p-3.5 sm:p-4 border backdrop-blur-md overflow-hidden transition-all text-left",
        isUrgent
          ? "bg-gradient-to-br from-red-50/95 via-white to-red-50/50 dark:from-red-950/80 dark:via-slate-900 dark:to-slate-950 border-red-200 dark:border-red-900/60"
          : isHigh
          ? "bg-gradient-to-br from-amber-50/95 via-white to-amber-50/50 dark:from-amber-950/80 dark:via-slate-900 dark:to-slate-950 border-amber-200 dark:border-amber-900/60"
          : "bg-gradient-to-br from-indigo-50/95 via-white to-indigo-50/50 dark:from-indigo-950/80 dark:via-slate-900 dark:to-slate-950 border-indigo-200 dark:border-indigo-900/60"
      )}
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <div
            className={cn(
              "p-1.5 rounded-lg flex items-center justify-center shrink-0",
              isUrgent
                ? "bg-red-500/15 text-red-600 dark:text-red-400"
                : isHigh
                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                : "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400"
            )}
          >
            {isUrgent ? (
              <AlertTriangle className="h-4 w-4 animate-bounce" />
            ) : isHigh ? (
              <Megaphone className="h-4 w-4" />
            ) : (
              <ShieldCheck className="h-4 w-4" />
            )}
          </div>
          <span className="text-[11px] font-bold tracking-tight text-slate-800 dark:text-slate-200 uppercase">
            {source}
          </span>
          <Badge
            className={cn(
              "text-[9px] font-extrabold uppercase px-1.5 py-0 border-none rounded tracking-wider",
              isUrgent
                ? "bg-red-500 text-white"
                : isHigh
                ? "bg-amber-500 text-white"
                : "bg-indigo-600 text-white"
            )}
          >
            {priority}
          </Badge>
        </div>

        {/* Live Countdown Badge & Dismiss */}
        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-800/80 text-[10px] font-mono font-semibold text-slate-600 dark:text-slate-300">
            <Clock className="h-3 w-3 text-slate-400" />
            <span>{timeLeft}s</span>
          </span>
          <button
            onClick={() => {
              toast.dismiss(id);
              if (onDismiss) onDismiss();
            }}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
            title="Dismiss notice"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Main Notice Title */}
      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-1 leading-snug mb-1">
        {title}
      </h4>

      {/* Message snippet */}
      {message && (
        <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-3">
          {message}
        </p>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <span className="text-[10px] text-slate-400 font-medium italic">
          {isPaused ? "Timer paused on hover" : "Auto-dismissing"}
        </span>

        <div className="flex items-center gap-1.5">
          {link && link !== "#" ? (
            <a
              href={link}
              onClick={() => {
                toast.dismiss(id);
                if (onView) onView();
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 transition-opacity shadow-xs"
            >
              <span>View Notice</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          ) : (
            <Button
              size="sm"
              variant="default"
              onClick={() => {
                toast.dismiss(id);
                if (onView) onView();
              }}
              className="h-7 px-3 text-xs font-semibold rounded-lg shadow-xs"
            >
              View Notice
            </Button>
          )}
        </div>
      </div>

      {/* Animated Linear Progress Bar at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200/50 dark:bg-slate-800/50 overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-1000 ease-linear",
            isUrgent ? "bg-red-500" : isHigh ? "bg-amber-500" : "bg-indigo-600"
          )}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Trigger a Top-Right Corner Official Notice Toast with Live Countdown
 */
export function triggerNoticeToast(options: {
  title: string;
  message?: string;
  priority?: "NORMAL" | "HIGH" | "URGENT";
  link?: string;
  source?: string;
  durationSeconds?: number;
  onView?: () => void;
  onDismiss?: () => void;
}) {
  const duration = options.durationSeconds || 10;
  return toast.custom(
    (toastId) => (
      <NoticeBroadcastToastContent
        id={toastId}
        title={options.title}
        message={options.message}
        priority={options.priority}
        link={options.link}
        source={options.source}
        durationSeconds={duration}
        onView={options.onView}
        onDismiss={options.onDismiss}
      />
    ),
    {
      duration: duration * 1000 + 500,
      position: "top-right",
    }
  );
}
