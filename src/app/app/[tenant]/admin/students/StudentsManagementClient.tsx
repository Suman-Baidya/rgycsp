"use client";

import { useState, useEffect, useMemo } from "react";
import { AdminPageHeader } from "@/components/layout/AdminPageHeader";
import { Users, UserCheck, UserX, GraduationCap, LayoutGrid, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatCard } from "@/components/dashboard/StatCard";
import StudentList from "./StudentList";
import BatchManagement from "./BatchManagement";

export default function StudentsManagementClient({ 
  workspaceId, 
  initialStudents = [], 
  batches = [],
  courses = [],
  paymentConfig,
  hasDocumentAuthority
}: { 
  workspaceId: string; 
  initialStudents: any[];
  batches: any[];
  courses: any[];
  paymentConfig: any;
  hasDocumentAuthority?: boolean;
}) {
  const [activeTab, setActiveTab] = useState("registered");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stats = useMemo(() => {
    const total = initialStudents.length;
    const registered = initialStudents.filter((s: any) => s.status === "REGISTERED").length;
    const unregistered = initialStudents.filter((s: any) => s.status === "UNREGISTERED").length;
    const passout = initialStudents.filter((s: any) => s.status === "PASS_OUT").length;
    return { total, registered, unregistered, passout, batchCount: batches.length };
  }, [initialStudents, batches]);

  const tabs = [
    { id: "registered", label: "Active Registered", icon: UserCheck, count: stats.registered },
    { id: "unregistered", label: "Current Unregistered", icon: UserX, count: stats.unregistered },
    { id: "pass_out", label: "Pass Out Students", icon: GraduationCap, count: stats.passout },
    { id: "batches", label: "Batches & Schedules", icon: LayoutGrid, count: stats.batchCount },
  ];

  if (!mounted) return null;

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 w-full mx-auto">
      <AdminPageHeader 
        title="Student Management" 
        description="Manage enrolled students, track registrations, verify documents, and organize batches."
      />

      {/* Metric Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Total Students"
          value={stats.total}
          icon={<Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
        />
        <StatCard
          label="Active Registered"
          value={stats.registered}
          icon={<UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
        />
        <StatCard
          label="Unregistered"
          value={stats.unregistered}
          icon={<UserX className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
        />
        <StatCard
          label="Active Batches"
          value={stats.batchCount}
          icon={<LayoutGrid className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
        />
      </div>

      {/* Standard Horizontal Tabs Pill Container */}
      <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-1.5 p-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-full">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium shrink-0 whitespace-nowrap transition-all",
              activeTab === tab.id
                ? "bg-slate-100 dark:bg-slate-800 text-primary dark:text-white font-semibold shadow-inner"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50"
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
            <span className={cn(
              "ml-1 text-[10px] font-bold px-1.5 py-0.2 rounded-full",
              activeTab === tab.id
                ? "bg-primary/10 text-primary dark:bg-white/10 dark:text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500"
            )}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>
      
      <div className="transition-all duration-300">
        {(activeTab === "unregistered" || activeTab === "registered" || activeTab === "pass_out") && (
          <StudentList 
            workspaceId={workspaceId} 
            initialStudents={initialStudents} 
            batches={batches}
            courses={courses}
            status={activeTab.toUpperCase()}
            hasDocumentAuthority={hasDocumentAuthority}
          />
        )}
        
        {activeTab === "batches" && (
          <BatchManagement 
            workspaceId={workspaceId} 
            batches={batches} 
            courses={courses} 
          />
        )}
      </div>
    </div>
  );
}
