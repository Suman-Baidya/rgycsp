"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createBatch(data: { 
  workspaceId: string; 
  courseId?: string; 
  name: string; 
  schedule?: string; 
}) {
  try {
    const batch = await db.batch.create({
      data: {
        workspaceId: data.workspaceId,
        courseId: data.courseId || null,
        name: data.name,
        schedule: data.schedule,
      },
    });

    revalidatePath(`/app/[tenant]/admin`, "layout");
    return { success: true, data: batch };
  } catch (error: any) {
    console.error("Failed to create batch:", error);
    return { success: false, error: error.message || "Failed to create batch" };
  }
}

export async function updateBatch(id: string, data: { 
  courseId?: string; 
  name?: string; 
  schedule?: string; 
}) {
  try {
    const batch = await db.batch.update({
      where: { id },
      data,
    });

    revalidatePath(`/app/[tenant]/admin`, "layout");
    return { success: true, data: batch };
  } catch (error: any) {
    console.error("Failed to update batch:", error);
    return { success: false, error: error.message || "Failed to update batch" };
  }
}

export async function deleteBatch(id: string) {
  try {
    // Check if students are assigned to this batch
    const studentCount = await db.studentProfile.count({
      where: { batchId: id },
    });

    if (studentCount > 0) {
      return { 
        success: false, 
        error: `Cannot delete batch. ${studentCount} students are currently assigned to it. Please reassign them first.` 
      };
    }

    await db.batch.delete({
      where: { id },
    });

    revalidatePath(`/app/[tenant]/admin`, "layout");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete batch:", error);
    return { success: false, error: error.message || "Failed to delete batch" };
  }
}

export async function getBatches(workspaceId: string) {
  try {
    const batches = await db.batch.findMany({
      where: { workspaceId },
      include: {
        course: {
          select: { title: true }
        },
        _count: {
          select: { students: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    return { success: true, data: batches };
  } catch (error: any) {
    console.error("Failed to fetch batches:", error);
    return { success: false, error: error.message || "Failed to fetch batches" };
  }
}
