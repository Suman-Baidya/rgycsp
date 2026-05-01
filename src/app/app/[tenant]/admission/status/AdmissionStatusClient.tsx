"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Search, FileText, Download, CheckCircle2, Clock, XCircle, LogOut } from "lucide-react";
import { checkApplicationStatus } from "@/app/actions/admission";
import Image from "next/image";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function AdmissionStatusClient({ workspaceId, workspaceName, logoUrl }: any) {
  const [loading, setLoading] = useState(false);
  const [appId, setAppId] = useState("");
  const [password, setPassword] = useState("");
  const [application, setApplication] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const tenant = params.tenant;

  const isSubdirectoryMode = pathname.startsWith('/app/');
  const workspaceBase = (isSubdirectoryMode && tenant) ? `/app/${tenant}` : '';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        username: appId,
        password: password,
        redirect: false,
      });

      if (res?.error) {
        toast.error("Invalid credentials. Please check your ID and Password.");
      } else {
        toast.success("Login successful!");
        // We can still fetch the application details for the current view, 
        // or redirect to a dedicated dashboard.
        // For now, let's fetch to show status immediately.
        const appRes = await checkApplicationStatus(workspaceId, appId, password);
        if (appRes.success) {
          setApplication(appRes.data);
          // router.push(`${workspaceBase}/student/dashboard`); // Future redirect
        }
      }
    } catch (err) {
      toast.error("Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  if (application) {
    return (
      <div className="w-full max-w-4xl space-y-6">
        <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
           <div className="flex items-center gap-4">
              {logoUrl && (
                <div className="relative w-12 h-12 rounded-xl overflow-hidden">
                  <Image src={logoUrl} alt="Logo" fill className="object-contain" />
                </div>
              )}
              <div>
                <h2 className="text-xl font-black text-slate-900">{workspaceName}</h2>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Student Admission Portal</p>
              </div>
           </div>
           <Button variant="ghost" className="rounded-xl font-bold text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => setApplication(null)}>
              <LogOut className="w-4 h-4 mr-2" /> Logout
           </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {/* Status Card */}
           <Card className="md:col-span-2 rounded-3xl border-none shadow-xl overflow-hidden bg-white">
              <CardHeader className="bg-slate-900 text-white pb-10">
                 <div className="flex justify-between items-start">
                    <div>
                       <CardTitle className="text-2xl font-black tracking-tight">Application Status</CardTitle>
                       <CardDescription className="text-slate-400 font-medium">Tracking your enrollment progress</CardDescription>
                    </div>
                    <div className={cn(
                      "px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2",
                      application.status === "APPROVED" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                      application.status === "REJECTED" ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                      "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    )}>
                      {application.status === "APPROVED" && <CheckCircle2 className="w-4 h-4" />}
                      {application.status === "REJECTED" && <XCircle className="w-4 h-4" />}
                      {application.status === "PENDING" && <Clock className="w-4 h-4" />}
                      {application.status}
                    </div>
                 </div>
              </CardHeader>
              <CardContent className="-mt-6 bg-white rounded-t-3xl p-8 pt-10">
                 <div className="space-y-8">
                    <div className="flex items-center gap-6">
                       <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-xl">
                          <Image src={application.photoUrl} alt="Photo" fill className="object-cover" />
                       </div>
                       <div>
                          <h3 className="text-2xl font-black text-slate-900 leading-tight">{application.fullName}</h3>
                          <p className="text-slate-500 font-bold">{application.appliedCourse}</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Application ID</p>
                          <p className="font-bold text-slate-900">{application.applicationNo}</p>
                       </div>
                       <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Submission Date</p>
                          <p className="font-bold text-slate-900">{new Date(application.createdAt).toLocaleDateString()}</p>
                       </div>
                    </div>

                    {application.status === "REJECTED" && application.rejectionReason && (
                      <div className="p-6 rounded-2xl bg-red-50 border border-red-100">
                         <h4 className="text-red-900 font-bold mb-1 flex items-center gap-2">
                           <XCircle className="w-4 h-4" /> Rejection Reason
                         </h4>
                         <p className="text-red-700 text-sm leading-relaxed">{application.rejectionReason}</p>
                      </div>
                    )}

                    {application.status === "APPROVED" && (
                      <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100 space-y-4">
                         <div>
                            <h4 className="text-emerald-900 font-bold mb-1 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4" /> Congratulations!
                            </h4>
                            <p className="text-emerald-700 text-sm leading-relaxed">Your application has been approved. You can now access your student portal using the button below.</p>
                         </div>
                         <Link href={`${workspaceBase}/student/dashboard`}>
                            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl px-6">
                               Go to Student Portal
                            </Button>
                         </Link>
                      </div>
                    )}
                 </div>
              </CardContent>
           </Card>

           {/* Actions Card */}
           <div className="space-y-6">
              <Card className="rounded-3xl border-none shadow-xl bg-white overflow-hidden">
                 <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-black tracking-tight">Quick Actions</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-3">
                    <Link href={`${workspaceBase}/admission/print/${application.id}`} target="_blank" className="block w-full">
                       <Button className="w-full h-12 rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200">
                          <FileText className="w-4 h-4 mr-2" /> Download Application PDF
                       </Button>
                    </Link>
                    <Button variant="outline" className="w-full h-12 rounded-xl border-slate-200 font-bold" onClick={() => toast.info("Feature coming soon!")}>
                       <Download className="w-4 h-4 mr-2" /> Download Receipt
                    </Button>
                 </CardContent>
              </Card>

              <Card className="rounded-3xl border-none shadow-xl bg-primary/5 border-primary/10 overflow-hidden p-6">
                 <h4 className="text-primary font-black text-sm uppercase mb-2">Need Help?</h4>
                 <p className="text-xs font-bold text-slate-500 leading-relaxed mb-4">If you have any questions regarding your admission status, please contact our help desk.</p>
                 <Button variant="link" className="p-0 h-auto text-primary font-black text-xs uppercase tracking-widest">Contact Office →</Button>
              </Card>
           </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md rounded-3xl border-none shadow-2xl overflow-hidden bg-white">
      <CardHeader className="text-center pb-8 pt-10">
        {logoUrl && (
           <div className="relative w-16 h-16 mx-auto mb-4 rounded-2xl overflow-hidden shadow-lg border border-slate-50">
             <Image src={logoUrl} alt="Logo" fill className="object-contain" />
           </div>
        )}
        <CardTitle className="text-3xl font-black tracking-tight text-slate-900">Admission Status</CardTitle>
        <CardDescription className="font-bold text-slate-500 mt-2 uppercase tracking-widest text-[10px]">Track your enrollment progress</CardDescription>
      </CardHeader>
      <CardContent className="px-8 pb-8">
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Application ID</Label>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="e.g. SUMAN12345" 
                value={appId}
                onChange={(e) => setAppId(e.target.value.toUpperCase())}
                className="h-14 pl-12 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-primary/50 transition-all font-bold shadow-sm"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Temporary Password</Label>
            <Input 
              type="password"
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-primary/50 transition-all font-bold shadow-sm"
              required
            />
          </div>
          <Button 
            className="w-full h-14 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-xs hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100"
            disabled={loading}
            type="submit"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Track My Application"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="bg-slate-50 p-6 flex justify-center border-t border-slate-100">
         <p className="text-xs font-bold text-slate-400">Lost your credentials? <Button variant="link" className="p-0 h-auto text-[10px] font-black uppercase tracking-widest ml-1">Contact Office</Button></p>
      </CardFooter>
    </Card>
  );
}

// Helper function
import { cn } from "@/lib/utils";
