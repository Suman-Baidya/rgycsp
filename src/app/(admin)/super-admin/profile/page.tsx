import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AdminPageHeader } from "@/components/layout/AdminPageHeader";
import { ProfileForm } from "./ProfileForm";

export const metadata = {
  title: "Account Profile | ABCD Admin",
  description: "Manage your administrative account settings and security preferences.",
};

export default async function ProfilePage() {
  const session = await auth();
  
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

  return (
    <div className="space-y-10 pb-24">
      <AdminPageHeader 
        title="Account Settings" 
        description="Manage your personal identity and security infrastructure within the ecosystem."
      />

      <ProfileForm user={user} />
    </div>
  );
}
