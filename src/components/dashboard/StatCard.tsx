import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, ArrowDownRight } from "lucide-react";

export interface StatCardProps {
  title?: string;
  label?: string;
  value: string | number;
  subtext?: string;
  description?: string;
  change?: string;
  trend?: "up" | "down";
  icon?: React.ReactNode | LucideIcon;
  color?: string;
  className?: string;
  onClick?: () => void;
  isActive?: boolean;
}

export function StatCard({
  title,
  label,
  value,
  subtext,
  description,
  change,
  trend,
  icon,
  color,
  className,
  onClick,
  isActive
}: StatCardProps) {
  const displayTitle = title || label;
  const displaySubtext = subtext || description;
  const isClickable = !!onClick;

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return icon;
    }
    const IconComp = icon as LucideIcon;
    return <IconComp className="h-5 w-5" />;
  };

  const CardWrapper = isClickable ? "button" : "div";

  return (
    <CardWrapper
      type={isClickable ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "relative overflow-hidden border rounded-xl transition-all group p-3.5 flex flex-col justify-between h-full text-left",
        isActive
          ? "border-primary ring-1 ring-primary/20 bg-white dark:bg-slate-900 shadow-sm"
          : "border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm hover:shadow-md",
        isClickable && "cursor-pointer active:scale-[0.99]",
        className
      )}
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          {displayTitle && (
            <p className="text-[10px] uppercase tracking-[0.12em] font-bold text-slate-400 mb-0.5">
              {displayTitle}
            </p>
          )}
          {icon && (
            <div
              className="p-1 rounded-lg text-slate-400 group-hover:text-primary transition-colors shrink-0"
              style={color ? { color } : undefined}
            >
              {renderIcon()}
            </div>
          )}
        </div>
        <div
          className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-1 mb-1 leading-none"
          style={color ? { color } : undefined}
        >
          {value}
        </div>
      </div>

      {(change || displaySubtext) && (
        <div className="flex items-center gap-1.5 pt-0.5 mt-auto">
          {change && (
            <span
              className={cn(
                "text-xs font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 shrink-0",
                trend === "up"
                  ? "bg-green-500/10 text-green-600 dark:text-green-400"
                  : trend === "down"
                  ? "bg-red-500/10 text-red-600 dark:text-red-400"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              )}
            >
              {trend === "up" && <TrendingUp className="h-3 w-3" />}
              {trend === "down" && <ArrowDownRight className="h-3 w-3" />}
              {change}
            </span>
          )}
          {displaySubtext && (
            <span className="text-[10px] sm:text-[11px] font-medium text-slate-400 truncate">
              {displaySubtext}
            </span>
          )}
        </div>
      )}
    </CardWrapper>
  );
}
