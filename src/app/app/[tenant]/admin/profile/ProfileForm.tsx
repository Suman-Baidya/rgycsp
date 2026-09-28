"use client";

import React, { useState, useRef, useMemo, useEffect } from "react";
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
  Edit2,
  Award,
  FileText,
  Download,
  Printer,
  CheckCircle2,
  Clock,
  Building2,
  Sparkles,
  AlertCircle,
  FileCheck2,
  RefreshCw,
  FileSignature
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
import { updateWorkspaceSignature } from "@/app/actions/workspaces";
import { cn } from "@/lib/utils";
import { BiometricPasskeyManager } from "@/components/auth/BiometricPasskeyManager";
import { DocumentRenderer, DocumentRendererRef } from "@/components/documents/DocumentRenderer";

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
  workspace?: any;
  templates?: any[];
}

export function ProfileForm({ user, roleName = "Franchise Admin", tenant, workspace, templates = [] }: ProfileFormProps) {
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // Document issuance & preview state
  const docRendererRef = useRef<DocumentRendererRef>(null);
  const [activeDocType, setActiveDocType] = useState<"FRANCHISE_CERTIFICATE" | "FRANCHISE_ID" | "VISITING_CARD">("FRANCHISE_CERTIFICATE");
  const [docPreviewUrl, setDocPreviewUrl] = useState<string | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isPrintingDoc, setIsPrintingDoc] = useState(false);
  const [isRenderingDoc, setIsRenderingDoc] = useState(false);

  const isIssued = Boolean(workspace?.registrationCertificateApproved);

  // Available templates for active document type
  const availableTemplatesForType = useMemo(() => {
    return (templates || []).filter((t: any) => t.type === activeDocType);
  }, [templates, activeDocType]);

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");

  useEffect(() => {
    if (availableTemplatesForType.length > 0) {
      setSelectedTemplateId(availableTemplatesForType[0].id);
    } else {
      setSelectedTemplateId("");
    }
    setDocPreviewUrl(null);
    setIsRenderingDoc(true);
  }, [activeDocType, availableTemplatesForType]);

  // Format Workspace data payload for DocumentRenderer
  const formattedDocStudent = useMemo(() => {
    if (!workspace) return null;
    return {
      id: user.id || workspace.id,
      name: user.name || workspace.name,
      fullName: user.name || workspace.name,
      email: user.email || workspace.contactEmail || "",
      username: user.username || workspace.centerCode || "",
      photoUrl: user.image || workspace.logoUrl,
      image: user.image || workspace.logoUrl,
      phone: workspace.contactPhone || workspace.siteSettings?.contactPhone || "",
      address: workspace.address || workspace.siteSettings?.address || "",
      certificateNo: workspace.centerCode || `FR-${workspace.id.slice(0, 6).toUpperCase()}`,
      enrollmentNo: workspace.centerCode || user.username || `FR-${workspace.id.slice(0, 6).toUpperCase()}`,
      dob: workspace.createdAt,
      admissionDate: workspace.createdAt,
      centerCode: workspace.centerCode,
      workspace: {
        id: workspace.id,
        name: workspace.name,
        subdomain: workspace.subdomain,
        centerCode: workspace.centerCode,
        logoUrl: workspace.logoUrl,
        signatureUrl: workspace.signatureUrl,
        state: workspace.state || "",
        district: workspace.district || ""
      }
    };
  }, [workspace, user]);

  // Single-page PDF download handler
  const handleDownloadSinglePagePDF = async () => {
    if (!docRendererRef.current) return;
    setIsDownloadingPdf(true);
    try {
      const { jsPDF } = await import("jspdf");
      const imgData = await docRendererRef.current.getImgData();
      const dims = docRendererRef.current.getTemplateDimensions();

      if (!imgData || !dims) {
        toast.error("Document is rendering, please try again in a moment.");
        return;
      }

      const pdf = new jsPDF({
        orientation: dims.orientation,
        unit: "pt",
        format: [dims.width, dims.height]
      });

      pdf.addImage(imgData, "PNG", 0, 0, dims.width, dims.height, undefined, "FAST");
      const cleanName = (workspace?.name || "Franchise").replace(/[^a-zA-Z0-9]/g, "_");
      pdf.save(`${cleanName}_${activeDocType}.pdf`);
      toast.success("Single-page PDF downloaded successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to generate PDF file.");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Single-page Print handler
  const handlePrintSinglePage = async () => {
    if (!docRendererRef.current) return;
    setIsPrintingDoc(true);
    try {
      const { jsPDF } = await import("jspdf");
      const imgData = await docRendererRef.current.getImgData();
      const dims = docRendererRef.current.getTemplateDimensions();

      if (!imgData || !dims) {
        toast.error("Document is rendering, please try again in a moment.");
        return;
      }

      const pdf = new jsPDF({
        orientation: dims.orientation,
        unit: "pt",
        format: [dims.width, dims.height]
      });

      pdf.addImage(imgData, "PNG", 0, 0, dims.width, dims.height, undefined, "FAST");
      pdf.autoPrint();
      window.open(pdf.output("bloburl"), "_blank");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to open print preview.");
    } finally {
      setIsPrintingDoc(false);
    }
  };

  // Profile State
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [username, setUsername] = useState(user.username || "");
  const [image, setImage] = useState(user.image || "");
  const [signatureUrl, setSignatureUrl] = useState(workspace?.signatureUrl || "");

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
    
    if (workspace?.id && signatureUrl !== workspace.signatureUrl) {
      await updateWorkspaceSignature(workspace.id, signatureUrl);
    }

    if (res.success) {
      toast.success("Profile and signature updated successfully");
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
            {workspace && (
              <TabsTrigger 
                value="documents" 
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium shrink-0 whitespace-nowrap transition-all data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-800 data-[state=active]:text-primary dark:data-[state=active]:text-white data-[state=active]:font-semibold data-[state=active]:shadow-inner text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50"
              >
                <Award className="h-3.5 w-3.5" />
                Official Documents
                {isIssued ? (
                  <span className="ml-1 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    Issued
                  </span>
                ) : (
                  <span className="ml-1 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    Pending
                  </span>
                )}
              </TabsTrigger>
            )}
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

                  {/* Authorized Franchise Signature */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
                      <div>
                        <Label className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                          <FileSignature className="h-4 w-4 text-primary" />
                          Authorized Center Signature
                        </Label>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Captured during franchise registration. Automatically applied to Center Notices, Certificates, and Official Memorandums.
                        </p>
                      </div>
                      {signatureUrl && !isEditingProfile && (
                        <Badge variant="outline" className="text-[10px] font-semibold text-emerald-600 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30">
                          Signature On Record
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                      <div className={cn("sm:col-span-1", !isEditingProfile && "opacity-80 pointer-events-none")}>
                        <div className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <ImageUpload
                            value={signatureUrl}
                            onChange={setSignatureUrl}
                            label="Center Sign"
                            folder="RGYCSP/Franchise/Signatures"
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground text-center mt-1">PNG with transparent background recommended</p>
                      </div>
                      <div className="sm:col-span-2">
                        <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-center min-h-[90px]">
                          {signatureUrl ? (
                            <div className="text-center space-y-1.5 py-1">
                              <img src={signatureUrl} alt="Authorized Center Signature" className="max-h-16 mx-auto object-contain bg-white dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs" />
                              <span className="text-[10px] text-slate-400 font-mono block">Active Signature of Center Director</span>
                            </div>
                          ) : (
                            <div className="text-center text-slate-400 py-3">
                              <FileSignature className="h-6 w-6 mx-auto mb-1 text-slate-300 dark:text-slate-600" />
                              <p className="text-xs font-medium">No signature uploaded</p>
                              <p className="text-[10px] text-slate-400">Click &quot;Edit Profile&quot; to upload your authorized center signature</p>
                            </div>
                          )}
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

          {workspace && (
            <TabsContent value="documents" className="mt-0 focus-visible:outline-none space-y-4">
              {!isIssued ? (
                /* Pending Head Office Verification State */
                <Card className="border border-slate-200/80 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                  <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b border-amber-100 dark:border-amber-950/40">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                          <Clock className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                              Official Documents Under Verification
                            </h2>
                            <Badge variant="outline" className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                              Pending Issuance
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Your Franchise Certificate, ID Card, and Visiting Card will be unlocked once authorized by the Head Office.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-4 sm:p-5 space-y-4">
                    <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 flex items-start gap-3">
                      <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed space-y-1">
                        <p className="font-semibold text-amber-900 dark:text-amber-300">
                          Documents Not Yet Issued by Super Admin
                        </p>
                        <p className="text-slate-600 dark:text-slate-400">
                          Central Administration has not yet activated your franchise credentials. Once the Super Admin reviews and issues your affiliation status in the Super Admin Franchises portal, you will be able to preview and download single-page printable PDF files directly from this tab.
                        </p>
                      </div>
                    </div>

                    {/* Pending Document Types Preview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 space-y-2 opacity-75">
                        <div className="flex items-center justify-between">
                          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <Award className="h-4 w-4" />
                          </div>
                          <Badge variant="outline" className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase text-slate-400 border-slate-200 dark:border-slate-700">
                            Locked
                          </Badge>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">Franchise Certificate</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">Official affiliation certificate with registration and verification QR code.</p>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 space-y-2 opacity-75">
                        <div className="flex items-center justify-between">
                          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                            <FileText className="h-4 w-4" />
                          </div>
                          <Badge variant="outline" className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase text-slate-400 border-slate-200 dark:border-slate-700">
                            Locked
                          </Badge>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">Franchise ID Card</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">Accredited administrator and center identity card for branch verification.</p>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 space-y-2 opacity-75">
                        <div className="flex items-center justify-between">
                          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                            <Sparkles className="h-4 w-4" />
                          </div>
                          <Badge variant="outline" className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase text-slate-400 border-slate-200 dark:border-slate-700">
                            Locked
                          </Badge>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">Visiting Card</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">Marketing and contact visiting card ready for print and distribution.</p>
                        </div>
                      </div>
                    </div>

                    {/* Franchise Details Snapshot */}
                    <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 text-xs">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Center Name</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block mt-0.5">{workspace.name}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Center Code</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block mt-0.5">{workspace.centerCode || "Pending"}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Subdomain</span>
                          <span className="font-mono text-slate-800 dark:text-slate-200 truncate block mt-0.5">{workspace.subdomain}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Issuance Status</span>
                          <span className="font-semibold text-amber-600 dark:text-amber-400 block mt-0.5">Awaiting Super Admin Approval</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                /* Officially Issued State */
                <Card className="border border-slate-200/80 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                  {/* Header Banner */}
                  <CardHeader className="bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 p-3.5 sm:p-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                              Official Franchise Credentials & Documents
                            </CardTitle>
                            <Badge className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              Issued & Verified
                            </Badge>
                          </div>
                          <CardDescription className="text-[10px] sm:text-xs text-slate-500">
                            Authorized by Central Administration. You can view, verify, and download single-page printable PDF files.
                          </CardDescription>
                        </div>
                      </div>

                      {/* Quick Download Button in Header */}
                      <Button
                        type="button"
                        onClick={handleDownloadSinglePagePDF}
                        disabled={isDownloadingPdf}
                        className="h-8 sm:h-9 px-3.5 rounded-lg text-xs font-semibold gap-1.5 bg-primary text-primary-foreground shadow-xs shrink-0"
                      >
                        {isDownloadingPdf ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Download className="h-3.5 w-3.5" />
                        )}
                        Download Single-Page PDF
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="p-3.5 sm:p-5 space-y-4">
                    {/* Document Selector Pills & Template Dropdown */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-100 dark:border-slate-800">
                      {/* Document Type Switcher */}
                      <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100/80 dark:bg-slate-800/60 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                        <button
                          type="button"
                          onClick={() => {
                            if (activeDocType !== "FRANCHISE_CERTIFICATE") {
                              setActiveDocType("FRANCHISE_CERTIFICATE");
                            }
                          }}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all",
                            activeDocType === "FRANCHISE_CERTIFICATE"
                              ? "bg-white dark:bg-slate-900 text-primary dark:text-white shadow-xs"
                              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                          )}
                        >
                          <Award className="h-3.5 w-3.5" />
                          Certificate
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (activeDocType !== "FRANCHISE_ID") {
                              setActiveDocType("FRANCHISE_ID");
                            }
                          }}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all",
                            activeDocType === "FRANCHISE_ID"
                              ? "bg-white dark:bg-slate-900 text-primary dark:text-white shadow-xs"
                              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                          )}
                        >
                          <FileText className="h-3.5 w-3.5" />
                          ID Card
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (activeDocType !== "VISITING_CARD") {
                              setActiveDocType("VISITING_CARD");
                            }
                          }}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all",
                            activeDocType === "VISITING_CARD"
                              ? "bg-white dark:bg-slate-900 text-primary dark:text-white shadow-xs"
                              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                          )}
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          Visiting Card
                        </button>
                      </div>

                      {/* Design Template Selector (If multiple templates exist) */}
                      {availableTemplatesForType.length > 1 && (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap">Template Design:</span>
                          <select
                            value={selectedTemplateId}
                            onChange={(e) => {
                              setSelectedTemplateId(e.target.value);
                              setDocPreviewUrl(null);
                              setIsRenderingDoc(true);
                            }}
                            className="h-8 text-xs font-medium rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 px-2.5 text-slate-800 dark:text-slate-200 focus:outline-none"
                          >
                            {availableTemplatesForType.map((t: any) => (
                              <option key={t.id} value={t.id}>
                                {t.name || "Default Design"}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Live Preview Container */}
                    <div className="relative rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-950/60 min-h-[380px] max-h-[560px] overflow-auto p-4 sm:p-6 flex items-center justify-center">
                      {/* DocumentRenderer mounted to generate pixel-perfect PNG and PDF */}
                      <DocumentRenderer
                        ref={docRendererRef}
                        type={activeDocType}
                        templateId={selectedTemplateId || null}
                        student={formattedDocStudent}
                        onReady={async () => {
                          if (docRendererRef.current) {
                            const url = await docRendererRef.current.getImgData();
                            if (url) {
                              setDocPreviewUrl(url);
                              setIsRenderingDoc(false);
                            }
                          }
                        }}
                      />

                      {docPreviewUrl ? (
                        <div className="flex flex-col items-center">
                          <img
                            src={docPreviewUrl}
                            alt={`${activeDocType} Preview`}
                            className="max-h-[500px] w-auto object-contain rounded-lg shadow-xl border border-slate-200/60 dark:border-slate-800"
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400 space-y-3">
                          <div className="h-12 w-12 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                            <Loader2 className="h-6 w-6 text-primary animate-spin" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                              Rendering High-Resolution Document...
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Applying official signatures, verification seals, and branch credentials.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>

                  {/* Actions Footer */}
                  <CardFooter className="px-4 sm:px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <FileCheck2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span>
                        Single-Page Vector PDF • Formatted with High-Res 240+ DPI
                      </span>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handlePrintSinglePage}
                        disabled={isPrintingDoc || !docPreviewUrl}
                        className="h-8 sm:h-9 px-3 rounded-lg text-xs font-semibold gap-1.5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-all"
                      >
                        {isPrintingDoc ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Printer className="h-3.5 w-3.5" />
                        )}
                        Print Document
                      </Button>

                      <Button
                        type="button"
                        onClick={handleDownloadSinglePagePDF}
                        disabled={isDownloadingPdf || !docPreviewUrl}
                        className="h-8 sm:h-9 px-4 rounded-lg text-xs font-semibold gap-1.5 bg-primary text-primary-foreground shadow-xs hover:opacity-90 transition-all"
                      >
                        {isDownloadingPdf ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Download className="h-3.5 w-3.5" />
                        )}
                        Download Single-Page PDF
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              )}
            </TabsContent>
          )}

        </div>
      </Tabs>
    </div>
  );
}
