"use server";

import { db } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { revalidateWorkspacePath } from "@/lib/revalidate";

import type { NoticeItem, NoticeRetentionConfig } from "@/types/events-notices";

/**
 * Get unified Events and Notices for either Super Admin or Franchise Admin
 */
export async function getEventsAndNotices(workspaceId?: string | null) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const isSuperAdmin = session.user.role === "SUPER_ADMIN" || session.user.role === "SUPER_ADMIN_MANAGER";

    // 1. Fetch Events
    let events: any[] = [];
    if (!workspaceId && isSuperAdmin) {
      // Super Admin: fetch all events
      events = await db.event.findMany({
        orderBy: { date: "desc" },
        include: {
          workspace: {
            select: {
              id: true,
              name: true,
              subdomain: true,
              centerCode: true,
            },
          },
        },
      });
    } else if (workspaceId) {
      // Franchise Admin: fetch center's events AND active Head Office events
      events = await db.event.findMany({
        where: {
          OR: [
            { workspaceId },
            { workspaceId: null, isActive: true, showOnFranchises: true },
          ],
        },
        orderBy: { date: "desc" },
        include: {
          workspace: {
            select: {
              id: true,
              name: true,
              subdomain: true,
              centerCode: true,
            },
          },
        },
      });
    }

    // Process events to tag isGlobal / isHeadOffice
    const processedEvents = events.map((e) => ({
      ...e,
      isHeadOffice: !e.workspaceId,
      dateString: e.date ? new Date(e.date).toISOString().split("T")[0] : "",
    }));

    // 2. Fetch Notices
    let centerNotices: NoticeItem[] = [];
    let headOfficeNotices: any[] = [];
    let broadcastNotices: any[] = [];

    if (workspaceId) {
      // A. Franchise Center Notices (from LandingSection 'about')
      const settings = await db.siteSettings.findFirst({
        where: { workspaceId },
        include: {
          sections: {
            where: { type: "about" },
          },
        },
      });

      const aboutSection = settings?.sections?.[0];
      const rawNotices = (aboutSection?.content as any)?.notices || [];

      centerNotices = rawNotices.map((n: any, idx: number) => ({
        id: n.id || `notice-${idx}`,
        title: n.title || "Untitled Notice",
        message: n.message || "",
        date: n.date || new Date().toISOString().split("T")[0],
        link: n.link || "#",
        audience: n.audience || "ALL",
        priority: n.priority || "NORMAL",
        isActive: n.isActive !== false,
        publishedBy: n.publishedBy || "Center Administration",
        createdAt: n.createdAt || new Date().toISOString(),
        refNo: n.refNo || null,
        scheduledFor: n.scheduledFor || null,
        status: n.status || (n.scheduledFor && new Date(n.scheduledFor) > new Date() ? "SCHEDULED" : "PUBLISHED"),
        templateId: n.templateId || null,
        category: n.category || "General",
      }));

      // B. Head Office Notices / Circulars broadcast by Super Admin
      headOfficeNotices = await db.notification.findMany({
        where: {
          type: { in: ["CIRCULAR", "NOTICE", "EVENT", "WARNING"] },
          userId: null,
          OR: [
            { 
              workspaceId: null,
              targetAudience: { in: ["ALL_FRANCHISES", "SPECIFIC_FRANCHISE", "ALL", "PUBLIC"] },
            }, // Sent to all franchises by Super Admin
            { 
              workspaceId,
              targetAudience: { in: ["ALL_FRANCHISES", "SPECIFIC_FRANCHISE"] },
            }, // Sent specifically to this franchise by Super Admin
          ],
          // Strictly exclude student circulars (whether from HO or center)
          NOT: [
            { targetAudience: "STUDENTS" },
            { link: "/student/notices" },
          ],
        },
        include: {
          workspace: {
            select: {
              id: true,
              name: true,
              subdomain: true,
              centerCode: true,
              signatureUrl: true,
              logoUrl: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      });
    } else if (isSuperAdmin) {
      // Super Admin: Fetch ONLY notices sent BY Super Admin
      // (workspaceId null = sent globally; OR sent to specific franchise by SA)
      // We NEVER show franchise-internal notices (those have a workspaceId but
      // targetAudience STUDENTS / STAFF / null — those are center-only).
      broadcastNotices = await db.notification.findMany({
        where: {
          type: { in: ["CIRCULAR", "NOTICE", "EVENT", "WARNING"] },
          userId: null,
          // Only SA-originated: workspaceId null (global) OR targetAudience shows it was a SA broadcast to franchise(s)
          OR: [
            { workspaceId: null },
            { targetAudience: { in: ["ALL_FRANCHISES", "SPECIFIC_FRANCHISE", "STUDENTS", "PUBLIC"] } },
          ],
          // Exclude franchise → super-admin requests (handled separately)
          NOT: { targetAudience: "SUPER_ADMIN" },
        },
        include: {
          workspace: {
            select: {
              id: true,
              name: true,
              subdomain: true,
              centerCode: true,
              district: true,
              state: true,
              signatureUrl: true,
              logoUrl: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      });

      // Also get global landing page notices
      const globalSettings = await db.siteSettings.findFirst({
        where: { workspaceId: null },
        include: {
          sections: {
            where: { type: "about" },
          },
        },
      });

      const globalAboutSection = globalSettings?.sections?.[0];
      const rawGlobalNotices = (globalAboutSection?.content as any)?.notices || [];
      centerNotices = rawGlobalNotices.map((n: any, idx: number) => ({
        id: n.id || `global-notice-${idx}`,
        title: n.title || "Untitled Notice",
        message: n.message || "",
        date: n.date || new Date().toISOString().split("T")[0],
        link: n.link || "#",
        audience: n.audience || "PUBLIC",
        priority: n.priority || "NORMAL",
        isActive: n.isActive !== false,
        publishedBy: n.publishedBy || "Head Office",
        createdAt: n.createdAt || new Date().toISOString(),
        category: n.category || "General",
      }));
    }

    // 3. Workspaces list (for Super Admin selector)
    let workspaces: any[] = [];
    if (isSuperAdmin) {
      workspaces = await db.workspace.findMany({
        select: {
          id: true,
          name: true,
          subdomain: true,
          centerCode: true,
          district: true,
          state: true,
        },
        orderBy: { name: "asc" },
      });
    }

    // Fetch official signatures for noticepad rendering
    let superAdminSignature: string | null = null;
    if (isSuperAdmin && session.user.id) {
      const currentUser = await db.user.findUnique({
        where: { id: session.user.id },
        select: { signatureUrl: true },
      });
      superAdminSignature = currentUser?.signatureUrl || null;
    }
    if (!superAdminSignature) {
      const saUser = await db.user.findFirst({
        where: { role: "SUPER_ADMIN", signatureUrl: { not: null } },
        select: { signatureUrl: true },
      });
      superAdminSignature = saUser?.signatureUrl || null;
    }

    let franchiseSignature: string | null = null;
    if (workspaceId) {
      const ws = await db.workspace.findUnique({
        where: { id: workspaceId },
        select: { signatureUrl: true },
      });
      franchiseSignature = ws?.signatureUrl || null;
    }

    return {
      success: true,
      events: processedEvents,
      centerNotices,
      headOfficeNotices,
      broadcastNotices,
      workspaces,
      superAdminSignature,
      franchiseSignature,
    };
  } catch (error: any) {
    console.error("Failed to get events and notices:", error);
    return { success: false, error: error.message || "Failed to load events and notices" };
  }
}

/**
 * Create an Event (Super Admin or Franchise Admin)
 */
export async function createAdminEvent(data: {
  workspaceId?: string | null;
  title: string;
  description?: string;
  date: string;
  time?: string;
  location?: string;
  image?: string;
  videoUrl?: string;
  category?: string;
  hostName?: string;
  isFeatured?: boolean;
  isActive?: boolean;
  showOnFranchises?: boolean;
  guests?: any[];
  programDetails?: any[];
  galleryImages?: any[];
  broadcastNoticeToFranchises?: boolean;
}) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const isSuperAdmin = session.user.role === "SUPER_ADMIN" || session.user.role === "SUPER_ADMIN_MANAGER";
    const targetWorkspaceId = isSuperAdmin ? (data.workspaceId || null) : data.workspaceId;

    const event = await db.event.create({
      data: {
        workspaceId: targetWorkspaceId,
        title: data.title.trim(),
        description: data.description?.trim() || null,
        date: new Date(data.date),
        time: data.time?.trim() || null,
        location: data.location?.trim() || null,
        image: data.image?.trim() || null,
        videoUrl: data.videoUrl?.trim() || null,
        category: data.category?.trim() || "General Event",
        hostName: data.hostName?.trim() || (isSuperAdmin ? "Head Office" : "Center Administration"),
        isFeatured: Boolean(data.isFeatured),
        isActive: data.isActive !== false,
        showOnFranchises: data.showOnFranchises !== false,
        guests: data.guests || [],
        programDetails: data.programDetails || [],
        galleryImages: data.galleryImages || [],
      },
    });

    // If Super Admin organized a Global Event and requested notification to franchises
    if (isSuperAdmin && !targetWorkspaceId && data.broadcastNoticeToFranchises !== false) {
      const formattedDate = new Date(data.date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      await db.notification.create({
        data: {
          workspaceId: null, // Broadcast to all franchises
          userId: null,
          title: `Official Event: ${data.title}`,
          message: `Head Office has organized an official event "${data.title}" scheduled on ${formattedDate} at ${data.location || "Online"}. View the itinerary and details in your Events & Notice portal.`,
          type: "EVENT",
          link: "/admin/events-notices",
          isRead: false,
        },
      });
    }

    // Revalidate paths
    revalidatePath("/super-admin/events-notices");
    revalidatePath("/events");
    revalidatePath("/");
    if (targetWorkspaceId) {
      await revalidateWorkspacePath(targetWorkspaceId, "/admin/events-notices");
      await revalidateWorkspacePath(targetWorkspaceId, "/admin/settings");
      await revalidateWorkspacePath(targetWorkspaceId, "/events");
      await revalidateWorkspacePath(targetWorkspaceId, "/about");
      await revalidateWorkspacePath(targetWorkspaceId, "/", "layout");
    } else {
      revalidatePath("/app/[tenant]/admin/events-notices");
      revalidatePath("/app/[tenant]/about");
      revalidatePath("/app/[tenant]/events");
      revalidatePath("/app/[tenant]");
    }

    return { success: true, event };
  } catch (error: any) {
    console.error("Failed to create event:", error);
    return { success: false, error: error.message || "Failed to create event" };
  }
}

/**
 * Update an Event
 */
export async function updateAdminEvent(eventId: string, data: any) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const updated = await db.event.update({
      where: { id: eventId },
      data: {
        workspaceId: data.workspaceId !== undefined ? data.workspaceId : undefined,
        title: data.title ? data.title.trim() : undefined,
        description: data.description !== undefined ? data.description : undefined,
        date: data.date ? new Date(data.date) : undefined,
        time: data.time !== undefined ? data.time : undefined,
        location: data.location !== undefined ? data.location : undefined,
        image: data.image !== undefined ? data.image : undefined,
        videoUrl: data.videoUrl !== undefined ? data.videoUrl : undefined,
        category: data.category !== undefined ? data.category : undefined,
        hostName: data.hostName !== undefined ? data.hostName : undefined,
        isFeatured: data.isFeatured !== undefined ? Boolean(data.isFeatured) : undefined,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : undefined,
        showOnFranchises: data.showOnFranchises !== undefined ? Boolean(data.showOnFranchises) : undefined,
        guests: data.guests !== undefined ? data.guests : undefined,
        programDetails: data.programDetails !== undefined ? data.programDetails : undefined,
        galleryImages: data.galleryImages !== undefined ? data.galleryImages : undefined,
      },
    });

    revalidatePath("/super-admin/events-notices");
    revalidatePath("/super-admin/settings");
    revalidatePath("/events");
    revalidatePath("/");
    if (updated.workspaceId) {
      await revalidateWorkspacePath(updated.workspaceId, "/admin/events-notices");
      await revalidateWorkspacePath(updated.workspaceId, "/admin/settings");
      await revalidateWorkspacePath(updated.workspaceId, "/events");
      await revalidateWorkspacePath(updated.workspaceId, "/", "layout");
    } else {
      revalidatePath("/app/[tenant]/admin/events-notices");
      revalidatePath("/app/[tenant]/admin/settings");
      revalidatePath("/app/[tenant]/events");
      revalidatePath("/app/[tenant]");
    }

    return { success: true, event: updated };
  } catch (error: any) {
    console.error("Failed to update event:", error);
    return { success: false, error: error.message || "Failed to update event" };
  }
}

/**
 * Delete an Event
 */
export async function deleteAdminEvent(eventId: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const event = await db.event.delete({
      where: { id: eventId },
    });

    revalidatePath("/super-admin/events-notices");
    revalidatePath("/super-admin/settings");
    revalidatePath("/events");
    revalidatePath("/");
    if (event.workspaceId) {
      await revalidateWorkspacePath(event.workspaceId, "/admin/events-notices");
      await revalidateWorkspacePath(event.workspaceId, "/admin/settings");
      await revalidateWorkspacePath(event.workspaceId, "/events");
      await revalidateWorkspacePath(event.workspaceId, "/about");
      await revalidateWorkspacePath(event.workspaceId, "/", "layout");
    } else {
      revalidatePath("/app/[tenant]/admin/events-notices");
      revalidatePath("/app/[tenant]/admin/settings");
      revalidatePath("/app/[tenant]/about");
      revalidatePath("/app/[tenant]/events");
      revalidatePath("/app/[tenant]");
    }

    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete event:", error);
    return { success: false, error: error.message || "Failed to delete event" };
  }
}

