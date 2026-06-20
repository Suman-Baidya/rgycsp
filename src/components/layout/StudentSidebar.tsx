"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  LogOut,
  Building2,
  FileText,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

import { detectTenant, getTenantLink, isActivePath, WORKSPACE_ROUTES } from "@/lib/routing";

export function StudentSidebar({ 
  tenant: propTenant,
  workspaceBase
}: { 
  tenant?: string;
  workspaceBase?: string;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  
  const tenant = propTenant || detectTenant(pathname, typeof window !== 'undefined' ? window.location.host : undefined);

  // Create absolute safe links using workspaceBase if provided by server
  const getSafeLink = (path: string) => {
    if (workspaceBase !== undefined) {
      if (workspaceBase === "") return path; // Subdomain mode
      const cleanPath = path.startsWith('/') ? path : `/${path}`;
      return `${workspaceBase}${cleanPath}`.replace(/\/+/g, '/');
    }
    return getTenantLink(path, tenant, pathname);
  };

  const navItems = [
    { name: "Overview", href: getSafeLink(WORKSPACE_ROUTES.STUDENT_DASHBOARD), icon: LayoutDashboard },
    { name: "My Courses", href: getSafeLink(WORKSPACE_ROUTES.STUDENT_COURSES), icon: BookOpen },
    { name: "Attendance", href: getSafeLink(WORKSPACE_ROUTES.STUDENT_ATTENDANCE), icon: Calendar },
    { name: "Exams", href: getSafeLink(WORKSPACE_ROUTES.STUDENT_EXAMS), icon: FileText },
    { name: "Fees & Invoices", href: getSafeLink(WORKSPACE_ROUTES.STUDENT_FEES), icon: Wallet },
    { name: "Notices", href: getSafeLink(WORKSPACE_ROUTES.STUDENT_NOTICES), icon: Bell },
    { name: "My Profile", href: getSafeLink(WORKSPACE_ROUTES.STUDENT_PROFILE), icon: User },
  ];

  useEffect(() => {
    setIsMounted(true);
    setIsMoreOpen(false);
  }, [pathname]);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleMore = () => setIsMoreOpen(!isMoreOpen);

  if (!isMounted) return null;

  const mainNavItems = navItems.slice(0, 4);
  const moreNavItems = navItems.slice(4);

  return (
    <>
      <motion.aside
        initial={false}
        animate={{
          width: isCollapsed ? 80 : 280,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "hidden lg:flex sticky top-0 inset-y-0 left-0 z-[60] bg-slate-900 text-slate-400 border-r border-white/5 flex-col transition-all duration-300 ease-in-out h-screen overflow-x-hidden",
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
            const isActive = isActivePath(pathname, item.href);
            return (
              <Link key={item.name} href={item.href} className="block w-full">
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
              const workspaceBaseUrl = getTenantLink("/", tenant, pathname);
              const target = `${origin}${workspaceBaseUrl}`;
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

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[60] bg-slate-900/95 backdrop-blur-md border-t border-white/10 pb-safe pb-4 pt-2">
        <div className="flex items-center justify-around px-2">
          {mainNavItems.map((item) => {
            const isActive = isActivePath(pathname, item.href);
            
            return (
              <Link key={item.name} href={item.href} className="flex flex-col items-center gap-1 w-16 relative">
                <div className={cn(
                  "p-2 rounded-xl transition-all duration-300 flex items-center justify-center",
                  isActive ? "bg-primary text-primary-foreground shadow-lg" : "text-slate-400"
                )}>
                  <item.icon className="h-5 w-5" />
                </div>
                <span className={cn(
                  "text-[10px] font-medium transition-colors text-center w-full truncate px-1",
                  isActive ? "text-primary" : "text-slate-500"
                )}>
                  {item.name}
                </span>
              </Link>
            );
          })}
          
          <button onClick={toggleMore} className="flex flex-col items-center gap-1 w-16 relative">
            <div className={cn(
              "p-2 rounded-xl transition-all duration-300 flex items-center justify-center",
              isMoreOpen ? "bg-white/10 text-white" : "text-slate-400"
            )}>
              <MoreHorizontal className="h-5 w-5" />
            </div>
            <span className={cn(
              "text-[10px] font-medium transition-colors text-center w-full truncate px-1",
              isMoreOpen ? "text-white" : "text-slate-500"
            )}>
              More
            </span>
          </button>
        </div>
      </div>

      {/* Mobile More Drawer */}
      <AnimatePresence>
        {isMoreOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMore}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] lg:hidden"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-[76px] left-0 right-0 z-[55] bg-slate-900 border-t border-white/10 rounded-t-3xl overflow-hidden flex flex-col max-h-[70vh] lg:hidden shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
            >
              <div className="w-12 h-1.5 bg-slate-800 rounded-full mx-auto mt-4 mb-2" />
              <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {moreNavItems.map((item) => {
                  const isActive = isActivePath(pathname, item.href);
                  
                  return (
                    <Link key={item.name} href={item.href} className="block w-full">
                      <div className={cn(
                        "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300",
                        isActive ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-white/5 text-slate-300"
                      )}>
                        <item.icon className="h-5 w-5" />
                        <span className="font-medium">{item.name}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
              <div className="p-4 border-t border-white/5 bg-slate-900">
                <div 
                  onClick={async () => {
                    const origin = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}` : '';
                    const workspaceBaseUrl = getTenantLink("/", tenant, pathname);
                    const target = `${origin}${workspaceBaseUrl}`;
                    await signOut({ redirect: false });
                    window.location.href = target;
                  }}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-red-500/10 bg-red-500/5 text-red-500 transition-all cursor-pointer"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Logout</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
