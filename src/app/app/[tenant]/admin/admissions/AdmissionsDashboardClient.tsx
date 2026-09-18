"use client";

import { useState, useMemo } from "react";
import { AdminPageHeader } from "@/components/layout/AdminPageHeader";
import { UserPlus, FileText, Settings, BarChart, Layers, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AdminApplicationsClient } from "../students/AdminApplicationsClient";
import AdmissionConfigClient from "../students/AdmissionConfigClient";
import ManualEnrollmentTab from "./ManualEnrollmentTab";
import BatchManagement from "../students/BatchManagement";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import AnalyticsTab from "./AnalyticsTab";
import { toast } from "sonner";
import { cleanupRejectedApplications } from "@/app/actions/cleanup";
import { StatCard } from "@/components/dashboard/StatCard";

export default function AdmissionsDashboardClient({
  workspaceId,
  applications = [],
  config,
  pendingCount = 0,
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
  const [editingOnlineApp, setEditingOnlineApp] = useState<any>(null);
  const [confirmCleanup, setConfirmCleanup] = useState(false);

  const draftsCount = useMemo(() => applications.filter(a => a.status === "DRAFT").length, [applications]);
  const approvedCount = useMemo(() => applications.filter(a => a.status === "APPROVED").length, [applications]);

  const handleCleanupClick = () => {
    setConfirmCleanup(true);
  };

  const confirmCleanupAction = async () => {
    setIsCleaning(true);
    const res = await cleanupRejectedApplications(workspaceId);
    setIsCleaning(false);
    setConfirmCleanup(false);
    if (res.success) {
      toast.success(`Cleanup complete. Deleted ${res.count} old applications.`);
    } else {
      toast.error(res.error || "Cleanup failed.");
    }
  };

  const handleEditOnlineApp = (app: any) => {
    setEditingOnlineApp(app);
    setActiveTab("new-admission");
  };

  const tabs = [
    { id: "new-admission", label: "Enroll Student (Manual)", icon: UserPlus, count: draftsCount > 0 ? draftsCount : undefined },
    { id: "applications", label: "Online Applications", icon: FileText, count: pendingCount > 0 ? pendingCount : undefined },
    { id: "analytics", label: "Analytics & Reports", icon: BarChart },
    { id: "batches", label: "Batch Creation", icon: Layers, count: batches.length > 0 ? batches.length : undefined },
    { id: "form-config", label: "Form Settings", icon: Settings },
  ];

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 w-full mx-auto">
      <AdminPageHeader 
        title="Student Admissions" 
        description="Manage student admissions, process online applications, and configure forms."
      >
        <Button 
          onClick={handleCleanupClick} 
          disabled={isCleaning} 
          variant="outline" 
          className="h-8 sm:h-9 px-3 rounded-lg text-xs font-semibold gap-1.5 border-red-200 dark:border-red-900/40 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
        >
          <Trash2 className="w-3.5 h-3.5" />
          {isCleaning ? "Cleaning..." : "Cleanup Rejected Forms"}
        </Button>
      </AdminPageHeader>

      {/* Top Metric Cards Grid (Rule 7.2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Pending Applications"
          value={pendingCount}
          description={pendingCount > 0 ? "Awaiting verification" : "All applications reviewed"}
          icon={<AlertCircle className="h-5 w-5 text-amber-500" />}
          color={pendingCount > 0 ? "#f59e0b" : undefined}
          isActive={activeTab === "applications"}
          onClick={() => setActiveTab("applications")}
        />

        <StatCard
          label="Manual Drafts"
          value={draftsCount}
          description="Incomplete enrollments"
          icon={<UserPlus className="h-5 w-5 text-blue-500" />}
          isActive={activeTab === "new-admission"}
          onClick={() => setActiveTab("new-admission")}
        />

        <StatCard
          label="Approved Admissions"
          value={approvedCount}
          description="Enrolled this session"
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />}
          color={approvedCount > 0 ? "#10b981" : undefined}
          isActive={activeTab === "analytics"}
          onClick={() => setActiveTab("analytics")}
        />

        <StatCard
          label="Active Batches"
          value={batches.length}
          description="Available for assignment"
          icon={<Layers className="h-5 w-5 text-indigo-500" />}
          isActive={activeTab === "batches"}
          onClick={() => setActiveTab("batches")}
        />
      </div>

      {/* Sub Tabs Pill Navigation (Rule 7.3) */}
      <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-1.5 p-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-full">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
               setActiveTab(tab.id);
               if (tab.id !== "new-admission") setEditingOnlineApp(null);
            }}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs transition-all duration-150 whitespace-nowrap shrink-0",
              activeTab === tab.id
                ? "bg-slate-100 dark:bg-slate-800 text-primary dark:text-white font-semibold shadow-inner"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50 font-medium"
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={cn(
                "flex items-center justify-center min-w-[1.15rem] h-4 px-1 rounded text-[9px] font-bold",
                tab.id === "applications" && pendingCount > 0 ? "bg-amber-500 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
              )}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="transition-all duration-300">
        {activeTab === "new-admission" && (
          <ManualEnrollmentTab 
            workspaceId={workspaceId}
            courses={courses}
            batches={batches}
            drafts={applications.filter(a => a.status === "DRAFT")}
            editingOnlineApp={editingOnlineApp}
            onCancelEdit={() => {
              setEditingOnlineApp(null);
              setActiveTab("applications");
            }}
          />
        )}

        {activeTab === "applications" && (
          <AdminApplicationsClient 
            workspaceId={workspaceId} 
            initialData={applications} 
            batches={batches}
            courses={courses}
            onEditOnlineApp={handleEditOnlineApp}
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
          <BatchManagement workspaceId={workspaceId} courses={courses} batches={batches} />
        )}
      </div>
      
      <ConfirmDialog 
        open={confirmCleanup} 
        onOpenChange={setConfirmCleanup}
        title="Cleanup Rejected Applications"
        description="Are you sure you want to permanently delete all rejected applications older than 30 days? This action cannot be undone."
        onConfirm={confirmCleanupAction}
        confirmText="Yes, delete them"
        destructive={true}
      />
    </div>
  );
}
