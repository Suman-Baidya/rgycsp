"use client";

import { useState, useEffect } from "react";
import { AdminPageHeader } from "@/components/layout/AdminPageHeader";
import { User, UserCheck, GraduationCap, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import StudentList from "./StudentList";
import BatchManagement from "./BatchManagement";

export default function StudentsManagementClient({ 
  workspaceId, 
  initialStudents, 
  batches,
  courses,
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

  const tabs = [
    { id: "unregistered", label: "Current Unregistered", icon: User },
    { id: "registered", label: "Active Registered", icon: UserCheck },
    { id: "pass_out", label: "Pass Out Students", icon: GraduationCap },
    { id: "batches", label: "Batches & Schedules", icon: LayoutGrid },
  ];

  if (!mounted) return null;

  return (
    <div className="p-4 lg:p-10 max-w-7xl mx-auto space-y-8 w-full">
      <AdminPageHeader 
        title="Student Management" 
        description="Manage your enrolled students, organize them into batches, and track fee payments."
      />

      <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-2 p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-full">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap shrink-0",
              activeTab === tab.id
                ? "bg-slate-100 dark:bg-slate-800 text-primary shadow-inner"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
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
