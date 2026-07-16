"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Globe,
  Users,
  Coins,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  LogOut,
  ShieldCheck,
  Activity,
  FileText,
  User,
  MoreHorizontal,
  Building2,
  BookOpen,
  MapPinned,
  ShoppingCart
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { isActivePath, getTenantLink, detectTenant } from "@/lib/routing";
import { getPendingFranchiseCount } from "@/app/actions/franchise";
import { getPendingOrdersCount } from "@/app/actions/product-order";
import { getPendingWalletRequestsCount } from "@/app/actions/wallet";
import { getDeveloperEmail } from "@/app/actions/logs";
import { getPendingDocumentRequestsCount } from "@/app/actions/student-documents";

const navItems = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Wallet Economy", href: "/wallet", icon: Coins },
  { name: "Franchises", href: "/franchises", icon: Building2 },
  { name: "State Managers", href: "/state-managers", icon: MapPinned },
  { name: "Students", href: "/students", icon: Users },
  { name: "Users", href: "/users", icon: User },
  { name: "Courses", href: "/courses", icon: BookOpen },
  { name: "Products", href: "/products", icon: ShoppingCart },
  { name: "Documents", href: "/documents", icon: FileText },
  { name: "System Logs", href: "/logs", icon: Activity },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Profile", href: "/profile", icon: ShieldCheck },
];

