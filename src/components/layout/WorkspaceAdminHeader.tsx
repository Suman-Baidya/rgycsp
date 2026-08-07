"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { Wallet, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface WorkspaceAdminHeaderProps {
  tenantName: string;
  workspaceBase: string;
  walletBalance: number;
  userName: string;
  userImage?: string | null;
  centerCode?: string | null;
}

export function WorkspaceAdminHeader({
  tenantName,
  workspaceBase,
  walletBalance,
  userName,
  userImage,
  centerCode
}: WorkspaceAdminHeaderProps) {
  const pathname = usePathname();
  
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
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <header className="h-16 shrink-0 border-b border-border/40 bg-background/80 backdrop-blur-md flex items-center px-4 lg:px-8 sticky top-0 z-40 transition-all duration-300">
      {/* Left side: Breadcrumbs */}
      <div className="flex-1 flex items-center gap-2">
        <div className="lg:hidden ml-12" /> {/* Spacer for mobile sidebar toggle */}
        <div className="flex items-center text-sm font-medium">
          <span className="text-muted-foreground capitalize hidden sm:inline-block">
            {tenantName}
          </span>
          <span className="text-muted-foreground mx-2 hidden sm:inline-block">/</span>
          <span className="text-foreground tracking-tight">
            {currentPage}
          </span>
        </div>
      </div>

      {/* Right side: Actions & Profile */}
      <div className="flex items-center gap-4 sm:gap-6 ml-auto">
        
        {/* Wallet Balance Widget */}
        <Link href={`${workspaceBase}/wallet`} className="hidden sm:flex items-center gap-3 group cursor-pointer hover:opacity-80 transition-opacity">
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider leading-none mb-1">
              Total Balance
            </span>
            <span className="text-[15px] font-extrabold text-foreground leading-none tracking-tight">
              {formatCurrency(walletBalance)}
            </span>
          </div>
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors shadow-sm border border-primary/10">
            <Wallet className="h-4 w-4" />
          </div>
        </Link>

        {/* Profile Section */}
        <Link href={`${workspaceBase}/profile`} className="flex items-center gap-3 group cursor-pointer hover:opacity-80 transition-opacity pl-2 sm:pl-4 border-l border-border/50">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-bold text-foreground leading-none mb-1 uppercase">
              {userName}
            </span>
            {centerCode && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {centerCode}
              </span>
            )}
          </div>
          
          <Avatar className="h-9 w-9 border-2 border-background shadow-sm group-hover:ring-2 group-hover:ring-primary/20 transition-all">
            <AvatarImage src={userImage || undefined} alt={userName} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
              {userName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>

        {/* Theme Toggle */}
        <div className="flex items-center border-l border-border/50 pl-4 sm:pl-6">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
