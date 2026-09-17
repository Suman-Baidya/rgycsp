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
        isFeatured: data.isFeatured || false,
        isActive: data.isActive !== false,
      },
    });

    if (event.workspaceId) {
      await revalidateWorkspacePath(event.workspaceId, "/", "layout");
      await revalidateWorkspacePath(event.workspaceId, "/events");
    }
    revalidatePath("/events");
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
        workspaceId: data.workspaceId || null,
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
        isFeatured: data.isFeatured,
        isActive: data.isActive,
      },
    });

    if (updated.workspaceId) {
      await revalidateWorkspacePath(updated.workspaceId, "/", "layout");
      await revalidateWorkspacePath(updated.workspaceId, "/events");
    }
    revalidatePath("/events");
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
    }
    revalidatePath("/events");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete event:", error);
    return { success: false, error: "Failed to delete event" };
  }
}
