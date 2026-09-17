import { notFound } from "next/navigation";
import { getFranchiseAnalytics } from "@/app/actions/analytics";
import { FranchiseAnalyticsClient } from "./FranchiseAnalyticsClient";

export default async function FranchiseAnalyticsPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  if (!tenant) notFound();

  try {
    const data = await getFranchiseAnalytics(tenant, { dateRange: "30d" });

    return (
      <FranchiseAnalyticsClient
        workspace={data.workspace}
        initialData={data}
      />
    );
  } catch (error: any) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-base font-bold text-red-600">Unable to load visitor analytics</h2>
        <p className="text-xs text-slate-500 mt-1">{error?.message || "Please check your permissions."}</p>
      </div>
    );
  }
}
