"use server";

import { revalidateWorkspacePath } from "@/lib/revalidate";


import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getEvents(workspaceId: string) {
  try {
    const events = await db.event.findMany({
      where: { workspaceId },
      orderBy: { date: 'desc' },
    });
    return { success: true, events };
  } catch (error) {
    console.error("Failed to get events:", error);
    return { success: false, error: "Failed to fetch events" };
  }
}

export async function getAllEvents() {
  try {
    const events = await db.event.findMany({
      include: {
        workspace: { select: { name: true } }
      },
      orderBy: { date: 'desc' },
    });
    return { success: true, events };
  } catch (error) {
    console.error("Failed to get all events:", error);
    return { success: false, error: "Failed to fetch all events" };
  }
}

export async function createEvent(data: any) {
  try {
    const event = await db.event.create({
      data: {
        workspaceId: data.workspaceId || null, // Global if not specified
        hostName: data.hostName,
        title: data.title,
        description: data.description,
        date: new Date(data.date),
        time: data.time,
        location: data.location,
        image: data.image,
        videoUrl: data.videoUrl,
        category: data.category,
        guests: data.guests || [],
        programDetails: data.programDetails || [],
        galleryImages: data.galleryImages || [],
        isFeatured: Boolean(data.isFeatured),
        isActive: data.isActive !== false,
        showOnFranchises: data.showOnFranchises !== false,
      },
    });

    if (event.workspaceId) {
      await revalidateWorkspacePath(event.workspaceId, "/", "layout");
      await revalidateWorkspacePath(event.workspaceId, "/events");
      await revalidateWorkspacePath(event.workspaceId, "/about");
      await revalidateWorkspacePath(event.workspaceId, "/admin/events-notices");
      await revalidateWorkspacePath(event.workspaceId, "/admin/settings");
    } else {
      revalidatePath("/app/[tenant]", "layout");
      revalidatePath("/app/[tenant]/admin/events-notices");
      revalidatePath("/app/[tenant]/about");
      revalidatePath("/app/[tenant]/events");
    }
    revalidatePath("/events");
    revalidatePath("/super-admin/events-notices");
    revalidatePath("/super-admin/settings");
    revalidatePath("/");
    return { success: true, event };
  } catch (error: any) {
    console.error("Failed to create event:", error);
    return { success: false, error: error.message || "Failed to create event" };
  }
}

export async function updateEvent(eventId: string, data: any) {
  try {
    const updated = await db.event.update({
      where: { id: eventId },
      data: {
        workspaceId: data.workspaceId !== undefined ? data.workspaceId : undefined,
        hostName: data.hostName !== undefined ? data.hostName : undefined,
        title: data.title !== undefined ? data.title : undefined,
        description: data.description !== undefined ? data.description : undefined,
        date: data.date ? new Date(data.date) : undefined,
        time: data.time !== undefined ? data.time : undefined,
        location: data.location !== undefined ? data.location : undefined,
        image: data.image !== undefined ? data.image : undefined,
        videoUrl: data.videoUrl !== undefined ? data.videoUrl : undefined,
        category: data.category !== undefined ? data.category : undefined,
        guests: data.guests !== undefined ? data.guests : undefined,
        programDetails: data.programDetails !== undefined ? data.programDetails : undefined,
        galleryImages: data.galleryImages !== undefined ? data.galleryImages : undefined,
        isFeatured: data.isFeatured !== undefined ? Boolean(data.isFeatured) : undefined,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : undefined,
        showOnFranchises: data.showOnFranchises !== undefined ? Boolean(data.showOnFranchises) : undefined,
      },
    });

    if (updated.workspaceId) {
      await revalidateWorkspacePath(updated.workspaceId, "/", "layout");
      await revalidateWorkspacePath(updated.workspaceId, "/events");
      await revalidateWorkspacePath(updated.workspaceId, "/about");
      await revalidateWorkspacePath(updated.workspaceId, "/admin/events-notices");
      await revalidateWorkspacePath(updated.workspaceId, "/admin/settings");
    } else {
      revalidatePath("/app/[tenant]", "layout");
      revalidatePath("/app/[tenant]/admin/events-notices");
      revalidatePath("/app/[tenant]/about");
      revalidatePath("/app/[tenant]/events");
    }
    revalidatePath("/events");
    revalidatePath("/super-admin/events-notices");
    revalidatePath("/super-admin/settings");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update event:", error);
    return { success: false, error: error.message || "Failed to update event" };
  }
}

export async function deleteEvent(eventId: string) {
  try {
    const deleted = await db.event.delete({
      where: { id: eventId },
    });

    if (deleted.workspaceId) {
      await revalidateWorkspacePath(deleted.workspaceId, "/", "layout");
      await revalidateWorkspacePath(deleted.workspaceId, "/events");
      await revalidateWorkspacePath(deleted.workspaceId, "/about");
      await revalidateWorkspacePath(deleted.workspaceId, "/admin/events-notices");
      await revalidateWorkspacePath(deleted.workspaceId, "/admin/settings");
    } else {
      revalidatePath("/app/[tenant]", "layout");
      revalidatePath("/app/[tenant]/admin/events-notices");
      revalidatePath("/app/[tenant]/about");
      revalidatePath("/app/[tenant]/events");
    }
    revalidatePath("/events");
    revalidatePath("/super-admin/events-notices");
    revalidatePath("/super-admin/settings");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete event:", error);
    return { success: false, error: "Failed to delete event" };
  }
}
