"use server";

import { db } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath, revalidateTag } from "next/cache";
import { isDeveloperEmail } from "@/lib/developer";
import { getPlatformRoutingConfig } from "./platform-routing";
import { DEFAULT_ROUTING_CONFIG } from "@/lib/routing-config";

export interface UserGuideInput {
  id?: string;
  title: string;
  description?: string | null;
  category?: string;
  targetRole: "SUPER_ADMIN" | "FRANCHISE_ADMIN";
  contentType: "YOUTUBE" | "PDF" | "ARTICLE" | "LINK";
  youtubeUrl?: string | null;
  pdfUrl?: string | null;
  externalUrl?: string | null;
  content?: string | null;
  order?: number;
  isPublished?: boolean;
  isAllFranchises?: boolean;
  assignedWorkspaces?: any;
  guideType?: "OFFICIAL" | "SOP" | "DIRECTIVE";
  isLocked?: boolean;
  version?: string;
}

/**
 * Fetch published user guides for a given portal target ("SUPER_ADMIN" or "FRANCHISE_ADMIN").
 * Respects Developer master switches, Super Admin toggles, and franchise targeting.
 */
export async function getPublishedUserGuides(targetRole: "SUPER_ADMIN" | "FRANCHISE_ADMIN", workspaceId?: string) {
  try {
    const routingConfig = await getPlatformRoutingConfig();

    // 1. Check master Developer switch
    if (!routingConfig.enableUserGuides) {
      return { success: false, enabled: false, guides: [] };
    }

    // 2. Check Super Admin permission
    if (targetRole === "SUPER_ADMIN" && !routingConfig.enableSuperAdminGuides) {
      return { success: false, enabled: false, guides: [] };
    }

    // 3. Check Franchise Admin permission (Developer master permission + Super Admin toggle)
    if (targetRole === "FRANCHISE_ADMIN") {
      if (!routingConfig.enableFranchiseGuides || !routingConfig.franchiseGuidesEnabled) {
        return { success: false, enabled: false, guides: [] };
      }
    }

    // 4. Filter by allowed content types configured by Developer:
    const allowedContentTypes: string[] = [];
    if (routingConfig.enableGuideVideos) allowedContentTypes.push("YOUTUBE");
    if (routingConfig.enableGuidePdfs) allowedContentTypes.push("PDF");
    if (routingConfig.enableGuideArticles) allowedContentTypes.push("ARTICLE");
    if (routingConfig.enableGuideExternalLinks) allowedContentTypes.push("LINK");

    if (allowedContentTypes.length === 0) {
      return { success: true, enabled: true, guides: [] };
    }

    const whereConditions: any = {
      targetRole,
      isPublished: true,
      contentType: { in: allowedContentTypes as any }
    };

    const allGuides = await db.userGuide.findMany({
      where: whereConditions,
      orderBy: [
        { order: "asc" },
        { createdAt: "asc" }
      ]
    });

    // If targetRole is FRANCHISE_ADMIN and a workspaceId is provided, filter:
    // keep guides that are for all franchises OR specifically assigned to this workspaceId
    let guides = allGuides;
    if (targetRole === "FRANCHISE_ADMIN" && workspaceId) {
      guides = allGuides.filter(guide => {
        if (guide.isAllFranchises !== false) return true;
        if (!guide.assignedWorkspaces) return false;
        const assigned = Array.isArray(guide.assignedWorkspaces) ? guide.assignedWorkspaces : [];
        return assigned.some((item: any) => 
          typeof item === "string" ? item === workspaceId : item?.id === workspaceId
        );
      });
    }

    return { success: true, enabled: true, guides };
  } catch (error: any) {
    console.error("Failed to fetch user guides:", error);
    return { success: false, enabled: false, guides: [], error: error.message };
  }
}

/**
 * Fetch minimal list of active franchise centers for guide targeting dropdowns.
 */
export async function getFranchiseWorkspacesList() {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, franchises: [] };

    const franchises = await db.workspace.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        centerCode: true,
        subdomain: true,
        district: true,
        state: true,
      },
      orderBy: { name: "asc" },
    });

    return { success: true, franchises };
  } catch (error: any) {
    console.error("Failed to fetch franchises list for guides:", error);
    return { success: false, franchises: [] };
  }
}

/**
 * Fetch all guides for management console (Developer / Super Admin).
 */
