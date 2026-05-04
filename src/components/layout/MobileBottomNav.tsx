"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  BookOpen, 
  Calendar, 
  Bell, 
  User,
  Wallet,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { getTenantLink, WORKSPACE_ROUTES } from "@/lib/routing";

export function MobileBottomNav({ tenant }: { tenant: string }) {
  const pathname = usePathname();
  
  const navItems = [
    { name: "Home", href: getTenantLink(WORKSPACE_ROUTES.STUDENT_DASHBOARD, tenant, pathname), icon: LayoutDashboard },
    { name: "Exams", href: getTenantLink(WORKSPACE_ROUTES.STUDENT_EXAMS, tenant, pathname), icon: FileText },
    { name: "Fees", href: getTenantLink(WORKSPACE_ROUTES.STUDENT_FEES, tenant, pathname), icon: Wallet },
    { name: "Notices", href: getTenantLink(WORKSPACE_ROUTES.STUDENT_NOTICES, tenant, pathname), icon: Bell },
    { name: "Profile", href: getTenantLink(WORKSPACE_ROUTES.STUDENT_PROFILE, tenant, pathname), icon: User },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-2xl border-t border-slate-200 dark:border-white/5 px-6 pb-8 pt-3 flex items-center justify-between shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)]">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.name !== "Home" && pathname.startsWith(item.href));
        return (
          <Link key={item.name} href={item.href} className="flex flex-col items-center gap-1.5 group">
            <div className={cn(
              "w-14 h-9 rounded-2xl flex items-center justify-center transition-all duration-300 relative overflow-hidden",
              isActive 
                ? "bg-primary/10 text-primary" 
                : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
            )}>
              <item.icon className={cn("w-5 h-5 transition-transform duration-300", isActive && "scale-110")} />
              {isActive && (
                <motion.div 
                  layoutId="active-indicator"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                />
              )}
            </div>
            <span className={cn(
              "text-[10px] font-bold tracking-tight transition-colors",
              isActive ? "text-primary" : "text-slate-500"
            )}>
              {item.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
