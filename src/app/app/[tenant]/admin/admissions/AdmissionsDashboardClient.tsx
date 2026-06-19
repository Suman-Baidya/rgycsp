"use client";

import { useState } from "react";
import { AdminPageHeader } from "@/components/layout/AdminPageHeader";
import { UserPlus, FileText, Settings, Database, BarChart, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AdminApplicationsClient } from "../students/AdminApplicationsClient";
import AdmissionConfigClient from "../students/AdmissionConfigClient";
import ManualEnrollmentTab from "./ManualEnrollmentTab";
import BatchManagement from "../students/BatchManagement";
import AnalyticsTab from "./AnalyticsTab";
import { toast } from "sonner";
import { cleanupRejectedApplications } from "@/app/actions/cleanup";

export default function AdmissionsDashboardClient({
  workspaceId,
  applications,
  config,
  pendingCount,
  courses = [],
  batches = []
}: {
  workspaceId: string;
  applications: any[];
  config: any;
  pendingCount: number;
  courses?: any[];
  batches?: any[];
}) {
  const [activeTab, setActiveTab] = useState("applications");
  const [isCleaning, setIsCleaning] = useState(false);

  const handleCleanup = async () => {
    if (!window.confirm("Are you sure you want to permanently delete rejected applications older than 30 days?")) return;
    setIsCleaning(true);
    const res = await cleanupRejectedApplications(workspaceId);
    setIsCleaning(false);
    if (res.success) {
      toast.success(`Cleanup complete. Deleted ${res.count} old applications.`);
    } else {
      toast.error(res.error || "Cleanup failed.");
    }
  };

  const tabs = [
    { id: "new-admission", label: "Enroll Student (Manual)", icon: UserPlus },
    { id: "applications", label: "Online Applications", icon: FileText, count: pendingCount },
    { id: "analytics", label: "Analytics & Reports", icon: BarChart },
    { id: "batches", label: "Batch Creation", icon: Layers },
    { id: "form-config", label: "Form Settings", icon: Settings },
  ];

  return (
    <div className="p-4 lg:p-10 max-w-7xl mx-auto space-y-8">
      <AdminPageHeader 
        title="Student Admissions" 
        description="Manage new enrollments, process applications, and configure admission form."
      >
        <Button onClick={handleCleanup} disabled={isCleaning} variant="destructive" className="rounded-xl h-9 text-xs">
          {isCleaning ? "Cleaning..." : "Cleanup Rejected Forms"}
        </Button>
      </AdminPageHeader>

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
            {tab.count !== undefined && tab.count > 0 && (
              <span className="flex items-center justify-center min-w-[1.4rem] h-5 px-1.5 bg-primary text-white rounded-lg text-[10px] font-bold shadow-sm">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="transition-all duration-300">
        {activeTab === "new-admission" && (
          <ManualEnrollmentTab 
            workspaceId={workspaceId}
            courses={courses}
            batches={batches}
          />
        )}

        {activeTab === "applications" && (
          <AdminApplicationsClient 
            workspaceId={workspaceId} 
            initialData={applications} 
            batches={batches}
          />
        )}

        {activeTab === "form-config" && (
          <AdmissionConfigClient 
            workspaceId={workspaceId} 
            config={config} 
          />
        )}

        {activeTab === "analytics" && (
          <AnalyticsTab workspaceId={workspaceId} applications={applications} />
        )}

        {activeTab === "batches" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
             <BatchManagement workspaceId={workspaceId} courses={courses} batches={batches} />
          </div>
        )}
      </div>
    </div>
  );
}
