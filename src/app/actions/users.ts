"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";

export async function getUsers() {
  try {
    const session = await auth();
    const devEmail = process.env.DEVELOPER_EMAIL || "";
    const isDev = session?.user?.email === devEmail;

    const whereClause = isDev ? {} : {
      email: {
        not: devEmail
      }
    };

    const users = await db.user.findMany({
      where: whereClause,
      include: {
        workspaceRoles: {
          include: {
            workspace: {
              select: {
                id: true,
                name: true,
                subdomain: true
              }
            }
          }
        },
        studentProfile: {
          select: {
            id: true,
            enrollmentNo: true,
            status: true
          }
        },
        _count: {
          select: {
            workspaceRoles: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: users };
  } catch (error: any) {
    console.error("Failed to fetch users:", error);
    return { success: false, error: error.message || "Failed to fetch users" };
  }
}

export async function toggleUserStatus(userId: string, currentStatus: string) {
  // Logic for suspension could be a new field or logic
  // For now we'll revalidate path
  revalidatePath("/(admin)/super-admin/users");
  return { success: true };
}

export async function createGlobalUser(data: { name: string; email: string; password?: string; role: "SUPER_ADMIN" | "SUPER_ADMIN_MANAGER", systemPermissions?: string[] }) {
  try {
    const session = await auth();
    const devEmail = process.env.DEVELOPER_EMAIL || "";
    const isDev = session?.user?.email === devEmail;
    
    if (!isDev && session?.user?.role !== "SUPER_ADMIN" && session?.user?.role !== "SUPER_ADMIN_MANAGER") {
      return { success: false, error: "Unauthorized" };
    }

    const { name, email, password, role, systemPermissions } = data;
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) return { success: false, error: "Email already in use" };

    const passwordHash = password ? await bcrypt.hash(password, 10) : undefined;
    
    await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: role as any,
        systemPermissions: role === "SUPER_ADMIN_MANAGER" ? (systemPermissions as any) : undefined,
      } as any
    });
    
    revalidatePath("/(admin)/super-admin/users");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to create global user:", error);
    return { success: false, error: error.message || "Failed to create user" };
  }
}

export async function updateGlobalUserPermissions(userId: string, permissions: string[]) {
  try {
    const session = await auth();
    const devEmail = process.env.DEVELOPER_EMAIL || "";
    const isDev = session?.user?.email === devEmail;
    
    // Only Developer or SUPER_ADMIN can update permissions
    if (!isDev && session?.user?.role !== "SUPER_ADMIN" && session?.user?.role !== "SUPER_ADMIN_MANAGER") {
      return { success: false, error: "Unauthorized" };
    }

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user || (user.role as string) !== "SUPER_ADMIN_MANAGER") {
      return { success: false, error: "Can only update permissions for Super Admin Managers" };
    }

    await db.user.update({
      where: { id: userId },
      data: {
        systemPermissions: permissions,
      } as any
    });

    revalidatePath("/(admin)/super-admin/users");
    // Also revalidate layout to refresh sidebar if they are logged in
    revalidatePath("/(admin)/super-admin", "layout");
    
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update global permissions:", error);
    return { success: false, error: error.message || "Failed to update permissions" };
  }
}

export async function restrictUser(userId: string, isActive: boolean) {
  try {
    const session = await auth();
    const devEmail = process.env.DEVELOPER_EMAIL || "";
    const isDev = session?.user?.email === devEmail;
    
    if (!isDev && session?.user?.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    await db.user.update({
      where: { id: userId },
      data: { isActive }
    });

    revalidatePath("/(admin)/super-admin/users");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to restrict user:", error);
    return { success: false, error: error.message || "Failed to restrict user" };
  }
}

export async function deleteUser(userId: string) {
  try {
    const session = await auth();
    const devEmail = process.env.DEVELOPER_EMAIL || "";
    const isDev = session?.user?.email === devEmail;
    
    if (!isDev && session?.user?.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    await db.user.delete({
      where: { id: userId }
    });

    revalidatePath("/(admin)/super-admin/users");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete user:", error);
    return { success: false, error: error.message || "Failed to delete user" };
  }
}

export async function changeUserPassword(userId: string, newPassword: string) {
  try {
    const session = await auth();
    const devEmail = process.env.DEVELOPER_EMAIL || "";
    const isDev = session?.user?.email === devEmail;
    
    // Only Developer or SUPER_ADMIN can arbitrarily change passwords
    if (!isDev && session?.user?.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized. Only Super Admins can change passwords." };
    }

    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: "Password must be at least 6 characters long." };
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await db.user.update({
      where: { id: userId },
      data: { passwordHash }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Failed to change user password:", error);
    return { success: false, error: error.message || "Failed to change user password" };
  }
}

