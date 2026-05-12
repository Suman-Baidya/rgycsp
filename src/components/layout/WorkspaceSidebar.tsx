"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  LogOut,
  Building2,
  Calendar,
  UserPlus,
  Sparkles,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { detectTenant, getTenantLink, isActivePath, WORKSPACE_ROUTES } from "@/lib/routing";
import { signOut } from "next-auth/react";

export function WorkspaceSidebar({ 
  tenant: propTenant,
  admissionsCount = 0 
}: { 
  tenant?: string;
  admissionsCount?: number;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  
  // Robust tenant detection using unified utility
  const tenant = propTenant || detectTenant(pathname, typeof window !== 'undefined' ? window.location.host : undefined);
  const displayTenant = tenant || "Workspace";

  const navItems = [
    { name: "Overview", href: getTenantLink(WORKSPACE_ROUTES.ADMIN, tenant, pathname), icon: LayoutDashboard },
    { name: "Staff & Roles", href: getTenantLink(WORKSPACE_ROUTES.ADMIN_STAFF, tenant, pathname), icon: UserCheck },
    { name: "Students", href: getTenantLink(WORKSPACE_ROUTES.ADMIN_STUDENTS, tenant, pathname), icon: Users },
    { name: "Admissions", href: getTenantLink(WORKSPACE_ROUTES.ADMIN_ADMISSIONS, tenant, pathname), icon: UserPlus },
    { name: "Attendance", href: getTenantLink(WORKSPACE_ROUTES.ADMIN_ATTENDANCE, tenant, pathname), icon: Calendar },
    { name: "Courses", href: getTenantLink(WORKSPACE_ROUTES.ADMIN_COURSES, tenant, pathname), icon: BookOpen },
    { name: "Exam Gen", href: getTenantLink(WORKSPACE_ROUTES.ADMIN_EXAM_GENERATOR, tenant, pathname), icon: Sparkles },
    { name: "Landing Page", href: getTenantLink(WORKSPACE_ROUTES.ADMIN_SETTINGS, tenant, pathname), icon: Building2 },
  ];

  // Close mobile drawer on navigation
  useEffect(() => {
    setIsMounted(true);
    setIsMoreOpen(false);
  }, [pathname]);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleMore = () => setIsMoreOpen(!isMoreOpen);

  const mainNavItems = navItems.slice(0, 4);
  const moreNavItems = navItems.slice(4);

  return (
    <>
      {/* Desktop Sidebar Content */}
      <motion.aside
        initial={false}
        animate={{
          width: isCollapsed ? 80 : 280,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "hidden lg:flex sticky top-0 inset-y-0 left-0 z-[60] bg-zinc-950 text-zinc-400 border-r border-white/5 flex-col transition-all duration-300 ease-in-out h-screen overflow-x-hidden",
        )}
      >
        {/* Header */}
        <div className={cn(
          "h-20 flex items-center border-b border-white/5 transition-all duration-300",
          isCollapsed ? "justify-center" : "px-8 justify-between"
        )}>
          {!isCollapsed && (
            <AnimatePresence mode="wait">
              <motion.div
                key="full"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-3 overflow-hidden"
              >
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(var(--primary),0.5)] shrink-0">
                  <Building2 className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-white tracking-tight text-lg whitespace-nowrap capitalize max-w-[160px] truncate">
                  {displayTenant} Admin
                </span>
              </motion.div>
            </AnimatePresence>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={cn(
              "hover:bg-white/5 text-zinc-500 hover:text-white shrink-0 transition-all",
              isCollapsed ? "h-12 w-12" : "h-10 w-10"
            )}
          >
            {isCollapsed ? <ChevronRight className="h-6 w-6" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {navItems.map((item) => {
            const isActive = isActivePath(pathname, item.href);
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 transition-all duration-300 group relative overflow-hidden",
                    isActive 
                      ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-[0_8px_20px_-6px_rgba(var(--primary),0.4)]" 
                      : "hover:bg-white/5 hover:text-white text-zinc-400",
                    isCollapsed ? "justify-center h-12 w-12 mx-auto rounded-xl" : "px-3 py-3 rounded-xl"
                  )}
                >
                  <item.icon className={cn("h-5 w-5 flex-shrink-0 transition-colors", isActive ? "text-primary-foreground" : "group-hover:text-white")} />
                  
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="font-medium whitespace-nowrap flex-1"
                    >
                      {item.name}
                    </motion.span>
                  )}

                  {!isCollapsed && item.name === "Admissions" && admissionsCount > 0 && (
                    <span className={cn(
                      "ml-auto flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-lg text-[10px] font-bold transition-colors shadow-sm",
                      isActive 
                        ? "bg-white text-zinc-950" 
                        : "bg-red-500 text-white"
                    )}>
                      {admissionsCount}
                    </span>
                  )}

                  {isCollapsed && item.name === "Admissions" && admissionsCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center shadow-lg ring-2 ring-zinc-950 animate-pulse">
                      {admissionsCount}
                    </div>
                  )}

                  {isActive && (
                    <motion.div
                      layoutId="active-nav-workspace"
                      className="absolute -left-1 w-1.5 h-6 bg-white rounded-r-full"
                    />
                  )}

                  {isCollapsed && (
                    <div className="absolute left-full ml-4 px-2 py-1 bg-zinc-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap border border-white/10 shadow-xl">
                      {item.name}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={cn("border-t border-white/5 transition-all duration-300", isCollapsed ? "p-2" : "p-4")}>
          <div 
            onClick={async () => {
              const origin = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}` : '';
              const workspaceBase = getTenantLink("/", tenant, pathname);
              const target = `${origin}${workspaceBase}`;
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
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="font-medium"
              >
                Logout
              </motion.span>
            )}
            {isCollapsed && (
              <div className="absolute left-full ml-4 px-2 py-1 bg-zinc-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap border border-white/10 shadow-xl">
                Logout
              </div>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[60] bg-zinc-950/95 backdrop-blur-md border-t border-white/10 pb-safe pb-4 pt-2">
        <div className="flex items-center justify-around px-2">
          {mainNavItems.map((item) => {
            const isActive = isActivePath(pathname, item.href);
            
            return (
              <Link key={item.name} href={item.href} className="flex flex-col items-center gap-1 w-16 relative">
                <div className={cn(
                  "p-2 rounded-xl transition-all duration-300 flex items-center justify-center",
                  isActive ? "bg-primary text-primary-foreground shadow-[0_4px_12px_-4px_rgba(var(--primary),0.5)]" : "text-zinc-400"
                )}>
                  <item.icon className="h-5 w-5" />
                  
                  {item.name === "Admissions" && admissionsCount > 0 && (
                    <div className="absolute top-1 right-2 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center shadow-lg border border-zinc-950">
                      {admissionsCount}
                    </div>
                  )}
                </div>
                <span className={cn(
                  "text-[10px] font-medium transition-colors text-center w-full truncate px-1",
                  isActive ? "text-primary" : "text-zinc-500"
                )}>
                  {item.name}
                </span>
              </Link>
            );
          })}
          
          <button onClick={toggleMore} className="flex flex-col items-center gap-1 w-16 relative">
            <div className={cn(
              "p-2 rounded-xl transition-all duration-300 flex items-center justify-center",
              isMoreOpen ? "bg-white/10 text-white" : "text-zinc-400"
            )}>
              <MoreHorizontal className="h-5 w-5" />
            </div>
            <span className={cn(
              "text-[10px] font-medium transition-colors text-center w-full truncate px-1",
              isMoreOpen ? "text-white" : "text-zinc-500"
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
              className="fixed bottom-[76px] left-0 right-0 z-[55] bg-zinc-950 border-t border-white/10 rounded-t-3xl overflow-hidden flex flex-col max-h-[70vh] lg:hidden shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
            >
              <div className="w-12 h-1.5 bg-zinc-800 rounded-full mx-auto mt-4 mb-2" />
              <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {moreNavItems.map((item) => {
                  const isActive = isActivePath(pathname, item.href);
                  
                  return (
                    <Link key={item.name} href={item.href}>
                      <div className={cn(
                        "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300",
                        isActive ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-white/5 text-zinc-300"
                      )}>
                        <item.icon className="h-5 w-5" />
                        <span className="font-medium">{item.name}</span>
                        
                        {item.name === "Admissions" && admissionsCount > 0 && (
                          <span className={cn(
                            "ml-auto flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-lg text-[10px] font-bold transition-colors shadow-sm",
                            isActive ? "bg-white text-zinc-950" : "bg-red-500 text-white"
                          )}>
                            {admissionsCount}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
              <div className="p-4 border-t border-white/5 bg-zinc-950">
                <div 
                  onClick={async () => {
                    const origin = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}` : '';
                    const workspaceBase = getTenantLink("/", tenant, pathname);
                    const target = `${origin}${workspaceBase}`;
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
