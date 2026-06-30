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
    include: {
      roles: {
        where: { role: "ADMIN" },
        include: { user: true }
      }
    }
  });

  if (!workspace) {
    redirect("/login");
  }

  // Find the franchise owner
  const franchiseOwner = workspace.roles[0]?.user;
  
  if (!franchiseOwner) {
    return <div>Error: No franchise admin found for this workspace.</div>;
  }

  const user = {
    id: franchiseOwner.id,
    name: franchiseOwner.name,
    email: franchiseOwner.email,
    username: franchiseOwner.username,
    image: franchiseOwner.image,
  };

  const roleName = "Franchise Owner";

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
