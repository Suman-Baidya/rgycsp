import { getStudentProfile } from "@/app/actions/student";
import { getWorkspaceByTenant } from "@/lib/workspace";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, Calendar as CalendarIcon, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function StudentAttendancePage({
  params
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  const workspace = await getWorkspaceByTenant(tenant);
  if (!workspace) redirect("/");

  const result = await getStudentProfile(workspace.id);
  if (!result.success) redirect(`/app/${tenant}/student/dashboard`);

  const student = result.data;
  const attendances = student.studentProfile?.attendances || [];

  // Sort by date descending
  const sortedAttendances = [...attendances].sort((a: any, b: any) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const stats = {
    present: attendances.filter((a: any) => a.status === "PRESENT").length,
    absent: attendances.filter((a: any) => a.status === "ABSENT").length,
    late: attendances.filter((a: any) => a.status === "LATE").length,
    total: attendances.length,
    percentage: attendances.length > 0 
      ? Math.round((attendances.filter((a: any) => a.status === "PRESENT" || a.status === "LATE").length / attendances.length) * 100) 
      : 0
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Attendance Tracker</h1>
          <p className="text-slate-500 font-medium">Keep track of your presence and punctuality.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl font-bold gap-2"><Filter className="w-4 h-4" /> Filter</Button>
          <Button className="rounded-xl font-black uppercase text-[10px] tracking-widest px-6 shadow-xl shadow-primary/20">Download Report</Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AttendanceStatsCard label="Attendance Rate" value={`${stats.percentage}%`} color="bg-primary" />
        <AttendanceStatsCard label="Present Days" value={stats.present.toString()} color="bg-emerald-500" />
        <AttendanceStatsCard label="Absent Days" value={stats.absent.toString()} color="bg-red-500" />
        <AttendanceStatsCard label="Total Classes" value={stats.total.toString()} color="bg-slate-900" />
      </div>

      <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white dark:bg-zinc-900 overflow-hidden">
        <CardHeader className="px-8 pt-8 pb-6 border-b border-slate-50 dark:border-white/5">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-black uppercase tracking-tight">Recent Attendance Logs</CardTitle>
            <CalendarIcon className="w-5 h-5 text-slate-400" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {sortedAttendances.length > 0 ? (
            <div className="divide-y divide-slate-50 dark:divide-white/5">
              {sortedAttendances.map((record: any) => (
                <div key={record.id} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                  <div className="flex items-center gap-5">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg",
                      record.status === "PRESENT" ? "bg-emerald-500" : record.status === "ABSENT" ? "bg-red-500" : "bg-amber-500"
                    )}>
                      {record.status === "PRESENT" && <CheckCircle2 className="w-6 h-6" />}
                      {record.status === "ABSENT" && <XCircle className="w-6 h-6" />}
                      {record.status === "LATE" && <Clock className="w-6 h-6" />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{new Date(record.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{new Date(record.date).toLocaleDateString('en-GB', { weekday: 'long' })}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className={cn(
                      "rounded-lg font-black text-[10px] px-3 py-1 tracking-widest uppercase border-2",
                      record.status === "PRESENT" ? "border-emerald-500/20 text-emerald-500" : record.status === "ABSENT" ? "border-red-500/20 text-red-500" : "border-amber-500/20 text-amber-500"
                    )}>
                      {record.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-20 text-center">
              <CalendarIcon className="w-16 h-16 text-slate-200 dark:text-white/10 mx-auto mb-6" />
              <p className="text-slate-500 font-medium uppercase tracking-widest text-xs">No attendance logs found yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AttendanceStatsCard({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-white/5 relative overflow-hidden group">
      <div className={cn("absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 opacity-10 transition-transform duration-500 group-hover:scale-150", color)}></div>
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 relative z-10">{label}</p>
      <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight relative z-10">{value}</h3>
    </div>
  );
}

import { cn } from "@/lib/utils";
