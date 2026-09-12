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
    <div className="space-y-4 sm:space-y-5 pb-8 w-full mx-auto">
      <AdminPageHeader 
        title="Staff & Roles" 
        description="Manage team members, teachers, and configure their access permissions."
      />

      <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-1 p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-full">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all duration-150 whitespace-nowrap shrink-0",
              activeTab === tab.id
                ? "bg-slate-100 dark:bg-slate-800 text-primary font-semibold shadow-inner"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50 font-medium"
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
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
