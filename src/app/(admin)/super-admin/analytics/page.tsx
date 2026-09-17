import { getSuperAdminAnalytics } from "@/app/actions/analytics";
import { SuperAdminAnalyticsClient } from "./SuperAdminAnalyticsClient";

export default async function SuperAdminAnalyticsPage() {
  try {
    const data = await getSuperAdminAnalytics({ dateRange: "30d" });

    return <SuperAdminAnalyticsClient initialData={data} />;
  } catch (error: any) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-base font-bold text-red-600">Access Restricted</h2>
        <p className="text-xs text-slate-500 mt-1">{error?.message || "Super Admin access required."}</p>
      </div>
    );
  }
}
