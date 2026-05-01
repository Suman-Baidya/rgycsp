"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
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
  GraduationCap
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function LoginForm({
  tenantName,
  tenantLogo,
  primaryColor,
  callbackUrl
}: {
  tenantName?: string;
  tenantLogo?: string | null;
  primaryColor?: string | null;
  callbackUrl?: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
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

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
        callbackUrl: finalCallbackUrl,
      });

      if (result?.error) {
        setError("Invalid credentials. Please try again.");
        toast.error("Login failed.");
      } else {
        toast.success("Login successful!");
        
        // Fetch session to determine role
        const response = await fetch('/api/auth/session');
        const session = await response.json();
        
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        const port = window.location.port ? `:${window.location.port}` : '';
        const pathname = window.location.pathname;
        
        const isSubdirectoryMode = pathname.startsWith('/app/');
        
        if (session?.user) {
          // Determine dashboard relative path
          let dashboardRelativePath = "";
          if (session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN") {
            dashboardRelativePath = "/admin";
          } else {
            dashboardRelativePath = "/student/dashboard";
          }

          // Apply prefix ONLY for subdirectory mode
          if (isSubdirectoryMode) {
            const tenantMatch = pathname.match(/\/app\/([^\/]+)/);
            const urlTenant = tenantMatch ? tenantMatch[1] : null;
            if (urlTenant) {
              dashboardRelativePath = `/app/${urlTenant}${dashboardRelativePath}`;
            }
          }
          
          // Build absolute URL and redirect
          const finalUrl = `${protocol}//${hostname}${port}${dashboardRelativePath}`;
          window.location.href = finalUrl;
        } else {
          window.location.href = finalCallbackUrl;
        }
      }
    } catch (err) {
      setError("Something went wrong.");
      toast.error("An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[440px] px-4 animate-in fade-in zoom-in-95 duration-500">
      <Card className="rounded-[2rem] border-none shadow-2xl bg-white dark:bg-zinc-900 overflow-hidden">
        <div className="h-2 w-full bg-primary"></div>

        <CardContent className="p-8 md:p-12 space-y-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center overflow-hidden p-2">
              {tenantLogo ? (
                <img src={tenantLogo} alt={tenantName} className="w-full h-full object-contain" />
              ) : (
                <Building2 className="w-10 h-10 text-primary" />
              )}
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase leading-tight">
                {tenantName || "Portal Access"}
              </h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Secure Login Portal
              </p>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-900/50 text-xs font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Username / Email</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                <Input
                  name="username"
                  placeholder="Your credentials"
                  className="h-12 pl-12 rounded-xl border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 focus:ring-primary font-medium text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Password</label>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                <Input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className="h-12 pl-12 rounded-xl border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 focus:ring-primary font-medium text-sm"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 transition-all mt-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In to Portal"}
            </Button>
          </form>

          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-primary/60">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[9px] font-black uppercase tracking-widest">Secured Workspace</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 text-center space-y-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          &copy; {new Date().getFullYear()} {tenantName}. Powered by ABCD Hub
        </p>
      </div>
    </div>
  );
}
