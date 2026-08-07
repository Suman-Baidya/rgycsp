"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SuperAdminHeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function SuperAdminHeader({ user }: SuperAdminHeaderProps) {
  const pathname = usePathname();
  
  // Format Breadcrumbs:
  const segments = pathname.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  
  let currentPage = "Dashboard";
  if (lastSegment && lastSegment !== "super-admin") {
    currentPage = lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, " ");
  }

  const userName = user?.name || "Super Admin";
  const userEmail = user?.email || "admin@example.com";
  const userImage = user?.image;

  return (
    <header className="h-16 shrink-0 border-b border-border/40 bg-background/80 backdrop-blur-md flex items-center px-4 lg:px-8 sticky top-0 z-40 transition-all duration-300">
      {/* Left side: Navigation / Breadcrumbs */}
      <div className="flex-1 flex items-center gap-2">
        <div className="lg:hidden ml-12" /> {/* Spacer for mobile sidebar toggle */}
        <div className="flex items-center text-sm font-medium">
          <span className="text-muted-foreground hidden sm:inline-block">
            Super Admin
          </span>
          <span className="text-muted-foreground mx-2 hidden sm:inline-block">/</span>
          <span className="text-foreground tracking-tight font-semibold">
            {currentPage}
          </span>
        </div>
      </div>

      {/* Right side: Profile & Theme */}
      <div className="flex items-center gap-4 sm:gap-6 ml-auto">
        {/* Profile Section */}
        <Link href="/super-admin/profile" className="flex items-center gap-3 group cursor-pointer hover:opacity-80 transition-opacity pl-2 sm:pl-4 border-l border-border/50">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-bold text-foreground leading-none mb-1 uppercase">
              {userName}
            </span>
            <span className="text-xs font-medium lowercase text-muted-foreground leading-none">
              {userEmail}
            </span>
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
