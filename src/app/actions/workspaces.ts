"use server";

import { db } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function createWorkspace(data: any) {
  try {
    const { 
      name, 
      subdomain, 
      ownerName, 
      ownerEmail, 
      ownerPassword,
      contactPhone,
      primaryColor,
      brandDescription
    } = data;

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
          role: "USER",
        },
      });
    }

    // 3. Create Workspace with associated SiteSettings
    const workspace = await db.workspace.create({
      data: {
        name,
        subdomain,
        isActive: true,
        siteSettings: {
          create: {
            siteName: name,
            contactEmail: ownerEmail,
            contactPhone: contactPhone || null,
            primaryColor: primaryColor || "#3b82f6",
            brandDescription: brandDescription || `Welcome to ${name}`,
          }
        }
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

    revalidatePath("/(admin)/super-admin", "page");
    revalidatePath("/(admin)/super-admin/franchises", "page");
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
          select: { 
            studentProfiles: true,
            courses: true,
            batches: true
          },
        },
        siteSettings: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: workspaces };
  } catch (error: any) {
    console.error("Failed to fetch workspaces:", error);
    return { success: false, error: error.message || "Failed to fetch workspaces" };
  }
}

export async function updateCenterConfig(workspaceId: string, data: any) {
  try {
    const {
      name,
      subdomain,
      centerCode, // username of the admin
      ownerName,
      ownerEmail,
      contactPhone,
      address,
      logoUrl,
      signatureUrl,
      idProofUrl
    } = data;

    // Check if new subdomain is taken by another workspace
    if (subdomain) {
      const existingSubdomain = await db.workspace.findFirst({
        where: { 
          subdomain,
          id: { not: workspaceId }
        }
      });
      if (existingSubdomain) {
        return { success: false, error: "Subdomain is already in use by another franchise." };
      }
    }

    // Check if new centerCode is taken by another user
    if (centerCode) {
      const existingUserCode = await db.user.findFirst({
        where: {
          username: centerCode,
          workspaceRoles: { none: { workspaceId } } // check if another user has this username
        }
      });
      if (existingUserCode) {
        return { success: false, error: "Center Code (username) is already in use." };
      }
    }

    // Update Workspace
    const workspace = await db.workspace.update({
      where: { id: workspaceId },
      data: {
        name,
        subdomain,
        logoUrl,
        signatureUrl,
        idProofUrl
      },
      include: { roles: { include: { user: true } } }
    });

    // Update SiteSettings
    await db.siteSettings.upsert({
      where: { workspaceId },
      create: {
        workspaceId,
        siteName: name,
        contactEmail: ownerEmail,
        contactPhone,
        address
      },
      update: {
        siteName: name,
        contactEmail: ownerEmail,
        contactPhone,
        address
      }
    });

    // Update Admin User
    const adminRole = workspace.roles.find(r => r.role === "ADMIN");
    if (adminRole?.user) {
      // Ensure email doesn't conflict
      if (ownerEmail && ownerEmail !== adminRole.user.email) {
        const existingEmail = await db.user.findFirst({
          where: { email: ownerEmail, id: { not: adminRole.userId } }
        });
        if (existingEmail) {
          return { success: false, error: "Email is already in use by another user." };
        }
      }

      await db.user.update({
        where: { id: adminRole.userId },
        data: {
          name: ownerName,
          email: ownerEmail,
          username: centerCode
        }
      });
    }

    revalidatePath("/(admin)/super-admin", "page");
    revalidatePath("/(admin)/super-admin/franchises", "page");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update center config:", error);
    return { success: false, error: error.message || "Failed to update center configuration." };
  }
}
