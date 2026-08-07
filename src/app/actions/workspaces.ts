"use server";

import { db } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function createWorkspace(data: any) {
  try {
    const { 
      name, 
      subdomain, 
      isSubdomainEnabled,
      ownerName, 
      ownerEmail, 
      ownerPassword,
      contactPhone,
      contactEmail,
      whatsapp,
      address,
      state,
      district,
      pinCode,
      primaryColor,
      brandDescription,
      centerCode,
      ownerAddress,
      ownerState,
      ownerDistrict,
      ownerPinCode,
      ownerPhotoUrl,
      signatureUrl,
      idProofUrl
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
      include: { workspaceRoles: true }
    });

    if (user) {
      const hasAdminRole = user.workspaceRoles.some(role => role.role === "ADMIN");
      if (hasAdminRole) {
        return { success: false, error: "This email is already registered to another institute. One email can only be used for one institute." };
      }
    }

    if (!user) {
      const passwordHash = await bcrypt.hash(ownerPassword, 10);
      user = await db.user.create({
        data: {
          name: ownerName,
          email: ownerEmail,
          passwordHash,
          username: centerCode,
          role: "USER",
        },
      });
    } else if (!user.username && centerCode) {
      user = await db.user.update({
        where: { id: user.id },
        data: { username: centerCode }
      });
    }

    // 3. Create Workspace with associated SiteSettings
    const workspace = await db.workspace.create({
      data: {
        name,
        subdomain: subdomain.toLowerCase(),
        isActive: true,
        isSubdomainEnabled: isSubdomainEnabled ?? true,
        centerCode: centerCode || null,
        state: state || null,
        district: district || null,
        pinCode: pinCode || null,
        ownerAddress: ownerAddress || null,
        ownerState: ownerState || null,
        ownerDistrict: ownerDistrict || null,
        ownerPinCode: ownerPinCode || null,
        ownerPhotoUrl: ownerPhotoUrl || null,
        signatureUrl: signatureUrl || null,
        idProofUrl: idProofUrl || null,
        siteSettings: {
          create: {
            siteName: name,
            contactEmail: contactEmail || ownerEmail,
            contactPhone: contactPhone || null,
            whatsapp: whatsapp || null,
            address: address || null,
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
          include: { 
            user: {
              select: { id: true, name: true, username: true, email: true, image: true, role: true }
            } 
          },
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
      isSubdomainEnabled,
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

    // Check if new centerCode is taken by another workspace or user
    if (centerCode) {
      const existingWorkspaceCode = await db.workspace.findFirst({
        where: { centerCode, id: { not: workspaceId } }
      });
      if (existingWorkspaceCode) {
        return { success: false, error: "Center Code is already in use by another franchise." };
      }
      
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
        subdomain: subdomain ? subdomain.toLowerCase() : undefined,
        isSubdomainEnabled: isSubdomainEnabled ?? undefined,
        centerCode,
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

export async function toggleWorkspaceStatus(workspaceId: string, isActive: boolean) {
  try {
    await db.workspace.update({
      where: { id: workspaceId },
      data: { isActive }
    });
    revalidatePath("/(admin)/super-admin", "page");
    revalidatePath("/(admin)/super-admin/franchises", "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update workspace status" };
  }
}

export async function deleteWorkspace(workspaceId: string) {
  try {
    // Delete the workspace. Prisma cascading should handle related entities if configured,
    // otherwise we might need to delete them manually. Let us just try deleting the workspace directly.
    await db.workspace.delete({
      where: { id: workspaceId }
    });
    revalidatePath("/(admin)/super-admin", "page");
    revalidatePath("/(admin)/super-admin/franchises", "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete workspace" };
  }
}


export async function updateWorkspaceShippingAddress(workspaceId: string, shippingAddress: string) {
  try {
    const updated = await db.workspace.update({
      where: { id: workspaceId },
      data: { shippingAddress }
    });
    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Failed to update shipping address:", error);
    return { success: false, error: "Failed to update shipping address" };
  }
}

export async function toggleDocumentAuthority(workspaceId: string, status: boolean) {
  try {
    const updated = await db.workspace.update({
      where: { id: workspaceId },
      data: { hasDocumentAuthority: status }
    });
    revalidatePath("/(admin)/super-admin/franchises", "page");
    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Failed to toggle document authority:", error);
    return { success: false, error: "Failed to toggle document authority power" };
  }
}
