"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Plus, 
  X, 
  UserPlus, 
  CalendarCheck, 
  Wallet, 
  GraduationCap, 
  FileText, 
  Building2, 
  Terminal,
  QrCode
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { getTenantLink } from "@/lib/routing";

interface QuickActionFABProps {
  portal: "student" | "admin" | "super-admin";
  tenant?: string;
  workspaceBase?: string;
}

export function QuickActionFAB({ portal, tenant = "", workspaceBase = "" }: QuickActionFABProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const fabRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (fabRef.current && !fabRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const studentActions = [
    {
      label: "My ID Card",
      href: getTenantLink("/student/profile", tenant, pathname),
      icon: GraduationCap,
      color: "bg-emerald-600 text-white",
    },
    {
      label: "Admit Card / Exams",
      href: getTenantLink("/student/exams", tenant, pathname),
      icon: FileText,
      color: "bg-blue-600 text-white",
    },
    {
      label: "Fee Receipts / Dues",
      href: getTenantLink("/student/fees", tenant, pathname),
      icon: Wallet,
      color: "bg-amber-600 text-white",
    },
  ];

  const adminActions = [
    {
      label: "New Admission",
      href: getTenantLink("/admin/students", tenant, pathname),
      icon: UserPlus,
      color: "bg-sky-600 text-white",
    },
    {
      label: "Daily Attendance",
      href: getTenantLink("/admin/attendance", tenant, pathname),
      icon: CalendarCheck,
      color: "bg-emerald-600 text-white",
    },
    {
      label: "Fee Collection",
      href: getTenantLink("/admin/fees", tenant, pathname),
      icon: Wallet,
      color: "bg-purple-600 text-white",
    },
  ];

  const superAdminActions = [
    {
      label: "Franchises",
      href: "/super-admin/franchises",
      icon: Building2,
      color: "bg-indigo-600 text-white",
    },
    {
      label: "Students",
      href: "/super-admin/students",
      icon: UserPlus,
      color: "bg-blue-600 text-white",
    },
    {
      label: "System Logs",
      href: "/super-admin/logs",
      icon: Terminal,
      color: "bg-zinc-800 text-white",
    },
  ];

  const actions = portal === "student" 
    ? studentActions 
    : portal === "admin" 
    ? adminActions 
    : superAdminActions;

  return (
    <div className="lg:hidden fixed bottom-20 right-4 z-40" ref={fabRef}>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-2xs -z-10"
          />
        )}
      </AnimatePresence>

      {/* Floating Action Menu List */}
      <AnimatePresence>
        {isOpen && (
          <div className="flex flex-col items-end gap-2.5 mb-3">
            {actions.map((action, idx) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, y: 15, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.9 }}
                transition={{ duration: 0.18, delay: (actions.length - 1 - idx) * 0.04 }}
              >
                <Link
                  href={action.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 group cursor-pointer"
                >
                  <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold text-xs shadow-md">
                    {action.label}
                  </span>
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 group-active:scale-95", action.color)}>
                    <action.icon className="w-5 h-5" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Main Trigger Button */}
      <motion.button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        whileTap={{ scale: 0.92 }}
        className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-colors cursor-pointer text-white",
          isOpen
            ? "bg-slate-800 dark:bg-slate-700"
            : portal === "student"
            ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30"
            : portal === "admin"
            ? "bg-sky-600 hover:bg-sky-500 shadow-sky-600/30"
            : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30"
        )}
        title="Quick Actions"
      >
        <motion.div
          animate={{ rotate: isOpen ? 135 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <Plus className="w-6 h-6" />
        </motion.div>
      </motion.button>
    </div>
  );
}
