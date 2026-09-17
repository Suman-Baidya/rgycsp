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
  Wallet,
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
  MapPinned,
  ShoppingCart,
  UserCog,
  Receipt,
  IndianRupee,
  GraduationCap,
  BarChart2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { detectTenant, getTenantLink, isActivePath, WORKSPACE_ROUTES, getRoutingConfig } from "@/lib/routing";
import { signOut } from "next-auth/react";

export function WorkspaceSidebar({ 
  tenant: propTenant,
  workspaceBase,
  admissionsCount = 0,
  pendingFeesCount = 0,
  isStateManager = false,
  userRole = "ADMIN",
  userPermissions = []
}: { 
  tenant?: string;
  workspaceBase?: string;
  admissionsCount?: number;
  pendingFeesCount?: number;
  isStateManager?: boolean;
  userRole?: string;
  userPermissions?: string[];
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  
  const routingConfig = getRoutingConfig(pathname, typeof window !== 'undefined' ? window.location.host : undefined, propTenant);
  const tenant = propTenant || routingConfig.tenant;
  const displayTenant = tenant || "Workspace";

  // Safely handle Subdomain mode detection using the passed workspaceBase prop
  // In Subdomain mode, workspaceBase is "". In Subdirectory mode, it's "/app/[tenant]"
  // This avoids a hydration mismatch between SSR and Client, which was causing Next.js 
  // to intercept `<a>` tag clicks and throw 404s.
  const isSubdomainMode = workspaceBase === "";

  const TenantNavLink = ({ href, children, className, onClick }: any) => {
    if (isSubdomainMode) {
      return <a href={href} className={className} onClick={onClick}>{children}</a>;
    }
    return <Link href={href} className={className} onClick={onClick}>{children}</Link>;
  };

  const generateLink = (path: string) => {
    return getTenantLink(path, displayTenant, pathname);
  };

  const allNavItems = [
    { id: "dashboard", name: "Overview", href: generateLink(WORKSPACE_ROUTES.ADMIN), icon: LayoutDashboard },
    { id: "analytics", name: "Visitor Analytics", href: generateLink(WORKSPACE_ROUTES.ADMIN_ANALYTICS), icon: BarChart2 },
    { id: "wallet", name: "Wallet", href: generateLink(WORKSPACE_ROUTES.ADMIN_WALLET), icon: Wallet },
    { id: "staff", name: "Staff & Roles", href: generateLink(WORKSPACE_ROUTES.ADMIN_STAFF), icon: UserCheck },
    { id: "students", name: "Students", href: generateLink(WORKSPACE_ROUTES.ADMIN_STUDENTS), icon: Users },
    { id: "fees", name: "Fees Manage", href: generateLink(WORKSPACE_ROUTES.ADMIN_FEES), icon: IndianRupee },
    { id: "admissions", name: "Admissions", href: generateLink(WORKSPACE_ROUTES.ADMIN_ADMISSIONS), icon: UserPlus },
    { id: "attendance", name: "Attendance", href: generateLink(WORKSPACE_ROUTES.ADMIN_ATTENDANCE), icon: Calendar },
    { id: "courses", name: "Courses", href: generateLink(WORKSPACE_ROUTES.ADMIN_COURSES), icon: BookOpen },
    { id: "products", name: "Products & Store", href: generateLink(WORKSPACE_ROUTES.ADMIN_PRODUCTS), icon: ShoppingCart },
    { id: "exam-gen", name: "Exam Zone", href: generateLink(WORKSPACE_ROUTES.ADMIN_EXAM_GENERATOR), icon: GraduationCap },
    { id: "settings", name: "Landing Page", href: generateLink(WORKSPACE_ROUTES.ADMIN_SETTINGS), icon: Building2 },
    { id: "profile", name: "Profile", href: generateLink(WORKSPACE_ROUTES.ADMIN_PROFILE), icon: UserCog },
  ];

  const navItems = userRole === "ADMIN" 
    ? allNavItems 
    : allNavItems.filter(item => 
        // Staff page is typically admin only unless specifically allowed (which we didn't add to checkbox array, but let's say it's admin only)
        item.id === "staff" ? userRole === "ADMIN" : userPermissions.includes(item.id) || item.id === "dashboard" || item.id === "profile"
      );

  if (isStateManager) {
    navItems.splice(8, 0, { id: "state-manager", name: "State Manager", href: generateLink(WORKSPACE_ROUTES.ADMIN_STATE_MANAGER || "/admin/state-manager"), icon: MapPinned });
  }

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
          "h-16 flex items-center border-b border-white/10 px-4 transition-all duration-300 shrink-0",
          isCollapsed ? "justify-center px-2" : "justify-between"
        )}>
          {isCollapsed ? (
            <button
              onClick={toggleSidebar}
              title="Expand Sidebar"
              className="h-10 w-10 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 flex items-center justify-center transition-all shadow-sm group"
            >
              <ChevronRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          ) : (
            <>
              <div className="flex items-center gap-3 overflow-hidden">
                <div className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center shadow-xs shrink-0 border",
                  isStateManager
                    ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                    : userRole === "STAFF"
                    ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
                    : "bg-sky-500/20 text-sky-400 border-sky-500/30"
                )}>
                  {isStateManager ? (
                    <MapPinned className="h-5.5 w-5.5" />
                  ) : userRole === "STAFF" ? (
                    <UserCheck className="h-5.5 w-5.5" />
                  ) : (
                    <Building2 className="h-5.5 w-5.5" />
                  )}
                </div>
                <span className="font-bold text-white tracking-tight text-base truncate">
                  {isStateManager ? "State Manager" : userRole === "STAFF" ? "Staff Portal" : "Franchise Admin"}
                </span>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="h-8 w-8 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white shrink-0 transition-all"
                title="Collapse Sidebar"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        {/* Navigation */}
        <nav className={cn("flex-1 py-4 space-y-1.5 overflow-y-auto overflow-x-hidden", isCollapsed ? "px-2 scrollbar-hide" : "px-4 custom-scrollbar")}>
          {navItems.map((item) => {
            const isActive = isActivePath(pathname, item.href);
            
            return (
              <TenantNavLink
                key={item.name}
                href={item.href}
                className={cn(
                  "relative flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group overflow-hidden",
                  isActive 
                    ? "bg-white/10 text-white shadow-sm ring-1 ring-white/20 font-semibold" 
                    : "hover:bg-white/5 hover:text-white",
                  isCollapsed ? "justify-center h-10 w-10 mx-auto" : ""
                )}
              >
                <div className="flex items-center gap-3 w-full">
                  <item.icon className={cn(
                    "h-5 w-5 transition-colors",
                    isActive ? "text-white" : "text-zinc-400 group-hover:text-white"
                  )} />
                  
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="font-medium whitespace-nowrap flex-1 flex justify-between items-center pr-2"
                    >
                      <span>{item.name}</span>
                      {item.name === "Admissions" && admissionsCount > 0 && (
                        <span className="h-5 min-w-5 px-1.5 bg-red-500 text-white text-[10px] font-black rounded flex items-center justify-center animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                          {admissionsCount}
                        </span>
                      )}
                      {item.id === "fees" && pendingFeesCount > 0 && (
                        <span className="h-5 min-w-5 px-1.5 bg-red-500 text-white text-[10px] font-black rounded flex items-center justify-center animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                          {pendingFeesCount}
                        </span>
                      )}
                    </motion.span>
                  )}

                  {isCollapsed && item.name === "Admissions" && admissionsCount > 0 && (
                    <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)] border-2 border-zinc-950"></div>
                  )}

                  {isCollapsed && item.id === "fees" && pendingFeesCount > 0 && (
                    <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)] border-2 border-zinc-950"></div>
                  )}

                  {isCollapsed && (
                    <div className="absolute left-full ml-4 px-2 py-1 bg-zinc-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap border border-white/10 shadow-xl flex items-center gap-2">
                      {item.name}
                      {item.name === "Admissions" && admissionsCount > 0 && (
                        <div className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                          {admissionsCount}
                        </div>
                      )}
                      {item.id === "fees" && pendingFeesCount > 0 && (
                        <div className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                          {pendingFeesCount}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </TenantNavLink>
            );
          })}
        </nav>

        {/* Footer */}
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
      {/* Mobile Bottom Navigation (Native App Feeling) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[60] bg-white/85 dark:bg-zinc-950/90 backdrop-blur-xl border-t border-slate-200/80 dark:border-white/10 pb-[max(env(safe-area-inset-bottom),12px)] pt-2 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-around px-2">
          {mainNavItems.map((item) => {
            const isActive = isActivePath(pathname, item.href);
            
            return (
              <TenantNavLink key={item.name} href={item.href} className="flex flex-col items-center gap-1 w-16 relative">
                <div className={cn(
                  "p-2 rounded-2xl transition-all duration-300 flex items-center justify-center",
                  isActive 
                    ? "bg-sky-500/15 text-sky-600 dark:text-sky-400 dark:bg-sky-500/20 shadow-xs" 
                    : "text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white"
                )}>
                  <item.icon className={cn("h-5 w-5 transition-transform duration-200", isActive && "scale-110")} />
                  
                  {item.name === "Admissions" && admissionsCount > 0 && (
                    <div className="absolute top-1 right-2 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center shadow-xs">
                      {admissionsCount}
                    </div>
                  )}
                </div>
                <span className={cn(
                  "text-[10px] tracking-tight transition-colors text-center w-full truncate px-1",
                  isActive ? "font-bold text-sky-600 dark:text-sky-400" : "font-medium text-slate-500 dark:text-zinc-400"
                )}>
                  {item.name}
                </span>
              </TenantNavLink>
            );
          })}
          
          <button onClick={toggleMore} className="flex flex-col items-center gap-1 w-16 relative">
            <div className={cn(
              "p-2 rounded-2xl transition-all duration-300 flex items-center justify-center",
              isMoreOpen ? "bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white" : "text-slate-500 dark:text-zinc-400"
            )}>
              <MoreHorizontal className="h-5 w-5" />
            </div>
            <span className={cn(
              "text-[10px] font-medium transition-colors text-center w-full truncate px-1",
              isMoreOpen ? "font-bold text-slate-900 dark:text-white" : "text-slate-500 dark:text-zinc-400"
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
              className="fixed bottom-[72px] left-0 right-0 z-[65] bg-white dark:bg-zinc-950 border-t border-slate-200/80 dark:border-white/10 rounded-t-[28px] overflow-hidden flex flex-col max-h-[70vh] lg:hidden shadow-[0_-12px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_-12px_40px_rgba(0,0,0,0.5)]"
            >
              <div className="w-10 h-1.5 bg-slate-300 dark:bg-zinc-700 rounded-full mx-auto mt-3 mb-2" />
              <div className="flex-1 overflow-y-auto p-4 space-y-1.5 custom-scrollbar">
                {moreNavItems.map((item) => {
                  const isActive = isActivePath(pathname, item.href);
                  
                  return (
                    <TenantNavLink key={item.name} href={item.href} className="block w-full">
                      <div className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                        isActive 
                          ? "bg-sky-500/15 text-sky-700 dark:text-sky-300 font-semibold" 
                          : "hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-zinc-300"
                      )}>
                        <item.icon className="h-5 w-5 shrink-0" />
                        <span className="font-medium text-sm">{item.name}</span>
                        
                        {item.name === "Admissions" && admissionsCount > 0 && (
                          <span className={cn(
                            "ml-auto flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full text-[10px] font-bold transition-colors shadow-xs",
                            isActive ? "bg-sky-600 text-white" : "bg-red-500 text-white"
                          )}>
                            {admissionsCount}
                          </span>
                        )}
                      </div>
                    </TenantNavLink>
                  );
                })}
              </div>
              <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-zinc-950/50">
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
