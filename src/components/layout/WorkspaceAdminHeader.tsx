"use client";

import { usePathname, useParams } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationBell } from "./NotificationBell";
import { CommandPalette, CommandSearchButton } from "./CommandPalette";
import { Wallet, ChevronRight, ShieldCheck, UserCheck, MapPinned, Building2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { detectTenant } from "@/lib/routing";

interface WorkspaceAdminHeaderProps {
  tenantName: string;
  tenant?: string;
  workspaceBase: string;
  walletBalance: number;
  userName: string;
  userImage?: string | null;
  centerCode?: string | null;
  userRole?: string;
  isStateManager?: boolean;
  workspaceId?: string;
}

export function WorkspaceAdminHeader({
  tenantName,
  tenant: propTenant,
  workspaceBase,
  walletBalance,
  userName,
  userImage,
  centerCode,
  userRole = "ADMIN",
  isStateManager = false,
  workspaceId,
}: WorkspaceAdminHeaderProps) {
  const pathname = usePathname();
  const params = useParams();
  const tenant = detectTenant(pathname, (params?.tenant as string) || propTenant);
  
  // Format Breadcrumbs:
  const segments = pathname.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  
  let currentPage = "Dashboard";
  if (lastSegment && lastSegment !== "admin") {
    currentPage = lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, " ");
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const roleLabel = isStateManager 
    ? "State Manager" 
    : userRole === "STAFF" 
    ? "Staff" 
    : "Admin";

  return (
    <header className="h-16 shrink-0 border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-40 transition-all duration-300 px-4 sm:px-6 lg:px-6">
      <div className="max-w-[1600px] mx-auto w-full h-full flex items-center justify-between gap-3 sm:gap-4">
        {/* Left side: Breadcrumbs */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex sm:hidden w-7 h-7 rounded-lg bg-sky-500/15 text-sky-600 dark:text-sky-400 items-center justify-center shrink-0">
            {isStateManager ? (
              <MapPinned className="w-3.5 h-3.5" />
            ) : userRole === "STAFF" ? (
              <UserCheck className="w-3.5 h-3.5" />
            ) : (
              <Building2 className="w-3.5 h-3.5" />
            )}
          </div>
          <div className="flex items-center text-xs sm:text-sm font-medium truncate">
            <span className="text-muted-foreground capitalize hidden sm:inline-block truncate max-w-[180px]">
              {tenantName}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60 mx-1.5 hidden sm:inline-block shrink-0" />
            <span className="text-foreground tracking-tight font-semibold truncate">
              {currentPage}
            </span>
            {centerCode && (
              <span className="ml-2 hidden md:inline-flex text-[10px] font-mono font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 bg-sky-500/10 dark:bg-sky-500/20 px-2 py-0.5 rounded-md">
                {centerCode}
              </span>
            )}
          </div>
        </div>

        {/* Center: Command Palette Trigger */}
        <div className="flex items-center mx-2">
          <CommandSearchButton />
        </div>

        {/* Right side: Actions & Profile */}
        <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
          {/* Wallet Balance Widget */}
          <Link 
            href={`${workspaceBase}/admin/wallet`} 
            className="flex items-center gap-1.5 sm:gap-2.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/50 hover:bg-slate-200/70 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/50 transition-colors group cursor-pointer"
            title="Franchise Wallet"
          >
            <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Wallet className="h-3.5 w-3.5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="hidden sm:block text-[9px] font-bold uppercase tracking-wider text-muted-foreground leading-none mb-0.5">
                Balance
              </span>
              <span className="text-xs font-bold text-foreground leading-tight tracking-tight">
                {formatCurrency(walletBalance)}
              </span>
            </div>
          </Link>

          {/* Profile Section */}
          <Link 
            href={`${workspaceBase}/admin/profile`} 
            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors group cursor-pointer"
          >
            <div className="hidden md:flex flex-col items-end text-right">
              <span className="text-xs font-bold text-foreground leading-none mb-0.5 uppercase tracking-tight">
                {userName}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.2 rounded leading-tight">
                {roleLabel}
              </span>
            </div>
            
            <Avatar className="h-8 w-8 sm:h-9 sm:w-9 border border-border shadow-xs group-hover:ring-2 group-hover:ring-primary/20 transition-all">
              <AvatarImage src={userImage || undefined} alt={userName} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                {userName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>

          {/* Notification Center & Theme Toggle */}
          <div className="flex items-center gap-1 sm:gap-2 border-l border-border/50 pl-2.5 sm:pl-3">
            <NotificationBell workspaceId={workspaceId} tenant={tenant} portal="admin" />
            <ThemeToggle />
          </div>
        </div>
      </div>
      <CommandPalette portal="admin" tenant={tenant} />
    </header>
  );
}
