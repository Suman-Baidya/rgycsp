import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getStaff } from "@/app/actions/staff";
import StaffList from "./StaffList";

export default async function StaffPage({
  params
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;

  const workspace = await db.workspace.findUnique({
    where: { subdomain: tenant }
  });

  if (!workspace) notFound();

  const staffResult = await getStaff(workspace.id);

  return (
    <div className="p-4 lg:p-10">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff & Roles</h1>
          <p className="text-muted-foreground mt-1">Manage team members, teachers, and their access permissions.</p>
        </div>
      </div>
      
      <StaffList 
        workspaceId={workspace.id} 
        initialStaff={staffResult.success ? staffResult.data : []} 
      />
    </div>
  );
}
