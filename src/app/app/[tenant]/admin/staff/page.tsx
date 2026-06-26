import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getStaff } from "@/app/actions/staff";
import StaffManagementClient from "./StaffManagementClient";

export default async function StaffPage({
  params
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;

  const workspace = await db.workspace.findUnique({
    where: { subdomain: tenant?.toLowerCase() }
  });

  if (!workspace) notFound();

  const staffResult = await getStaff(workspace.id);

  return (
    <StaffManagementClient 
      workspaceId={workspace.id} 
      initialStaff={staffResult.data ?? []} 
    />
  );
}
