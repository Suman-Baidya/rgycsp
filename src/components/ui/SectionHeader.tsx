import React from "react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  subtitle: string;
  title: string;
  description?: string;
  alignment?: "left" | "center" | "right";
  className?: string;
  titleClassName?: string;
  highlightStyle?: "primary" | "green" | "amber" | "red" | "purple" | "slate";
}

export function SectionHeader({
  subtitle,
  title,
  description,
  alignment = "center",
  className,
  titleClassName,
  highlightStyle = "primary",
}: SectionHeaderProps) {
  const titleWords = title.split(" ");
  const lastWord = titleWords.length > 1 ? titleWords.pop() : "";
  const firstPart = titleWords.join(" ");

  const alignStyles = {
    left: "text-left",
    center: "text-center mx-auto",
    right: "text-right ml-auto",
  };

  // Define color themes dynamically or statically. 
  // We'll use Tailwind classes that should be in our safe list, or explicit classes.
  const theme = {
    primary: {
      badgeBg: "bg-primary/5",
      badgeBorder: "border-primary/20",
      badgeText: "text-primary",
      pulseColor: "bg-black dark:bg-white",
      gradient: "from-primary to-primary/60",
    },
    green: {
      badgeBg: "bg-green-500/10",
      badgeBorder: "border-green-500/20",
      badgeText: "text-green-600",
      pulseColor: "bg-green-500",
      gradient: "from-green-500 to-green-300",
    },
    amber: {
      badgeBg: "bg-amber-500/10",
      badgeBorder: "border-amber-500/20",
      badgeText: "text-amber-600",
      pulseColor: "bg-amber-500",
      gradient: "from-amber-500 to-amber-300",
    },
    red: {
      badgeBg: "bg-red-500/10",
      badgeBorder: "border-red-500/20",
      badgeText: "text-red-600",
      pulseColor: "bg-red-500",
      gradient: "from-red-500 to-red-300",
    },
    purple: {
      badgeBg: "bg-purple-500/10",
      badgeBorder: "border-purple-500/20",
      badgeText: "text-purple-600",
      pulseColor: "bg-purple-500",
      gradient: "from-purple-500 to-purple-300",
    },
    slate: {
      badgeBg: "bg-slate-500/10 dark:bg-zinc-800",
      badgeBorder: "border-slate-500/20 dark:border-zinc-700",
      badgeText: "text-slate-600 dark:text-slate-400",
      pulseColor: "bg-slate-500",
      gradient: "from-slate-700 to-slate-400 dark:from-slate-200 dark:to-slate-400",
    },
  }[highlightStyle];

  return (
    <div className={cn(alignStyles[alignment], className, "mb-16")}>
      <div
        className={cn(
          "inline-flex items-center gap-2 py-1.5 px-4 rounded-full border font-bold text-[10px] tracking-[0.2em] uppercase mb-4 shadow-sm",
          theme.badgeBg,
          theme.badgeBorder,
          theme.badgeText
        )}
      >
        <span
          className={cn("w-2 h-2 rounded-full animate-pulse", theme.pulseColor)}
        ></span>
        {subtitle}
      </div>
      <h2
        className={cn(
          "text-4xl lg:text-5xl font-extrabold mt-3 tracking-tight leading-tight mb-6",
          titleClassName
        )}
      >
        {firstPart && <>{firstPart} </>}
        <span
          className={cn(
            "text-transparent bg-clip-text bg-gradient-to-r",
            theme.gradient
          )}
        >
          {lastWord || title}
        </span>
      </h2>
      {description && (
        <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line transition-all duration-300 max-w-2xl mx-auto">
          {description}
        </p>
      )}
    </div>
  );
}
