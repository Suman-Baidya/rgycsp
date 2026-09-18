"use server";

import { revalidateWorkspacePath } from "@/lib/revalidate";

import { db } from "@/lib/prisma";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";

export async function getStaff(workspaceId: string) {
  try {
    const staff = await unstable_cache(
      () => db.workspaceRole.findMany({
        where: { workspaceId, role: { notIn: ["STUDENT", "PARENT"] } },
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" }
      }),
      [`staff-${workspaceId}`],
      { revalidate: 60, tags: [`staff-${workspaceId}`] }
    )();
    return { success: true, data: staff };
  } catch (error: any) {
    console.error("Failed to fetch staff:", error);
    return { success: false, error: error.message || "Failed to fetch staff" };
  }
}

export async function addStaff(
  workspaceId: string, 
  data: { 
    name: string, 
    email: string, 
    password?: string, 
    role: "ADMIN" | "STAFF" | "TEACHER",
    permissions?: string[]
  }
) {
  try {
    const session = await auth();
    const isSuperAdmin = session?.user?.role === "SUPER_ADMIN" || session?.user?.role === "SUPER_ADMIN_MANAGER" || session?.user?.email === process.env.DEVELOPER_EMAIL;

    const { name, email, password, role, permissions } = data;

    if (role === "ADMIN" && !isSuperAdmin) {
      return { success: false, error: "Only global admins can assign the ADMIN role." };
    }
    
    // 1. Find user by email
    let user = await db.user.findUnique({ where: { email } });

    if (!user) {
      if (!password) {
        return { success: false, error: "User not found. Password is required to create a new user." };
      }
      // Create user if they don't exist
      const passwordHash = await bcrypt.hash(password, 10);
      user = await db.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: "USER" // System role
        }
      });
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
        role,
        permissions: permissions || []
      }
    });

    (revalidateTag as any)(`staff-${workspaceId}`);
    await revalidateWorkspacePath(workspaceId, "/admin/staff", "page");
    return { success: true, data: newRole };
  } catch (error: any) {
    console.error("Failed to add staff:", error);
    return { success: false, error: error.message || "Failed to add staff" };
  }
}

export async function updateStaffRole(
  roleId: string,
  data: {
    role?: "ADMIN" | "STAFF" | "TEACHER" | "MANAGER",
    permissions?: string[]
  }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (data.role === "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return { success: false, error: "Only global admins can assign the ADMIN role." };
    }

    const updatedRole = await db.workspaceRole.update({
      where: { id: roleId },
      data: {
        ...(data.role && { role: data.role }),
        ...(data.permissions && { permissions: data.permissions })
      }
    });
    if (updatedRole.workspaceId) {
      (revalidateTag as any)(`staff-${updatedRole.workspaceId}`);
      await revalidateWorkspacePath(updatedRole.workspaceId, "/admin/staff", "page");
    }
    return { success: true, data: updatedRole };
  } catch (error: any) {
    console.error("Failed to update staff:", error);
    return { success: false, error: error.message || "Failed to update staff" };
  }
}

export async function removeStaff(roleId: string) {
  try {
    const deleted = await db.workspaceRole.delete({
      where: { id: roleId }
    });
    if (deleted.workspaceId) {
      (revalidateTag as any)(`staff-${deleted.workspaceId}`);
      await revalidateWorkspacePath(deleted.workspaceId, "/admin/staff", "page");
    }
    return { success: true };
  } catch (error: any) {
    console.error("Failed to remove staff:", error);
    return { success: false, error: error.message || "Failed to remove staff" };
  }
}
