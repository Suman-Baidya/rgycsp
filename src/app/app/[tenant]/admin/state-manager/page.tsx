import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getServerTenantLink } from "@/lib/routing-server";
import { getStateManagerDashboardData } from "@/app/actions/state-manager";
import { db } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2, Wallet, Users, AlertCircle, Clock, IndianRupee } from "lucide-react";
import { AdminPageHeader } from "@/components/layout/AdminPageHeader";
import { StateManagerDashboardClient } from "./StateManagerDashboardClient";

export default async function StateManagerPage({
  params
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  const session = await auth();
  if (!session?.user) redirect(await getServerTenantLink("/login", tenant));
  
  // Find the workspace ID for this tenant
  const workspace = await db.workspace.findUnique({
    where: { subdomain: tenant.toLowerCase() },
    select: { id: true, name: true, isStateManager: true }
  });

  if (!workspace || !workspace.isStateManager) {
    const fallback = await getServerTenantLink("/admin", tenant);
    redirect(fallback);
  }

  const result = await getStateManagerDashboardData(workspace.id);
  
  if (!result.success || !result.data) {
    return (
      <div className="p-8">
        <div className="bg-red-50 text-red-500 p-4 rounded-2xl flex items-center border border-red-200">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span className="font-bold">{result.error || "Failed to load State Manager data"}</span>
        </div>
      </div>
    );
  }

  const { config, referredWorkspaces, commissions, stats } = result.data;

  // Determine active status
  const isExpired = config.validUntil ? new Date(config.validUntil) < new Date() : false;
  const isFullyActive = config.isActive && !isExpired;

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 w-full mx-auto">
      <AdminPageHeader 
        title="State Manager Dashboard" 
        description={`Manage your referrals, view commissions, and track the growth of your network.`}
      >
        <div className="flex items-center gap-2">
          {isFullyActive ? (
            <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 font-bold hover:bg-emerald-500/20 shadow-none text-[9px] uppercase tracking-wider py-0.5 px-2 rounded border-none">
              Active Status
            </Badge>
          ) : (
            <Badge variant="destructive" className="font-bold shadow-none text-[9px] uppercase tracking-wider py-0.5 px-2 rounded border-none bg-red-500/10 text-red-600 hover:bg-red-500/20">
              {isExpired ? "Expired" : "Suspended"}
            </Badge>
          )}
        </div>
      </AdminPageHeader>

      {!isFullyActive && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 p-3.5 sm:p-4 rounded-xl flex items-start gap-3 shadow-sm text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
          <div>
            <h4 className="font-bold text-xs sm:text-sm">Commission Status Inactive</h4>
            <p className="font-medium mt-0.5 opacity-90">
              Your State Manager privileges are currently {isExpired ? 'expired' : 'suspended'}. You will not earn new commissions from recharges until your status is restored by the Super Admin.
            </p>
          </div>
        </div>
      )}

      <StateManagerDashboardClient 
        workspaceId={workspace.id}
        config={config}
        referredWorkspaces={referredWorkspaces}
        commissions={commissions}
        stats={stats}
      />
    </div>
  );
}
