"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateGalleryItem(id: string, data: any) {
  try {
    await db.galleryItem.update({
      where: { id },
      data: {
        title: data.title,
        image: data.image,
        category: data.category,
        isActive: data.isActive,
      }
    });
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Gallery Update Error:", error);
    return { success: false, error: "Failed to update gallery item" };
  }
}

export async function createGalleryItem(workspaceId: string, data: any) {
  try {
    await db.galleryItem.create({
      data: {
        workspaceId,
        title: data.title,
        image: data.image,
        category: data.category,
        isActive: data.isActive,
      }
    });
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Gallery Create Error:", error);
    return { success: false, error: "Failed to create gallery item" };
  }
}

export async function deleteGalleryItem(id: string) {
  try {
    await db.galleryItem.delete({
      where: { id }
    });
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Gallery Delete Error:", error);
    return { success: false, error: "Failed to delete gallery item" };
  }
}
