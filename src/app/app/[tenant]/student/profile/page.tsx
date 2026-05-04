import { getStudentProfile } from "@/app/actions/student";
import { getWorkspaceByTenant } from "@/lib/workspace";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, MapPin, Calendar, Hash, ShieldCheck, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";

import StudentProfileClient from "@/components/student/StudentProfileClient";

export default async function StudentProfilePage({
  params
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  const workspace = await getWorkspaceByTenant(tenant);
  if (!workspace) redirect("/");

  const result = await getStudentProfile(workspace.id);
  if (!result.success) redirect(`/app/${tenant}/student/dashboard`);

  const student = result.data as any;
  if (!student) redirect(`/app/${tenant}/student/dashboard`);
  const profile = student.studentProfile;

  const workspaceSettings = workspace.siteSettings as any;

  return (
    <StudentProfileClient 
      student={student}
      profile={profile}
      settings={workspaceSettings}
      tenant={tenant}
    />
  );
}

function ProfileField({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | null | undefined }) {
  return (
    <div className="flex gap-4">
      <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 shrink-0">
         {icon}
      </div>
      <div>
         <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-0.5">{label}</p>
         <p className="font-bold text-slate-900 dark:text-white leading-tight">{value}</p>
      </div>
    </div>
  );
}