export async function getAllUserGuidesForAdmin() {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const userEmail = session.user.email;
    const isDev = Boolean((session.user as any)?.isDeveloper || isDeveloperEmail(userEmail));
    const userRole = session.user.role;
    const isSuperAdmin = userRole === "SUPER_ADMIN" || userRole === "SUPER_ADMIN_MANAGER" || isDev;

    if (!isSuperAdmin) {
      return { success: false, error: "Access Denied" };
    }

    const routingConfig = await getPlatformRoutingConfig();

    // If disabled by developer and user is not developer, block access
    if (!isDev && (!routingConfig.enableUserGuides || !routingConfig.enableSuperAdminGuides)) {
      return { 
        success: false, 
        error: "Access Denied: User guides have been disabled by system developer.",
        guides: []
      };
    }

    // Developer sees all guides regardless of content flags.
    // Non-developer Super Admin sees guides matching permitted content types.
    let whereCondition: any = {};
    if (!isDev) {
      const allowedContentTypes: string[] = [];
      if (routingConfig.enableGuideVideos) allowedContentTypes.push("YOUTUBE");
      if (routingConfig.enableGuidePdfs) allowedContentTypes.push("PDF");
      if (routingConfig.enableGuideArticles) allowedContentTypes.push("ARTICLE");
      if (routingConfig.enableGuideExternalLinks) allowedContentTypes.push("LINK");

      if (allowedContentTypes.length === 0) {
        return { 
          success: true, 
          guides: [], 
          isDeveloper: false, 
          config: routingConfig 
        };
      }

      const roleConditions: any[] = [{ targetRole: "FRANCHISE_ADMIN" }];
      if (routingConfig.enableSuperAdminGuides) {
        roleConditions.push({
          targetRole: "SUPER_ADMIN",
          isPublished: true,
        });
      }

      whereCondition = {
        OR: roleConditions,
        contentType: { in: allowedContentTypes as any }
      };
    }

    const guides = await db.userGuide.findMany({
      where: whereCondition,
      orderBy: [
        { targetRole: "asc" },
        { order: "asc" },
        { createdAt: "asc" }
      ]
    });

    return { 
      success: true, 
      guides, 
      isDeveloper: isDev,
      config: routingConfig
    };
  } catch (error: any) {
    console.error("Failed to load admin user guides:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Create or update a User Guide entry.
 */
export async function saveUserGuide(data: UserGuideInput) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const userEmail = session.user.email;
    const isDev = Boolean((session.user as any)?.isDeveloper || isDeveloperEmail(userEmail));
    const userRole = session.user.role;
    const isSuperAdmin = userRole === "SUPER_ADMIN" || userRole === "SUPER_ADMIN_MANAGER" || isDev;

    if (!isSuperAdmin) {
      return { success: false, error: "Access Denied" };
    }

    const routingConfig = await getPlatformRoutingConfig();
    if (!isDev && (!routingConfig.enableUserGuides || !routingConfig.enableSuperAdminGuides)) {
      return { success: false, error: "User guides are currently disabled by developer." };
    }

    // Non-developers cannot submit content types disabled by Developer
    if (!isDev) {
      if (data.contentType === "YOUTUBE" && !routingConfig.enableGuideVideos) {
        return { success: false, error: "YouTube video guides are currently disabled by developer." };
      }
      if (data.contentType === "PDF" && !routingConfig.enableGuidePdfs) {
        return { success: false, error: "PDF documentation guides are currently disabled by developer." };
      }
      if (data.contentType === "ARTICLE" && !routingConfig.enableGuideArticles) {
        return { success: false, error: "Written article guides are currently disabled by developer." };
      }
      if (data.contentType === "LINK" && !routingConfig.enableGuideExternalLinks) {
        return { success: false, error: "External link guides are currently disabled by developer." };
      }
    }

    // Super Admins who are not Developers can only create/update Franchise Admin guides
    const targetRole = isDev ? data.targetRole : "FRANCHISE_ADMIN";
    const createdByRole = isDev ? "DEVELOPER" : "SUPER_ADMIN";

    if (data.id) {
      // Update existing guide
      const existing = await db.userGuide.findUnique({ where: { id: data.id } });
      if (!existing) {
        return { success: false, error: "Guide not found" };
      }

      // Lock Protection: If existing guide is locked, only verified Developer can edit
      if (existing.isLocked && !isDev) {
        return { 
          success: false, 
          error: "This guide is locked by Developer as an immutable system standard. Only verified developers can modify it." 
        };
      }

      // If existing guide was created by Developer and current user is only Super Admin, block edits
      if (existing.createdByRole === "DEVELOPER" && !isDev) {
        return { success: false, error: "Only verified Developer can edit Developer-authored guides." };
      }

      const isAllFranchises = data.isAllFranchises ?? true;
      const assignedWorkspaces = isAllFranchises ? null : (data.assignedWorkspaces || []);
      const guideType = data.guideType || "OFFICIAL";
      const isLocked = isDev ? (data.isLocked ?? existing.isLocked) : existing.isLocked;
      const version = isDev ? (data.version || existing.version) : existing.version;

      const updated = await db.userGuide.update({
        where: { id: data.id },
        data: {
          title: data.title,
          description: data.description,
          category: data.category || "General",
          targetRole,
          contentType: data.contentType,
          youtubeUrl: data.youtubeUrl || null,
          pdfUrl: data.pdfUrl || null,
          externalUrl: data.externalUrl || null,
          content: data.content || null,
          order: data.order ?? 0,
          isPublished: data.isPublished ?? true,
          isAllFranchises,
          assignedWorkspaces,
          guideType,
          isLocked,
          version,
        }
      });

      revalidatePath("/super-admin/guides");
      revalidatePath("/admin/guides");
      return { success: true, guide: updated };
    } else {
      // Create new guide
      const isAllFranchises = data.isAllFranchises ?? true;
      const assignedWorkspaces = isAllFranchises ? null : (data.assignedWorkspaces || []);
      const guideType = data.guideType || "OFFICIAL";
      const isLocked = isDev ? (data.isLocked ?? false) : false;
      const version = data.version || "1.0.0";

      const created = await db.userGuide.create({
        data: {
          title: data.title,
          description: data.description,
          category: data.category || "General",
          targetRole,
          contentType: data.contentType,
          youtubeUrl: data.youtubeUrl || null,
          pdfUrl: data.pdfUrl || null,
          externalUrl: data.externalUrl || null,
          content: data.content || null,
          order: data.order ?? 0,
          isPublished: data.isPublished ?? true,
          isAllFranchises,
          assignedWorkspaces,
          guideType,
          isLocked,
          version,
          createdByRole,
          createdById: session.user.id,
        }
      });

      revalidatePath("/super-admin/guides");
      revalidatePath("/admin/guides");
      return { success: true, guide: created };
    }
  } catch (error: any) {
    console.error("Failed to save user guide:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a User Guide entry.
 */
export async function deleteUserGuide(id: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const userEmail = session.user.email;
    const isDev = Boolean((session.user as any)?.isDeveloper || isDeveloperEmail(userEmail));
    const userRole = session.user.role;
    const isSuperAdmin = userRole === "SUPER_ADMIN" || userRole === "SUPER_ADMIN_MANAGER" || isDev;

    if (!isSuperAdmin) {
      return { success: false, error: "Access Denied" };
    }

    const routingConfig = await getPlatformRoutingConfig();
    if (!isDev && (!routingConfig.enableUserGuides || !routingConfig.enableSuperAdminGuides)) {
      return { success: false, error: "User guides are currently disabled by developer." };
    }

    const existing = await db.userGuide.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: "Guide not found" };
    }

    // Locked guides can only be deleted by verified Developer
    if (existing.isLocked && !isDev) {
      return { 
        success: false, 
        error: "This guide is locked by Developer as an immutable system standard. Only verified developers can delete it." 
      };
    }

    if (existing.createdByRole === "DEVELOPER" && !isDev) {
      return { success: false, error: "Only verified Developer can delete Developer-authored guides." };
    }

    await db.userGuide.delete({ where: { id } });

    revalidatePath("/super-admin/guides");
    revalidatePath("/admin/guides");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete user guide:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Toggle lock on an official guide (Developer only).
 */
export async function toggleGuideLock(id: string, isLocked: boolean) {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Unauthorized" };

    const userEmail = session.user.email;
    const isDev = Boolean((session.user as any)?.isDeveloper || isDeveloperEmail(userEmail));
    if (!isDev) {
      return { success: false, error: "Only verified developers can lock or unlock official guides." };
    }

    const updated = await db.userGuide.update({
      where: { id },
      data: { isLocked },
    });

    revalidatePath("/super-admin/guides");
    return { success: true, guide: updated };
  } catch (error: any) {
    console.error("Failed to toggle guide lock:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Bulk lock all official Developer guides.
 */
export async function bulkLockOfficialGuides() {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Unauthorized" };

    const userEmail = session.user.email;
    const isDev = Boolean((session.user as any)?.isDeveloper || isDeveloperEmail(userEmail));
    if (!isDev) {
      return { success: false, error: "Only verified developers can bulk lock official guides." };
    }

    const result = await db.userGuide.updateMany({
      where: {
        OR: [
          { createdByRole: "DEVELOPER" },
          { targetRole: "SUPER_ADMIN" }
        ]
      },
      data: {
        isLocked: true,
      }
    });

    revalidatePath("/super-admin/guides");
    return { success: true, count: result.count };
  } catch (error: any) {
    console.error("Failed to bulk lock official guides:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Super Admin toggle to control Franchise Admin User Guide visibility.
 */
export async function toggleFranchiseGuideVisibility(enabled: boolean) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const userRole = session.user.role;
    const userEmail = session.user.email;
    const isDev = Boolean((session.user as any)?.isDeveloper || isDeveloperEmail(userEmail));
    const isSuperAdmin = userRole === "SUPER_ADMIN" || userRole === "SUPER_ADMIN_MANAGER" || isDev;

    if (!isSuperAdmin) {
      return { success: false, error: "Access Denied" };
    }

    const siteSettings = await db.siteSettings.findFirst({
      where: { workspaceId: null },
      select: { id: true, routingConfig: true }
    });

    const currentConfig = (siteSettings?.routingConfig as any) || DEFAULT_ROUTING_CONFIG;
    const updatedConfig = {
      ...currentConfig,
      franchiseGuidesEnabled: enabled,
      updatedAt: new Date().toISOString(),
    };

    if (siteSettings) {
      await db.siteSettings.update({
        where: { id: siteSettings.id },
        data: { routingConfig: updatedConfig as any }
      });
    }

    (revalidateTag as any)("site-settings");
    revalidatePath("/super-admin/guides");
    revalidatePath("/admin/guides");
    return { success: true, enabled };
  } catch (error: any) {
    console.error("Failed to toggle franchise guide visibility:", error);
    return { success: false, error: error.message };
  }
}
