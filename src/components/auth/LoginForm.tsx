"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { getPostLoginRedirect } from "@/app/actions/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Fingerprint
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
  tenantSlug
}: {
  tenantName?: string;
  tenantLogo?: string | null;
  primaryColor?: string | null;
  callbackUrl?: string;
  isGlobal?: boolean;
  tenantSlug?: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const finalCallbackUrl = callbackUrl || searchParams.get("callbackUrl") || "/";

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
        toast.success("Biometric authentication verified! Logging in...");
        const redirectUrl = await getPostLoginRedirect(window.location.host, window.location.pathname);
        window.location.href = redirectUrl;
      }
    } catch (err: any) {
      setError(err?.message || "Biometric login encounter an unexpected error.");
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
        tenantSlug,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid credentials. Please check your username and password.");
        toast.error("Authentication failed");
      } else {
        toast.success("Welcome back!");

        // Use server action to determine the best redirect URL
        const redirectUrl = await getPostLoginRedirect(window.location.host, window.location.pathname);

        // Use window.location.href to force a full reload and ensure session is recognized
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
      {/* Decorative Subtle Glowing Orbs */}
      <div className="absolute -top-16 -left-16 w-40 h-40 bg-primary/15 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-blue-500/15 rounded-full blur-[90px] pointer-events-none" />

      <Card className="relative rounded-2xl sm:rounded-[2rem] border border-slate-200/80 dark:border-white/10 shadow-xl dark:shadow-[0_24px_80px_-12px_rgba(0,0,0,0.8)] bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl overflow-hidden">
        {/* Progress Bar Top */}
        <div className="relative h-1 w-full overflow-hidden bg-slate-100 dark:bg-white/5 z-10">
          <div
            className={cn("h-full bg-primary transition-all duration-700 ease-in-out relative", isLoading ? "w-full" : "w-0")}
            style={{ backgroundColor: primaryColor || undefined }}
          >
            <div className="absolute inset-0 bg-white/30 animate-pulse" />
          </div>
        </div>

        <CardContent className="relative p-3.5 sm:p-5 md:p-6 space-y-2.5 sm:space-y-3.5 z-10">
          {/* Header Section: Logo WITHOUT box + 2-line balanced brand name */}
          <div className="flex flex-col items-center text-center space-y-1.5 sm:space-y-2.5">
            <Link href="/" className="group relative inline-block" title="Homepage">
              <div className="relative w-[68px] h-[68px] sm:w-[80px] sm:h-[80px] flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                {tenantLogo ? (
                  <Image 
                    fill 
                    src={tenantLogo} 
                    alt={tenantName || "Logo"} 
                    className="object-contain drop-shadow-sm" 
                    priority
                  />
                ) : (
                  <GraduationCap 
                    className="w-13 h-13 sm:w-16 sm:h-16 text-primary drop-shadow-sm" 
                    style={{ color: primaryColor || undefined }} 
                  />
                )}
              </div>
            </Link>

            <div className="space-y-0.5 sm:space-y-1">
              <h1 className="text-base sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white capitalize leading-tight [text-wrap:balance] max-w-[270px] sm:max-w-[340px] mx-auto">
                {tenantName || (isGlobal ? "ABCD Hub" : "Institute Portal")}
              </h1>
              <div className="flex items-center justify-center gap-2">
                <div className="h-px w-5 sm:w-6 bg-slate-200 dark:bg-white/10" />
                <p className="text-[8.5px] sm:text-[10px] font-bold text-primary uppercase tracking-[0.2em]" style={{ color: primaryColor || undefined }}>
                  {isGlobal ? "Global Administration" : "Secured Member Login"}
                </p>
                <div className="h-px w-5 sm:w-6 bg-slate-200 dark:bg-white/10" />
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-2 sm:p-2.5 bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl border border-red-500/20 text-xs font-semibold animate-in slide-in-from-top-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span className="leading-tight text-[11px] sm:text-xs">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between items-center px-1">
                <label className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Identification
                </label>
                <Badge variant="outline" className="bg-slate-50 dark:bg-white/5 border-none text-[8px] font-semibold text-slate-400 px-1 py-0">
                  {isGlobal ? "Email, Enrollment No. or Center Code" : "Email or Username"}
                </Badge>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 group-focus-within:text-primary transition-colors" style={{ color: primaryColor || undefined }} />
                </div>
                <Input
                  name="username"
                  placeholder={isGlobal ? "Email, Enrollment No, or Center Code" : "Email or Username"}
                  autoComplete="username"
                  className="h-9 sm:h-10.5 pl-9 sm:pl-10 rounded-xl border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/5 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-primary/20 font-semibold text-xs sm:text-sm transition-all outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
                Security Key
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 group-focus-within:text-primary transition-colors" style={{ color: primaryColor || undefined }} />
                </div>
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="h-9 sm:h-10.5 pl-9 sm:pl-10 pr-9 sm:pr-10 rounded-xl border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/5 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-primary/20 font-semibold text-xs sm:text-sm transition-all outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-primary transition-colors outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || isBiometricLoading}
              className="w-full h-9 sm:h-10.5 rounded-xl font-bold uppercase text-[11px] sm:text-xs tracking-wider shadow-md transition-all duration-200 mt-0.5 bg-primary text-white hover:opacity-95 active:scale-[0.99] cursor-pointer"
              style={{ backgroundColor: primaryColor || undefined }}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Verifying...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Authorize Access</span>
                  <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
              )}
            </Button>

            {/* Biometric Passkey Fast Login */}
            <div className="relative flex items-center justify-center my-1.5 sm:my-2">
              <div className="border-t border-slate-200 dark:border-white/10 w-full" />
              <span className="bg-white/95 dark:bg-zinc-950/95 px-2 text-[8.5px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider absolute">
                Or Fast Biometric Sign In
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleBiometricLogin}
              disabled={isLoading || isBiometricLoading}
              className="w-full h-8.5 sm:h-9.5 rounded-xl font-semibold text-[11px] sm:text-xs tracking-wide shadow-2xs border-slate-200 dark:border-white/10 bg-slate-50/60 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isBiometricLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin text-primary" />
                  <span>Scanning FaceID / Fingerprint...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Fingerprint className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Sign in with Biometrics / FaceID</span>
                </div>
              )}
            </Button>
          </form>

          {/* Bottom Footer Section */}
          <div className="pt-0.5 flex flex-col items-center gap-2 sm:gap-2.5">
            <Link
              href="/"
              className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-primary transition-colors flex items-center gap-1.5"
            >
              <ArrowRight className="w-3 h-3 rotate-180" /> Back to Homepage
            </Link>

            <div className="flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 bg-slate-100/80 dark:bg-white/5 rounded-full border border-slate-200/50 dark:border-white/5">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              <span className="text-[7.5px] sm:text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                AES-256 Bit Encrypted Authorization
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-3 text-center">
        <p className="text-[10px] font-semibold text-slate-400 tracking-tight">
          POWERED BY <span className="text-primary font-bold" style={{ color: primaryColor || undefined }}>RGYCSP PLATFORM</span> &copy; 2026
        </p>
      </div>
    </div>
  );
}