export function AdminSidebar({
  serverRole,
  serverPermissions,
  serverEmail,
  serverIsDeveloper
}: {
  serverRole?: string;
  serverPermissions?: string[];
  serverEmail?: string;
  serverIsDeveloper?: boolean;
} = {}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const pathname = usePathname();
  const [pendingApplications, setPendingApplications] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [pendingWalletRequests, setPendingWalletRequests] = useState(0);
  const [pendingDocumentRequests, setPendingDocumentRequests] = useState(0);

  // Session data passed from server layout
  const [developerEmail, setDeveloperEmail] = useState("");

  // Close mobile drawer on navigation
  useEffect(() => {
    setIsMoreOpen(false);
  }, [pathname]);

  // Fetch developer email securely
  useEffect(() => {
    const fetchDevEmail = async () => {
      try {
        const email = await getDeveloperEmail();
        setDeveloperEmail(email);
      } catch (e) {
        console.error(e);
      }
    };
    fetchDevEmail();
  }, []);

  // Fetch pending applications and orders count periodically
  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const [franchiseCount, ordersResult, walletResult, docRequestsResult] = await Promise.all([
          getPendingFranchiseCount(),
          getPendingOrdersCount(),
          getPendingWalletRequestsCount(),
          getPendingDocumentRequestsCount()
        ]);
        setPendingApplications(franchiseCount);
        if (ordersResult.success && ordersResult.count !== undefined) {
          setPendingOrders(ordersResult.count);
        }
        if (walletResult.success && walletResult.count !== undefined) {
          setPendingWalletRequests(walletResult.count);
        }
        if (docRequestsResult.success && docRequestsResult.count !== undefined) {
          setPendingDocumentRequests(docRequestsResult.count);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchPendingCount();
    const intervalId = setInterval(fetchPendingCount, 30000); // refresh every 30s
    return () => clearInterval(intervalId);
  }, []);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleMore = () => setIsMoreOpen(!isMoreOpen);
  
  const isDeveloper = !!serverIsDeveloper || !!(serverEmail && developerEmail && serverEmail === developerEmail);
  const isManager = serverRole === "SUPER_ADMIN_MANAGER";
  const permissions: string[] = serverPermissions || [];

  const filteredNavItems = navItems.filter(item => {
    // Hide System Logs unless developer
    if (item.name === "System Logs" && !isDeveloper) return false;
    
    // For SUPER_ADMIN_MANAGER, hide if not in permissions array
    if (isManager) {
      // Overview/Dashboard could be mapped to "Overview", so we match exactly
      // If it's Profile, let them see it always? "Profile" isn't in ALL_GLOBAL_PAGES but let's allow it
      const requiresPermission = ["Wallet Economy", "Franchises", "State Managers", "Students", "Users", "Courses", "Products", "Documents", "Settings"];
      if (requiresPermission.includes(item.name)) {
        return permissions.includes(item.name);
      }
    }
    
    return true;
  });

  const mainNavItems = filteredNavItems.slice(0, 4);
  const moreNavItems = filteredNavItems.slice(4);

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
          isCollapsed ? "justify-center" : "px-6 justify-between"
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
                  <ShieldCheck className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-white tracking-tight text-lg whitespace-nowrap">Super Admin</span>
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
          {filteredNavItems.map((item) => {
            const tenant = "super-admin";
            const href = getTenantLink(item.href, tenant, pathname);
            const isActive = isActivePath(pathname, href);
            const Icon = item.icon;
            
            return (
              <Link key={item.href} href={href} className="block w-full">
                <div
                  className={cn(
                    "flex items-center gap-3 transition-all duration-300 group relative overflow-hidden",
                    isActive 
                      ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-[0_8px_20px_-6px_rgba(var(--primary),0.4)]" 
                      : "hover:bg-white/5 hover:text-white text-zinc-400",
                    isCollapsed ? "justify-center h-10 w-10 mx-auto rounded-xl" : "px-3 py-2.5 rounded-xl"
                  )}
                >
                  <Icon className={cn("h-5 w-5 flex-shrink-0 transition-colors", isActive ? "text-primary-foreground" : "group-hover:text-white")} />
                  
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="font-medium whitespace-nowrap flex-1 flex justify-between items-center pr-2"
                    >
                      <span>{item.name}</span>
                      {item.href === "/franchises" && pendingApplications > 0 && (
                        <span className="h-5 min-w-5 px-1.5 bg-amber-500 text-white text-[10px] font-black rounded flex items-center justify-center animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                          {pendingApplications}
                        </span>
                      )}
                      {item.href === "/products" && pendingOrders > 0 && (
                        <span className="h-5 min-w-5 px-1.5 bg-red-500 text-white text-[10px] font-black rounded flex items-center justify-center animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                          {pendingOrders}
                        </span>
                      )}
                      {item.href === "/wallet" && pendingWalletRequests > 0 && (
                        <span className="h-5 min-w-5 px-1.5 bg-emerald-500 text-white text-[10px] font-black rounded flex items-center justify-center animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                          {pendingWalletRequests}
                        </span>
                      )}
                      {item.href === "/students" && pendingDocumentRequests > 0 && (
                        <span className="h-5 min-w-5 px-1.5 bg-blue-500 text-white text-[10px] font-black rounded flex items-center justify-center animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                          {pendingDocumentRequests}
                        </span>
                      )}
                    </motion.span>
                  )}

                  {isActive && (
                    <motion.div
                      layoutId="active-nav"
                      className="absolute -left-1 w-1.5 h-6 bg-white rounded-r-full"
                    />
                  )}

                  {isCollapsed && item.href === "/franchises" && pendingApplications > 0 && (
                    <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)] border-2 border-zinc-950"></div>
                  )}

                  {isCollapsed && item.href === "/products" && pendingOrders > 0 && (
                    <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)] border-2 border-zinc-950"></div>
                  )}

                  {isCollapsed && item.href === "/wallet" && pendingWalletRequests > 0 && (
                    <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)] border-2 border-zinc-950"></div>
                  )}

                  {isCollapsed && item.href === "/students" && pendingDocumentRequests > 0 && (
                    <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)] border-2 border-zinc-950"></div>
                  )}

                  {isCollapsed && (
                    <div className="absolute left-full ml-4 px-2 py-1 bg-zinc-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap border border-white/10 shadow-xl flex items-center gap-2">
                      {item.name}
                      {item.href === "/franchises" && pendingApplications > 0 && (
                        <div className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
                          {pendingApplications}
                        </div>
                      )}
                      {item.href === "/products" && pendingOrders > 0 && (
                        <div className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                          {pendingOrders}
                        </div>
                      )}
                      {item.href === "/wallet" && pendingWalletRequests > 0 && (
                        <div className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-white">
                          {pendingWalletRequests}
                        </div>
                      )}
                      {item.href === "/students" && pendingDocumentRequests > 0 && (
                        <div className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-500 px-1 text-[10px] font-bold text-white">
                          {pendingDocumentRequests}
                        </div>
                      )}
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
          onClick={() => signOut({ callbackUrl: "/" })}
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
            const tenant = "super-admin";
            const href = getTenantLink(item.href, tenant, pathname);
            const isActive = isActivePath(pathname, href);
            
            return (
              <Link key={item.name} href={href} className="flex flex-col items-center gap-1 w-16">
                <div className={cn(
                  "p-2 rounded-xl transition-all duration-300 flex items-center justify-center",
                  isActive ? "bg-primary text-primary-foreground shadow-[0_4px_12px_-4px_rgba(var(--primary),0.5)]" : "text-zinc-400"
                )}>
                  <item.icon className="h-5 w-5" />
                  {item.name === "Franchises" && pendingApplications > 0 && (
                    <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)] border border-zinc-950"></div>
                  )}
                  {item.name === "Students" && pendingDocumentRequests > 0 && (
                    <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)] border border-zinc-950"></div>
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
              {pendingOrders > 0 && (
                <div className="absolute top-1 right-3 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)] border border-zinc-950"></div>
              )}
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
                  const tenant = "super-admin";
                  const href = getTenantLink(item.href, tenant, pathname);
                  const isActive = isActivePath(pathname, href);
                  
                  return (
                    <Link key={item.name} href={href} className="block w-full">
                      <div className={cn(
                        "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300",
                        isActive ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-white/5 text-zinc-300"
                      )}>
                        <item.icon className="h-5 w-5" />
                        <span className="font-medium flex-1 flex justify-between items-center">
                          {item.name}
                          {item.name === "Products" && pendingOrders > 0 && (
                            <span className="h-5 min-w-5 px-1.5 bg-red-500 text-white text-[10px] font-black rounded flex items-center justify-center animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                              {pendingOrders}
                            </span>
                          )}
                          {item.name === "Students" && pendingDocumentRequests > 0 && (
                            <span className="h-5 min-w-5 px-1.5 bg-blue-500 text-white text-[10px] font-black rounded flex items-center justify-center animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                              {pendingDocumentRequests}
                            </span>
                          )}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
              <div className="p-4 border-t border-white/5 bg-zinc-950">
                <div 
                  onClick={() => signOut({ callbackUrl: "/" })}
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
