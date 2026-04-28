import { getWorkspaces } from "@/app/actions/workspaces";
import WorkspacesClient from "./WorkspacesClient";

export default async function WorkspacesPage() {
  const result = await getWorkspaces();
  const initialData = result.success ? result.data : [];

  return <WorkspacesClient initialWorkspaces={initialData} />;
}
