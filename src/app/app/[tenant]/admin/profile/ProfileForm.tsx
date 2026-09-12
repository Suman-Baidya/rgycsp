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
import { BiometricPasskeyManager } from "@/components/auth/BiometricPasskeyManager";

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
    
    const res = await updateProfile({ name, email, username, image, targetUserId: user.id });
    
    if (res.success) {
      toast.success("Profile updated successfully");
      setIsEditingProfile(false);
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
    const res = await updatePassword({ currentPassword, newPassword, targetUserId: user.id });
    
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
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300">
      
      {/* Clean Premium Profile Header Banner */}
      <Card className="relative overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="absolute inset-0 h-20 sm:h-24 bg-gradient-to-r from-blue-500/15 via-purple-500/15 to-pink-500/15 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-pink-500/10" />
        
        <div className="flex flex-col sm:flex-row gap-3.5 sm:gap-4 items-start sm:items-end justify-between px-4 sm:px-6 pb-4 sm:pb-5 pt-10 sm:pt-12 relative z-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-3.5 sm:gap-4 w-full">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border-2 sm:border-3 border-white dark:border-slate-900 shadow-md bg-gradient-to-br from-primary/20 to-primary/5 overflow-hidden relative shrink-0">
              {image ? (
                <img src={image} alt={name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <User className="h-8 w-8 sm:h-10 sm:w-10 text-primary/50" />
                </div>
              )}
            </div>
            <div className="space-y-1 text-center sm:text-left flex-1 pb-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">{name || "Administrator"}</h1>
                <Badge variant="default" className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border-none bg-primary text-primary-foreground w-fit mx-auto sm:mx-0">
                  {roleName}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-slate-500 dark:text-slate-400 text-xs font-medium">
                <div className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-primary/60" />
                  {email}
                </div>
                <div className="hidden sm:block h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                <div className="flex items-center gap-1.5">
                  <AtSign className="h-3.5 w-3.5 text-primary/60" />
                  {username || "No Username"}
                </div>
              </div>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            onClick={async () => {
              const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
              const protocol = typeof window !== 'undefined' && window.location.hostname.includes("localhost") ? "http" : "https";
              await signOut({ redirect: false });
              window.location.href = `${protocol}://${rootDomain}/`;
            }}
            className="w-full sm:w-auto h-8 sm:h-9 px-3 rounded-lg text-xs font-semibold gap-1.5 border-rose-200 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors shrink-0"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </Button>
        </div>
      </Card>

      <Tabs defaultValue="personal" className="w-full flex flex-col gap-4">
        
        {/* Horizontal Navigation Tabs (Rule 7.3) */}
        <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-1.5 p-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-full">
          <TabsList className="flex gap-1.5 bg-transparent p-0 h-auto">
            <TabsTrigger 
              value="personal" 
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium shrink-0 whitespace-nowrap transition-all data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-800 data-[state=active]:text-primary dark:data-[state=active]:text-white data-[state=active]:font-semibold data-[state=active]:shadow-inner text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50"
            >
              <User className="h-3.5 w-3.5" />
              Profile Details
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium shrink-0 whitespace-nowrap transition-all data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-800 data-[state=active]:text-primary dark:data-[state=active]:text-white data-[state=active]:font-semibold data-[state=active]:shadow-inner text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50"
            >
              <Lock className="h-3.5 w-3.5" />
              Security & Access
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Content */}
        <div className="w-full focus-visible:outline-none">
          
          <TabsContent value="personal" className="mt-0 focus-visible:outline-none space-y-4">
            <Card className="border border-slate-200/80 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
              <CardHeader className="bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 p-3.5 sm:p-4 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Personal Information</CardTitle>
                  <CardDescription className="text-[10px] sm:text-xs text-slate-500">Update your photo and personal details within this franchise.</CardDescription>
                </div>
                <Button 
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="h-8 px-3 rounded-lg text-xs font-semibold gap-1.5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-xs hover:bg-slate-50 transition-all"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  {isEditingProfile ? "Cancel Editing" : "Edit Profile"}
                </Button>
              </CardHeader>
              <form onSubmit={handleProfileUpdate}>
                <CardContent className="p-3.5 sm:p-5 space-y-4">
                  <div className={cn("flex flex-col sm:flex-row gap-4 sm:gap-6 items-start", !isEditingProfile && "opacity-80 pointer-events-none")}>
                    
                    {/* Avatar Upload */}
                    <div className="w-full sm:w-auto shrink-0 space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Profile Picture</Label>
                      <div className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <ImageUpload 
                          value={image} 
                          onChange={setImage} 
                          label="Avatar" 
                          folder="RGYCSP/FranchiseAdmin/Profile" 
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground text-center">JPG, PNG or WebP</p>
                    </div>

                    {/* Form Inputs */}
                    <div className="flex-1 space-y-3 sm:space-y-4 w-full">
                      <div className="space-y-1">
                        <Label htmlFor="name" className="text-xs font-medium text-slate-700 dark:text-slate-300">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                          <Input 
                            id="name"
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            className="h-8 sm:h-9 pl-8 text-xs bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 rounded-lg"
                            placeholder="John Doe"
                            readOnly={!isEditingProfile}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        <div className="space-y-1">
                          <Label htmlFor="email" className="text-xs font-medium text-slate-700 dark:text-slate-300">Email Address</Label>
                          <div className="relative">
                            <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                            <Input 
                              id="email"
                              value={email} 
                              onChange={(e) => setEmail(e.target.value)} 
                              className="h-8 sm:h-9 pl-8 text-xs bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 rounded-lg"
                              placeholder="admin@example.com"
                              type="email"
                              readOnly={!isEditingProfile}
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor="username" className="text-xs font-medium text-slate-700 dark:text-slate-300">Username</Label>
                          <div className="relative">
                            <AtSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                            <Input 
                              id="username"
                              value={username} 
                              onChange={(e) => setUsername(e.target.value)} 
                              className="h-8 sm:h-9 pl-8 text-xs bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 rounded-lg"
                              placeholder="admin123"
                              readOnly={!isEditingProfile}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                  </div>
                </CardContent>
                
                {isEditingProfile && (
                  <CardFooter className="px-4 sm:px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={isUpdatingProfile}
                      className="h-8 sm:h-9 px-4 gap-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground shadow-xs"
                    >
                      {isUpdatingProfile ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                      Save Changes
                    </Button>
                  </CardFooter>
                )}
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-0 focus-visible:outline-none space-y-4">
            <Card className="border border-slate-200/80 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900 relative">
              <CardHeader className="bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 p-3.5 sm:p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Security & Access</CardTitle>
                    <CardDescription className="text-[10px] sm:text-xs text-slate-500">Ensure your account is using a strong, unique password.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <form onSubmit={handlePasswordUpdate}>
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
                    
                    {/* Left side: Form */}
                    <div className="lg:col-span-3 p-4 sm:p-5 space-y-4">
                      <div className="space-y-1">
                        <Label htmlFor="currentPassword" className="text-xs font-medium text-slate-700 dark:text-slate-300">Current Password</Label>
                        <div className="relative">
                          <Fingerprint className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                          <Input 
                            id="currentPassword"
                            value={currentPassword} 
                            onChange={(e) => setCurrentPassword(e.target.value)} 
                            className="h-8 sm:h-9 pl-8 pr-9 text-xs bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 rounded-lg"
                            type={showCurrentPassword ? "text" : "password"}
                            placeholder="Enter your current password"
                            required
                          />
                          <button 
                            type="button" 
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          >
                            {showCurrentPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        <div className="space-y-1">
                          <Label htmlFor="newPassword" className="text-xs font-medium text-slate-700 dark:text-slate-300">New Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                            <Input 
                              id="newPassword"
                              value={newPassword} 
                              onChange={(e) => setNewPassword(e.target.value)} 
                              className="h-8 sm:h-9 pl-8 pr-9 text-xs bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 rounded-lg"
                              type={showNewPassword ? "text" : "password"}
                              placeholder="Min. 8 characters"
                              required
                            />
                            <button 
                              type="button" 
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                              {showNewPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor="confirmPassword" className="text-xs font-medium text-slate-700 dark:text-slate-300">Confirm Password</Label>
                          <div className="relative">
                            <ShieldCheck className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                            <Input 
                              id="confirmPassword"
                              value={confirmPassword} 
                              onChange={(e) => setConfirmPassword(e.target.value)} 
                              className="h-8 sm:h-9 pl-8 pr-9 text-xs bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 rounded-lg"
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Repeat new password"
                              required
                            />
                            <button 
                              type="button" 
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-lg bg-primary/5 p-3 border border-primary/10 flex items-start gap-2.5">
                        <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          Your password must be at least 8 characters long with a mix of letters, numbers, and symbols to ensure maximum security.
                        </p>
                      </div>

                      <div className="flex justify-end pt-1">
                        <Button 
                          type="submit" 
                          disabled={isUpdatingPassword}
                          className="h-8 sm:h-9 px-4 gap-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground shadow-xs"
                        >
                          {isUpdatingPassword ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Lock className="h-3.5 w-3.5" />}
                          Update Password
                        </Button>
                      </div>
                    </div>
                    
                    {/* Right side: Decorative Security Icon */}
                    <div className="hidden lg:flex lg:col-span-2 items-center justify-center p-6 bg-slate-50/50 dark:bg-slate-800/20 border-l border-slate-100 dark:border-slate-800">
                      <div className="relative flex items-center justify-center">
                        <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full h-28 w-28" />
                        <Lock className="h-24 w-24 text-primary/20 relative z-10" strokeWidth={1} />
                        <ShieldCheck className="h-10 w-10 text-primary absolute bottom-1 right-1 z-20 bg-white dark:bg-slate-900 rounded-full p-1.5 shadow-md border border-primary/20" />
                      </div>
                    </div>
                    
                  </div>
                </CardContent>
              </form>
            </Card>

            {/* Biometric Passkey Hardware Management */}
            <BiometricPasskeyManager userRole="Franchise Administrator" />
          </TabsContent>

        </div>
      </Tabs>
    </div>
  );
}
