import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getServerTenantLink } from "@/lib/routing-server";
import { AdminPageHeader } from "@/components/layout/AdminPageHeader";
import { ProfileForm } from "./ProfileForm";

export const metadata = {
  title: "Account Profile | ABCD Admin",
  description: "Manage your administrative account settings and security preferences.",
};

export default async function ProfilePage(props: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await props.params;
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect(await getServerTenantLink("/login", tenant));
  }

  const workspace = await db.workspace.findUnique({
    where: { subdomain: tenant.toLowerCase() },
  });

  if (!workspace) {
    redirect(await getServerTenantLink("/login", tenant));
  }

  const isGlobalAdmin = session?.user?.role === "SUPER_ADMIN" || 
                        session?.user?.role === "SUPER_ADMIN_MANAGER" || 
                        session?.user?.email === process.env.DEVELOPER_EMAIL;

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

  if (!userRole && !isGlobalAdmin) {
    return (
      <div className="p-4 lg:p-10 max-w-7xl mx-auto flex items-center justify-center min-h-[60vh] w-full">
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-900/50 p-8 rounded-3xl text-center max-w-md w-full shadow-lg">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-red-800 dark:text-red-400 mb-2">Access Denied</h2>
          <p className="text-red-600 dark:text-red-300 font-medium">You are not a staff member of this workspace.</p>
        </div>
      </div>
    );
  }

  // Use session user as fallback for global admins who aren't staff
  const currentUser = userRole ? userRole.user : session.user;

  const user = {
    id: currentUser.id,
    name: currentUser.name || "Administrator",
    email: currentUser.email || "",
    username: (currentUser as any).username || "",
    image: currentUser.image || "",
  };

  const roleName = isGlobalAdmin && !userRole ? "System Administrator" :
                   userRole?.role === "ADMIN" ? "Franchise Owner" : 
                   userRole?.role === "MANAGER" ? "Franchise Manager" :
                   userRole?.role === "TEACHER" ? "Teacher / Staff" : 
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
