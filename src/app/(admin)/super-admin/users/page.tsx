import { getUsers } from "@/app/actions/users";
import UsersClient from "./UsersClient";

export default async function UsersManagementPage() {
  const result = await getUsers();
  const initialData = result.data ?? [];

  return <UsersClient initialUsers={initialData} />;
}
