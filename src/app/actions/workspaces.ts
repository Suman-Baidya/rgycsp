"use server";

import { db } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function createWorkspace(data: any) {
  try {
    const { name, subdomain, ownerName, ownerEmail, ownerPassword } = data;

    // 1. Check if subdomain exists
    const existingWorkspace = await db.workspace.findUnique({
      where: { subdomain },
    });

    if (existingWorkspace) {
      return { success: false, error: "Subdomain is already in use." };
    }

    // 2. Check if user exists, or create user
    let user = await db.user.findUnique({
      where: { email: ownerEmail },
    });

    if (!user) {
      const passwordHash = await bcrypt.hash(ownerPassword, 10);
      user = await db.user.create({
        data: {
          name: ownerName,
          email: ownerEmail,
          passwordHash,
          role: "USER", // Super admins are SUPER_ADMIN, workspace owners are USER with an ADMIN WorkspaceRole
        },
      });
    }

    // 3. Create Workspace
    const workspace = await db.workspace.create({
      data: {
        name,
        subdomain,
        isActive: true,
      },
    });

    // 4. Create WorkspaceRole
    await db.workspaceRole.create({
      data: {
        userId: user.id,
        workspaceId: workspace.id,
        role: "ADMIN",
      },
    });

    revalidatePath("/(admin)/super-admin/workspaces", "page");
    return { success: true, workspaceId: workspace.id };
  } catch (error: any) {
    console.error("Failed to create workspace:", error);
    return { success: false, error: error.message || "Something went wrong." };
  }
}

export async function getWorkspaces() {
  try {
    const workspaces = await db.workspace.findMany({
      include: {
        roles: {
          where: { role: "ADMIN" },
          include: { user: true },
        },
        _count: {
          select: { studentProfiles: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: workspaces };
  } catch (error: any) {
    console.error("Failed to fetch workspaces:", error);
    return { success: false, error: error.message || "Failed to fetch workspaces" };
  }
}
