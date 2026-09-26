import { getFranchiseApplications } from "@/app/actions/franchise";
import { getWorkspaces } from "@/app/actions/workspaces";
import { getPlatformRoutingConfig } from "@/app/actions/platform-routing";
import { getActiveDocumentTemplates } from "@/app/actions/document-templates";
import FranchiseApplicationsClient from "./FranchiseApplicationsClient";

export default async function SuperAdminFranchisesPage() {
  // Fetch franchise applications
  const appRes = await getFranchiseApplications();
  const initialApplications = appRes.data ?? [];

  // Fetch active workspaces (franchise centers)
  const wsRes = await getWorkspaces();
  const initialWorkspaces = wsRes.data ?? [];

  // Fetch global platform routing architecture configuration
  const platformRoutingConfig = await getPlatformRoutingConfig();

  // Fetch active designer templates for franchise certificate and ID cards
  const activeTemplates = await getActiveDocumentTemplates();

  return (
    <div className="w-full">
      <FranchiseApplicationsClient 
        initialApplications={initialApplications} 
        initialWorkspaces={initialWorkspaces}
        platformRoutingConfig={platformRoutingConfig}
        activeTemplates={activeTemplates}
      />
    </div>
  );
}
