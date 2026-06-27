import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AdminPageHeader } from "@/components/layout/AdminPageHeader";
import { ProfileForm } from "./ProfileForm";

export const metadata = {
  title: "Account Profile | ABCD Admin",
  description: "Manage your administrative account settings and security preferences.",
};

export default async function ProfilePage(props: { params: Promise<{ tenant: string }> }) {
  const session = await auth();
  const { tenant } = await props.params;
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      image: true,
    }
  });

  if (!user) {
    redirect("/login");
  }

  // Get the role of the user in this workspace
  let roleName = "Admin";
  if (session.user.role === "SUPER_ADMIN") {
    roleName = "Super Admin";
  } else {
    const workspace = await db.workspace.findUnique({
      where: { subdomain: tenant.toLowerCase() }
    });
    if (workspace) {
      const roleRecord = await db.workspaceRole.findFirst({
        where: { userId: session.user.id, workspaceId: workspace.id }
      });
      if (roleRecord) {
        roleName = roleRecord.role === "ADMIN" ? "Franchise Admin" : roleRecord.role;
      }
    }
  }

  return (
    <div className="space-y-10 pb-24 p-6">
      <AdminPageHeader 
        title="Account Settings" 
        description="Manage your personal identity and security preferences within this franchise."
      />

      <ProfileForm user={user} roleName={roleName} tenant={tenant} />
    </div>
  );
}
