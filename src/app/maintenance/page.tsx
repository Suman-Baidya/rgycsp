import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { 
  Server, 
  ShieldAlert, 
  RefreshCcw, 
  ArrowRight, 
  Lock, 
  CheckCircle2, 
  Clock, 
  Zap,
  Terminal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPlatformRoutingConfig } from "@/app/actions/platform-routing";
import { getCachedGlobalSettings } from "@/lib/settings";
import { auth } from "@/auth";
import { isDeveloperEmail } from "@/lib/developer";

export const dynamic = "force-dynamic";

export default async function MaintenancePage() {
  const [config, globalSettings, session] = await Promise.all([
    getPlatformRoutingConfig(),
    getCachedGlobalSettings(),
    auth()
  ]);

  // If maintenance mode is NOT active, redirect back to root
  if (!config.maintenanceMode) {
    redirect("/");
  }

  const userEmail = session?.user?.email;
  const isDev = Boolean(
    (session?.user as any)?.isDeveloper ||
    isDeveloperEmail(userEmail)
  );

  const siteName = globalSettings?.siteName || "ABCD Edu Hub";
  const logoUrl = globalSettings?.logoUrl;

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-rose-500/30 selection:text-rose-200 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-amber-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Subtle Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ 
          backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", 
          backgroundSize: "32px 32px" 
        }} 
      />

      {/* Top Header */}
      <header className="relative z-10 w-full max-w-5xl mx-auto px-6 py-6 sm:py-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt={siteName} className="h-9 w-auto object-contain" />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-600 flex items-center justify-center font-bold text-white shadow-lg shadow-rose-900/40">
              {siteName.slice(0, 2).toUpperCase()}
            </div>
          )}
          <span className="font-bold text-base tracking-tight text-white">
            {siteName}
          </span>
        </div>

        <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-xs px-2.5 py-1 gap-1.5 flex items-center font-semibold">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          Maintenance Active
        </Badge>
      </header>

      {/* Main Content Card */}
      <main className="relative z-10 w-full max-w-xl mx-auto px-6 py-12 flex flex-col items-center text-center">
        {/* Animated Icon Badge */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-3xl bg-slate-900/90 border border-rose-500/30 flex items-center justify-center shadow-2xl shadow-rose-950/60 backdrop-blur-xl">
            <Server className="w-9 h-9 text-rose-500 animate-pulse" />
          </div>
          <div className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 backdrop-blur-md">
            <Zap className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Headings */}
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-3">
          Platform Maintenance in Progress
        </h1>
        <p className="text-sm text-slate-400 max-w-md mb-8 leading-relaxed">
          {config.maintenanceMessage || "The platform is currently undergoing scheduled infrastructure upgrades. All user and tenant services will be restored shortly."}
        </p>

        {/* Status Breakdown Card */}
        <Card className="w-full bg-slate-900/60 border border-slate-800/80 rounded-2xl shadow-xl backdrop-blur-md overflow-hidden text-left mb-8">
          <CardContent className="p-4 sm:p-5 space-y-3.5 divide-y divide-slate-800/60">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">System State</span>
                <p className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  Offline for Scheduled Upgrades
                </p>
              </div>
              <Badge variant="outline" className="bg-slate-800 text-slate-300 border-slate-700 text-[10px]">
                Status 503
              </Badge>
            </div>

            <div className="pt-3 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Operation Scope</span>
                <p className="text-xs font-medium text-slate-300">
                  Database indexing & system performance tuning
                </p>
              </div>
              <Clock className="w-4 h-4 text-slate-500" />
            </div>

            <div className="pt-3 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Developer Access</span>
                <p className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified Developer Bypass Available
                </p>
              </div>
              <ShieldAlert className="w-4 h-4 text-emerald-500/80" />
            </div>
          </CardContent>
        </Card>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Link 
            href="/maintenance"
            className="w-full sm:w-auto inline-flex items-center justify-center h-10 px-5 rounded-xl font-semibold text-xs gap-2 shadow-lg shadow-rose-950/40 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white transition-all"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            <span>Check Status Again</span>
          </Link>

          {isDev ? (
            <Link
              href="/super-admin"
              className="w-full sm:w-auto inline-flex items-center justify-center h-10 px-4 rounded-xl font-semibold text-xs gap-2 border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 transition-all"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Enter Developer Console</span>
              <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          ) : (
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center h-10 px-4 rounded-xl font-semibold text-xs gap-2 border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Developer Login</span>
            </Link>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-5xl mx-auto px-6 py-6 text-center text-xs text-slate-600 border-t border-slate-900/80">
        <p>&copy; {new Date().getFullYear()} {siteName}. All rights reserved.</p>
      </footer>
    </div>
  );
}
