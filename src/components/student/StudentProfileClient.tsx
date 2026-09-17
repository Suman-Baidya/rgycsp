"use client";

import React, { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  CalendarDays,
  Printer,
  QrCode,
  Share2,
  Check,
  AlertCircle,
  Sparkles,
  GraduationCap,
  CreditCard,
  BadgeCheck,
  Droplet,
  Smartphone,
  CheckCircle,
  FileCheck,
  Fingerprint,
  Trash2,
  X
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { updatePassword } from "@/app/actions/profile";
import { registerPasskeyDevice } from "@/lib/webauthn-client";
import { getUserPasskeys, deletePasskey } from "@/app/actions/webauthn";
import { getTenantLink } from "@/lib/routing";
import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";

interface StudentProfileClientProps {
  student: any;
  profile: any;
  settings?: any;
  tenant: string;
  workspace?: any;
}

export default function StudentProfileClient({
  student,
  profile,
  settings,
  tenant,
  workspace
}: StudentProfileClientProps) {
  const pathname = usePathname();
  const primaryColor = settings?.primaryColor || "#0284c7";
  const workspaceName = workspace?.name || settings?.siteName || "Academic Center";
  const centerCode = workspace?.centerCode || tenant.toUpperCase();
  const centerAddress = workspace?.address || settings?.address || "Institutional Campus";
  const centerPhone = workspace?.phone || settings?.phone || "Contact Institute Office";
  const centerEmail = workspace?.email || settings?.email || "support@rgycsp.org.in";
  const rollNumber = profile?.rollNo || profile?.registrationNo || profile?.enrollmentNo || "Pending";

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<"overview" | "academic" | "documents" | "security">("overview");

  // ID Card Modal state
  const [isIdCardOpen, setIsIdCardOpen] = useState(false);
  const [idCardSide, setIdCardSide] = useState<"front" | "back">("front");
  const [isDownloadingId, setIsDownloadingId] = useState(false);
  const idCardRef = useRef<HTMLDivElement>(null);

  // Password Modal state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Biometric WebAuthn Passkeys state
  const [passkeys, setPasskeys] = useState<any[]>([]);
  const [isLoadingPasskeys, setIsLoadingPasskeys] = useState(false);
  const [isRegisteringPasskey, setIsRegisteringPasskey] = useState(false);
  const [isPasskeyModalOpen, setIsPasskeyModalOpen] = useState(false);
  const [passkeyDeviceName, setPasskeyDeviceName] = useState("");

  // Parse Address helper
  const parsedAddress = useMemo(() => {
    const raw = profile?.address;
    if (!raw) return null;
    if (typeof raw === "object") return raw;
    try {
      return JSON.parse(raw);
    } catch {
      return { line: String(raw) };
    }
  }, [profile?.address]);

  const formattedAddressText = useMemo(() => {
    if (!parsedAddress) return "Address details not registered.";
    if (parsedAddress.line) return parsedAddress.line;

    const parts = [];
    if (parsedAddress.vill) parts.push(`Vill: ${parsedAddress.vill}`);
    if (parsedAddress.po) parts.push(`PO: ${parsedAddress.po}`);
    if (parsedAddress.ps) parts.push(`PS: ${parsedAddress.ps}`);
    if (parsedAddress.dist) parts.push(`Dist: ${parsedAddress.dist}`);
    if (parsedAddress.state) parts.push(`State: ${parsedAddress.state}`);
    if (parsedAddress.pin) parts.push(`PIN: ${parsedAddress.pin}`);

    return parts.join(", ") || "Address details not registered.";
  }, [parsedAddress]);

  // Handle password update
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }
    setIsUpdatingPassword(true);
    try {
      const res = await updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      if (res?.success) {
        toast.success("Password changed successfully!");
        setIsPasswordModalOpen(false);
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        toast.error(res?.error || "Failed to update password.");
      }
    } catch {
      toast.error("An unexpected error occurred while updating your password.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Load enrolled passkeys whenever Security tab is opened
  React.useEffect(() => {
    if (activeTab === "security") {
      setIsLoadingPasskeys(true);
      getUserPasskeys()
        .then((data: any) => {
          if (Array.isArray(data)) setPasskeys(data);
        })
        .catch((err) => console.error("Error fetching passkeys:", err))
        .finally(() => setIsLoadingPasskeys(false));
    }
  }, [activeTab]);

  // Handle passkey registration (FaceID / Fingerprint)
  const handleRegisterPasskey = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegisteringPasskey(true);
    try {
      const res = await registerPasskeyDevice(passkeyDeviceName.trim() || undefined);
      if (res.success) {
        toast.success("Biometric Passkey registered successfully!");
        setIsPasskeyModalOpen(false);
        setPasskeyDeviceName("");
        const refreshed = await getUserPasskeys();
        if (Array.isArray(refreshed)) setPasskeys(refreshed);
      } else {
        toast.error(res.error || "Failed to register biometric device.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Biometric registration failed.");
    } finally {
      setIsRegisteringPasskey(false);
    }
  };

  // Handle passkey revocation
  const handleDeletePasskey = async (id: string) => {
    try {
      const res = await deletePasskey(id);
      if (res.success) {
        toast.success("Passkey removed successfully.");
        setPasskeys((prev) => prev.filter((k) => k.id !== id));
      } else {
        toast.error(res.error || "Failed to remove passkey.");
      }
    } catch {
      toast.error("Failed to remove passkey.");
    }
  };

  // Download ID Card as PDF / Image
  const handleDownloadIdCard = async () => {
    setIsDownloadingId(true);
    const toastId = toast.loading("Generating high-resolution ID card...");

    try {
      const element = document.getElementById("student-id-card-render");
      if (!element) throw new Error("ID card render container not found");

      const { jsPDF } = await import("jspdf");
      const html2canvas = (await import("html2canvas")).default;

      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false
      });

      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      
      // Standard ID card size: 85.6mm x 54mm (Landscape)
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [85.6, 54]
      });

      pdf.addImage(imgData, "JPEG", 0, 0, 85.6, 54);
      pdf.save(`StudentID_${profile?.enrollmentNo || "Card"}.pdf`);

      toast.success("Student ID Card downloaded successfully!", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate ID Card PDF. You can also print it directly.", { id: toastId });
    } finally {
      setIsDownloadingId(false);
    }
  };

  // Print ID Card
  const handlePrintIdCard = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  // Helper date formatter
  const formatDate = (dateStr?: string | Date | null) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? "N/A" : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    } catch {
      return "N/A";
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 w-full mx-auto">
      {/* 1. Page Header (Rule 7.1) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Student Profile & Credentials
            </h1>
            <Badge
              variant="outline"
              className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/30 text-[10px] font-semibold px-2 py-0.5"
            >
              Verified Student
            </Badge>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
            Personal information, enrollment records, and academic credentials.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={() => setIsIdCardOpen(true)}
            variant="outline"
            size="sm"
            className="h-8 sm:h-9 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold gap-1.5 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <CreditCard className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Digital ID Card</span>
          </Button>

          <Button
            onClick={() => setIsPasswordModalOpen(true)}
            variant="default"
            size="sm"
            className="h-8 sm:h-9 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold gap-1.5 shadow-sm text-white"
            style={{ backgroundColor: primaryColor }}
          >
            <KeyRound className="w-3.5 h-3.5 text-white" />
            <span>Change Password</span>
          </Button>
        </div>
      </div>

      {/* 2. Metric / Stat Cards Grid (Rule 7.2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Enrollment Status */}
        <Card className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">
                  Enrollment Status
                </p>
                <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Active
                </h3>
                <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Verified Learner
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-500/10 shrink-0">
                <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metric 2: Enrolled Course */}
        <Card className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">
                  Enrolled Course
                </p>
                <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white truncate max-w-[170px]" title={profile?.course?.name || profile?.courseName || "Assigned"}>
                  {profile?.course?.code || profile?.course?.name?.slice(0, 10) || "Enrolled"}
                </h3>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-[170px]">
                  {profile?.course?.duration || "Modular Diploma"}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-blue-500/10 shrink-0">
                <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metric 3: Academic Batch */}
        <Card className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">
                  Academic Batch
                </p>
                <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white truncate max-w-[170px]">
                  {profile?.batch?.name || "Regular"}
                </h3>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-[170px]">
                  {profile?.batch?.time || "Standard Timing"}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-purple-500/10 shrink-0">
                <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metric 4: Academic Documents */}
        <Card className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-0.5">
                  Credentials & Cards
                </p>
                <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Available
                </h3>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                  ID Card & Records
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-500/10 shrink-0">
                <FileBadge className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Hero Identity Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-950 p-4 sm:p-6 border border-slate-800 shadow-md">
        {/* Glow accents */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none -ml-10 -mb-10" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-center justify-between gap-5">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl ring-4 ring-white/10 shadow-xl shrink-0 overflow-hidden">
              <AvatarImage src={student?.image || profile?.admissionApp?.photoUrl || undefined} />
              <AvatarFallback className="text-2xl font-black bg-gradient-to-br from-primary to-indigo-600 text-white">
                {student?.name?.charAt(0) || "S"}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {student?.name || "Student Learner"}
                </h2>
                <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold text-[9px] uppercase tracking-wider px-2 py-0.5">
                  <CheckCircle2 className="w-2.5 h-2.5 mr-1" />
                  Verified
                </Badge>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-300 pt-0.5">
                <span className="font-mono font-bold text-sky-400 bg-sky-500/15 border border-sky-500/30 px-2 py-0.5 rounded-md">
                  Roll: {profile?.rollNo || profile?.registrationNo || profile?.enrollmentNo || "Pending"}
                </span>
                <span>•</span>
                <span>Enr No: {profile?.enrollmentNo || "Registered"}</span>
                <span>•</span>
                <span>Center: {centerCode}</span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-[11px] text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-400" />
                  {student?.email || "No email"}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  {profile?.phone || "No phone"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              onClick={() => setIsIdCardOpen(true)}
              variant="outline"
              size="sm"
              className="h-8 sm:h-9 px-3.5 rounded-lg text-xs font-semibold gap-1.5 bg-white/10 text-white border-white/20 hover:bg-white hover:text-slate-900 transition-colors"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>View ID Card</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 4. Horizontal Navigation Tabs (Rule 7.3) */}
      <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-1.5 p-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-full">
        <button
          onClick={() => setActiveTab("overview")}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium shrink-0 whitespace-nowrap transition-all",
            activeTab === "overview"
              ? "bg-slate-100 dark:bg-slate-800 text-primary dark:text-white font-semibold shadow-inner"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50"
          )}
        >
          <User className="w-3.5 h-3.5" />
          <span>Personal & Contact</span>
        </button>

        <button
          onClick={() => setActiveTab("academic")}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium shrink-0 whitespace-nowrap transition-all",
            activeTab === "academic"
              ? "bg-slate-100 dark:bg-slate-800 text-primary dark:text-white font-semibold shadow-inner"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50"
          )}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Academic & Batch</span>
        </button>

        <button
          onClick={() => setActiveTab("documents")}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium shrink-0 whitespace-nowrap transition-all",
            activeTab === "documents"
              ? "bg-slate-100 dark:bg-slate-800 text-primary dark:text-white font-semibold shadow-inner"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50"
          )}
        >
          <FileBadge className="w-3.5 h-3.5" />
          <span>Official Documents</span>
        </button>

        <button
          onClick={() => setActiveTab("security")}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium shrink-0 whitespace-nowrap transition-all",
            activeTab === "security"
              ? "bg-slate-100 dark:bg-slate-800 text-primary dark:text-white font-semibold shadow-inner"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-800/50"
          )}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Account Security</span>
        </button>
      </div>

      {/* 5. Tab Content Sections */}

      {/* TAB 1: Personal & Contact */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Personal Demographic Overview (2 Cols) */}
          <Card className="lg:col-span-2 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
            <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div>
                  <CardTitle className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                    Personal Information
                  </CardTitle>
                  <CardDescription className="text-[10px] sm:text-xs text-slate-500">
                    Official demographic records verified by center registrar
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3.5 sm:p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <InfoItem label="Full Name" value={student?.name || "Student"} icon={<User className="w-3.5 h-3.5 text-slate-400" />} />
                <InfoItem label="Official Roll No" value={rollNumber} icon={<Hash className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />} />
                <InfoItem label="Enrollment ID" value={profile?.enrollmentNo || "Registered"} icon={<ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />} />
                <InfoItem label="Father's Name" value={profile?.fatherName || "N/A"} icon={<Users className="w-3.5 h-3.5 text-slate-400" />} />
                <InfoItem label="Mother's Name" value={profile?.motherName || "N/A"} icon={<Users className="w-3.5 h-3.5 text-slate-400" />} />
                <InfoItem label="Date of Birth" value={formatDate(profile?.dob)} icon={<Calendar className="w-3.5 h-3.5 text-slate-400" />} />
                <InfoItem label="Gender" value={profile?.gender || "Not Specified"} icon={<User className="w-3.5 h-3.5 text-slate-400" />} />
                <InfoItem label="Blood Group" value={profile?.bloodGroup || "Not Specified"} icon={<Droplet className="w-3.5 h-3.5 text-rose-500" />} />
              </div>

              {/* Permanent Address */}
              <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center text-primary shadow-xs shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                      Permanent Postal Address
                    </span>
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                      {formattedAddressText}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Details (1 Col) */}
          <Card className="rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
            <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <div>
                  <CardTitle className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                    Contact Channels
                  </CardTitle>
                  <CardDescription className="text-[10px] sm:text-xs text-slate-500">
                    Official phone, WhatsApp & email
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3.5 sm:p-4 space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center text-slate-500 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Registered Email</span>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{student?.email || "N/A"}</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center text-slate-500 shrink-0">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Primary Mobile</span>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">{profile?.phone || "N/A"}</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">WhatsApp Alerts</span>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">{profile?.whatsappNo || profile?.phone || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: Academic & Batch */}
      {activeTab === "academic" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {/* Course Details */}
          <Card className="rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
            <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <div>
                  <CardTitle className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                    Program & Curriculum
                  </CardTitle>
                  <CardDescription className="text-[10px] sm:text-xs text-slate-500">
                    Enrolled academic syllabus and duration
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3.5 sm:p-4 space-y-3.5">
              <InfoItem label="Course Title" value={profile?.course?.name || profile?.courseName || "Assigned Course"} icon={<BookOpen className="w-3.5 h-3.5 text-slate-400" />} />
              <InfoItem label="Course Code" value={profile?.course?.code || "MOD-DIP"} icon={<Hash className="w-3.5 h-3.5 text-slate-400" />} />
              <InfoItem label="Program Duration" value={profile?.course?.duration || "12 Months"} icon={<Clock className="w-3.5 h-3.5 text-slate-400" />} />
              <InfoItem label="Total Semesters / Modules" value={profile?.semesters?.length ? `${profile.semesters.length} Semesters` : "Modular Certification"} icon={<GraduationCap className="w-3.5 h-3.5 text-slate-400" />} />
            </CardContent>
          </Card>

          {/* Batch & Center Details */}
          <Card className="rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
            <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Building className="w-3.5 h-3.5" />
                </div>
                <div>
                  <CardTitle className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                    Center Affiliation & Batch
                  </CardTitle>
                  <CardDescription className="text-[10px] sm:text-xs text-slate-500">
                    Institution center code and lecture schedule
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3.5 sm:p-4 space-y-3.5">
              <InfoItem label="Training Center" value={workspaceName} icon={<Building className="w-3.5 h-3.5 text-slate-400" />} />
              <InfoItem label="Center Code" value={centerCode} icon={<Hash className="w-3.5 h-3.5 text-slate-400" />} />
              <InfoItem label="Assigned Batch" value={profile?.batch?.name || "Regular Batch"} icon={<Users className="w-3.5 h-3.5 text-slate-400" />} />
              <InfoItem label="Batch Timings" value={profile?.batch?.time || "Regular Classroom Hours"} icon={<Clock className="w-3.5 h-3.5 text-slate-400" />} />
              <InfoItem label="Admission Date" value={formatDate(profile?.admissionDate || profile?.createdAt)} icon={<CalendarDays className="w-3.5 h-3.5 text-slate-400" />} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 3: Official Documents */}
      {activeTab === "documents" && (
        <div className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {/* Document 1: Digital ID Card */}
            <div className="p-3.5 sm:p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:border-primary/40 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      Digital Student ID Card
                    </h4>
                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none text-[9px] font-bold px-1.5 py-0.5 uppercase">
                      Issued
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Official photo identity card with QR code verification.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  onClick={() => setIsIdCardOpen(true)}
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 rounded-lg text-xs font-semibold gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Card</span>
                </Button>
                <Button
                  onClick={() => {
                    setIsIdCardOpen(true);
                    setTimeout(() => handleDownloadIdCard(), 300);
                  }}
                  variant="default"
                  size="sm"
                  className="h-8 px-3 rounded-lg text-xs font-semibold gap-1.5 text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </Button>
              </div>
            </div>

            {/* Document 2: Admit Card */}
            <div className="p-3.5 sm:p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:border-primary/40 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      Examination Admit Card
                    </h4>
                    <Badge
                      className={cn(
                        "border-none text-[9px] font-bold px-1.5 py-0.5 uppercase",
                        profile?.admitIssued
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      )}
                    >
                      {profile?.admitIssued ? "Available" : "Check Exam Tab"}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Hall ticket entry pass for scheduled exams.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link href={getTenantLink("/student/exams", tenant, pathname)}>
                  <Button variant="outline" size="sm" className="h-8 px-3 rounded-lg text-xs font-semibold gap-1.5">
                    <span>Exams Portal</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Document 3: Marksheet */}
            <div className="p-3.5 sm:p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:border-primary/40 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      Academic Marksheet
                    </h4>
                    <Badge
                      className={cn(
                        "border-none text-[9px] font-bold px-1.5 py-0.5 uppercase",
                        profile?.marksheetIssuedToStudent
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      )}
                    >
                      {profile?.marksheetIssuedToStudent ? "Issued" : "Under Evaluation"}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {profile?.marksheetNo ? `Marksheet No: ${profile.marksheetNo}` : "Term evaluation grade report"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link href={getTenantLink("/student/exams", tenant, pathname)}>
                  <Button variant="outline" size="sm" className="h-8 px-3 rounded-lg text-xs font-semibold gap-1.5">
                    <span>View Results</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Document 4: Certificate */}
            <div className="p-3.5 sm:p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:border-primary/40 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                  <FileBadge className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      Completion Certificate
                    </h4>
                    <Badge
                      className={cn(
                        "border-none text-[9px] font-bold px-1.5 py-0.5 uppercase",
                        profile?.certificateIssuedToStudent
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      )}
                    >
                      {profile?.certificateIssuedToStudent ? "Issued" : "In Progress"}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {profile?.certificateNo ? `Cert No: ${profile.certificateNo}` : "Final certified diploma accreditation"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  onClick={() => toast.info("Your final certificate will be unlocked upon completion of all term modules and exams.")}
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 rounded-lg text-xs font-semibold gap-1.5"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>Status</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Account Security */}
      {activeTab === "security" && (
        <div className="space-y-4">
          {/* Card 1: Password & Credentials */}
          <Card className="rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
            <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <CardTitle className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                    Account Credentials & Password
                  </CardTitle>
                  <CardDescription className="text-[10px] sm:text-xs text-slate-500">
                    Manage your portal login security and password credentials
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3.5 sm:p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center text-slate-500 shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Username</span>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{student?.username || student?.email || "Enrolled User"}</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center text-slate-500 shrink-0">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Password</span>
                      <p className="text-sm font-bold tracking-widest text-slate-900 dark:text-white">••••••••••••</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setIsPasswordModalOpen(true)}
                    size="sm"
                    className="h-8 px-3 rounded-lg text-xs font-semibold text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Change
                  </Button>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/40 text-xs text-blue-800 dark:text-blue-300 flex items-center gap-2.5">
                <Info className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
                <span>
                  Your login credentials provide access to exams, fee payment vouchers, and official marksheets. Never share your password with anyone.
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Biometric Passkeys (FaceID / Fingerprint) */}
          <Card className="rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
            <CardHeader className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Fingerprint className="w-3.5 h-3.5" />
                </div>
                <div>
                  <CardTitle className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                    Biometric Passkeys & Fast Login
                  </CardTitle>
                  <CardDescription className="text-[10px] sm:text-xs text-slate-500">
                    Sign in with FaceID, TouchID, or Windows Hello on your mobile phone or laptop without entering passwords.
                  </CardDescription>
                </div>
              </div>

              <Button
                onClick={() => setIsPasskeyModalOpen(true)}
                size="sm"
                className="h-8 px-3 rounded-lg text-xs font-semibold gap-1.5 shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
              >
                <Fingerprint className="w-3.5 h-3.5" />
                <span>Add FaceID / Fingerprint</span>
              </Button>
            </CardHeader>
            <CardContent className="p-3.5 sm:p-5 space-y-4">
              {isLoadingPasskeys ? (
                <div className="flex items-center justify-center py-6 gap-2 text-xs text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                  <span>Loading enrolled biometric devices...</span>
                </div>
              ) : passkeys.length === 0 ? (
                <div className="p-5 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2.5 bg-slate-50/50 dark:bg-slate-800/20">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                    <Fingerprint className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      No Biometric Devices Registered Yet
                    </h4>
                    <p className="text-[11px] text-slate-500 max-w-md mx-auto mt-0.5">
                      Register this device's FaceID, Fingerprint sensor, or Windows Hello to sign in instantly with one touch.
                    </p>
                  </div>
                  <Button
                    onClick={() => setIsPasskeyModalOpen(true)}
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs font-semibold mt-1 border-slate-200 dark:border-slate-700"
                  >
                    Register This Device Now
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
                  {passkeys.map((key) => (
                    <div
                      key={key.id}
                      className="p-3 sm:p-3.5 flex items-center justify-between gap-3 bg-white dark:bg-slate-900 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          <Smartphone className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                              {key.deviceName || "Biometric Passkey Device"}
                            </h4>
                            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none text-[9px] font-bold px-1.5 py-0.5 uppercase">
                              Active
                            </Badge>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            Added on {new Date(key.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                            {key.lastUsedAt && ` • Last used: ${new Date(key.lastUsedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}`}
                          </p>
                        </div>
                      </div>

                      <Button
                        onClick={() => handleDeletePasskey(key.id)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg"
                        title="Remove Passkey"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 1: Digital Student ID Card (View, Download, Print)     */}
      {/* ============================================================ */}
      <Dialog open={isIdCardOpen} onOpenChange={setIsIdCardOpen}>
        <DialogContent className="max-w-lg rounded-2xl p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-900">
          <div className="p-3.5 sm:p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-sky-400" />
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight leading-none">
                  Official Student Identity Card
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Roll: {rollNumber} • Session 2026
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-white/10 text-xs">
              <button
                onClick={() => setIdCardSide("front")}
                className={cn(
                  "px-2.5 py-0.5 rounded font-semibold transition-all",
                  idCardSide === "front" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-white"
                )}
              >
                Front
              </button>
              <button
                onClick={() => setIdCardSide("back")}
                className={cn(
                  "px-2.5 py-0.5 rounded font-semibold transition-all",
                  idCardSide === "back" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-white"
                )}
              >
                Back
              </button>
            </div>
          </div>

          {/* ID Card Display Area */}
          <div className="p-4 sm:p-6 bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center overflow-x-auto">
            {/* The Actual ID Card Render Container (85.6mm x 54mm standard credit card aspect) */}
            <div
              id="student-id-card-render"
              className="w-[360px] h-[225px] sm:w-[400px] sm:h-[250px] bg-white text-slate-900 rounded-2xl shadow-xl overflow-hidden border-2 border-slate-900 relative flex flex-col justify-between font-sans select-none"
            >
              {idCardSide === "front" ? (
                /* FRONT SIDE */
                <div className="h-full flex flex-col justify-between p-3 relative bg-gradient-to-br from-white via-slate-50 to-blue-50">
                  {/* Top Center Letterhead */}
                  <div className="border-b-2 border-slate-900 pb-1.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="w-7 h-7 rounded-md bg-slate-900 text-white flex items-center justify-center shrink-0">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-[11px] font-black uppercase text-slate-900 leading-none truncate">
                          {workspaceName}
                        </h4>
                        <p className="text-[7.5px] font-semibold text-slate-600 uppercase tracking-tight mt-0.5">
                          Affiliated to RGYCSM • Center: {centerCode}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-slate-900 text-white border-none text-[8px] font-bold uppercase tracking-wider px-1.5 py-0">
                      Student ID
                    </Badge>
                  </div>

                  {/* Body: Photo + Details + QR */}
                  <div className="flex items-center gap-3 flex-1 py-1">
                    {/* Student Photo */}
                    <div className="w-18 h-22 sm:w-20 sm:h-24 rounded-lg overflow-hidden border-2 border-slate-900 bg-slate-100 shadow-sm shrink-0 flex items-center justify-center">
                      {student?.image || profile?.admissionApp?.photoUrl ? (
                        <img
                          src={student?.image || profile?.admissionApp?.photoUrl}
                          alt="Student"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-10 h-10 text-slate-400" />
                      )}
                    </div>

                    {/* Information Grid */}
                    <div className="space-y-1 text-left flex-1 min-w-0">
                      <div>
                        <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-tight uppercase truncate">
                          {student?.name || "Student Learner"}
                        </h3>
                        <p className="text-[9px] font-bold text-blue-700 truncate">
                          {profile?.course?.name || profile?.courseName || "Computer Diploma Course"}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[8.5px] pt-0.5">
                        <div>
                          <span className="text-slate-500 font-bold block text-[7px] uppercase">Enr. Number</span>
                          <span className="font-bold text-slate-900 font-mono">{profile?.enrollmentNo || "2026-ENR-01"}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-bold block text-[7px] uppercase">Roll No</span>
                          <span className="font-bold text-slate-900 font-mono">{rollNumber}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-bold block text-[7px] uppercase">Blood Group</span>
                          <span className="font-bold text-slate-900">{profile?.bloodGroup || "Not Specified"}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-bold block text-[7px] uppercase">Contact</span>
                          <span className="font-bold text-slate-900">{profile?.phone || "Not Provided"}</span>
                        </div>
                      </div>
                    </div>

                    {/* QR Code */}
                    <div className="p-1 rounded-md bg-white border border-slate-200 shrink-0 shadow-xs flex flex-col items-center">
                      <QRCodeSVG
                        value={typeof window !== "undefined" ? `${window.location.origin}/verify/student/${profile?.enrollmentNo || rollNumber}` : `https://${tenant}.rgycsp.org.in/verify/student/${profile?.enrollmentNo || rollNumber}`}
                        size={48}
                        level="M"
                      />
                      <span className="text-[6.5px] font-bold uppercase text-slate-400 mt-0.5">Scan to Verify</span>
                    </div>
                  </div>

                  {/* Bottom Strip */}
                  <div className="border-t border-slate-200 pt-1 flex items-center justify-between text-[7.5px] text-slate-500">
                    <span>Valid: Session {profile?.session || `${new Date().getFullYear()}–${new Date().getFullYear() + 1}`}</span>
                    <span className="font-bold text-slate-800 uppercase">Authorized Signatory</span>
                  </div>
                </div>
              ) : (
                /* BACK SIDE */
                <div className="h-full flex flex-col justify-between p-3 relative bg-slate-50 text-slate-800">
                  <div className="border-b border-slate-300 pb-1 text-center">
                    <h5 className="text-[9px] font-bold uppercase text-slate-900">
                      Terms & Institutional Instructions
                    </h5>
                  </div>

                  <div className="text-[7.5px] text-slate-600 space-y-1 py-1 leading-tight">
                    <p>1. This card is non-transferable and must be carried at all times on the center campus.</p>
                    <p>2. In case of loss or theft, report immediately to the Center Administration Office.</p>
                    <p>3. Mandatory to present this card along with Admit Card during examination entry.</p>
                    <p>4. Property of {workspaceName}. If found, please return to the address below.</p>
                  </div>

                  <div className="border-t border-slate-300 pt-1 text-center space-y-0.5 text-[7px] text-slate-500">
                    <p className="font-bold text-slate-800 uppercase">{workspaceName}</p>
                    <p>{centerAddress} • Phone: {centerPhone}</p>
                    <p>Web: {typeof window !== "undefined" ? window.location.host : `${tenant}.rgycsp.org.in`} • Email: {centerEmail}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="p-3.5 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrintIdCard}
              className="h-8 text-xs font-medium rounded-lg gap-1.5 border-slate-200 dark:border-slate-700"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print Card</span>
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                disabled={isDownloadingId}
                onClick={handleDownloadIdCard}
                className="h-8 px-3.5 text-xs font-semibold rounded-lg shadow-sm gap-1.5 text-white"
                style={{ backgroundColor: primaryColor }}
              >
                {isDownloadingId ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>Download PDF</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsIdCardOpen(false)}
                className="h-8 px-3 text-xs font-semibold rounded-lg border-slate-200 dark:border-slate-700"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ============================================================ */}
      {/* MODAL 2: Change Password Dialog (Rule 7.7)                   */}
      {/* ============================================================ */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-900">
          <div className="bg-slate-900 p-4 sm:p-5 relative text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Lock className="w-4 h-4 text-white" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-white tracking-tight leading-snug">
                  Change Password
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-300">
                  Update your student portal credentials
                </DialogDescription>
              </div>
            </div>
          </div>

          <form onSubmit={handlePasswordUpdate} className="p-4 sm:p-6 space-y-3.5 bg-white dark:bg-slate-900">
            <div className="space-y-1">
              <Label htmlFor="currentPassword" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Current Password
              </Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPassword.current ? "text" : "password"}
                  placeholder="Enter current password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                  required
                  className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => ({ ...s, current: !s.current }))}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword.current ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="newPassword" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword.new ? "text" : "password"}
                  placeholder="Minimum 6 characters"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                  required
                  className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => ({ ...s, new: !s.new }))}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword.new ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="confirmPassword" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Confirm New Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPassword.confirm ? "text" : "password"}
                  placeholder="Re-enter new password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                  className="h-8 sm:h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => ({ ...s, confirm: !s.confirm }))}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword.confirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="submit"
                disabled={isUpdatingPassword}
                className="w-full h-8 sm:h-9 rounded-lg font-semibold text-xs text-white"
                style={{ backgroundColor: primaryColor }}
              >
                {isUpdatingPassword ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save New Password"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ============================================================ */}
      {/* MODAL 3: Biometric Passkey Registration Modal (WebAuthn)     */}
      {/* ============================================================ */}
      <Dialog open={isPasskeyModalOpen} onOpenChange={setIsPasskeyModalOpen}>
        <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-900">
          <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-white/20">
                <Fingerprint className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-sm font-bold text-white tracking-tight leading-tight">
                  Enroll Biometric Device
                </DialogTitle>
                <DialogDescription className="text-[11px] text-emerald-100">
                  Register FaceID, TouchID, or Windows Hello
                </DialogDescription>
              </div>
            </div>
          </div>

          <form onSubmit={handleRegisterPasskey} className="p-4 sm:p-5 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Device Nickname (Optional)
              </Label>
              <Input
                value={passkeyDeviceName}
                onChange={(e) => setPasskeyDeviceName(e.target.value)}
                placeholder="e.g. My iPhone, MacBook Pro, Work Laptop"
                className="h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
              />
              <p className="text-[10px] text-slate-500">
                Helps you identify which phone or computer is registered.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
              <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Hardware-Backed Security
              </p>
              <p>
                When you click continue, your device's biometric prompt will open. Your biometric data never leaves your device.
              </p>
            </div>

            <DialogFooter className="pt-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPasskeyModalOpen(false)}
                disabled={isRegisteringPasskey}
                className="h-9 text-xs rounded-lg"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isRegisteringPasskey}
                className="h-9 text-xs rounded-lg font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
              >
                {isRegisteringPasskey ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Awaiting Biometric Prompt...</span>
                  </>
                ) : (
                  <>
                    <Fingerprint className="w-3.5 h-3.5" />
                    <span>Scan Biometrics Now</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoItem({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50/70 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50">
      <div className="w-7 h-7 rounded-md bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-2xs">
        {icon}
      </div>
      <div className="min-w-0">
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">{label}</span>
        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{value}</p>
      </div>
    </div>
  );
}
