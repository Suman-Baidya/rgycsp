import { getFranchiseApplications } from "@/app/actions/franchise";
import { getWorkspaces } from "@/app/actions/workspaces";
import FranchiseApplicationsClient from "./FranchiseApplicationsClient";

export default async function SuperAdminFranchisesPage() {
  // Fetch franchise applications
  const appRes = await getFranchiseApplications();
  const initialApplications = appRes.data ?? [];

  // Fetch active workspaces (franchise centers)
  const wsRes = await getWorkspaces();
  const initialWorkspaces = wsRes.data ?? [];

  return (
    <div className="w-full">
      <FranchiseApplicationsClient 
        initialApplications={initialApplications} 
        initialWorkspaces={initialWorkspaces}
      />
    </div>
  );
}
