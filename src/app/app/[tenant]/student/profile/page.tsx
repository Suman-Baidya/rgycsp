import { getStudentProfile } from "@/app/actions/student";
import { getWorkspaceByTenant } from "@/lib/workspace";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, MapPin, Calendar, Hash, ShieldCheck, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  const student = result.data;
  const profile = student.studentProfile;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">My Profile</h1>
        <Button className="rounded-2xl h-12 px-6 font-black uppercase text-xs tracking-widest gap-2">
           <Edit3 className="w-4 h-4" /> Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {/* Left Side - Avatar & Quick Info */}
         <div className="space-y-6">
            <Card className="rounded-[3rem] p-10 border-none shadow-2xl bg-white dark:bg-zinc-900 text-center">
               <Avatar className="h-32 w-32 mx-auto ring-8 ring-primary/10 mb-6 shadow-xl">
                  <AvatarImage src={student.image} />
                  <AvatarFallback className="text-4xl font-black bg-primary text-white">{student.name?.charAt(0)}</AvatarFallback>
               </Avatar>
               <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{student.name}</h3>
               <p className="text-sm font-bold text-primary uppercase tracking-widest mt-1">Student</p>
               <Badge className="mt-4 rounded-lg font-black text-[9px] uppercase tracking-widest px-3 py-1 bg-emerald-500/10 text-emerald-500 border-none">
                  Verified Profile
               </Badge>
            </Card>

            <Card className="rounded-[2.5rem] p-8 border-none shadow-xl bg-slate-900 text-white space-y-6">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-primary">
                     <Hash className="w-5 h-5" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Enrollment No</p>
                     <p className="font-bold">{profile?.enrollmentNo || "N/A"}</p>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-primary">
                     <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Status</p>
                     <p className="font-bold">Active</p>
                  </div>
               </div>
            </Card>
         </div>

         {/* Right Side - Details */}
         <div className="md:col-span-2 space-y-8">
            <Card className="rounded-[3rem] p-10 border-none shadow-2xl bg-white dark:bg-zinc-900">
               <CardTitle className="text-xl font-black uppercase tracking-tight mb-8">Personal Information</CardTitle>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <ProfileField icon={<User />} label="Full Name" value={student.name} />
                  <ProfileField icon={<Mail />} label="Email Address" value={student.email || "N/A"} />
                  <ProfileField icon={<Phone />} label="Phone Number" value={profile?.phone || "N/A"} />
                  <ProfileField icon={<Calendar />} label="Date of Birth" value={profile?.dob ? new Date(profile.dob).toLocaleDateString() : "N/A"} />
                  <ProfileField icon={<MapPin />} label="Address" value={profile?.address ? (typeof profile.address === 'string' ? profile.address : JSON.stringify(profile.address)) : "N/A"} />
               </div>
            </Card>

            <Card className="rounded-[3rem] p-10 border-none shadow-2xl bg-white dark:bg-zinc-900">
               <CardTitle className="text-xl font-black uppercase tracking-tight mb-8">Account Security</CardTitle>
               <div className="space-y-4">
                  <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                           <Hash className="w-5 h-5" />
                        </div>
                        <div>
                           <p className="text-sm font-bold text-slate-900 dark:text-white">Application ID</p>
                           <p className="text-xs text-slate-500 font-medium">{student.username}</p>
                        </div>
                     </div>
                     <Button variant="outline" size="sm" className="rounded-lg font-bold text-[10px] uppercase">Reset Password</Button>
                  </div>
               </div>
            </Card>
         </div>
      </div>
    </div>
  );
}

function ProfileField({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
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
