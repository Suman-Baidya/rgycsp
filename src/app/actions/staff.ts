"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function getStaff(workspaceId: string) {
  try {
    const staff = await db.workspaceRole.findMany({
      where: { 
        workspaceId,
        role: { notIn: ["STUDENT", "PARENT"] }
      },
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
    const { name, email, password, role, permissions } = data;
    
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

    revalidatePath(`/app/[tenant]/admin/staff`, "page");
    return { success: true, data: newRole };
  } catch (error: any) {
    console.error("Failed to add staff:", error);
    return { success: false, error: error.message || "Failed to add staff" };
  }
}

export async function updateStaffRole(
  roleId: string,
  data: {
    role?: "ADMIN" | "STAFF" | "TEACHER",
    permissions?: string[]
  }
) {
  try {
    const updatedRole = await db.workspaceRole.update({
      where: { id: roleId },
      data: {
        ...(data.role && { role: data.role }),
        ...(data.permissions && { permissions: data.permissions })
      }
    });
    revalidatePath(`/app/[tenant]/admin/staff`, "page");
    return { success: true, data: updatedRole };
  } catch (error: any) {
    console.error("Failed to update staff:", error);
    return { success: false, error: error.message || "Failed to update staff" };
  }
}

export async function removeStaff(roleId: string) {
  try {
    await db.workspaceRole.delete({
      where: { id: roleId }
    });
    revalidatePath(`/app/[tenant]/admin/staff`, "page");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to remove staff:", error);
    return { success: false, error: error.message || "Failed to remove staff" };
  }
}
