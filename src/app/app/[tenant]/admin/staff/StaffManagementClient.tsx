"use client";

import { useState, useEffect } from "react";
import { AdminPageHeader } from "@/components/layout/AdminPageHeader";
import { Users, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import StaffList from "./StaffList";

export default function StaffManagementClient({ 
  workspaceId, 
  initialStaff 
}: { 
  workspaceId: string;
  initialStaff: any[];
}) {
  const [activeTab, setActiveTab] = useState("active_staff");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const tabs = [
    { id: "active_staff", label: "Active Staff", icon: Users },
    { id: "roles_permissions", label: "Roles & Permissions", icon: ShieldCheck },
  ];

  if (!mounted) return null;

  return (
    <div className="p-4 lg:p-10 max-w-7xl mx-auto space-y-8 w-full">
      <AdminPageHeader 
        title="Staff & Roles" 
        description="Manage team members, teachers, and configure their access permissions."
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
        {activeTab === "active_staff" && (
          <StaffList 
            workspaceId={workspaceId} 
            initialStaff={initialStaff} 
          />
        )}
        
        {activeTab === "roles_permissions" && (
          <div className="p-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-slate-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold">Permissions Guide</h3>
              <p className="text-slate-500 max-w-sm">Admins have full access. Staff and Teachers can be restricted to specific pages. Edit a staff member to configure their permissions.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
