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
                  Franchise Admin
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
        <nav className={cn("flex-1 py-6 space-y-2 overflow-y-auto overflow-x-hidden", isCollapsed ? "px-2 scrollbar-hide" : "px-4 custom-scrollbar")}>
          {navItems.map((item) => {
            const isActive = isActivePath(pathname, item.href);
            
            return (
              <TenantNavLink
                key={item.name}
                href={item.href}
                className={cn(
                  "relative flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-300 group overflow-hidden",
                  isActive 
                    ? "bg-white/10 text-white shadow-sm ring-1 ring-white/20" 
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
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[60] bg-zinc-950/95 backdrop-blur-sm border-t border-white/10 pb-safe pb-4 pt-2">
        <div className="flex items-center justify-around px-2">
          {mainNavItems.map((item) => {
            const isActive = isActivePath(pathname, item.href);
            
            return (
              <TenantNavLink key={item.name} href={item.href} className="flex flex-col items-center gap-1 w-16 relative">
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
              </TenantNavLink>
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
                    <TenantNavLink key={item.name} href={item.href} className="block w-full">
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
                    </TenantNavLink>
                  );
                })}
              </div>
              <div className="p-4 border-t border-white/5 bg-zinc-950">
                <div 
                  onClick={async () => {
                    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
                    const protocol = typeof window !== 'undefined' && window.location.hostname.includes("localhost") ? "http" : "https";
                    await signOut({ redirect: false });
                    window.location.href = `${protocol}://${rootDomain}/`;
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
