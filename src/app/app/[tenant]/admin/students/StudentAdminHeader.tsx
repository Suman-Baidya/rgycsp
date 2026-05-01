"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { Users, FileText, Settings, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function StudentAdminHeader({ 
  pendingCount = 0,
  activeTab,
  onTabChange
}: { 
  pendingCount?: number;
  activeTab: string;
  onTabChange: (tab: string) => void;
}) {
  const pathname = usePathname();
  const params = useParams();
  const tenant = params.tenant as string;

  const isSubdirectoryMode = pathname.startsWith('/app/');
  const workspaceBase = isSubdirectoryMode ? `/app/${tenant}` : '';
  const adminBase = `${workspaceBase}/admin/students`;

  const navItems = [
    { label: "All Students", id: "all-students", icon: Users },
    { label: "Applications", id: "applications", icon: FileText, badge: pendingCount },
    { label: "Form Config", id: "admission-config", icon: Settings },
  ];

  return (
    <div className="space-y-6 mb-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Student Operations</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Students Hub</h1>
        </div>
        
        <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 w-full lg:w-auto overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "relative flex-1 lg:flex-none min-w-[120px] flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl text-xs font-bold transition-all duration-300 whitespace-nowrap",
                  isActive 
                    ? "bg-white dark:bg-slate-800 text-primary shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-700/50" 
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/50 dark:hover:bg-slate-800/40"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-slate-400")} />
                {item.label}
                {item.badge ? (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg border-2 border-white dark:border-slate-900 ml-1">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}



