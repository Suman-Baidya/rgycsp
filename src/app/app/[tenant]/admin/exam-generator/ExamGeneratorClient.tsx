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

import { useSearchParams } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";

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
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as any) || "question";
  
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"question" | "online" | "offline" | "result" | "admit">(initialTab);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const totalQuestions = chapters.reduce((sum, c) => sum + (c._count?.questions ?? c.questions?.length ?? 0), 0);
  const onlineExamsCount = exams.filter(e => e.type === "ONLINE").length;
  const offlineExamsCount = exams.filter(e => e.type === "OFFLINE").length;

  const tabs = [
    { id: "question", label: "Question Papers", icon: FileText, count: totalQuestions },
    { id: "online", label: "Online Exam", icon: Globe, count: onlineExamsCount },
    { id: "offline", label: "Offline Exam", icon: PenTool, count: offlineExamsCount },
    { id: "result", label: "Students Result", icon: ClipboardList },
    { id: "admit", label: "Admit Card", icon: GraduationCap },
  ];

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 w-full mx-auto">
      <AdminPageHeader
        title="Exam Zone"
        description="Manage AI question banks, conduct online & offline exams, issue admit cards, and publish student results."
      >
        <div className="flex items-center gap-2 bg-amber-500/10 dark:bg-amber-500/15 px-3 py-1.5 rounded-xl border border-amber-500/20 shadow-xs">
          <Coins className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[9px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">Available Tokens</span>
            <span className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200">{workspaceTokens} AI Tokens</span>
          </div>
        </div>
      </AdminPageHeader>

      {/* Metric / Stat Cards Grid (Rule 7.2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border border-slate-100 dark:border-white/5 shadow-xs rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
              <Coins className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">AI Tokens Balance</p>
              <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{workspaceTokens}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-100 dark:border-white/5 shadow-xs rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">Questions Bank</p>
              <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{totalQuestions}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-100 dark:border-white/5 shadow-xs rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">Scheduled Exams</p>
              <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{exams.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-100 dark:border-white/5 shadow-xs rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">Enrolled Students</p>
              <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{students.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Horizontal Navigation Tabs (Rule 7.3) */}
      <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-1.5 p-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs max-w-full">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium shrink-0 whitespace-nowrap transition-all",
              activeTab === tab.id
                ? "bg-slate-100 dark:bg-slate-800 text-primary dark:text-white font-semibold shadow-inner"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50"
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        {activeTab === "question" && <QuestionPapersTab workspaceId={workspaceId} workspaceTokens={workspaceTokens} courses={courses} chapters={chapters} />}
        {activeTab === "online" && <OnlineExamTab workspaceId={workspaceId} exams={exams.filter(e => e.type === "ONLINE")} />}
        {activeTab === "offline" && <OfflineExamTab workspaceId={workspaceId} workspace={workspace} superAdminName={superAdminName} courses={courses} exams={exams} students={students} />}
        {activeTab === "result" && <StudentsResultTab students={students} courses={courses} batches={batches} />}
        {activeTab === "admit" && <AdmitCardTab students={students} courses={courses} batches={batches} exams={exams} />}
      </div>
    </div>
  );
}