/**
 * Toggle Event Active / Featured Status
 */
export async function toggleEventStatus(eventId: string, field: "isActive" | "isFeatured" | "showOnFranchises", value: boolean) {
  try {
    const updated = await db.event.update({
      where: { id: eventId },
      data: { [field]: Boolean(value) },
    });

    revalidatePath("/super-admin/events-notices");
    revalidatePath("/super-admin/settings");
    revalidatePath("/events");
    revalidatePath("/");
    if (updated.workspaceId) {
      await revalidateWorkspacePath(updated.workspaceId, "/admin/events-notices");
      await revalidateWorkspacePath(updated.workspaceId, "/admin/settings");
      await revalidateWorkspacePath(updated.workspaceId, "/events");
      await revalidateWorkspacePath(updated.workspaceId, "/about");
      await revalidateWorkspacePath(updated.workspaceId, "/", "layout");
    } else {
      revalidatePath("/app/[tenant]/admin/events-notices");
      revalidatePath("/app/[tenant]/admin/settings");
      revalidatePath("/app/[tenant]/about");
      revalidatePath("/app/[tenant]/events");
      revalidatePath("/app/[tenant]");
    }
    return { success: true, [field]: value };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Create or Update a Center Notice (Dynamic synchronization with Landing Page Notice Ticker)
 */
export async function saveCenterNotice(
  workspaceId: string | null,
  noticeData: {
    id?: string;
    title: string;
    message?: string;
    date?: string;
    link?: string;
    audience?: "ALL" | "PUBLIC" | "STUDENTS" | "STAFF";
    priority?: "NORMAL" | "HIGH" | "URGENT";
    isActive?: boolean;
    publishedBy?: string;
    refNo?: string;
    scheduledFor?: string | Date | null;
    status?: "PUBLISHED" | "SCHEDULED" | "DRAFT";
    templateId?: string | null;
    category?: string;
  }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Find the SiteSettings for this workspace
    let settings = await db.siteSettings.findFirst({
      where: { workspaceId: workspaceId || null },
      include: {
        sections: {
          where: { type: "about" },
        },
      },
    });

    if (!settings) {
      settings = await db.siteSettings.create({
        data: { workspaceId: workspaceId || null },
        include: {
          sections: {
            where: { type: "about" },
          },
        },
      });
    }

    let aboutSection = settings.sections[0];
    if (!aboutSection) {
      aboutSection = await db.landingSection.create({
        data: {
          siteSettingsId: settings.id,
          type: "about",
          title: "About Our Institute",
          subtitle: "Dedicated to Empowering Future Leaders",
          content: { notices: [] },
          isActive: true,
          order: 1,
        },
      });
    }

    const currentContent = (aboutSection.content as any) || {};
    const existingNotices: any[] = Array.isArray(currentContent.notices) ? currentContent.notices : [];

    const noticeId = noticeData.id || `ntc-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const formattedDate = noticeData.date || new Date().toISOString().split("T")[0];
    const status = noticeData.status || (noticeData.scheduledFor && new Date(noticeData.scheduledFor) > new Date() ? "SCHEDULED" : "PUBLISHED");

    const cleanNotice = {
      id: noticeId,
      title: noticeData.title.trim(),
      message: noticeData.message?.trim() || "",
      date: formattedDate,
      link: noticeData.link?.trim() || "#",
      audience: noticeData.audience || "ALL",
      priority: noticeData.priority || "NORMAL",
      isActive: noticeData.isActive !== false,
      publishedBy: noticeData.publishedBy?.trim() || "Center Administration",
      createdAt: new Date().toISOString(),
      refNo: noticeData.refNo?.trim() || null,
      scheduledFor: noticeData.scheduledFor ? new Date(noticeData.scheduledFor).toISOString() : null,
      status,
      templateId: noticeData.templateId || null,
      category: noticeData.category || "General",
    };

    let updatedNotices: any[];
    const existingIndex = existingNotices.findIndex((n: any) => n.id === noticeId);

    if (existingIndex >= 0) {
      updatedNotices = [...existingNotices];
      updatedNotices[existingIndex] = {
        ...updatedNotices[existingIndex],
        ...cleanNotice,
      };
    } else {
      updatedNotices = [cleanNotice, ...existingNotices];
    }

    // Update LandingSection content
    await db.landingSection.update({
      where: { id: aboutSection.id },
      data: {
        content: {
          ...currentContent,
          notices: updatedNotices,
        },
      },
    });

    // If notice is targeted to Students or Staff and status is PUBLISHED, also sync an in-portal notification
    if (workspaceId && status === "PUBLISHED") {
      // First clean up any pre-existing notification with this refNo or matching title to avoid duplicates
      if (cleanNotice.refNo) {
        await db.notification.deleteMany({
          where: {
            workspaceId,
            refNo: cleanNotice.refNo,
          },
        });
      }

      if (cleanNotice.audience === "STUDENTS" || cleanNotice.audience === "ALL") {
        await db.notification.create({
          data: {
            workspaceId,
            userId: null,
            title: cleanNotice.title,
            message: cleanNotice.message || `New announcement published on ${formattedDate}.`,
            type: cleanNotice.priority === "URGENT" ? "WARNING" : "NOTICE",
            link: `/student/notices`,
            isRead: false,
            refNo: cleanNotice.refNo,
            priority: cleanNotice.priority,
            status: "PUBLISHED",
            targetAudience: "STUDENTS",
            templateId: cleanNotice.templateId,
            category: cleanNotice.category || "General",
          },
        });
      } else if (cleanNotice.audience === "STAFF") {
        await db.notification.create({
          data: {
            workspaceId,
            userId: null,
            title: cleanNotice.title,
            message: cleanNotice.message || `Internal faculty & staff notice published on ${formattedDate}.`,
            type: cleanNotice.priority === "URGENT" ? "WARNING" : "NOTICE",
            link: `/admin/events-notices`,
            isRead: false,
            refNo: cleanNotice.refNo,
            priority: cleanNotice.priority,
            status: "PUBLISHED",
            targetAudience: "STAFF",
            templateId: cleanNotice.templateId,
            category: cleanNotice.category || "General",
          },
        });
      }
    }

    // Revalidate paths for instant dynamic update
    if (workspaceId) {
      await revalidateWorkspacePath(workspaceId, "/");
      await revalidateWorkspacePath(workspaceId, "/notice");
      await revalidateWorkspacePath(workspaceId, "/student/dashboard");
      await revalidateWorkspacePath(workspaceId, "/student/notices");
      await revalidateWorkspacePath(workspaceId, "/admin/events-notices");
      await revalidateWorkspacePath(workspaceId, "/admin/settings");
    } else {
      revalidatePath("/");
      revalidatePath("/notice");
      revalidatePath("/super-admin/events-notices");
      revalidatePath("/super-admin/settings");
    }

    return { success: true, notice: cleanNotice };
  } catch (error: any) {
    console.error("Failed to save center notice:", error);
    return { success: false, error: error.message || "Failed to save notice" };
  }
}

/**
 * Delete a Center Notice
 */
export async function deleteCenterNotice(noticeId: string, workspaceId: string | null) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const settings = await db.siteSettings.findFirst({
      where: { workspaceId: workspaceId || null },
      include: {
        sections: {
          where: { type: "about" },
        },
      },
    });

    const aboutSection = settings?.sections?.[0];
    if (!aboutSection) return { success: false, error: "Notice section not found" };

    const currentContent = (aboutSection.content as any) || {};
    const existingNotices: any[] = Array.isArray(currentContent.notices) ? currentContent.notices : [];

    const noticeToDelete = existingNotices.find((n: any, idx: number) => {
      return n.id ? n.id === noticeId : `notice-${idx}` === noticeId;
    });

    const updatedNotices = existingNotices.filter((n: any, idx: number) => {
      const idMatch = n.id ? n.id === noticeId : `notice-${idx}` === noticeId;
      return !idMatch;
    });

    await db.landingSection.update({
      where: { id: aboutSection.id },
      data: {
        content: {
          ...currentContent,
          notices: updatedNotices,
        },
      },
    });

    // Also remove any linked in-portal notification record
    if (workspaceId && noticeToDelete) {
      await db.notification.deleteMany({
        where: {
          workspaceId,
          OR: [
            ...(noticeToDelete.refNo ? [{ refNo: noticeToDelete.refNo }] : []),
            ...(noticeToDelete.title ? [{ title: noticeToDelete.title }] : []),
          ],
        },
      });
    }

    if (workspaceId) {
      await revalidateWorkspacePath(workspaceId, "/");
      await revalidateWorkspacePath(workspaceId, "/notice");
      await revalidateWorkspacePath(workspaceId, "/student/dashboard");
      await revalidateWorkspacePath(workspaceId, "/student/notices");
      await revalidateWorkspacePath(workspaceId, "/admin/events-notices");
      await revalidateWorkspacePath(workspaceId, "/admin/settings");
    } else {
      revalidatePath("/");
      revalidatePath("/notice");
      revalidatePath("/super-admin/events-notices");
    }

    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete center notice:", error);
    return { success: false, error: error.message || "Failed to delete notice" };
  }
}

/**
 * Broadcast an Official Super Admin Notice / Circular to Franchises or Public
 */
export async function broadcastSuperAdminNotice(data: {
  id?: string;
  title: string;
  message: string;
  target: "ALL_FRANCHISES" | "SPECIFIC_FRANCHISE" | "ALL_STUDENTS" | "PUBLIC";
  workspaceId?: string | null;
  workspaceIds?: string[];
  priority?: "NORMAL" | "HIGH" | "URGENT";
  link?: string;
  refNo?: string;
  scheduledFor?: string | Date | null;
  status?: "PUBLISHED" | "SCHEDULED" | "DRAFT";
  templateId?: string | null;
  date?: string;
  category?: string;
}) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "SUPER_ADMIN_MANAGER")) {
      return { success: false, error: "Super Admin privileges required." };
    }

    const type = data.priority === "URGENT" ? "WARNING" : "CIRCULAR";
    const status = data.status || (data.scheduledFor && new Date(data.scheduledFor) > new Date() ? "SCHEDULED" : "PUBLISHED");
    const scheduledForDate = data.scheduledFor ? new Date(data.scheduledFor) : null;
    const targetAudience = data.target === "ALL_STUDENTS" ? "STUDENTS" : data.target;
    const defaultLink = data.target === "ALL_STUDENTS"
      ? "/student/notices"
      : data.target === "PUBLIC"
      ? "/notice"
      : "/admin/events-notices";

    if (data.id) {
      // Update existing notification
      const updated = await db.notification.update({
        where: { id: data.id },
        data: {
          title: data.title.trim(),
          message: data.message.trim(),
          type,
          link: data.link?.trim() || defaultLink,
          refNo: data.refNo?.trim() || null,
          scheduledFor: scheduledForDate,
          status,
          priority: data.priority || "NORMAL",
          targetAudience,
          templateId: data.templateId || null,
          category: data.category || "General",
        },
      });

      revalidatePath("/super-admin/events-notices");
      revalidatePath("/app/[tenant]/admin/events-notices");
      revalidatePath("/app/[tenant]/student/notices");
      revalidatePath("/app/[tenant]/student/dashboard");
      revalidatePath("/");

      return { success: true, circular: updated, count: 1 };
    }

    // 1. Create Broadcast Notifications
    let createdCount = 0;
    let circular: any = null;

    if (data.target === "SPECIFIC_FRANCHISE") {
      // If multiple workspace IDs were provided
      const targetIds = (data.workspaceIds && data.workspaceIds.length > 0)
        ? data.workspaceIds
        : (data.workspaceId ? [data.workspaceId] : []);

      if (targetIds.length === 0) {
        return { success: false, error: "Please select at least one franchise center." };
      }

      for (const wsId of targetIds) {
        const item = await db.notification.create({
          data: {
            workspaceId: wsId,
            userId: null, // broadcast to all admins in the workspace
            title: data.title.trim(),
            message: data.message.trim(),
            type,
            link: data.link?.trim() || "/admin/events-notices",
            isRead: false,
            refNo: data.refNo?.trim() || null,
            scheduledFor: scheduledForDate,
            status,
            priority: data.priority || "NORMAL",
            targetAudience: "SPECIFIC_FRANCHISE",
            templateId: data.templateId || null,
            category: data.category || "General",
          },
        });
        if (!circular) circular = item;
        createdCount++;
      }
    } else if (data.target === "ALL_STUDENTS") {
      // Broadcast towards all students nationwide
      circular = await db.notification.create({
        data: {
          workspaceId: null, // nationwide
          userId: null,
          title: data.title.trim(),
          message: data.message.trim(),
          type,
          link: data.link?.trim() || "/student/notices",
          isRead: false,
          refNo: data.refNo?.trim() || null,
          scheduledFor: scheduledForDate,
          status,
          priority: data.priority || "NORMAL",
          targetAudience: "STUDENTS",
          templateId: data.templateId || null,
          category: data.category || "General",
        },
      });
      createdCount = 1;
    } else {
      // ALL_FRANCHISES or PUBLIC
      circular = await db.notification.create({
        data: {
          workspaceId: null, // broadcast to all franchises
          userId: null,
          title: data.title.trim(),
          message: data.message.trim(),
          type,
          link: data.link?.trim() || (data.target === "PUBLIC" ? "/notice" : "/admin/events-notices"),
          isRead: false,
          refNo: data.refNo?.trim() || null,
          scheduledFor: scheduledForDate,
          status,
          priority: data.priority || "NORMAL",
          targetAudience: data.target,
          templateId: data.templateId || null,
          category: data.category || "General",
        },
      });
      createdCount = 1;
    }

    // 2. If target is PUBLIC, also add to global landing page ticker
    if (data.target === "PUBLIC") {
      await saveCenterNotice(null, {
        title: data.title,
        message: data.message,
        link: data.link || "#",
        audience: "PUBLIC",
        priority: data.priority || "NORMAL",
        publishedBy: "Head Office",
        refNo: data.refNo,
        scheduledFor: data.scheduledFor,
        status,
        templateId: data.templateId,
        category: data.category || "General",
      });
    }

    revalidatePath("/super-admin/events-notices");
    revalidatePath("/app/[tenant]/admin/events-notices");
    revalidatePath("/app/[tenant]/student/notices");
    revalidatePath("/app/[tenant]/student/dashboard");
    revalidatePath("/");

    return { success: true, circular, count: createdCount };
  } catch (error: any) {
    console.error("Failed to broadcast notice:", error);
    return { success: false, error: error.message || "Failed to broadcast notice" };
  }
}

/**
 * Update notice schedule time and status
 */
export async function updateNoticeSchedule(data: {
  id: string;
  scheduledFor: string | Date | null;
  status: "PUBLISHED" | "SCHEDULED" | "DRAFT";
  workspaceId?: string | null;
  isBroadcast?: boolean;
}) {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Unauthorized" };

    const scheduledDate = data.scheduledFor ? new Date(data.scheduledFor) : null;

    if (data.isBroadcast || !data.workspaceId) {
      await db.notification.update({
        where: { id: data.id },
        data: {
          scheduledFor: scheduledDate,
          status: data.status,
        },
      });
    } else {
      const settings = await db.siteSettings.findFirst({
        where: { workspaceId: data.workspaceId },
        include: { sections: { where: { type: "about" } } },
      });
      const aboutSection = settings?.sections?.[0];
      if (aboutSection) {
        const content = (aboutSection.content as any) || {};
        const notices: any[] = content.notices || [];
        const idx = notices.findIndex((n: any) => n.id === data.id);
        if (idx >= 0) {
          notices[idx].scheduledFor = scheduledDate ? scheduledDate.toISOString() : null;
          notices[idx].status = data.status;
          await db.landingSection.update({
            where: { id: aboutSection.id },
            data: { content: { ...content, notices } },
          });
        }
      }
    }

    if (data.workspaceId) {
      await revalidateWorkspacePath(data.workspaceId, "/admin/events-notices");
      await revalidateWorkspacePath(data.workspaceId, "/student/notices");
    } else {
      revalidatePath("/super-admin/events-notices");
    }

    return { success: true };
  } catch (err: any) {
    console.error("Failed to update notice schedule:", err);
    return { success: false, error: err.message || "Failed to update schedule" };
  }
}

/**
 * Delete a Broadcast Circular (Super Admin only)
 */
export async function deleteBroadcastNotice(notificationId: string) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "SUPER_ADMIN_MANAGER")) {
      return { success: false, error: "Super Admin privileges required." };
    }

    await db.notification.delete({
      where: { id: notificationId },
    });

    revalidatePath("/super-admin/events-notices");
    revalidatePath("/app/[tenant]/admin/events-notices");

    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete broadcast notice:", error);
    return { success: false, error: error.message || "Failed to delete broadcast notice" };
  }
}

/**
 * Fetch Notice Storage & Retention Configuration and Storage Statistics
 */
export async function getNoticeConfig() {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "SUPER_ADMIN_MANAGER")) {
      return { success: false, error: "Unauthorized" };
    }

    let globalSettings = await db.siteSettings.findFirst({
      where: { workspaceId: null },
      include: {
        sections: {
          where: { type: "notice_retention_config" },
        },
      },
    });

    if (!globalSettings) {
      globalSettings = await db.siteSettings.create({
        data: { workspaceId: null },
        include: { sections: true },
      });
    }

    const configSection = globalSettings?.sections?.[0];
    const savedConfig: NoticeRetentionConfig = (configSection?.content as any) || {
      autoCleanEnabled: true,
      retentionDays: 365, // 1 Year Default
      cleanTargets: ["CIRCULAR", "CENTER_NOTICE", "READ_NOTIFICATION"],
      lastCleanedAt: null,
      lastCleanedCount: 0,
    };

    // Calculate current storage stats
    const totalNotifications = await db.notification.count();
    const broadcastCircularsCount = await db.notification.count({
      where: { type: { in: ["CIRCULAR", "WARNING", "EVENT", "NOTICE"] }, userId: null },
    });

    const retentionDays = Number(savedConfig.retentionDays) || 365;
    const retentionThreshold = new Date();
    retentionThreshold.setDate(retentionThreshold.getDate() - retentionDays);

    const eligibleForCleanupCount = await db.notification.count({
      where: {
        createdAt: { lt: retentionThreshold },
        OR: [
          { type: { in: ["CIRCULAR", "WARNING", "EVENT", "NOTICE"] }, userId: null },
          { isRead: true },
        ],
      },
    });

    const oldestRecord = await db.notification.findFirst({
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    });

    return {
      success: true,
      config: savedConfig,
      stats: {
        totalNotifications,
        broadcastCircularsCount,
        eligibleForCleanupCount,
        oldestRecordDate: oldestRecord?.createdAt?.toISOString() || null,
        retentionDays,
      },
    };
  } catch (error: any) {
    console.error("Failed to get notice config:", error);
    return { success: false, error: error.message || "Failed to load config" };
  }
}

/**
 * Save Notice Retention and Storage Cleaning Policy
 */
export async function saveNoticeConfig(data: {
  autoCleanEnabled: boolean;
  retentionDays: number;
  cleanTargets: ("CIRCULAR" | "CENTER_NOTICE" | "READ_NOTIFICATION")[];
}) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "SUPER_ADMIN_MANAGER")) {
      return { success: false, error: "Super Admin privileges required." };
    }

    let globalSettings = await db.siteSettings.findFirst({
      where: { workspaceId: null },
    });

    if (!globalSettings) {
      globalSettings = await db.siteSettings.create({
        data: { workspaceId: null },
      });
    }

    const existingSection = await db.landingSection.findFirst({
      where: {
        siteSettingsId: globalSettings.id,
        type: "notice_retention_config",
      },
    });

    const prevContent = (existingSection?.content as any) || {};
    const updatedContent = {
      ...prevContent,
      autoCleanEnabled: Boolean(data.autoCleanEnabled),
      retentionDays: Number(data.retentionDays) || 365,
      cleanTargets: data.cleanTargets || ["CIRCULAR", "CENTER_NOTICE", "READ_NOTIFICATION"],
    };

    if (existingSection) {
      await db.landingSection.update({
        where: { id: existingSection.id },
        data: { content: updatedContent },
      });
    } else {
      await db.landingSection.create({
        data: {
          siteSettingsId: globalSettings.id,
          type: "notice_retention_config",
          title: "Notice Storage & Retention Config",
          content: updatedContent,
          order: 99,
          isActive: true,
        },
      });
    }

    revalidatePath("/super-admin/events-notices");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to save notice config:", error);
    return { success: false, error: error.message || "Failed to save configuration" };
  }
}

/**
 * Clean Expired Notices & Notifications to Maintain Storage
 */
export async function cleanupExpiredNotices(options?: {
  retentionDays?: number;
  cleanTargets?: string[];
}) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "SUPER_ADMIN_MANAGER")) {
      return { success: false, error: "Super Admin privileges required." };
    }

    const retentionDays = Number(options?.retentionDays) || 365;
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - retentionDays);

    let deletedCount = 0;

    // 1. Delete notifications / circulars older than threshold
    const deleteResult = await db.notification.deleteMany({
      where: {
        createdAt: { lt: thresholdDate },
        OR: [
          { type: { in: ["CIRCULAR", "WARNING", "EVENT", "NOTICE"] }, userId: null },
          { isRead: true },
        ],
      },
    });
    deletedCount += deleteResult.count;

    // 2. Also check center notices in SiteSettings if requested
    if (options?.cleanTargets?.includes("CENTER_NOTICE")) {
      const globalSettings = await db.siteSettings.findFirst({
        where: { workspaceId: null },
        include: {
          sections: { where: { type: "about" } },
        },
      });
      const aboutSection = globalSettings?.sections?.[0];
      if (aboutSection) {
        const notices: any[] = (aboutSection.content as any)?.notices || [];
        const filtered = notices.filter((n) => {
          if (!n.createdAt && !n.date) return true;
          const noticeDate = new Date(n.createdAt || n.date);
          return noticeDate >= thresholdDate;
        });
        const removed = notices.length - filtered.length;
        if (removed > 0) {
          deletedCount += removed;
          await db.landingSection.update({
            where: { id: aboutSection.id },
            data: {
              content: {
                ...(aboutSection.content as any),
                notices: filtered,
              },
            },
          });
        }
      }
    }

    // 3. Update lastCleanedAt and lastCleanedCount in config
    let globalSettings = await db.siteSettings.findFirst({
      where: { workspaceId: null },
    });
    if (globalSettings) {
      const existingSection = await db.landingSection.findFirst({
        where: {
          siteSettingsId: globalSettings.id,
          type: "notice_retention_config",
        },
      });
      if (existingSection) {
        await db.landingSection.update({
          where: { id: existingSection.id },
          data: {
            content: {
              ...(existingSection.content as any),
              lastCleanedAt: new Date().toISOString(),
              lastCleanedCount: deletedCount,
            },
          },
        });
      }
    }

    revalidatePath("/super-admin/events-notices");
    revalidatePath("/app/[tenant]/admin/events-notices");

    return {
      success: true,
      deletedCount,
      message: `Storage maintenance completed: Successfully pruned ${deletedCount} records older than ${retentionDays} days.`,
    };
  } catch (error: any) {
    console.error("Failed to cleanup notices:", error);
    return { success: false, error: error.message || "Failed to cleanup storage" };
  }
}

/**
 * Franchise Admin submits a Request / Query to Super Admin
 */
export async function submitFranchiseRequest(data: {
  workspaceId: string;
  subject: string;
  message: string;
  priority?: "NORMAL" | "HIGH" | "URGENT";
  category?: "General" | "Technical" | "Financial" | "Operational" | "Complaint";
}) {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Unauthorized" };

    // Verify user has access to this workspace
    const hasAccess =
      session.user.role === "SUPER_ADMIN" ||
      session.user.role === "SUPER_ADMIN_MANAGER" ||
      (await db.workspaceRole.findFirst({
        where: { userId: session.user.id, workspaceId: data.workspaceId },
      })) !== null;

    if (!hasAccess) return { success: false, error: "Access denied" };

    const workspace = await db.workspace.findUnique({
      where: { id: data.workspaceId },
      select: { name: true, centerCode: true, subdomain: true },
    });

    const request = await db.notification.create({
      data: {
        workspaceId: data.workspaceId,
        userId: session.user.id,
        title: data.subject.trim(),
        message: data.message.trim(),
        type: "REQUEST",
        link: "/super-admin/events-notices?tab=requests",
        isRead: false,
        status: "PENDING",
        priority: data.priority || "NORMAL",
        targetAudience: "SUPER_ADMIN",
        category: data.category || "General",
        refNo: `REQ-${(workspace?.centerCode || data.workspaceId.slice(-4)).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
      },
    });

    revalidatePath("/super-admin/events-notices");
    return { success: true, request, centerName: workspace?.name };
  } catch (error: any) {
    console.error("Failed to submit franchise request:", error);
    return { success: false, error: error.message || "Failed to submit request" };
  }
}

