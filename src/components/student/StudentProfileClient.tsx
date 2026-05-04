"use client";

import React, { useState } from "react";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Hash, 
  ShieldCheck, 
  Edit3, 
  Eye, 
  EyeOff, 
  Lock, 
  Camera,
  CheckCircle2,
  ChevronRight,
  Info
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function StudentProfileClient({ 
  student, 
  profile, 
  settings, 
  tenant 
}: { 
  student: any, 
  profile: any, 
  settings: any, 
  tenant: string 
}) {
  const primaryColor = settings?.primaryColor || "#0f172a";
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-12 pb-24">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-2">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Learner Profile</h1>
          <p className="text-slate-500 font-medium text-lg">Manage your personal information and account security.</p>
        </div>
        <Button className="rounded-2xl h-14 px-8 font-bold gap-3 shadow-xl shadow-primary/20 transition-transform hover:scale-105" style={{ backgroundColor: primaryColor }}>
          <Edit3 className="w-5 h-5" /> Edit Profile Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Quick Profile Card */}
        <div className="lg:col-span-4 space-y-8">
          <Card className="rounded-[3rem] p-10 border border-slate-100 dark:border-white/5 shadow-2xl bg-white dark:bg-zinc-900/50 text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
            
            <div className="relative inline-block mb-8">
              <Avatar className="h-40 w-40 mx-auto ring-8 ring-primary/10 shadow-2xl transition-transform duration-500 group-hover:scale-105">
                <AvatarImage src={student.image || profile?.admissionApp?.photoUrl || undefined} />
                <AvatarFallback className="text-5xl font-bold bg-primary text-white">
                  {student.name?.charAt(0) || 'L'}
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg border-4 border-white dark:border-zinc-900 hover:scale-110 transition-transform">
                <Camera className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 mb-8">
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{student.name || "Learner"}</h3>
              <p className="text-sm font-bold text-primary uppercase tracking-widest">Enrolled Learner</p>
            </div>

            <div className="flex flex-col gap-3">
              <Badge className="w-full justify-center rounded-xl font-bold text-[10px] uppercase tracking-widest px-4 py-2.5 bg-emerald-500/10 text-emerald-500 border-none">
                <CheckCircle2 className="w-3.5 h-3.5 mr-2" /> Verified Profile
              </Badge>
              <Badge variant="outline" className="w-full justify-center rounded-xl font-bold text-[10px] uppercase tracking-widest px-4 py-2.5 border-slate-100 dark:border-white/5 text-slate-400">
                Member since 2024
              </Badge>
            </div>
          </Card>

          <Card className="rounded-[2.5rem] p-10 border-none shadow-2xl bg-slate-900 text-white relative overflow-hidden group">
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/20 rounded-full -ml-16 -mb-16 blur-3xl opacity-50" />
            
            <div className="space-y-8 relative z-10">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-primary shadow-inner">
                  <Hash className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-1">Enrollment ID</p>
                  <p className="font-bold text-lg">{profile?.enrollmentNo || "Pending Assignment"}</p>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-primary shadow-inner">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-1">Academic Status</p>
                  <p className="font-bold text-lg text-emerald-400">Active Session</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Detailed Info & Security */}
        <div className="lg:col-span-8 space-y-10">
          <Card className="rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-2xl bg-white dark:bg-zinc-900/50 overflow-hidden">
            <CardHeader className="px-10 pt-10 pb-8 border-b border-slate-50 dark:border-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold tracking-tight">Personal Information</CardTitle>
                  <CardDescription className="font-bold text-slate-400 text-sm mt-1">Details linked to your official learner records</CardDescription>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                <ProfileField icon={<User />} label="Full Legal Name" value={student.name} />
                <ProfileField icon={<Mail />} label="Registered Email" value={student.email || "N/A"} />
                <ProfileField icon={<Phone />} label="Primary Contact" value={profile?.phone || "N/A"} />
                <ProfileField 
                  icon={<Calendar />} 
                  label="Date of Birth" 
                  value={profile?.dob ? new Date(profile.dob).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : "N/A"} 
                />
                <div className="md:col-span-2">
                  <ProfileField icon={<MapPin />} label="Permanent Address" value={profile?.address ? (typeof profile.address === 'string' ? profile.address : JSON.stringify(profile.address)) : "Not Provided"} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-2xl bg-white dark:bg-zinc-900/50 overflow-hidden">
            <CardHeader className="px-10 pt-10 pb-8 border-b border-slate-50 dark:border-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold tracking-tight">Security & Privacy</CardTitle>
                  <CardDescription className="font-bold text-slate-400 text-sm mt-1">Manage your credentials and login safety</CardDescription>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-10 space-y-6">
              <div className="p-8 rounded-[2rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:border-primary/20">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-800 flex items-center justify-center shadow-sm">
                    <Lock className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-1">Account Password</p>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg tracking-wider">
                        {showPassword ? (profile?.admissionApp?.tempPassword || "Customized") : "••••••••••••"}
                      </span>
                      <button 
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4 text-primary" /> : <Eye className="w-4 h-4 text-primary" />}
                      </button>
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="rounded-2xl h-12 px-8 font-bold gap-2 border-primary/20 hover:bg-primary/5 text-primary">
                  Update Password <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-2">Login User ID</p>
                  <p className="font-bold text-slate-900 dark:text-white">{student.username || "Not Assigned"}</p>
                </div>
                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-2">Registered Email</p>
                  <p className="font-bold text-slate-900 dark:text-white">{student.email || "No Email Provided"}</p>
                </div>
              </div>

              <div className="p-6 flex items-start gap-4 text-slate-500">
                <Info className="w-5 h-5 mt-0.5 shrink-0" />
                <p className="text-sm font-medium leading-relaxed">
                  For your security, we recommend using a strong password that you haven't used on other websites. You should update your password at least every 6 months.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ProfileField({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | null | undefined }) {
  return (
    <div className="flex gap-5 group">
      <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 shrink-0 transition-all group-hover:bg-primary/5 group-hover:text-primary border border-transparent group-hover:border-primary/10">
         {React.cloneElement(icon as React.ReactElement<any>, { className: "w-5 h-5" })}
      </div>
      <div className="space-y-1">
         <p className="text-[11px] font-bold uppercase text-slate-400 tracking-widest">{label}</p>
         <p className="font-bold text-slate-900 dark:text-white text-lg leading-tight transition-colors group-hover:text-primary">{value || "N/A"}</p>
      </div>
    </div>
  );
}
