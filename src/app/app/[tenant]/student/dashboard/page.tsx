import { getStudentProfile } from "@/app/actions/student";
import { getWorkspaceByTenant } from "@/lib/workspace";
import StudentDashboardClient from "@/components/student/StudentDashboardClient";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Link from "next/link";

export default async function StudentDashboardPage({
  params
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  const workspace = await getWorkspaceByTenant(tenant);
  
  if (!workspace) redirect("/");

  const result = await getStudentProfile(workspace.id);

  if (!result.success) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 min-h-[calc(100vh-80px)]">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 p-10 rounded-[2.5rem] shadow-xl text-center space-y-6 border border-border/40">
           <div className="w-20 h-20 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-3xl flex items-center justify-center mx-auto">
              <LogOut className="w-10 h-10" />
           </div>
           <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Access Restricted</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">We couldn't find an active student profile for your account in this workspace.</p>
           </div>
           <div className="pt-4 flex flex-col gap-3">
              <Link href="/" className="w-full">
                <Button variant="outline" className="w-full h-12 rounded-xl font-bold">Return to Website</Button>
              </Link>
           </div>
        </div>
      </div>
    );
  }

  const workspaceSettings = workspace.siteSettings as any;
  const aboutSection = workspaceSettings?.sections?.find((s: any) => s.type === "about");
  const notices = (aboutSection?.content as any)?.notices || [];

  return (
    <StudentDashboardClient 
      student={result.data} 
      tenant={tenant} 
      settings={workspaceSettings} 
      notices={notices}
    />
  );
}
