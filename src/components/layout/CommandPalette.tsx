"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  Search, 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Calendar, 
  Wallet, 
  Bell, 
  User, 
  FileText, 
  Settings, 
  ShieldCheck, 
  Building2, 
  Terminal, 
  LogOut, 
  Moon, 
  Sun,
  Laptop,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Keyboard,
  X,
  Command as CommandIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { getTenantLink } from "@/lib/routing";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import { createPortal } from "react-dom";

interface CommandItem {
  id: string;
  title: string;
  category: "Navigation" | "Quick Actions" | "System";
  icon: React.ElementType;
  href?: string;
  action?: () => void;
  shortcut?: string;
}

interface CommandPaletteProps {
  portal: "student" | "admin" | "super-admin";
  tenant?: string;
}

export function CommandPalette({ portal, tenant = "" }: CommandPaletteProps) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { setTheme, theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Listen for Global Custom Event, Ctrl+K / Cmd+K, or ? for shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        if (isOpen) setIsOpen(false);
        if (isShortcutsOpen) setIsShortcutsOpen(false);
      } else if (e.key === "?" && !isOpen && !isShortcutsOpen) {
        // Only trigger if activeElement is not an input, textarea or contenteditable
        const tag = (document.activeElement?.tagName || "").toLowerCase();
        if (tag !== "input" && tag !== "textarea" && !(document.activeElement as HTMLElement)?.isContentEditable) {
          e.preventDefault();
          setIsShortcutsOpen(true);
        }
      }
    };

    const handleCustomOpen = () => setIsOpen(true);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-command-palette", handleCustomOpen);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-command-palette", handleCustomOpen);
    };
  }, [isOpen, isShortcutsOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Command items per portal
  const items: CommandItem[] = useMemo(() => {
    const commonActions: CommandItem[] = [
      {
        id: "theme-toggle",
        title: theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode",
        category: "Quick Actions",
        icon: theme === "dark" ? Sun : Moon,
        action: () => setTheme(theme === "dark" ? "light" : "dark"),
        shortcut: "Theme",
      },
      {
        id: "shortcuts-modal",
        title: "Keyboard Shortcuts Cheatsheet",
        category: "Quick Actions",
        icon: Keyboard,
        action: () => {
          setIsOpen(false);
          setIsShortcutsOpen(true);
        },
        shortcut: "?",
      },
      {
        id: "logout",
        title: "Log out of Account",
        category: "System",
        icon: LogOut,
        action: async () => {
          const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
          const protocol = typeof window !== "undefined" && window.location.hostname.includes("localhost") ? "http" : "https";
          await signOut({ redirect: false });
          window.location.href = `${protocol}://${rootDomain}/`;
        },
        shortcut: "Exit",
      },
    ];

    if (portal === "student") {
      return [
        {
          id: "student-dashboard",
          title: "Dashboard Overview",
          category: "Navigation",
          icon: LayoutDashboard,
          href: getTenantLink("/student/dashboard", tenant, pathname),
        },
        {
          id: "student-courses",
          title: "My Enrolled Courses",
          category: "Navigation",
          icon: BookOpen,
          href: getTenantLink("/student/courses", tenant, pathname),
        },
        {
          id: "student-attendance",
          title: "Attendance Record",
          category: "Navigation",
          icon: Calendar,
          href: getTenantLink("/student/attendance", tenant, pathname),
        },
        {
          id: "student-exams",
          title: "Examinations & Admit Cards",
          category: "Navigation",
          icon: FileText,
          href: getTenantLink("/student/exams", tenant, pathname),
        },
        {
          id: "student-fees",
          title: "Fee Invoices & Payments",
          category: "Navigation",
          icon: Wallet,
          href: getTenantLink("/student/fees", tenant, pathname),
        },
        {
          id: "student-notices",
          title: "Notices & Announcements",
          category: "Navigation",
          icon: Bell,
          href: getTenantLink("/student/notices", tenant, pathname),
        },
        {
          id: "student-profile",
          title: "My Profile & ID Card",
          category: "Navigation",
          icon: User,
          href: getTenantLink("/student/profile", tenant, pathname),
        },
        ...commonActions,
      ];
    }

    if (portal === "admin") {
      return [
        {
          id: "admin-overview",
          title: "Institute Overview",
          category: "Navigation",
          icon: LayoutDashboard,
          href: getTenantLink("/admin", tenant, pathname),
        },
        {
          id: "admin-admissions",
          title: "Student Admissions & Applications",
          category: "Navigation",
          icon: Users,
          href: getTenantLink("/admin/students", tenant, pathname),
        },
        {
          id: "admin-attendance",
          title: "Attendance Management",
          category: "Navigation",
          icon: Calendar,
          href: getTenantLink("/admin/attendance", tenant, pathname),
        },
        {
          id: "admin-fees",
          title: "Fee Collection & Invoices",
          category: "Navigation",
          icon: Wallet,
          href: getTenantLink("/admin/fees", tenant, pathname),
        },
        {
          id: "admin-courses",
          title: "Courses & Syllabus",
          category: "Navigation",
          icon: BookOpen,
          href: getTenantLink("/admin/courses", tenant, pathname),
        },
        {
          id: "admin-wallet",
          title: "Franchise Wallet & Recharge",
          category: "Navigation",
          icon: Wallet,
          href: getTenantLink("/admin/wallet", tenant, pathname),
        },
        {
          id: "admin-settings",
          title: "Center Site Settings",
          category: "Navigation",
          icon: Settings,
          href: getTenantLink("/admin/settings", tenant, pathname),
        },
        {
          id: "admin-profile",
          title: "Admin Profile",
          category: "Navigation",
          icon: User,
          href: getTenantLink("/admin/profile", tenant, pathname),
        },
        ...commonActions,
      ];
    }

    // Super Admin
    return [
      {
        id: "sa-overview",
        title: "Platform Overview",
        category: "Navigation",
        icon: LayoutDashboard,
        href: "/super-admin",
      },
      {
        id: "sa-franchises",
        title: "Franchise Directory & Approvals",
        category: "Navigation",
        icon: Building2,
        href: "/super-admin/franchises",
      },
      {
        id: "sa-students",
        title: "Global Students Registry",
        category: "Navigation",
        icon: Users,
        href: "/super-admin/students",
      },
      {
        id: "sa-courses",
        title: "Global Curriculum & Courses",
        category: "Navigation",
        icon: BookOpen,
        href: "/super-admin/courses",
      },
      {
        id: "sa-wallet",
        title: "Token Economy & Top-ups",
        category: "Navigation",
        icon: Wallet,
        href: "/super-admin/token-economy",
      },
      {
        id: "sa-logs",
        title: "System Audit Logs",
        category: "Navigation",
        icon: Terminal,
        href: "/super-admin/logs",
      },
      {
        id: "sa-settings",
        title: "Platform Settings",
        category: "Navigation",
        icon: Settings,
        href: "/super-admin/settings",
      },
      ...commonActions,
    ];
  }, [portal, tenant, pathname, theme, setTheme]);

  // Filter items
  const filteredItems = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [items, query]);

  // Keyboard navigation within list
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const current = filteredItems[selectedIndex];
      if (current) {
        executeItem(current);
      }
    }
  };

  const executeItem = (item: CommandItem) => {
    setIsOpen(false);
    if (item.action) {
      item.action();
    } else if (item.href) {
      router.push(item.href);
    }
  };

  if (!mounted || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <>
      {/* Dialog Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[10vh] sm:pt-[12vh] px-4 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 my-auto sm:my-0"
            >
              {/* Search Bar Input */}
              <div className="flex items-center px-4 border-b border-slate-100 dark:border-slate-800">
                <Search className="w-4 h-4 text-slate-400 shrink-0 mr-3" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={`Search ${portal === "student" ? "learning modules" : "dashboard"} or jump to...`}
                  className="w-full h-13 bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                />
                <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 select-none">
                  ESC
                </kbd>
              </div>

              {/* Filtered List */}
              <div
                ref={listRef}
                className="max-h-[340px] overflow-y-auto p-2 space-y-1 custom-scrollbar"
              >
                {filteredItems.length === 0 ? (
                  <div className="py-10 text-center text-slate-400">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No results found</p>
                    <p className="text-[11px] mt-0.5">Try searching for courses, notices, or actions.</p>
                  </div>
                ) : (
                  filteredItems.map((item, index) => {
                    const isSelected = index === selectedIndex;
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.id}
                        onClick={() => executeItem(item)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={cn(
                          "flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer group",
                          isSelected
                            ? "bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-white font-semibold ring-1 ring-slate-200/80 dark:ring-slate-700/80 shadow-xs"
                            : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Icon className={cn("w-4 h-4 shrink-0 transition-colors", isSelected ? "text-primary" : "text-slate-400 dark:text-slate-500 group-hover:text-primary")} />
                          <span className="truncate">{item.title}</span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className={cn(
                            "text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md font-mono transition-colors",
                            isSelected
                              ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-bold"
                              : "text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 group-hover:bg-slate-200/80 dark:group-hover:bg-slate-700/80 group-hover:text-slate-800 dark:group-hover:text-slate-200 font-medium"
                          )}>
                            {item.category}
                          </span>
                          {isSelected && <ArrowRight className="w-3.5 h-3.5 text-primary shrink-0" />}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Bottom Footer */}
              <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 select-none">
                <div className="flex items-center gap-3">
                  <span><strong className="font-semibold text-slate-700 dark:text-slate-200">↑↓</strong> Navigate</span>
                  <span><strong className="font-semibold text-slate-700 dark:text-slate-200">↵</strong> Select</span>
                  <span><strong className="font-semibold text-slate-700 dark:text-slate-200">ESC</strong> Close</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setIsShortcutsOpen(true);
                  }}
                  className="text-[10px] font-mono text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Keyboard className="w-3 h-3" />
                  <span>Shortcuts (?)</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Keyboard Shortcuts Cheatsheet Modal */}
      <AnimatePresence>
        {isShortcutsOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsShortcutsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative w-full max-w-md my-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 sticky top-0 z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Keyboard className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-none">
                      Keyboard Shortcuts
                    </h3>
                    <p className="text-[10px] text-slate-500 font-medium mt-1">
                      Navigate the dashboard without lifting your fingers
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsShortcutsOpen(false)}
                  className="h-7 w-7 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Shortcuts List */}
              <div className="p-3.5 sm:p-4 space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {[
                  { desc: "Open Command Palette / Quick Search", keys: ["Ctrl", "K"] },
                  { desc: "Open Shortcuts Cheatsheet", keys: ["?"] },
                  { desc: "Close Modals / Overlays / Menus", keys: ["Esc"] },
                  { desc: "Navigate List Items", keys: ["↑", "↓"] },
                  { desc: "Execute Selected Action", keys: ["↵ Enter"] },
                  { desc: "Quick Tab Navigation", keys: ["Tab"] },
                ].map((sc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs"
                  >
                    <span className="text-slate-700 dark:text-slate-200 font-medium">
                      {sc.desc}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0 ml-3">
                      {sc.keys.map((k, kidx) => (
                        <kbd
                          key={kidx}
                          className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-mono font-bold text-[10px] border border-slate-200 dark:border-slate-600 shadow-2xs"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-center">
                <span className="text-[11px] text-slate-400 font-medium">
                  Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold font-mono text-[10px]">Esc</kbd> anytime to close
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>,
    document.body
  );
}

/**
 * Visual trigger button for headers that dispatches the command palette event.
 */
export function CommandSearchButton({ className }: { className?: string }) {
  const handleClick = () => {
    window.dispatchEvent(new CustomEvent("open-command-palette"));
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title="Quick search (Ctrl+K)"
      className={cn(
        "flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/50 hover:bg-slate-200/70 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/50 text-muted-foreground hover:text-foreground text-xs font-medium transition-all cursor-pointer group",
        className
      )}
    >
      <Search className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
      <span className="hidden md:inline-block text-[11px]">Quick search...</span>
      <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-white dark:bg-slate-900 text-muted-foreground border border-slate-200 dark:border-slate-700">
        ⌘K
      </kbd>
    </button>
  );
}
