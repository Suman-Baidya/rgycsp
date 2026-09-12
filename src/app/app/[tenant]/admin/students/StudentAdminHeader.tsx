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
    <div className="space-y-4 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Students Hub</h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Manage your learners, process new applications, and configure your admission criteria.
          </p>
        </div>
        
        <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 w-full lg:w-auto overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                suppressHydrationWarning
                className={cn(
                  "relative flex-1 lg:flex-none min-w-[110px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 whitespace-nowrap",
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



