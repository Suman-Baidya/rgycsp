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

  const workspace = await db.workspace.findUnique({
    where: { subdomain: tenant.toLowerCase() },
  });

  if (!workspace) {
    redirect("/login");
  }

  // Find the currently logged in user's role in this workspace
  const userRole = await db.workspaceRole.findFirst({
    where: {
      workspaceId: workspace.id,
      userId: session.user.id
    },
    include: {
      user: true
    }
  });

  if (!userRole) {
    return <div>Error: You are not a staff member of this workspace.</div>;
  }

  const currentUser = userRole.user;

  const user = {
    id: currentUser.id,
    name: currentUser.name,
    email: currentUser.email,
    username: currentUser.username,
    image: currentUser.image,
  };

  const roleName = userRole.role === "ADMIN" ? "Franchise Owner" : 
                   userRole.role === "MANAGER" ? "Franchise Manager" :
                   userRole.role === "TEACHER" ? "Teacher / Staff" : 
                   "Staff Member";

  return (
    <div className="p-4 lg:p-10 max-w-7xl mx-auto space-y-8 w-full">
      <AdminPageHeader 
        title="Account Settings" 
        description="Manage your personal identity and security preferences within this franchise."
      />

      <ProfileForm user={user} roleName={roleName} tenant={tenant} />
    </div>
  );
}
