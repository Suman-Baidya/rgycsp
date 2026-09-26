import { getUsers } from "@/app/actions/users";
import { getActiveDocumentTemplates } from "@/app/actions/document-templates";
import UsersClient from "./UsersClient";

export const dynamic = "force-dynamic";

export default async function UsersManagementPage() {
  const [result, templates] = await Promise.all([
    getUsers(),
    getActiveDocumentTemplates()
  ]);
  const initialData = result.data ?? [];

  return <UsersClient initialUsers={initialData} initialTemplates={templates || []} />;
}
