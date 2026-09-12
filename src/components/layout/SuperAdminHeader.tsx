"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationBell } from "./NotificationBell";
import { CommandPalette, CommandSearchButton } from "./CommandPalette";
import { ShieldCheck, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SuperAdminHeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  role?: string;
}

export function SuperAdminHeader({ user, role = "SUPER_ADMIN" }: SuperAdminHeaderProps) {
  const pathname = usePathname();
  
  // Format Breadcrumbs:
  const segments = pathname.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  
  let currentPage = "Dashboard";
  if (lastSegment && lastSegment !== "super-admin") {
    currentPage = lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, " ");
  }

  const isManager = role === "SUPER_ADMIN_MANAGER";
  const portalLabel = isManager ? "Manager Portal" : "Super Admin";
  const roleLabel = isManager ? "MANAGER" : "SUPER ADMIN";

  const userName = user?.name || (isManager ? "Manager" : "Super Admin");
  const userImage = user?.image;

  return (
    <header className="h-16 shrink-0 border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-40 transition-all duration-300 px-4 sm:px-6 lg:px-6">
      <div className="max-w-[1600px] mx-auto w-full h-full flex items-center justify-between gap-4">
        {/* Left side: Breadcrumbs */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex sm:hidden w-7 h-7 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 items-center justify-center shrink-0">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center text-xs sm:text-sm font-medium truncate">
            <div className="hidden sm:flex items-center gap-1.5 text-muted-foreground">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span className="font-semibold tracking-tight">{portalLabel}</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60 mx-1.5 hidden sm:inline-block shrink-0" />
            <span className="text-foreground tracking-tight font-semibold truncate">
              {currentPage}
            </span>
          </div>
        </div>

        {/* Center: Command Palette Trigger */}
        <div className="flex items-center mx-2">
          <CommandSearchButton />
        </div>

        {/* Right side: Profile & Theme */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {/* Profile Section */}
          <Link 
            href="/super-admin/profile" 
            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors group cursor-pointer"
            title="Admin Profile"
          >
            <div className="hidden md:flex flex-col items-end text-right">
              <span className="text-xs font-bold text-foreground leading-none mb-1 uppercase tracking-tight">
                {userName}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 dark:bg-indigo-500/20 px-1.5 py-0.5 rounded leading-tight">
                {roleLabel}
              </span>
            </div>
            
            <Avatar className="h-8 w-8 sm:h-9 sm:w-9 border border-border shadow-xs group-hover:ring-2 group-hover:ring-indigo-500/30 transition-all">
              <AvatarImage src={userImage || undefined} alt={userName} />
              <AvatarFallback className="bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                {userName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>

          {/* Notification Center & Theme Toggle */}
          <div className="flex items-center gap-1 sm:gap-2 border-l border-border/50 pl-2.5 sm:pl-3">
            <NotificationBell portal="super-admin" />
            <ThemeToggle />
          </div>
        </div>
      </div>
      <CommandPalette portal="super-admin" />
    </header>
  );
}
