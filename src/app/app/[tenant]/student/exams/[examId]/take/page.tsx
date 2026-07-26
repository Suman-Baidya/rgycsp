import { getWorkspaceByTenant } from "@/lib/workspace";
import { redirect } from "next/navigation";
import { getServerTenantLink } from "@/lib/routing-server";
import { getExamToTake } from "@/app/actions/student-exam";
import LiveExamClient from "@/components/student/LiveExamClient";

export default async function TakeExamPage({
  params
}: {
  params: Promise<{ tenant: string, examId: string }>;
}) {
  const { tenant, examId } = await params;
  const workspace = await getWorkspaceByTenant(tenant);
  
  if (!workspace) redirect(await getServerTenantLink("/", tenant));

  const result = await getExamToTake(examId, workspace.id);

  if (!result.success) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 min-h-[calc(100vh-80px)]">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 p-10 rounded-[2.5rem] shadow-xl text-center space-y-6 border border-border/40">
           <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Access Restricted</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{result.error}</p>
           </div>
           <div className="pt-4 flex flex-col gap-3">
             <a href={`/app/${tenant}/student/exams`} className="w-full">
               <button className="w-full h-12 rounded-xl font-bold border-2">Return to Exams</button>
             </a>
           </div>
        </div>
      </div>
    );
  }

  const workspaceSettings = workspace.siteSettings as any;
  const { exam, studentProfileId } = result.data as any;

  return (
    <LiveExamClient 
      settings={workspaceSettings}
      tenant={tenant}
      exam={exam}
      studentProfileId={studentProfileId}
    />
  );
}
