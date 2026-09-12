"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { getPostLoginRedirect } from "@/app/actions/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Lock,
  ArrowRight,
  Loader2,
  ShieldCheck,
  AlertCircle,
  Building2,
  GraduationCap,
  Eye,
  EyeOff,
  Fingerprint,
  KeyRound
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { loginWithPasskey } from "@/lib/webauthn-client";

export function LoginForm({
  tenantName,
  tenantLogo,
  primaryColor,
  callbackUrl,
  isGlobal,
  tenantSlug,
  variant,
  centerCode,
}: {
  tenantName?: string;
  tenantLogo?: string | null;
  primaryColor?: string | null;
  callbackUrl?: string;
  isGlobal?: boolean;
  tenantSlug?: string;
  variant?: "super-admin" | "franchise" | "global";
  centerCode?: string | null;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const isSuperAdmin = variant === "super-admin" || (isGlobal && !tenantSlug);
  const isFranchise = variant === "franchise" || (!!tenantSlug && tenantSlug !== "super-admin");
  const effectiveBrandColor = primaryColor || (isSuperAdmin ? "#4f46e5" : "#0284c7");

  const handleBiometricLogin = async () => {
    setIsBiometricLoading(true);
    setError(null);
    try {
      const usernameInput = (document.querySelector('input[name="username"]') as HTMLInputElement)?.value;
      const res = await loginWithPasskey(usernameInput?.trim() || undefined, tenantSlug);

      if (!res.success) {
        setError(res.error || "Biometric authentication was cancelled or failed.");
        toast.error(res.error || "Biometric login failed");
      } else {
        toast.success("Biometric authentication verified! Redirecting...");
        const redirectUrl = await getPostLoginRedirect(window.location.host, window.location.pathname);
        window.location.href = redirectUrl;
      }
    } catch (err: any) {
      setError(err?.message || "Biometric login encountered an unexpected error.");
      toast.error("Biometric authentication error");
    } finally {
      setIsBiometricLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    if (!username || !password) {
      setError("Please fill in all fields.");
      setIsLoading(false);
      return;
    }

    try {
      const result = await signIn("credentials", {
        username,
        password,
        tenantSlug: tenantSlug || (isSuperAdmin ? "super-admin" : undefined),
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid credentials. Please check your username and password.");
        toast.error("Authentication failed");
      } else {
        toast.success("Welcome back!");
        const redirectUrl = await getPostLoginRedirect(window.location.host, window.location.pathname);
        window.location.href = redirectUrl;
      }
    } catch (err) {
      setError("An unexpected error occurred during login.");
      toast.error("Connection error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[420px] mx-auto px-3 sm:px-4 relative animate-in fade-in duration-500">
      {/* Decorative Glowing Orbs */}
      <div 
        className="absolute -top-20 -left-20 w-48 h-48 rounded-full blur-[90px] pointer-events-none opacity-40 dark:opacity-30"
        style={{ backgroundColor: effectiveBrandColor }} 
      />
      <div 
        className="absolute -bottom-20 -right-20 w-52 h-52 rounded-full blur-[100px] pointer-events-none opacity-30 dark:opacity-20"
        style={{ backgroundColor: isSuperAdmin ? "#f59e0b" : "#38bdf8" }} 
      />

      <Card className="relative rounded-2xl sm:rounded-[2rem] border border-slate-200/80 dark:border-zinc-800/80 shadow-xl dark:shadow-[0_24px_80px_-12px_rgba(0,0,0,0.95)] bg-white/95 dark:bg-[#0c0d14]/95 backdrop-blur-2xl overflow-hidden">
        {/* Proper Top Accent Line */}
        <div className="relative h-1 sm:h-1.5 w-full overflow-hidden z-10">
          <div 
            className="absolute inset-0"
            style={{
              background: isSuperAdmin
                ? "linear-gradient(90deg, transparent 0%, #6366f1 25%, #818cf8 50%, #f59e0b 75%, transparent 100%)"
                : `linear-gradient(90deg, transparent 0%, ${effectiveBrandColor} 50%, transparent 100%)`
            }}
          />
          {isLoading && (
            <div className="absolute inset-0 bg-white/40 animate-pulse transition-all duration-500" />
          )}
        </div>

        <CardContent className="relative p-4 sm:p-5 md:p-6 space-y-2.5 sm:space-y-3.5 z-10">
          {/* Header Section: Logo WITHOUT box + 2-line balanced brand name */}
          <div className="flex flex-col items-center text-center space-y-1.5 sm:space-y-2">
            {/* Logo (Increased natural scale, unboxed) */}
            <Link href="/" className="group relative inline-block my-1" title="Homepage">
              {tenantLogo ? (
                <div className="relative w-[84px] h-[84px] sm:w-[98px] sm:h-[98px] flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                  <Image 
                    fill 
                    src={tenantLogo} 
                    alt={tenantName || "Logo"} 
                    className="object-contain drop-shadow-md" 
                    priority
                  />
                </div>
              ) : isSuperAdmin ? (
                <div className="relative w-[84px] h-[84px] sm:w-[98px] sm:h-[98px] flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                  <ShieldCheck className="w-16 h-16 sm:w-18 sm:h-18 text-indigo-500 drop-shadow-md" />
                </div>
              ) : (
                <div 
                  className="w-[76px] h-[76px] sm:w-[88px] sm:h-[88px] rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
                  style={{ 
                    backgroundColor: `${effectiveBrandColor}15`,
                    color: effectiveBrandColor,
                    border: `1px solid ${effectiveBrandColor}35`
                  }}
                >
                  <GraduationCap className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-sm" />
                </div>
              )}
            </Link>

            {/* Dynamic Brand Name (Balanced 2 lines) */}
            <div className="space-y-0.5 sm:space-y-1">
              <h1 className="text-base sm:text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-50 capitalize leading-tight [text-wrap:balance] max-w-[270px] sm:max-w-[340px] mx-auto">
                {tenantName || (isSuperAdmin ? "Rajeev Gandhi Youth Computer Shiksha Parishad" : "Institute Portal")}
              </h1>
              <div className="flex items-center justify-center gap-2 pt-0.5">
                <div className="h-px w-7 sm:w-10 bg-gradient-to-r from-transparent via-slate-300 dark:via-zinc-700 to-slate-300 dark:to-zinc-700" />
                <p 
                  className={cn(
                    "text-[8.5px] sm:text-[9.5px] font-bold uppercase tracking-[0.2em]",
                    isSuperAdmin ? "text-amber-600 dark:text-amber-400" : ""
                  )}
                  style={{ color: isSuperAdmin ? undefined : effectiveBrandColor }}
                >
                  {isSuperAdmin 
                    ? "Global Executive Command" 
                    : isFranchise 
                    ? "Academy Portal • Faculty & Students" 
                    : "Secured Member Login"}
                </p>
                <div className="h-px w-7 sm:w-10 bg-gradient-to-l from-transparent via-slate-300 dark:via-zinc-700 to-slate-300 dark:to-zinc-700" />
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-2 sm:p-2.5 bg-red-500/10 dark:bg-red-500/15 text-red-600 dark:text-red-400 rounded-xl border border-red-500/20 dark:border-red-500/30 text-xs font-semibold animate-in slide-in-from-top-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span className="leading-tight text-[11px] sm:text-xs">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3">
            {/* Identification Input */}
            <div className="space-y-1">
              <div className="flex justify-between items-center px-1">
                <label className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  {isSuperAdmin ? "Administrator ID" : "Identification"}
                </label>
                <Badge variant="outline" className="bg-slate-100 dark:bg-zinc-800/80 border-none text-[8px] font-semibold text-slate-500 dark:text-zinc-400 px-1.5 py-0">
                  {isSuperAdmin 
                    ? "HQ Email or Master Username" 
                    : isFranchise 
                    ? "Roll No., Center Code or Email" 
                    : "Email or Username"}
                </Badge>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  {isSuperAdmin ? (
                    <KeyRound className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 dark:text-zinc-400 group-focus-within:text-amber-500 transition-colors" />
                  ) : (
                    <User 
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 dark:text-zinc-400 transition-colors" 
                      style={{ color: effectiveBrandColor }} 
                    />
                  )}
                </div>
                <Input
                  name="username"
                  placeholder={
                    isSuperAdmin 
                      ? "admin@rgycsp.com or Master ID" 
                      : isFranchise 
                      ? "Enrollment No., Username or Email" 
                      : "Email, Username, or Center Code"
                  }
                  autoComplete="username"
                  className="h-9 sm:h-10.5 pl-9 sm:pl-10 rounded-xl border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/80 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 font-semibold text-xs sm:text-sm transition-all outline-none"
                  style={{ outlineColor: effectiveBrandColor }}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <label className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 px-1">
                {isSuperAdmin ? "Master Security Key" : "Security Key"}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 dark:text-zinc-400 group-focus-within:text-primary transition-colors" />
                </div>
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="h-9 sm:h-10.5 pl-9 sm:pl-10 pr-9 sm:pr-10 rounded-xl border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/80 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 font-semibold text-xs sm:text-sm transition-all outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-900 dark:hover:text-zinc-200 transition-colors outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Authorize Button */}
            <Button
              type="submit"
              disabled={isLoading || isBiometricLoading}
              className={cn(
                "w-full h-9 sm:h-10.5 rounded-xl font-bold uppercase text-[11px] sm:text-xs tracking-wider shadow-md transition-all duration-200 mt-0.5 text-white hover:opacity-95 active:scale-[0.99] cursor-pointer",
                isSuperAdmin 
                  ? "bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-700 dark:from-indigo-500 dark:via-indigo-600 dark:to-indigo-700 shadow-indigo-500/25 dark:shadow-indigo-500/15" 
                  : "shadow-md"
              )}
              style={{ backgroundColor: isSuperAdmin ? undefined : effectiveBrandColor }}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Verifying Credentials...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>{isSuperAdmin ? "Authorize Master Access" : isFranchise ? "Enter Academy Portal" : "Authorize Access"}</span>
                  <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
              )}
            </Button>

            {/* Biometric Passkey Fast Login */}
            <div className="relative flex items-center justify-center my-1.5 sm:my-2">
              <div className="border-t border-slate-200 dark:border-zinc-800/80 w-full" />
              <span className="bg-white dark:bg-[#0c0d14] px-2.5 text-[8.5px] sm:text-[9px] font-bold text-slate-400 dark:text-zinc-400 uppercase tracking-wider absolute">
                Or Fast Biometric Sign In
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleBiometricLogin}
              disabled={isLoading || isBiometricLoading}
              className="w-full h-8.5 sm:h-9.5 rounded-xl font-semibold text-[11px] sm:text-xs tracking-wide shadow-2xs border-slate-200 dark:border-zinc-800/80 bg-slate-50/70 hover:bg-slate-100 dark:bg-zinc-900/80 dark:hover:bg-zinc-800/90 text-slate-700 dark:text-zinc-200 transition-all flex items-center justify-center gap-2 cursor-pointer dark:hover:border-zinc-700"
            >
              {isBiometricLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin text-emerald-500" />
                  <span>Prompting FaceID / Fingerprint...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Fingerprint className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{isSuperAdmin ? "Sign in with FaceID / Windows Hello" : "Sign in with Biometrics / FaceID"}</span>
                </div>
              )}
            </Button>
          </form>

          {/* Bottom Navigation Links (Clean, no redundant security badges) */}
          <div className="pt-1 flex flex-col items-center">
            {isSuperAdmin ? (
              <div className="flex items-center justify-center gap-3 text-[10px] text-slate-500 dark:text-zinc-400">
                <Link
                  href="/franchises"
                  className="hover:text-primary dark:hover:text-zinc-200 transition-colors flex items-center gap-1 font-medium"
                >
                  <Building2 className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                  <span>Franchise Study Center Portal</span>
                </Link>
                <span className="text-slate-300 dark:text-zinc-700">•</span>
                <Link
                  href="/"
                  className="hover:text-primary dark:hover:text-zinc-200 transition-colors flex items-center gap-1 font-medium"
                >
                  <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                  <span>Home</span>
                </Link>
              </div>
            ) : isFranchise ? (
              <div className="flex items-center justify-center gap-3 text-[10px] text-slate-500 dark:text-zinc-400">
                <Link
                  href="/admission/status"
                  className="hover:text-primary dark:hover:text-zinc-200 transition-colors flex items-center gap-1 font-medium"
                >
                  <GraduationCap className="w-3.5 h-3.5" style={{ color: effectiveBrandColor }} />
                  <span>Check Admission</span>
                </Link>
                <span className="text-slate-300 dark:text-zinc-700">•</span>
                <Link
                  href="/"
                  className="hover:text-primary dark:hover:text-zinc-200 transition-colors flex items-center gap-1 font-medium"
                >
                  <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                  <span>Center Home</span>
                </Link>
              </div>
            ) : (
              <Link
                href="/"
                className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 hover:text-primary dark:hover:text-zinc-200 transition-colors flex items-center gap-1.5"
              >
                <ArrowRight className="w-3.5 h-3.5 rotate-180" /> Back to Homepage
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="mt-2.5 text-center">
        <p className="text-[10px] font-semibold text-slate-400 dark:text-zinc-400 tracking-tight">
          POWERED BY <span className="font-bold" style={{ color: effectiveBrandColor }}>RGYCSP PLATFORM</span> &copy; 2026
        </p>
      </div>
    </div>
  );
}
