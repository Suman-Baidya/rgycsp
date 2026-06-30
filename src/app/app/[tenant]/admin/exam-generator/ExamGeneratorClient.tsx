"use client";

import { useState, useEffect } from "react";
import { AdminPageHeader } from "@/components/layout/AdminPageHeader";
import { Coins, FileText, Globe, PenTool, ClipboardList, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

import OnlineExamTab from "./OnlineExamTab";
import QuestionPapersTab from "./QuestionPapersTab";
import OfflineExamTab from "./OfflineExamTab";
import StudentsResultTab from "./StudentsResultTab";
import AdmitCardTab from "./AdmitCardTab";

export default function ExamGeneratorClient({
  workspaceId,
  workspaceTokens,
  workspace,
  superAdminName,
  exams,
  courses,
  batches,
  students,
  chapters
}: {
  workspaceId: string;
  workspaceTokens: number;
  workspace?: any;
  superAdminName?: string;
  exams: any[];
  courses: any[];
  batches: any[];
  students: any[];
  chapters: any[];
}) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"question" | "online" | "offline" | "result" | "admit">("question");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const tabs = [
    { id: "question", label: "Question Papers", icon: FileText },
    { id: "online", label: "Online Exam", icon: Globe },
    { id: "offline", label: "Offline Exam", icon: PenTool },
    { id: "result", label: "Students Result", icon: ClipboardList },
    { id: "admit", label: "Admit Card", icon: GraduationCap },
  ];

  return (
    <div className="p-4 lg:p-10 max-w-7xl mx-auto space-y-10">
      <AdminPageHeader
        title="Examination Suite"
        description="Manage everything from generating question papers to scheduling exams, processing results, and printing admit cards."
      >
        <div className="flex items-center gap-4 bg-primary/5 dark:bg-primary/10 px-6 py-3 rounded-2xl border border-primary/10 shadow-sm animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Available Balance</span>
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-500" />
              <span className="text-xl font-black text-primary">{workspaceTokens} Tokens</span>
            </div>
          </div>
        </div>
      </AdminPageHeader>

      {/* Tabs */}
      <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-2 p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-full">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
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

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === "question" && <QuestionPapersTab workspaceId={workspaceId} workspaceTokens={workspaceTokens} courses={courses} chapters={chapters} />}
        {activeTab === "online" && <OnlineExamTab />}
        {activeTab === "offline" && <OfflineExamTab workspaceId={workspaceId} workspace={workspace} superAdminName={superAdminName} courses={courses} exams={exams} students={students} />}
        {activeTab === "result" && <StudentsResultTab students={students} courses={courses} batches={batches} />}
        {activeTab === "admit" && <AdmitCardTab students={students} courses={courses} batches={batches} exams={exams} />}
      </div>
    </div>
  );
}
