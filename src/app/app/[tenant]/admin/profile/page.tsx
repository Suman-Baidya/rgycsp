import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getServerTenantLink } from "@/lib/routing-server";
import { AdminPageHeader } from "@/components/layout/AdminPageHeader";
import { ProfileForm } from "./ProfileForm";
import { isDeveloperEmail } from "@/lib/developer";

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
                        isDeveloperEmail(session?.user?.email) ||
                        !!session?.user?.isDeveloper;

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
      <div className="space-y-4 sm:space-y-5 pb-8 w-full mx-auto flex items-center justify-center min-h-[50vh]">
        <div className="bg-rose-50/80 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 p-6 rounded-xl text-center max-w-md w-full shadow-xs">
          <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center mx-auto mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-base font-bold text-rose-800 dark:text-rose-300 mb-1">Access Denied</h2>
          <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">You are not a staff member of this workspace.</p>
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
    <div className="space-y-4 sm:space-y-5 pb-8 w-full mx-auto">
      <AdminPageHeader 
        title="Account Settings" 
        description="Manage your personal identity and security preferences within this franchise."
      />

      <ProfileForm user={user} roleName={roleName} tenant={tenant} />
    </div>
  );
}
