"use client";

import React, { useState } from "react";
import { 
  User, 
  Lock, 
  Mail, 
  ShieldCheck, 
  Save, 
  Loader2, 
  AtSign,
  Fingerprint,
  LogOut,
  Eye,
  EyeOff,
  Edit2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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
  roleName?: string;
  tenant?: string;
}

export function ProfileForm({ user, roleName = "Franchise Admin", tenant }: ProfileFormProps) {
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // Profile State
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [username, setUsername] = useState(user.username || "");
  const [image, setImage] = useState(user.image || "");

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Password Visibility State
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    
    const res = await updateProfile({ name, email, username, image });
    
    if (res.success) {
      toast.success("Profile updated successfully");
      setIsEditingProfile(false);
      // Optional: use router.refresh() if needed to force server component re-render
      window.location.reload();
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
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Clean Premium Profile Header with Colors */}
      <div className="relative overflow-hidden rounded-[2rem] border border-border/50 bg-white dark:bg-zinc-950 shadow-sm">
        {/* Colorful Gradient Background */}
        <div className="absolute inset-0 h-32 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-pink-500/10" />
        
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-end justify-between px-8 pb-8 pt-16 relative z-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 w-full">
            <div className="h-28 w-28 rounded-full border-4 border-background shadow-lg bg-gradient-to-br from-primary/20 to-primary/5 overflow-hidden relative shrink-0">
              {image ? (
                <img src={image} alt={name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <User className="h-12 w-12 text-primary/50" />
                </div>
              )}
            </div>
            <div className="space-y-2 text-center sm:text-left flex-1 pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">{name || "Administrator"}</h1>
                <Badge variant="default" className="h-6 w-fit mx-auto sm:mx-0 rounded-md px-2 text-[10px] font-semibold uppercase tracking-wider bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-sm border-none">
                  {roleName}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 text-muted-foreground text-sm font-medium">
                <div className="flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-primary/60" />
                  {email}
                </div>
                <div className="hidden sm:block h-1 w-1 rounded-full bg-border" />
                <div className="flex items-center gap-1.5">
                  <AtSign className="h-4 w-4 text-primary/60" />
                  {username || "No Username"}
                </div>
              </div>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full md:w-auto gap-2 text-destructive border-destructive/20 hover:bg-destructive hover:text-white transition-colors shrink-0 mb-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>

      <Tabs defaultValue="personal" className="w-full flex flex-col gap-6">
        
        {/* Segmented Control Tabs */}
        <div className="flex w-full">
          <TabsList className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/50 w-fit h-auto">
            <TabsTrigger 
              value="personal" 
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-primary data-[state=active]:shadow-sm text-slate-500 hover:text-slate-900 dark:hover:text-white data-[state=inactive]:bg-transparent"
            >
              <User className="h-4 w-4" />
              Profile Details
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-primary data-[state=active]:shadow-sm text-slate-500 hover:text-slate-900 dark:hover:text-white data-[state=inactive]:bg-transparent"
            >
              <Lock className="h-4 w-4" />
              Security & Access
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Content */}
        <div className="w-full focus-visible:outline-none">
          
          <TabsContent value="personal" className="mt-0 focus-visible:outline-none space-y-6">
            <Card className="border border-border/50 shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="bg-slate-50/50 dark:bg-zinc-900/50 border-b border-border/50 px-8 py-6 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold">Personal Information</CardTitle>
                  <CardDescription>Update your photo and personal details here.</CardDescription>
                </div>
                <Button 
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="h-10 px-4 rounded-xl font-bold bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 transition-all"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  {isEditingProfile ? "Cancel Editing" : "Edit Profile"}
                </Button>
              </CardHeader>
              <form onSubmit={handleProfileUpdate}>
                <CardContent className="px-8 py-8 space-y-8">
                  <div className={cn("flex flex-col sm:flex-row gap-8 items-start", !isEditingProfile && "opacity-80 pointer-events-none")}>
                    
                    {/* Avatar Upload */}
                    <div className="w-full sm:w-auto shrink-0 space-y-3">
                      <Label className="font-semibold text-slate-700 dark:text-slate-300">Profile Picture</Label>
                      <div className="p-2 border border-border rounded-2xl bg-slate-50 dark:bg-zinc-900">
                        <ImageUpload 
                          value={image} 
                          onChange={setImage} 
                          label="Avatar" 
                          folder="RGYCSP/SuperAdmin/Profile" 
                        />
                      </div>
                      <p className="text-xs text-muted-foreground text-center">JPG, PNG or WebP</p>
                    </div>

                    {/* Form Inputs */}
                    <div className="flex-1 space-y-6 w-full">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="font-semibold text-slate-700 dark:text-slate-300">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            id="name"
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            className="pl-10 h-11 bg-background"
                            placeholder="John Doe"
                            readOnly={!isEditingProfile}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="email" className="font-semibold text-slate-700 dark:text-slate-300">Email Address</Label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                              id="email"
                              value={email} 
                              onChange={(e) => setEmail(e.target.value)} 
                              className="pl-10 h-11 bg-background"
                              placeholder="admin@example.com"
                              type="email"
                              readOnly={!isEditingProfile}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="username" className="font-semibold text-slate-700 dark:text-slate-300">Username</Label>
                          <div className="relative">
                            <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                              id="username"
                              value={username} 
                              onChange={(e) => setUsername(e.target.value)} 
                              className="pl-10 h-11 bg-background"
                              placeholder="superadmin123"
                              readOnly={!isEditingProfile}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                  </div>
                </CardContent>
                
                {isEditingProfile && (
                  <CardFooter className="px-8 py-4 border-t border-border/50 bg-slate-50/30 dark:bg-zinc-900/30 flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={isUpdatingProfile}
                      className="h-10 px-6 rounded-xl font-bold shadow-sm"
                    >
                      {isUpdatingProfile ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                      Save Changes
                    </Button>
                  </CardFooter>
                )}
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-0 focus-visible:outline-none space-y-6">
            <Card className="border border-border/50 shadow-sm rounded-xl overflow-hidden relative">
              {/* Subtle top color gradient for security page */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/30" />
              
              <CardHeader className="bg-slate-50/50 dark:bg-zinc-900/50 border-b border-border/50 px-8 py-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold">Security & Access</CardTitle>
                    <CardDescription>Ensure your account is using a strong, unique password.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <form onSubmit={handlePasswordUpdate}>
                <CardContent className="px-0 py-0">
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    
                    {/* Left side: Form */}
                    <div className="lg:col-span-3 px-8 py-8 space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword" className="font-semibold text-slate-700 dark:text-slate-300">Current Password</Label>
                        <div className="relative">
                          <Fingerprint className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            id="currentPassword"
                            value={currentPassword} 
                            onChange={(e) => setCurrentPassword(e.target.value)} 
                            className="pl-10 pr-10 h-11 bg-background"
                            type={showCurrentPassword ? "text" : "password"}
                            placeholder="Enter your current password"
                            required
                          />
                          <button 
                            type="button" 
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          >
                            {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="newPassword" className="font-semibold text-slate-700 dark:text-slate-300">New Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                              id="newPassword"
                              value={newPassword} 
                              onChange={(e) => setNewPassword(e.target.value)} 
                              className="pl-10 pr-10 h-11 bg-background"
                              type={showNewPassword ? "text" : "password"}
                              placeholder="Min. 8 characters"
                              required
                            />
                            <button 
                              type="button" 
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword" className="font-semibold text-slate-700 dark:text-slate-300">Confirm Password</Label>
                          <div className="relative">
                            <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                              id="confirmPassword"
                              value={confirmPassword} 
                              onChange={(e) => setConfirmPassword(e.target.value)} 
                              className="pl-10 pr-10 h-11 bg-background"
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Repeat new password"
                              required
                            />
                            <button 
                              type="button" 
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-lg bg-primary/5 p-4 border border-primary/10 flex items-start gap-3 mt-4">
                        <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                          Your password must be at least 8 characters long. We highly recommend using a mix of letters, numbers, and symbols to ensure maximum security for your super admin account.
                        </p>
                      </div>

                      <div className="flex justify-end pt-2">
                        <Button 
                          type="submit" 
                          disabled={isUpdatingPassword}
                          className="h-10 px-6 rounded-xl font-bold shadow-sm"
                        >
                          {isUpdatingPassword ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
                          Update Password
                        </Button>
                      </div>
                    </div>
                    
                    {/* Right side: Large Lock Icon (Hidden on mobile) */}
                    <div className="hidden lg:flex lg:col-span-2 items-center justify-center p-8 bg-slate-50/50 dark:bg-zinc-900/50 border-l border-border/50">
                      <div className="relative flex items-center justify-center">
                        <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full h-40 w-40" />
                        <Lock className="h-40 w-40 text-primary/20 relative z-10" strokeWidth={1} />
                        <ShieldCheck className="h-16 w-16 text-primary absolute bottom-4 right-4 z-20 bg-background rounded-full p-2 shadow-lg border border-primary/20" />
                      </div>
                    </div>
                    
                  </div>
                </CardContent>
              </form>
            </Card>
          </TabsContent>

        </div>
      </Tabs>
    </div>
  );
}
