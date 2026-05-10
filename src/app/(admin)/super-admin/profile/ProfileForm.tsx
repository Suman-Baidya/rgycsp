"use client";

import React, { useState } from "react";
import { 
  User, 
  Lock, 
  Mail, 
  ShieldCheck, 
  Save, 
  Loader2, 
  Camera,
  AtSign,
  Fingerprint,
  LogOut
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { signOut } from "next-auth/react";
import { updateProfile, updatePassword } from "@/app/actions/profile";
import { cn } from "@/lib/utils";

interface ProfileFormProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    username: string | null;
    image: string | null;
  };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  
  // Profile State
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [username, setUsername] = useState(user.username || "");
  const [image, setImage] = useState(user.image || "");

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    
    const res = await updateProfile({ name, email, username, image });
    
    if (res.success) {
      toast.success("Profile updated successfully");
    } else {
      toast.error(res.error || "Failed to update profile");
    }
    setIsUpdatingProfile(false);
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setIsUpdatingPassword(true);
    const res = await updatePassword({ currentPassword, newPassword });
    
    if (res.success) {
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      toast.error(res.error || "Failed to change password");
    }
    setIsUpdatingPassword(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Premium Profile Banner */}
      <Card className="border-none shadow-2xl shadow-primary/5 bg-white dark:bg-zinc-950 overflow-hidden rounded-[2.5rem] relative">
        <div className="h-56 bg-gradient-to-br from-primary/30 via-primary/5 to-transparent relative overflow-hidden">
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/20 blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-30%] left-[-15%] w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[150px]" />
          </div>
        </div>
        <CardContent className="px-10 -mt-20 flex flex-col md:flex-row items-end gap-8 pb-10 relative z-10">
          <div className="relative group">
            <div className="w-44 h-44 rounded-[3.5rem] bg-zinc-100 dark:bg-zinc-900 border-[10px] border-white dark:border-zinc-950 shadow-2xl overflow-hidden group-hover:scale-[1.02] transition-transform duration-500">
              {image ? (
                <img src={image} alt={name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-primary/10">
                  <User className="h-20 w-20" />
                </div>
              )}
            </div>
            <div className="absolute bottom-3 right-3 p-3.5 bg-primary text-primary-foreground rounded-2xl shadow-2xl border-4 border-white dark:border-zinc-950 animate-bounce-subtle">
              <ShieldCheck className="h-6 w-6" />
            </div>
          </div>
          
          <div className="flex-1 pb-2 space-y-3">
            <div className="flex items-center gap-4 flex-wrap">
              <h2 className="text-5xl font-bold text-slate-900 dark:text-white leading-none">{name || "Administrator"}</h2>
              <Badge className="bg-primary/10 text-primary border-none font-bold text-[10px] px-4 py-1.5 uppercase rounded-xl">Super Admin</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-slate-400 font-bold text-sm">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 transition-colors hover:border-primary/30">
                <Mail className="h-4 w-4 text-primary" />
                {email}
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 transition-colors hover:border-primary/30">
                <AtSign className="h-4 w-4 text-primary" />
                {username || "no_username"}
              </div>
            </div>
          </div>

          <div className="pb-2 flex flex-col items-end gap-6">
             <div className="hidden xl:flex gap-4">
                <div className="text-right">
                   <p className="text-[10px] font-bold uppercase text-slate-400">System Access</p>
                   <p className="text-lg font-bold text-slate-900 dark:text-white">Lvl 10 (Root)</p>
                </div>
                <div className="w-[1px] h-10 bg-slate-100 dark:bg-zinc-800" />
                <div className="text-right">
                   <p className="text-[10px] font-bold uppercase text-slate-400">Account Status</p>
                   <p className="text-lg font-bold text-green-500">Verified</p>
                </div>
             </div>

             <Button 
               variant="outline" 
               onClick={() => signOut({ callbackUrl: "/" })}
               className="h-12 px-6 rounded-2xl border-red-500/20 bg-red-500/5 text-red-500 font-bold hover:bg-red-500 hover:text-white transition-all gap-3"
             >
               <LogOut className="h-4 w-4" />
               Sign Out
             </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="personal" className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Vertical Sidebar Navigation */}
          <div className="lg:col-span-3 space-y-6">
            <div className="sticky top-24 space-y-6">
              <div className="space-y-1 px-2">
                <h4 className="text-[10px] font-bold uppercase text-slate-400 ml-1">Account Settings</h4>
                <TabsList className="flex flex-col h-auto bg-transparent p-0 gap-2 w-full border-none shadow-none">
                  {[
                    { value: "personal", label: "Identity & Profile", icon: User, desc: "Personal information" },
                    { value: "security", label: "Security & Access", icon: Lock, desc: "Password & Credentials" },
                  ].map((tab) => (
                    <TabsTrigger 
                      key={tab.value}
                      value={tab.value} 
                      className="group flex flex-col items-start gap-0.5 px-5 py-4 rounded-[1.5rem] bg-transparent data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 data-[state=active]:shadow-xl data-[state=active]:shadow-primary/5 text-slate-500 data-[state=active]:text-primary transition-all text-left border border-transparent data-[state=active]:border-slate-100 dark:data-[state=active]:border-zinc-800 w-full"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <tab.icon className={cn("h-4 w-4 transition-transform group-hover:scale-110")} />
                        <span className="text-sm font-bold tracking-tight">{tab.label}</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 ml-7 group-data-[state=active]:text-primary/60">{tab.desc}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <div className="p-6 rounded-[2rem] bg-primary/5 border border-primary/10 space-y-3">
                <div className="flex items-center gap-2">
                   <ShieldCheck className="h-4 w-4 text-primary" />
                   <span className="text-xs font-bold uppercase text-primary">Admin Integrity</span>
                </div>
                <p className="text-[10px] leading-relaxed text-primary/70 font-bold italic">
                  Keep your credentials secure. Your actions are logged for global audit compliance.
                </p>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9">
            <TabsContent value="personal" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-right-4 duration-500">
              <Card className="border-none shadow-2xl shadow-primary/5 bg-white dark:bg-zinc-950 rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-10 pb-4">
                  <div className="flex flex-col gap-1">
                    <CardTitle className="text-3xl font-bold">Profile Details</CardTitle>
                    <CardDescription className="text-slate-500 font-bold">Manage your administrative identity across the ecosystem.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-10 pt-6">
                  <form onSubmit={handleProfileUpdate} className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-8">
                        <div className="space-y-3">
                          <Label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Full Name</Label>
                          <div className="relative group">
                            <User className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <Input 
                              value={name} 
                              onChange={(e) => setName(e.target.value)} 
                              className="h-14 pl-14 rounded-2xl bg-slate-50 dark:bg-zinc-900 border-2 border-transparent focus-visible:border-primary/20 focus-visible:ring-0 font-bold text-base transition-all"
                              placeholder="Your display name"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Email Address</Label>
                          <div className="relative group">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <Input 
                              value={email} 
                              onChange={(e) => setEmail(e.target.value)} 
                              className="h-14 pl-14 rounded-2xl bg-slate-50 dark:bg-zinc-900 border-2 border-transparent focus-visible:border-primary/20 focus-visible:ring-0 font-bold text-base transition-all"
                              placeholder="admin@example.com"
                              type="email"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Username</Label>
                          <div className="relative group">
                            <AtSign className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <Input 
                              value={username} 
                              onChange={(e) => setUsername(e.target.value)} 
                              className="h-14 pl-14 rounded-2xl bg-slate-50 dark:bg-zinc-900 border-2 border-transparent focus-visible:border-primary/20 focus-visible:ring-0 font-bold text-base transition-all"
                              placeholder="super_admin"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Identity Avatar</Label>
                        <div className="p-1 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-zinc-800 hover:border-primary/20 transition-all">
                          <ImageUpload 
                            value={image} 
                            onChange={setImage} 
                            label="Avatar" 
                            folder="ABCDEduHub/SuperAdmin/Profile" 
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold italic mt-2 px-1 text-center">
                          Resolution: 512x512px (1:1) • Formats: WEBP, PNG, JPG
                        </p>
                      </div>
                    </div>

                    <div className="pt-8 flex justify-end border-t border-slate-50 dark:border-zinc-900">
                      <Button 
                        type="submit" 
                        disabled={isUpdatingProfile}
                        className="h-14 px-12 rounded-2xl bg-primary text-primary-foreground font-bold uppercase hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20"
                      >
                        {isUpdatingProfile ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5 mr-3" />}
                        {isUpdatingProfile ? "Synchronizing..." : "Commit Profile Changes"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-right-4 duration-500">
              <Card className="border-none shadow-2xl shadow-primary/5 bg-white dark:bg-zinc-950 rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-10 pb-4">
                  <div className="flex flex-col gap-1">
                    <CardTitle className="text-3xl font-bold">Security Infrastructure</CardTitle>
                    <CardDescription className="text-slate-500 font-bold">Configure your cryptographic access and password protocols.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-10 pt-6">
                  <form onSubmit={handlePasswordUpdate} className="space-y-10 max-w-3xl">
                    <div className="space-y-8">
                      <div className="space-y-3">
                        <Label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Current Password Signature</Label>
                        <div className="relative group">
                          <Fingerprint className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                          <Input 
                            value={currentPassword} 
                            onChange={(e) => setCurrentPassword(e.target.value)} 
                            className="h-14 pl-14 rounded-2xl bg-slate-50 dark:bg-zinc-900 border-2 border-transparent focus-visible:border-primary/20 focus-visible:ring-0 font-bold text-base transition-all"
                            type="password"
                            placeholder="••••••••"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <Label className="text-[10px] font-bold uppercase text-slate-400 ml-1">New Access Key</Label>
                          <div className="relative group">
                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <Input 
                              value={newPassword} 
                              onChange={(e) => setNewPassword(e.target.value)} 
                              className="h-14 pl-14 rounded-2xl bg-slate-50 dark:bg-zinc-900 border-2 border-transparent focus-visible:border-primary/20 focus-visible:ring-0 font-bold text-base transition-all"
                              type="password"
                              placeholder="Min. 8 characters"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Verify Access Key</Label>
                          <div className="relative group">
                            <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <Input 
                              value={confirmPassword} 
                              onChange={(e) => setConfirmPassword(e.target.value)} 
                              className="h-14 pl-14 rounded-2xl bg-slate-50 dark:bg-zinc-900 border-2 border-transparent focus-visible:border-primary/20 focus-visible:ring-0 font-bold text-base transition-all"
                              type="password"
                              placeholder="Repeat new access key"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-8 flex justify-end border-t border-slate-50 dark:border-zinc-900">
                      <Button 
                        type="submit" 
                        disabled={isUpdatingPassword}
                        className="h-14 px-12 rounded-2xl bg-primary text-primary-foreground font-bold uppercase hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20"
                      >
                        {isUpdatingPassword ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock className="h-5 w-5 mr-3" />}
                        {isUpdatingPassword ? "Processing Encryption..." : "Update Security Access"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