/**
 * Get pending franchise requests count for Super Admin badges
 */
export async function getPendingFranchiseRequestsCount() {
  try {
    const count = await db.notification.count({
      where: {
        type: "REQUEST",
        targetAudience: "SUPER_ADMIN",
        isRead: false,
      },
    });
    return { success: true, count };
  } catch (error: any) {
    console.error("Failed to get pending franchise requests count:", error);
    return { success: false, count: 0 };
  }
}

/**
 * Get all franchise requests sent to Super Admin
 */
export async function getFranchiseRequests(workspaceId?: string | null) {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Unauthorized" };

    const isSuperAdmin = session.user.role === "SUPER_ADMIN" || session.user.role === "SUPER_ADMIN_MANAGER";

    let requests: any[] = [];

    if (isSuperAdmin) {
      // Super Admin sees ALL franchise requests
      requests = await db.notification.findMany({
        where: { type: "REQUEST", targetAudience: "SUPER_ADMIN" },
        include: {
          workspace: {
            select: { id: true, name: true, subdomain: true, centerCode: true, district: true, state: true, logoUrl: true },
          },
          user: { select: { id: true, name: true, email: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 200,
      });
    } else if (workspaceId) {
      // Franchise admin sees only their own requests
      requests = await db.notification.findMany({
        where: { type: "REQUEST", targetAudience: "SUPER_ADMIN", workspaceId },
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      });
    }

    const pendingCount = requests.filter((r) => !r.isRead || r.status === "PENDING").length;
    return { success: true, requests, pendingCount };
  } catch (error: any) {
    console.error("Failed to get franchise requests:", error);
    return { success: false, error: error.message || "Failed to load requests", requests: [], pendingCount: 0 };
  }
}

/**
 * Super Admin updates request status and optionally sends resolution note back to Franchise Admin
 */
export async function updateFranchiseRequestStatus(data: {
  requestId: string;
  status: "PENDING" | "IN_PROGRESS" | "RESOLVED" | "REJECTED";
  resolutionNote?: string;
}) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "SUPER_ADMIN_MANAGER")) {
      return { success: false, error: "Super Admin privileges required" };
    }

    const existing = await db.notification.findUnique({
      where: { id: data.requestId },
      include: { workspace: { select: { id: true, name: true, subdomain: true, centerCode: true } } },
    });

    if (!existing) {
      return { success: false, error: "Request not found" };
    }

    const isResolvedOrClosed = data.status === "RESOLVED" || data.status === "REJECTED";
    const noteText = data.resolutionNote?.trim();

    // Append resolution note to message if provided
    let updatedMessage = existing.message;
    if (noteText) {
      const stamp = new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      const noteBlock = `\n\n--- [Head Office Response (${data.status}) - ${stamp}] ---\n${noteText}`;
      if (!updatedMessage.includes(noteText)) {
        updatedMessage = `${updatedMessage}${noteBlock}`;
      }
    }

    await db.notification.update({
      where: { id: data.requestId },
      data: {
        status: data.status,
        isRead: isResolvedOrClosed,
        message: updatedMessage,
      },
    });

    // Notify Franchise Admin if resolution note was added or status updated
    if (existing.workspaceId && noteText) {
      try {
        await db.notification.create({
          data: {
            workspaceId: existing.workspaceId,
            userId: existing.userId || undefined,
            title: `Update on Request ${existing.refNo || ""}: ${data.status}`,
            message: noteText,
            type: data.status === "RESOLVED" ? "SUCCESS" : data.status === "REJECTED" ? "WARNING" : "INFO",
            link: `/admin/events-notices?tab=requests`,
            isRead: false,
            status: "PUBLISHED",
            targetAudience: "STAFF",
            category: "Support Update",
            refNo: existing.refNo,
          },
        });
      } catch (notifyErr) {
        console.error("Failed to notify franchise of request resolution:", notifyErr);
      }
    }

    revalidatePath("/super-admin/events-notices");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update franchise request status:", error);
    return { success: false, error: error.message || "Failed to update status" };
  }
}

/**
 * Super Admin marks a franchise request as read/resolved
 */
export async function markFranchiseRequestRead(requestId: string, isRead = true) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "SUPER_ADMIN_MANAGER")) {
      return { success: false, error: "Super Admin privileges required" };
    }
    await db.notification.update({
      where: { id: requestId },
      data: {
        isRead,
        status: isRead ? "RESOLVED" : "PENDING",
      },
    });
    revalidatePath("/super-admin/events-notices");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

