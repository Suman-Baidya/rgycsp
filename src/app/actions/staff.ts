"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getStaff(workspaceId: string) {
  try {
    const staff = await db.workspaceRole.findMany({
      where: { workspaceId },
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    return { success: true, data: staff };
  } catch (error: any) {
    console.error("Failed to fetch staff:", error);
    return { success: false, error: error.message || "Failed to fetch staff" };
  }
}

export async function addStaff(workspaceId: string, email: string, role: "ADMIN" | "STAFF" | "TEACHER") {
  try {
    // 1. Find user by email
    let user = await db.user.findUnique({ where: { email } });

    if (!user) {
      return { success: false, error: "User not found. They must create an account first." };
    }

    // 2. Check if already has a role in this workspace
    const existingRole = await db.workspaceRole.findUnique({
      where: { userId_workspaceId: { userId: user.id, workspaceId } }
    });

    if (existingRole) {
      return { success: false, error: "User already has a role in this workspace." };
    }

    // 3. Create role
    const newRole = await db.workspaceRole.create({
      data: {
        userId: user.id,
        workspaceId,
        role
      }
    });

    revalidatePath(`/app/[tenant]/admin/staff`, "page");
    return { success: true, data: newRole };
  } catch (error: any) {
    console.error("Failed to add staff:", error);
    return { success: false, error: error.message || "Failed to add staff" };
  }
}
