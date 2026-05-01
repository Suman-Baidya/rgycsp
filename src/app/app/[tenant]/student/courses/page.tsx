import { getStudentProfile } from "@/app/actions/student";
import { getWorkspaceByTenant } from "@/lib/workspace";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calendar, Clock, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function StudentCoursesPage({
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
  const profile = student.studentProfile;
  const course = profile?.batch?.course;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">My Enrolled Courses</h1>
        <p className="text-slate-500 font-medium">Manage and view your academic progress.</p>
      </div>

      {course ? (
        <Card className="rounded-[2.5rem] overflow-hidden border-none shadow-2xl bg-white dark:bg-zinc-900 group">
          <div className="h-3 w-full bg-primary"></div>
          <div className="grid md:grid-cols-3 gap-0">
             <div className="relative h-64 md:h-auto overflow-hidden">
                {course.image ? (
                  <img src={course.image} alt={course.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-primary/30" />
                  </div>
                )}
             </div>
             <div className="md:col-span-2 p-10 space-y-6">
                <div className="flex justify-between items-start">
                   <div className="space-y-1">
                      <Badge className="rounded-lg font-black tracking-widest text-[10px] uppercase px-3 py-1 bg-primary/10 text-primary border-none mb-2">Active Enrollment</Badge>
                      <CardTitle className="text-3xl font-black tracking-tight leading-tight">{course.title}</CardTitle>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Batch ID</p>
                      <p className="font-bold text-slate-900 dark:text-white">{profile.batch?.name}</p>
                   </div>
                </div>

                <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{course.description || "No description available for this course."}</p>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-slate-50 dark:border-white/5">
                   <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Duration</p>
                      <p className="font-bold text-slate-900 dark:text-white">{course.duration || "N/A"}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Schedule</p>
                      <p className="font-bold text-slate-900 dark:text-white">{profile.batch?.schedule || "N/A"}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5" /> Code</p>
                      <p className="font-bold text-slate-900 dark:text-white">{course.code || "N/A"}</p>
                   </div>
                </div>

                <div className="pt-6">
                   <Button className="rounded-2xl h-12 px-8 font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-transform active:scale-95">
                      Course Materials →
                   </Button>
                </div>
             </div>
          </div>
        </Card>
      ) : (
        <Card className="rounded-[2.5rem] p-20 text-center border-dashed border-2 border-slate-200 dark:border-white/10 bg-transparent">
          <BookOpen className="w-16 h-16 text-slate-200 dark:text-white/10 mx-auto mb-6" />
          <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">No Active Enrollment</h3>
          <p className="text-slate-500 font-medium mt-2">You haven't been assigned to any course yet.</p>
        </Card>
      )}
    </div>
  );
}
