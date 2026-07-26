import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getExamMeritList } from "@/app/actions/exam";
import Link from "next/link";
import { ChevronLeft, Download, Trophy } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { getServerTenantLink } from "@/lib/routing-server";
import { DownloadMeritListButton } from "./DownloadMeritListButton";

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
  const meritList = meritListRes.success ? meritListRes.data : [];

  return (
    <div className="p-4 lg:p-10 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <Link 
            href={await getServerTenantLink("/admin/exam-generator?tab=online", tenant)}
            className={buttonVariants({ variant: "ghost", size: "icon" }) + " rounded-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 shadow-sm hover:bg-slate-50"}
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Exam Details
            </h1>
            <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
              <Trophy className="w-4 h-4" /> Merit List & Performance
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">Exam Title</h3>
          <p className="text-xl font-bold mt-1 text-slate-900 dark:text-white">{exam.title}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">Duration</h3>
          <p className="text-xl font-bold mt-1 text-slate-900 dark:text-white">{exam.duration || 60} Mins</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">Total Questions</h3>
          <p className="text-xl font-bold mt-1 text-slate-900 dark:text-white">{exam.questions.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">Total Marks</h3>
          <p className="text-xl font-bold mt-1 text-slate-900 dark:text-white">{exam.questions.length * (exam.marksPerQuestion || 1)}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b-2 border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Merit List</h2>
          <DownloadMeritListButton meritList={meritList} examTitle={exam.title} />
        </div>
        
        {meritList.length === 0 ? (
          <div className="p-16 text-center text-slate-500">
            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No results found</h3>
            <p className="mt-1">Students have not taken this exam yet, or no results were published.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50">
                  <th className="p-4 font-bold text-slate-600 dark:text-slate-300">Rank</th>
                  <th className="p-4 font-bold text-slate-600 dark:text-slate-300">Student Name</th>
                  <th className="p-4 font-bold text-slate-600 dark:text-slate-300">Enrollment No</th>
                  <th className="p-4 font-bold text-slate-600 dark:text-slate-300">Marks Obtained</th>
                  <th className="p-4 font-bold text-slate-600 dark:text-slate-300">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-100 dark:divide-slate-800">
                {meritList.map((result: any, index: number) => (
                  <tr key={result.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20">
                    <td className="p-4 font-bold">#{index + 1}</td>
                    <td className="p-4 font-semibold text-slate-900 dark:text-white">{result.student.fullName}</td>
                    <td className="p-4 font-medium text-slate-500">{result.student.enrollmentNo}</td>
                    <td className="p-4 font-bold text-indigo-600">{result.marksObtained}</td>
                    <td className="p-4">
                      {result.isPassed ? (
                        <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">PASSED</span>
                      ) : (
                        <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">FAILED</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
