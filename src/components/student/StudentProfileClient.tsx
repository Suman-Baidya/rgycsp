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
  Eye, 
  EyeOff, 
  Lock, 
  CheckCircle2,
  ChevronRight,
  Info,
  Loader2,
  KeyRound,
  IdCard,
  Building,
  FileText,
  Award,
  FileBadge,
  Contact,
  Download,
  ExternalLink,
  MessageCircle,
  Users,
  BookOpen,
  Clock,
  CalendarDays
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { updatePassword } from "@/app/actions/profile";

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
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const formatAddress = (address: any) => {
    if (!address) return "Address details not provided.";
    
    let parsedAddress = address;
    if (typeof address === 'string') {
      try {
        parsedAddress = JSON.parse(address);
      } catch (e) {
        return address; // Return as normal string if not JSON
      }
    }
    
    const parts = [];
    if (parsedAddress.vill) parts.push(`Vill- ${parsedAddress.vill}`);
    if (parsedAddress.po) parts.push(`PO- ${parsedAddress.po}`);
    if (parsedAddress.ps) parts.push(`PS- ${parsedAddress.ps}`);
    if (parsedAddress.dist) parts.push(`Dist- ${parsedAddress.dist}`);
    if (parsedAddress.state) parts.push(`State- ${parsedAddress.state}`);
    
    let formatted = parts.join(", ");
    if (parsedAddress.pin) {
      formatted += ` - ${parsedAddress.pin}`;
    }
    
    return formatted || "Address details not provided.";
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    setIsUpdatingPassword(true);
    try {
      const res = await updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      if (res?.success) {
        toast.success("Password updated successfully");
        setIsPasswordModalOpen(false);
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        toast.error(res?.error || "Failed to update password");
      }
    } catch (error) {
      toast.error("An error occurred while updating password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-24 space-y-8 animate-in fade-in duration-700">
      
      {/* Premium Hero Banner */}
      <div className="relative rounded-b-[2.5rem] lg:rounded-[3rem] overflow-hidden bg-slate-950 shadow-2xl mx-0 lg:mx-8 lg:mt-8 p-8 lg:p-14 group">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-primary/30 rounded-full blur-[100px] -mr-40 -mt-40 transition-transform duration-1000 group-hover:brightness-110" />
          <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-indigo-500/20 rounded-full blur-[80px] -ml-20 -mb-20 transition-transform duration-1000 group-hover:translate-x-10" />
        </div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-8 md:gap-10">
          <Avatar className="h-32 w-32 md:h-44 md:w-44 ring-[6px] ring-white/10 shadow-2xl shadow-black/50 transition-transform duration-500 ">
            <AvatarImage src={student.image || profile?.admissionApp?.photoUrl || undefined} />
            <AvatarFallback className="text-5xl md:text-7xl font-bold bg-gradient-to-br from-primary to-indigo-600 text-white">
              {student.name?.charAt(0) || 'L'}
            </AvatarFallback>
          </Avatar>
          
          <div className="text-center md:text-left space-y-5 flex-1">
            <div className="space-y-2">
              <div className="flex flex-col md:flex-row items-center md:items-start justify-center md:justify-start gap-4">
                <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-lg">
                  {student.name || "Learner Profile"}
                </h1>
                <div className="md:mt-2 text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-xl flex items-center gap-1.5 backdrop-blur-sm shadow-sm" title="Verified Learner">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-[11px] uppercase font-bold tracking-widest">Verified</span>
                </div>
              </div>
              <p className="text-primary font-bold text-sm md:text-base uppercase tracking-widest drop-shadow-md">
                Enrollment No: {profile?.enrollmentNo || "Pending"}
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-6 md:gap-8 pt-5 border-t border-white/10">
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                  <BookOpen className="w-4 h-4 text-white/80" />
                </div>
                <div className="flex flex-col text-left">
                   <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Course Enrolled</span>
                   <span className="text-white font-semibold text-sm">
                     {profile?.course?.name || profile?.courseName || "Course Not Assigned"} 
                     {profile?.course?.duration || profile?.duration ? ` (${profile?.course?.duration || profile?.duration})` : ""}
                   </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                  <Clock className="w-4 h-4 text-white/80" />
                </div>
                <div className="flex flex-col text-left">
                   <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Batch Details</span>
                   <span className="text-white font-semibold text-sm">
                     {profile?.batch?.name || profile?.batchName || "No Batch"} 
                     {profile?.batch?.time || profile?.batchTime ? ` • ${profile?.batch?.time || profile?.batchTime}` : ""}
                   </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                  <CalendarDays className="w-4 h-4 text-white/80" />
                </div>
                <div className="flex flex-col text-left">
                   <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Admission Date</span>
                   <span className="text-white font-semibold text-sm">
                     {profile?.admissionDate ? new Date(profile.admissionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 
                      profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : "N/A"}
                   </span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Bento Box Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 lg:px-8">
        
        {/* Personal Details (Spans 2 columns on large screens) */}
        <Card className="lg:col-span-2 rounded-[2rem] border-none shadow-xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm overflow-hidden group hover:shadow-2xl transition-all duration-500">
          <CardHeader className="px-8 pt-8 pb-4 border-b border-slate-100/50 dark:border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                <IdCard className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Personal Overview</CardTitle>
                <CardDescription className="font-semibold text-slate-500">Official demographic data</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-6">
                <PremiumDataField icon={<User />} label="Full Name" value={student.name} />
                <PremiumDataField icon={<Users />} label="Father's Name" value={profile?.fatherName || "N/A"} />
                <PremiumDataField 
                  icon={<Calendar />} 
                  label="Date of Birth" 
                  value={profile?.dob ? new Date(profile.dob).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : "N/A"} 
                />
              </div>
              
              <div className="relative h-full min-h-[140px] rounded-3xl overflow-hidden p-6 bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-white/5 flex flex-col group/address">
                <div className="absolute right-0 top-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10 transition-transform duration-700 group-hover/address:scale-150" />
                <div className="flex items-center gap-3 mb-4 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 flex items-center justify-center text-primary shadow-sm">
                    <Building className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Permanent Address</p>
                </div>
                <div className="font-bold text-slate-700 dark:text-slate-300 text-base leading-relaxed relative z-10">
                  {formatAddress(profile?.address)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information (Spans 1 column) */}
        <Card className="rounded-[2rem] border-none shadow-xl bg-primary text-white overflow-hidden relative group hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-indigo-700 opacity-90" />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-20 -mb-20 transition-transform duration-700 group-hover:scale-150" />
          
          <CardHeader className="relative z-10 px-8 pt-8 pb-4">
             <CardTitle className="text-xl font-extrabold tracking-tight">Contact Details</CardTitle>
             <CardDescription className="font-medium text-white/70">Communication channels</CardDescription>
          </CardHeader>
          <CardContent className="relative z-10 p-8 space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div className="space-y-1 pt-0.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/70">Email Address</p>
                <p className="font-bold text-lg leading-tight break-all">{student.email || "N/A"}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div className="space-y-1 pt-0.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/70">Phone Number</p>
                <p className="font-bold text-lg leading-tight">{profile?.phone || "N/A"}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm shrink-0">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1 pt-0.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/70">WhatsApp Number</p>
                <p className="font-bold text-lg leading-tight">{profile?.whatsappNo || profile?.phone || "N/A"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security & Authentication (Spans full width) */}
        <Card className="lg:col-span-3 rounded-[2rem] border-none shadow-xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm overflow-hidden group hover:shadow-2xl transition-all duration-500">
          <CardHeader className="px-8 pt-8 pb-4 border-b border-slate-100/50 dark:border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-500">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Security & Access</CardTitle>
                <CardDescription className="font-semibold text-slate-500">Manage your credentials</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Username Block */}
              <div className="p-6 rounded-3xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-white/5 flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 flex items-center justify-center text-slate-500 shadow-sm shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-1">Login Username</p>
                  <p className="font-extrabold text-lg text-slate-900 dark:text-white">{student.username || "Not Assigned"}</p>
                </div>
              </div>

              {/* Password Action Block (Spans 2 cols on md) */}
              <div className="md:col-span-2 p-6 rounded-3xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-all hover:border-primary/30">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 flex items-center justify-center text-slate-500 shadow-sm shrink-0">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-1">Account Password</p>
                    <p className="font-extrabold text-xl tracking-widest text-slate-900 dark:text-white">••••••••••••</p>
                  </div>
                </div>
                
                <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
                  <DialogTrigger render={
                    <Button className="rounded-2xl h-12 px-6 font-bold gap-2 shadow-md hover:shadow-lg transition-all w-full sm:w-auto text-white" style={{ backgroundColor: primaryColor }}>
                      Change Password <ChevronRight className="w-4 h-4" />
                    </Button>
                  } />
                  <DialogContent className="sm:max-w-[425px] p-0 rounded-[2rem] overflow-hidden border-none shadow-2xl">
                    <div className="bg-slate-900 px-8 pt-10 pb-12 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/30 rounded-full blur-3xl -mr-10 -mt-10" />
                      <DialogHeader className="relative z-10 space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-2 shadow-inner">
                          <Lock className="w-6 h-6 text-white" />
                        </div>
                        <DialogTitle className="text-2xl font-extrabold tracking-tight text-white">Update Password</DialogTitle>
                        <DialogDescription className="font-medium text-slate-300">
                          Protect your account by creating a strong, unique password.
                        </DialogDescription>
                      </DialogHeader>
                    </div>
                    
                    <form onSubmit={handlePasswordUpdate} className="px-8 py-6 space-y-6 bg-white dark:bg-zinc-950 -mt-6 rounded-t-[2rem] relative z-20">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword" className="font-bold text-xs uppercase tracking-wider text-slate-500">Current Password</Label>
                        <div className="relative">
                          <Input 
                            id="currentPassword" 
                            type={showPassword.current ? "text" : "password"} 
                            placeholder="Enter current password"
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm(prev => ({...prev, currentPassword: e.target.value}))}
                            required
                            className="rounded-xl h-12 bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-white/10 pr-12 focus-visible:ring-primary/50"
                          />
                          <button type="button" onClick={() => setShowPassword(s => ({...s, current: !s.current}))} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                            {showPassword.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="newPassword" className="font-bold text-xs uppercase tracking-wider text-slate-500">New Password</Label>
                        <div className="relative">
                          <Input 
                            id="newPassword" 
                            type={showPassword.new ? "text" : "password"} 
                            placeholder="Minimum 6 characters"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm(prev => ({...prev, newPassword: e.target.value}))}
                            required
                            className="rounded-xl h-12 bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-white/10 pr-12 focus-visible:ring-primary/50"
                          />
                          <button type="button" onClick={() => setShowPassword(s => ({...s, new: !s.new}))} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                            {showPassword.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="font-bold text-xs uppercase tracking-wider text-slate-500">Confirm New Password</Label>
                        <div className="relative">
                          <Input 
                            id="confirmPassword" 
                            type={showPassword.confirm ? "text" : "password"} 
                            placeholder="Re-enter new password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm(prev => ({...prev, confirmPassword: e.target.value}))}
                            required
                            className="rounded-xl h-12 bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-white/10 pr-12 focus-visible:ring-primary/50"
                          />
                          <button type="button" onClick={() => setShowPassword(s => ({...s, confirm: !s.confirm}))} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                            {showPassword.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                      <DialogFooter className="pt-2">
                        <Button 
                          type="submit" 
                          disabled={isUpdatingPassword}
                          className="w-full h-14 rounded-xl font-bold text-lg shadow-xl shadow-primary/20 text-white"
                          style={{ backgroundColor: primaryColor }}
                        >
                          {isUpdatingPassword ? (
                            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Updating Security...</>
                          ) : (
                            "Save New Password"
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Official Documents Section (Spans full width) */}
        <Card className="lg:col-span-3 rounded-[2rem] border-none shadow-xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm overflow-hidden group hover:shadow-2xl transition-all duration-500">
          <CardHeader className="px-8 pt-8 pb-4 border-b border-slate-100/50 dark:border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-500">
                <FileBadge className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Official Documents</CardTitle>
                <CardDescription className="font-semibold text-slate-500">Access your academic records and certificates</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              <DocumentCard icon={<Contact />} title="Student ID Card" description="View or download ID" status="Available" />
              <DocumentCard icon={<FileText />} title="Admit Card" description="Examination entry pass" status={profile?.admitIssued ? "Available" : "Not Issued"} isAvailable={profile?.admitIssued} />
              <DocumentCard icon={<Award />} title="Marksheet" description="Term examination results" status="Pending Release" isAvailable={false} />
              <DocumentCard icon={<FileBadge />} title="Certificate" description="Course completion certificate" status="Not Eligible Yet" isAvailable={false} />

            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

function DocumentCard({ icon, title, description, status, isAvailable = true }: { icon: React.ReactNode, title: string, description: string, status: string, isAvailable?: boolean }) {
  return (
    <div className={`p-5 rounded-[1.5rem] border flex flex-col sm:flex-row sm:items-center gap-5 transition-all duration-300 group ${isAvailable ? 'bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-white/10 hover:border-primary/40 hover:shadow-md hover:bg-white dark:hover:bg-zinc-900' : 'bg-slate-50/50 dark:bg-zinc-900/50 border-slate-100 dark:border-white/5 opacity-70'}`}>
      <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center shadow-sm transition-transform duration-500 group- ${isAvailable ? 'bg-white dark:bg-zinc-950 text-primary border border-slate-100 dark:border-white/5' : 'bg-slate-100 dark:bg-zinc-800 text-slate-400'}`}>
        {React.cloneElement(icon as React.ReactElement<any>, { className: "w-7 h-7" })}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          <h4 className="font-extrabold text-base text-slate-900 dark:text-white truncate tracking-tight">{title}</h4>
          <Badge variant="outline" className={`border-none px-2 py-0 h-5 text-[9px] uppercase font-bold tracking-widest ${isAvailable ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-slate-200/50 dark:bg-slate-800 text-slate-500'}`}>
            {status}
          </Badge>
        </div>
        <p className="text-xs font-medium text-slate-500 truncate">{description}</p>
      </div>
      
      {isAvailable && (
        <div className="flex items-center gap-2 shrink-0 mt-3 sm:mt-0">
           <button onClick={() => toast.info(`Viewing ${title} is not supported in this demo`)} className="w-10 h-10 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 hover:border-primary/50 hover:text-primary flex items-center justify-center transition-all text-slate-500 shadow-sm" title="View Document">
             <Eye className="w-4 h-4"/>
           </button>
           <button onClick={() => toast.info(`Downloading ${title} is not supported in this demo`)} className="w-10 h-10 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white flex items-center justify-center transition-all shadow-sm" title="Download Document">
             <Download className="w-4 h-4"/>
           </button>
        </div>
      )}
    </div>
  );
}

function PremiumDataField({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | null | undefined }) {
  return (
    <div className="flex gap-4 group items-center">
      <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-slate-400 shrink-0 transition-all duration-500 group-hover:bg-primary/10 group-hover:text-primary group-hover:brightness-110 group-hover:shadow-md border border-slate-100 dark:border-white/5">
         {React.cloneElement(icon as React.ReactElement<any>, { className: "w-5 h-5" })}
      </div>
      <div className="space-y-0.5">
         <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">{label}</p>
         <p className="font-extrabold text-slate-800 dark:text-slate-100 text-lg leading-tight transition-colors group-hover:text-primary">{value || "Not specified"}</p>
      </div>
    </div>
  );
}

