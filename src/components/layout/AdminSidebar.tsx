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
  ShoppingCart,
  BarChart2,
  MessageSquareQuote
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
import { getPendingEnquiriesCount } from "@/app/actions/enquiries";

const navItems = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Visitor Analytics", href: "/analytics", icon: BarChart2 },
  { name: "Enquiries & Leads", href: "/enquiries", icon: MessageSquareQuote },
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
  const [pendingEnquiries, setPendingEnquiries] = useState(0);

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

  // Fetch pending applications, orders, and enquiries count periodically
  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const [franchiseCount, ordersResult, walletResult, docRequestsResult, enquiriesCount] = await Promise.all([
          getPendingFranchiseCount(),
          getPendingOrdersCount(),
          getPendingWalletRequestsCount(),
          getPendingDocumentRequestsCount(),
          getPendingEnquiriesCount()
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
        setPendingEnquiries(enquiriesCount);
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
                <div className="h-10 w-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shadow-sm shrink-0">
                  <ShieldCheck className="h-5.5 w-5.5" />
                </div>
                <span className="font-bold text-white tracking-tight text-base truncate">
                  {isManager ? "Manager Portal" : "Super Admin"}
                </span>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="h-8 w-8 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white shrink-0 transition-colors"
                title="Collapse Sidebar"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        {/* Navigation */}
        <nav className={cn("flex-1 py-3 space-y-1 overflow-y-auto overflow-x-hidden", isCollapsed ? "px-2 scrollbar-hide" : "px-3 custom-scrollbar")}>
          {filteredNavItems.map((item) => {
            const tenant = "super-admin";
            const href = getTenantLink(item.href, tenant, pathname);
            const isActive = isActivePath(pathname, href);
            const Icon = item.icon;
            
            return (
              <Link key={item.href} href={href} className="block w-full">
                <div
                  className={cn(
                    "flex items-center gap-3 transition-all duration-200 group relative overflow-hidden",
                    isActive 
                      ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-[0_4px_16px_rgba(79,70,229,0.35)] font-semibold" 
                      : "hover:bg-white/5 hover:text-white text-zinc-400",
                    isCollapsed ? "justify-center h-10 w-10 mx-auto rounded-xl" : "px-3 py-2.5 rounded-xl"
                  )}
                >
                  <Icon className={cn("h-5 w-5 flex-shrink-0 transition-colors", isActive ? "text-white" : "group-hover:text-white text-zinc-400")} />
                  
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="font-medium whitespace-nowrap flex-1 flex justify-between items-center pr-2"
                    >
                      <span>{item.name}</span>
                      {item.href === "/enquiries" && pendingEnquiries > 0 && (
                        <span className="h-5 min-w-5 px-1.5 bg-red-500 text-white text-[10px] font-black rounded flex items-center justify-center animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                          {pendingEnquiries}
                        </span>
                      )}
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

                  {isCollapsed && item.href === "/enquiries" && pendingEnquiries > 0 && (
                    <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)] border-2 border-zinc-950"></div>
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
                      {item.href === "/enquiries" && pendingEnquiries > 0 && (
                        <div className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                          {pendingEnquiries}
                        </div>
                      )}
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

      {/* Mobile Bottom Navigation (Native App Feeling) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[60] bg-white/85 dark:bg-zinc-950/90 backdrop-blur-xl border-t border-slate-200/80 dark:border-white/10 pb-[max(env(safe-area-inset-bottom),12px)] pt-2 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-around px-2">
          {mainNavItems.map((item) => {
            const tenant = "super-admin";
            const href = getTenantLink(item.href, tenant, pathname);
            const isActive = isActivePath(pathname, href);
            
            return (
              <Link key={item.name} href={href} className="flex flex-col items-center gap-1 w-16">
                <div className={cn(
                  "p-2 rounded-2xl transition-all duration-300 flex items-center justify-center relative",
                  isActive 
                    ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 dark:bg-indigo-500/20 shadow-xs" 
                    : "text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white"
                )}>
                  <item.icon className={cn("h-5 w-5 transition-transform duration-200", isActive && "scale-110")} />
                  {item.name === "Franchises" && pendingApplications > 0 && (
                    <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                  )}
                  {item.name === "Students" && pendingDocumentRequests > 0 && (
                    <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                  )}
                </div>
                <span className={cn(
                  "text-[10px] tracking-tight transition-colors text-center w-full truncate px-1",
                  isActive ? "font-bold text-indigo-600 dark:text-indigo-400" : "font-medium text-slate-500 dark:text-zinc-400"
                )}>
                  {item.name}
                </span>
              </Link>
            );
          })}
          
          <button onClick={toggleMore} className="flex flex-col items-center gap-1 w-16 relative">
            <div className={cn(
              "p-2 rounded-2xl transition-all duration-300 flex items-center justify-center",
              isMoreOpen ? "bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white" : "text-slate-500 dark:text-zinc-400"
            )}>
              <MoreHorizontal className="h-5 w-5" />
              {pendingOrders > 0 && (
                <div className="absolute top-1 right-3 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
              )}
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
                  const tenant = "super-admin";
                  const href = getTenantLink(item.href, tenant, pathname);
                  const isActive = isActivePath(pathname, href);
                  
                  return (
                    <Link key={item.name} href={href} className="block w-full">
                      <div className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                        isActive 
                          ? "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-semibold" 
                          : "hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-zinc-300"
                      )}>
                        <item.icon className="h-5 w-5 shrink-0" />
                        <span className="font-medium text-sm flex-1 flex justify-between items-center">
                          {item.name}
                          {item.name === "Products" && pendingOrders > 0 && (
                            <span className="h-5 min-w-5 px-1.5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse shadow-xs">
                              {pendingOrders}
                            </span>
                          )}
                          {item.name === "Students" && pendingDocumentRequests > 0 && (
                            <span className="h-5 min-w-5 px-1.5 bg-blue-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse shadow-xs">
                              {pendingDocumentRequests}
                            </span>
                          )}
                        </span>
                      </div>
                    </Link>
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
