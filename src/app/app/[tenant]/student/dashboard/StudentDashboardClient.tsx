"use client";

import { useSession, signOut } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, User, BookOpen, Clock, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

export default function StudentDashboardClient({ workspaceName, logoUrl, application }: any) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const params = useParams();
  const tenant = params.tenant;
  const isSubdirectoryMode = pathname.startsWith('/app/');
  const workspaceBase = (isSubdirectoryMode && tenant) ? `/app/${tenant}` : '';

  if (!session) return <div className="p-10 text-center">Redirecting...</div>;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center font-black text-2xl">
            {session.user?.name?.[0] || "S"}
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 leading-tight">Welcome, {session.user?.name}!</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">{workspaceName} Student Portal</p>
          </div>
        </div>
        <Button variant="ghost" onClick={() => signOut()} className="rounded-xl font-bold text-red-500 hover:bg-red-50 h-12 px-6">
          <LogOut className="w-4 h-4 mr-2" /> Sign Out
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Status */}
        <Card className="lg:col-span-2 rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-white">
          <CardHeader className="bg-slate-900 text-white p-10">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-black">Enrollment Status</CardTitle>
                <CardDescription className="text-slate-400 font-medium">Last updated: {new Date().toLocaleDateString()}</CardDescription>
              </div>
              <div className={`px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest ${
                application?.status === "APPROVED" ? "bg-emerald-500/20 text-emerald-400" :
                application?.status === "REJECTED" ? "bg-red-500/20 text-red-400" :
                "bg-amber-500/20 text-amber-400"
              }`}>
                {application?.status || "PENDING"}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4 p-6 rounded-3xl bg-slate-50 border border-slate-100">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">Selected Course</p>
                  <p className="font-bold text-slate-900">{application?.appliedCourse || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-6 rounded-3xl bg-slate-50 border border-slate-100">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">Application ID</p>
                  <p className="font-bold text-slate-900">{application?.applicationNo || session.user?.username}</p>
                </div>
              </div>
            </div>

            {application?.status === "REJECTED" && (
              <div className="p-8 rounded-3xl bg-red-50 border border-red-100 flex gap-4">
                <AlertCircle className="w-6 h-6 text-red-600 shrink-0" />
                <div>
                  <h4 className="text-red-900 font-black mb-2">Application Feedback</h4>
                  <p className="text-red-700 text-sm leading-relaxed">{application.rejectionReason || "Please contact the office for more details."}</p>
                </div>
              </div>
            )}

            {application?.status === "APPROVED" && (
              <div className="p-8 rounded-3xl bg-emerald-50 border border-emerald-100 flex gap-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="text-emerald-900 font-black mb-2">Admission Successful!</h4>
                  <p className="text-emerald-700 text-sm leading-relaxed">Your application has been verified and approved. You can now proceed with course materials and student ID generation.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar Actions */}
        <div className="space-y-8">
          <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl font-black">Portal Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-4">
              {application?.id && (
                <Link href={`${workspaceBase}/admission/print/${application.id}`} target="_blank">
                  <Button className="w-full h-14 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-200">
                    <FileText className="w-5 h-5 mr-3" /> View Admission Form
                  </Button>
                </Link>
              )}
              <Button variant="outline" className="w-full h-14 rounded-2xl border-2 border-slate-100 font-bold hover:bg-slate-50" onClick={() => toast.info("Coming soon!")}>
                <Clock className="w-5 h-5 mr-3" /> Attendance Record
              </Button>
              <Button variant="outline" className="w-full h-14 rounded-2xl border-2 border-slate-100 font-bold hover:bg-slate-50" onClick={() => toast.info("Coming soon!")}>
                <BookOpen className="w-5 h-5 mr-3" /> My Courses
              </Button>
            </CardContent>
          </Card>

          <div className="bg-primary/5 p-8 rounded-[2rem] border border-primary/10">
            <h4 className="text-primary font-black text-sm uppercase mb-3">Support Desk</h4>
            <p className="text-xs font-bold text-slate-500 leading-relaxed mb-6">Need help with your studies or portal access? Our team is here to assist you.</p>
            <Button variant="link" className="p-0 h-auto text-primary font-black text-xs uppercase tracking-widest hover:no-underline">Contact Office →</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
