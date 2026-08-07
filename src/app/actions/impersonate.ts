"use server";

import { db } from "@/lib/prisma";
import { auth } from "@/auth";
import { cookies } from "next/headers";

export async function setImpersonation(studentProfileId: string) {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Not authenticated" };

    const callerRole = session.user.role;
    const isGlobalAdmin = callerRole === "SUPER_ADMIN" || 
                          callerRole === "SUPER_ADMIN_MANAGER" || 
                          session.user.isDeveloper;

    const targetStudent = await db.studentProfile.findUnique({
      where: { id: studentProfileId },
      select: { userId: true, workspaceId: true }
    });

    if (!targetStudent || !targetStudent.userId) {
      return { success: false, error: "Student not found." };
    }

    if (!isGlobalAdmin) {
      const role = await db.workspaceRole.findFirst({
        where: { workspaceId: targetStudent.workspaceId, userId: session.user.id }
      });
      const isFranchiseAdmin = role?.role === "ADMIN" || role?.role === "MANAGER" || role?.role === "TEACHER";
      
      if (!isFranchiseAdmin) {
        return { success: false, error: "Unauthorized to impersonate this student." };
      }
    }

    const targetUser = await db.user.findUnique({
      where: { id: targetStudent.userId },
      select: { name: true }
    });

    const cookieStore = await cookies();
    cookieStore.set("impersonated_profile_id", studentProfileId, { path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    cookieStore.set("impersonated_user_name", targetUser?.name || "Student", { path: '/' });

    return { success: true };
  } catch (error: any) {
    console.error("Error setting impersonation:", error);
    return { success: false, error: "Failed to initialize impersonation." };
  }
}

export async function clearImpersonation() {
  const cookieStore = await cookies();
  cookieStore.delete("impersonated_profile_id");
  cookieStore.delete("impersonated_user_name");
  return { success: true };
}
