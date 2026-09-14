"use client";

import React from "react";
import { getAdaptiveThemeColors, isDarkThemeColor } from "@/lib/theme-utils";
import { Sparkles, CheckCircle2, Sun, Moon } from "lucide-react";

interface ThemeContrastIndicatorProps {
  primaryColor?: string | null;
  accentColor?: string | null;
}

export function ThemeContrastIndicator({
  primaryColor,
  accentColor,
}: ThemeContrastIndicatorProps) {
  const adaptive = getAdaptiveThemeColors(primaryColor, accentColor);
  const isDark = adaptive.isDarkChoice;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-3.5 space-y-3 shadow-xs">
      <div className="flex items-start gap-2.5">
        <div
          className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
            isDark
              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          }`}
        >
          {isDark ? (
            <Sparkles className="w-4 h-4" />
          ) : (
            <CheckCircle2 className="w-4 h-4" />
          )}
        </div>
        <div className="space-y-0.5 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              {isDark
                ? "Smart Dark Mode Auto-Contrast Active"
                : "Theme Contrast Verified"}
            </h4>
            <span
              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                isDark
                  ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60"
                  : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
              }`}
            >
              {isDark ? "Adaptive Fallback" : "High Contrast"}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            {isDark
              ? `You selected a deep or black brand tone (${adaptive.light.primary}). To prevent buttons and text from disappearing against dark backgrounds in Dark Mode, our engine automatically elevates interactive elements to high-contrast white/silver (${adaptive.dark.primary}) while keeping your exact tone in Light Mode.`
              : `Your chosen primary color (${adaptive.light.primary}) maintains strong visibility and contrast across both Light and Dark modes.`}
          </p>
        </div>
      </div>

      {/* Live Side-by-Side Mode Preview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
        {/* Light Mode Preview Card */}
        <div className="rounded-lg border border-slate-200 bg-white p-2.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
              <Sun className="w-3 h-3 text-amber-500" /> Light Mode
            </span>
            <span className="font-mono text-[9px] text-slate-600">
              {adaptive.light.primary}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="h-7 px-2.5 rounded-md text-[11px] font-semibold transition-all shadow-xs"
              style={{
                backgroundColor: adaptive.light.primary,
                color: adaptive.light.primaryForeground,
              }}
            >
              Primary Button
            </button>
            <div
              className="h-7 px-2 rounded-md text-[10px] font-medium flex items-center border"
              style={{
                borderColor: adaptive.light.primary,
                color: adaptive.light.primary,
              }}
            >
              Outline
            </div>
          </div>
        </div>

        {/* Dark Mode Preview Card */}
        <div className="rounded-lg border border-slate-800 bg-slate-950 p-2.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1">
              <Moon className="w-3 h-3 text-blue-400" /> Dark Mode
            </span>
            <span className="font-mono text-[9px] text-slate-400">
              {adaptive.dark.primary}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="h-7 px-2.5 rounded-md text-[11px] font-semibold transition-all shadow-xs"
              style={{
                backgroundColor: adaptive.dark.primary,
                color: adaptive.dark.primaryForeground,
              }}
            >
              Primary Button
            </button>
            <div
              className="h-7 px-2 rounded-md text-[10px] font-medium flex items-center border"
              style={{
                borderColor: adaptive.dark.primary,
                color: adaptive.dark.primary,
              }}
            >
              Outline
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
