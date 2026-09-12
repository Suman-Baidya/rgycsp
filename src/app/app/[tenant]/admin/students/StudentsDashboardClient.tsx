"use client";

import { useState } from "react";
import { StudentAdminHeader } from "./StudentAdminHeader";
import StudentList from "./StudentList";
import { AdminApplicationsClient } from "./AdminApplicationsClient";
import AdmissionConfigClient from "./AdmissionConfigClient";

export default function StudentsDashboardClient({ 
  workspaceId, 
  initialStudents, 
  batches, 
  courses,
  applications, 
  config,
  pendingCount 
}: { 
  workspaceId: string;
  initialStudents: any[];
  batches: any[];
  courses: any[];
  applications: any[];
  config: any;
  pendingCount: number;
}) {
  const [activeTab, setActiveTab] = useState("all-students");

  return (
    <div className="p-4 sm:p-6 lg:p-6 space-y-6 max-w-7xl w-full mx-auto">
      <StudentAdminHeader 
        pendingCount={pendingCount} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
      
      <div className="transition-all duration-300">
        {activeTab === "all-students" && (
          <StudentList 
            workspaceId={workspaceId} 
            initialStudents={initialStudents} 
            batches={batches}
            courses={courses}
          />
        )}
        
        {activeTab === "applications" && (
          <AdminApplicationsClient 
            workspaceId={workspaceId} 
            initialData={applications} 
          />
        )}
        
        {activeTab === "admission-config" && (
          <AdmissionConfigClient 
            workspaceId={workspaceId} 
            config={config} 
          />
        )}
      </div>
    </div>
  );
}
