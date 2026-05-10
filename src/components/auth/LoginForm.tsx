"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
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
  EyeOff
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function LoginForm({
  tenantName,
  tenantLogo,
  primaryColor,
  callbackUrl,
  isGlobal
}: {
  tenantName?: string;
  tenantLogo?: string | null;
  primaryColor?: string | null;
  callbackUrl?: string;
  isGlobal?: boolean;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const finalCallbackUrl = callbackUrl || searchParams.get("callbackUrl") || "/";

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
    <div className="w-full max-w-[460px] px-4 animate-in fade-in slide-in-from-bottom-8 duration-700 relative">
      {/* Decorative Glowing Orbs */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/20 rounded-full blur-[100px] animate-pulse pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-500/20 rounded-full blur-[120px] animate-pulse delay-1000 pointer-events-none" />

      <Card className="rounded-[3rem] border border-white/40 dark:border-white/10 shadow-[0_32px_120px_-12px_rgba(0,0,0,0.15)] dark:shadow-[0_32px_120px_-12px_rgba(0,0,0,0.6)] bg-white/90 dark:bg-zinc-950/90 backdrop-blur-3xl overflow-hidden">
        {/* Progress Bar Top */}
        <div className="h-1.5 w-full overflow-hidden bg-slate-100 dark:bg-white/5">
          <div 
            className={cn("h-full bg-primary transition-all duration-1000 ease-in-out", isLoading ? "w-full" : "w-0")}
            style={{ backgroundColor: primaryColor || undefined }}
          />
        </div>

        <CardContent className="p-6 md:p-10 space-y-6">
          {/* Header Section */}
          <div className="flex flex-col items-center text-center space-y-6">
            <Link href="/" className="group relative">
              <div className="absolute inset-0 bg-primary/20 rounded-[2rem] blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100" />
              <div className="relative w-20 h-20 rounded-[2rem] bg-white dark:bg-zinc-900 border border-slate-100 dark:border-white/10 flex items-center justify-center overflow-hidden p-3 shadow-xl transition-transform duration-500 group-hover:scale-110">
                {tenantLogo ? (
                  <img src={tenantLogo} alt={tenantName} className="w-full h-full object-contain" />
                ) : (
                  <GraduationCap className="w-10 h-10 text-primary" style={{ color: primaryColor || undefined }} />
                )}
              </div>
            </Link>

            <div className="space-y-1">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">
                {tenantName || (isGlobal ? "ABCD Hub" : "Institute Portal")}
              </h1>
              <div className="flex items-center justify-center gap-3">
                <span className="h-px w-6 bg-slate-200 dark:bg-white/10" />
                <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]" style={{ color: primaryColor || undefined }}>
                  {isGlobal ? "Global Administration" : "Secured Member Login"}
                </p>
                <span className="h-px w-6 bg-slate-200 dark:bg-white/10" />
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-500/5 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-2xl border border-red-500/20 text-xs font-bold animate-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <div className="flex justify-between items-end px-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Identification</label>
                <Badge variant="outline" className="bg-slate-50 dark:bg-white/5 border-none text-[8px] font-bold px-2 py-0.5 opacity-60">
                  {isGlobal ? "Staff Email" : "Student ID / Email"}
                </Badge>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                  <User className="w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" style={{ color: primaryColor || undefined }} />
                </div>
                <Input
                  name="username"
                  placeholder={isGlobal ? "name@example.com" : "User ID or Email"}
                  autoComplete="username"
                  className="h-14 pl-12 rounded-2xl border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 focus:bg-white dark:focus:bg-zinc-900 focus:ring-4 focus:ring-primary/10 font-bold text-sm transition-all outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 px-1">Security Key</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" style={{ color: primaryColor || undefined }} />
                </div>
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="h-14 pl-12 pr-12 rounded-2xl border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 focus:bg-white dark:focus:bg-zinc-900 focus:ring-4 focus:ring-primary/10 font-bold text-sm transition-all outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-primary transition-colors outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 rounded-2xl font-bold uppercase text-xs tracking-widest shadow-xl transition-all duration-300 mt-2 bg-primary hover:opacity-90 active:scale-[0.98]"
              style={{ backgroundColor: primaryColor || undefined }}
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Verifying...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span>Authorize Access</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>
          </form>

          <div className="pt-2 flex flex-col items-center gap-4">
            <Link 
              href="/" 
              className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors flex items-center gap-2"
            >
              <ArrowRight className="w-3 h-3 rotate-180" /> Back to Homepage
            </Link>
            
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 dark:bg-white/5 rounded-full border border-slate-100 dark:border-white/5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                AES-256 Bit Encrypted Authorization
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 text-center">
        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-tight">
          POWERED BY <span className="text-primary" style={{ color: primaryColor || undefined }}>ABCD PLATFORM</span> &copy; 2026
        </p>
      </div>
    </div>
  );
}
