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
  GraduationCap,
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

  const isSubdomainMode = workspaceBase !== undefined 
    ? workspaceBase === "" 
    : typeof window !== 'undefined' 
      ? (window.location.host.includes('.') && !window.location.host.startsWith('192.') && !window.location.host.startsWith('127.'))
      : false;

  const TenantNavLink = ({ href, children, className, onClick }: any) => {
    if (isSubdomainMode) {
      return <a href={href} className={className} onClick={onClick}>{children}</a>;
    }
    return <Link href={href} className={className} onClick={onClick}>{children}</Link>;
  };

  const generateLink = (path: string) => {
    return getTenantLink(path, tenant, pathname);
  };

  const navItems = [
    { name: "Overview", href: generateLink(WORKSPACE_ROUTES.STUDENT_DASHBOARD), icon: LayoutDashboard },
    { name: "My Courses", href: generateLink(WORKSPACE_ROUTES.STUDENT_COURSES), icon: BookOpen },
    { name: "Attendance", href: generateLink(WORKSPACE_ROUTES.STUDENT_ATTENDANCE), icon: Calendar },
    { name: "Exams", href: generateLink(WORKSPACE_ROUTES.STUDENT_EXAMS), icon: FileText },
    { name: "Fees & Invoices", href: generateLink(WORKSPACE_ROUTES.STUDENT_FEES), icon: Wallet },
    { name: "Notices", href: generateLink(WORKSPACE_ROUTES.STUDENT_NOTICES), icon: Bell },
    { name: "My Profile", href: generateLink(WORKSPACE_ROUTES.STUDENT_PROFILE), icon: User },
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
          "h-16 flex items-center border-b border-white/10 px-4 transition-all duration-300 shrink-0",
          isCollapsed ? "justify-center px-2" : "justify-between"
        )}>
          {isCollapsed ? (
            <button
              onClick={toggleSidebar}
              title="Expand Sidebar"
              className="h-10 w-10 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 flex items-center justify-center transition-all shadow-sm group"
            >
              <ChevronRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          ) : (
            <>
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-xs shrink-0">
                  <GraduationCap className="h-5.5 w-5.5" />
                </div>
                <span className="font-bold text-white tracking-tight text-base truncate">
                  Student Portal
                </span>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="h-8 w-8 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white shrink-0 transition-all"
                title="Collapse Sidebar"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        <nav className={cn("flex-1 py-4 space-y-1.5 overflow-y-auto overflow-x-hidden", isCollapsed ? "px-2 scrollbar-hide" : "px-4 custom-scrollbar")}>
          {navItems.map((item) => {
            const isActive = isActivePath(pathname, item.href);
            return (
              <TenantNavLink key={item.name} href={item.href} className="block w-full">
                <div
                  className={cn(
                    "flex items-center gap-3 transition-all duration-200 group relative overflow-hidden",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-lg font-semibold" 
                      : "hover:bg-white/5 hover:text-white text-slate-400",
                    isCollapsed ? "justify-center h-10 w-10 mx-auto rounded-xl" : "px-3 py-2.5 rounded-xl"
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
              </TenantNavLink>
            );
          })}
        </nav>

        <div className={cn("border-t border-white/5 transition-all duration-300", isCollapsed ? "p-2" : "p-4")}>
          <div 
            onClick={async () => {
              const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
              const protocol = typeof window !== 'undefined' && window.location.hostname.includes("localhost") ? "http" : "https";
              await signOut({ redirect: false });
              window.location.href = `${protocol}://${rootDomain}/`;
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

      {/* Mobile Bottom Navigation (Native App Feeling) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[60] bg-white/85 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200/80 dark:border-white/10 pb-[max(env(safe-area-inset-bottom),12px)] pt-2 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-around px-2">
          {mainNavItems.map((item) => {
            const isActive = isActivePath(pathname, item.href);
            
            return (
              <TenantNavLink key={item.name} href={item.href} className="flex flex-col items-center gap-1 w-16 relative">
                <div className={cn(
                  "p-2 rounded-2xl transition-all duration-300 flex items-center justify-center",
                  isActive 
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/20 shadow-xs" 
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                )}>
                  <item.icon className={cn("h-5 w-5 transition-transform duration-200", isActive && "scale-110")} />
                </div>
                <span className={cn(
                  "text-[10px] tracking-tight transition-colors text-center w-full truncate px-1",
                  isActive ? "font-bold text-emerald-600 dark:text-emerald-400" : "font-medium text-slate-500 dark:text-slate-400"
                )}>
                  {item.name}
                </span>
              </TenantNavLink>
            );
          })}
          
          <button onClick={toggleMore} className="flex flex-col items-center gap-1 w-16 relative">
            <div className={cn(
              "p-2 rounded-2xl transition-all duration-300 flex items-center justify-center",
              isMoreOpen ? "bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"
            )}>
              <MoreHorizontal className="h-5 w-5" />
            </div>
            <span className={cn(
              "text-[10px] font-medium transition-colors text-center w-full truncate px-1",
              isMoreOpen ? "font-bold text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"
            )}>
              More
            </span>
          </button>
        </div>
      </div>

      {/* Mobile More Drawer (Native Bottom Sheet) */}
      <AnimatePresence>
        {isMoreOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMore}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs z-[65] lg:hidden"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed bottom-[72px] left-0 right-0 z-[65] bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-white/10 rounded-t-[28px] overflow-hidden flex flex-col max-h-[70vh] lg:hidden shadow-[0_-12px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_-12px_40px_rgba(0,0,0,0.5)]"
            >
              <div className="w-10 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-3 mb-2" />
              <div className="flex-1 overflow-y-auto p-4 space-y-1.5 custom-scrollbar">
                {moreNavItems.map((item) => {
                  const isActive = isActivePath(pathname, item.href);
                  
                  return (
                    <TenantNavLink key={item.name} href={item.href} className="block w-full">
                      <div className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                        isActive 
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold" 
                          : "hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300"
                      )}>
                        <item.icon className="h-5 w-5 shrink-0" />
                        <span className="font-medium text-sm">{item.name}</span>
                      </div>
                    </TenantNavLink>
                  );
                })}
              </div>
              <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/50">
                <div 
                  onClick={async () => {
                    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
                    const protocol = typeof window !== 'undefined' && window.location.hostname.includes("localhost") ? "http" : "https";
                    await signOut({ redirect: false });
                    window.location.href = `${protocol}://${rootDomain}/`;
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 bg-red-500/5 text-red-600 dark:text-red-400 transition-all cursor-pointer font-medium text-sm"
                >
                  <LogOut className="h-5 w-5 shrink-0" />
                  <span>Logout</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
