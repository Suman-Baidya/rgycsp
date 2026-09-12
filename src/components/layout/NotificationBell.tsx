"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Bell, 
  CheckCheck, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  FileText, 
  Wallet, 
  ExternalLink,
  Sparkles,
  BellRing,
  Smartphone,
  RotateCw,
  Building2,
  ShoppingCart,
  Coins,
  ChevronRight,
  GraduationCap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname, useParams } from "next/navigation";
import { toast } from "sonner";
import { registerServiceWorkerAndSubscribe, isPushSubscribed } from "@/lib/push-client";
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  NotificationItem 
} from "@/app/actions/notifications";
import { detectTenant } from "@/lib/routing";

interface NotificationBellProps {
  workspaceId?: string;
  tenant?: string;
  portal?: "super-admin" | "admin" | "student";
  className?: string;
}

export function NotificationBell({ 
  workspaceId, 
  tenant: propTenant, 
  portal: propPortal, 
  className 
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<"all" | "sidebar" | "unread">("all");
  const [isLoading, setIsLoading] = useState(false);
  const [hasPushEnabled, setHasPushEnabled] = useState(false);
  const [isSubscribingPush, setIsSubscribingPush] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  // Smartly detect portal and tenant if not provided
  const detectedPortal: "super-admin" | "admin" | "student" = 
    propPortal || 
    (pathname.startsWith("/super-admin") 
      ? "super-admin" 
      : pathname.includes("/student") 
      ? "student" 
      : "admin");

  const detectedTenant = propTenant || detectTenant(pathname, (params?.tenant as string));

  // Check push subscription state
  useEffect(() => {
    isPushSubscribed().then(setHasPushEnabled).catch(() => {});
  }, []);

  const handleTogglePush = async () => {
    setIsSubscribingPush(true);
    try {
      const res = await registerServiceWorkerAndSubscribe();
      if (res.success) {
        setHasPushEnabled(true);
        toast.success("Mobile push notifications enabled!", {
          description: "You'll now receive alerts for exams, fees, and circulars on your device.",
        });
      } else {
        toast.error("Could not enable push notifications", {
          description: res.error || "Please allow notifications in your browser settings.",
        });
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to register push subscription.");
    } finally {
      setIsSubscribingPush(false);
    }
  };

  // Load notifications
  const loadNotifications = async (showLoadingState = false) => {
    if (showLoadingState) setIsLoading(true);
    try {
      const res = await getNotifications({
        workspaceId,
        portal: detectedPortal,
        tenant: detectedTenant,
      });
      if (res.success && res.notifications) {
        setNotifications(res.notifications);
        setUnreadCount(res.unreadCount);
      }
    } catch (e) {
      console.error("Failed to load notifications:", e);
    } finally {
      if (showLoadingState) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(() => loadNotifications(false), 30000); // 30s live poll
    return () => clearInterval(interval);
  }, [workspaceId, detectedPortal, detectedTenant]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleItemClick = async (item: NotificationItem) => {
    const itemReduction = item.count !== undefined ? item.count : 1;
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - itemReduction));

    if (!item.id.startsWith("sidebar-") && !item.id.startsWith("student-notice-")) {
      await markNotificationAsRead(item.id);
    }

    if (item.link) {
      setIsOpen(false);
      router.push(item.link);
    }
  };

  const handleMarkAllRead = async () => {
    setIsLoading(true);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    await markAllNotificationsAsRead(workspaceId);
    setIsLoading(false);
    toast.success("All notifications marked as read");
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) return "Just now";
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours}h ago`;
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays}d ago`;
      return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    } catch {
      return "Active";
    }
  };

  const getTypeIcon = (item: NotificationItem) => {
    if (item.id === "sidebar-franchise-pending") {
      return <Building2 className="w-4 h-4 text-amber-500" />;
    }
    if (item.id === "sidebar-orders-pending") {
      return <ShoppingCart className="w-4 h-4 text-rose-500" />;
    }
    if (item.id === "sidebar-wallet-pending") {
      return <Coins className="w-4 h-4 text-emerald-500" />;
    }
    if (item.id === "sidebar-docs-pending" || item.id === "sidebar-admissions-pending") {
      return <FileText className="w-4 h-4 text-sky-500" />;
    }
    if (item.id === "sidebar-fees-pending" || item.id === "student-invoice-pending") {
      return <Wallet className="w-4 h-4 text-rose-500" />;
    }
    if (item.id.startsWith("student-notice-")) {
      return <GraduationCap className="w-4 h-4 text-emerald-500" />;
    }

    switch (item.type) {
      case "SUCCESS":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "WARNING":
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "ERROR":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "APPLICATION":
        return <FileText className="w-4 h-4 text-blue-500" />;
      case "FEES":
        return <Wallet className="w-4 h-4 text-purple-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-sky-500" />;
    }
  };

  const sidebarCount = notifications.filter((n) => n.category === "sidebar").length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead;
    if (filter === "sidebar") return n.category === "sidebar";
    return true;
  });

  return (
    <div className={cn("relative inline-block text-left", className)} ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) loadNotifications(false);
        }}
        title="Notifications & Alerts"
        className={cn(
          "relative h-8 w-8 sm:h-9 sm:w-9 rounded-xl flex items-center justify-center transition-all cursor-pointer group",
          isOpen
            ? "bg-slate-200 dark:bg-slate-800 text-foreground"
            : "hover:bg-slate-100 dark:hover:bg-slate-800 text-muted-foreground hover:text-foreground"
        )}
      >
        <Bell className="h-4 w-4 sm:h-4.5 sm:w-4.5 transition-transform group-hover:scale-105" />
        
        {/* Pixel-perfect centered badge */}
        {unreadCount > 0 && (
          <span 
            aria-label={`${unreadCount} unread notifications`}
            className="absolute -top-1 -right-1 z-10 inline-flex items-center justify-center h-4.5 min-w-[18px] px-1 rounded-full bg-rose-500 text-[10px] font-black leading-none text-white ring-2 ring-background tabular-nums shadow-xs select-none pointer-events-none text-center"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-[330px] sm:w-[390px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-3 sm:p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                  Notifications
                </span>
                {unreadCount > 0 ? (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400">
                    {unreadCount} pending
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    Caught up
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    loadNotifications(true);
                  }}
                  title="Refresh notifications"
                  disabled={isLoading}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <RotateCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin text-primary")} />
                </button>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    disabled={isLoading}
                    className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>
            </div>

            {/* Filter Pills */}
            <div className="px-3 pt-2 pb-1.5 flex items-center gap-1 border-b border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                  filter === "all"
                    ? "bg-slate-100 dark:bg-slate-800 text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                All ({notifications.length})
              </button>

              {sidebarCount > 0 && (
                <button
                  type="button"
                  onClick={() => setFilter("sidebar")}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1",
                    filter === "sidebar"
                      ? "bg-slate-100 dark:bg-slate-800 text-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span>Sidebar Alerts</span>
                  <span className="px-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                    {sidebarCount}
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setFilter("unread")}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                  filter === "unread"
                    ? "bg-slate-100 dark:bg-slate-800 text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Unread ({unreadCount})
              </button>
            </div>

            {/* List Content */}
            <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50 custom-scrollbar">
              {filteredNotifications.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center justify-center text-muted-foreground">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center mb-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  </div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">All caught up!</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[220px]">
                    No pending actions or unread notices right now.
                  </p>
                </div>
              ) : (
                filteredNotifications.map((item) => {
                  const isSidebarAlert = item.category === "sidebar";

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className={cn(
                        "p-3 sm:p-3.5 flex items-start gap-3 transition-colors cursor-pointer group text-left relative",
                        !item.isRead
                          ? isSidebarAlert
                            ? "bg-amber-50/40 dark:bg-amber-950/15 hover:bg-amber-50/70 dark:hover:bg-amber-950/25"
                            : "bg-sky-50/30 dark:bg-sky-950/20 hover:bg-sky-50/60 dark:hover:bg-sky-950/30"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      )}
                    >
                      {/* Icon Avatar */}
                      <div className={cn(
                        "p-2 rounded-xl border shadow-2xs shrink-0 mt-0.5 transition-transform group-hover:scale-105",
                        isSidebarAlert 
                          ? "bg-amber-50 dark:bg-amber-950/40 border-amber-200/60 dark:border-amber-900/40"
                          : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700"
                      )}>
                        {getTypeIcon(item)}
                      </div>

                      {/* Text Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {item.title}
                            </span>
                            {item.badgeText && (
                              <span className={cn(
                                "px-1.5 py-0.2 rounded text-[9px] font-bold shrink-0 uppercase tracking-wider",
                                item.badgeColor === "amber"
                                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                                  : item.badgeColor === "rose"
                                  ? "bg-rose-500/15 text-rose-700 dark:text-rose-400"
                                  : item.badgeColor === "emerald"
                                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                                  : item.badgeColor === "sky"
                                  ? "bg-sky-500/15 text-sky-700 dark:text-sky-400"
                                  : "bg-blue-500/15 text-blue-700 dark:text-blue-400"
                              )}>
                                {item.badgeText}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-muted-foreground font-medium shrink-0">
                            {formatTimeAgo(item.createdAt)}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {item.message}
                        </p>

                        {/* Action Link CTA */}
                        {item.link && (
                          <div className="mt-1.5 flex items-center gap-1 text-[10px] font-bold text-primary group-hover:underline">
                            <span>{item.actionText || "View details"}</span>
                            <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                          </div>
                        )}
                      </div>

                      {/* Unread indicator dot */}
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1.5 shadow-xs" />
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer / Push Notifications CTA */}
            <div className="p-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground text-[10px]">
                <span className={cn("w-1.5 h-1.5 rounded-full", hasPushEnabled ? "bg-emerald-500 shadow-xs" : "bg-amber-500")} />
                <span>{hasPushEnabled ? "Push alerts active" : "Push alerts inactive"}</span>
              </div>

              {!hasPushEnabled ? (
                <button
                  type="button"
                  onClick={handleTogglePush}
                  disabled={isSubscribingPush}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary text-primary-foreground text-[10px] font-semibold hover:opacity-90 transition-all cursor-pointer shadow-xs"
                >
                  <BellRing className="w-3 h-3" />
                  <span>{isSubscribingPush ? "Enabling..." : "Enable Push"}</span>
                </button>
              ) : (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <Smartphone className="w-3 h-3" />
                  <span>Device Active</span>
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

