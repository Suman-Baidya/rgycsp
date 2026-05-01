"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { 
  LayoutDashboard, 
  BookOpen, 
  Calendar, 
  Bell, 
  User,
  Wallet
} from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileBottomNav({ tenant }: { tenant: string }) {
  const pathname = usePathname();
  const isSubdirectoryMode = pathname.startsWith('/app/');
  const studentBase = (isSubdirectoryMode && tenant) ? `/app/${tenant}/student` : `/student`;

  const navItems = [
    { name: "Home", href: `${studentBase}/dashboard`, icon: LayoutDashboard },
    { name: "Courses", href: `${studentBase}/courses`, icon: BookOpen },
    { name: "Fees", href: `${studentBase}/fees`, icon: Wallet },
    { name: "Notices", href: `${studentBase}/notices`, icon: Bell },
    { name: "Profile", href: `${studentBase}/profile`, icon: User },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-white/5 px-6 pb-6 pt-3 flex items-center justify-between">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.name !== "Home" && pathname.startsWith(item.href));
        return (
          <Link key={item.name} href={item.href} className="flex flex-col items-center gap-1 group">
            <div className={cn(
              "w-12 h-8 rounded-full flex items-center justify-center transition-all duration-300",
              isActive ? "bg-primary text-primary-foreground" : "text-slate-400 group-hover:text-slate-600"
            )}>
              <item.icon className="w-5 h-5" />
            </div>
            <span className={cn(
              "text-[9px] font-black uppercase tracking-widest",
              isActive ? "text-primary" : "text-slate-400"
            )}>
              {item.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
