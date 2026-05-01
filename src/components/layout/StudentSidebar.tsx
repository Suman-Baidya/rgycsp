"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  Bell,
  User,
  Wallet,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  LogOut,
  GraduationCap,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

export function StudentSidebar({ tenant: propTenant }: { tenant?: string }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const params = useParams();
  
  const getTenant = () => {
    if (propTenant) return propTenant;
    if (params?.tenant) return params.tenant as string;
    
    // Check hostname first (Subdomain Mode)
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const parts = hostname.split('.');
      if (parts.length >= 2 && !hostname.startsWith('localhost')) {
        return parts[0];
      }
      if (hostname.endsWith('.localhost')) {
        return hostname.replace('.localhost', '');
      }
    }

    // Fallback to pathname (Subdirectory Mode)
    if (pathname.startsWith('/app/')) return pathname.split('/')[2];
    
    return "";
  };

  const tenant = getTenant();
  const isSubdirectoryMode = pathname.startsWith('/app/');
  const workspaceBase = isSubdirectoryMode ? `/app/${tenant}` : '';
  const studentBase = isSubdirectoryMode ? `${workspaceBase}/student` : `/student`;

  const navItems = [
    { name: "Overview", href: `${studentBase}/dashboard`, icon: LayoutDashboard },
    { name: "My Courses", href: `${studentBase}/courses`, icon: BookOpen },
    { name: "Attendance", href: `${studentBase}/attendance`, icon: Calendar },
    { name: "Fees & Invoices", href: `${studentBase}/fees`, icon: Wallet },
    { name: "Notices", href: `${studentBase}/notices`, icon: Bell },
    { name: "My Profile", href: `${studentBase}/profile`, icon: User },
  ];

  useEffect(() => {
    setIsMounted(true);
    setIsMobileOpen(false);
  }, [pathname]);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

  if (!isMounted) return null;

  return (
    <>
      <div className="lg:hidden fixed top-4 left-4 z-[60]">
        <Button variant="outline" size="icon" onClick={toggleMobile} className="bg-background/80 backdrop-blur-md border-primary/20 shadow-lg">
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleMobile}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{
          width: isCollapsed ? 80 : 280,
          x: isMobileOpen ? 0 : (window.innerWidth < 1024 ? -300 : 0)
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "fixed lg:sticky top-0 inset-y-0 left-0 z-[60] bg-slate-900 text-slate-400 border-r border-white/5 flex flex-col transition-all duration-300 ease-in-out h-screen overflow-x-hidden",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className={cn(
          "h-24 flex items-center border-b border-white/5 transition-all duration-300",
          isCollapsed ? "justify-center" : "px-8 justify-between"
        )}>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4 overflow-hidden"
            >
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)] shrink-0">
                <Building2 className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <span className="font-black text-white tracking-tighter text-xl whitespace-nowrap block leading-none">
                  PORTAL
                </span>
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                  Student
                </span>
              </div>
            </motion.div>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={cn(
              "hover:bg-white/5 text-slate-500 hover:text-white shrink-0 transition-all",
              isCollapsed ? "h-12 w-12" : "h-10 w-10"
            )}
          >
            {isCollapsed ? <ChevronRight className="h-6 w-6" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 transition-all duration-300 group relative overflow-hidden",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-lg" 
                      : "hover:bg-white/5 hover:text-white text-slate-400",
                    isCollapsed ? "justify-center h-12 w-12 mx-auto rounded-xl" : "px-3 py-3 rounded-xl"
                  )}
                >
                  <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-primary-foreground" : "group-hover:text-white")} />
                  
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="font-medium whitespace-nowrap"
                    >
                      {item.name}
                    </motion.span>
                  )}

                  {isCollapsed && (
                    <div className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap border border-white/10">
                      {item.name}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className={cn("border-t border-white/5 transition-all duration-300", isCollapsed ? "p-2" : "p-4")}>
          <div 
            onClick={async () => {
              const origin = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}` : '';
              const target = `${origin}${workspaceBase || '/'}`;
              await signOut({ redirect: false });
              window.location.href = target;
            }}
            className={cn(
              "flex items-center gap-3 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-all cursor-pointer group relative overflow-hidden",
              isCollapsed ? "justify-center h-12 w-12 mx-auto" : "px-3 py-3"
            )}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && (
              <motion.span className="font-medium">Logout</motion.span>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  );
}
