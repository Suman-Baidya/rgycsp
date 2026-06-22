import { getStateManagers, getAllFranchisesForAssignment, getAllWithdrawalRequests } from "@/app/actions/state-manager";
import { StateManagerClient } from "./StateManagerClient";

export const dynamic = "force-dynamic";

export default async function SuperAdminStateManagersPage() {
  const [managersRes, franchisesRes, withdrawalsRes] = await Promise.all([
    getStateManagers(),
    getAllFranchisesForAssignment(),
    getAllWithdrawalRequests()
  ]);

  const managers = (managersRes.success && managersRes.data) ? managersRes.data : [];
  const franchises = (franchisesRes.success && franchisesRes.data) ? franchisesRes.data : [];
  const pendingWithdrawals = (withdrawalsRes.success && withdrawalsRes.data) ? withdrawalsRes.data : [];

  return (
    <div className="w-full">
      <StateManagerClient initialManagers={managers} franchises={franchises} allWithdrawals={pendingWithdrawals} />
    </div>
  );
}
