import React from "react";
import { auth, signOut } from "@/auth";
import { ShieldAlert, Mail, LogOut, Phone, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { db } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AccountRestrictedPage() {
  const session = await auth();
  
  // Fetch global site settings for support contact
  const settings = await db.siteSettings.findFirst({
    where: { workspaceId: null },
    select: { contactEmail: true, contactPhone: true, siteName: true }
  });

  const supportEmail = settings?.contactEmail || "support@rgycsp.tech";
  const supportPhone = settings?.contactPhone || "+91 8944899747";
  const siteName = settings?.siteName || "ABCD Edu Hub";

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="w-full max-w-lg space-y-4">
        {/* Main Card */}
        <Card className="border border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
          {/* Header Banner */}
          <div className="bg-gradient-to-br from-rose-600 via-rose-700 to-amber-700 p-6 sm:p-7 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10 transform scale-150 pointer-events-none">
              <ShieldAlert className="w-32 h-32" />
            </div>

            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-3 shadow-inner">
              <ShieldAlert className="h-8 w-8 text-white" />
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-1 text-white">
              Account Suspended
            </h1>
            <p className="text-xs sm:text-sm text-rose-100 max-w-sm mx-auto font-medium">
              Your account access has been restricted by platform administration.
            </p>
          </div>

          <CardContent className="p-5 sm:p-6 space-y-4">
            {/* Account Details Box */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Account Identity</span>
                <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-none rounded text-[9px] font-bold px-1.5 py-0.5 tracking-wider uppercase">
                  Status: Restricted
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">User Name</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{session?.user?.name || "Member"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Email Address</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{session?.user?.email || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Explanation Note */}
            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <HelpCircle className="h-3.5 w-3.5 text-amber-500" />
                Why am I seeing this page?
              </p>
              <p>
                An administrator has temporarily or permanently deactivated this account. While suspended, you cannot access administrative consoles, manage franchises, or perform operations.
              </p>
            </div>

            {/* Support Resolution */}
            <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2 text-xs">
              <p className="font-semibold text-amber-800 dark:text-amber-300 text-[11px] uppercase tracking-wider">
                Need Help or Believe this is an Error?
              </p>
              <p className="text-slate-600 dark:text-slate-400 text-xs">
                Please contact our institutional support desk with your registered email:
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 pt-1">
                <a 
                  href={`mailto:${supportEmail}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {supportEmail}
                </a>
                {supportPhone && (
                  <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
                )}
                {supportPhone && (
                  <a 
                    href={`tel:${supportPhone}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-primary"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    {supportPhone}
                  </a>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-2.5">
              <form 
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/login" });
                }} 
                className="w-full"
              >
                <Button 
                  type="submit" 
                  variant="outline" 
                  className="w-full h-9 rounded-xl text-xs font-semibold gap-1.5 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out & Exit
                </Button>
              </form>

              <Link 
                href={`mailto:${supportEmail}?subject=Account%20Restriction%20Inquiry%20-%20${encodeURIComponent(session?.user?.email || "")}`}
                className="w-full h-9 rounded-xl text-xs font-semibold bg-primary text-primary-foreground shadow-sm hover:scale-[1.01] active:scale-95 transition-all inline-flex items-center justify-center gap-1.5"
              >
                <Mail className="h-3.5 w-3.5" />
                Contact Support
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer brand note */}
        <p className="text-center text-[11px] text-slate-400 font-medium">
          Protected by {siteName} Security Systems
        </p>
      </div>
    </div>
  );
}
