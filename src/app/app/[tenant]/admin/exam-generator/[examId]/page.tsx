import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getExamMeritList } from "@/app/actions/exam";
import Link from "next/link";
import { ChevronLeft, Download, Trophy } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { getServerTenantLink } from "@/lib/routing-server";
import { DownloadMeritListButton } from "./DownloadMeritListButton";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function ExamDetailsPage({
  params
}: {
  params: Promise<{ tenant: string, examId: string }>;
}) {
  const { tenant, examId } = await params;
  
  const normalizedTenant = tenant?.toLowerCase();

  const workspace = await db.workspace.findUnique({
    where: { subdomain: normalizedTenant }
  });

  if (!workspace) notFound();

  const exam = await db.exam.findUnique({
    where: { id: examId, workspaceId: workspace.id },
    include: {
      course: true,
      questions: true
    }
  });

  if (!exam) notFound();

  const meritListRes = await getExamMeritList(exam.id);
  const meritList = (meritListRes.success && meritListRes.data ? meritListRes.data : []) as any[];

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 w-full mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <Link 
            href={await getServerTenantLink("/admin/exam-generator?tab=online", tenant)}
            className={buttonVariants({ variant: "ghost", size: "icon" }) + " h-8 w-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:bg-slate-50 text-slate-600 dark:text-slate-300"}
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {exam.title}
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
              <Trophy className="w-3.5 h-3.5 text-amber-500" /> Merit List & Performance
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-3.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">Course</p>
            <p className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white truncate">{exam.course?.title || "General"}</p>
          </CardContent>
        </Card>
        <Card className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-3.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">Duration</p>
            <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{exam.duration || 60} <span className="text-xs font-semibold text-slate-400">Mins</span></p>
          </CardContent>
        </Card>
        <Card className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-3.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">Total Questions</p>
            <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{exam.questions.length}</p>
          </CardContent>
        </Card>
        <Card className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-3.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">Total Marks</p>
            <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{exam.questions.length * (exam.marksPerQuestion || 1)}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-slate-900">
        <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Student Merit List</h2>
          <DownloadMeritListButton meritList={meritList} examTitle={exam.title} />
        </div>
        
        {meritList.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Trophy className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No results found</h3>
            <p className="text-xs mt-1 text-slate-400">Students have not taken this exam yet, or no results were published.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/75 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-500">
                  <th className="p-3 font-bold">Rank</th>
                  <th className="p-3 font-bold">Student Name</th>
                  <th className="p-3 font-bold">Enrollment No</th>
                  <th className="p-3 font-bold">Marks Obtained</th>
                  <th className="p-3 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {meritList.map((result: any, index: number) => (
                  <tr key={result.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">#{index + 1}</td>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">{result.student.fullName}</td>
                    <td className="p-3 font-medium text-slate-500 font-mono text-[11px]">{result.student.enrollmentNo}</td>
                    <td className="p-3 font-bold text-primary">{result.marksObtained}</td>
                    <td className="p-3">
                      {result.isPassed ? (
                        <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-none text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">PASSED</Badge>
                      ) : (
                        <Badge className="bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-none text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">FAILED</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
