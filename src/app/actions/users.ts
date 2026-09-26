"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";
import { getDeveloperEmails, isDeveloperEmail } from "@/lib/developer";

export async function getUsers() {
  try {
    const devEmails = getDeveloperEmails();

    const users = await db.user.findMany({
      where: {
        email: {
          notIn: devEmails,
          mode: "insensitive"
        },
        OR: [
          { role: { in: ["SUPER_ADMIN", "SUPER_ADMIN_MANAGER"] } },
          { workspaceRoles: { some: {} } }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        isActive: true,
        image: true,
        systemPermissions: true,
        lastSeen: true,
        createdAt: true,
        workspaceRoles: {
          include: {
            workspace: {
              select: {
                id: true,
                name: true,
                subdomain: true,
                centerCode: true,
                logoUrl: true,
                state: true,
                district: true,
                signatureUrl: true
              }
            }
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

    // Dual-layer protection: ensure developer email is never leaked to any user or super admin
    const visibleUsers = users.filter(u => !isDeveloperEmail(u.email));
    return { success: true, data: visibleUsers };
  } catch (error: any) {
    console.error("Failed to fetch users:", error);
    return { success: false, error: error.message || "Failed to fetch users" };
  }
}

export async function toggleUserStatus(userId: string, currentStatus: string) {
  // Logic for suspension could be a new field or logic
  // For now we'll revalidate path
  revalidatePath("/super-admin/users");
  return { success: true };
}

export async function createGlobalUser(data: { name: string; email: string; password?: string; role: "SUPER_ADMIN" | "SUPER_ADMIN_MANAGER", systemPermissions?: string[] }) {
  try {
    const session = await auth();
    const isDev = isDeveloperEmail(session?.user?.email) || !!session?.user?.isDeveloper;
    
    if (!isDev && session?.user?.role !== "SUPER_ADMIN" && session?.user?.role !== "SUPER_ADMIN_MANAGER") {
      return { success: false, error: "Unauthorized" };
    }

    const { name, email, password, role, systemPermissions } = data;
    if (isDeveloperEmail(email)) {
      return { success: false, error: "This email is reserved for system administration." };
    }

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
    
    revalidatePath("/super-admin/users");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to create global user:", error);
    return { success: false, error: error.message || "Failed to create user" };
  }
}

export async function updateGlobalUserPermissions(userId: string, permissions: string[]) {
  try {
    const session = await auth();
    const isDev = isDeveloperEmail(session?.user?.email) || !!session?.user?.isDeveloper;
    
    // Only Developer or SUPER_ADMIN can update permissions
    if (!isDev && session?.user?.role !== "SUPER_ADMIN" && session?.user?.role !== "SUPER_ADMIN_MANAGER") {
      return { success: false, error: "Unauthorized" };
    }

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user || isDeveloperEmail(user.email)) {
      return { success: false, error: "User not found or protected." };
    }

    if ((user.role as string) !== "SUPER_ADMIN_MANAGER") {
      return { success: false, error: "Can only update permissions for Super Admin Managers" };
    }

    await db.user.update({
      where: { id: userId },
      data: {
        systemPermissions: permissions,
      } as any
    });

    revalidatePath("/super-admin/users");
    // Also revalidate layout to refresh sidebar if they are logged in
    revalidatePath("/super-admin", "layout");
    
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update global permissions:", error);
    return { success: false, error: error.message || "Failed to update permissions" };
  }
}

export async function restrictUser(userId: string, isActive: boolean) {
  try {
    const session = await auth();
    const isDev = isDeveloperEmail(session?.user?.email) || !!session?.user?.isDeveloper;
    
    if (!isDev && session?.user?.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const targetUser = await db.user.findUnique({ where: { id: userId }, select: { email: true } });
    if (targetUser && isDeveloperEmail(targetUser.email)) {
      return { success: false, error: "Protected system user cannot be restricted." };
    }

    await db.user.update({
      where: { id: userId },
      data: { isActive }
    });

    revalidatePath("/super-admin/users");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to restrict user:", error);
    return { success: false, error: error.message || "Failed to restrict user" };
  }
}

export async function deleteUser(userId: string) {
  try {
    const session = await auth();
    const isDev = isDeveloperEmail(session?.user?.email) || !!session?.user?.isDeveloper;
    
    if (!isDev && session?.user?.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const targetUser = await db.user.findUnique({ where: { id: userId }, select: { email: true } });
    if (targetUser && isDeveloperEmail(targetUser.email)) {
      return { success: false, error: "Protected system user cannot be deleted." };
    }

    await db.user.delete({
      where: { id: userId }
    });

    revalidatePath("/super-admin/users");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete user:", error);
    return { success: false, error: error.message || "Failed to delete user" };
  }
}

export async function changeUserPassword(userId: string, newPassword: string) {
  try {
    const session = await auth();
    const isDev = isDeveloperEmail(session?.user?.email) || !!session?.user?.isDeveloper;
    
    // Only Developer or SUPER_ADMIN can arbitrarily change passwords
    if (!isDev && session?.user?.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized. Only Super Admins can change passwords." };
    }

    const targetUser = await db.user.findUnique({ where: { id: userId }, select: { email: true } });
    if (targetUser && isDeveloperEmail(targetUser.email) && !isDev) {
      return { success: false, error: "Protected system user password cannot be modified." };
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

