"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  badge?: string;
}

export function AdminPageHeader({
  title,
  description,
  children,
  className,
  badge
}: AdminPageHeaderProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 mb-3 sm:mb-4", className)}>
      <div className="space-y-0.5 min-w-0">
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white truncate">
            {title}
          </h1>
          {badge && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase tracking-wider shrink-0">
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 truncate max-w-xl">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-2 shrink-0">
          {children}
        </div>
      )}
    </div>
  );
}
